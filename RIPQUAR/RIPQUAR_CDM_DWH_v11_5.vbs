'==============================================================================
' RIPQUAR - Modele Conceptuel de Donnees (CDM) - DWH v11.5
' Script PowerDesigner VBS - Nomenclature PR388 v2.12
'==============================================================================
' Version: 11.5
' Date: 2026-01-30
' Auteur: Eliot Alanmanou, Architecte de donnees
' Client: RBQ - Regie du Batiment du Quebec
'
' CONTENU:
'   - DIMENSIONS (5 tables): DIM_CANDIDAT, DIM_EXAMEN, DIM_QUESTION, DIM_DATE, DIM_BUREAU
'   - FAITS (2 tables): FACT_RESULTAT_EXAMEN, FACT_REPONSE_QUESTION
'
' NOMENCLATURE PR388:
'   Format colonnes: ss_gg_xxx_xxx
'   - ss = Systeme (DW = Data Warehouse, GI = GIC, TW = TestWe)
'   - gg = Type generique (N=Numero, C=Code, D=Date, DH=DateHeure, I=Indicateur, M=Montant, NM=Nom, Q=Quantite)
'
' COULEURS RECOMMANDEES (manuellement):
'   - DIMENSIONS: Bleu clair RGB(189, 215, 238)
'   - FAITS: Rouge/Orange clair RGB(248, 203, 173)
'
' TOTAL: 7 entites + 9 relations
'==============================================================================

Option Explicit

Dim mdl
Dim ent

'==============================================================================
' POINT D'ENTREE PRINCIPAL
'==============================================================================
Sub Main()
    Set mdl = ActiveModel
    
    If mdl Is Nothing Then
        MsgBox "Veuillez ouvrir ou creer un modele CDM avant d'executer ce script.", vbExclamation
        Exit Sub
    End If
    
    Dim testEntities
    On Error Resume Next
    Set testEntities = mdl.Entities
    If Err.Number <> 0 Then
        On Error GoTo 0
        MsgBox "Ce script necessite un modele CDM (Conceptual Data Model).", vbExclamation
        Exit Sub
    End If
    On Error GoTo 0
    
    If MsgBox("RIPQUAR - Data Mart Examens v11.5 (PR388)" & vbCrLf & _
              "=========================================" & vbCrLf & vbCrLf & _
              "Ce script va creer:" & vbCrLf & _
              "  - 5 Dimensions (DIM_*)" & vbCrLf & _
              "  - 2 Faits (FACT_*)" & vbCrLf & _
              "  - 9 Relations Star Schema" & vbCrLf & vbCrLf & _
              "Nomenclature: PR388 v2.12" & vbCrLf & _
              "Schema cible: [DWH]" & vbCrLf & vbCrLf & _
              "Les entites existantes DIM_*/FACT_* seront supprimees." & vbCrLf & vbCrLf & _
              "Continuer?", vbYesNo + vbQuestion, "RIPQUAR DWH v11.5") = vbNo Then
        Exit Sub
    End If
    
    ' Mettre a jour les proprietes du modele
    mdl.Name = "RIPQUAR - Data Mart Examens v11.5"
    mdl.Code = "RIPQUAR_DWH"
    mdl.Comment = "RIPQUAR - Data Mart Examens RBQ" & vbCrLf & _
                  "===============================" & vbCrLf & _
                  "Version: 11.5" & vbCrLf & _
                  "Date: 2026-01-30" & vbCrLf & _
                  "Auteur: Eliot Alanmanou" & vbCrLf & _
                  "Client: RBQ" & vbCrLf & vbCrLf & _
                  "Nomenclature: PR388 v2.12" & vbCrLf & _
                  "Schema cible: [DWH]" & vbCrLf & vbCrLf & _
                  "DIMENSIONS (Bleu clair):" & vbCrLf & _
                  "  - DIM_CANDIDAT: Candidats (SCD2)" & vbCrLf & _
                  "  - DIM_EXAMEN: Examens (SCD2)" & vbCrLf & _
                  "  - DIM_QUESTION: Questions + psychometrie (SCD2)" & vbCrLf & _
                  "  - DIM_DATE: Calendrier + Annee fiscale RBQ" & vbCrLf & _
                  "  - DIM_BUREAU: Bureaux d'examen RBQ" & vbCrLf & vbCrLf & _
                  "FAITS (Orange clair):" & vbCrLf & _
                  "  - FACT_RESULTAT_EXAMEN: 1 ligne/passation" & vbCrLf & _
                  "  - FACT_REPONSE_QUESTION: 1 ligne/question"
    
    ' Supprimer les entites existantes DIM_* et FACT_*
    Call DeleteExistingEntities()
    
    ' DIMENSIONS (5 tables)
    Call CreateDIM_CANDIDAT()
    Call CreateDIM_EXAMEN()
    Call CreateDIM_QUESTION()
    Call CreateDIM_DATE()
    Call CreateDIM_BUREAU()
    
    ' FAITS (2 tables)
    Call CreateFACT_RESULTAT_EXAMEN()
    Call CreateFACT_REPONSE_QUESTION()
    
    ' RELATIONS STAR SCHEMA
    Call CreateDWHRelationships()
    
    MsgBox "Modele DWH RIPQUAR v11.5 cree avec succes!" & vbCrLf & vbCrLf & _
           "Entites: " & mdl.Entities.Count & vbCrLf & _
           "Relations: " & mdl.Relationships.Count & vbCrLf & vbCrLf & _
           "Nomenclature: PR388 v2.12" & vbCrLf & vbCrLf & _
           "Pour colorer les entites:" & vbCrLf & _
           "1. Selectionner DIM_* > Format > Remplissage > Bleu" & vbCrLf & _
           "2. Selectionner FACT_* > Format > Remplissage > Orange" & vbCrLf & vbCrLf & _
           "Schema cible: [DWH]", _
           vbInformation, "RIPQUAR DWH v11.5"
