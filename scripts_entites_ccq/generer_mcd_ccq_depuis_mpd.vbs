Option Explicit

' ================================================================
' Script VBScript PowerDesigner - MCD CCQ v2.11
' Généré depuis CCQ.mpd (MPD GitHub)
' Mise à jour CTRL_HEBDO : ajout ENR_ACTIF_NB / ENR_DESAC_NB
' ================================================================

Sub Main()
    Dim model
    Set model = ActiveModel
    If model Is Nothing Then MsgBox "Créez d'abord un CDM vide", vbCritical : Exit Sub
    If Not model.IsKindOf(PdCDM.cls_Model) Then MsgBox "Le modèle actif n'est pas un MCD", vbCritical : Exit Sub

    ' Nettoyage
    Dim i
    For i = model.Relationships.Count - 1 To 0 Step -1 : model.Relationships.Item(i).Delete : Next
    For i = model.Entities.Count - 1 To 0 Step -1 : model.Entities.Item(i).Delete : Next

    model.Name = "CCQ v2.11 - MCD depuis MPD"
    model.Code = "CCQ_MCD_V211_FROM_MPD"

    Dim config, configParm, emplDoss, salarDoss, emplRel, rapMensEnt, rapMensDet, ctrlInit, ctrlHebdo, emplRelHistory
    Dim attr, ident, ak, rel

    ' ============================================
    ' 1. CCQ.CONFIG (4 colonnes)
    ' ============================================
    Output "1. Création CONFIG..."
    Set config = model.Entities.CreateNew()
    config.Name = "CONFIG"
    config.Code = "CONFIG"

    Set attr = config.Attributes.CreateNew() : attr.Name = "CFG_ID Con" : attr.Code = "CFG_ID" : attr.DataType = "LI" : attr.Mandatory = True
    Set ident = config.Identifiers.CreateNew() : ident.Name = "PK_CFG_CONFIG" : ident.Code = "PK_CFG_CONFIG" : ident.Attributes.Add attr

    Set attr = config.Attributes.CreateNew() : attr.Name = "CD_SYSTEM Con" : attr.Code = "CD_SYSTEM" : attr.DataType = "VA10"
    Set ak = config.Identifiers.CreateNew() : ak.Name = "UK_CFG_CONFIG_SYSTEM" : ak.Code = "UK_CFG_CONFIG_SYSTEM" : ak.Attributes.Add attr
    Set attr = config.Attributes.CreateNew() : attr.Name = "DESCR_SYSTEM Con" : attr.Code = "DESCR_SYSTEM" : attr.DataType = "VA200"
    Set attr = config.Attributes.CreateNew() : attr.Name = "IND_ACTIF Con" : attr.Code = "IND_ACTIF" : attr.DataType = "A1"

    ' ============================================
    ' 2. CCQ.CONFIG_PARM (6 colonnes)
    ' ============================================
    Output "2. Création CONFIG_PARM..."
    Set configParm = model.Entities.CreateNew()
    configParm.Name = "CONFIG_PARM"
    configParm.Code = "CONFIG_PARM"

    Set attr = configParm.Attributes.CreateNew() : attr.Name = "CFG_PARM_ID ConPar" : attr.Code = "CFG_PARM_ID" : attr.DataType = "LI" : attr.Mandatory = True
    Set ident = configParm.Identifiers.CreateNew() : ident.Name = "PK_CFG_CONFIG_PARM" : ident.Code = "PK_CFG_CONFIG_PARM" : ident.Attributes.Add attr

    Set attr = configParm.Attributes.CreateNew() : attr.Name = "CFG_ID ConPar" : attr.Code = "CFG_ID" : attr.DataType = "LI"
    Set attr = configParm.Attributes.CreateNew() : attr.Name = "CD_PARAM ConPar" : attr.Code = "CD_PARAM" : attr.DataType = "VA20"
    Set attr = configParm.Attributes.CreateNew() : attr.Name = "DESCR_PARAM ConPar" : attr.Code = "DESCR_PARAM" : attr.DataType = "VA200"
    Set attr = configParm.Attributes.CreateNew() : attr.Name = "VALEUR_PARM ConPar" : attr.Code = "VALEUR_PARM" : attr.DataType = "VA200"
    Set attr = configParm.Attributes.CreateNew() : attr.Name = "IND_ACTIF ConPar" : attr.Code = "IND_ACTIF" : attr.DataType = "A1"

    ' ============================================
    ' 3. CCQ.EMPL_DOSS (59 colonnes)
    ' ============================================
    Output "3. Création EMPL_DOSS..."
    Set emplDoss = model.Entities.CreateNew()
    emplDoss.Name = "EMPL_DOSS"
    emplDoss.Code = "EMPL_DOSS"

    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "EMPL_DOSS_ID EmpDos" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplDoss.Identifiers.CreateNew() : ident.Name = "PK_EMPL_DOSS" : ident.Code = "PK_EMPL_DOSS" : ident.Attributes.Add attr

    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CLIENT_EMP_NO EmpDos" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10"
    Set ak = emplDoss.Identifiers.CreateNew() : ak.Name = "UK_EMPL_DOSS_CLIENT" : ak.Code = "UK_EMPL_DOSS_CLIENT" : ak.Attributes.Add attr
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "REG_ADMIN_CD EmpDos" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CMEQ_IND EmpDos" : attr.Code = "CMEQ_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CMMTQ_IND EmpDos" : attr.Code = "CMMTQ_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "INTERV_NO EmpDos" : attr.Code = "INTERV_NO" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "ENTRP_NM EmpDos" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "ENTRP_AUTRE_NM EmpDos" : attr.Code = "ENTRP_AUTRE_NM" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "AFF_ADR EmpDos" : attr.Code = "AFF_ADR" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "AFF_VILLE_NM EmpDos" : attr.Code = "AFF_VILLE_NM" : attr.DataType = "VA100"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "AFF_PROV_CD EmpDos" : attr.Code = "AFF_PROV_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "AFF_CP_CD EmpDos" : attr.Code = "AFF_CP_CD" : attr.DataType = "VA7"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "AFF_PAYS_NM EmpDos" : attr.Code = "AFF_PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CORR_ADR EmpDos" : attr.Code = "CORR_ADR" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CORR_VILLE_NM EmpDos" : attr.Code = "CORR_VILLE_NM" : attr.DataType = "VA100"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CORR_PROV_CD EmpDos" : attr.Code = "CORR_PROV_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CORR_CP_CD EmpDos" : attr.Code = "CORR_CP_CD" : attr.DataType = "VA7"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CORR_PAYS_NM EmpDos" : attr.Code = "CORR_PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "BUR_QC_ADR EmpDos" : attr.Code = "BUR_QC_ADR" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "BUR_QC_VILLE_NM EmpDos" : attr.Code = "BUR_QC_VILLE_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "BUR_QC_PROV_CD EmpDos" : attr.Code = "BUR_QC_PROV_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "BUR_QC_CP_CD EmpDos" : attr.Code = "BUR_QC_CP_CD" : attr.DataType = "VA7"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "BUR_QC_PAYS_NM EmpDos" : attr.Code = "BUR_QC_PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "LIEU_VERIF_REG EmpDos" : attr.Code = "LIEU_VERIF_REG" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "BLOC_AFF_ADR_CD EmpDos" : attr.Code = "BLOC_AFF_ADR_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "BLOC_CORR_ADR_CD EmpDos" : attr.Code = "BLOC_CORR_ADR_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "BLOC_BUR_ADR_CD EmpDos" : attr.Code = "BLOC_BUR_ADR_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "TEL_PRINC_NO EmpDos" : attr.Code = "TEL_PRINC_NO" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "TEL_AUTRE_NO EmpDos" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "FAX_NO EmpDos" : attr.Code = "FAX_NO" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "DATE_ENREG EmpDos" : attr.Code = "DATE_ENREG" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "DATE_DEB_TRAV EmpDos" : attr.Code = "DATE_DEB_TRAV" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "COURRIEL_ADR EmpDos" : attr.Code = "COURRIEL_ADR" : attr.DataType = "VA100"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "STATUT_JUR_CD EmpDos" : attr.Code = "STATUT_JUR_CD" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "STATUT_JUR_DT EmpDos" : attr.Code = "STATUT_JUR_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "TYPE_EMP_CD EmpDos" : attr.Code = "TYPE_EMP_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "STATUT_AFF_CD EmpDos" : attr.Code = "STATUT_AFF_CD" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "STATUT_AFF_DT EmpDos" : attr.Code = "STATUT_AFF_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "EMP_RECONNU_IND EmpDos" : attr.Code = "EMP_RECONNU_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "NEQ_NO EmpDos" : attr.Code = "NEQ_NO" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "NEQ_STATUT_CD EmpDos" : attr.Code = "NEQ_STATUT_CD" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "NO_DOSSIER_RBQ EmpDos" : attr.Code = "NO_DOSSIER_RBQ" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "LIC_CCQ1_TYPE EmpDos" : attr.Code = "LIC_CCQ1_TYPE" : attr.DataType = "VA1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "LIC_CCQ1_STATUT EmpDos" : attr.Code = "LIC_CCQ1_STATUT" : attr.DataType = "VA1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "LIC_CCQ2_TYPE EmpDos" : attr.Code = "LIC_CCQ2_TYPE" : attr.DataType = "VA1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "LIC_CCQ2_STATUT EmpDos" : attr.Code = "LIC_CCQ2_STATUT" : attr.DataType = "VA1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "INSOLVABILITE_DT EmpDos" : attr.Code = "DT_INSOLVABILITE" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "RAISON_INSOLVABILITE EmpDos" : attr.Code = "RAISON_INSOLVABILITE" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "NO_EMP_ANCIEN EmpDos" : attr.Code = "NO_EMP_ANCIEN" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "NO_EMP_NOUVEAU EmpDos" : attr.Code = "NO_EMP_NOUVEAU" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "TRAIT_DT EmpDos" : attr.Code = "TRAIT_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "DERN_CHG_DT EmpDos" : attr.Code = "DERN_CHG_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "DEB_EFFECT_DT EmpDos" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "FIN_EFFECT_DT EmpDos" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "ACTIF_IND EmpDos" : attr.Code = "ACTIF_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CREAT_DT EmpDos" : attr.Code = "CREAT_DT" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "CREAT_UTIL_ID EmpDos" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "MODIF_DT EmpDos" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "MODIF_UTIL_ID EmpDos" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ============================================
    ' 4. CCQ.SALAR_DOSS (50 colonnes)
    ' ============================================
    Output "4. Création SALAR_DOSS..."
    Set salarDoss = model.Entities.CreateNew()
    salarDoss.Name = "SALAR_DOSS"
    salarDoss.Code = "SALAR_DOSS"

    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "SALAR_DOSS_ID SalDos" : attr.Code = "SALAR_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = salarDoss.Identifiers.CreateNew() : ident.Name = "PK_SALAR_DOSS" : ident.Code = "PK_SALAR_DOSS" : ident.Attributes.Add attr

    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CLIENT_SAL_NO SalDos" : attr.Code = "CLIENT_SAL_NO" : attr.DataType = "VA10"
    Set ak = salarDoss.Identifiers.CreateNew() : ak.Name = "UK_SALAR_DOSS_CLIENT" : ak.Code = "UK_SALAR_DOSS_CLIENT" : ak.Attributes.Add attr
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DEB_EFFECT_DT SalDos" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "FIN_EFFECT_DT SalDos" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "ACTIF_IND SalDos" : attr.Code = "ACTIF_IND" : attr.DataType = "A1"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "TRAIT_DT SalDos" : attr.Code = "TRAIT_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DERN_CHG_DT SalDos" : attr.Code = "DERN_CHG_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "ENREG_DT SalDos" : attr.Code = "ENREG_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "NOM SalDos" : attr.Code = "NOM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "PRENOM SalDos" : attr.Code = "PRENOM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "NAISS_DT SalDos" : attr.Code = "NAISS_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "NAISS_STATUT_CD SalDos" : attr.Code = "NAISS_STATUT_CD" : attr.DataType = "VA20"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "GENRE_CD SalDos" : attr.Code = "GENRE_CD" : attr.DataType = "A1"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_ADR_L1 SalDos" : attr.Code = "CORR_ADR_L1" : attr.DataType = "VA200"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_MUN_NM SalDos" : attr.Code = "CORR_MUN_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_REG_CD SalDos" : attr.Code = "CORR_REG_CD" : attr.DataType = "A2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_PROV_CD SalDos" : attr.Code = "CORR_PROV_CD" : attr.DataType = "A2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_CP_CD SalDos" : attr.Code = "CORR_CP_CD" : attr.DataType = "VA7"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_PAYS_FR_DESC SalDos" : attr.Code = "CORR_PAYS_FR_DESC" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_PAYS_NM SalDos" : attr.Code = "CORR_PAYS_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_CHG_ADR_DT SalDos" : attr.Code = "CORR_CHG_ADR_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_NON_LIV_CD SalDos" : attr.Code = "CORR_NON_LIV_CD" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CORR_NON_LIV_DESC SalDos" : attr.Code = "CORR_NON_LIV_DESC" : attr.DataType = "VA200"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DOM_ADR_L1 SalDos" : attr.Code = "DOM_ADR_L1" : attr.DataType = "VA200"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DOM_MUN_NM SalDos" : attr.Code = "DOM_MUN_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DOM_PROV_CD SalDos" : attr.Code = "DOM_PROV_CD" : attr.DataType = "A2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DOM_CP_CD SalDos" : attr.Code = "DOM_CP_CD" : attr.DataType = "VA7"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DOM_PAYS_NM SalDos" : attr.Code = "DOM_PAYS_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DOM_CHG_ADR_DT SalDos" : attr.Code = "DOM_CHG_ADR_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "TEL_PRINC_NO SalDos" : attr.Code = "TEL_PRINC_NO" : attr.DataType = "VA20"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "TEL_AUTRE_NO SalDos" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA20"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "REG_ADMIN_CD SalDos" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "REG_ADMIN_NM SalDos" : attr.Code = "REG_ADMIN_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "REG_TRAV_CD SalDos" : attr.Code = "REG_TRAV_CD" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "REG_TRAV_NM SalDos" : attr.Code = "REG_TRAV_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "METIER_PRIO_CD SalDos" : attr.Code = "METIER_PRIO_CD" : attr.DataType = "VA3"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "METIER_PRIO_NM SalDos" : attr.Code = "METIER_PRIO_NM" : attr.DataType = "VA100"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "EMP_PRF_NO SalDos" : attr.Code = "EMP_PRF_NO" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "EMP_PRF_DOSS_ID SalDos" : attr.Code = "EMP_PRF_DOSS_ID" : attr.DataType = "I"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CERT1_TYPE_CD SalDos" : attr.Code = "CERT1_TYPE_CD" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CERT1_ECH_DT SalDos" : attr.Code = "CERT1_ECH_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CERT2_TYPE_CD SalDos" : attr.Code = "CERT2_TYPE_CD" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CERT2_ECH_DT SalDos" : attr.Code = "CERT2_ECH_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DEB_INVAL_DT SalDos" : attr.Code = "DEB_INVAL_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DECES_PRESUME_DT SalDos" : attr.Code = "DECES_PRESUME_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "DECES_CONFIRME_DT SalDos" : attr.Code = "DECES_CONFIRME_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CREAT_DT SalDos" : attr.Code = "CREAT_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "CREAT_UTIL_ID SalDos" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "MODIF_DT SalDos" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "MODIF_UTIL_ID SalDos" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ============================================
    ' 5. CCQ.EMPL_REL (42 colonnes)
    ' ============================================
    Output "5. Création EMPL_REL..."
    Set emplRel = model.Entities.CreateNew()
    emplRel.Name = "EMPL_REL"
    emplRel.Code = "EMPL_REL"

    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "EMPL_REL_ID EmpRel" : attr.Code = "EMPL_REL_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplRel.Identifiers.CreateNew() : ident.Name = "PK_EMPL_REL" : ident.Code = "PK_EMPL_REL" : ident.Attributes.Add attr

    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "EMPL_DOSS_ID EmpRel" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "CLIENT_REL_NO EmpRel" : attr.Code = "CLIENT_REL_NO" : attr.DataType = "VA10"
    Set ak = emplRel.Identifiers.CreateNew() : ak.Name = "UK_EMPL_REL_CLIENT" : ak.Code = "UK_EMPL_REL_CLIENT" : ak.Attributes.Add attr
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "CLIENT_EMP_NO EmpRel" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "REG_ADMIN_CD EmpRel" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "ENTRP_NM EmpRel" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "FONCTION_CD EmpRel" : attr.Code = "FONCTION_CD" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "NOM EmpRel" : attr.Code = "NOM" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "PRENOM EmpRel" : attr.Code = "PRENOM" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "ENTRP_REL_NM EmpRel" : attr.Code = "ENTRP_REL_NM" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "ADR EmpRel" : attr.Code = "ADR" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "VILLE_NM EmpRel" : attr.Code = "VILLE_NM" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "PROV_CD EmpRel" : attr.Code = "PROV_CD" : attr.DataType = "A2"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "CP_CD EmpRel" : attr.Code = "CP_CD" : attr.DataType = "VA7"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "PAYS_NM EmpRel" : attr.Code = "PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "TEL_NO EmpRel" : attr.Code = "TEL_NO" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "COURRIEL_ADR EmpRel" : attr.Code = "COURRIEL_ADR" : attr.DataType = "VA100"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "NAISS_DT EmpRel" : attr.Code = "NAISS_DT" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "STATUT_REL_CD EmpRel" : attr.Code = "STATUT_REL_CD" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "TRAIT_DT EmpRel" : attr.Code = "TRAIT_DT" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "DERN_CHG_DT EmpRel" : attr.Code = "DERN_CHG_DT" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "AUTRE_NOM_ENTRP_REL EmpRel" : attr.Code = "AUTRE_NOM_ENTRP_REL" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "TEL_AUTRE_NO EmpRel" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "FAX_NO EmpRel" : attr.Code = "FAX_NO" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "NOTE_TEL EmpRel" : attr.Code = "NOTE_TEL" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "NOTE_TEL_AUTRE EmpRel" : attr.Code = "NOTE_TEL_AUTRE" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "DEB_VALIDITE_DT EmpRel" : attr.Code = "DT_DEB_VALIDITE" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "FIN_VALIDITE__DT EmpRel" : attr.Code = "DT_FIN_VALIDITE" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "INSOLVABILITE_DT EmpRel" : attr.Code = "DT_INSOLVABILITE" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "DECES_DT EmpRel" : attr.Code = "DT_DECES" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "PRESUME_DECES_DT EmpRel" : attr.Code = "DT_PRESUME_DECES" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "DEB_FONCTION_DT EmpRel" : attr.Code = "DT_DEB_FONCTION" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "FIN_FONCTION_DT EmpRel" : attr.Code = "DT_FIN_FONCTION" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "RECEP_DESIGNATION_DT EmpRel" : attr.Code = "DT_RECEP_DESIGNATION" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "ENR_DESIGNATION_DT EmpRel" : attr.Code = "DT_ENR_DESIGNATION" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "DEB_EFFECT_DT EmpRel" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "FIN_EFFECT_DT EmpRel" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "ACTIF_IND EmpRel" : attr.Code = "ACTIF_IND" : attr.DataType = "A1"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "CREAT_UTIL_ID EmpRel" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "CREAT_DT EmpRel" : attr.Code = "CREAT_DT" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "MODIF_UTIL_ID EmpRel" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "MODIF_DT EmpRel" : attr.Code = "MODIF_DT" : attr.DataType = "DT"

    ' ============================================
    ' 6. CCQ.RAP_MENS_ENT (35 colonnes)
    ' ============================================
    Output "6. Création RAP_MENS_ENT..."
    Set rapMensEnt = model.Entities.CreateNew()
    rapMensEnt.Name = "RAP_MENS_ENT"
    rapMensEnt.Code = "RAP_MENS_ENT"

    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "RAP_MENS_ENT_ID RapMenEnt" : attr.Code = "RAP_MENS_ENT_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = rapMensEnt.Identifiers.CreateNew() : ident.Name = "PK_RAP_MENS_ENT" : ident.Code = "PK_RAP_MENS_ENT" : ident.Attributes.Add attr

    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "RAP_SAP_CLE RapMenEnt" : attr.Code = "RAP_SAP_CLE" : attr.DataType = "VA50"
    Set ak = rapMensEnt.Identifiers.CreateNew() : ak.Name = "UK_RAP_MENS_ENT_SAP" : ak.Code = "UK_RAP_MENS_ENT_SAP" : ak.Attributes.Add attr
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "EMPL_DOSS_ID RapMenEnt" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "CLIENT_EMP_NO RapMenEnt" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "DEB_EFFECT_DT RapMenEnt" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "FIN_EFFECT_DT RapMenEnt" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "ACTIF_IND RapMenEnt" : attr.Code = "ACTIF_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "PER_ENV_DEB_DT RapMenEnt" : attr.Code = "PER_ENV_DEB_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "PER_ENV_FIN_DT RapMenEnt" : attr.Code = "PER_ENV_FIN_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "FISC_DEB_DT RapMenEnt" : attr.Code = "FISC_DEB_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "FISC_FIN_DT RapMenEnt" : attr.Code = "FISC_FIN_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "RAPPORT_NO RapMenEnt" : attr.Code = "RAPPORT_NO" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "AMEND_NB RapMenEnt" : attr.Code = "AMEND_NB" : attr.DataType = "I"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "RAP_STATUT_CD RapMenEnt" : attr.Code = "RAP_STATUT_CD" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "TYPE_RAP_CD RapMenEnt" : attr.Code = "TYPE_RAP_CD" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "ENTRP_NM RapMenEnt" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "TOT_RM_AMT RapMenEnt" : attr.Code = "TOT_RM_AMT" : attr.DataType = "N15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "SOLDE_RM_AMT RapMenEnt" : attr.Code = "SOLDE_RM_AMT" : attr.DataType = "N15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "TOT_AV_SOC_AMT RapMenEnt" : attr.Code = "TOT_AV_SOC_AMT" : attr.DataType = "N15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "AJOUT_MOD_IND RapMenEnt" : attr.Code = "AJOUT_MOD_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "SOUM_RM_DT RapMenEnt" : attr.Code = "SOUM_RM_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "TOT_HEURE_RM RapMenEnt" : attr.Code = "TOT_HEURE_RM" : attr.DataType = "N10,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "SOLDE_RECL_AMT RapMenEnt" : attr.Code = "SOLDE_RECL_AMT" : attr.DataType = "N15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "DEB_PER_RECL_DT RapMenEnt" : attr.Code = "DEB_PER_RECL_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "FIN_PER_RECL_DT RapMenEnt" : attr.Code = "FIN_PER_RECL_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "EST_EMP_ENQUETE_IND RapMenEnt" : attr.Code = "EST_EMP_ENQUETE_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "EST_RAP_RETARD_IND RapMenEnt" : attr.Code = "EST_RAP_RETARD_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "MNT_NET_CARCAP RapMenEnt" : attr.Code = "MNT_NET_CARCAP" : attr.DataType = "N15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "NO_RECLAMATION RapMenEnt" : attr.Code = "NO_RECLAMATION" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "TRAIT_DT RapMenEnt" : attr.Code = "TRAIT_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "DERN_CHG_DT RapMenEnt" : attr.Code = "DERN_CHG_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "CREAT_DT RapMenEnt" : attr.Code = "CREAT_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "CREAT_UTIL_ID RapMenEnt" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "MODIF_DT RapMenEnt" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "MODIF_UTIL_ID RapMenEnt" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ============================================
    ' 7. CCQ.RAP_MENS_DET (32 colonnes)
    ' ============================================
    Output "7. Création RAP_MENS_DET..."
    Set rapMensDet = model.Entities.CreateNew()
    rapMensDet.Name = "RAP_MENS_DET"
    rapMensDet.Code = "RAP_MENS_DET"

    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "RAP_MENS_DET_ID RapMenDet" : attr.Code = "RAP_MENS_DET_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = rapMensDet.Identifiers.CreateNew() : ident.Name = "PK_RAP_MENS_DET" : ident.Code = "PK_RAP_MENS_DET" : ident.Attributes.Add attr

    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "ACT_SAP_CLE RapMenDet" : attr.Code = "ACT_SAP_CLE" : attr.DataType = "VA50"
    Set ak = rapMensDet.Identifiers.CreateNew() : ak.Name = "UK_RAP_MENS_DET_ACT" : ak.Code = "UK_RAP_MENS_DET_ACT" : ak.Attributes.Add attr
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "RAP_MENS_ENT_ID RapMenDet" : attr.Code = "RAP_MENS_ENT_ID" : attr.DataType = "I"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "EMPL_DOSS_ID RapMenDet" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "SALAR_DOSS_ID RapMenDet" : attr.Code = "SALAR_DOSS_ID" : attr.DataType = "I"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "RAP_SAP_CLE RapMenDet" : attr.Code = "RAP_SAP_CLE" : attr.DataType = "VA50"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "CLIENT_EMP_NO RapMenDet" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "CLIENT_SAL_NO RapMenDet" : attr.Code = "CLIENT_SAL_NO" : attr.DataType = "VA10"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "DEB_EFFECT_DT RapMenDet" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "FIN_EFFECT_DT RapMenDet" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "ACTIF_IND RapMenDet" : attr.Code = "ACTIF_IND" : attr.DataType = "A1"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "PER_ENV_DEB_DT RapMenDet" : attr.Code = "PER_ENV_DEB_DT" : attr.DataType = "D"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "PER_ENV_FIN_DT RapMenDet" : attr.Code = "PER_ENV_FIN_DT" : attr.DataType = "D"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "PERIODE_CD RapMenDet" : attr.Code = "PERIODE_CD" : attr.DataType = "VA7"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "PRENOM RapMenDet" : attr.Code = "PRENOM" : attr.DataType = "VA50"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "NOM RapMenDet" : attr.Code = "NOM" : attr.DataType = "VA50"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "SEM_TRAV_NB RapMenDet" : attr.Code = "SEM_TRAV_NB" : attr.DataType = "I"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "METIER_CD RapMenDet" : attr.Code = "METIER_CD" : attr.DataType = "VA3"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "METIER_NM RapMenDet" : attr.Code = "METIER_NM" : attr.DataType = "VA100"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "SECTEUR_CD RapMenDet" : attr.Code = "SECTEUR_CD" : attr.DataType = "A1"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "SECTEUR_NM RapMenDet" : attr.Code = "SECTEUR_NM" : attr.DataType = "VA50"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "HRS_SAL_SOM RapMenDet" : attr.Code = "HRS_SAL_SOM" : attr.DataType = "N10,2"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "STAT_SAL_CD RapMenDet" : attr.Code = "STAT_SAL_CD" : attr.DataType = "VA2"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "TOT_AV_SOC_AMT RapMenDet" : attr.Code = "TOT_AV_SOC_AMT" : attr.DataType = "N15,2"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "CD_ANNEXE_SAL RapMenDet" : attr.Code = "CD_ANNEXE_SAL" : attr.DataType = "VA10"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "ANNEXE_SAL_DESC RapMenDet" : attr.Code = "ANNEXE_SAL_DESC" : attr.DataType = "VA100"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "EMP_CMEQ_IND RapMenDet" : attr.Code = "EMP_CMEQ_IND" : attr.DataType = "VA3"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "EMP_CMMTQ_IND RapMenDet" : attr.Code = "EMP_CMMTQ_IND" : attr.DataType = "VA3"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "CREAT_DT RapMenDet" : attr.Code = "CREAT_DT" : attr.DataType = "DT"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "CREAT_UTIL_ID RapMenDet" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "MODIF_DT RapMenDet" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "MODIF_UTIL_ID RapMenDet" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ============================================
    ' 8. CCQ.CTRL_INIT (9 colonnes)
    ' ============================================
    Output "8. Création CTRL_INIT..."
    Set ctrlInit = model.Entities.CreateNew()
    ctrlInit.Name = "CTRL_INIT"
    ctrlInit.Code = "CTRL_INIT"

    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "RAP_CTRL_CLE CtrIni" : attr.Code = "RAP_CTRL_CLE" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ctrlInit.Identifiers.CreateNew() : ident.Name = "PK_CTRL_INIT" : ident.Code = "PK_CTRL_INIT" : ident.Attributes.Add attr

    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "IG_ABREV CtrIni" : attr.Code = "IG_ABREV" : attr.DataType = "VA10"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "FICH_ZIP_NM CtrIni" : attr.Code = "FICH_ZIP_NM" : attr.DataType = "VA100"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "FICHIER_NM CtrIni" : attr.Code = "FICHIER_NM" : attr.DataType = "VA100"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "DESCR CtrIni" : attr.Code = "DESCR" : attr.DataType = "VA500"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "ENVOI_DH CtrIni" : attr.Code = "ENVOI_DH" : attr.DataType = "DT"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "LIGNES_NB CtrIni" : attr.Code = "LIGNES_NB" : attr.DataType = "I"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "CHARG_STATUT_CD CtrIni" : attr.Code = "CHARG_STATUT_CD" : attr.DataType = "VA20"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "CHARG_DT CtrIni" : attr.Code = "CHARG_DT" : attr.DataType = "DT"

    ' ============================================
    ' 9. CCQ.CTRL_HEBDO (13 colonnes)
    ' ============================================
    Output "9. Création CTRL_HEBDO..."
    Set ctrlHebdo = model.Entities.CreateNew()
    ctrlHebdo.Name = "CTRL_HEBDO"
    ctrlHebdo.Code = "CTRL_HEBDO"

    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "RAP_CTRL_CLE CtrHeb" : attr.Code = "RAP_CTRL_CLE" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ctrlHebdo.Identifiers.CreateNew() : ident.Name = "PK_CTRL_HEBDO" : ident.Code = "PK_CTRL_HEBDO" : ident.Attributes.Add attr

    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "IG_ABREV CtrHeb" : attr.Code = "IG_ABREV" : attr.DataType = "VA10"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "FICH_ZIP_NM CtrHeb" : attr.Code = "FICH_ZIP_NM" : attr.DataType = "VA100"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "FICHIER_NM CtrHeb" : attr.Code = "FICHIER_NM" : attr.DataType = "VA100"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "DESCR CtrHeb" : attr.Code = "DESCR" : attr.DataType = "VA500"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "ENVOI_DH CtrHeb" : attr.Code = "ENVOI_DH" : attr.DataType = "DT"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "LIGNES_NB CtrHeb" : attr.Code = "LIGNES_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "CHARG_STATUT_CD CtrHeb" : attr.Code = "CHARG_STATUT_CD" : attr.DataType = "VA20"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "CHARG_DT CtrHeb" : attr.Code = "CHARG_DT" : attr.DataType = "DT"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "ENR_TRAIT_NB CtrHeb" : attr.Code = "ENR_TRAIT_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "ENR_REJET_NB CtrHeb" : attr.Code = "ENR_REJET_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "ENR_INSERT_NB CtrHeb" : attr.Code = "ENR_INSERT_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "ENR_MODIF_NB CtrHeb" : attr.Code = "ENR_MODIF_NB" : attr.DataType = "I"

    ' --- Ajout demande Samuel v2.11 ---
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements actifs CtrHeb" : attr.Code = "ENR_ACTIF_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements désactivés CtrHeb" : attr.Code = "ENR_DESAC_NB" : attr.DataType = "I"

    ' ============================================
    ' 10. CCQ.EMPL_REL_HISTORY (41 colonnes)
    ' ============================================
    Output "10. Création EMPL_REL_HISTORY..."
    Set emplRelHistory = model.Entities.CreateNew()
    emplRelHistory.Name = "EMPL_REL_HISTORY"
    emplRelHistory.Code = "EMPL_REL_HISTORY"

    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "HISTORY_ID EmpRelHis" : attr.Code = "HISTORY_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplRelHistory.Identifiers.CreateNew() : ident.Name = "PK_EMPL_REL_HISTORY" : ident.Code = "PK_EMPL_REL_HISTORY" : ident.Attributes.Add attr

    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "EMPL_REL_ID EmpRelHis" : attr.Code = "EMPL_REL_ID" : attr.DataType = "I"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "EMPL_DOSS_ID EmpRelHis" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "CLIENT_REL_NO EmpRelHis" : attr.Code = "CLIENT_REL_NO" : attr.DataType = "VA10"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "CLIENT_EMP_NO EmpRelHis" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "REG_ADMIN_CD EmpRelHis" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "ENTRP_NM EmpRelHis" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "FONCTION_CD EmpRelHis" : attr.Code = "FONCTION_CD" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "NOM EmpRelHis" : attr.Code = "NOM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "PRENOM EmpRelHis" : attr.Code = "PRENOM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "ENTRP_REL_NM EmpRelHis" : attr.Code = "ENTRP_REL_NM" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "ADR EmpRelHis" : attr.Code = "ADR" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "VILLE_NM EmpRelHis" : attr.Code = "VILLE_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "PROV_CD EmpRelHis" : attr.Code = "PROV_CD" : attr.DataType = "A2"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "CP_CD EmpRelHis" : attr.Code = "CP_CD" : attr.DataType = "VA7"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "PAYS_NM EmpRelHis" : attr.Code = "PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "TEL_NO EmpRelHis" : attr.Code = "TEL_NO" : attr.DataType = "VA20"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "COURRIEL_ADR EmpRelHis" : attr.Code = "COURRIEL_ADR" : attr.DataType = "VA100"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "NAISS_DT EmpRelHis" : attr.Code = "NAISS_DT" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "STATUT_REL_CD EmpRelHis" : attr.Code = "STATUT_REL_CD" : attr.DataType = "VA20"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "TRAIT_DT EmpRelHis" : attr.Code = "TRAIT_DT" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "DERN_CHG_DT EmpRelHis" : attr.Code = "DERN_CHG_DT" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "AUTRE_NOM_ENTRP_REL EmpRelHis" : attr.Code = "AUTRE_NOM_ENTRP_REL" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "TEL_AUTRE_NO EmpRelHis" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA20"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "FAX_NO EmpRelHis" : attr.Code = "FAX_NO" : attr.DataType = "VA20"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "NOTE_TEL EmpRelHis" : attr.Code = "NOTE_TEL" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "NOTE_TEL_AUTRE EmpRelHis" : attr.Code = "NOTE_TEL_AUTRE" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "DEB_VALIDITE_DT EmpRelHis" : attr.Code = "DT_DEB_VALIDITE" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "FIN_VALIDITE_DT EmpRelHis" : attr.Code = "DT_FIN_VALIDITE" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "INSOLVABILITE_DT EmpRelHis" : attr.Code = "DT_INSOLVABILITE" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "DECES_DT EmpRelHis" : attr.Code = "DT_DECES" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "PRESUME_DECES_DT EmpRelHis" : attr.Code = "DT_PRESUME_DECES" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "DEB_FONCTION_DT EmpRelHis" : attr.Code = "DT_DEB_FONCTION" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "FIN_FONCTION_DT EmpRelHis" : attr.Code = "DT_FIN_FONCTION" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "RECEP_DESIGNATION_DT EmpRelHis" : attr.Code = "DT_RECEP_DESIGNATION" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "ENR_DESIGNATION_DT EmpRelHis" : attr.Code = "DT_ENR_DESIGNATION" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "DEB_EFFECT_DT EmpRelHis" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "FIN_EFFECT_DT EmpRelHis" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "ACTIF_IND EmpRelHis" : attr.Code = "ACTIF_IND" : attr.DataType = "A1"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "SOURCE_SYSTEM EmpRelHis" : attr.Code = "SOURCE_SYSTEM" : attr.DataType = "VA20"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "IMPORT_DATE EmpRelHis" : attr.Code = "IMPORT_DATE" : attr.DataType = "DT"

    ' ========================================
    ' RELATIONS (d'après FKs du MPD)
    ' ========================================
    Output "Création des relations..."

    Set rel = model.Relationships.CreateNew()
    rel.Name = "FK_CFG_PARM_CONFIG"
    rel.Code = "FK_CFG_PARM_CONFIG"
    Set rel.Entity1 = config
    Set rel.Entity2 = configParm
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"

    Set rel = model.Relationships.CreateNew()
    rel.Name = "FK_SALAR_DOSS_EMP"
    rel.Code = "FK_SALAR_DOSS_EMP"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = salarDoss
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"

    Set rel = model.Relationships.CreateNew()
    rel.Name = "FK_EMPL_REL_DOSS"
    rel.Code = "FK_EMPL_REL_DOSS"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = emplRel
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"

    Set rel = model.Relationships.CreateNew()
    rel.Name = "FK_RAP_MENS_ENT_EMP"
    rel.Code = "FK_RAP_MENS_ENT_EMP"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = rapMensEnt
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"

    Set rel = model.Relationships.CreateNew()
    rel.Name = "FK_RAP_MENS_DET_ENT"
    rel.Code = "FK_RAP_MENS_DET_ENT"
    Set rel.Entity1 = rapMensEnt
    Set rel.Entity2 = rapMensDet
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"

    Set rel = model.Relationships.CreateNew()
    rel.Name = "FK_RAP_MENS_DET_EMP"
    rel.Code = "FK_RAP_MENS_DET_EMP"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = rapMensDet
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"

    Set rel = model.Relationships.CreateNew()
    rel.Name = "FK_RAP_MENS_DET_SAL"
    rel.Code = "FK_RAP_MENS_DET_SAL"
    Set rel.Entity1 = salarDoss
    Set rel.Entity2 = rapMensDet
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"

    Output "Terminé."
    MsgBox "MCD CCQ v2.11 généré depuis MPD avec :" & vbCrLf & _
           "- 10 entités (tables MPD)" & vbCrLf & _
           "- 7 relations (FKs MPD)" & vbCrLf & _
           "- CTRL_HEBDO : ENR_ACTIF_NB + ENR_DESAC_NB ajoutés", vbInformation

End Sub

Call Main()
