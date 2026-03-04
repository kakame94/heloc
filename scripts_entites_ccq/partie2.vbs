
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
    ' 10. EMPL_REL_HISTORY
    ' ========================================
    Output "10. Création EMPL_REL_HISTORY..."
    Set emplRelHistory = model.Entities.CreateNew()
    emplRelHistory.Name = "Historique Relations Employeur"
    emplRelHistory.Code = "EMPL_REL_HISTORY"
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Identifiant historique Historique" : attr.Code = "HISTORY_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = emplRelHistory.Identifiers.CreateNew() : ident.Name = "PK_EMPL_REL_HISTORY" : ident.Code = "PK_EMPL_REL_HISTORY" : ident.Attributes.Add attr
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Identifiant relation original Historique" : attr.Code = "EMPL_REL_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Identifiant employeur Historique" : attr.Code = "EMPL_DOSS_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Système source Historique" : attr.Code = "SOURCE_SYSTEM" : attr.DataType = "VA20" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Date importation Historique" : attr.Code = "IMPORT_DATE" : attr.DataType = "DT" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro client relation Historique" : attr.Code = "CLIENT_REL_NO" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = emplRelHistory.Attributes.CreateNew() : attr.Name = "Numéro client employeur Historique" : attr.Code = "CLIENT_EMP_NO" : attr.DataType = "VA10" : attr.Mandatory = True

    ' ========================================
    ' 11. DCSAL02_CHADR
    ' ========================================
    Output "11. Création DCSAL02_CHADR..."
    Set dcsal02Chadr = model.Entities.CreateNew()
    dcsal02Chadr.Name = "DCSAL02 Changement Adresse"
    dcsal02Chadr.Code = "DCSAL02_CHADR"
    Set attr = dcsal02Chadr.Attributes.CreateNew() : attr.Name = "Identifiant changement adresse ChAdresse" : attr.Code = "CHADR_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = dcsal02Chadr.Identifiers.CreateNew() : ident.Name = "PK_DCSAL02_CHADR" : ident.Code = "PK_DCSAL02_CHADR" : ident.Attributes.Add attr
    Set attr = dcsal02Chadr.Attributes.CreateNew() : attr.Name = "Numéro client salarié ChAdresse" : attr.Code = "NO_CLIENT_SALARIE" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = dcsal02Chadr.Attributes.CreateNew() : attr.Name = "Date transaction ChAdresse" : attr.Code = "DATE_TRANS" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = dcsal02Chadr.Attributes.CreateNew() : attr.Name = "Heure transaction ChAdresse" : attr.Code = "HEURE_TRANS" : attr.DataType = "T" : attr.Mandatory = True
    Set attr = dcsal02Chadr.Attributes.CreateNew() : attr.Name = "Code type transaction ChAdresse" : attr.Code = "CD_TYPE_TRANS" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = dcsal02Chadr.Attributes.CreateNew() : attr.Name = "Adresse correspondance ChAdresse" : attr.Code = "ADR_CORR" : attr.DataType = "VA200"
    Set attr = dcsal02Chadr.Attributes.CreateNew() : attr.Name = "Adresse domicile ChAdresse" : attr.Code = "ADR_DOM" : attr.DataType = "VA200"

    ' ========================================
    ' 12. DCSAL02_CHINFOPER
    ' ========================================
    Output "12. Création DCSAL02_CHINFOPER..."
    Set dcsal02Chinfoper = model.Entities.CreateNew()
    dcsal02Chinfoper.Name = "DCSAL02 Changement Info Personnelle"
    dcsal02Chinfoper.Code = "DCSAL02_CHINFOPER"
    Set attr = dcsal02Chinfoper.Attributes.CreateNew() : attr.Name = "Identifiant changement info ChInfo" : attr.Code = "CHINFOPER_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = dcsal02Chinfoper.Identifiers.CreateNew() : ident.Name = "PK_DCSAL02_CHINFOPER" : ident.Code = "PK_DCSAL02_CHINFOPER" : ident.Attributes.Add attr
    Set attr = dcsal02Chinfoper.Attributes.CreateNew() : attr.Name = "Numéro client salarié ChInfo" : attr.Code = "NO_CLIENT_SALARIE" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = dcsal02Chinfoper.Attributes.CreateNew() : attr.Name = "Date transaction ChInfo" : attr.Code = "DATE_TRANS" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = dcsal02Chinfoper.Attributes.CreateNew() : attr.Name = "Heure transaction ChInfo" : attr.Code = "HEURE_TRANS" : attr.DataType = "T" : attr.Mandatory = True
    Set attr = dcsal02Chinfoper.Attributes.CreateNew() : attr.Name = "Numéro téléphone principal ChInfo" : attr.Code = "NO_TEL_PRIM" : attr.DataType = "VA20"
    Set attr = dcsal02Chinfoper.Attributes.CreateNew() : attr.Name = "Numéro téléphone secondaire ChInfo" : attr.Code = "NO_TEL_SECOND" : attr.DataType = "VA20"

    ' ========================================
    ' 13. DCSAL02_BLOCAGE
    ' ========================================
    Output "13. Création DCSAL02_BLOCAGE..."
    Set dcsal02Blocage = model.Entities.CreateNew()
    dcsal02Blocage.Name = "DCSAL02 Blocage"
    dcsal02Blocage.Code = "DCSAL02_BLOCAGE"
    Set attr = dcsal02Blocage.Attributes.CreateNew() : attr.Name = "Identifiant blocage Blocage" : attr.Code = "BLOCAGE_ID" : attr.DataType = "I" : attr.Mandatory = True
    Set ident = dcsal02Blocage.Identifiers.CreateNew() : ident.Name = "PK_DCSAL02_BLOCAGE" : ident.Code = "PK_DCSAL02_BLOCAGE" : ident.Attributes.Add attr
    Set attr = dcsal02Blocage.Attributes.CreateNew() : attr.Name = "Numéro client salarié Blocage" : attr.Code = "NO_CLIENT_SALARIE" : attr.DataType = "VA10" : attr.Mandatory = True
    Set attr = dcsal02Blocage.Attributes.CreateNew() : attr.Name = "Date transaction Blocage" : attr.Code = "DATE_TRANS" : attr.DataType = "D" : attr.Mandatory = True
    Set attr = dcsal02Blocage.Attributes.CreateNew() : attr.Name = "Raison blocage Blocage" : attr.Code = "RAISON_BLOC" : attr.DataType = "VA200"

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
    For Each ident In emplDoss.Identifiers
        If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    Next
    
    ' 2. Employeur -> Rapport Entête (sur CLIENT_EMP_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "produit rapports"
    rel.Code = "FK_ENT_EMPL"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = rapMensEnt
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    For Each ident In emplDoss.Identifiers
        If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    Next
    
    ' 3. Rapport Entête -> Détail (sur RAP_SAP_CLE)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "contient détails"
    rel.Code = "FK_DET_ENT"
    Set rel.Entity1 = rapMensEnt
    Set rel.Entity2 = rapMensDet
    rel.Entity1ToEntity2RoleCardinality = "1,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    For Each ident In rapMensEnt.Identifiers
        If ident.Code = "AK_RAP_MENS_ENT_METIER" Then Set rel.Entity1Identifier = ident
    Next
    
    ' 4. Salarié -> Rapport Détail (sur CLIENT_SAL_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "travaille dans"
    rel.Code = "FK_DET_SAL"
    Set rel.Entity1 = salarDoss
    Set rel.Entity2 = rapMensDet
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    For Each ident In salarDoss.Identifiers
        If ident.Code = "AK_SALAR_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    Next
    
    ' 5. Config -> Paramètres (sur CD_SYSTEM)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "possède paramètres"
    rel.Code = "FK_PARM_CONFIG"
    Set rel.Entity1 = cfgConfig
    Set rel.Entity2 = cfgConfigParm
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    For Each ident In cfgConfig.Identifiers
        If ident.Code = "AK_CFG_CONFIG" Then Set rel.Entity1Identifier = ident
    Next

    ' 6. Salarié -> DCSAL02 (Tables enfants sur CLIENT_SAL_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "a changements adresse"
    rel.Code = "FK_CHADR_SAL"
    Set rel.Entity1 = salarDoss
    Set rel.Entity2 = dcsal02Chadr
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    For Each ident In salarDoss.Identifiers
        If ident.Code = "AK_SALAR_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    Next

    Set rel = model.Relationships.CreateNew()
    rel.Name = "a changements info"
    rel.Code = "FK_CHINFO_SAL"
    Set rel.Entity1 = salarDoss
    Set rel.Entity2 = dcsal02Chinfoper
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    For Each ident In salarDoss.Identifiers
        If ident.Code = "AK_SALAR_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    Next

    Set rel = model.Relationships.CreateNew()
    rel.Name = "a blocages"
    rel.Code = "FK_BLOC_SAL"
    Set rel.Entity1 = salarDoss
    Set rel.Entity2 = dcsal02Blocage
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    For Each ident In salarDoss.Identifiers
        If ident.Code = "AK_SALAR_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    Next

    ' 7. Employeur -> Historique (sur CLIENT_EMP_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "a historique"
    rel.Code = "FK_HIST_EMPL"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = emplRelHistory
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    For Each ident In emplDoss.Identifiers
        If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    Next
    
    ' 8. Salarié -> Employeur préféré (sur CLIENT_EMP_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "préfère employeur"
    rel.Code = "FK_SAL_EMP_PRF"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = salarDoss
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "0,1"
    For Each ident In emplDoss.Identifiers
        If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    Next
    
    ' 9. Employeur -> Rapport Détail (sur CLIENT_EMP_NO)
    Set rel = model.Relationships.CreateNew()
    rel.Name = "emploie dans détails"
    rel.Code = "FK_DET_EMP_DIRECT"
    Set rel.Entity1 = emplDoss
    Set rel.Entity2 = rapMensDet
    rel.Entity1ToEntity2RoleCardinality = "0,n"
    rel.Entity2ToEntity1RoleCardinality = "1,1"
    For Each ident In emplDoss.Identifiers
        If ident.Code = "AK_EMPL_DOSS_METIER" Then Set rel.Entity1Identifier = ident
    Next

    Output "✅ Relations métiers configurées avec succès."
    MsgBox "MCD CCQ v2.10 COMPLET généré avec :" & vbCrLf & _
           "- Toutes les entités et colonnes" & vbCrLf & _
           "- Identifiants Métier (AK) créés" & vbCrLf & _
           "- Relations basées sur les Clés Métier", vbInformation

End Sub

Call Main()
