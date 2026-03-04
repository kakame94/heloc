#!/usr/bin/env python3
"""
Génère un VBS PowerDesigner CDM à partir du MPD XML CCQ.
Ajoute ENR_ACTIF_NB et ENR_DESAC_NB à CTRL_HEBDO (demande Samuel).
"""
import xml.etree.ElementTree as ET
import re

MPD_PATH = "/Users/Eliot_1/CascadeProjects/infocentre-documentation/CCQ/modeles/CCQ.mpd"
VBS_OUTPUT = "/Users/Eliot_1/CascadeProjects/scripts_entites_ccq/generer_mcd_ccq_depuis_mpd.vbs"

# PowerDesigner namespace URIs
NS = {
    "o": "object",
    "a": "attribute",
    "c": "collection",
}


def tag(prefix, name):
    return f"{{{NS[prefix]}}}{name}"


# Mapping SQL Server → PowerDesigner CDM DataType
def sql_to_pd_type(sql_type: str) -> str:
    if not sql_type:
        return "VA50"
    t = sql_type.strip().upper()

    if t in ("INT", "INTEGER"):
        return "I"
    if t == "BIGINT":
        return "LI"
    if t == "SMALLINT":
        return "SI"
    if t == "BIT":
        return "BT"
    if t == "DATE":
        return "D"
    if t in ("DATETIME",) or t.startswith("DATETIME2"):
        return "DT"
    if t == "FLOAT":
        return "F"
    if t in ("TEXT", "NTEXT"):
        return "LVARCHAR"

    m = re.match(r"^(?:N?CHAR)\((\d+)\)$", t)
    if m:
        return f"A{m.group(1)}"

    m = re.match(r"^(?:N?VARCHAR)\((\d+|MAX)\)$", t)
    if m:
        n = m.group(1)
        return "LVARCHAR" if n == "MAX" else f"VA{n}"

    m = re.match(r"^(?:DECIMAL|NUMERIC)\((\d+),\s*(\d+)\)$", t)
    if m:
        return f"N{m.group(1)},{m.group(2)}"

    return "VA50"


def escape_vbs(s: str) -> str:
    return s.replace('"', '""')


def text(elem, *path_tags):
    """Find first matching sub-element text."""
    for pt in path_tags:
        child = elem.find(pt)
        if child is not None and child.text:
            return child.text.strip()
    return ""


def parse_mpd(path):
    tree = ET.parse(path)
    root = tree.getroot()

    # Build Id → element map
    id_map = {}
    for elem in root.iter():
        eid = elem.get("Id")
        if eid:
            id_map[eid] = elem

    # Build parent map
    parent_map = {}
    for parent in root.iter():
        for child in parent:
            parent_map[child] = parent

    tables = []

    for tbl in root.iter(tag("o", "Table")):
        if tbl.get("Id") is None:
            continue

        tbl_id = tbl.get("Id")
        tbl_name = text(tbl, tag("a", "Name"))
        tbl_code = text(tbl, tag("a", "Code"))

        # Schema: walk up to find Package with Code CCQ or CFG
        schema = ""
        node = tbl
        for _ in range(15):
            p = parent_map.get(node)
            if p is None:
                break
            pcode = text(p, tag("a", "Code"))
            if pcode in ("CCQ", "CFG"):
                schema = pcode
                break
            node = p

        # Collect columns
        columns = []
        col_id_map = {}

        cols_container = tbl.find(tag("c", "Columns"))
        if cols_container is not None:
            for col in cols_container:
                if col.get("Id") is None:
                    continue
                cid = col.get("Id")
                cname = text(col, tag("a", "Name"))
                ccode = text(col, tag("a", "Code"))
                cdtype_raw = text(col, tag("a", "DataType"))
                cmand = text(col, tag("a", "Mandatory"))
                cident = text(col, tag("a", "Identity"))

                col_dict = {
                    "id": cid,
                    "name": cname,
                    "code": ccode,
                    "sql_type": cdtype_raw,
                    "pd_type": sql_to_pd_type(cdtype_raw),
                    "mandatory": cmand == "1",
                    "identity": cident == "1",
                    "is_pk": False,
                    "is_uk": False,
                    "uk_name": "",
                    "uk_code": "",
                }
                columns.append(col_dict)
                col_id_map[cid] = col_dict

        # Collect keys
        pk_col_ids = set()
        pk_key_name = ""
        pk_key_code = ""
        uk_info = {}  # col_id → (uk_name, uk_code)

        # Find PK reference
        pk_elem = tbl.find(tag("c", "PrimaryKey"))
        pk_key_id = None
        if pk_elem is not None:
            for child in pk_elem:
                pk_key_id = child.get("Ref")

        keys_container = tbl.find(tag("c", "Keys"))
        if keys_container is not None:
            for key in keys_container:
                if key.get("Id") is None:
                    continue
                kid = key.get("Id")
                kname = text(key, tag("a", "Name"))
                kcode = text(key, tag("a", "Code"))

                # Columns in this key
                kc_container = key.find(tag("c", "Key.Columns"))
                key_col_ids = []
                if kc_container is not None:
                    for kc in kc_container:
                        ref = kc.get("Ref")
                        if ref:
                            key_col_ids.append(ref)

                if kid == pk_key_id:
                    pk_col_ids.update(key_col_ids)
                    pk_key_name = kname
                    pk_key_code = kcode
                elif kcode.startswith("UK_"):
                    for kcid in key_col_ids:
                        uk_info[kcid] = (kname, kcode)

        # Mark PK/UK
        for col in columns:
            if col["id"] in pk_col_ids:
                col["is_pk"] = True
                col["mandatory"] = True
            if col["id"] in uk_info:
                col["is_uk"] = True
                col["uk_name"] = uk_info[col["id"]][0]
                col["uk_code"] = uk_info[col["id"]][1]

        tables.append({
            "id": tbl_id,
            "name": tbl_name,
            "code": tbl_code,
            "schema": schema,
            "columns": columns,
            "pk_name": pk_key_name,
            "pk_code": pk_key_code,
        })

    # Collect FK relationships
    relationships = []
    for ref in root.iter(tag("o", "Reference")):
        if ref.get("Id") is None:
            continue
        rname = text(ref, tag("a", "Name"))
        rcode = text(ref, tag("a", "Code"))

        parent_id = None
        child_id = None

        pt = ref.find(tag("c", "ParentTable"))
        if pt is not None:
            for c in pt:
                parent_id = c.get("Ref")

        ct = ref.find(tag("c", "ChildTable"))
        if ct is not None:
            for c in ct:
                child_id = c.get("Ref")

        parent_code = next((t["code"] for t in tables if t["id"] == parent_id), "")
        child_code = next((t["code"] for t in tables if t["id"] == child_id), "")

        if parent_code and child_code:
            relationships.append({
                "name": rname,
                "code": rcode,
                "parent": parent_code,
                "child": child_code,
            })

    return tables, relationships


