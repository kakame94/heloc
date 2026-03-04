Option Explicit

' ================================================================
' Script VBScript PowerDesigner - MCD CCQ - Match DDL Exact
' ================================================================
' Auteur      : Eliot Alanmanou
' Date        : 2026-01-22
' Client      : CCQ
' Objectif    : Générer un MCD correspondant exactement au DDL SQL Server 2016
' Version     : 1.0
' ================================================================
' Tables générées (12 tables):
'   Schema CCQ: CCQ_AUDIT_CHANGEMENTS_CRITIQUES, CCQ_AUDIT_CONFIG,
'               CTRL_HEBDO, CTRL_INIT, EMPL_DOSS, EMPL_REL,
'               EMPL_REL_HISTORY, RAP_MENS_DET, RAP_MENS_ENT, SALAR_DOSS
'   Schema CFG: CFG_CONFIG, CFG_CONFIG_PARM
' ================================================================

Sub Main()
    On Error Resume Next
    
    Dim model
    Set model = ActiveModel
    
    If model Is Nothing Then
        MsgBox "Erreur: Créez d'abord un CDM vide dans PowerDesigner", vbCritical, "Erreur"
        Exit Sub
    End If
    
    If Err.Number <> 0 Then
        MsgBox "Erreur ActiveModel: " & Err.Description, vbCritical
        Exit Sub
    End If
    
    If Not model.IsKindOf(PdCDM.cls_Model) Then
        MsgBox "Erreur: Le modèle actif n'est pas un MCD (CDM)", vbCritical, "Erreur"
        Exit Sub
    End If
    
    ' Nettoyage du modèle existant
    Dim i
    For i = model.Relationships.Count - 1 To 0 Step -1
        model.Relationships.Item(i).Delete
    Next
    For i = model.Entities.Count - 1 To 0 Step -1
        model.Entities.Item(i).Delete
    Next
    
    model.Name = "CCQ - Modèle DDL Exact"
    model.Code = "CCQ_MCD_DDL_EXACT"
    
    ' Déclarations des entités
    Dim ccqAuditChgCrit, ccqAuditConfig
    Dim cfgConfig, cfgConfigParm
    Dim ctrlHebdo, ctrlInit
    Dim emplDoss, emplRel, emplRelHistory
    Dim rapMensDet, rapMensEnt, salarDoss
    Dim attr, ident, ak
    ' Note: Pas de relations (Dim rel) car le DDL n'a pas de FK
    
    ' ========================================
    ' 1. CCQ_AUDIT_CHANGEMENTS_CRITIQUES
    ' ========================================
    Output "1. Création CCQ_AUDIT_CHANGEMENTS_CRITIQUES..."
    Set ccqAuditChgCrit = model.Entities.CreateNew()
    ccqAuditChgCrit.Name = "Audit Changements Critiques"
    ccqAuditChgCrit.Code = "CCQ_AUDIT_CHANGEMENTS_CRITIQUES"
    
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Identifiant audit" : attr.Code = "AUDIT_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ccqAuditChgCrit.Identifiers.CreateNew() : ident.Name = "PK_CCQ_AUDIT_CHANGEMENTS_CRITI" : ident.Code = "PK_CCQ_AUDIT_CHANGEMENTS_CRITI" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Type entité" : attr.Code = "ENTITE_TYPE" : attr.DataType = "VA20" : attr.Mandatory = True
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Identifiant source" : attr.Code = "SOURCE_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Identifiant cible" : attr.Code = "TARGET_ID" : attr.DataType = "VA50"
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Catégorie" : attr.Code = "CATEGORIE" : attr.DataType = "VA30" : attr.Mandatory = True
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Valeur avant texte" : attr.Code = "VALEUR_AVANT_TXT" : attr.DataType = "LA"
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Valeur après texte" : attr.Code = "VALEUR_APRES_TXT" : attr.DataType = "LA"
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Système source" : attr.Code = "SOURCE_SYSTEM" : attr.DataType = "VA20"
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Date mise à jour" : attr.Code = "UPDATED_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = ccqAuditChgCrit.Attributes.CreateNew() : attr.Name = "Identifiant CCQ" : attr.Code = "ID_CCQ" : attr.DataType = "VA50" : attr.Mandatory = True

    ' ========================================
    ' 2. CCQ_AUDIT_CONFIG
    ' ========================================
    Output "2. Création CCQ_AUDIT_CONFIG..."
    Set ccqAuditConfig = model.Entities.CreateNew()
    ccqAuditConfig.Name = "Configuration Audit"
    ccqAuditConfig.Code = "CCQ_AUDIT_CONFIG"
    
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Identifiant configuration" : attr.Code = "CONFIG_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ccqAuditConfig.Identifiers.CreateNew() : ident.Name = "PK_CCQ_AUDIT_CONFIG" : ident.Code = "PK_CCQ_AUDIT_CONFIG" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Code configuration" : attr.Code = "CD_CONFIG" : attr.DataType = "VA20" : attr.Mandatory = True
    Set ak = ccqAuditConfig.Identifiers.CreateNew() : ak.Name = "UK_CCQ_AUDIT_CONFI_CCQ_AUDI" : ak.Code = "UK_CCQ_AUDIT_CONFI_CCQ_AUDI" : ak.Attributes.Add attr
    
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Type entité" : attr.Code = "ENTITE_TYPE" : attr.DataType = "VA20" : attr.Mandatory = True
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Requête SQL audit" : attr.Code = "REQ_SQL_AUDIT" : attr.DataType = "LA" : attr.Mandatory = True
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Catégorie" : attr.Code = "CATEGORIE" : attr.DataType = "VA30" : attr.Mandatory = True
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Sous-catégorie" : attr.Code = "SOUS_CATEGORIE" : attr.DataType = "VA30"
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Est actif" : attr.Code = "EST_ACTIF" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Rétention jours" : attr.Code = "RETENTION_JOURS" : attr.DataType = "I"

    ' ========================================
    ' 3. CFG_CONFIG
    ' ========================================
    Output "3. Création CFG_CONFIG..."
    Set cfgConfig = model.Entities.CreateNew()
    cfgConfig.Name = "Configuration Système"
    cfgConfig.Code = "CFG_CONFIG"
    
    Set attr = cfgConfig.Attributes.CreateNew() : attr.Name = "Identifiant configuration" : attr.Code = "CFG_ID" : attr.DataType = "LI" : attr.Mandatory = True
    Set ident = cfgConfig.Identifiers.CreateNew() : ident.Name = "PK_CFG_CONFIG" : ident.Code = "PK_CFG_CONFIG" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = cfgConfig.Attributes.CreateNew() : attr.Name = "Code système" : attr.Code = "CD_SYSTEM" : attr.DataType = "VA10" : attr.Mandatory = True
    Set ak = cfgConfig.Identifiers.CreateNew() : ak.Name = "UK_CFG_CONFIG_METI_CFG_CONF" : ak.Code = "UK_CFG_CONFIG_METI_CFG_CONF" : ak.Attributes.Add attr
    
    Set attr = cfgConfig.Attributes.CreateNew() : attr.Name = "Description système" : attr.Code = "DESCR_SYSTEM" : attr.DataType = "VA200" : attr.Mandatory = True
    Set attr = cfgConfig.Attributes.CreateNew() : attr.Name = "Indicateur actif" : attr.Code = "IND_ACTIF" : attr.DataType = "A1" : attr.Mandatory = True

    ' ========================================
    ' 4. CFG_CONFIG_PARM
    ' ========================================
    Output "4. Création CFG_CONFIG_PARM..."
    Set cfgConfigParm = model.Entities.CreateNew()
    cfgConfigParm.Name = "Paramètres Configuration"
    cfgConfigParm.Code = "CFG_CONFIG_PARM"
    
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Identifiant paramètre" : attr.Code = "CFG_PARM_ID" : attr.DataType = "LI" : attr.Mandatory = True
    Set ident = cfgConfigParm.Identifiers.CreateNew() : ident.Name = "PK_CFG_CONFIG_PARM" : ident.Code = "PK_CFG_CONFIG_PARM" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Code paramètre" : attr.Code = "CD_PARAM" : attr.DataType = "VA20" : attr.Mandatory = True
    Set ak = cfgConfigParm.Identifiers.CreateNew() : ak.Name = "UK_CFG_CONFIG_PARM_CFG_CONF" : ak.Code = "UK_CFG_CONFIG_PARM_CFG_CONF" : ak.Attributes.Add attr
    
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Code système" : attr.Code = "CD_SYSTEM" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Description paramètre" : attr.Code = "DESCR_PARAM" : attr.DataType = "VA200" : attr.Mandatory = True
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Valeur paramètre" : attr.Code = "VALEUR_PARM" : attr.DataType = "VA200" : attr.Mandatory = True
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Indicateur actif" : attr.Code = "IND_ACTIF" : attr.DataType = "A1" : attr.Mandatory = True

    ' ========================================
    ' 5. CTRL_HEBDO
    ' ========================================
    Output "5. Création CTRL_HEBDO..."
    Set ctrlHebdo = model.Entities.CreateNew()
    ctrlHebdo.Name = "Contrôle Hebdomadaire"
    ctrlHebdo.Code = "CTRL_HEBDO"
    
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Clé contrôle rapport" : attr.Code = "RAP_CTRL_CLE" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ctrlHebdo.Identifiers.CreateNew() : ident.Name = "PK_CTRL_HEBDO" : ident.Code = "PK_CTRL_HEBDO" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Abréviation IG" : attr.Code = "IG_ABREV" : attr.DataType = "VA10"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nom fichier ZIP" : attr.Code = "FICH_ZIP_NM" : attr.DataType = "VA100" : attr.Mandatory = True
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nom fichier" : attr.Code = "FICHIER_NM" : attr.DataType = "VA100" : attr.Mandatory = True
    
    ' AK composite (FICH_ZIP_NM, FICHIER_NM)
    Dim akCtrlHebdo, attrZip, attrFich
    Set attrZip = Nothing
    Set attrFich = Nothing
    For i = 0 To ctrlHebdo.Attributes.Count - 1
        If ctrlHebdo.Attributes.Item(i).Code = "FICH_ZIP_NM" Then Set attrZip = ctrlHebdo.Attributes.Item(i)
        If ctrlHebdo.Attributes.Item(i).Code = "FICHIER_NM" Then Set attrFich = ctrlHebdo.Attributes.Item(i)
    Next
    Set akCtrlHebdo = ctrlHebdo.Identifiers.CreateNew()
    akCtrlHebdo.Name = "UK_CTRL_HEBDO_FICH_ZIP_NM"
    akCtrlHebdo.Code = "UK_CTRL_HEBDO_FICH_ZIP_NM"
    If Not attrZip Is Nothing Then akCtrlHebdo.Attributes.Add attrZip
    If Not attrFich Is Nothing Then akCtrlHebdo.Attributes.Add attrFich
    
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Description" : attr.Code = "DESCR" : attr.DataType = "VA500"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Date heure envoi" : attr.Code = "ENVOI_DH" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre lignes" : attr.Code = "LIGNES_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Code statut chargement" : attr.Code = "CHARG_STATUT_CD" : attr.DataType = "VA20"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Date chargement" : attr.Code = "CHARG_DT" : attr.DataType = "D"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements traités" : attr.Code = "ENR_TRAIT_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements rejetés" : attr.Code = "ENR_REJET_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements insérés" : attr.Code = "ENR_INSERT_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements modifiés" : attr.Code = "ENR_MODIF_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements actifs" : attr.Code = "ENR_ACTIF_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements désactivés" : attr.Code = "ENR_DESAC_NB" : attr.DataType = "I"

    ' ========================================
    ' 6. CTRL_INIT
    ' ========================================
    Output "6. Création CTRL_INIT..."
    Set ctrlInit = model.Entities.CreateNew()
    ctrlInit.Name = "Contrôle Initial"
    ctrlInit.Code = "CTRL_INIT"
    
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Clé contrôle rapport" : attr.Code = "RAP_CTRL_CLE" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ctrlInit.Identifiers.CreateNew() : ident.Name = "PK_CTRL_INIT" : ident.Code = "PK_CTRL_INIT" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Abréviation IG" : attr.Code = "IG_ABREV" : attr.DataType = "VA10"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Nom fichier ZIP" : attr.Code = "FICH_ZIP_NM" : attr.DataType = "VA100" : attr.Mandatory = True
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Nom fichier" : attr.Code = "FICHIER_NM" : attr.DataType = "VA100" : attr.Mandatory = True
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Description" : attr.Code = "DESCR" : attr.DataType = "VA500"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Date heure envoi" : attr.Code = "ENVOI_DH" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Nombre lignes" : attr.Code = "LIGNES_NB" : attr.DataType = "I"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Code statut chargement" : attr.Code = "CHARG_STATUT_CD" : attr.DataType = "VA20"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Date chargement" : attr.Code = "CHARG_DT" : attr.DataType = "D"

    ' ========================================
    ' 7. EMPL_DOSS (57 colonnes)
    ' ========================================
    Output "7. Création EMPL_DOSS..."
    Set emplDoss = model.Entities.CreateNew()
    emplDoss.Name = "Dossier Employeur"
    emplDoss.Code = "EMPL_DOSS"
    
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Identifiant dossier employeur" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplDoss.Identifiers.CreateNew() : ident.Name = "PK_EMPL_DOSS" : ident.Code = "PK_EMPL_DOSS" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro client employeur" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date début effectivité" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    
    ' AK composite (CLIENT_EMP_NO, DEB_EFFECT_DT)
    Dim akEmplDoss, attrClientEmpNo, attrDebEffectDt
    Set attrClientEmpNo = Nothing
    Set attrDebEffectDt = Nothing
    For i = 0 To emplDoss.Attributes.Count - 1
        If emplDoss.Attributes.Item(i).Code = "CLIENT_EMP_NO" Then Set attrClientEmpNo = emplDoss.Attributes.Item(i)
        If emplDoss.Attributes.Item(i).Code = "DEB_EFFECT_DT" Then Set attrDebEffectDt = emplDoss.Attributes.Item(i)
    Next
    Set akEmplDoss = emplDoss.Identifiers.CreateNew()
    akEmplDoss.Name = "UK_EMPL_DOSS_METIE_EMPL_DOS"
    akEmplDoss.Code = "UK_EMPL_DOSS_METIE_EMPL_DOS"
    If Not attrClientEmpNo Is Nothing Then akEmplDoss.Attributes.Add attrClientEmpNo
    If Not attrDebEffectDt Is Nothing Then akEmplDoss.Attributes.Add attrDebEffectDt
    
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date fin effectivité" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code région administrative" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Indicateur CMEQ" : attr.Code = "CMEQ_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Indicateur CMMTQ" : attr.Code = "CMMTQ_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro intervenant" : attr.Code = "INTERV_NO" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Nom entreprise" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Autre nom entreprise" : attr.Code = "ENTRP_AUTRE_NM" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Adresse affaires" : attr.Code = "AFF_ADR" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Ville affaires" : attr.Code = "AFF_VILLE_NM" : attr.DataType = "VA100"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Province affaires" : attr.Code = "AFF_PROV_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code postal affaires" : attr.Code = "AFF_CP_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Pays affaires" : attr.Code = "AFF_PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Adresse correspondance" : attr.Code = "CORR_ADR" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Ville correspondance" : attr.Code = "CORR_VILLE_NM" : attr.DataType = "VA100"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Province correspondance" : attr.Code = "CORR_PROV_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code postal correspondance" : attr.Code = "CORR_CP_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Pays correspondance" : attr.Code = "CORR_PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Adresse bureau Québec" : attr.Code = "BUR_QC_ADR" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Ville bureau Québec" : attr.Code = "BUR_QC_VILLE_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Province bureau Québec" : attr.Code = "BUR_QC_PROV_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code postal bureau Québec" : attr.Code = "BUR_QC_CP_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Pays bureau Québec" : attr.Code = "BUR_QC_PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Lieu vérification régionale" : attr.Code = "LIEU_VERIF_REG" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code blocage adresse affaires" : attr.Code = "BLOC_AFF_ADR_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code blocage adresse correspondance" : attr.Code = "BLOC_CORR_ADR_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code blocage adresse bureau" : attr.Code = "BLOC_BUR_ADR_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Téléphone principal" : attr.Code = "TEL_PRINC_NO" : attr.DataType = "VA40"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Téléphone autre" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA40"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro fax" : attr.Code = "FAX_NO" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Adresse courriel" : attr.Code = "COURRIEL_ADR" : attr.DataType = "VA100"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date enregistrement" : attr.Code = "DATE_ENREG" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date début travaux" : attr.Code = "DATE_DEB_TRAV" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code statut juridique" : attr.Code = "STATUT_JUR_CD" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date statut juridique" : attr.Code = "STATUT_JUR_DT" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code type employeur" : attr.Code = "TYPE_EMP_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code statut affaire" : attr.Code = "STATUT_AFF_CD" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date statut affaire" : attr.Code = "STATUT_AFF_DT" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Indicateur employeur reconnu" : attr.Code = "EMP_RECONNU_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro NEQ" : attr.Code = "NEQ_NO" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code statut NEQ" : attr.Code = "NEQ_STATUT_CD" : attr.DataType = "VA40"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro dossier RBQ" : attr.Code = "NO_DOSSIER_RBQ" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Type licence CCQ 1" : attr.Code = "LIC_CCQ1_TYPE" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Statut licence CCQ 1" : attr.Code = "LIC_CCQ1_STATUT" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Type licence CCQ 2" : attr.Code = "LIC_CCQ2_TYPE" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Statut licence CCQ 2" : attr.Code = "LIC_CCQ2_STATUT" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date insolvabilité" : attr.Code = "DT_INSOLVABILITE" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Raison insolvabilité" : attr.Code = "RAISON_INSOLVABILITE" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro employeur ancien" : attr.Code = "NO_EMP_ANCIEN" : attr.DataType = "VA60"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro employeur nouveau" : attr.Code = "NO_EMP_NOUVEAU" : attr.DataType = "VA60"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date dernier changement" : attr.Code = "DERN_CHG_DT" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Indicateur actif" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date création" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Utilisateur création" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date modification" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Utilisateur modification" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ========================================
    ' 8. EMPL_REL (39 colonnes)
    ' ========================================
    Output "8. Création EMPL_REL..."
    Set emplRel = model.Entities.CreateNew()
    emplRel.Name = "Relations Employeur"
    emplRel.Code = "EMPL_REL"
    
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Identifiant relation employeur" : attr.Code = "EMPL_REL_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplRel.Identifiers.CreateNew() : ident.Name = "PK_EMPL_REL" : ident.Code = "PK_EMPL_REL" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Numéro client relation" : attr.Code = "CLIENT_REL_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date début effectivité" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Numéro client employeur" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Code fonction" : attr.Code = "FONCTION_CD" : attr.DataType = "VA50"
    
    ' AK composite (CLIENT_REL_NO, CLIENT_EMP_NO, FONCTION_CD, DEB_EFFECT_DT)
    Dim akEmplRel, attrClientRelNo, attrClientEmpNoRel, attrFonctionCd, attrDebEffectDtRel
    Set attrClientRelNo = Nothing
    Set attrClientEmpNoRel = Nothing
    Set attrFonctionCd = Nothing
    Set attrDebEffectDtRel = Nothing
    For i = 0 To emplRel.Attributes.Count - 1
        If emplRel.Attributes.Item(i).Code = "CLIENT_REL_NO" Then Set attrClientRelNo = emplRel.Attributes.Item(i)
        If emplRel.Attributes.Item(i).Code = "CLIENT_EMP_NO" Then Set attrClientEmpNoRel = emplRel.Attributes.Item(i)
        If emplRel.Attributes.Item(i).Code = "FONCTION_CD" Then Set attrFonctionCd = emplRel.Attributes.Item(i)
        If emplRel.Attributes.Item(i).Code = "DEB_EFFECT_DT" Then Set attrDebEffectDtRel = emplRel.Attributes.Item(i)
    Next
    Set akEmplRel = emplRel.Identifiers.CreateNew()
    akEmplRel.Name = "UK_EMPL_REL_METIER_EMPL_REL"
    akEmplRel.Code = "UK_EMPL_REL_METIER_EMPL_REL"
    If Not attrClientRelNo Is Nothing Then akEmplRel.Attributes.Add attrClientRelNo
    If Not attrClientEmpNoRel Is Nothing Then akEmplRel.Attributes.Add attrClientEmpNoRel
    If Not attrFonctionCd Is Nothing Then akEmplRel.Attributes.Add attrFonctionCd
    If Not attrDebEffectDtRel Is Nothing Then akEmplRel.Attributes.Add attrDebEffectDtRel
    
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date fin effectivité" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Code région administrative" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Nom entreprise" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Nom" : attr.Code = "NOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Prénom" : attr.Code = "PRENOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date naissance" : attr.Code = "NAISS_DT" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Nom entreprise relation" : attr.Code = "ENTRP_REL_NM" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Autre nom entreprise relation" : attr.Code = "AUTRE_NOM_ENTRP_REL" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Adresse" : attr.Code = "ADR" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Ville" : attr.Code = "VILLE_NM" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Code province" : attr.Code = "PROV_CD" : attr.DataType = "VA3"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Code postal" : attr.Code = "CP_CD" : attr.DataType = "VA10"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Pays" : attr.Code = "PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Numéro téléphone" : attr.Code = "TEL_NO" : attr.DataType = "VA40"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Numéro téléphone autre" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA40"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Numéro fax" : attr.Code = "FAX_NO" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Note téléphone" : attr.Code = "NOTE_TEL" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Note téléphone autre" : attr.Code = "NOTE_TEL_AUTRE" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Adresse courriel" : attr.Code = "COURRIEL_ADR" : attr.DataType = "VA100"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Code statut relation" : attr.Code = "STATUT_REL_CD" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date dernier changement" : attr.Code = "DERN_CHG_DT" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date début validité" : attr.Code = "DT_DEB_VALIDITE" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date fin validité" : attr.Code = "DT_FIN_VALIDITE" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date insolvabilité" : attr.Code = "DT_INSOLVABILITE" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date décès" : attr.Code = "DT_DECES" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date présumé décès" : attr.Code = "DT_PRESUME_DECES" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date début fonction" : attr.Code = "DT_DEB_FONCTION" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date fin fonction" : attr.Code = "DT_FIN_FONCTION" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date réception désignation" : attr.Code = "DT_RECEP_DESIGNATION" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date enregistrement désignation" : attr.Code = "DT_ENR_DESIGNATION" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Indicateur actif" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date création" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Utilisateur création" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date modification" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Utilisateur modification" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ========================================
    ' 9. EMPL_REL_HISTORY (36 colonnes)
    ' ========================================
    Output "9. Création EMPL_REL_HISTORY..."
    Set emplRelHistory = model.Entities.CreateNew()
    emplRelHistory.Name = "Historique Relations Employeur"
    emplRelHistory.Code = "EMPL_REL_HISTORY"
    
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Identifiant historique" : attr.Code = "HISTORY_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplRelHistory.Identifiers.CreateNew() : ident.Name = "PK_EMPL_REL_HISTORY" : ident.Code = "PK_EMPL_REL_HISTORY" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro client relation" : attr.Code = "CLIENT_REL_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date début effectivité" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date fin effectivité" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro client employeur" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom région administrative" : attr.Code = "REG_ADMIN_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom entreprise" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom fonction" : attr.Code = "FONCTION_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom" : attr.Code = "NOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Prénom" : attr.Code = "PRENOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom entreprise relation" : attr.Code = "ENTRP_REL_NM" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Autre nom entreprise relation" : attr.Code = "AUTRE_NOM_ENTRP_REL" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Adresse" : attr.Code = "ADR" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Ville" : attr.Code = "VILLE_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Code province" : attr.Code = "PROV_CD" : attr.DataType = "VA3"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Code postal" : attr.Code = "CP_CD" : attr.DataType = "VA10"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Pays" : attr.Code = "PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro téléphone" : attr.Code = "TEL_NO" : attr.DataType = "VA40"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro téléphone autre" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA40"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro fax" : attr.Code = "FAX_NO" : attr.DataType = "VA20"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Adresse courriel" : attr.Code = "COURRIEL_ADR" : attr.DataType = "VA100"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date insolvabilité" : attr.Code = "INSOLVAB_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date naissance" : attr.Code = "NAISS_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date décès" : attr.Code = "DECES_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date présumé décès" : attr.Code = "PRESUME_DECES_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date début fonction" : attr.Code = "DEB_FONCTION_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date fin fonction" : attr.Code = "FIN_FONCTION_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date réception désignation" : attr.Code = "RECEPT_DESIGN_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date enregistrement désignation" : attr.Code = "ENREG_DESIGN_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom statut relation" : attr.Code = "STATUT_REL_NM" : attr.DataType = "VA20"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Indicateur actif" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date création" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Utilisateur création" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date modification" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Utilisateur modification" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Flag migration" : attr.Code = "MIGRATION_FLAG" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date migration" : attr.Code = "MIGRATION_DATE" : attr.DataType = "DT" : attr.Mandatory = True

    ' ========================================
    ' 10. RAP_MENS_DET (28 colonnes)
    ' ========================================
    Output "10. Création RAP_MENS_DET..."
    Set rapMensDet = model.Entities.CreateNew()
    rapMensDet.Name = "Rapport Mensuel Détail"
    rapMensDet.Code = "RAP_MENS_DET"
    
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Identifiant rapport mensuel détail" : attr.Code = "RAP_MENS_DET_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = rapMensDet.Identifiers.CreateNew() : ident.Name = "PK_RAP_MENS_DET" : ident.Code = "PK_RAP_MENS_DET" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Clé activité SAP" : attr.Code = "ACT_SAP_CLE" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date début effectivité" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    
    ' AK composite (ACT_SAP_CLE, DEB_EFFECT_DT)
    Dim akRapMensDet, attrActSapCle, attrDebEffectDtDet
    Set attrActSapCle = Nothing
    Set attrDebEffectDtDet = Nothing
    For i = 0 To rapMensDet.Attributes.Count - 1
        If rapMensDet.Attributes.Item(i).Code = "ACT_SAP_CLE" Then Set attrActSapCle = rapMensDet.Attributes.Item(i)
        If rapMensDet.Attributes.Item(i).Code = "DEB_EFFECT_DT" Then Set attrDebEffectDtDet = rapMensDet.Attributes.Item(i)
    Next
    Set akRapMensDet = rapMensDet.Identifiers.CreateNew()
    akRapMensDet.Name = "UK_RAP_MENS_DET_ME_RAP_MENS"
    akRapMensDet.Code = "UK_RAP_MENS_DET_ME_RAP_MENS"
    If Not attrActSapCle Is Nothing Then akRapMensDet.Attributes.Add attrActSapCle
    If Not attrDebEffectDtDet Is Nothing Then akRapMensDet.Attributes.Add attrDebEffectDtDet
    
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date fin effectivité" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Clé rapport SAP" : attr.Code = "RAP_SAP_CLE" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Numéro client employeur" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Numéro client salarié" : attr.Code = "CLIENT_SAL_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Indicateur actif" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date début période envoi" : attr.Code = "PER_ENV_DEB_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date fin période envoi" : attr.Code = "PER_ENV_FIN_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code période" : attr.Code = "PERIODE_CD" : attr.DataType = "VA7"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Prénom" : attr.Code = "PRENOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Nom" : attr.Code = "NOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Nombre semaines travaillées" : attr.Code = "SEM_TRAV_NB" : attr.DataType = "I"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code métier" : attr.Code = "METIER_CD" : attr.DataType = "VA3"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Nom métier" : attr.Code = "METIER_NM" : attr.DataType = "VA100"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code secteur" : attr.Code = "SECTEUR_CD" : attr.DataType = "A1"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Nom secteur" : attr.Code = "SECTEUR_NM" : attr.DataType = "VA50"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Somme heures salarié" : attr.Code = "HRS_SAL_SOM" : attr.DataType = "DC10,2"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code statut salarial" : attr.Code = "STAT_SAL_CD" : attr.DataType = "VA2"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Montant total avantages sociaux" : attr.Code = "TOT_AV_SOC_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code annexe salariale" : attr.Code = "CD_ANNEXE_SAL" : attr.DataType = "VA10"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Description annexe salariale" : attr.Code = "ANNEXE_SAL_DESC" : attr.DataType = "VA100"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Indicateur CMEQ employeur" : attr.Code = "EMP_CMEQ_IND" : attr.DataType = "VA3"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Indicateur CMMTQ employeur" : attr.Code = "EMP_CMMTQ_IND" : attr.DataType = "VA3"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date création" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Utilisateur création" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date modification" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Utilisateur modification" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ========================================
    ' 11. RAP_MENS_ENT (32 colonnes)
    ' ========================================
    Output "11. Création RAP_MENS_ENT..."
    Set rapMensEnt = model.Entities.CreateNew()
    rapMensEnt.Name = "Rapport Mensuel Entête"
    rapMensEnt.Code = "RAP_MENS_ENT"
    
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Identifiant rapport mensuel entête" : attr.Code = "RAP_MENS_ENT_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = rapMensEnt.Identifiers.CreateNew() : ident.Name = "PK_RAP_MENS_ENT" : ident.Code = "PK_RAP_MENS_ENT" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Clé rapport SAP" : attr.Code = "RAP_SAP_CLE" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date début effectivité" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    
    ' AK composite (RAP_SAP_CLE, DEB_EFFECT_DT)
    Dim akRapMensEnt, attrRapSapCle, attrDebEffectDtEnt
    Set attrRapSapCle = Nothing
    Set attrDebEffectDtEnt = Nothing
    For i = 0 To rapMensEnt.Attributes.Count - 1
        If rapMensEnt.Attributes.Item(i).Code = "RAP_SAP_CLE" Then Set attrRapSapCle = rapMensEnt.Attributes.Item(i)
        If rapMensEnt.Attributes.Item(i).Code = "DEB_EFFECT_DT" Then Set attrDebEffectDtEnt = rapMensEnt.Attributes.Item(i)
    Next
    Set akRapMensEnt = rapMensEnt.Identifiers.CreateNew()
    akRapMensEnt.Name = "UK_RAP_MENS_ENT_ME_RAP_MENS"
    akRapMensEnt.Code = "UK_RAP_MENS_ENT_ME_RAP_MENS"
    If Not attrRapSapCle Is Nothing Then akRapMensEnt.Attributes.Add attrRapSapCle
    If Not attrDebEffectDtEnt Is Nothing Then akRapMensEnt.Attributes.Add attrDebEffectDtEnt
    
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date fin effectivité" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Numéro client employeur" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Indicateur actif" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date début période envoi" : attr.Code = "PER_ENV_DEB_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date fin période envoi" : attr.Code = "PER_ENV_FIN_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date début période fiscale" : attr.Code = "FISC_DEB_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date fin période fiscale" : attr.Code = "FISC_FIN_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Numéro rapport" : attr.Code = "RAPPORT_NO" : attr.DataType = "VA20" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Nombre amendement" : attr.Code = "AMEND_NB" : attr.DataType = "I"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Code statut rapport" : attr.Code = "RAP_STATUT_CD" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Code type rapport" : attr.Code = "TYPE_RAP_CD" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Nom entreprise" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Montant total rapport mensuel" : attr.Code = "TOT_RM_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Solde rapport mensuel" : attr.Code = "SOLDE_RM_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Montant total avantages sociaux" : attr.Code = "TOT_AV_SOC_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Montant net CARCAP" : attr.Code = "MNT_NET_CARCAP" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Indicateur ajout modification" : attr.Code = "AJOUT_MOD_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date soumission rapport mensuel" : attr.Code = "SOUM_RM_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Total heures rapport mensuel" : attr.Code = "TOT_HEURE_RM" : attr.DataType = "DC10,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Solde réclamation" : attr.Code = "SOLDE_RECL_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date début période réclamation" : attr.Code = "DEB_PER_RECL_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date fin période réclamation" : attr.Code = "FIN_PER_RECL_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Numéro réclamation" : attr.Code = "NO_RECLAMATION" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Indicateur employeur en enquête" : attr.Code = "EST_EMP_ENQUETE_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Indicateur rapport en retard" : attr.Code = "EST_RAP_RETARD_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date dernier changement" : attr.Code = "DERN_CHG_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date création" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Utilisateur création" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date modification" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Utilisateur modification" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ========================================
    ' 12. SALAR_DOSS (47 colonnes)
    ' ========================================
    Output "12. Création SALAR_DOSS..."
    Set salarDoss = model.Entities.CreateNew()
    salarDoss.Name = "Dossier Salarié"
    salarDoss.Code = "SALAR_DOSS"
    
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Identifiant dossier salarié" : attr.Code = "SALAR_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = salarDoss.Identifiers.CreateNew() : ident.Name = "PK_SALAR_DOSS" : ident.Code = "PK_SALAR_DOSS" : ident.PrimaryIdentifier = True : ident.Attributes.Add attr
    
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Numéro client salarié" : attr.Code = "CLIENT_SAL_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date début effectivité" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    
    ' AK composite (CLIENT_SAL_NO, DEB_EFFECT_DT)
    Dim akSalarDoss, attrClientSalNo, attrDebEffectDtSal
    Set attrClientSalNo = Nothing
    Set attrDebEffectDtSal = Nothing
    For i = 0 To salarDoss.Attributes.Count - 1
        If salarDoss.Attributes.Item(i).Code = "CLIENT_SAL_NO" Then Set attrClientSalNo = salarDoss.Attributes.Item(i)
        If salarDoss.Attributes.Item(i).Code = "DEB_EFFECT_DT" Then Set attrDebEffectDtSal = salarDoss.Attributes.Item(i)
    Next
    Set akSalarDoss = salarDoss.Identifiers.CreateNew()
    akSalarDoss.Name = "UK_SALAR_DOSS_METI_SALAR_DO"
    akSalarDoss.Code = "UK_SALAR_DOSS_METI_SALAR_DO"
    If Not attrClientSalNo Is Nothing Then akSalarDoss.Attributes.Add attrClientSalNo
    If Not attrDebEffectDtSal Is Nothing Then akSalarDoss.Attributes.Add attrDebEffectDtSal
    
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date fin effectivité" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Indicateur actif" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date enregistrement" : attr.Code = "ENREG_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Nom" : attr.Code = "NOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Prénom" : attr.Code = "PRENOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date naissance" : attr.Code = "NAISS_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code statut date naissance" : attr.Code = "NAISS_STATUT_CD" : attr.DataType = "VA20"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code genre" : attr.Code = "GENRE_CD" : attr.DataType = "A1"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Adresse correspondance ligne 1" : attr.Code = "CORR_ADR_L1" : attr.DataType = "VA200"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Municipalité correspondance" : attr.Code = "CORR_MUN_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code région correspondance" : attr.Code = "CORR_REG_CD" : attr.DataType = "A2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code province correspondance" : attr.Code = "CORR_PROV_CD" : attr.DataType = "A2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code postal correspondance" : attr.Code = "CORR_CP_CD" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Description pays correspondance français" : attr.Code = "CORR_PAYS_FR_DESC" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Pays correspondance" : attr.Code = "CORR_PAYS_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date changement adresse correspondance" : attr.Code = "CORR_CHG_ADR_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code non livrable correspondance" : attr.Code = "CORR_NON_LIV_CD" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Description non livrable correspondance" : attr.Code = "CORR_NON_LIV_DESC" : attr.DataType = "VA200"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Adresse domicile ligne 1" : attr.Code = "DOM_ADR_L1" : attr.DataType = "VA200"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Municipalité domicile" : attr.Code = "DOM_MUN_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code province domicile" : attr.Code = "DOM_PROV_CD" : attr.DataType = "A2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code postal domicile" : attr.Code = "DOM_CP_CD" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Pays domicile" : attr.Code = "DOM_PAYS_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date changement adresse domicile" : attr.Code = "DOM_CHG_ADR_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Téléphone principal" : attr.Code = "TEL_PRINC_NO" : attr.DataType = "VA40"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Téléphone autre" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA40"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code région administrative" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Nom région administrative" : attr.Code = "REG_ADMIN_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code région travail" : attr.Code = "REG_TRAV_CD" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Nom région travail" : attr.Code = "REG_TRAV_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code métier prioritaire" : attr.Code = "METIER_PRIO_CD" : attr.DataType = "VA3"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Nom métier prioritaire" : attr.Code = "METIER_PRIO_NM" : attr.DataType = "VA100"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Numéro employeur préféré" : attr.Code = "EMP_PRF_NO" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code type certificat 1" : attr.Code = "CERT1_TYPE_CD" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date échéance certificat 1" : attr.Code = "CERT1_ECH_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code type certificat 2" : attr.Code = "CERT2_TYPE_CD" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date échéance certificat 2" : attr.Code = "CERT2_ECH_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date début invalidité" : attr.Code = "DEB_INVAL_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date décès présumé" : attr.Code = "DECES_PRESUME_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date décès confirmé" : attr.Code = "DECES_CONFIRME_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date création" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Utilisateur création" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date modification" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Utilisateur modification" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    Output ""
    Output "========================================"
    Output "MCD CCQ DDL EXACT généré avec succès!"
    Output "========================================"
    Output "12 entités créées (sans relations - identique au DDL):"
    Output "  - CCQ_AUDIT_CHANGEMENTS_CRITIQUES"
    Output "  - CCQ_AUDIT_CONFIG"
    Output "  - CFG_CONFIG"
    Output "  - CFG_CONFIG_PARM"
    Output "  - CTRL_HEBDO"
    Output "  - CTRL_INIT"
    Output "  - EMPL_DOSS"
    Output "  - EMPL_REL"
    Output "  - EMPL_REL_HISTORY"
    Output "  - RAP_MENS_DET"
    Output "  - RAP_MENS_ENT"
    Output "  - SALAR_DOSS"
    Output "========================================"
    
    MsgBox "MCD CCQ DDL EXACT généré avec succès!" & vbCrLf & vbCrLf & _
           "12 tables créées correspondant exactement au DDL SQL Server." & vbCrLf & _
           "Contraintes PK et UK configurées. Pas de FK (comme le DDL).", vbInformation, "Succès"

End Sub

Call Main()