End Sub

'==============================================================================
' HELPER: Supprimer entites existantes DIM_* et FACT_*
'==============================================================================
Sub DeleteExistingEntities()
    Dim i
    
    For i = mdl.Entities.Count - 1 To 0 Step -1
        On Error Resume Next
        If Left(mdl.Entities.Item(i).Code, 4) = "DIM_" Or _
           Left(mdl.Entities.Item(i).Code, 5) = "FACT_" Or _
           Left(mdl.Entities.Item(i).Name, 3) = "DIM" Or _
           Left(mdl.Entities.Item(i).Name, 4) = "FACT" Then
            mdl.Entities.Item(i).Delete
        End If
        On Error GoTo 0
    Next
    
    For i = mdl.Relationships.Count - 1 To 0 Step -1
        On Error Resume Next
        mdl.Relationships.Item(i).Delete
        On Error GoTo 0
    Next
End Sub

'==============================================================================
' HELPER: Ajouter un attribut
'==============================================================================
Sub AddAttr(ent, attrName, attrCode, attrDataType, attrMandatory, attrPK, attrComment)
    Dim attr
    Set attr = ent.Attributes.CreateNew()
    attr.Name = attrName
    attr.Code = attrCode
    attr.DataType = attrDataType
    attr.Mandatory = attrMandatory
    attr.Comment = attrComment
    
    If attrPK Then
        If ent.Identifiers.Count = 0 Then
            Dim ident
            Set ident = ent.Identifiers.CreateNew()
            ident.Name = "PK_" & ent.Code
            ident.Code = "PK_" & ent.Code
            ident.Attributes.Add attr
        Else
            ent.Identifiers.Item(0).Attributes.Add attr
        End If
    End If
End Sub

'==============================================================================
' HELPER: Ajouter colonnes d'audit ETL (PR388)
'==============================================================================
Sub AddETLAudit(ent)
    Call AddAttr(ent, "Date Heure Chargement ETL", "DW_DH_CHARG_ETL", "DT", True, False, "Date et heure du chargement ETL")
    Call AddAttr(ent, "Code Systeme Source", "DW_C_SYST_SRCE", "VA20", True, False, "GIC, TESTWE")
    Call AddAttr(ent, "Code Lot ETL", "DW_C_LOT_ETL", "VA50", False, False, "Identifiant du lot ETL")
