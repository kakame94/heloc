Option Explicit

' ================================================================
' Script : Création CTRL_HEBDO
' Entité : Contrôle Hebdomadaire
' ================================================================

Sub Main()
    Dim model
    Set model = ActiveModel
    
    If model Is Nothing Then
        MsgBox "Créez d'abord un CDM vide", vbCritical
        Exit Sub
    End If
    
    If Not model.IsKindOf(PdCDM.cls_Model) Then
        MsgBox "Le modèle actif n'est pas un MCD", vbCritical
        Exit Sub
    End If

    Dim ctrlHebdo, attr, ident
    
    Output "Création CTRL_HEBDO (suffixe 'CtrlHebdo')..."
    
    Set ctrlHebdo = model.Entities.CreateNew()
    ctrlHebdo.Name = "Contrôle Hebdomadaire"
    ctrlHebdo.Code = "CTRL_HEBDO"
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Clé contrôle rapport CtrlHebdo"
    attr.Code = "RAP_CTRL_CLE"
    attr.DataType = "I"
    attr.Mandatory = True
    
    Set ident = ctrlHebdo.Identifiers.CreateNew()
    ident.Name = "PK_CTRL_HEBDO"
    ident.Code = "PK_CTRL_HEBDO"
    ident.Attributes.Add attr
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Abréviation IG CtrlHebdo"
    attr.Code = "IG_ABREV"
    attr.DataType = "VA10"
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Nom fichier ZIP CtrlHebdo"
    attr.Code = "FICH_ZIP_NM"
    attr.DataType = "VA100"
    attr.Mandatory = True
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Nom fichier CtrlHebdo"
    attr.Code = "FICHIER_NM"
    attr.DataType = "VA100"
    attr.Mandatory = True
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Description CtrlHebdo"
    attr.Code = "DESCR"
    attr.DataType = "VA500"
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Date et heure envoi CtrlHebdo"
    attr.Code = "ENVOI_DH"
    attr.DataType = "DT"
    attr.Mandatory = True
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Nombre lignes CtrlHebdo"
    attr.Code = "LIGNES_NB"
    attr.DataType = "I"
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Statut chargement CtrlHebdo"
    attr.Code = "CHARG_STATUT_CD"
    attr.DataType = "VA20"
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Date chargement CtrlHebdo"
    attr.Code = "CHARG_DT"
    attr.DataType = "DT"
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Nombre enregistrements traités CtrlHebdo"
    attr.Code = "ENR_TRAIT_NB"
    attr.DataType = "I"
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Nombre enregistrements rejetés CtrlHebdo"
    attr.Code = "ENR_REJET_NB"
    attr.DataType = "I"
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Nombre enregistrements insérés CtrlHebdo"
    attr.Code = "ENR_INSERT_NB"
    attr.DataType = "I"
    
    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Nombre enregistrements modifiés CtrlHebdo"
    attr.Code = "ENR_MODIF_NB"
    attr.DataType = "I"

    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Nombre enregistrements actifs CtrlHebdo"
    attr.Code = "ENR_ACTIF_NB"
    attr.DataType = "I"

    Set attr = ctrlHebdo.Attributes.CreateNew()
    attr.Name = "Nombre enregistrements désactivés CtrlHebdo"
    attr.Code = "ENR_DESAC_NB"
    attr.DataType = "I"

    MsgBox "✅ Entité CTRL_HEBDO créée avec succès !", vbInformation
End Sub

Call Main()
