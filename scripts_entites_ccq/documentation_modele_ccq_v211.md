# MODÈLE DE DONNÉES CCQ - VERSION 2.11

Commission de la Construction du Québec

**Version alignée exactement sur le DDL SQL Server 2016**

Instance SQL Server: 
- Production : W367P002RPT1\W367P002RPT1B01
- IT : W367I002RPT1\W367I002RPT1B01

Base de données: SDEXT01 - Schémas: CCQ et CFG

---

## HISTORIQUE DES VERSIONS

| Version | Date | Auteur | Description des modifications |
|---------|------|--------|-------------------------------|
| 2.10 | 2025-11-19 | Eliot Alanmanou | Correction des contraintes NULL/NOT NULL selon DDL SQL v4 |
| **2.11** | **2026-01-22** | **Eliot Alanmanou** | **Alignement complet sur DDL SQL - Ajout tables AUDIT, restructuration EMPL_REL_HISTORY** |

---

## TABLE DES MATIÈRES

1. [Synthèse des Tables](#synthèse-des-tables)
2. [Tables d'Audit (CCQ)](#tables-daudit-ccq)
3. [Tables de Configuration (CFG)](#tables-de-configuration-cfg)
4. [Tables de Contrôle (CCQ)](#tables-de-contrôle-ccq)
5. [Tables Principales (CCQ)](#tables-principales-ccq)

---

## SYNTHÈSE DES TABLES

| # | Schéma | Table | Colonnes | PK | UK |
|---|--------|-------|----------|----|----|
| 1 | CCQ | CCQ_AUDIT_CHANGEMENTS_CRITIQUES | 10 | AUDIT_ID | - |
| 2 | CCQ | CCQ_AUDIT_CONFIG | 8 | CONFIG_ID | CD_CONFIG |
| 3 | CFG | CFG_CONFIG | 4 | CFG_ID | CD_SYSTEM |
| 4 | CFG | CFG_CONFIG_PARM | 6 | CFG_PARM_ID | CD_PARAM |
| 5 | CCQ | CTRL_HEBDO | 13 | RAP_CTRL_CLE | (FICH_ZIP_NM, FICHIER_NM) |
| 6 | CCQ | CTRL_INIT | 9 | RAP_CTRL_CLE | - |
| 7 | CCQ | EMPL_DOSS | 58 | EMPL_DOSS_ID | (CLIENT_EMP_NO, DEB_EFFECT_DT) |
| 8 | CCQ | EMPL_REL | 40 | EMPL_REL_ID | (CLIENT_REL_NO, CLIENT_EMP_NO, FONCTION_CD, DEB_EFFECT_DT) |
| 9 | CCQ | EMPL_REL_HISTORY | 37 | HISTORY_ID | - |
| 10 | CCQ | RAP_MENS_DET | 29 | RAP_MENS_DET_ID | (ACT_SAP_CLE, DEB_EFFECT_DT) |
| 11 | CCQ | RAP_MENS_ENT | 33 | RAP_MENS_ENT_ID | (RAP_SAP_CLE, DEB_EFFECT_DT) |
| 12 | CCQ | SALAR_DOSS | 47 | SALAR_DOSS_ID | (CLIENT_SAL_NO, DEB_EFFECT_DT) |

**Total : 12 tables, 294 colonnes**

---

## TABLES D'AUDIT (CCQ)

### CCQ.CCQ_AUDIT_CHANGEMENTS_CRITIQUES

| **Nom Physique** | **CCQ.CCQ_AUDIT_CHANGEMENTS_CRITIQUES** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 10 |
| **Description** | Table d'audit des changements critiques sur les entités |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | AUDIT_ID | INT IDENTITY | N | **X** | | Identifiant technique auto-incrémenté |
| 2 | ENTITE_TYPE | VARCHAR(20) | N | | | Type d'entité auditée |
| 3 | SOURCE_ID | VARCHAR(50) | N | | | Identifiant source |
| 4 | TARGET_ID | VARCHAR(50) | Y | | | Identifiant cible |
| 5 | CATEGORIE | VARCHAR(30) | N | | | Catégorie du changement |
| 6 | VALEUR_AVANT_TXT | VARCHAR(MAX) | Y | | | Valeur avant modification |
| 7 | VALEUR_APRES_TXT | VARCHAR(MAX) | Y | | | Valeur après modification |
| 8 | SOURCE_SYSTEM | VARCHAR(20) | Y | | | Système source |
| 9 | UPDATED_DT | DATETIME | N | | | Date de mise à jour |
| 10 | ID_CCQ | VARCHAR(50) | N | | | Identifiant CCQ |

**Contraintes :**
- **PK_CCQ_AUDIT_CHANGEMENTS_CRITI** : PRIMARY KEY (AUDIT_ID)

---

### CCQ.CCQ_AUDIT_CONFIG

| **Nom Physique** | **CCQ.CCQ_AUDIT_CONFIG** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 8 |
| **Description** | Configuration des audits par entité |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | CONFIG_ID | INT IDENTITY | N | **X** | | Identifiant technique auto-incrémenté |
| 2 | CD_CONFIG | VARCHAR(20) | N | | **X** | Code unique de configuration |
| 3 | ENTITE_TYPE | VARCHAR(20) | N | | | Type d'entité |
| 4 | REQ_SQL_AUDIT | VARCHAR(MAX) | N | | | Requête SQL d'audit |
| 5 | CATEGORIE | VARCHAR(30) | N | | | Catégorie |
| 6 | SOUS_CATEGORIE | VARCHAR(30) | Y | | | Sous-catégorie |
| 7 | EST_ACTIF | CHAR(1) | N | | | Indicateur actif (O/N) |
| 8 | RETENTION_JOURS | INT | Y | | | Nombre de jours de rétention |

**Contraintes :**
- **PK_CCQ_AUDIT_CONFIG** : PRIMARY KEY (CONFIG_ID)
- **UK_CCQ_AUDIT_CONFI_CCQ_AUDI** : UNIQUE (CD_CONFIG)

---

## TABLES DE CONFIGURATION (CFG)

### CFG.CFG_CONFIG

| **Nom Physique** | **CFG.CFG_CONFIG** |
|---|---|
| **Schéma** | CFG |
| **Colonnes** | 4 |
| **Description** | Configuration système ETL transversale |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | CFG_ID | BIGINT IDENTITY | N | **X** | | Identifiant technique |
| 2 | CD_SYSTEM | VARCHAR(10) | N | | **X** | Code système (CCQ, RBQ, ETS) |
| 3 | DESCR_SYSTEM | VARCHAR(200) | N | | | Description du système |
| 4 | IND_ACTIF | CHAR(1) | N | | | Indicateur actif |

**Contraintes :**
- **PK_CFG_CONFIG** : PRIMARY KEY (CFG_ID)
- **UK_CFG_CONFIG_METI_CFG_CONF** : UNIQUE (CD_SYSTEM)

---

### CFG.CFG_CONFIG_PARM

| **Nom Physique** | **CFG.CFG_CONFIG_PARM** |
|---|---|
| **Schéma** | CFG |
| **Colonnes** | 6 |
| **Description** | Paramètres de configuration par système |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | CFG_PARM_ID | BIGINT IDENTITY | N | **X** | | Identifiant technique |
| 2 | CD_PARAM | VARCHAR(20) | N | | **X** | Code paramètre |
| 3 | CD_SYSTEM | VARCHAR(10) | N | | | Code système |
| 4 | DESCR_PARAM | VARCHAR(200) | N | | | Description paramètre |
| 5 | VALEUR_PARM | VARCHAR(200) | N | | | Valeur paramètre |
| 6 | IND_ACTIF | CHAR(1) | N | | | Indicateur actif |

**Contraintes :**
- **PK_CFG_CONFIG_PARM** : PRIMARY KEY (CFG_PARM_ID)
- **UK_CFG_CONFIG_PARM_CFG_CONF** : UNIQUE (CD_PARAM)

---

## TABLES DE CONTRÔLE (CCQ)

### CCQ.CTRL_HEBDO

| **Nom Physique** | **CCQ.CTRL_HEBDO** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 13 |
| **Description** | Contrôle des fichiers hebdomadaires |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | RAP_CTRL_CLE | INT IDENTITY | N | **X** | | Clé contrôle rapport |
| 2 | IG_ABREV | VARCHAR(10) | Y | | | Abréviation IG |
| 3 | FICH_ZIP_NM | VARCHAR(100) | N | | **X** | Nom fichier ZIP |
| 4 | FICHIER_NM | VARCHAR(100) | N | | **X** | Nom fichier |
| 5 | DESCR | VARCHAR(500) | Y | | | Description |
| 6 | ENVOI_DH | DATETIME | N | | | Date heure envoi |
| 7 | LIGNES_NB | INT | Y | | | Nombre de lignes |
| 8 | CHARG_STATUT_CD | VARCHAR(20) | Y | | | Statut chargement |
| 9 | CHARG_DT | DATE | Y | | | Date chargement |
| 10 | ENR_TRAIT_NB | INT | Y | | | Enregistrements traités |
| 11 | ENR_REJET_NB | INT | Y | | | Enregistrements rejetés |
| 12 | ENR_INSERT_NB | INT | Y | | | Enregistrements insérés |
| 13 | ENR_MODIF_NB | INT | Y | | | Enregistrements modifiés |

**Contraintes :**
- **PK_CTRL_HEBDO** : PRIMARY KEY (RAP_CTRL_CLE)
- **UK_CTRL_HEBDO_FICH_ZIP_NM** : UNIQUE (FICH_ZIP_NM, FICHIER_NM)

---

### CCQ.CTRL_INIT

| **Nom Physique** | **CCQ.CTRL_INIT** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 9 |
| **Description** | Contrôle des fichiers initiaux |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | RAP_CTRL_CLE | INT IDENTITY | N | **X** | | Clé contrôle rapport |
| 2 | IG_ABREV | VARCHAR(10) | Y | | | Abréviation IG |
| 3 | FICH_ZIP_NM | VARCHAR(100) | N | | | Nom fichier ZIP |
| 4 | FICHIER_NM | VARCHAR(100) | N | | | Nom fichier |
| 5 | DESCR | VARCHAR(500) | Y | | | Description |
| 6 | ENVOI_DH | DATETIME | N | | | Date heure envoi |
| 7 | LIGNES_NB | INT | Y | | | Nombre de lignes |
| 8 | CHARG_STATUT_CD | VARCHAR(20) | Y | | | Statut chargement |
| 9 | CHARG_DT | DATE | Y | | | Date chargement |

**Contraintes :**
- **PK_CTRL_INIT** : PRIMARY KEY (RAP_CTRL_CLE)

---

## TABLES PRINCIPALES (CCQ)

### CCQ.EMPL_DOSS - Dossier Employeur

| **Nom Physique** | **CCQ.EMPL_DOSS** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 58 |
| **Description** | Table principale des employeurs avec gestion SCD Type 2 |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | EMPL_DOSS_ID | INT IDENTITY | N | **X** | | Identifiant technique |
| 2 | CLIENT_EMP_NO | VARCHAR(10) | N | | **X** | Numéro client employeur |
| 3 | DEB_EFFECT_DT | DATE | N | | **X** | Date début effectivité |
| 4 | FIN_EFFECT_DT | DATE | Y | | | Date fin effectivité |
| 5 | REG_ADMIN_CD | VARCHAR(2) | Y | | | Code région administrative |
| 6 | CMEQ_IND | CHAR(1) | Y | | | Indicateur CMEQ |
| 7 | CMMTQ_IND | CHAR(1) | Y | | | Indicateur CMMTQ |
| 8 | INTERV_NO | VARCHAR(10) | Y | | | Numéro intervenant |
| 9 | ENTRP_NM | VARCHAR(200) | N | | | Nom entreprise |
| 10 | ENTRP_AUTRE_NM | VARCHAR(200) | Y | | | Autre nom entreprise |
| 11 | AFF_ADR | VARCHAR(200) | Y | | | Adresse affaires |
| 12 | AFF_VILLE_NM | VARCHAR(100) | Y | | | Ville affaires |
| 13 | AFF_PROV_CD | CHAR(2) | Y | | | Province affaires |
| 14 | AFF_CP_CD | VARCHAR(10) | Y | | | Code postal affaires |
| 15 | AFF_PAYS_NM | VARCHAR(50) | Y | | | Pays affaires |
| 16 | CORR_ADR | VARCHAR(200) | Y | | | Adresse correspondance |
| 17 | CORR_VILLE_NM | VARCHAR(100) | Y | | | Ville correspondance |
| 18 | CORR_PROV_CD | CHAR(2) | Y | | | Province correspondance |
| 19 | CORR_CP_CD | VARCHAR(10) | Y | | | Code postal correspondance |
| 20 | CORR_PAYS_NM | VARCHAR(50) | Y | | | Pays correspondance |
| 21 | BUR_QC_ADR | VARCHAR(200) | Y | | | Adresse bureau Québec |
| 22 | BUR_QC_VILLE_NM | VARCHAR(50) | Y | | | Ville bureau Québec |
| 23 | BUR_QC_PROV_CD | CHAR(2) | Y | | | Province bureau Québec |
| 24 | BUR_QC_CP_CD | VARCHAR(10) | Y | | | Code postal bureau Québec |
| 25 | BUR_QC_PAYS_NM | VARCHAR(50) | Y | | | Pays bureau Québec |
| 26 | LIEU_VERIF_REG | VARCHAR(50) | Y | | | Lieu vérification régionale |
| 27 | BLOC_AFF_ADR_CD | VARCHAR(10) | Y | | | Code blocage adresse affaires |
| 28 | BLOC_CORR_ADR_CD | VARCHAR(10) | Y | | | Code blocage adresse correspondance |
| 29 | BLOC_BUR_ADR_CD | VARCHAR(10) | Y | | | Code blocage adresse bureau |
| 30 | TEL_PRINC_NO | VARCHAR(40) | Y | | | Téléphone principal |
| 31 | TEL_AUTRE_NO | VARCHAR(40) | Y | | | Téléphone autre |
| 32 | FAX_NO | VARCHAR(20) | Y | | | Numéro fax |
| 33 | COURRIEL_ADR | VARCHAR(100) | Y | | | Adresse courriel |
| 34 | DATE_ENREG | DATETIME | Y | | | Date enregistrement |
| 35 | DATE_DEB_TRAV | DATETIME | Y | | | Date début travaux |
| 36 | STATUT_JUR_CD | VARCHAR(50) | Y | | | Code statut juridique |
| 37 | STATUT_JUR_DT | DATETIME | Y | | | Date statut juridique |
| 38 | TYPE_EMP_CD | CHAR(2) | Y | | | Code type employeur |
| 39 | STATUT_AFF_CD | VARCHAR(20) | Y | | | Code statut affaire |
| 40 | STATUT_AFF_DT | DATETIME | Y | | | Date statut affaire |
| 41 | EMP_RECONNU_IND | CHAR(1) | Y | | | Indicateur employeur reconnu |
| 42 | NEQ_NO | VARCHAR(10) | Y | | | Numéro NEQ |
| 43 | NEQ_STATUT_CD | VARCHAR(40) | Y | | | Code statut NEQ |
| 44 | NO_DOSSIER_RBQ | VARCHAR(20) | Y | | | Numéro dossier RBQ |
| 45 | LIC_CCQ1_TYPE | CHAR(2) | Y | | | Type licence CCQ 1 |
| 46 | LIC_CCQ1_STATUT | CHAR(1) | Y | | | Statut licence CCQ 1 |
| 47 | LIC_CCQ2_TYPE | CHAR(2) | Y | | | Type licence CCQ 2 |
| 48 | LIC_CCQ2_STATUT | CHAR(1) | Y | | | Statut licence CCQ 2 |
| 49 | DT_INSOLVABILITE | DATETIME | Y | | | Date insolvabilité |
| 50 | RAISON_INSOLVABILITE | VARCHAR(200) | Y | | | Raison insolvabilité |
| 51 | NO_EMP_ANCIEN | VARCHAR(60) | Y | | | Numéro employeur ancien |
| 52 | NO_EMP_NOUVEAU | VARCHAR(60) | Y | | | Numéro employeur nouveau |
| 53 | DERN_CHG_DT | DATETIME | Y | | | Date dernier changement |
| 54 | ACTIF_IND | CHAR(1) | N | | | Indicateur actif |
| 55 | CREAT_DT | DATETIME | N | | | Date création |
| 56 | CREAT_UTIL_ID | VARCHAR(50) | N | | | Utilisateur création |
| 57 | MODIF_DT | DATETIME | Y | | | Date modification |
| 58 | MODIF_UTIL_ID | VARCHAR(50) | Y | | | Utilisateur modification |

**Contraintes :**
- **PK_EMPL_DOSS** : PRIMARY KEY (EMPL_DOSS_ID)
- **UK_EMPL_DOSS_METIE_EMPL_DOS** : UNIQUE (CLIENT_EMP_NO, DEB_EFFECT_DT)

---

### CCQ.EMPL_REL - Relations Employeur

| **Nom Physique** | **CCQ.EMPL_REL** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 40 |
| **Description** | Table des personnes liées aux employeurs |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | EMPL_REL_ID | INT IDENTITY | N | **X** | | Identifiant technique |
| 2 | CLIENT_REL_NO | VARCHAR(10) | N | | **X** | Numéro client relation |
| 3 | DEB_EFFECT_DT | DATE | N | | **X** | Date début effectivité |
| 4 | CLIENT_EMP_NO | VARCHAR(10) | N | | **X** | Numéro client employeur |
| 5 | FONCTION_CD | VARCHAR(50) | Y | | **X** | Code fonction |
| 6 | FIN_EFFECT_DT | DATE | Y | | | Date fin effectivité |
| 7 | REG_ADMIN_CD | VARCHAR(2) | Y | | | Code région administrative |
| 8 | ENTRP_NM | VARCHAR(200) | Y | | | Nom entreprise |
| 9 | NOM | VARCHAR(50) | N | | | Nom |
| 10 | PRENOM | VARCHAR(50) | N | | | Prénom |
| 11 | NAISS_DT | DATETIME | Y | | | Date naissance |
| 12 | ENTRP_REL_NM | VARCHAR(200) | Y | | | Nom entreprise relation |
| 13 | AUTRE_NOM_ENTRP_REL | VARCHAR(200) | Y | | | Autre nom entreprise relation |
| 14 | ADR | VARCHAR(200) | Y | | | Adresse |
| 15 | VILLE_NM | VARCHAR(50) | Y | | | Ville |
| 16 | PROV_CD | VARCHAR(3) | Y | | | Code province |
| 17 | CP_CD | VARCHAR(10) | Y | | | Code postal |
| 18 | PAYS_NM | VARCHAR(50) | Y | | | Pays |
| 19 | TEL_NO | VARCHAR(40) | Y | | | Numéro téléphone |
| 20 | TEL_AUTRE_NO | VARCHAR(40) | Y | | | Numéro téléphone autre |
| 21 | FAX_NO | VARCHAR(20) | Y | | | Numéro fax |
| 22 | NOTE_TEL | VARCHAR(50) | Y | | | Note téléphone |
| 23 | NOTE_TEL_AUTRE | VARCHAR(50) | Y | | | Note téléphone autre |
| 24 | COURRIEL_ADR | VARCHAR(100) | Y | | | Adresse courriel |
| 25 | STATUT_REL_CD | VARCHAR(20) | Y | | | Code statut relation |
| 26 | DERN_CHG_DT | DATETIME | Y | | | Date dernier changement |
| 27 | DT_DEB_VALIDITE | DATETIME | Y | | | Date début validité |
| 28 | DT_FIN_VALIDITE | DATETIME | Y | | | Date fin validité |
| 29 | DT_INSOLVABILITE | DATETIME | Y | | | Date insolvabilité |
| 30 | DT_DECES | DATETIME | Y | | | Date décès |
| 31 | DT_PRESUME_DECES | DATETIME | Y | | | Date présumé décès |
| 32 | DT_DEB_FONCTION | DATETIME | Y | | | Date début fonction |
| 33 | DT_FIN_FONCTION | DATETIME | Y | | | Date fin fonction |
| 34 | DT_RECEP_DESIGNATION | DATETIME | Y | | | Date réception désignation |
| 35 | DT_ENR_DESIGNATION | DATETIME | Y | | | Date enregistrement désignation |
| 36 | ACTIF_IND | CHAR(1) | N | | | Indicateur actif |
| 37 | CREAT_DT | DATETIME | N | | | Date création |
| 38 | CREAT_UTIL_ID | VARCHAR(50) | N | | | Utilisateur création |
| 39 | MODIF_DT | DATETIME | Y | | | Date modification |
| 40 | MODIF_UTIL_ID | VARCHAR(50) | Y | | | Utilisateur modification |

**Contraintes :**
- **PK_EMPL_REL** : PRIMARY KEY (EMPL_REL_ID)
- **UK_EMPL_REL_METIER_EMPL_REL** : UNIQUE (CLIENT_REL_NO, CLIENT_EMP_NO, FONCTION_CD, DEB_EFFECT_DT)

---

### CCQ.EMPL_REL_HISTORY - Historique Relations

| **Nom Physique** | **CCQ.EMPL_REL_HISTORY** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 37 |
| **Description** | Historique des relations employeur (migration legacy) |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | HISTORY_ID | INT IDENTITY | N | **X** | | Identifiant historique |
| 2 | CLIENT_REL_NO | VARCHAR(10) | N | | | Numéro client relation |
| 3 | DEB_EFFECT_DT | DATE | N | | | Date début effectivité |
| 4 | FIN_EFFECT_DT | DATE | Y | | | Date fin effectivité |
| 5 | CLIENT_EMP_NO | VARCHAR(10) | N | | | Numéro client employeur |
| 6 | REG_ADMIN_NM | VARCHAR(50) | Y | | | Nom région administrative |
| 7 | ENTRP_NM | VARCHAR(200) | Y | | | Nom entreprise |
| 8 | FONCTION_NM | VARCHAR(50) | Y | | | Nom fonction |
| 9 | NOM | VARCHAR(50) | N | | | Nom |
| 10 | PRENOM | VARCHAR(50) | N | | | Prénom |
| 11 | ENTRP_REL_NM | VARCHAR(200) | Y | | | Nom entreprise relation |
| 12 | AUTRE_NOM_ENTRP_REL | VARCHAR(200) | Y | | | Autre nom entreprise relation |
| 13 | ADR | VARCHAR(200) | Y | | | Adresse |
| 14 | VILLE_NM | VARCHAR(50) | Y | | | Ville |
| 15 | PROV_CD | VARCHAR(3) | Y | | | Code province |
| 16 | CP_CD | VARCHAR(10) | Y | | | Code postal |
| 17 | PAYS_NM | VARCHAR(50) | Y | | | Pays |
| 18 | TEL_NO | VARCHAR(40) | Y | | | Numéro téléphone |
| 19 | TEL_AUTRE_NO | VARCHAR(40) | Y | | | Numéro téléphone autre |
| 20 | FAX_NO | VARCHAR(20) | Y | | | Numéro fax |
| 21 | COURRIEL_ADR | VARCHAR(100) | Y | | | Adresse courriel |
| 22 | INSOLVAB_DT | DATETIME | Y | | | Date insolvabilité |
| 23 | NAISS_DT | DATETIME | Y | | | Date naissance |
| 24 | DECES_DT | DATETIME | Y | | | Date décès |
| 25 | PRESUME_DECES_DT | DATETIME | Y | | | Date présumé décès |
| 26 | DEB_FONCTION_DT | DATETIME | Y | | | Date début fonction |
| 27 | FIN_FONCTION_DT | DATETIME | Y | | | Date fin fonction |
| 28 | RECEPT_DESIGN_DT | DATETIME | Y | | | Date réception désignation |
| 29 | ENREG_DESIGN_DT | DATETIME | Y | | | Date enregistrement désignation |
| 30 | STATUT_REL_NM | VARCHAR(20) | Y | | | Nom statut relation |
| 31 | ACTIF_IND | CHAR(1) | N | | | Indicateur actif |
| 32 | CREAT_DT | DATETIME | N | | | Date création |
| 33 | CREAT_UTIL_ID | VARCHAR(50) | N | | | Utilisateur création |
| 34 | MODIF_DT | DATETIME | Y | | | Date modification |
| 35 | MODIF_UTIL_ID | VARCHAR(50) | Y | | | Utilisateur modification |
| 36 | MIGRATION_FLAG | CHAR(1) | N | | | Flag migration |
| 37 | MIGRATION_DATE | DATETIME | N | | | Date migration |

**Contraintes :**
- **PK_EMPL_REL_HISTORY** : PRIMARY KEY (HISTORY_ID)

---

### CCQ.RAP_MENS_DET - Rapport Mensuel Détail

| **Nom Physique** | **CCQ.RAP_MENS_DET** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 29 |
| **Description** | Détails des rapports mensuels |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | RAP_MENS_DET_ID | INT IDENTITY | N | **X** | | Identifiant technique |
| 2 | ACT_SAP_CLE | VARCHAR(50) | N | | **X** | Clé activité SAP |
| 3 | DEB_EFFECT_DT | DATE | N | | **X** | Date début effectivité |
| 4 | FIN_EFFECT_DT | DATE | Y | | | Date fin effectivité |
| 5 | RAP_SAP_CLE | VARCHAR(50) | N | | | Clé rapport SAP |
| 6 | CLIENT_EMP_NO | VARCHAR(10) | N | | | Numéro client employeur |
| 7 | CLIENT_SAL_NO | VARCHAR(10) | N | | | Numéro client salarié |
| 8 | ACTIF_IND | CHAR(1) | N | | | Indicateur actif |
| 9 | PER_ENV_DEB_DT | DATETIME | N | | | Date début période envoi |
| 10 | PER_ENV_FIN_DT | DATETIME | N | | | Date fin période envoi |
| 11 | PERIODE_CD | VARCHAR(7) | Y | | | Code période |
| 12 | PRENOM | VARCHAR(50) | N | | | Prénom |
| 13 | NOM | VARCHAR(50) | N | | | Nom |
| 14 | SEM_TRAV_NB | INT | Y | | | Nombre semaines travaillées |
| 15 | METIER_CD | VARCHAR(3) | Y | | | Code métier |
| 16 | METIER_NM | VARCHAR(100) | Y | | | Nom métier |
| 17 | SECTEUR_CD | CHAR(1) | Y | | | Code secteur |
| 18 | SECTEUR_NM | VARCHAR(50) | Y | | | Nom secteur |
| 19 | HRS_SAL_SOM | DECIMAL(10,2) | Y | | | Somme heures salarié |
| 20 | STAT_SAL_CD | VARCHAR(2) | Y | | | Code statut salarial |
| 21 | TOT_AV_SOC_AMT | DECIMAL(15,2) | Y | | | Montant total avantages sociaux |
| 22 | CD_ANNEXE_SAL | VARCHAR(10) | Y | | | Code annexe salariale |
| 23 | ANNEXE_SAL_DESC | VARCHAR(100) | Y | | | Description annexe salariale |
| 24 | EMP_CMEQ_IND | VARCHAR(3) | Y | | | Indicateur CMEQ employeur |
| 25 | EMP_CMMTQ_IND | VARCHAR(3) | Y | | | Indicateur CMMTQ employeur |
| 26 | CREAT_DT | DATETIME | N | | | Date création |
| 27 | CREAT_UTIL_ID | VARCHAR(50) | N | | | Utilisateur création |
| 28 | MODIF_DT | DATETIME | Y | | | Date modification |
| 29 | MODIF_UTIL_ID | VARCHAR(50) | Y | | | Utilisateur modification |

**Contraintes :**
- **PK_RAP_MENS_DET** : PRIMARY KEY (RAP_MENS_DET_ID)
- **UK_RAP_MENS_DET_ME_RAP_MENS** : UNIQUE (ACT_SAP_CLE, DEB_EFFECT_DT)

---

### CCQ.RAP_MENS_ENT - Rapport Mensuel Entête

| **Nom Physique** | **CCQ.RAP_MENS_ENT** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 33 |
| **Description** | Entêtes des rapports mensuels |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | RAP_MENS_ENT_ID | INT IDENTITY | N | **X** | | Identifiant technique |
| 2 | RAP_SAP_CLE | VARCHAR(50) | N | | **X** | Clé rapport SAP |
| 3 | DEB_EFFECT_DT | DATE | N | | **X** | Date début effectivité |
| 4 | FIN_EFFECT_DT | DATE | Y | | | Date fin effectivité |
| 5 | CLIENT_EMP_NO | VARCHAR(10) | N | | | Numéro client employeur |
| 6 | ACTIF_IND | CHAR(1) | N | | | Indicateur actif |
| 7 | PER_ENV_DEB_DT | DATETIME | Y | | | Date début période envoi |
| 8 | PER_ENV_FIN_DT | DATETIME | Y | | | Date fin période envoi |
| 9 | FISC_DEB_DT | DATETIME | Y | | | Date début période fiscale |
| 10 | FISC_FIN_DT | DATETIME | Y | | | Date fin période fiscale |
| 11 | RAPPORT_NO | VARCHAR(20) | N | | | Numéro rapport |
| 12 | AMEND_NB | INT | Y | | | Nombre amendement |
| 13 | RAP_STATUT_CD | VARCHAR(20) | Y | | | Code statut rapport |
| 14 | TYPE_RAP_CD | VARCHAR(20) | Y | | | Code type rapport |
| 15 | ENTRP_NM | VARCHAR(200) | Y | | | Nom entreprise |
| 16 | TOT_RM_AMT | DECIMAL(15,2) | Y | | | Montant total RM |
| 17 | SOLDE_RM_AMT | DECIMAL(15,2) | Y | | | Solde rapport mensuel |
| 18 | TOT_AV_SOC_AMT | DECIMAL(15,2) | Y | | | Montant total avantages sociaux |
| 19 | MNT_NET_CARCAP | DECIMAL(15,2) | Y | | | Montant net CARCAP |
| 20 | AJOUT_MOD_IND | CHAR(1) | Y | | | Indicateur ajout modification |
| 21 | SOUM_RM_DT | DATETIME | Y | | | Date soumission rapport |
| 22 | TOT_HEURE_RM | DECIMAL(10,2) | Y | | | Total heures rapport |
| 23 | SOLDE_RECL_AMT | DECIMAL(15,2) | Y | | | Solde réclamation |
| 24 | DEB_PER_RECL_DT | DATETIME | Y | | | Date début période réclamation |
| 25 | FIN_PER_RECL_DT | DATETIME | Y | | | Date fin période réclamation |
| 26 | NO_RECLAMATION | VARCHAR(20) | Y | | | Numéro réclamation |
| 27 | EST_EMP_ENQUETE_IND | CHAR(1) | Y | | | Indicateur employeur en enquête |
| 28 | EST_RAP_RETARD_IND | CHAR(1) | Y | | | Indicateur rapport en retard |
| 29 | DERN_CHG_DT | DATETIME | Y | | | Date dernier changement |
| 30 | CREAT_DT | DATETIME | N | | | Date création |
| 31 | CREAT_UTIL_ID | VARCHAR(50) | N | | | Utilisateur création |
| 32 | MODIF_DT | DATETIME | Y | | | Date modification |
| 33 | MODIF_UTIL_ID | VARCHAR(50) | Y | | | Utilisateur modification |

**Contraintes :**
- **PK_RAP_MENS_ENT** : PRIMARY KEY (RAP_MENS_ENT_ID)
- **UK_RAP_MENS_ENT_ME_RAP_MENS** : UNIQUE (RAP_SAP_CLE, DEB_EFFECT_DT)

---

### CCQ.SALAR_DOSS - Dossier Salarié

| **Nom Physique** | **CCQ.SALAR_DOSS** |
|---|---|
| **Schéma** | CCQ |
| **Colonnes** | 47 |
| **Description** | Table principale des salariés avec gestion SCD Type 2 |

**Attributs :**

| # | Nom Physique | Type | Null | PK | UK | Description |
|---|--------------|------|------|----|----|-------------|
| 1 | SALAR_DOSS_ID | INT IDENTITY | N | **X** | | Identifiant technique |
| 2 | CLIENT_SAL_NO | VARCHAR(10) | N | | **X** | Numéro client salarié |
| 3 | DEB_EFFECT_DT | DATE | N | | **X** | Date début effectivité |
| 4 | FIN_EFFECT_DT | DATE | Y | | | Date fin effectivité |
| 5 | ACTIF_IND | CHAR(1) | N | | | Indicateur actif |
| 6 | ENREG_DT | DATETIME | Y | | | Date enregistrement |
| 7 | NOM | VARCHAR(50) | N | | | Nom |
| 8 | PRENOM | VARCHAR(50) | N | | | Prénom |
| 9 | NAISS_DT | DATETIME | Y | | | Date naissance |
| 10 | NAISS_STATUT_CD | VARCHAR(20) | Y | | | Code statut date naissance |
| 11 | GENRE_CD | CHAR(1) | Y | | | Code genre |
| 12 | CORR_ADR_L1 | VARCHAR(200) | Y | | | Adresse correspondance ligne 1 |
| 13 | CORR_MUN_NM | VARCHAR(50) | Y | | | Municipalité correspondance |
| 14 | CORR_REG_CD | CHAR(2) | Y | | | Code région correspondance |
| 15 | CORR_PROV_CD | CHAR(2) | Y | | | Code province correspondance |
| 16 | CORR_CP_CD | VARCHAR(10) | Y | | | Code postal correspondance |
| 17 | CORR_PAYS_FR_DESC | VARCHAR(50) | Y | | | Pays correspondance français |
| 18 | CORR_PAYS_NM | VARCHAR(50) | Y | | | Pays correspondance |
| 19 | CORR_CHG_ADR_DT | DATETIME | Y | | | Date changement adresse correspondance |
| 20 | CORR_NON_LIV_CD | VARCHAR(10) | Y | | | Code non livrable correspondance |
| 21 | CORR_NON_LIV_DESC | VARCHAR(200) | Y | | | Description non livrable |
| 22 | DOM_ADR_L1 | VARCHAR(200) | Y | | | Adresse domicile ligne 1 |
| 23 | DOM_MUN_NM | VARCHAR(50) | Y | | | Municipalité domicile |
| 24 | DOM_PROV_CD | CHAR(2) | Y | | | Code province domicile |
| 25 | DOM_CP_CD | VARCHAR(10) | Y | | | Code postal domicile |
| 26 | DOM_PAYS_NM | VARCHAR(50) | Y | | | Pays domicile |
| 27 | DOM_CHG_ADR_DT | DATETIME | Y | | | Date changement adresse domicile |
| 28 | TEL_PRINC_NO | VARCHAR(40) | Y | | | Téléphone principal |
| 29 | TEL_AUTRE_NO | VARCHAR(40) | Y | | | Téléphone autre |
| 30 | REG_ADMIN_CD | VARCHAR(2) | Y | | | Code région administrative |
| 31 | REG_ADMIN_NM | VARCHAR(50) | Y | | | Nom région administrative |
| 32 | REG_TRAV_CD | VARCHAR(10) | Y | | | Code région travail |
| 33 | REG_TRAV_NM | VARCHAR(50) | Y | | | Nom région travail |
| 34 | METIER_PRIO_CD | VARCHAR(3) | Y | | | Code métier prioritaire |
| 35 | METIER_PRIO_NM | VARCHAR(100) | Y | | | Nom métier prioritaire |
| 36 | EMP_PRF_NO | VARCHAR(10) | Y | | | Numéro employeur préféré |
| 37 | CERT1_TYPE_CD | VARCHAR(50) | Y | | | Code type certificat 1 |
| 38 | CERT1_ECH_DT | DATETIME | Y | | | Date échéance certificat 1 |
| 39 | CERT2_TYPE_CD | VARCHAR(50) | Y | | | Code type certificat 2 |
| 40 | CERT2_ECH_DT | DATETIME | Y | | | Date échéance certificat 2 |
| 41 | DEB_INVAL_DT | DATETIME | Y | | | Date début invalidité |
| 42 | DECES_PRESUME_DT | DATETIME | Y | | | Date décès présumé |
| 43 | DECES_CONFIRME_DT | DATETIME | Y | | | Date décès confirmé |
| 44 | CREAT_DT | DATETIME | N | | | Date création |
| 45 | CREAT_UTIL_ID | VARCHAR(50) | N | | | Utilisateur création |
| 46 | MODIF_DT | DATETIME | Y | | | Date modification |
| 47 | MODIF_UTIL_ID | VARCHAR(50) | Y | | | Utilisateur modification |

**Contraintes :**
- **PK_SALAR_DOSS** : PRIMARY KEY (SALAR_DOSS_ID)
- **UK_SALAR_DOSS_METI_SALAR_DO** : UNIQUE (CLIENT_SAL_NO, DEB_EFFECT_DT)

---

## CONTACTS PROJET

| Rôle | Nom | Email |
|------|-----|-------|
| Architecte de données | Eliot Alanmanou | eliot.alanmanou-ext@rbq.gouv.qc.ca |

---

**Document créé le 22-01-2026**  
**Version 2.11 - Alignement complet sur DDL SQL Server 2016**