End Sub

'==============================================================================
' HELPER: Ajouter colonnes SCD Type 2 (PR388)
'==============================================================================
Sub AddSCD2(ent)
    Call AddAttr(ent, "Date Debut Validite", "DW_D_DEBU_VALI", "DT", True, False, "Debut de validite SCD2")
    Call AddAttr(ent, "Date Fin Validite", "DW_D_FIN_VALI", "DT", False, False, "Fin de validite SCD2 (NULL si actif)")
    Call AddAttr(ent, "Indicateur Courant", "DW_I_COUR", "BL", True, False, "Vrai si enregistrement actif")
End Sub

'==============================================================================
' DIMENSIONS
'==============================================================================
Sub CreateDIM_CANDIDAT()
    Set ent = mdl.Entities.CreateNew()
    ent.Name = "DIM Candidat"
    ent.Code = "DIM_CANDIDAT"
    ent.Comment = "DIMENSION - Candidats (SCD Type 2)" & vbCrLf & _
                  "Sources: [dbo].S_CONTACT + STG.STG_TW_UTILISATEUR" & vbCrLf & _
                  "Grain: Un enregistrement par candidat par version" & vbCrLf & _
                  "Schema: [DWH]"
    ent.Stereotype = "DIMENSION"
    
    Call AddAttr(ent, "Numero Cle Substitution Candidat", "DW_N_CAND_ID", "I", True, True, "Cle de substitution (Surrogate Key)")
    Call AddAttr(ent, "Numero Cle Metier Siebel", "GI_N_ROW_ID_CONT", "VA15", False, False, "Cle metier GIC/Siebel")
    Call AddAttr(ent, "Numero Cle Metier TestWe", "TW_N_UTIL_ID", "VA36", False, False, "Cle metier TestWe UUID")
    Call AddAttr(ent, "Numero Identifiant Personne", "GI_N_PERS_UID", "VA20", False, False, "Cle de liaison GIC")
    Call AddAttr(ent, "Nom Complet Candidat", "DW_NM_CAND_COMPL", "VA200", False, False, "Nom et Prenom")
    Call AddAttr(ent, "Code Empreinte Courriel", "DW_C_EMPR_COUR", "VA64", False, False, "SHA256 pour anonymisation Loi 25")
    Call AddSCD2(ent)
    Call AddETLAudit(ent)
End Sub

Sub CreateDIM_EXAMEN()
    Set ent = mdl.Entities.CreateNew()
    ent.Name = "DIM Examen"
    ent.Code = "DIM_EXAMEN"
    ent.Comment = "DIMENSION - Examens (SCD Type 2)" & vbCrLf & _
                  "Sources: [dbo].CX_EXAMEN + STG.STG_TW_EXAMEN" & vbCrLf & _
                  "CLE DU RAPPORT Power BI" & vbCrLf & _
                  "Schema: [DWH]"
    ent.Stereotype = "DIMENSION"
    
    Call AddAttr(ent, "Numero Cle Substitution Examen", "DW_N_EXAM_ID", "I", True, True, "Cle de substitution")
    Call AddAttr(ent, "Numero Cle Metier GIC", "GI_N_ROW_ID_EXAM", "VA15", False, False, "Cle metier GIC")
    Call AddAttr(ent, "Numero Cle Metier TestWe", "TW_N_EXAM_ID", "VA36", False, False, "Cle metier TestWe UUID")
    Call AddAttr(ent, "Code Examen", "DW_C_EXAM", "VA50", True, False, "Code unique (ex: ADM-20000-021)")
    Call AddAttr(ent, "Nom Examen", "DW_NM_EXAM", "VA255", False, False, "Nom descriptif")
    Call AddAttr(ent, "Code Type Examen", "DW_C_TYPE_EXAM", "VA10", False, False, "ADM, ELE, PLO, ETC...")
    Call AddAttr(ent, "Code Sous Categorie", "DW_C_SOUS_CATE", "VA100", False, False, "Sous-categorie")
    Call AddAttr(ent, "Code Langue", "DW_C_LANG", "VA10", False, False, "F/A")
    Call AddAttr(ent, "Quantite Duree Minutes", "DW_Q_DURE_MINT", "I", False, False, "Duree en minutes")
    Call AddAttr(ent, "Montant Seuil Passage", "DW_M_SEUI_PASS", "DC", False, False, "Note minimale % (58)")
    Call AddAttr(ent, "Quantite Questions", "DW_Q_NB_QUES", "I", False, False, "Nombre de questions")
    Call AddAttr(ent, "Quantite Points Maximum", "DW_Q_PTS_MAX", "I", False, False, "Points maximum")
    Call AddAttr(ent, "Indicateur Actif", "DW_I_ACTI", "BL", False, False, "Examen actif")
    Call AddAttr(ent, "Indicateur En Circulation", "DW_I_EN_CIRC", "BL", False, False, "En circulation")
    Call AddSCD2(ent)
    Call AddETLAudit(ent)
