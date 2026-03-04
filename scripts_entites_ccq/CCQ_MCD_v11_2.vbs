'==============================================================================
' Script VBScript PowerDesigner - MCD CCQ v11.2
' Alignement sur CCQ_DDL et correctifs suite courriel CCQ du 12-fevrier-2026
' Date : 2026-02-13
' Auteur : Eliot Alanmanou - Architecte de donnees
'==============================================================================
' MODIFICATIONS v11.2 (suite courriel Beatrice Le Boulenge - CCQ)
' - RM02 : AMEND_NB retire de la cle UK (UK = RAP_SAP_CLE + DEB_EFFECT_DT)
' - AJOUT_MOD_IND : A=Ajout (nouveau), M=Modification (deja recu)
' - Doublons DCSAL01 regles depuis 3-fevrier-2026
' - Doublons RM02 regles a partir du 24-fevrier-2026
' - Pour historisation : Prendre AMEND_NB MAX = derniere version
'==============================================================================

Option Explicit

Dim model, entity
Dim xPos, yPos

Set model = ActiveModel
If model Is Nothing Or Not model.IsKindOf(PdCDM.cls_Model) Then
   MsgBox "Ce script doit etre execute dans un Modele Conceptuel de Donnees (MCD).", vbCritical
Else
   ' === DEBUT DU SCRIPT ===
   
   ' Desactiver le mode interactif pour eviter les verifications
   Dim oldInteractive
   oldInteractive = InteractiveMode
   InteractiveMode = im_Batch
   
   model.Name = "CCQ - Modele Conceptuel v11.2"
   model.Code = "CCQ_MCD_V11_2"
   
   ' Desactiver verifications strictes de normalisation
   On Error Resume Next
   model.SetModelOption "EntityAttributeUniqueName", False
   model.SetModelOption "EntityAttributeUniqueCode", False
   model.SetModelOption "EnableReuseCheck", False
   model.SetModelOption "CheckNamingConventions", False
   On Error Goto 0
   
   xPos = 1000
   yPos = 1000
   
   '==============================================================================
   ' NETTOYAGE : Supprimer toutes les entites existantes
   '==============================================================================
   MsgBox "Suppression des entites existantes...", vbInformation, "Nettoyage"
   
   Dim entitiesToDelete
   Set entitiesToDelete = CreateObject("Scripting.Dictionary")
   
   ' Lister toutes les entites a supprimer
   Dim ent
   For Each ent In model.Entities
      entitiesToDelete.Add ent.Code, ent
   Next
   
   ' Supprimer les entites
   Dim entKey
   For Each entKey In entitiesToDelete.Keys
      entitiesToDelete(entKey).Delete
   Next
   
   MsgBox "Nettoyage termine. " & entitiesToDelete.Count & " entites supprimees.", vbInformation, "Nettoyage"
   
   '==============================================================================
   ' CREATION DES ENTITES
   '==============================================================================

'--- CCQ.CCQ_AUDIT_CHANGEMENTS_CRITIQUES (10 colonnes) ---
Set entity = CreateEntity("Ccq Audit Changements Critiques", "CCQ_AUDIT_CHANGEMENTS_CRITIQUES", "Schema CCQ - Audit des changements critiques")
CreateAttribute entity, "AUDIT_ID", "AUDIT_ID", "I", "", True, False, ""
CreateAttribute entity, "ENTITE_TYPE", "ENTITE_TYPE", "AN", "20", True, False, ""
CreateAttribute entity, "SOURCE_ID", "SOURCE_ID", "AN", "50", True, False, ""
CreateAttribute entity, "TARGET_ID", "TARGET_ID", "AN", "50", False, False, ""
CreateAttribute entity, "CATEGORIE", "CATEGORIE", "AN", "30", True, False, ""
CreateAttribute entity, "VALEUR_AVANT_TXT", "VALEUR_AVANT_TXT", "TXT", "", False, False, ""
CreateAttribute entity, "VALEUR_APRES_TXT", "VALEUR_APRES_TXT", "TXT", "", False, False, ""
CreateAttribute entity, "SOURCE_SYSTEM", "SOURCE_SYSTEM", "AN", "20", False, False, ""
CreateAttribute entity, "UPDATED_DT", "UPDATED_DT", "DT", "", True, False, ""
CreateAttribute entity, "ID_CCQ", "ID_CCQ", "AN", "50", True, False, ""
CreatePrimaryKey entity, "PK_CCQ_AUDIT_CHANGEMENTS_CRITIQUES", "AUDIT_ID"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000

'--- CCQ.CCQ_AUDIT_CONFIG (8 colonnes) ---
Set entity = CreateEntity("Ccq Audit Config", "CCQ_AUDIT_CONFIG", "Schema CCQ - Configuration des audits")
CreateAttribute entity, "CONFIG_ID", "CONFIG_ID", "I", "", True, False, ""
CreateAttribute entity, "CD_CONFIG", "CD_CONFIG", "AN", "20", True, False, ""
CreateAttribute entity, "ENTITE_TYPE", "ENTITE_TYPE", "AN", "20", True, False, ""
CreateAttribute entity, "REQ_SQL_AUDIT", "REQ_SQL_AUDIT", "TXT", "", True, False, ""
CreateAttribute entity, "CATEGORIE", "CATEGORIE", "AN", "30", True, False, ""
CreateAttribute entity, "SOUS_CATEGORIE", "SOUS_CATEGORIE", "AN", "30", False, False, ""
CreateAttribute entity, "EST_ACTIF", "EST_ACTIF", "A", "1", True, False, ""
CreateAttribute entity, "RETENTION_JOURS", "RETENTION_JOURS", "I", "", False, False, ""
CreatePrimaryKey entity, "PK_CCQ_AUDIT_CONFIG", "CONFIG_ID"
CreateUniqueKey entity, "UK_CCQ_AUDIT_CONFIG", "CD_CONFIG"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000

