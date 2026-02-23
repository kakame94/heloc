# OpenClaw Immo — Recherche Triplex Automatisée

Recherche automatisée de triplex/quadruplex à **Gatineau** et **grande région de
Montréal** (≤ 610 000 $), pilotée par **OpenClaw** via **WhatsApp**, isolée dans
**Docker**, avec résultats dans **Google Sheets** + **page web gratuite**.

## Architecture

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour le schéma complet.

```
Toi (WhatsApp) ↔ OpenClaw (Docker) → Google Sheets → Page Web (GitHub Pages)
```

## Structure du projet

```
openclaw-immo/
├── ARCHITECTURE.md          # Schéma d'architecture
├── README.md                # Ce fichier
├── docker-compose.yml       # Docker Compose (OpenClaw isolé)
├── .env.example             # Template variables d'environnement
├── .env                     # Variables d'env (NE PAS COMMITTER)
├── .gitignore
├── skills/
│   └── sauver-immo/
│       ├── manifest.json    # Définition du Skill OpenClaw
│       └── skill.py         # Script Python (ajout dans Google Sheets)
└── web/
    └── index.html           # Page web (lit Google Sheets, affiche la liste)
```

## Prérequis

- Docker Desktop (installé et démarré)
- Un compte Google (gratuit)
- Une clé API pour le modèle IA (Anthropic, OpenAI ou Google Gemini)
- Un téléphone avec WhatsApp

## Mise en route (5 étapes)

### 1. Google Sheets

1. Créer une feuille Google Sheets
2. Ajouter les en-têtes en ligne 1 :
   `Adresse | Prix | Type | Revenus | Lien | Secteur | Notes | Date`
3. **Publier** la feuille : Fichier → Partager → Publier sur le web → CSV
4. Copier l'ID de la feuille (dans l'URL : `https://docs.google.com/spreadsheets/d/ID_ICI/edit`)

### 2. Google Service Account (écriture API)

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com/)
2. Créer un projet (ex: `openclaw-immo`)
3. Activer l'API **Google Sheets API**
4. Créer un **Service Account** (IAM → Comptes de service → Créer)
5. Créer une **clé JSON** pour ce service account → télécharger le fichier
6. Partager la feuille Google Sheets avec l'email du service account
   (ex: `openclaw@openclaw-immo.iam.gserviceaccount.com`) → rôle **Éditeur**
7. Encoder le fichier JSON en base64 :
   ```bash
   base64 -i service-account.json | tr -d '\n'
   ```
8. Coller le résultat dans `.env` → `GOOGLE_SERVICE_ACCOUNT_JSON`

### 3. Variables d'environnement

```bash
cd openclaw-immo
cp .env.example .env
# Remplir .env avec :
#   - GOOGLE_SHEETS_ID
#   - GOOGLE_SERVICE_ACCOUNT_JSON (base64)
#   - Une clé API modèle (ANTHROPIC_API_KEY, OPENAI_API_KEY ou GOOGLE_AI_API_KEY)
```

### 4. Lancer OpenClaw dans Docker

```bash
# Onboard (configuration interactive — WhatsApp, modèle IA)
docker compose run --rm --profile cli openclaw-cli onboard

# Démarrer le gateway
docker compose up -d openclaw-gateway

# Vérifier
docker compose logs -f openclaw-gateway
```

Lors du onboard :
- Choisir **WhatsApp** comme canal
- Scanner le QR code avec ton téléphone
- Choisir le modèle IA (Anthropic recommandé)

### 5. Page Web

#### Option A : Ouvrir localement
```bash
open web/index.html
```

#### Option B : GitHub Pages (gratuit)
1. Créer un repo GitHub (ex: `triplex-recherche`)
2. Pousser le dossier `web/` dedans
3. Activer GitHub Pages dans Settings → Pages → Source: main, dossier: /
4. Modifier `SPREADSHEET_ID` dans `index.html` avec l'ID de ta feuille

L'URL sera : `https://ton-user.github.io/triplex-recherche/`

## Utilisation

### Rechercher des biens
Envoie sur WhatsApp :
> « Cherche des triplex et quadruplex à Gatineau et Montréal, max 610 000 $ sur Centris »

### Sauvegarder un bien manuellement
Envoie sur WhatsApp :
> « Ajoute ce bien : 45 Rue Hull, Gatineau, 589 000 $, triplex,
> revenus 2200$/mois, https://www.centris.ca/fr/triplex~a-vendre~gatineau/12345 »

### Consulter la liste
Ouvre ta page web ou le Google Sheets directement.

## Sécurité / Isolation

- OpenClaw tourne dans Docker → **aucun accès** aux fichiers de ton Mac
- Volumes Docker nommés (pas de montage de ~/Desktop, ~/Documents, etc.)
- Seules les variables d'env nécessaires sont passées au conteneur
- WhatsApp : seul ton numéro est autorisé (allowlist)

## Coûts

| Service            | Coût                |
|--------------------|---------------------|
| OpenClaw           | Gratuit (open source) |
| Docker             | Gratuit              |
| Google Sheets      | Gratuit              |
| Google Sheets API  | Gratuit (quota standard) |
| GitHub Pages       | Gratuit              |
| WhatsApp           | Gratuit              |
| **Modèle IA**      | **Payant** (Anthropic ~0.01$/requête, ou Gemini gratuit) |
