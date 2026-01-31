# PlexInvest Québec 🏠

**Plateforme SaaS d'investissement immobilier BRRRR & HELOC pour le Québec**

[![Netlify Status](https://api.netlify.com/api/v1/badges/plexinvest-brrrr/deploy-status)](https://plexinvest-brrrr.netlify.app)

Application web permettant aux investisseurs de rechercher, analyser et gérer des projets immobiliers selon la stratégie BRRRR (Buy, Rehab, Rent, Refinance, Repeat) avec les règles réglementaires canadiennes intégrées.

## 🌐 Démo en ligne

**[https://plexinvest-brrrr.netlify.app](https://plexinvest-brrrr.netlify.app)**

## 🎯 Fonctionnalités Principales

### Calculateur BRRRR
- Analyse complète des 4 phases: Acquisition → Rénovation → Location → Refinancement
- **Upload de fiches PDF** (Centris, DuProprio, RE/MAX) avec extraction automatique
- Calculs hypothécaires canadiens (composition semi-annuelle)
- Droits de mutation par municipalité (Montréal, Québec, Laval, etc.)
- KPIs: Cash-on-Cash, Cap Rate, DCR, Cashflow
- **Export PDF** du rapport d'analyse complet

### Analyse Avancée (style Walkens)
- **Comparables**: Analyse MRB, MRN, Prix par porte avec 3 comparables
- **Projections 5 ans**: Croissance revenus, dépenses, appréciation
- **Table d'amortissement**: Détail mensuel/annuel, comparaison 25 vs 30 ans
- **Stratégies**: Cash Back, Intérêts seulement, Paiements accélérés

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

## 📚 Documentation

- [Documentation Fonctionnelle](docs/DOCUMENTATION_FONCTIONNELLE.md) - Guide complet des fonctionnalités
- [Architecture Technique](docs/ARCHITECTURE.md) - Diagrammes Mermaid et architecture

## 🛠 Stack Technologique

### Frontend
- **Next.js 15** - React framework avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **Shadcn/UI** - Composants accessibles
- **Framer Motion** - Animations
- **React Hook Form + Zod** - Formulaires et validation
- **PDF.js** - Extraction de données PDF
- **jsPDF** - Génération de rapports PDF

### Hébergement
- **Netlify** - Déploiement statique avec CDN global

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/kakame94/heloc.git
cd heloc
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer en développement**
```bash
npm run dev
```

4. **Accéder à l'application**
```
http://localhost:3000
```

### Build pour production

```bash
npm run build
```

Les fichiers statiques sont générés dans le dossier `out/`.

## 📁 Structure du Projet

```
plexinvest-quebec/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx           # Accueil
│   │   ├── calculateur/       # Calculateur BRRRR
│   │   ├── analyse/           # Outils d'analyse avancée
│   │   ├── heloc/             # Calculateur HELOC
│   │   └── guide/             # Guide éducatif
│   ├── components/
│   │   ├── brrrr/             # Composants BRRRR
│   │   │   ├── BrrrrCalculator.tsx
│   │   │   ├── PdfUploader.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   └── BrrrrTimeline.tsx
│   │   └── ui/                # Composants UI (Shadcn)
│   ├── hooks/
│   │   └── useBrrrrCalculator.ts
│   ├── lib/
│   │   ├── calculations/      # Modules de calcul
│   │   │   ├── brrrr-engine.ts
│   │   │   ├── mortgage.ts
│   │   │   ├── cmhc.ts
│   │   │   ├── heloc.ts
│   │   │   ├── transfer-tax.ts
│   │   │   ├── comparables.ts
│   │   │   ├── projections.ts
│   │   │   ├── amortization.ts
│   │   │   └── strategies.ts
│   │   ├── pdf-extractor.ts   # Extraction données PDF
│   │   └── pdf-report.ts      # Génération rapports
│   └── types/
│       └── financial.ts       # Types TypeScript
├── docs/
│   ├── DOCUMENTATION_FONCTIONNELLE.md
│   └── ARCHITECTURE.md
├── netlify.toml               # Configuration Netlify
└── package.json
```

## 🔧 Configuration

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "20"
```

### next.config.ts

```typescript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}
```

## 📊 Modules de Calcul

### brrrr-engine.ts
Moteur principal de calcul BRRRR intégrant tous les sous-modules.

```typescript
import { calculateBRRRR } from '@/lib/calculations'

const result = calculateBRRRR({
  purchasePrice: 400000,
  downPaymentPercent: 0.20,
  renovationBudget: 50000,
  projectedMonthlyRent: 3500,
  afterRepairValue: 500000,
  // ...
})
```

### pdf-extractor.ts
Extraction automatique des données depuis les fiches PDF.

```typescript
import { extractPropertyDataFromPdf } from '@/lib/pdf-extractor'

const data = await extractPropertyDataFromPdf(file)
// {
//   askingPrice: 445000,
//   numberOfUnits: 2,
//   monthlyRents: [1150, 1720],
//   municipalTaxes: 3008,
//   ...
// }
```

### comparables.ts
Analyse comparative avec multiplicateurs.

```typescript
import { analyzeWithComparables } from '@/lib/calculations'

const analysis = analyzeWithComparables(subject, comparables)
// Calcule MRB, MRN, Prix/Porte et valeur marchande estimée
```

## 🧪 Fonctionnalités PDF

### Sources supportées
- Centris
- DuProprio
- RE/MAX
- Royal LePage
- Autres (extraction générique)

### Données extraites
- Prix demandé
- Adresse et code postal
- Nombre de logements
- Loyers par unité
- Taxes municipales et scolaires
- Année de construction
- Superficie

## ⚠️ Avertissement

Les calculs fournis par cette application sont à titre indicatif seulement. Ils ne constituent pas des conseils financiers, juridiques ou fiscaux. Consultez toujours un professionnel qualifié (courtier hypothécaire, comptable, avocat) avant de prendre des décisions d'investissement.

## 📝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License

---

Développé avec ❤️ pour les investisseurs immobiliers québécois