'--- CCQ.CTRL_HEBDO (15 colonnes) ---
Set entity = CreateEntity("Ctrl Hebdo", "CTRL_HEBDO", "Schema CCQ - Controle fichiers hebdomadaires")
CreateAttribute entity, "RAP_CTRL_CLE", "RAP_CTRL_CLE", "I", "", True, False, ""
CreateAttribute entity, "IG_ABREV", "IG_ABREV", "AN", "10", False, False, ""
CreateAttribute entity, "FICH_ZIP_NM", "FICH_ZIP_NM", "AN", "100", True, False, ""
CreateAttribute entity, "FICHIER_NM", "FICHIER_NM", "AN", "100", True, False, ""
CreateAttribute entity, "DESCR", "DESCR", "AN", "500", False, False, ""
CreateAttribute entity, "ENVOI_DH", "ENVOI_DH", "DT", "", True, False, ""
CreateAttribute entity, "LIGNES_NB", "LIGNES_NB", "I", "", False, False, ""
CreateAttribute entity, "CHARG_STATUT_CD", "CHARG_STATUT_CD", "AN", "20", False, False, ""
CreateAttribute entity, "CHARG_DT", "CHARG_DT", "D", "", False, False, ""
CreateAttribute entity, "ENR_TRAIT_NB", "ENR_TRAIT_NB", "I", "", False, False, ""
CreateAttribute entity, "ENR_REJET_NB", "ENR_REJET_NB", "I", "", False, False, ""
CreateAttribute entity, "ENR_INSERT_NB", "ENR_INSERT_NB", "I", "", False, False, ""
CreateAttribute entity, "ENR_MODIF_NB", "ENR_MODIF_NB", "I", "", False, False, ""
CreateAttribute entity, "ENR_ACTIF_NB", "ENR_ACTIF_NB", "I", "", False, False, ""
CreateAttribute entity, "ENR_DESAC_NB", "ENR_DESAC_NB", "I", "", False, False, ""
CreatePrimaryKey entity, "PK_CTRL_HEBDO", "RAP_CTRL_CLE"
CreateUniqueKey entity, "UK_CTRL_HEBDO", "FICH_ZIP_NM,FICHIER_NM"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000

'--- CCQ.CTRL_INIT (9 colonnes) ---
Set entity = CreateEntity("Ctrl Init", "CTRL_INIT", "Schema CCQ - Controle fichiers initiaux")
CreateAttribute entity, "RAP_CTRL_CLE", "RAP_CTRL_CLE", "I", "", True, False, ""
CreateAttribute entity, "IG_ABREV", "IG_ABREV", "AN", "10", False, False, ""
CreateAttribute entity, "FICH_ZIP_NM", "FICH_ZIP_NM", "AN", "100", True, False, ""
CreateAttribute entity, "FICHIER_NM", "FICHIER_NM", "AN", "100", True, False, ""
CreateAttribute entity, "DESCR", "DESCR", "AN", "500", False, False, ""
CreateAttribute entity, "ENVOI_DH", "ENVOI_DH", "DT", "", True, False, ""
CreateAttribute entity, "LIGNES_NB", "LIGNES_NB", "I", "", False, False, ""
CreateAttribute entity, "CHARG_STATUT_CD", "CHARG_STATUT_CD", "AN", "20", False, False, ""
CreateAttribute entity, "CHARG_DT", "CHARG_DT", "D", "", False, False, ""
CreatePrimaryKey entity, "PK_CTRL_INIT", "RAP_CTRL_CLE"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000
xPos = 1000
yPos = yPos + 4000