End Sub

Sub CreateDIM_QUESTION()
    Set ent = mdl.Entities.CreateNew()
    ent.Name = "DIM Question"
    ent.Code = "DIM_QUESTION"
    ent.Comment = "DIMENSION - Questions (SCD Type 2)" & vbCrLf & _
                  "Sources: [dbo].CX_QUEST_EXAM + STG.STG_TW_QUESTION + STG.STG_TW_CHOIX" & vbCrLf & _
                  "STATS PSYCHOMETRIQUES" & vbCrLf & _
                  "Schema: [DWH]"
    ent.Stereotype = "DIMENSION"
    
    Call AddAttr(ent, "Numero Cle Substitution Question", "DW_N_QUES_ID", "I", True, True, "Cle de substitution")
    Call AddAttr(ent, "Numero Cle Metier GIC", "GI_N_ROW_ID_QUES", "VA15", False, False, "Cle metier GIC")
    Call AddAttr(ent, "Numero Cle Metier TestWe", "TW_N_QUES_ID", "VA36", False, False, "UUID instance")
    Call AddAttr(ent, "Numero UUID Banque Question", "TW_N_UUID_BANQ_QUES", "VA36", False, False, "UUID stable versionnage")
    Call AddAttr(ent, "Numero Cle Etrangere Examen", "DW_N_FK_EXAM_ID", "I", False, False, "FK vers DIM_EXAMEN")
    Call AddAttr(ent, "Code Question", "DW_C_QUES", "VA50", False, False, "Ex: Q20000-00001-F")
    Call AddAttr(ent, "Code Reference Externe", "TW_C_REF_EXT", "VA50", False, False, "Lien GIC-TestWe")
    Call AddAttr(ent, "Numero Position Question", "DW_N_POSI_QUES", "I", False, False, "Position: 1, 2, 3...")
    Call AddAttr(ent, "Montant Points", "DW_M_PTS", "I", False, False, "Points question")
    Call AddAttr(ent, "Code Type Question", "DW_C_TYPE_QUES", "VA50", False, False, "MCQ, UNIQUE, etc.")
    Call AddAttr(ent, "Quantite Choix", "DW_Q_NB_CHOI", "I", False, False, "4 par defaut")
    Call AddAttr(ent, "Numero Position Bonne Reponse", "DW_N_POSI_BONN_REPN", "I", False, False, "0=A, 1=B, 2=C, 3=D")
    Call AddAttr(ent, "Code Libelle Bonne Reponse", "DW_C_LIBE_BONN_REPN", "VA1", False, False, "A, B, C ou D")
    Call AddAttr(ent, "Indicateur Choix Aleatoires", "DW_I_CHOI_ALEA", "BL", False, False, "Randomisation")
    Call AddAttr(ent, "Montant Indice Difficulte", "DW_M_INDI_DIFF", "DC", False, False, "Taux reussite (0.00-1.00)")
    Call AddAttr(ent, "Code Niveau Difficulte", "DW_C_NIVE_DIFF", "VA20", False, False, "Difficile/Moyenne/Facile")
    Call AddAttr(ent, "Montant Indice Discrimination", "DW_M_INDI_DISC", "DC", False, False, "Point-biseriale")
    Call AddSCD2(ent)
    Call AddETLAudit(ent)
