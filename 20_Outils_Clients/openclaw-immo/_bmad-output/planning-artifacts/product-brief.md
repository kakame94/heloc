# Product Brief — OpenClaw Immo

## Vision

Outil de recherche automatisée de **triplex et quadruplex** à **Gatineau** et dans la **grande région de Montréal** (≤ 610 000 $). Piloté par WhatsApp via OpenClaw, avec analyse financière québécoise intégrée et résultats consultables sur une page web.

## État actuel du projet

### ✅ Composants fonctionnels

| Composant | Fichiers clés | État |
|-----------|--------------|------|
| **Backend FastAPI** | `backend/app/main.py` | Structuré, 4 routers |
| **Scraper Centris** | `backend/app/scraper/centris.py` | Implémenté |
| **Scraper Realtor.ca** | `backend/app/scraper/realtor_ca.py` | Implémenté |
| **Analyse financière** | `backend/app/analysis/` | Cashflow, hypothèque, DCR, cap rate, CoC, taxe bienvenue |
| **Base PostgreSQL** | `backend/app/db/models.py` | 4 modèles ORM (Listing, Analysis, ScrapeRun, UserNote) |
| **Scheduler** | `backend/app/scheduler/` | APScheduler, scrape auto toutes les 4h |
| **Google Sheets sync** | `backend/app/sheets/` | Écriture via service account |
| **Page web** | `web/index.html` | Dark mode, vue table + cartes, filtres, tri |
| **Docker Compose** | `docker-compose.yml` | 3 services (db, backend, openclaw-gateway) |
| **Skills OpenClaw** | `skills/chercher-immo/`, `skills/sauver-immo/` | Définitions pour WhatsApp |

### 🔧 Points à valider / améliorer

1. **Tests** — Aucun test unitaire ou d'intégration détecté
2. **Migrations DB** — Pas d'Alembic configuré (init_db() crée les tables)
3. **CI/CD** — Aucun pipeline configuré
4. **Sécurité** — CORS `allow_origins=["*"]` à restreindre en prod
5. **Frontend** — Single HTML file, pas de framework (acceptable pour MVP)
6. **Monitoring** — Logging basique, pas de métriques

---

## Architecture technique

```
┌─────────────┐    WhatsApp    ┌──────────────────────────────────┐
│  Utilisateur │◄─────────────►│  OpenClaw Gateway (Docker)       │
│  (WhatsApp)  │               │  Skills: chercher + sauver       │
└─────────────┘               └──────────┬───────────────────────┘
                                         │ HTTP
┌─────────────┐   CSV/API      ┌─────────▼───────────────────────┐
│  Page Web    │◄──────────────│  Backend FastAPI (:8000)         │
│  (GitHub     │               │  ├── Scraper (Centris + Realtor) │
│   Pages)     │               │  ├── Analyse financière QC       │
└─────────────┘               │  ├── Scheduler (4h)              │
                               │  └── Google Sheets sync          │
                               └──────────┬───────────────────────┘
                                          │ asyncpg
                               ┌──────────▼───────────────────────┐
                               │  PostgreSQL 16 (:5432)            │
                               │  Tables: listings, analyses,      │
                               │          scrape_runs, user_notes  │
                               └───────────────────────────────────┘
```

## Modèle de données

| Table | Colonnes clés |
|-------|--------------|
| `listings` | mls_number, source, property_type, price, address, city, region, num_units, year_built, municipal_eval, listing_url |
| `analyses` | listing_id, cashflow_monthly, dcr, cap_rate, cash_on_cash, welcome_tax, mortgage_payment_monthly |
| `scrape_runs` | started_at, listings_found, new_listings, errors, status |
| `user_notes` | listing_id, is_favorite, is_rejected, note |

---

## Roadmap proposée

### Sprint 1 — Stabilisation & tests (priorité haute)

- [ ] Ajouter Alembic pour les migrations DB
- [ ] Écrire les tests unitaires (analysis, scraper parsing)
- [ ] Ajouter un test d'intégration API (health, listings)
- [ ] Configurer `.env` avec les vraies credentials Google Sheets
- [ ] Restreindre CORS pour la production

### Sprint 2 — Fonctionnalités essentielles

- [ ] Dashboard de suivi des scrapes (historique, erreurs)
- [ ] Alertes WhatsApp sur nouveaux biens avec cashflow positif
- [ ] API endpoint pour marquer favoris / rejeter
- [ ] Filtres avancés frontend (prix min/max, année construction, superficie)

### Sprint 3 — Production & déploiement

- [ ] Docker Compose production (secrets, healthchecks complets)
- [ ] CI/CD GitHub Actions (lint, tests, build)
- [ ] Déploiement cloud (VPS ou cloud gratuit)
- [ ] Monitoring et alertes (scraper en échec, DB pleine)

### Sprint 4 — Enrichissement

- [ ] Comparables CMHC / municipal (évaluation vs prix)
- [ ] Carte interactive (Leaflet.js avec positions GPS des biens)
- [ ] Export PDF du rapport financier par bien
- [ ] Historique des prix (suivi des baisses)