'--- CCQ.EMPL_DOSS (58 colonnes) ---
Set entity = CreateEntity("Empl Doss", "EMPL_DOSS", "Schema CCQ - Dossier employeur SCD Type 2")
CreateAttribute entity, "EMPL_DOSS_ID", "EMPL_DOSS_ID", "I", "", True, False, ""
CreateAttribute entity, "CLIENT_EMP_NO", "CLIENT_EMP_NO", "AN", "10", True, False, ""
CreateAttribute entity, "DEB_EFFECT_DT", "DEB_EFFECT_DT", "D", "", True, False, ""
CreateAttribute entity, "FIN_EFFECT_DT", "FIN_EFFECT_DT", "D", "", False, False, ""
CreateAttribute entity, "REG_ADMIN_CD", "REG_ADMIN_CD", "AN", "2", False, False, ""
CreateAttribute entity, "CMEQ_IND", "CMEQ_IND", "A", "1", False, False, ""
CreateAttribute entity, "CMMTQ_IND", "CMMTQ_IND", "A", "1", False, False, ""
CreateAttribute entity, "INTERV_NO", "INTERV_NO", "AN", "10", False, False, ""
CreateAttribute entity, "ENTRP_NM", "ENTRP_NM", "AN", "200", True, False, ""
CreateAttribute entity, "ENTRP_AUTRE_NM", "ENTRP_AUTRE_NM", "AN", "200", False, False, ""
CreateAttribute entity, "AFF_ADR", "AFF_ADR", "AN", "200", False, False, ""
CreateAttribute entity, "AFF_VILLE_NM", "AFF_VILLE_NM", "AN", "100", False, False, ""
CreateAttribute entity, "AFF_PROV_CD", "AFF_PROV_CD", "A", "2", False, False, ""
CreateAttribute entity, "AFF_CP_CD", "AFF_CP_CD", "AN", "10", False, False, ""
CreateAttribute entity, "AFF_PAYS_NM", "AFF_PAYS_NM", "AN", "50", False, False, ""
CreateAttribute entity, "CORR_ADR", "CORR_ADR", "AN", "200", False, False, ""
CreateAttribute entity, "CORR_VILLE_NM", "CORR_VILLE_NM", "AN", "100", False, False, ""
CreateAttribute entity, "CORR_PROV_CD", "CORR_PROV_CD", "A", "2", False, False, ""
CreateAttribute entity, "CORR_CP_CD", "CORR_CP_CD", "AN", "10", False, False, ""
CreateAttribute entity, "CORR_PAYS_NM", "CORR_PAYS_NM", "AN", "50", False, False, ""
CreateAttribute entity, "BUR_QC_ADR", "BUR_QC_ADR", "AN", "200", False, False, ""
CreateAttribute entity, "BUR_QC_VILLE_NM", "BUR_QC_VILLE_NM", "AN", "50", False, False, ""
CreateAttribute entity, "BUR_QC_PROV_CD", "BUR_QC_PROV_CD", "A", "2", False, False, ""
CreateAttribute entity, "BUR_QC_CP_CD", "BUR_QC_CP_CD", "AN", "10", False, False, ""
CreateAttribute entity, "BUR_QC_PAYS_NM", "BUR_QC_PAYS_NM", "AN", "50", False, False, ""
CreateAttribute entity, "LIEU_VERIF_REG", "LIEU_VERIF_REG", "AN", "50", False, False, ""
CreateAttribute entity, "BLOC_AFF_ADR_CD", "BLOC_AFF_ADR_CD", "AN", "10", False, False, ""
CreateAttribute entity, "BLOC_CORR_ADR_CD", "BLOC_CORR_ADR_CD", "AN", "10", False, False, ""
CreateAttribute entity, "BLOC_BUR_ADR_CD", "BLOC_BUR_ADR_CD", "AN", "10", False, False, ""
CreateAttribute entity, "TEL_PRINC_NO", "TEL_PRINC_NO", "AN", "40", False, False, ""
CreateAttribute entity, "TEL_AUTRE_NO", "TEL_AUTRE_NO", "AN", "40", False, False, ""
CreateAttribute entity, "FAX_NO", "FAX_NO", "AN", "20", False, False, ""
CreateAttribute entity, "COURRIEL_ADR", "COURRIEL_ADR", "AN", "100", False, False, ""
CreateAttribute entity, "DATE_ENREG", "DATE_ENREG", "DT", "", False, False, ""
CreateAttribute entity, "DATE_DEB_TRAV", "DATE_DEB_TRAV", "DT", "", False, False, ""
CreateAttribute entity, "STATUT_JUR_CD", "STATUT_JUR_CD", "AN", "50", False, False, ""
CreateAttribute entity, "STATUT_JUR_DT", "STATUT_JUR_DT", "DT", "", False, False, ""
CreateAttribute entity, "TYPE_EMP_CD", "TYPE_EMP_CD", "A", "2", False, False, ""
CreateAttribute entity, "STATUT_AFF_CD", "STATUT_AFF_CD", "AN", "20", False, False, ""
CreateAttribute entity, "STATUT_AFF_DT", "STATUT_AFF_DT", "DT", "", False, False, ""
CreateAttribute entity, "EMP_RECONNU_IND", "EMP_RECONNU_IND", "A", "1", False, False, ""
CreateAttribute entity, "NEQ_NO", "NEQ_NO", "AN", "10", False, False, ""
CreateAttribute entity, "NEQ_STATUT_CD", "NEQ_STATUT_CD", "AN", "40", False, False, ""
CreateAttribute entity, "NO_DOSSIER_RBQ", "NO_DOSSIER_RBQ", "AN", "20", False, False, ""
CreateAttribute entity, "LIC_CCQ1_TYPE", "LIC_CCQ1_TYPE", "A", "2", False, False, ""
CreateAttribute entity, "LIC_CCQ1_STATUT", "LIC_CCQ1_STATUT", "A", "1", False, False, ""
CreateAttribute entity, "LIC_CCQ2_TYPE", "LIC_CCQ2_TYPE", "A", "2", False, False, ""
CreateAttribute entity, "LIC_CCQ2_STATUT", "LIC_CCQ2_STATUT", "A", "1", False, False, ""
CreateAttribute entity, "DT_INSOLVABILITE", "DT_INSOLVABILITE", "DT", "", False, False, ""
CreateAttribute entity, "RAISON_INSOLVABILITE", "RAISON_INSOLVABILITE", "AN", "200", False, False, ""
CreateAttribute entity, "NO_EMP_ANCIEN", "NO_EMP_ANCIEN", "AN", "60", False, False, ""
CreateAttribute entity, "NO_EMP_NOUVEAU", "NO_EMP_NOUVEAU", "AN", "60", False, False, ""
CreateAttribute entity, "DERN_CHG_DT", "DERN_CHG_DT", "DT", "", False, False, ""
CreateAttribute entity, "ACTIF_IND", "ACTIF_IND", "A", "1", True, False, ""
CreateAttribute entity, "CREAT_DT", "CREAT_DT", "DT", "", True, False, ""
CreateAttribute entity, "CREAT_UTIL_ID", "CREAT_UTIL_ID", "AN", "50", True, False, ""
CreateAttribute entity, "MODIF_DT", "MODIF_DT", "DT", "", False, False, ""
CreateAttribute entity, "MODIF_UTIL_ID", "MODIF_UTIL_ID", "AN", "50", False, False, ""
CreatePrimaryKey entity, "PK_EMPL_DOSS", "EMPL_DOSS_ID"
CreateUniqueKey entity, "UK_EMPL_DOSS", "CLIENT_EMP_NO,DEB_EFFECT_DT"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000