End Sub

Sub CreateDIM_DATE()
    Set ent = mdl.Entities.CreateNew()
    ent.Name = "DIM Date"
    ent.Code = "DIM_DATE"
    ent.Comment = "DIMENSION - Calendrier" & vbCrLf & _
                  "Pre-generee: 2020-2030 + Annee Fiscale RBQ" & vbCrLf & _
                  "Schema: [DWH]"
    ent.Stereotype = "DIMENSION"
    
    Call AddAttr(ent, "Numero Cle Substitution Date", "DW_N_DATE_ID", "I", True, True, "Cle de substitution = AAAAMMJJ")
    Call AddAttr(ent, "Date Complete", "DW_D_DATE", "D", True, False, "Date complete")
    Call AddAttr(ent, "Numero Annee", "DW_N_ANNE", "I", False, False, "Annee")
    Call AddAttr(ent, "Numero Mois", "DW_N_MOIS", "I", False, False, "Mois")
    Call AddAttr(ent, "Numero Jour", "DW_N_JOUR", "I", False, False, "Jour")
    Call AddAttr(ent, "Code Annee Fiscale RBQ", "DW_C_ANNE_FISC_RBQ", "VA10", False, False, "Avril-Mars (ex: 2024-2025)")
    Call AddAttr(ent, "Numero Trimestre Fiscal RBQ", "DW_N_TRIM_FISC_RBQ", "I", False, False, "Trimestre fiscal")
End Sub

Sub CreateDIM_BUREAU()
    Set ent = mdl.Entities.CreateNew()
    ent.Name = "DIM Bureau"
    ent.Code = "DIM_BUREAU"
    ent.Comment = "DIMENSION - Bureaux d'examen RBQ" & vbCrLf & _
                  "~5-10 lignes, quasi-statique" & vbCrLf & _
                  "Source: [dbo].CX_SALLE_EXAMEN (ville/nom salle)" & vbCrLf & _
                  "Besoin: Stats par bureau, volumetrie par lieu, convocation" & vbCrLf & _
                  "Schema: [DWH]"
    ent.Stereotype = "DIMENSION"
    
    Call AddAttr(ent, "Numero Cle Substitution Bureau", "DW_N_BURE_ID", "I", True, True, "Cle de substitution")
    Call AddAttr(ent, "Code Bureau", "DW_C_BURE", "VA10", True, False, "Code court (MTL, QUE, GAT, etc.)")
    Call AddAttr(ent, "Nom Bureau", "DW_NM_BURE", "VA50", True, False, "Nom complet (Montreal, Quebec, Gatineau)")
    Call AddAttr(ent, "Nom Region Administrative", "DW_NM_REGN_ADMN", "VA50", False, False, "Region administrative (regroupement futur)")
End Sub

