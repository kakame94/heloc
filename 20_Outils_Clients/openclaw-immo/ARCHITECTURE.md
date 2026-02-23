# Architecture — OpenClaw Immo (Recherche Triplex)

## Vue d'ensemble

```
┌──────────────┐     WhatsApp      ┌────────────────────────────────┐
│  Toi (tel.)  │ ◄──────────────► │  OpenClaw (Docker)             │
│  WhatsApp    │                   │  ┌──────────────────────────┐  │
└──────────────┘                   │  │ Gateway + Agent           │  │
                                   │  │  • Canal : WhatsApp       │  │
                                   │  │  • Skill : chercher_immo  │  │
                                   │  │  • Skill : sauver_immo    │  │
                                   │  │  • Navigateur (Chromium)  │  │
                                   │  └──────────┬───────────────┘  │
                                   │             │                   │
                                   │  ┌──────────▼───────────────┐  │
                                   │  │ Sandbox Docker            │  │
                                   │  │  • Pas d'accès ~/Desktop  │  │
                                   │  │  • Pas d'accès ~/Docs     │  │
                                   │  │  • Workspace isolé        │  │
                                   │  └──────────────────────────┘  │
                                   └──────────────┬─────────────────┘
                                                  │ API (HTTPS)
                                   ┌──────────────▼─────────────────┐
                                   │  Google Sheets (gratuit)        │
                                   │  "Recherche Triplex"            │
                                   │  ┌────────────────────────────┐ │
                                   │  │ Adresse | Prix | Lien |   │ │
                                   │  │         | Revenus | Date  │ │
                                   │  └────────────────────────────┘ │
                                   └──────────────┬─────────────────┘
                                                  │ Lecture publique
                                   ┌──────────────▼─────────────────┐
                                   │  Page Web (GitHub Pages)        │
                                   │  index.html                     │
                                   │  • Lit Google Sheets (CSV pub.) │
                                   │  • Affiche liste avec liens     │
                                   │  • Filtres, tri par prix        │
                                   │  GRATUIT (GitHub Pages)         │
                                   └────────────────────────────────┘
```

## Composants

### 1. OpenClaw dans Docker (isolé)
- **Image** : `alpine/openclaw` (Docker Hub)
- **Canal** : WhatsApp (QR code login)
- **Sandbox** : activé, workspace restreint
- **Pas d'accès** aux fichiers perso du Mac
- **Navigateur** : Chromium sandboxé pour chercher sur Centris/DuProprio

### 2. Google Sheets (stockage gratuit)
- Une feuille Google Sheets publique en lecture
- Colonnes : Adresse, Prix, Type, Revenus, Lien, Secteur, Date ajout
- Écriture via API Google Sheets (service account gratuit)
- Lecture via URL CSV publique (pas de clé API côté page web)

### 3. Page Web (GitHub Pages — gratuit)
- Simple page HTML/CSS/JS
- Lit le Google Sheets publié en CSV
- Affiche un tableau filtrable avec les liens vers les biens
- Hébergée gratuitement sur GitHub Pages

### 4. Flux de travail

1. **Toi** → WhatsApp : « Cherche des triplex Gatineau/MTL sous 610k »
2. **OpenClaw** → Ouvre Centris dans le navigateur sandboxé
3. **OpenClaw** → Extrait les biens (adresse, prix, lien)
4. **OpenClaw** → Appelle l'API Google Sheets pour ajouter les biens
5. **OpenClaw** → WhatsApp : « 12 nouveaux biens ajoutés à ta liste »
6. **Toi** → Ouvre la page web pour consulter la liste

## Sécurité / Isolation

| Élément                | Accès autorisé                       |
|------------------------|--------------------------------------|
| Fichiers perso Mac     | ❌ Aucun accès                       |
| ~/.ssh, ~/.aws, .env   | ❌ Aucun accès                       |
| Workspace OpenClaw     | ✅ ~/.openclaw/ uniquement           |
| Internet (sortant)     | ✅ Centris, Google Sheets API        |
| WhatsApp               | ✅ Ton numéro uniquement (allowlist) |

## Coûts

| Service          | Coût     |
|------------------|----------|
| OpenClaw         | Gratuit (open source)  |
| Docker           | Gratuit (Docker Desktop) |
| Google Sheets    | Gratuit (compte Google)  |
| Google Sheets API| Gratuit (quota standard) |
| GitHub Pages     | Gratuit                  |
| WhatsApp         | Gratuit (numéro perso)   |
| **Seul coût**    | **Clé API du modèle IA** (Anthropic, OpenAI ou Gemini) |