'--- CCQ.EMPL_REL (40 colonnes) ---
' Note v11.2: Cle UK = (CLIENT_REL_NO, CLIENT_EMP_NO, FONCTION_CD, DEB_EFFECT_DT)
Set entity = CreateEntity("Empl Rel", "EMPL_REL", "Schema CCQ - Relations employeur SCD Type 2")
CreateAttribute entity, "EMPL_REL_ID", "EMPL_REL_ID", "I", "", True, False, ""
CreateAttribute entity, "CLIENT_REL_NO", "CLIENT_REL_NO", "AN", "10", True, False, ""
CreateAttribute entity, "DEB_EFFECT_DT", "DEB_EFFECT_DT", "D", "", True, False, ""
CreateAttribute entity, "CLIENT_EMP_NO", "CLIENT_EMP_NO", "AN", "10", True, False, ""
CreateAttribute entity, "FONCTION_CD", "FONCTION_CD", "AN", "50", False, False, ""
CreateAttribute entity, "FIN_EFFECT_DT", "FIN_EFFECT_DT", "D", "", False, False, ""
CreateAttribute entity, "REG_ADMIN_CD", "REG_ADMIN_CD", "AN", "2", False, False, ""
CreateAttribute entity, "ENTRP_NM", "ENTRP_NM", "AN", "200", False, False, ""
CreateAttribute entity, "NOM", "NOM", "AN", "50", True, False, ""
CreateAttribute entity, "PRENOM", "PRENOM", "AN", "50", True, False, ""
CreateAttribute entity, "NAISS_DT", "NAISS_DT", "DT", "", False, False, ""
CreateAttribute entity, "ENTRP_REL_NM", "ENTRP_REL_NM", "AN", "200", False, False, ""
CreateAttribute entity, "AUTRE_NOM_ENTRP_REL", "AUTRE_NOM_ENTRP_REL", "AN", "200", False, False, ""
CreateAttribute entity, "ADR", "ADR", "AN", "200", False, False, ""
CreateAttribute entity, "VILLE_NM", "VILLE_NM", "AN", "50", False, False, ""
CreateAttribute entity, "PROV_CD", "PROV_CD", "AN", "3", False, False, ""
CreateAttribute entity, "CP_CD", "CP_CD", "AN", "10", False, False, ""
CreateAttribute entity, "PAYS_NM", "PAYS_NM", "AN", "50", False, False, ""
CreateAttribute entity, "TEL_NO", "TEL_NO", "AN", "40", False, False, ""
CreateAttribute entity, "TEL_AUTRE_NO", "TEL_AUTRE_NO", "AN", "40", False, False, ""
CreateAttribute entity, "FAX_NO", "FAX_NO", "AN", "20", False, False, ""
CreateAttribute entity, "NOTE_TEL", "NOTE_TEL", "AN", "50", False, False, ""
CreateAttribute entity, "NOTE_TEL_AUTRE", "NOTE_TEL_AUTRE", "AN", "50", False, False, ""
CreateAttribute entity, "COURRIEL_ADR", "COURRIEL_ADR", "AN", "100", False, False, ""
CreateAttribute entity, "STATUT_REL_CD", "STATUT_REL_CD", "AN", "20", False, False, ""
CreateAttribute entity, "DERN_CHG_DT", "DERN_CHG_DT", "DT", "", False, False, ""
CreateAttribute entity, "DT_DEB_VALIDITE", "DT_DEB_VALIDITE", "DT", "", False, False, ""
CreateAttribute entity, "DT_FIN_VALIDITE", "DT_FIN_VALIDITE", "DT", "", False, False, ""
CreateAttribute entity, "DT_INSOLVABILITE", "DT_INSOLVABILITE", "DT", "", False, False, ""
CreateAttribute entity, "DT_DECES", "DT_DECES", "DT", "", False, False, ""
CreateAttribute entity, "DT_PRESUME_DECES", "DT_PRESUME_DECES", "DT", "", False, False, ""
CreateAttribute entity, "DT_DEB_FONCTION", "DT_DEB_FONCTION", "DT", "", False, False, ""
CreateAttribute entity, "DT_FIN_FONCTION", "DT_FIN_FONCTION", "DT", "", False, False, ""
CreateAttribute entity, "DT_RECEP_DESIGNATION", "DT_RECEP_DESIGNATION", "DT", "", False, False, ""
CreateAttribute entity, "DT_ENR_DESIGNATION", "DT_ENR_DESIGNATION", "DT", "", False, False, ""
CreateAttribute entity, "ACTIF_IND", "ACTIF_IND", "A", "1", True, False, ""
CreateAttribute entity, "CREAT_DT", "CREAT_DT", "DT", "", True, False, ""
CreateAttribute entity, "CREAT_UTIL_ID", "CREAT_UTIL_ID", "AN", "50", True, False, ""
CreateAttribute entity, "MODIF_DT", "MODIF_DT", "DT", "", False, False, ""
CreateAttribute entity, "MODIF_UTIL_ID", "MODIF_UTIL_ID", "AN", "50", False, False, ""
CreatePrimaryKey entity, "PK_EMPL_REL", "EMPL_REL_ID"
CreateUniqueKey entity, "UK_EMPL_REL", "CLIENT_REL_NO,CLIENT_EMP_NO,FONCTION_CD,DEB_EFFECT_DT"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000

