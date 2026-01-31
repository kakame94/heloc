# PlexInvest Québec - Architecture Technique

## Vue d'ensemble de l'architecture

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        UI[React UI]
        State[State Management]
        PDF[PDF.js Worker]
    end

    subgraph NextJS["Next.js 15 App"]
        Pages[App Router Pages]
        Components[React Components]
        Hooks[Custom Hooks]
        Lib[Business Logic]
    end

    subgraph Static["Static Export"]
        HTML[HTML Pages]
        JS[JavaScript Bundles]
        CSS[CSS Styles]
    end

    subgraph Hosting["Netlify"]
        CDN[Global CDN]
        DNS[DNS]
    end

    UI --> Pages
    Pages --> Components
    Components --> Hooks
    Hooks --> Lib
    PDF --> Lib

    NextJS --> Static
    Static --> Hosting
    CDN --> Client
```

## Architecture des modules de calcul

```mermaid
graph LR
    subgraph Entry["Points d'entrée"]
        Hook[useBrrrrCalculator]
        Direct[Import direct]
    end

    subgraph Core["Core Engine"]
        BRRRR[brrrr-engine.ts]
    end

    subgraph Modules["Modules spécialisés"]
        Mort[mortgage.ts]
        CMHC[cmhc.ts]
        HELOC[heloc.ts]
        Tax[transfer-tax.ts]
        Reno[renovation-costs.ts]
    end

    subgraph Analysis["Modules d'analyse"]
        Comp[comparables.ts]
        Proj[projections.ts]
        Amort[amortization.ts]
        Strat[strategies.ts]
    end

    subgraph Utilities["Utilitaires"]
        PDFEx[pdf-extractor.ts]
        PDFRep[pdf-report.ts]
        Utils[utils.ts]
    end

    Hook --> BRRRR
    Direct --> BRRRR
    Direct --> Analysis

    BRRRR --> Mort
    BRRRR --> CMHC
    BRRRR --> HELOC
    BRRRR --> Tax
    BRRRR --> Reno

    Proj --> Mort
    Amort --> Mort
    Strat --> Mort
```

## Flux de données - Calculateur BRRRR

```mermaid
sequenceDiagram
    actor User as Utilisateur
    participant Form as Formulaire
    participant Hook as useBrrrrCalculator
    participant Engine as brrrr-engine
    participant Sub as Sous-modules
    participant UI as Interface

    User->>Form: Saisie/Upload PDF
    Form->>Hook: Données validées

    Hook->>Engine: calculateBRRRR(input)

    par Calculs parallèles
        Engine->>Sub: calculateTransferTax()
        Engine->>Sub: calculateCMHCPremium()
        Engine->>Sub: calculateMonthlyPayment()
    end

    Sub-->>Engine: Résultats partiels

    Engine->>Engine: Calcul KPIs finaux

    Engine-->>Hook: BrrrrCalculationResult
    Hook-->>UI: État mis à jour
    UI-->>User: Affichage résultats
```

## Flux d'extraction PDF

```mermaid
flowchart TD
    A[Fichier PDF] --> B{Validation}
    B -->|Valide| C[Chargement PDF.js]
    B -->|Invalide| X[Erreur]

    C --> D[Extraction texte]
    D --> E[Détection source]

    E --> F{Source reconnue?}
    F -->|Centris| G1[Patterns Centris]
    F -->|DuProprio| G2[Patterns DuProprio]
    F -->|Autre| G3[Patterns génériques]

    G1 & G2 & G3 --> H[Application regex]

    H --> I[Prix]
    H --> J[Adresse]
    H --> K[Loyers]
    H --> L[Taxes]
    H --> M[Caractéristiques]

    I & J & K & L & M --> N[Agrégation données]

    N --> O[Calcul confiance]
    O --> P[Validation]

    P --> Q{Données suffisantes?}
    Q -->|Oui| R[✅ Données extraites]
    Q -->|Non| S[⚠️ Données partielles]

    R --> T[Application au formulaire]
    S --> T
```

## Architecture des composants React

```mermaid
graph TB
    subgraph Pages["Pages (App Router)"]
        P1[page.tsx - Accueil]
        P2[calculateur/page.tsx]
        P3[analyse/page.tsx]
        P4[guide/page.tsx]
        P5[heloc/page.tsx]
    end

    subgraph Layout["Layout"]
        Header[Header Navigation]
        Footer[Footer]
    end

    subgraph BRRRR["Composants BRRRR"]
        Calc[BrrrrCalculator]
        PDF[PdfUploader]
        KPI[KpiGrid]
        TL[BrrrrTimeline]
        SM[SensitivityMatrix]
    end

    subgraph Analyse["Composants Analyse"]
        Comp[ComparablesTab]
        Proj[ProjectionsTab]
        Amort[AmortizationTab]
        Strat[StrategiesTab]
    end

    subgraph UI["UI Primitives (Shadcn)"]
        Card[Card]
        Button[Button]
        Input[Input]
        Label[Label]
    end

    P1 --> Header
    P1 --> Footer
    P2 --> Calc
    Calc --> PDF
    Calc --> KPI
    Calc --> TL
    Calc --> SM

    P3 --> Comp
    P3 --> Proj
    P3 --> Amort
    P3 --> Strat

    Calc --> UI
    Comp --> UI