'==============================================================================
' FAITS
'==============================================================================
Sub CreateFACT_RESULTAT_EXAMEN()
    Set ent = mdl.Entities.CreateNew()
    ent.Name = "FAIT Resultat Examen"
    ent.Code = "FACT_RESULTAT_EXAMEN"
    ent.Comment = "FAIT - Resultats d'examens" & vbCrLf & _
                  "Grain: Un resultat par candidat par passation" & vbCrLf & _
                  "Source: [dbo].CX_INSC_EXAM + STG.STG_TW_COPIE" & vbCrLf & _
                  "Schema: [DWH]"
    ent.Stereotype = "FAIT"
    
    Call AddAttr(ent, "Numero Cle Substitution Resultat", "DW_N_RESU_ID", "I", True, True, "Cle de substitution")
    Call AddAttr(ent, "Numero FK Candidat", "DW_N_FK_CAND_ID", "I", True, False, "FK vers DIM_CANDIDAT")
    Call AddAttr(ent, "Numero FK Examen", "DW_N_FK_EXAM_ID", "I", True, False, "FK vers DIM_EXAMEN")
    Call AddAttr(ent, "Numero FK Date Examen", "DW_N_FK_DATE_EXAM_ID", "I", True, False, "FK vers DIM_DATE (Role-Playing: Date seance examen)")
    Call AddAttr(ent, "Numero FK Date Correction", "DW_N_FK_DATE_CORR_ID", "I", False, False, "FK vers DIM_DATE (Role-Playing: Date correction copie)")
    Call AddAttr(ent, "Numero FK Bureau", "DW_N_FK_BURE_ID", "I", False, False, "FK vers DIM_BUREAU (bureau d'examen)")
    Call AddAttr(ent, "Numero Cle Metier GIC Inscription", "GI_N_ROW_ID_INSC", "VA15", False, False, "Business Key GIC")
    Call AddAttr(ent, "Numero Cle Metier TestWe Copie", "TW_N_COPI_ID", "VA36", False, False, "Business Key TestWe")
    Call AddAttr(ent, "Montant Note Pourcentage", "DW_M_NOTE_PCNT", "DC", False, False, "Note Initiale %")
    Call AddAttr(ent, "Montant Note Brute", "DW_M_NOTE_BRUT", "DC", False, False, "Points obtenus")
    Call AddAttr(ent, "Montant Seuil Reussite", "DW_M_SEUI_REUS", "DC", False, False, "Seuil de reussite")
    Call AddAttr(ent, "Indicateur Reussi", "DW_I_REUS", "BL", False, False, "PASS/FAIL")
    Call AddAttr(ent, "Indicateur Absent", "DW_I_ABSE", "BL", False, False, "Absence ou copie vide")
    Call AddAttr(ent, "Quantite Questions Total", "DW_Q_NB_QUES_TOTA", "I", False, False, "Nombre questions total")
    Call AddAttr(ent, "Quantite Duree Passation Secondes", "DW_Q_DURE_PASS_SEC", "I", False, False, "Duree en secondes")
    Call AddAttr(ent, "Indicateur Reprise", "DW_I_REPR", "BL", False, False, "Est une reprise")
    Call AddAttr(ent, "Date Heure Seance", "DW_DH_SEAN", "DT", False, False, "Date/heure seance")
    Call AddAttr(ent, "Date Heure Correction", "DW_DH_CORR", "DT", False, False, "Date/heure correction")
    Call AddETLAudit(ent)
End Sub