'--- CCQ.EMPL_REL_HISTORY (37 colonnes) ---
Set entity = CreateEntity("Empl Rel History", "EMPL_REL_HISTORY", "Schema CCQ - Historique relations legacy migration")
CreateAttribute entity, "HISTORY_ID", "HISTORY_ID", "I", "", True, False, ""
CreateAttribute entity, "CLIENT_REL_NO", "CLIENT_REL_NO", "AN", "10", True, False, ""
CreateAttribute entity, "DEB_EFFECT_DT", "DEB_EFFECT_DT", "D", "", True, False, ""
CreateAttribute entity, "FIN_EFFECT_DT", "FIN_EFFECT_DT", "D", "", False, False, ""
CreateAttribute entity, "CLIENT_EMP_NO", "CLIENT_EMP_NO", "AN", "10", True, False, ""
CreateAttribute entity, "REG_ADMIN_NM", "REG_ADMIN_NM", "AN", "50", False, False, ""
CreateAttribute entity, "ENTRP_NM", "ENTRP_NM", "AN", "200", False, False, ""
CreateAttribute entity, "FONCTION_NM", "FONCTION_NM", "AN", "50", False, False, ""
CreateAttribute entity, "NOM", "NOM", "AN", "50", True, False, ""
CreateAttribute entity, "PRENOM", "PRENOM", "AN", "50", True, False, ""
CreateAttribute entity, "ENTRP_REL_NM", "ENTRP_REL_NM", "AN", "200", False, False, ""
CreateAttribute entity, "AUTRE_NOM_ENTRP_REL", "AUTRE_NOM_ENTRP_REL", "AN", "200", False, False, ""
CreateAttribute entity, "ADR", "ADR", "AN", "200", False, False, ""
CreateAttribute entity, "VILLE_NM", "VILLE_NM", "AN", "50", False, False, ""
CreateAttribute entity, "PROV_CD", "PROV_CD", "AN", "3", False, False, ""
CreateAttribute entity, "CP_CD", "CP_CD", "AN", "10", False, False, ""
CreateAttribute entity, "PAYS_NM", "PAYS_NM", "AN", "50", False, False, ""
CreateAttribute entity, "TEL_NO", "TEL_NO", "AN", "40", False, False, ""
CreateAttribute entity, "TEL_AUTRE_NO", "TEL_AUTRE_NO", "AN", "40", False, False, ""
CreateAttribute entity, "FAX_NO", "FAX_NO", "AN", "20", False, False, ""
CreateAttribute entity, "COURRIEL_ADR", "COURRIEL_ADR", "AN", "100", False, False, ""
CreateAttribute entity, "INSOLVAB_DT", "INSOLVAB_DT", "DT", "", False, False, ""
CreateAttribute entity, "NAISS_DT", "NAISS_DT", "DT", "", False, False, ""
CreateAttribute entity, "DECES_DT", "DECES_DT", "DT", "", False, False, ""
CreateAttribute entity, "PRESUME_DECES_DT", "PRESUME_DECES_DT", "DT", "", False, False, ""
CreateAttribute entity, "DEB_FONCTION_DT", "DEB_FONCTION_DT", "DT", "", False, False, ""
CreateAttribute entity, "FIN_FONCTION_DT", "FIN_FONCTION_DT", "DT", "", False, False, ""
CreateAttribute entity, "RECEPT_DESIGN_DT", "RECEPT_DESIGN_DT", "DT", "", False, False, ""
CreateAttribute entity, "ENREG_DESIGN_DT", "ENREG_DESIGN_DT", "DT", "", False, False, ""
CreateAttribute entity, "STATUT_REL_NM", "STATUT_REL_NM", "AN", "20", False, False, ""
CreateAttribute entity, "ACTIF_IND", "ACTIF_IND", "A", "1", True, False, ""
CreateAttribute entity, "CREAT_DT", "CREAT_DT", "DT", "", True, False, ""
CreateAttribute entity, "CREAT_UTIL_ID", "CREAT_UTIL_ID", "AN", "50", True, False, ""
CreateAttribute entity, "MODIF_DT", "MODIF_DT", "DT", "", False, False, ""
CreateAttribute entity, "MODIF_UTIL_ID", "MODIF_UTIL_ID", "AN", "50", False, False, ""
CreateAttribute entity, "MIGRATION_FLAG", "MIGRATION_FLAG", "A", "1", True, False, ""
CreateAttribute entity, "MIGRATION_DATE", "MIGRATION_DATE", "DT", "", True, False, ""
CreatePrimaryKey entity, "PK_EMPL_REL_HISTORY", "HISTORY_ID"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000

'--- CCQ.RAP_MENS_DET (29 colonnes) ---
' Note v11.2: RM01 envoie toujours la derniere version avec toutes les lignes de details
Set entity = CreateEntity("Rap Mens Det", "RAP_MENS_DET", "Schema CCQ - Details rapports mensuels RM01")
CreateAttribute entity, "RAP_MENS_DET_ID", "RAP_MENS_DET_ID", "I", "", True, False, ""
CreateAttribute entity, "ACT_SAP_CLE", "ACT_SAP_CLE", "AN", "50", True, False, ""
CreateAttribute entity, "DEB_EFFECT_DT", "DEB_EFFECT_DT", "D", "", True, False, ""
CreateAttribute entity, "FIN_EFFECT_DT", "FIN_EFFECT_DT", "D", "", False, False, ""
CreateAttribute entity, "RAP_SAP_CLE", "RAP_SAP_CLE", "AN", "50", True, False, ""
CreateAttribute entity, "CLIENT_EMP_NO", "CLIENT_EMP_NO", "AN", "10", True, False, ""
CreateAttribute entity, "CLIENT_SAL_NO", "CLIENT_SAL_NO", "AN", "10", True, False, ""
CreateAttribute entity, "ACTIF_IND", "ACTIF_IND", "A", "1", True, False, ""
CreateAttribute entity, "PER_ENV_DEB_DT", "PER_ENV_DEB_DT", "DT", "", True, False, ""
CreateAttribute entity, "PER_ENV_FIN_DT", "PER_ENV_FIN_DT", "DT", "", True, False, ""
CreateAttribute entity, "PERIODE_CD", "PERIODE_CD", "AN", "7", False, False, ""
CreateAttribute entity, "PRENOM", "PRENOM", "AN", "50", True, False, ""
CreateAttribute entity, "NOM", "NOM", "AN", "50", True, False, ""
CreateAttribute entity, "SEM_TRAV_NB", "SEM_TRAV_NB", "I", "", False, False, ""
CreateAttribute entity, "METIER_CD", "METIER_CD", "AN", "3", False, False, ""
CreateAttribute entity, "METIER_NM", "METIER_NM", "AN", "100", False, False, ""
CreateAttribute entity, "SECTEUR_CD", "SECTEUR_CD", "A", "1", False, False, ""
CreateAttribute entity, "SECTEUR_NM", "SECTEUR_NM", "AN", "50", False, False, ""
CreateAttribute entity, "HRS_SAL_SOM", "HRS_SAL_SOM", "DC", "10.2", False, False, ""
CreateAttribute entity, "STAT_SAL_CD", "STAT_SAL_CD", "AN", "2", False, False, ""
CreateAttribute entity, "TOT_AV_SOC_AMT", "TOT_AV_SOC_AMT", "DC", "15.2", False, False, ""
CreateAttribute entity, "CD_ANNEXE_SAL", "CD_ANNEXE_SAL", "AN", "10", False, False, ""
CreateAttribute entity, "ANNEXE_SAL_DESC", "ANNEXE_SAL_DESC", "AN", "100", False, False, ""
CreateAttribute entity, "EMP_CMEQ_IND", "EMP_CMEQ_IND", "AN", "3", False, False, ""
CreateAttribute entity, "EMP_CMMTQ_IND", "EMP_CMMTQ_IND", "AN", "3", False, False, ""
CreateAttribute entity, "CREAT_DT", "CREAT_DT", "DT", "", True, False, ""
CreateAttribute entity, "CREAT_UTIL_ID", "CREAT_UTIL_ID", "AN", "50", True, False, ""
CreateAttribute entity, "MODIF_DT", "MODIF_DT", "DT", "", False, False, ""
CreateAttribute entity, "MODIF_UTIL_ID", "MODIF_UTIL_ID", "AN", "50", False, False, ""
CreatePrimaryKey entity, "PK_RAP_MENS_DET", "RAP_MENS_DET_ID"
CreateUniqueKey entity, "UK_RAP_MENS_DET", "ACT_SAP_CLE,DEB_EFFECT_DT"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000
xPos = 1000
yPos = yPos + 4000

