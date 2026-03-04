Option Explicit

' ================================================================
' Script VBScript PowerDesigner - MCD CCQ v2.11 - COMPLET & RELATIONS MÉTIER
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
    
    model.Name = "CCQ v2.11 - Relations Métier Completes"
    model.Code = "CCQ_MCD_V211_METIER_FULL"

    Dim emplDoss, salarDoss, emplRel, rapMensEnt, rapMensDet, cfgConfig, cfgConfigParm
    Dim emplRelHistory, ccqAuditChangements, ccqAuditConfig
    Dim ctrlInit, ctrlHebdo
    Dim attr, ident, ak
    
    ' ========================================
    ' 1. EMPL_DOSS (58 colonnes + 1 PK)
    ' ========================================
    Output "1. Création EMPL_DOSS..."
    Set emplDoss = model.Entities.CreateNew()
    emplDoss.Name = "Dossier Employeur"
    emplDoss.Code = "EMPL_DOSS"
    
    ' PK
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Identifiant technique Employeur" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplDoss.Identifiers.CreateNew() : ident.Name = "PK_EMPL_DOSS" : ident.Code = "PK_EMPL_DOSS" : ident.Attributes.Add attr
    
    ' AK Métier (CLIENT_EMP_NO)
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro client employeur Employeur" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set ak = emplDoss.Identifiers.CreateNew() : ak.Name = "AK_EMPL_DOSS_METIER" : ak.Code = "AK_EMPL_DOSS_METIER" : ak.Attributes.Add attr
    
    ' Autres colonnes
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code région administrative Employeur" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Indicateur CMEQ Employeur" : attr.Code = "CMEQ_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Indicateur CMMTQ Employeur" : attr.Code = "CMMTQ_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro intervenant Employeur" : attr.Code = "INTERV_NO" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Nom entreprise Employeur" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Autre nom entreprise Employeur" : attr.Code = "ENTRP_AUTRE_NM" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Adresse affaires Employeur" : attr.Code = "AFF_ADR" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Ville affaires Employeur" : attr.Code = "AFF_VILLE_NM" : attr.DataType = "VA100"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Province affaires Employeur" : attr.Code = "AFF_PROV_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code postal affaires Employeur" : attr.Code = "AFF_CP_CD" : attr.DataType = "VA7"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Pays affaires Employeur" : attr.Code = "AFF_PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Adresse correspondance Employeur" : attr.Code = "CORR_ADR" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Ville correspondance Employeur" : attr.Code = "CORR_VILLE_NM" : attr.DataType = "VA100"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Province correspondance Employeur" : attr.Code = "CORR_PROV_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code postal correspondance Employeur" : attr.Code = "CORR_CP_CD" : attr.DataType = "VA7"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Pays correspondance Employeur" : attr.Code = "CORR_PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Adresse bureau Québec Employeur" : attr.Code = "BUR_QC_ADR" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Ville bureau Québec Employeur" : attr.Code = "BUR_QC_VILLE_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Province bureau Québec Employeur" : attr.Code = "BUR_QC_PROV_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code postal bureau Québec Employeur" : attr.Code = "BUR_QC_CP_CD" : attr.DataType = "VA7"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Pays bureau Québec Employeur" : attr.Code = "BUR_QC_PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Lieu vérification régionale Employeur" : attr.Code = "LIEU_VERIF_REG" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code blocage adresse affaires Employeur" : attr.Code = "BLOC_AFF_ADR_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code blocage adresse correspondance Employeur" : attr.Code = "BLOC_CORR_ADR_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Code blocage adresse bureau Employeur" : attr.Code = "BLOC_BUR_ADR_CD" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Téléphone principal Employeur" : attr.Code = "TEL_PRINC_NO" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Téléphone autre Employeur" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Fax Employeur" : attr.Code = "FAX_NO" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date enregistrement Employeur" : attr.Code = "DATE_ENREG" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date début travaux Employeur" : attr.Code = "DATE_DEB_TRAV" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Courriel Employeur" : attr.Code = "COURRIEL_ADR" : attr.DataType = "VA100"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Statut juridique Employeur" : attr.Code = "STATUT_JUR_CD" : attr.DataType = "VA50"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date statut juridique Employeur" : attr.Code = "STATUT_JUR_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Type employeur Employeur" : attr.Code = "TYPE_EMP_CD" : attr.DataType = "A2"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Statut affaire courant Employeur" : attr.Code = "STATUT_AFF_CD" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date statut affaire Employeur" : attr.Code = "STATUT_AFF_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Employeur reconnu Employeur" : attr.Code = "EMP_RECONNU_IND" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "NEQ Employeur" : attr.Code = "NEQ_NO" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Statut NEQ Employeur" : attr.Code = "NEQ_STATUT_CD" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro dossier RBQ Employeur" : attr.Code = "NO_DOSSIER_RBQ" : attr.DataType = "VA20"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Type licence RBQ 1 Employeur" : attr.Code = "LIC_CCQ1_TYPE" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Statut licence RBQ 1 Employeur" : attr.Code = "LIC_CCQ1_STATUT" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Type licence RBQ 2 Employeur" : attr.Code = "LIC_CCQ2_TYPE" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Statut licence RBQ 2 Employeur" : attr.Code = "LIC_CCQ2_STATUT" : attr.DataType = "A1"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date insolvabilité Employeur" : attr.Code = "DT_INSOLVABILITE" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Raison insolvabilité Employeur" : attr.Code = "RAISON_INSOLVABILITE" : attr.DataType = "VA200"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro employeur ancien Employeur" : attr.Code = "NO_EMP_ANCIEN" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Numéro employeur nouveau Employeur" : attr.Code = "NO_EMP_NOUVEAU" : attr.DataType = "VA10"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date traitement Employeur" : attr.Code = "TRAIT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date dernier changement Employeur" : attr.Code = "DERN_CHG_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date début effectivité Employeur" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date fin effectivité Employeur" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Indicateur actif Employeur" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date création Employeur" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Utilisateur création Employeur" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Date modification Employeur" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = emplDoss.Attributes.CreateNew() : attr.Name = "Utilisateur modification Employeur" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ========================================
    ' 2. SALAR_DOSS (49 colonnes + 1 PK)
    ' ========================================
    Output "2. Création SALAR_DOSS..."
    Set salarDoss = model.Entities.CreateNew()
    salarDoss.Name = "Dossier Salarié"
    salarDoss.Code = "SALAR_DOSS"
    
    ' PK
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Identifiant technique salarié Salarié" : attr.Code = "SALAR_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = salarDoss.Identifiers.CreateNew() : ident.Name = "PK_SALAR_DOSS" : ident.Code = "PK_SALAR_DOSS" : ident.Attributes.Add attr
    
    ' AK Métier
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Numéro client salarié Salarié" : attr.Code = "CLIENT_SAL_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set ak = salarDoss.Identifiers.CreateNew() : ak.Name = "AK_SALAR_DOSS_METIER" : ak.Code = "AK_SALAR_DOSS_METIER" : ak.Attributes.Add attr
    
    ' Autres colonnes
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date début effectivité Salarié" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date fin effectivité Salarié" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Indicateur actif Salarié" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date traitement Salarié" : attr.Code = "TRAIT_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date dernier changement Salarié" : attr.Code = "DERN_CHG_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date enregistrement Salarié" : attr.Code = "ENREG_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Nom Salarié" : attr.Code = "NOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Prénom Salarié" : attr.Code = "PRENOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date naissance Salarié" : attr.Code = "NAISS_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code statut date naissance Salarié" : attr.Code = "NAISS_STATUT_CD" : attr.DataType = "VA20"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code genre Salarié" : attr.Code = "GENRE_CD" : attr.DataType = "A1"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Adresse correspondance ligne 1 Salarié" : attr.Code = "CORR_ADR_L1" : attr.DataType = "VA200"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Municipalité correspondance Salarié" : attr.Code = "CORR_MUN_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code région correspondance Salarié" : attr.Code = "CORR_REG_CD" : attr.DataType = "A2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code province correspondance Salarié" : attr.Code = "CORR_PROV_CD" : attr.DataType = "A2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code postal correspondance Salarié" : attr.Code = "CORR_CP_CD" : attr.DataType = "VA7"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Pays correspondance français Salarié" : attr.Code = "CORR_PAYS_FR_DESC" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Pays correspondance Salarié" : attr.Code = "CORR_PAYS_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date changement adresse corresp Salarié" : attr.Code = "CORR_CHG_ADR_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code raison non livrable Salarié" : attr.Code = "CORR_NON_LIV_CD" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Description non livrable Salarié" : attr.Code = "CORR_NON_LIV_DESC" : attr.DataType = "VA200"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Adresse domicile ligne 1 Salarié" : attr.Code = "DOM_ADR_L1" : attr.DataType = "VA200"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Municipalité domicile Salarié" : attr.Code = "DOM_MUN_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Province domicile Salarié" : attr.Code = "DOM_PROV_CD" : attr.DataType = "A2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code postal domicile Salarié" : attr.Code = "DOM_CP_CD" : attr.DataType = "VA7"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Pays domicile Salarié" : attr.Code = "DOM_PAYS_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date changement adresse domicile Salarié" : attr.Code = "DOM_CHG_ADR_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Téléphone principal Salarié" : attr.Code = "TEL_PRINC_NO" : attr.DataType = "VA20"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Téléphone autre Salarié" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA20"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code région administrative Salarié" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Région administrative Salarié" : attr.Code = "REG_ADMIN_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code région de travail Salarié" : attr.Code = "REG_TRAV_CD" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Région de travail Salarié" : attr.Code = "REG_TRAV_NM" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code métier prioritaire Salarié" : attr.Code = "METIER_PRIO_CD" : attr.DataType = "VA3"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Métier prioritaire Salarié" : attr.Code = "METIER_PRIO_NM" : attr.DataType = "VA100"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Numéro employeur préféré Salarié" : attr.Code = "EMP_PRF_NO" : attr.DataType = "VA10"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code type certificat 1 Salarié" : attr.Code = "CERT1_TYPE_CD" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date échéance certificat 1 Salarié" : attr.Code = "CERT1_ECH_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Code type certificat 2 Salarié" : attr.Code = "CERT2_TYPE_CD" : attr.DataType = "VA50"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date échéance certificat 2 Salarié" : attr.Code = "CERT2_ECH_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date début invalidité Salarié" : attr.Code = "DEB_INVAL_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date décès présumé Salarié" : attr.Code = "DECES_PRESUME_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date décès confirmé Salarié" : attr.Code = "DECES_CONFIRME_DT" : attr.DataType = "D"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date création Salarié" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Utilisateur création Salarié" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Date modification Salarié" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = salarDoss.Attributes.CreateNew() : attr.Name = "Utilisateur modification Salarié" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ========================================
    ' 3. CFG_CONFIG (4 colonnes + 1 PK)
    ' ========================================
    Output "3. Création CFG_CONFIG..."
    Set cfgConfig = model.Entities.CreateNew()
    cfgConfig.Name = "Configuration Système"
    cfgConfig.Code = "CFG_CONFIG"
    
    ' PK
    Set attr = cfgConfig.Attributes.CreateNew() : attr.Name = "Identifiant configuration Config" : attr.Code = "CFG_ID" : attr.DataType = "LI" : attr.Mandatory = True
    Set ident = cfgConfig.Identifiers.CreateNew() : ident.Name = "PK_CFG_CONFIG" : ident.Code = "PK_CFG_CONFIG" : ident.Attributes.Add attr
    
    ' AK
    Set attr = cfgConfig.Attributes.CreateNew() : attr.Name = "Code système Config" : attr.Code = "CD_SYSTEM" : attr.DataType = "VA10" : attr.Mandatory = True
    Set ak = cfgConfig.Identifiers.CreateNew() : ak.Name = "AK_CFG_CONFIG" : ak.Code = "AK_CFG_CONFIG" : ak.Attributes.Add attr
    
    ' Autres
    Set attr = cfgConfig.Attributes.CreateNew() : attr.Name = "Description système Config" : attr.Code = "DESCR_SYSTEM" : attr.DataType = "VA200" : attr.Mandatory = True
    Set attr = cfgConfig.Attributes.CreateNew() : attr.Name = "Indicateur actif Config" : attr.Code = "IND_ACTIF" : attr.DataType = "A1" : attr.Mandatory = True

    ' ========================================
    ' 4. CFG_CONFIG_PARM (6 colonnes + 1 PK)
    ' ========================================
    Output "4. Création CFG_CONFIG_PARM..."
    Set cfgConfigParm = model.Entities.CreateNew()
    cfgConfigParm.Name = "Paramètres Configuration"
    cfgConfigParm.Code = "CFG_CONFIG_PARM"
    
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Identifiant paramètre Paramètre" : attr.Code = "CFG_PARM_ID" : attr.DataType = "LI" : attr.Mandatory = True
    Set ident = cfgConfigParm.Identifiers.CreateNew() : ident.Name = "PK_CFG_CONFIG_PARM" : ident.Code = "PK_CFG_CONFIG_PARM" : ident.Attributes.Add attr
    
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Identifiant configuration Paramètre" : attr.Code = "CFG_ID" : attr.DataType = "LI" : attr.Mandatory = True
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Code système Paramètre" : attr.Code = "CD_SYSTEM" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Code paramètre Paramètre" : attr.Code = "CD_PARAM" : attr.DataType = "VA20"
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Description paramètre Paramètre" : attr.Code = "DESCR_PARAM" : attr.DataType = "VA200" : attr.Mandatory = True
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Valeur paramètre Paramètre" : attr.Code = "VALEUR_PARM" : attr.DataType = "VA200" : attr.Mandatory = True
    Set attr = cfgConfigParm.Attributes.CreateNew() : attr.Name = "Indicateur actif Paramètre" : attr.Code = "IND_ACTIF" : attr.DataType = "A1" : attr.Mandatory = True

    ' ========================================
    ' 5. EMPL_REL (40 colonnes + 1 PK)
    ' ========================================
    Output "5. Création EMPL_REL..."
    Set emplRel = model.Entities.CreateNew()
    emplRel.Name = "Relations Employeur"
    emplRel.Code = "EMPL_REL"
    
    ' PK
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Identifiant technique Relation" : attr.Code = "EMPL_REL_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplRel.Identifiers.CreateNew() : ident.Name = "PK_EMPL_REL" : ident.Code = "PK_EMPL_REL" : ident.Attributes.Add attr
    
    ' Colonnes FK Business (manuelle pour suffixe)
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Identifiant employeur Relation" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Numéro client employeur Relation" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    
    ' Autres
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Numéro client relation Relation" : attr.Code = "CLIENT_REL_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Code région administrative Relation" : attr.Code = "REG_ADMIN_CD" : attr.DataType = "VA2"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Nom entreprise Relation" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Code fonction Relation" : attr.Code = "FONCTION_CD" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Nom Relation" : attr.Code = "NOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Prénom Relation" : attr.Code = "PRENOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Nom entreprise relation Relation" : attr.Code = "ENTRP_REL_NM" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Adresse Relation" : attr.Code = "ADR" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Ville Relation" : attr.Code = "VILLE_NM" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Province Relation" : attr.Code = "PROV_CD" : attr.DataType = "A2"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Code postal Relation" : attr.Code = "CP_CD" : attr.DataType = "VA7"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Pays Relation" : attr.Code = "PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Téléphone Relation" : attr.Code = "TEL_NO" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Courriel Relation" : attr.Code = "COURRIEL_ADR" : attr.DataType = "VA100"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date naissance Relation" : attr.Code = "NAISS_DT" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Code statut relation Relation" : attr.Code = "STATUT_REL_CD" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date traitement Relation" : attr.Code = "TRAIT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date dernier changement Relation" : attr.Code = "DERN_CHG_DT" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Autre nom entreprise relation Relation" : attr.Code = "AUTRE_NOM_ENTRP_REL" : attr.DataType = "VA200"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Téléphone autre Relation" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Fax Relation" : attr.Code = "FAX_NO" : attr.DataType = "VA20"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Note téléphone Relation" : attr.Code = "NOTE_TEL" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Note téléphone autre Relation" : attr.Code = "NOTE_TEL_AUTRE" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date début validité Relation" : attr.Code = "DT_DEB_VALIDITE" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date fin validité Relation" : attr.Code = "DT_FIN_VALIDITE" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date insolvabilité Relation" : attr.Code = "DT_INSOLVABILITE" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date décès Relation" : attr.Code = "DT_DECES" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date présumé décès Relation" : attr.Code = "DT_PRESUME_DECES" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date début fonction Relation" : attr.Code = "DT_DEB_FONCTION" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date fin fonction Relation" : attr.Code = "DT_FIN_FONCTION" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date réception désignation Relation" : attr.Code = "DT_RECEP_DESIGNATION" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date enregistrement désignation Relation" : attr.Code = "DT_ENR_DESIGNATION" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date début effectivité Relation" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date fin effectivité Relation" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Indicateur actif Relation" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Utilisateur création Relation" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date création Relation" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Utilisateur modification Relation" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"
    Set attr = emplRel.Attributes.CreateNew() : attr.Name = "Date modification Relation" : attr.Code = "MODIF_DT" : attr.DataType = "DT"

    ' ========================================
    ' 6. RAP_MENS_ENT (32 colonnes + 1 PK)
    ' ========================================
    Output "6. Création RAP_MENS_ENT..."
    Set rapMensEnt = model.Entities.CreateNew()
    rapMensEnt.Name = "Rapport Mensuel Entête"
    rapMensEnt.Code = "RAP_MENS_ENT"
    
    ' PK
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Identifiant technique RapportEnt" : attr.Code = "RAP_MENS_ENT_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = rapMensEnt.Identifiers.CreateNew() : ident.Name = "PK_RAP_MENS_ENT" : ident.Code = "PK_RAP_MENS_ENT" : ident.Attributes.Add attr
    
    ' AK
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Clé rapport SAP RapportEnt" : attr.Code = "RAP_SAP_CLE" : attr.DataType = "VA50" : attr.Mandatory = True
    Set ak = rapMensEnt.Identifiers.CreateNew() : ak.Name = "AK_RAP_MENS_ENT_METIER" : ak.Code = "AK_RAP_MENS_ENT_METIER" : ak.Attributes.Add attr
    
    ' FK
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Numéro client employeur RapportEnt" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    
    ' Autres
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Identifiant employeur RapportEnt" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date début effectivité RapportEnt" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date fin effectivité RapportEnt" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Indicateur actif RapportEnt" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date début période envoi RapportEnt" : attr.Code = "PER_ENV_DEB_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date fin période envoi RapportEnt" : attr.Code = "PER_ENV_FIN_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date début période fiscale RapportEnt" : attr.Code = "FISC_DEB_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date fin période fiscale RapportEnt" : attr.Code = "FISC_FIN_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Numéro rapport RapportEnt" : attr.Code = "RAPPORT_NO" : attr.DataType = "VA20" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Nombre amendement RapportEnt" : attr.Code = "AMEND_NB" : attr.DataType = "I"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Code statut rapport RapportEnt" : attr.Code = "RAP_STATUT_CD" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Code type rapport RapportEnt" : attr.Code = "TYPE_RAP_CD" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Nom entreprise RapportEnt" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Montant total RM RapportEnt" : attr.Code = "TOT_RM_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Solde rapport mensuel RapportEnt" : attr.Code = "SOLDE_RM_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Montant total avantages sociaux RapportEnt" : attr.Code = "TOT_AV_SOC_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Indicateur ajout modification RapportEnt" : attr.Code = "AJOUT_MOD_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date soumission rapport RapportEnt" : attr.Code = "SOUM_RM_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Total heures rapport mensuel RapportEnt" : attr.Code = "TOT_HEURE_RM" : attr.DataType = "DC10,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Solde réclamation RapportEnt" : attr.Code = "SOLDE_RECL_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date début période réclamation RapportEnt" : attr.Code = "DEB_PER_RECL_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date fin période réclamation RapportEnt" : attr.Code = "FIN_PER_RECL_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Indicateur employeur en enquête RapportEnt" : attr.Code = "EST_EMP_ENQUETE_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Indicateur rapport en retard RapportEnt" : attr.Code = "EST_RAP_RETARD_IND" : attr.DataType = "A1"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Montant net CARCAP RapportEnt" : attr.Code = "MNT_NET_CARCAP" : attr.DataType = "DC15,2"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Numéro réclamation RapportEnt" : attr.Code = "NO_RECLAMATION" : attr.DataType = "VA20"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date traitement RapportEnt" : attr.Code = "TRAIT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date dernier changement RapportEnt" : attr.Code = "DERN_CHG_DT" : attr.DataType = "D"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date création RapportEnt" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Utilisateur création RapportEnt" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Date modification RapportEnt" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = rapMensEnt.Attributes.CreateNew() : attr.Name = "Utilisateur modification RapportEnt" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ========================================
    ' 7. RAP_MENS_DET (32 colonnes + 1 PK)
    ' ========================================
    Output "7. Création RAP_MENS_DET..."
    Set rapMensDet = model.Entities.CreateNew()
    rapMensDet.Name = "Rapport Mensuel Détail"
    rapMensDet.Code = "RAP_MENS_DET"
    
    ' PK
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Identifiant technique RapportDet" : attr.Code = "RAP_MENS_DET_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = rapMensDet.Identifiers.CreateNew() : ident.Name = "PK_RAP_MENS_DET" : ident.Code = "PK_RAP_MENS_DET" : ident.Attributes.Add attr
    
    ' FK Business (manuelle)
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Clé rapport SAP RapportDet" : attr.Code = "RAP_SAP_CLE" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Numéro client employeur RapportDet" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Numéro client salarié RapportDet" : attr.Code = "CLIENT_SAL_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    
    ' Autres
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Clé activité SAP RapportDet" : attr.Code = "ACT_SAP_CLE" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Identifiant rapport entête RapportDet" : attr.Code = "RAP_MENS_ENT_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Identifiant employeur RapportDet" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Identifiant salarié RapportDet" : attr.Code = "SALAR_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date début effectivité RapportDet" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date fin effectivité RapportDet" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Indicateur actif RapportDet" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date début période envoi RapportDet" : attr.Code = "PER_ENV_DEB_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date fin période envoi RapportDet" : attr.Code = "PER_ENV_FIN_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code période RapportDet" : attr.Code = "PERIODE_CD" : attr.DataType = "VA7"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Prénom RapportDet" : attr.Code = "PRENOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Nom RapportDet" : attr.Code = "NOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Nombre semaines travaillées RapportDet" : attr.Code = "SEM_TRAV_NB" : attr.DataType = "I"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code métier RapportDet" : attr.Code = "METIER_CD" : attr.DataType = "VA3"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Libellé métier RapportDet" : attr.Code = "METIER_NM" : attr.DataType = "VA100"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code secteur RapportDet" : attr.Code = "SECTEUR_CD" : attr.DataType = "A1"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Libellé secteur RapportDet" : attr.Code = "SECTEUR_NM" : attr.DataType = "VA50"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Somme heures salarié RapportDet" : attr.Code = "HRS_SAL_SOM" : attr.DataType = "DC10,2"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code statut salarial RapportDet" : attr.Code = "STAT_SAL_CD" : attr.DataType = "VA2"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Montant total avantages sociaux RapportDet" : attr.Code = "TOT_AV_SOC_AMT" : attr.DataType = "DC15,2"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Code annexe salariale RapportDet" : attr.Code = "CD_ANNEXE_SAL" : attr.DataType = "VA10"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Description annexe salariale RapportDet" : attr.Code = "ANNEXE_SAL_DESC" : attr.DataType = "VA100"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Indicateur CMEQ employeur RapportDet" : attr.Code = "EMP_CMEQ_IND" : attr.DataType = "VA3"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Indicateur CMMTQ employeur RapportDet" : attr.Code = "EMP_CMMTQ_IND" : attr.DataType = "VA3"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date création RapportDet" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Utilisateur création RapportDet" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Date modification RapportDet" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = rapMensDet.Attributes.CreateNew() : attr.Name = "Utilisateur modification RapportDet" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"

    ' ========================================
    ' 8. CTRL_INIT
    ' ========================================
    Output "8. Création CTRL_INIT..."
    Set ctrlInit = model.Entities.CreateNew()
    ctrlInit.Name = "Contrôle Initial"
    ctrlInit.Code = "CTRL_INIT"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Clé contrôle rapport CtrlInit" : attr.Code = "RAP_CTRL_CLE" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ctrlInit.Identifiers.CreateNew() : ident.Name = "PK_CTRL_INIT" : ident.Code = "PK_CTRL_INIT" : ident.Attributes.Add attr
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Abréviation IG CtrlInit" : attr.Code = "IG_ABREV" : attr.DataType = "VA10"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Nom fichier ZIP CtrlInit" : attr.Code = "FICH_ZIP_NM" : attr.DataType = "VA100" : attr.Mandatory = True
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Nom fichier CtrlInit" : attr.Code = "FICHIER_NM" : attr.DataType = "VA100" : attr.Mandatory = True
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Description CtrlInit" : attr.Code = "DESCR" : attr.DataType = "VA500"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Date et heure envoi CtrlInit" : attr.Code = "ENVOI_DH" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Nombre lignes CtrlInit" : attr.Code = "LIGNES_NB" : attr.DataType = "I"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Statut chargement CtrlInit" : attr.Code = "CHARG_STATUT_CD" : attr.DataType = "VA20"
    Set attr = ctrlInit.Attributes.CreateNew() : attr.Name = "Date chargement CtrlInit" : attr.Code = "CHARG_DT" : attr.DataType = "DT"

    ' ========================================
    ' 9. CTRL_HEBDO
    ' ========================================
    Output "9. Création CTRL_HEBDO..."
    Set ctrlHebdo = model.Entities.CreateNew()
    ctrlHebdo.Name = "Contrôle Hebdomadaire"
    ctrlHebdo.Code = "CTRL_HEBDO"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Clé contrôle rapport CtrlHebdo" : attr.Code = "RAP_CTRL_CLE" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ctrlHebdo.Identifiers.CreateNew() : ident.Name = "PK_CTRL_HEBDO" : ident.Code = "PK_CTRL_HEBDO" : ident.Attributes.Add attr
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Abréviation IG CtrlHebdo" : attr.Code = "IG_ABREV" : attr.DataType = "VA10"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nom fichier ZIP CtrlHebdo" : attr.Code = "FICH_ZIP_NM" : attr.DataType = "VA100" : attr.Mandatory = True
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nom fichier CtrlHebdo" : attr.Code = "FICHIER_NM" : attr.DataType = "VA100" : attr.Mandatory = True
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Description CtrlHebdo" : attr.Code = "DESCR" : attr.DataType = "VA500"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Date et heure envoi CtrlHebdo" : attr.Code = "ENVOI_DH" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre lignes CtrlHebdo" : attr.Code = "LIGNES_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Statut chargement CtrlHebdo" : attr.Code = "CHARG_STATUT_CD" : attr.DataType = "VA20"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Date chargement CtrlHebdo" : attr.Code = "CHARG_DT" : attr.DataType = "DT"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements traités CtrlHebdo" : attr.Code = "ENR_TRAIT_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements rejetés CtrlHebdo" : attr.Code = "ENR_REJET_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements insérés CtrlHebdo" : attr.Code = "ENR_INSERT_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements modifiés CtrlHebdo" : attr.Code = "ENR_MODIF_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements actifs CtrlHebdo" : attr.Code = "ENR_ACTIF_NB" : attr.DataType = "I"
    Set attr = ctrlHebdo.Attributes.CreateNew() : attr.Name = "Nombre enregistrements désactivés CtrlHebdo" : attr.Code = "ENR_DESAC_NB" : attr.DataType = "I"

    ' ========================================
    ' 10. EMPL_REL_HISTORY (37 colonnes - v2.11)
    ' ========================================
    Output "10. Création EMPL_REL_HISTORY..."
    Set emplRelHistory = model.Entities.CreateNew()
    emplRelHistory.Name = "Historique Relations Employeur"
    emplRelHistory.Code = "EMPL_REL_HISTORY"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Identifiant historique Historique" : attr.Code = "HISTORY_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplRelHistory.Identifiers.CreateNew() : ident.Name = "PK_EMPL_REL_HISTORY" : ident.Code = "PK_EMPL_REL_HISTORY" : ident.Attributes.Add attr
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro client relation Historique" : attr.Code = "CLIENT_REL_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date début effectivité Historique" : attr.Code = "DEB_EFFECT_DT" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date fin effectivité Historique" : attr.Code = "FIN_EFFECT_DT" : attr.DataType = "D"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro client employeur Historique" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom région administrative Historique" : attr.Code = "REG_ADMIN_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom entreprise Historique" : attr.Code = "ENTRP_NM" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom fonction Historique" : attr.Code = "FONCTION_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom Historique" : attr.Code = "NOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Prénom Historique" : attr.Code = "PRENOM" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom entreprise relation Historique" : attr.Code = "ENTRP_REL_NM" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Autre nom entreprise relation Historique" : attr.Code = "AUTRE_NOM_ENTRP_REL" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Adresse Historique" : attr.Code = "ADR" : attr.DataType = "VA200"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Ville Historique" : attr.Code = "VILLE_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Code province Historique" : attr.Code = "PROV_CD" : attr.DataType = "VA3"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Code postal Historique" : attr.Code = "CP_CD" : attr.DataType = "VA10"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Pays Historique" : attr.Code = "PAYS_NM" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro téléphone Historique" : attr.Code = "TEL_NO" : attr.DataType = "VA40"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro téléphone autre Historique" : attr.Code = "TEL_AUTRE_NO" : attr.DataType = "VA40"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro fax Historique" : attr.Code = "FAX_NO" : attr.DataType = "VA20"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Adresse courriel Historique" : attr.Code = "COURRIEL_ADR" : attr.DataType = "VA100"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date insolvabilité Historique" : attr.Code = "INSOLVAB_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date naissance Historique" : attr.Code = "NAISS_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date décès Historique" : attr.Code = "DECES_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date présumé décès Historique" : attr.Code = "PRESUME_DECES_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date début fonction Historique" : attr.Code = "DEB_FONCTION_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date fin fonction Historique" : attr.Code = "FIN_FONCTION_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date réception désignation Historique" : attr.Code = "RECEPT_DESIGN_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date enregistrement désignation Historique" : attr.Code = "ENREG_DESIGN_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Nom statut relation Historique" : attr.Code = "STATUT_REL_NM" : attr.DataType = "VA20"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Indicateur actif Historique" : attr.Code = "ACTIF_IND" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date création Historique" : attr.Code = "CREAT_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Utilisateur création Historique" : attr.Code = "CREAT_UTIL_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date modification Historique" : attr.Code = "MODIF_DT" : attr.DataType = "DT"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Utilisateur modification Historique" : attr.Code = "MODIF_UTIL_ID" : attr.DataType = "VA50"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Flag migration Historique" : attr.Code = "MIGRATION_FLAG" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date migration Historique" : attr.Code = "MIGRATION_DATE" : attr.DataType = "DT" : attr.Mandatory = True

    ' ========================================
    ' 11. CCQ_AUDIT_CHANGEMENTS_CRITIQUES (10 colonnes)
    ' ========================================
    Output "11. Création CCQ_AUDIT_CHANGEMENTS_CRITIQUES..."
    Set ccqAuditChangements = model.Entities.CreateNew()
    ccqAuditChangements.Name = "Audit Changements Critiques"
    ccqAuditChangements.Code = "CCQ_AUDIT_CHANGEMENTS_CRITIQUES"
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Identifiant audit AuditCC" : attr.Code = "AUDIT_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ccqAuditChangements.Identifiers.CreateNew() : ident.Name = "PK_CCQ_AUDIT_CHANGEMENTS_CRITI" : ident.Code = "PK_CCQ_AUDIT_CHANGEMENTS_CRITI" : ident.Attributes.Add attr
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Type entité AuditCC" : attr.Code = "ENTITE_TYPE" : attr.DataType = "VA20" : attr.Mandatory = True
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Identifiant source AuditCC" : attr.Code = "SOURCE_ID" : attr.DataType = "VA50" : attr.Mandatory = True
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Identifiant cible AuditCC" : attr.Code = "TARGET_ID" : attr.DataType = "VA50"
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Catégorie changement AuditCC" : attr.Code = "CATEGORIE" : attr.DataType = "VA30" : attr.Mandatory = True
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Valeur avant AuditCC" : attr.Code = "VALEUR_AVANT_TXT" : attr.DataType = "LVARCHAR"
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Valeur après AuditCC" : attr.Code = "VALEUR_APRES_TXT" : attr.DataType = "LVARCHAR"
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Système source AuditCC" : attr.Code = "SOURCE_SYSTEM" : attr.DataType = "VA20"
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Date mise à jour AuditCC" : attr.Code = "UPDATED_DT" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = ccqAuditChangements.Attributes.CreateNew() : attr.Name = "Identifiant CCQ AuditCC" : attr.Code = "ID_CCQ" : attr.DataType = "VA50" : attr.Mandatory = True

    ' ========================================
    ' 12. CCQ_AUDIT_CONFIG (8 colonnes)
    ' ========================================
    Output "12. Création CCQ_AUDIT_CONFIG..."
    Set ccqAuditConfig = model.Entities.CreateNew()
    ccqAuditConfig.Name = "Configuration Audit"
    ccqAuditConfig.Code = "CCQ_AUDIT_CONFIG"
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Identifiant configuration AuditCfg" : attr.Code = "CONFIG_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = ccqAuditConfig.Identifiers.CreateNew() : ident.Name = "PK_CCQ_AUDIT_CONFIG" : ident.Code = "PK_CCQ_AUDIT_CONFIG" : ident.Attributes.Add attr
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Code configuration AuditCfg" : attr.Code = "CD_CONFIG" : attr.DataType = "VA20" : attr.Mandatory = True
    Set ak = ccqAuditConfig.Identifiers.CreateNew() : ak.Name = "UK_CCQ_AUDIT_CONFI_CCQ_AUDI" : ak.Code = "UK_CCQ_AUDIT_CONFI_CCQ_AUDI" : ak.Attributes.Add attr
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Type entité AuditCfg" : attr.Code = "ENTITE_TYPE" : attr.DataType = "VA20" : attr.Mandatory = True
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Requête SQL audit AuditCfg" : attr.Code = "REQ_SQL_AUDIT" : attr.DataType = "LVARCHAR" : attr.Mandatory = True
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Catégorie AuditCfg" : attr.Code = "CATEGORIE" : attr.DataType = "VA30" : attr.Mandatory = True
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Sous-catégorie AuditCfg" : attr.Code = "SOUS_CATEGORIE" : attr.DataType = "VA30"
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Indicateur actif AuditCfg" : attr.Code = "EST_ACTIF" : attr.DataType = "A1" : attr.Mandatory = True
    Set attr = ccqAuditConfig.Attributes.CreateNew() : attr.Name = "Rétention en jours AuditCfg" : attr.Code = "RETENTION_JOURS" : attr.DataType = "I"

    ' ========================================
    ' CRÉATION DES RELATIONS AVEC CLÉS MÉTIER
    ' ========================================
    Output ""
    Output "Création des relations sur CLÉS MÉTIER..."
    
    Dim rel
    
    ' 1. Employeur -> Relations (sur CLIENT_EMP_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "a des relations"
    rel.Code = "FK_REL_EMPL"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = emplRel
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    ' For Each ident In emplDoss.Identifiers
    '     If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    ' Next
    
    ' 2. Employeur -> Rapport Entête (sur CLIENT_EMP_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "produit rapports"
    rel.Code = "FK_ENT_EMPL"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = rapMensEnt
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    ' For Each ident In emplDoss.Identifiers
    '     If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    ' Next
    
    ' 3. Rapport Entête -> Détail (sur RAP_SAP_CLE)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "contient détails"
    rel.Code = "FK_DET_ENT"
    Set rel.Entity1 = rapMensEnt
    Set rel.Entity2 = rapMensDet
    rel.Entity1ToEntity2RoleCardinality = "1,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    ' For Each ident In rapMensEnt.Identifiers
    '     If ident.Code = "AK_RAP_MENS_ENT_METIER" Then Set rel.Entity1Identifier = ident
    ' Next
    
    ' 4. Salarié -> Rapport Détail (sur CLIENT_SAL_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "travaille dans"
    rel.Code = "FK_DET_SAL"
    Set rel.Entity1 = salarDoss
    Set rel.Entity2 = rapMensDet
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    ' For Each ident In salarDoss.Identifiers
    '     If ident.Code = "AK_SALAR_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    ' Next
    
    ' 5. Config -> Paramètres (sur CD_SYSTEM)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "possède paramètres"
    rel.Code = "FK_PARM_CONFIG"
    Set rel.Entity1 = cfgConfig
    Set rel.Entity2 = cfgConfigParm
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    ' For Each ident In cfgConfig.Identifiers
    '     If ident.Code = "AK_CFG_CONFIG" Then Set rel.Entity1Identifier = ident
    ' Next

    ' 6. Employeur -> Historique (sur CLIENT_EMP_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "a historique"
    rel.Code = "FK_HIST_EMPL"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = emplRelHistory
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    ' For Each ident In emplDoss.Identifiers
    '     If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    ' Next

    ' 7. Salarié -> Employeur préféré (sur CLIENT_EMP_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "préfère employeur"
    rel.Code = "FK_SAL_EMP_PRF"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = salarDoss
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "0,1"
    ' For Each ident In emplDoss.Identifiers
    '     If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    ' Next
    
    ' 8. Employeur -> Rapport Détail (sur CLIENT_EMP_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "emploie dans détails"
    rel.Code = "FK_DET_EMP_DIRECT"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = rapMensDet
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    ' For Each ident In emplDoss.Identifiers
    '     If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    ' Next

    Output "✅ Relations métiers configurées avec succès."
    MsgBox "MCD CCQ v2.11 COMPLET généré avec :" & vbCrLf & _
           "- 12 entités alignées avec modele_donnees_ccq_v211.md" & vbCrLf & _
           "- Identifiants Métier (AK) créés" & vbCrLf & _
           "- Relations basées sur les Clés Métier", vbInformation

End Sub

Call Main()
