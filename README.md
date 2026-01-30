# PlexInvest Québec 🏠

**Plateforme SaaS d'investissement immobilier BRRRR & HELOC pour le Québec**

Application web permettant aux investisseurs de rechercher, analyser et gérer des projets immobiliers selon la stratégie BRRRR (Buy, Rehab, Rent, Refinance, Repeat) avec les règles réglementaires canadiennes intégrées.

## 🎯 Fonctionnalités Principales

### Calculateur BRRRR
- Analyse complète des 4 phases: Acquisition → Rénovation → Location → Refinancement
- Calculs hypothécaires canadiens (composition semi-annuelle)
- Droits de mutation par municipalité (Montréal, Québec, Laval, etc.)
- KPIs: Cash-on-Cash, Cap Rate, DCR, Cashflow

### Calculateur HELOC
- Capacité disponible selon règles BSIF B-20
- Portion rotative (max 65% LTV) vs portion amortie (65-80% LTV)
- Puissance d'achat totale pour réinvestissement

### Règles Réglementaires Hard-Coded
| Règle | Valeur | Source |
|-------|--------|--------|
| HELOC Rotatif Max | 65% LTV | BSIF B-20 |
| Refinancement Max | 80% LTV | BSIF B-20 |
| Stress Test | +2% ou 5.25% | BSIF B-20 |
| DCR Minimum Commercial | 1.25x | Standard bancaire |
| MLI Select Max Amort | 50 ans | SCHL |

## 🛠 Stack Technologique

### Frontend
- **Next.js 15** - React framework avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **Shadcn/UI** - Composants accessibles
- **Recharts** - Visualisations
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Hook Form + Zod** - Formulaires et validation

### Backend
- **FastAPI** - API Python haute performance
- **Pydantic** - Validation des données
- **SQLAlchemy** - ORM
- **Celery** - Tâches en arrière-plan

### Base de Données
- **PostgreSQL 16** - Base relationnelle
- **PostGIS** - Extension géospatiale
- **Prisma** - ORM TypeScript

### Infrastructure
- **Docker** - Conteneurisation
- **Redis** - Cache et queue

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- Python 3.12+
- Docker & Docker Compose
- PostgreSQL 16 avec PostGIS

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-org/plexinvest-quebec.git
cd plexinvest-quebec
```

2. **Démarrer avec Docker Compose**
```bash
docker-compose up -d
```

3. **Ou démarrage manuel**

Frontend:
```bash
npm install
npm run dev
```

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. **Initialiser la base de données**
```bash
npx prisma db push
```

### URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Structure du Projet

```
plexinvest-quebec/
├── src/
│   ├── app/                 # Pages Next.js (App Router)
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants UI de base
│   │   └── brrrr/          # Composants BRRRR spécifiques
│   ├── hooks/              # Hooks React personnalisés
│   ├── lib/
│   │   └── calculations/   # Moteur de calcul TypeScript
│   └── types/              # Types TypeScript
├── backend/
│   └── app/
│       ├── api/            # Routes FastAPI
│       ├── models/         # Modèles Pydantic
│       ├── services/       # Logique métier
│       └── core/           # Configuration
├── prisma/
│   └── schema.prisma       # Schéma de base de données
└── docker-compose.yml
```

## 🔑 Variables d'Environnement

Créer un fichier `.env` à la racine:

```env
# Database
DATABASE_URL="postgresql://plexinvest:password@localhost:5432/plexinvest"

# Backend
PYTHON_API_URL="http://localhost:8000"

# Taux par défaut
DEFAULT_MORTGAGE_RATE="0.0525"
DEFAULT_HELOC_RATE="0.0695"
```

## 📊 Utilisation de l'API

### Calcul BRRRR
```bash
curl -X POST http://localhost:8000/api/v1/brrrr/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_price": 400000,
    "down_payment_percent": 0.20,
    "renovation_budget": 50000,
    "projected_monthly_rent": 3500,
    "after_repair_value": 500000,
    "municipal_taxes": 4500,
    "school_taxes": 600,
    "total_units": 4,
    "municipality": "MONTREAL"
  }'
```

### Capacité HELOC
```bash
curl -X POST http://localhost:8000/api/v1/heloc/capacity \
  -H "Content-Type: application/json" \
  -d '{
    "current_property_value": 500000,
    "current_mortgage_balance": 300000,
    "current_heloc_balance": 0
  }'
```

## 🧪 Tests

```bash
# Frontend
npm run test

# Backend
cd backend
pytest
```

## 📝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## ⚠️ Avertissement

Les calculs fournis par cette application sont à titre indicatif seulement. Ils ne constituent pas des conseils financiers, juridiques ou fiscaux. Consultez toujours un professionnel qualifié (courtier hypothécaire, comptable, avocat) avant de prendre des décisions d'investissement.

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.

---

Développé avec ❤️ pour les investisseurs immobiliers québécois