'--- CCQ.RAP_MENS_ENT (33 colonnes) ---
' Note v11.2: AMEND_NB retire de la cle UK (correction courriel CCQ 12-fev-2026)
' UK = (RAP_SAP_CLE, DEB_EFFECT_DT) sans AMEND_NB
' AJOUT_MOD_IND: A=Ajout (nouveau), M=Modification (deja recu dans semaines precedentes)
' Pour historisation: prendre AMEND_NB MAX = derniere version
Set entity = CreateEntity("Rap Mens Ent", "RAP_MENS_ENT", "Schema CCQ - Entetes rapports mensuels RM02")
CreateAttribute entity, "RAP_MENS_ENT_ID", "RAP_MENS_ENT_ID", "I", "", True, False, ""
CreateAttribute entity, "RAP_SAP_CLE", "RAP_SAP_CLE", "AN", "50", True, False, ""
CreateAttribute entity, "DEB_EFFECT_DT", "DEB_EFFECT_DT", "D", "", True, False, ""
CreateAttribute entity, "FIN_EFFECT_DT", "FIN_EFFECT_DT", "D", "", False, False, ""
CreateAttribute entity, "CLIENT_EMP_NO", "CLIENT_EMP_NO", "AN", "10", True, False, ""
CreateAttribute entity, "ACTIF_IND", "ACTIF_IND", "A", "1", True, False, ""
CreateAttribute entity, "PER_ENV_DEB_DT", "PER_ENV_DEB_DT", "DT", "", False, False, ""
CreateAttribute entity, "PER_ENV_FIN_DT", "PER_ENV_FIN_DT", "DT", "", False, False, ""
CreateAttribute entity, "FISC_DEB_DT", "FISC_DEB_DT", "DT", "", False, False, ""
CreateAttribute entity, "FISC_FIN_DT", "FISC_FIN_DT", "DT", "", False, False, ""
CreateAttribute entity, "RAPPORT_NO", "RAPPORT_NO", "AN", "20", True, False, ""
CreateAttribute entity, "AMEND_NB", "AMEND_NB", "I", "", False, False, "v11.2: Retire de la cle UK. Pour historisation prendre MAX."
CreateAttribute entity, "RAP_STATUT_CD", "RAP_STATUT_CD", "AN", "20", False, False, ""
CreateAttribute entity, "TYPE_RAP_CD", "TYPE_RAP_CD", "AN", "20", False, False, ""
CreateAttribute entity, "ENTRP_NM", "ENTRP_NM", "AN", "200", False, False, ""
CreateAttribute entity, "TOT_RM_AMT", "TOT_RM_AMT", "DC", "15.2", False, False, ""
CreateAttribute entity, "SOLDE_RM_AMT", "SOLDE_RM_AMT", "DC", "15.2", False, False, ""
CreateAttribute entity, "TOT_AV_SOC_AMT", "TOT_AV_SOC_AMT", "DC", "15.2", False, False, ""
CreateAttribute entity, "MNT_NET_CARCAP", "MNT_NET_CARCAP", "DC", "15.2", False, False, ""
CreateAttribute entity, "AJOUT_MOD_IND", "AJOUT_MOD_IND", "A", "1", False, False, "A=Ajout (nouveau), M=Modification (deja recu)"
CreateAttribute entity, "SOUM_RM_DT", "SOUM_RM_DT", "DT", "", False, False, ""
CreateAttribute entity, "TOT_HEURE_RM", "TOT_HEURE_RM", "DC", "10.2", False, False, ""
CreateAttribute entity, "SOLDE_RECL_AMT", "SOLDE_RECL_AMT", "DC", "15.2", False, False, ""
CreateAttribute entity, "DEB_PER_RECL_DT", "DEB_PER_RECL_DT", "DT", "", False, False, ""
CreateAttribute entity, "FIN_PER_RECL_DT", "FIN_PER_RECL_DT", "DT", "", False, False, ""
CreateAttribute entity, "NO_RECLAMATION", "NO_RECLAMATION", "AN", "20", False, False, ""
CreateAttribute entity, "EST_EMP_ENQUETE_IND", "EST_EMP_ENQUETE_IND", "A", "1", False, False, ""
CreateAttribute entity, "EST_RAP_RETARD_IND", "EST_RAP_RETARD_IND", "A", "1", False, False, ""
CreateAttribute entity, "DERN_CHG_DT", "DERN_CHG_DT", "DT", "", False, False, ""
CreateAttribute entity, "CREAT_DT", "CREAT_DT", "DT", "", True, False, ""
CreateAttribute entity, "CREAT_UTIL_ID", "CREAT_UTIL_ID", "AN", "50", True, False, ""
CreateAttribute entity, "MODIF_DT", "MODIF_DT", "DT", "", False, False, ""
CreateAttribute entity, "MODIF_UTIL_ID", "MODIF_UTIL_ID", "AN", "50", False, False, ""
CreatePrimaryKey entity, "PK_RAP_MENS_ENT", "RAP_MENS_ENT_ID"
CreateUniqueKey entity, "UK_RAP_MENS_ENT", "RAP_SAP_CLE,DEB_EFFECT_DT"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000