Sub CreateFACT_REPONSE_QUESTION()
    Set ent = mdl.Entities.CreateNew()
    ent.Name = "FAIT Reponse Question"
    ent.Code = "FACT_REPONSE_QUESTION"
    ent.Comment = "FAIT - Reponses par question (GRAIN FIN)" & vbCrLf & _
                  "Grain: Une reponse par candidat par question" & vbCrLf & _
                  "Source: STG.STG_TW_REPONSE + STG.STG_TW_CORRECTION" & vbCrLf & _
                  "Schema: [DWH]"
    ent.Stereotype = "FAIT"
    
    Call AddAttr(ent, "Numero Cle Substitution Reponse", "DW_N_REPN_ID", "I", True, True, "Cle de substitution")
    Call AddAttr(ent, "Numero FK Candidat", "DW_N_FK_CAND_ID", "I", True, False, "FK vers DIM_CANDIDAT")
    Call AddAttr(ent, "Numero FK Examen", "DW_N_FK_EXAM_ID", "I", True, False, "FK vers DIM_EXAMEN")
    Call AddAttr(ent, "Numero FK Question", "DW_N_FK_QUES_ID", "I", True, False, "FK vers DIM_QUESTION")
    Call AddAttr(ent, "Numero FK Resultat", "DW_N_FK_RESU_ID", "I", True, False, "FK vers FACT_RESULTAT_EXAMEN")
    Call AddAttr(ent, "Numero FK Date Reponse", "DW_N_FK_DATE_REPN_ID", "I", True, False, "FK vers DIM_DATE (Role-Playing: Date reponse candidat)")
    Call AddAttr(ent, "Code URI Reponse TestWe", "TW_C_URI_REPN", "VA255", False, False, "URI TestWe")
    Call AddAttr(ent, "Montant Points Obtenus", "DW_M_PTS_OBTE", "DC", False, False, "0 ou 1")
    Call AddAttr(ent, "Indicateur Correct", "DW_I_CORR", "BL", False, False, "Vrai si bonne reponse")
    Call AddAttr(ent, "Numero Position Choix Donne", "DW_N_POSI_CHOI_DONN", "I", False, False, "0=A, 1=B, 2=C, 3=D, NULL=Aucune")
    Call AddAttr(ent, "Code Libelle Choix Donne", "DW_C_LIBE_CHOI_DONN", "VA1", False, False, "A, B, C, D ou vide")
    Call AddAttr(ent, "Indicateur Repondu", "DW_I_REPN", "BL", False, False, "Faux = Aucune reponse")
    Call AddAttr(ent, "Indicateur Aucune Reponse", "DW_I_AUCU_REPN", "BL", False, False, "Colonne Aucune")
    Call AddAttr(ent, "Indicateur Reponse Plus Choisie", "DW_I_REPN_PLUS_CHOI", "BL", False, False, "Reponse la plus choisie")
    Call AddETLAudit(ent)
End Sub

'==============================================================================
' RELATIONS STAR SCHEMA
'==============================================================================
Sub CreateDWHRelationships()
    Call CreateRel("DIM_CANDIDAT", "FACT_RESULTAT_EXAMEN", "1,n", "Candidat a Resultats")
    Call CreateRel("DIM_EXAMEN", "FACT_RESULTAT_EXAMEN", "1,n", "Examen a Resultats")
    Call CreateRel("DIM_DATE", "FACT_RESULTAT_EXAMEN", "1,n", "Date a Resultats")
    Call CreateRel("DIM_BUREAU", "FACT_RESULTAT_EXAMEN", "1,n", "Bureau a Resultats")
    
    Call CreateRel("DIM_CANDIDAT", "FACT_REPONSE_QUESTION", "1,n", "Candidat a Reponses")
    Call CreateRel("DIM_EXAMEN", "FACT_REPONSE_QUESTION", "1,n", "Examen a Reponses")
    Call CreateRel("DIM_QUESTION", "FACT_REPONSE_QUESTION", "1,n", "Question a Reponses")
    Call CreateRel("DIM_DATE", "FACT_REPONSE_QUESTION", "1,n", "Date a Reponses")
    Call CreateRel("FACT_RESULTAT_EXAMEN", "FACT_REPONSE_QUESTION", "1,n", "Resultat a Reponses")
End Sub

'==============================================================================
' HELPER: Creer une relation
'==============================================================================
Sub CreateRel(code1, code2, card, relName)
    Dim rel, ent1, ent2, i
    
    On Error Resume Next
    
    For i = 0 To mdl.Entities.Count - 1
        If mdl.Entities.Item(i).Code = code1 Then
            Set ent1 = mdl.Entities.Item(i)
        End If
        If mdl.Entities.Item(i).Code = code2 Then
            Set ent2 = mdl.Entities.Item(i)
        End If
    Next
    
    If ent1 Is Nothing Or ent2 Is Nothing Then
        On Error GoTo 0
        Exit Sub
    End If
    
    Set rel = mdl.Relationships.CreateNew()
    rel.Name = relName
    rel.Code = code1 & "_A_" & code2
    rel.Comment = "Relation: " & code1 & " -> " & code2 & vbCrLf & "Cardinalite: " & card
    
    Set rel.Entity1 = ent1
    Set rel.Entity2 = ent2
    rel.Cardinality = card
    
    On Error GoTo 0
End Sub

'==============================================================================
' EXECUTION
'==============================================================================
Call Main()