def table_to_varname(code: str) -> str:
    parts = code.lower().split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def gen_suffix(code: str) -> str:
    words = [w for w in code.split("_") if w]
    return "".join(w[:3].capitalize() for w in words[:3])


def generate_vbs(tables, relationships) -> str:
    lines = []

    lines += [
        "Option Explicit",
        "",
        "' ================================================================",
        "' Script VBScript PowerDesigner - MCD CCQ v2.11",
        "' Généré depuis CCQ.mpd (MPD GitHub)",
        "' Mise à jour CTRL_HEBDO : ajout ENR_ACTIF_NB / ENR_DESAC_NB",
        "' ================================================================",
        "",
        "Sub Main()",
        "    Dim model",
        "    Set model = ActiveModel",
        "    If model Is Nothing Then MsgBox \"Créez d'abord un CDM vide\", vbCritical : Exit Sub",
        "    If Not model.IsKindOf(PdCDM.cls_Model) Then MsgBox \"Le modèle actif n'est pas un MCD\", vbCritical : Exit Sub",
        "",
        "    ' Nettoyage",
        "    Dim i",
        "    For i = model.Relationships.Count - 1 To 0 Step -1 : model.Relationships.Item(i).Delete : Next",
        "    For i = model.Entities.Count - 1 To 0 Step -1 : model.Entities.Item(i).Delete : Next",
        "",
        '    model.Name = "CCQ v2.11 - MCD depuis MPD"',
        '    model.Code = "CCQ_MCD_V211_FROM_MPD"',
        "",
    ]

    var_names = [table_to_varname(t["code"]) for t in tables]
    lines.append(f"    Dim {', '.join(var_names)}")
    lines.append("    Dim attr, ident, ak, rel")
    lines.append("")

    # ---- ENTITIES ----
    for idx, tbl in enumerate(tables):
        vname = table_to_varname(tbl["code"])
        schema_pfx = f"{tbl['schema']}." if tbl["schema"] else ""
        col_count = len(tbl["columns"])
        suffix = gen_suffix(tbl["code"])

        lines += [
            f"    ' {'=' * 44}",
            f"    ' {idx+1}. {schema_pfx}{tbl['code']} ({col_count} colonnes)",
            f"    ' {'=' * 44}",
            f"    Output \"{idx+1}. Création {tbl['code']}...\"",
            f"    Set {vname} = model.Entities.CreateNew()",
            f"    {vname}.Name = \"{escape_vbs(tbl['name'])}\"",
            f"    {vname}.Code = \"{tbl['code']}\"",
            "",
        ]

        # PK columns first
        pk_cols = [c for c in tbl["columns"] if c["is_pk"]]
        for col in pk_cols:
            mand = " : attr.Mandatory = True" if col["mandatory"] else ""
            lines.append(f"    Set attr = {vname}.Attributes.CreateNew() : attr.Name = \"{escape_vbs(col['name'])} {suffix}\" : attr.Code = \"{col['code']}\" : attr.DataType = \"{col['pd_type']}\"{mand}")

        if pk_cols and tbl["pk_code"]:
            lines.append(f"    Set ident = {vname}.Identifiers.CreateNew() : ident.Name = \"{tbl['pk_name']}\" : ident.Code = \"{tbl['pk_code']}\" : ident.Attributes.Add attr")

        lines.append("")

        # Non-PK columns
        for col in tbl["columns"]:
            if col["is_pk"]:
                continue
            mand = " : attr.Mandatory = True" if col["mandatory"] else ""
            lines.append(f"    Set attr = {vname}.Attributes.CreateNew() : attr.Name = \"{escape_vbs(col['name'])} {suffix}\" : attr.Code = \"{col['code']}\" : attr.DataType = \"{col['pd_type']}\"{mand}")
            if col["is_uk"]:
                lines.append(f"    Set ak = {vname}.Identifiers.CreateNew() : ak.Name = \"{col['uk_name']}\" : ak.Code = \"{col['uk_code']}\" : ak.Attributes.Add attr")

        # CTRL_HEBDO: ajout Samuel v2.11
        if tbl["code"] == "CTRL_HEBDO":
            lines += [
                "",
                "    ' --- Ajout demande Samuel v2.11 ---",
                f"    Set attr = {vname}.Attributes.CreateNew() : attr.Name = \"Nombre enregistrements actifs {suffix}\" : attr.Code = \"ENR_ACTIF_NB\" : attr.DataType = \"I\"",
                f"    Set attr = {vname}.Attributes.CreateNew() : attr.Name = \"Nombre enregistrements désactivés {suffix}\" : attr.Code = \"ENR_DESAC_NB\" : attr.DataType = \"I\"",
            ]

        lines.append("")

    # ---- RELATIONS ----
    lines += [
        "    ' ========================================",
        "    ' RELATIONS (d'après FKs du MPD)",
        "    ' ========================================",
        "    Output \"Création des relations...\"",
        "",
    ]

    code_to_var = {t["code"]: table_to_varname(t["code"]) for t in tables}

    for rel in relationships:
        pv = code_to_var.get(rel["parent"], "")
        cv = code_to_var.get(rel["child"], "")
        if not pv or not cv:
            continue
        lines += [
            "    Set rel = model.Relationships.CreateNew()",
            f"    rel.Name = \"{escape_vbs(rel['name'])}\"",
            f"    rel.Code = \"{rel['code']}\"",
            f"    Set rel.Entity1 = {pv}",
            f"    Set rel.Entity2 = {cv}",
            "    rel.Entity1ToEntity2RoleCardinality = \"0,n\"",
            "    rel.Entity2ToEntity1RoleCardinality = \"1,1\"",
            "",
        ]

    # ---- FOOTER ----
    lines += [
        "    Output \"Terminé.\"",
        f"    MsgBox \"MCD CCQ v2.11 généré depuis MPD avec :\" & vbCrLf & _",
        f"           \"- {len(tables)} entités (tables MPD)\" & vbCrLf & _",
        f"           \"- {len(relationships)} relations (FKs MPD)\" & vbCrLf & _",
        "           \"- CTRL_HEBDO : ENR_ACTIF_NB + ENR_DESAC_NB ajoutés\", vbInformation",
        "",
        "End Sub",
        "",
        "Call Main()",
        "",
    ]

    return "\n".join(lines)


if __name__ == "__main__":
    print(f"Parsing {MPD_PATH}...")
    tables, relationships = parse_mpd(MPD_PATH)

    print(f"\nTables trouvées : {len(tables)}")
    for t in tables:
        pk_cols = [c["code"] for c in t["columns"] if c["is_pk"]]
        uk_cols = [c["code"] for c in t["columns"] if c["is_uk"]]
        print(f"  [{t['schema']:3s}] {t['code']:35s} {len(t['columns']):3d} cols  PK={','.join(pk_cols)}  UK={','.join(uk_cols)}")

    print(f"\nRelations trouvées : {len(relationships)}")
    for r in relationships:
        print(f"  {r['parent']:30s} → {r['child']:30s}  [{r['code']}]")

    vbs = generate_vbs(tables, relationships)
    with open(VBS_OUTPUT, "w", encoding="utf-8") as f:
        f.write(vbs)

    print(f"\n✅ VBS généré : {VBS_OUTPUT}  ({len(vbs.splitlines())} lignes)")