'--- CCQ.SALAR_DOSS (47 colonnes) ---
Set entity = CreateEntity("Salar Doss", "SALAR_DOSS", "Schema CCQ - Dossier salarie SCD Type 2")
CreateAttribute entity, "SALAR_DOSS_ID", "SALAR_DOSS_ID", "I", "", True, False, ""
CreateAttribute entity, "CLIENT_SAL_NO", "CLIENT_SAL_NO", "AN", "10", True, False, ""
CreateAttribute entity, "DEB_EFFECT_DT", "DEB_EFFECT_DT", "D", "", True, False, ""
CreateAttribute entity, "FIN_EFFECT_DT", "FIN_EFFECT_DT", "D", "", False, False, ""
CreateAttribute entity, "ACTIF_IND", "ACTIF_IND", "A", "1", True, False, ""
CreateAttribute entity, "ENREG_DT", "ENREG_DT", "DT", "", False, False, ""
CreateAttribute entity, "NOM", "NOM", "AN", "50", True, False, ""
CreateAttribute entity, "PRENOM", "PRENOM", "AN", "50", True, False, ""
CreateAttribute entity, "NAISS_DT", "NAISS_DT", "DT", "", False, False, ""
CreateAttribute entity, "NAISS_STATUT_CD", "NAISS_STATUT_CD", "AN", "20", False, False, ""
CreateAttribute entity, "GENRE_CD", "GENRE_CD", "A", "1", False, False, ""
CreateAttribute entity, "CORR_ADR_L1", "CORR_ADR_L1", "AN", "200", False, False, ""
CreateAttribute entity, "CORR_MUN_NM", "CORR_MUN_NM", "AN", "50", False, False, ""
CreateAttribute entity, "CORR_REG_CD", "CORR_REG_CD", "A", "2", False, False, ""
CreateAttribute entity, "CORR_PROV_CD", "CORR_PROV_CD", "A", "2", False, False, ""
CreateAttribute entity, "CORR_CP_CD", "CORR_CP_CD", "AN", "10", False, False, ""
CreateAttribute entity, "CORR_PAYS_FR_DESC", "CORR_PAYS_FR_DESC", "AN", "50", False, False, ""
CreateAttribute entity, "CORR_PAYS_NM", "CORR_PAYS_NM", "AN", "50", False, False, ""
CreateAttribute entity, "CORR_CHG_ADR_DT", "CORR_CHG_ADR_DT", "DT", "", False, False, ""
CreateAttribute entity, "CORR_NON_LIV_CD", "CORR_NON_LIV_CD", "AN", "10", False, False, ""
CreateAttribute entity, "CORR_NON_LIV_DESC", "CORR_NON_LIV_DESC", "AN", "200", False, False, ""
CreateAttribute entity, "DOM_ADR_L1", "DOM_ADR_L1", "AN", "200", False, False, ""
CreateAttribute entity, "DOM_MUN_NM", "DOM_MUN_NM", "AN", "50", False, False, ""
CreateAttribute entity, "DOM_PROV_CD", "DOM_PROV_CD", "A", "2", False, False, ""
CreateAttribute entity, "DOM_CP_CD", "DOM_CP_CD", "AN", "10", False, False, ""
CreateAttribute entity, "DOM_PAYS_NM", "DOM_PAYS_NM", "AN", "50", False, False, ""
CreateAttribute entity, "DOM_CHG_ADR_DT", "DOM_CHG_ADR_DT", "DT", "", False, False, ""
CreateAttribute entity, "TEL_PRINC_NO", "TEL_PRINC_NO", "AN", "40", False, False, ""
CreateAttribute entity, "TEL_AUTRE_NO", "TEL_AUTRE_NO", "AN", "40", False, False, ""
CreateAttribute entity, "REG_ADMIN_CD", "REG_ADMIN_CD", "AN", "2", False, False, ""
CreateAttribute entity, "REG_ADMIN_NM", "REG_ADMIN_NM", "AN", "50", False, False, ""
CreateAttribute entity, "REG_TRAV_CD", "REG_TRAV_CD", "AN", "10", False, False, ""
CreateAttribute entity, "REG_TRAV_NM", "REG_TRAV_NM", "AN", "50", False, False, ""
CreateAttribute entity, "METIER_PRIO_CD", "METIER_PRIO_CD", "AN", "3", False, False, ""
CreateAttribute entity, "METIER_PRIO_NM", "METIER_PRIO_NM", "AN", "100", False, False, ""
CreateAttribute entity, "EMP_PRF_NO", "EMP_PRF_NO", "AN", "10", False, False, ""
CreateAttribute entity, "CERT1_TYPE_CD", "CERT1_TYPE_CD", "AN", "50", False, False, ""
CreateAttribute entity, "CERT1_ECH_DT", "CERT1_ECH_DT", "DT", "", False, False, ""
CreateAttribute entity, "CERT2_TYPE_CD", "CERT2_TYPE_CD", "AN", "50", False, False, ""
CreateAttribute entity, "CERT2_ECH_DT", "CERT2_ECH_DT", "DT", "", False, False, ""
CreateAttribute entity, "DEB_INVAL_DT", "DEB_INVAL_DT", "DT", "", False, False, ""
CreateAttribute entity, "DECES_PRESUME_DT", "DECES_PRESUME_DT", "DT", "", False, False, ""
CreateAttribute entity, "DECES_CONFIRME_DT", "DECES_CONFIRME_DT", "DT", "", False, False, ""
CreateAttribute entity, "CREAT_DT", "CREAT_DT", "DT", "", True, False, ""
CreateAttribute entity, "CREAT_UTIL_ID", "CREAT_UTIL_ID", "AN", "50", True, False, ""
CreateAttribute entity, "MODIF_DT", "MODIF_DT", "DT", "", False, False, ""
CreateAttribute entity, "MODIF_UTIL_ID", "MODIF_UTIL_ID", "AN", "50", False, False, ""
CreatePrimaryKey entity, "PK_SALAR_DOSS", "SALAR_DOSS_ID"
CreateUniqueKey entity, "UK_SALAR_DOSS", "CLIENT_SAL_NO,DEB_EFFECT_DT"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000