```

## Diagramme de classes - Types principaux

```mermaid
classDiagram
    class PropertyFinancials {
        +number purchasePrice
        +number downPaymentPercent
        +number renovationBudget
        +number projectedMonthlyRent
        +number afterRepairValue
        +number mortgageRate
        +number municipalTaxes
        +number schoolTaxes
        +number totalUnits
        +boolean isOwnerOccupied
    }

    class BrrrrCalculationResult {
        +AcquisitionDetails acquisition
        +RenovationDetails renovation
        +RentalDetails rental
        +RefinanceDetails refinance
        +KPIs kpis
        +Validation validation
    }

    class ExtractedPropertyData {
        +string address
        +number askingPrice
        +number numberOfUnits
        +number[] monthlyRents
        +number municipalTaxes
        +string source
        +number extractionConfidence
    }

    class ComparableProperty {
        +string address
        +number salePrice
        +number numberOfUnits
        +number[] monthlyRents
        +AnnualExpenses annualExpenses
    }

    class ProjectionResult {
        +number initialInvestment
        +number mortgageAmount
        +YearProjection[] projections
        +ProjectionSummary summary
    }

    PropertyFinancials --> BrrrrCalculationResult : calcul
    ExtractedPropertyData --> PropertyFinancials : mapping
    ComparableProperty --> ComparableAnalysisResult : analyse
```

## État de l'application

```mermaid
stateDiagram-v2
    [*] --> Idle

    state Calculateur {
        Idle --> Uploading: Upload PDF
        Idle --> Editing: Saisie manuelle

        Uploading --> Processing: Fichier chargé
        Processing --> Editing: Extraction OK
        Processing --> UploadError: Erreur

        Editing --> Calculating: Données valides
        Calculating --> ShowResults: Calcul terminé

        ShowResults --> Editing: Modification
        ShowResults --> Exporting: Export PDF
        Exporting --> ShowResults: Export terminé

        UploadError --> Idle: Reset
    }

    state Analyse {
        [*] --> ComparablesView
        ComparablesView --> ProjectionsView: Tab switch
        ProjectionsView --> AmortView: Tab switch
        AmortView --> StrategiesView: Tab switch
        StrategiesView --> ComparablesView: Tab switch
    }
```

## Pipeline de build et déploiement

```mermaid
flowchart LR
    subgraph Dev["Développement"]
        Code[Code Source]
        Git[Git Commit]
    end

    subgraph CI["Intégration Continue"]
        Push[Git Push]
        Netlify[Netlify Build]
    end

    subgraph Build["Build Next.js"]
        TS[TypeScript Check]
        Lint[ESLint]
        Compile[Compilation]
        Static[Export Statique]
    end

    subgraph Deploy["Déploiement"]
        Upload[Upload CDN]
        Invalidate[Cache Invalidation]
        Live[Site Live]
    end

    Code --> Git --> Push
    Push --> Netlify
    Netlify --> TS --> Lint --> Compile --> Static
    Static --> Upload --> Invalidate --> Live
```

## Sécurité et performance

```mermaid
graph TB
    subgraph Security["Sécurité"]
        CSP[Content Security Policy]
        HTTPS[HTTPS Only]
        NoSecrets[Pas de secrets côté client]
    end

    subgraph Performance["Performance"]
        SSG[Static Site Generation]
        CodeSplit[Code Splitting]
        Lazy[Lazy Loading]
        CDN[CDN Global]
    end

    subgraph Monitoring["Monitoring"]
        Analytics[Web Analytics]
        Errors[Error Tracking]
    end

    Security --> App[Application]
    Performance --> App
    App --> Monitoring
```

## Dépendances principales

```mermaid
graph LR
    subgraph Framework
        Next[Next.js 15]
        React[React 19]
        TS[TypeScript]
    end

    subgraph UI
        Tailwind[Tailwind CSS]
        Shadcn[Shadcn/UI]
        Framer[Framer Motion]
        Lucide[Lucide Icons]
    end

    subgraph Forms
        RHF[React Hook Form]
        Zod[Zod Validation]
    end

    subgraph PDF
        PDFJS[PDF.js]
        JSPDF[jsPDF]
        AutoTable[jspdf-autotable]
    end

    subgraph Math
        Decimal[Decimal.js]
    end

    Next --> React
    React --> UI
    React --> Forms
    React --> PDF
    React --> Math
```

---

## Conventions de code

### Structure des fichiers

```
src/lib/calculations/
├── index.ts           # Exports publics
├── mortgage.ts        # Calculs hypothécaires
├── cmhc.ts           # Primes SCHL
├── heloc.ts          # Financement HELOC
├── transfer-tax.ts   # Droits de mutation
├── brrrr-engine.ts   # Moteur principal
├── comparables.ts    # Analyse comparative
├── projections.ts    # Projections 5 ans
├── amortization.ts   # Table d'amortissement
└── strategies.ts     # Stratégies d'optimisation
```

### Naming conventions

| Type | Convention | Exemple |
|------|------------|---------|
| Fichiers | kebab-case | `brrrr-engine.ts` |
| Composants | PascalCase | `BrrrrCalculator.tsx` |
| Hooks | camelCase avec use | `useBrrrrCalculator` |
| Types | PascalCase | `PropertyFinancials` |
| Constantes | SCREAMING_SNAKE | `BSIF_RULES` |
| Fonctions | camelCase | `calculateBRRRR` |

---

*Architecture PlexInvest Québec v1.0*