'--- CFG.CFG_CONFIG (4 colonnes) ---
Set entity = CreateEntity("Cfg Config", "CFG_CONFIG", "Schema CFG - Configuration systeme ETL transversal")
CreateAttribute entity, "CFG_ID", "CFG_ID", "LI", "", True, False, ""
CreateAttribute entity, "CD_SYSTEM", "CD_SYSTEM", "AN", "10", True, False, ""
CreateAttribute entity, "DESCR_SYSTEM", "DESCR_SYSTEM", "AN", "200", True, False, ""
CreateAttribute entity, "IND_ACTIF", "IND_ACTIF", "A", "1", True, False, ""
CreatePrimaryKey entity, "PK_CFG_CONFIG", "CFG_ID"
CreateUniqueKey entity, "UK_CFG_CONFIG", "CD_SYSTEM"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000

'--- CFG.CFG_CONFIG_PARM (6 colonnes) ---
Set entity = CreateEntity("Cfg Config Parm", "CFG_CONFIG_PARM", "Schema CFG - Parametres de configuration")
CreateAttribute entity, "CFG_PARM_ID", "CFG_PARM_ID", "LI", "", True, False, ""
CreateAttribute entity, "CD_PARAM", "CD_PARAM", "AN", "20", True, False, ""
CreateAttribute entity, "CD_SYSTEM", "CD_SYSTEM", "AN", "10", True, False, ""
CreateAttribute entity, "DESCR_PARAM", "DESCR_PARAM", "AN", "200", True, False, ""
CreateAttribute entity, "VALEUR_PARM", "VALEUR_PARM", "AN", "200", True, False, ""
CreateAttribute entity, "IND_ACTIF", "IND_ACTIF", "A", "1", True, False, ""
CreatePrimaryKey entity, "PK_CFG_CONFIG_PARM", "CFG_PARM_ID"
CreateUniqueKey entity, "UK_CFG_CONFIG_PARM", "CD_PARAM"
CreateEntitySymbol entity, xPos, yPos
xPos = xPos + 4000
xPos = 1000
yPos = yPos + 4000

' Restaurer le mode interactif
InteractiveMode = oldInteractive

MsgBox "Modele CCQ v11.2 genere!" & vbCrLf & "Tables: 12" & vbCrLf & "Primary Keys: 12" & vbCrLf & "Unique Keys: 9" & vbCrLf & vbCrLf & "Modifications v11.2:" & vbCrLf & "- RM02: UK = (RAP_SAP_CLE, DEB_EFFECT_DT)" & vbCrLf & "- AJOUT_MOD_IND: A=Ajout, M=Modification", vbInformation

End If ' === FIN DU SCRIPT ===

'=== FONCTIONS ===
Function CreateEntity(n, c, cmt)
   Set CreateEntity = model.Entities.CreateNew()
   CreateEntity.Name = n
   CreateEntity.Code = c
   CreateEntity.Comment = cmt
End Function

Sub CreateAttribute(ent, n, c, t, len, m, isId, cmt)
   Dim attr
   Set attr = ent.Attributes.CreateNew()
   attr.Name = n
   attr.Code = c
   Select Case t
      Case "AN"
         If len <> "" Then
            attr.DataType = "VARCHAR(" & len & ")"
         Else
            attr.DataType = "VARCHAR(50)"
         End If
      Case "A"
         If len <> "" Then
            attr.DataType = "CHAR(" & len & ")"
         Else
            attr.DataType = "CHAR(1)"
         End If
      Case "I"
         attr.DataType = "INT"
      Case "LI"
         attr.DataType = "BIGINT"
      Case "D"
         attr.DataType = "DATE"
      Case "DT"
         attr.DataType = "DATETIME"
      Case "DC"
         If len <> "" Then
            attr.DataType = "DECIMAL(" & Replace(len, ".", ",") & ")"
         Else
            attr.DataType = "DECIMAL(18,2)"
         End If
      Case "TXT"
         attr.DataType = "VARCHAR(MAX)"
      Case Else
         attr.DataType = t
   End Select
   attr.Mandatory = m
   attr.Comment = cmt
End Sub

Sub CreatePrimaryKey(ent, keyName, colCodes)
   Dim id, attr
   Set id = ent.Identifiers.CreateNew()
   id.Name = keyName
   id.Code = keyName
   id.PrimaryIdentifier = True
   For Each attr In ent.Attributes
      If InStr("," & colCodes & ",", "," & attr.Code & ",") > 0 Then
         id.Attributes.Add attr
      End If
   Next
End Sub

Sub CreateUniqueKey(ent, keyName, colCodes)
   ' Creer un identifiant secondaire (Unique Key) - PrimaryIdentifier = False
   Dim id, attr
   Set id = ent.Identifiers.CreateNew()
   id.Name = keyName
   id.Code = keyName
   id.PrimaryIdentifier = False
   For Each attr In ent.Attributes
      If InStr("," & colCodes & ",", "," & attr.Code & ",") > 0 Then
         id.Attributes.Add attr
      End If
   Next
End Sub

Sub CreateEntitySymbol(ent, x, y)
   ' Creation de symbole optionnelle - PowerDesigner genere automatiquement
   ' les symboles lors de l'affichage du diagramme
   On Error Resume Next
   Dim diag, sym
   Set diag = model.DefaultDiagram
   If Not diag Is Nothing Then
      Set sym = diag.AttachObject(ent)
   End If
   On Error Goto 0
End Sub
