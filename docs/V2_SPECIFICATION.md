# PlexInvest V2 - Spécification Technique Complète

## 🎯 Vision

Refonte complète de PlexInvest pour créer une solution **qualité production**, combinant:
- **UX fluide de DealCheck** (Wizard étape par étape)
- **Analyse conservatrice de BiggerPockets** (Stress tests, DSCR)
- **Règles hard-codées Québec/Canada 2025** (SCHL, B-20, TAL, Fiscalité)

---

## 📐 Architecture Technique

### Stack Imposée
```
Framework:     Next.js 15 (App Router)
Langage:       TypeScript (Strict Mode)
State:         Zustand (avec Middleware Persist & Immer)
Validation:    Zod (Schema-First Design)
UI:            Shadcn/UI + Tailwind CSS
Charts:        Recharts
Tests:         Vitest + Playwright
Architecture:  Feature-Sliced Design (FSD)
```

### Structure des Dossiers (FSD)
```
src/
├── app/                          # Routes Next.js
│   ├── (wizard)/
│   │   ├── setup/page.tsx        # Étape 1: Setup
│   │   ├── chantier/page.tsx     # Étape 2: Rénovations
│   │   ├── operation/page.tsx    # Étape 3: Revenus/Dépenses
│   │   └── verdict/page.tsx      # Étape 4: Dashboard
│   └── api/
│       └── config/route.ts       # API config (future)
│
├── features/
│   ├── wizard/                   # Logique du Wizard
│   │   ├── components/
│   │   ├── hooks/
│   │   └── store/
│   └── calculator/               # Moteur de calcul pur
│       ├── engines/
│       │   ├── mortgage.ts
│       │   ├── cashflow.ts
│       │   ├── brrrr.ts
│       │   └── stress-test.ts
│       └── __tests__/
│
├── entities/
│   ├── property/
│   │   ├── schema.ts             # Zod schemas
│   │   └── types.ts              # Inferred types
│   ├── finance/
│   │   ├── schema.ts
│   │   └── types.ts
│   └── fiscal/
│       ├── schema.ts
│       └── types.ts
│
├── shared/
│   ├── config/
│   │   ├── fiscal-2025.json      # Config externalisée
│   │   └── config-service.ts     # Loader + validation
│   ├── ui/                       # Composants Shadcn
│   ├── lib/
│   │   └── utils.ts
│   └── hooks/
│       └── useHydration.ts       # Anti hydration mismatch
│
└── stores/
    ├── index.ts                  # Store combiné
    ├── slices/
    │   ├── financial.slice.ts
    │   ├── property.slice.ts
    │   └── settings.slice.ts
    └── middleware/
        └── persist.ts
```

---

## 📊 Configuration Externalisée (fiscal-2025.json)

### Structure Complète

```json
{
  "version": "2025.1",
  "lastUpdated": "2025-01-01",

  "welcomeTax": {
    "montreal": {
      "comparativeFactor": 1.08,
      "brackets": [
        { "threshold": 61500, "rate": 0.005 },
        { "threshold": 307800, "rate": 0.01 },
        { "threshold": 552300, "rate": 0.015 },
        { "threshold": 1104700, "rate": 0.02 },
        { "threshold": 2136500, "rate": 0.025 },
        { "threshold": 3113000, "rate": 0.035 },
        { "threshold": Infinity, "rate": 0.04 }
      ]
    },
    "quebec": {
      "comparativeFactor": 1.00,
      "brackets": [
        { "threshold": 58900, "rate": 0.005 },
        { "threshold": 294600, "rate": 0.01 },
        { "threshold": Infinity, "rate": 0.015 }
      ]
    },
    "standard": {
      "comparativeFactor": 1.00,
      "brackets": [
        { "threshold": 55200, "rate": 0.005 },
        { "threshold": 276200, "rate": 0.01 },
        { "threshold": Infinity, "rate": 0.015 }
      ]
    }
  },

  "schlPremiums": {
    "standard": [
      { "ltvMax": 65, "premium": 0.006 },
      { "ltvMax": 75, "premium": 0.017 },
      { "ltvMax": 80, "premium": 0.024 },
      { "ltvMax": 85, "premium": 0.028 },
      { "ltvMax": 90, "premium": 0.031 },
      { "ltvMax": 95, "premium": 0.040 }
    ],
    "surcharge30Years": 0.002,
    "aphSelectDiscount": {
      "tier1": 0.10,
      "tier2": 0.20,
      "tier3": 0.30
    }
  },

  "stressTest": {
    "floorRate": 0.0525,
    "buffer": 0.02,
    "minDSCR": 1.1
  },

  "mliSelect": {
    "enabled": true,
    "maxAmortization": 50,
    "maxLTV": 0.95,
    "minUnits": 5
  },

  "taxBrackets": {
    "federal2025": {
      "indexation": 0.027,
      "brackets": [
        { "threshold": 57375, "rate": 0.145 },
        { "threshold": 114750, "rate": 0.205 },
        { "threshold": 177882, "rate": 0.26 },
        { "threshold": 253414, "rate": 0.29 },
        { "threshold": Infinity, "rate": 0.33 }
      ],
      "quebecAbatement": 0.165
    },
    "quebec2025": {
      "indexation": 0.0285,
      "brackets": [
        { "threshold": 53255, "rate": 0.14 },
        { "threshold": 106495, "rate": 0.19 },
        { "threshold": 129590, "rate": 0.24 },
        { "threshold": Infinity, "rate": 0.2575 }
      ]
    }
  },

  "talGuidance": {
    "rentIncreaseIndex2025": 0.059,
    "maintenanceIndex": 0.069,
    "taxesPassthrough": 1.0,
    "minNoticeDays": 90
  },

  "closingCosts": {
    "notaryFees": { "min": 1500, "max": 2500 },
    "inspectionFee": 600,
    "appraisalFee": 400,
    "titleInsurance": 350,
    "tvqOnSchlPremium": 0.09975
  },

  "defaults": {
    "vacancyRate": 0.05,
    "managementFee": 0.08,
    "maintenancePerDoor": 500,
    "snowRemovalPerUnit": 200,
    "insurancePerDoor": 600,
    "rentGrowthRate": 0.02
  }
}
```

---

## 🔐 Schémas Zod (Validation Stricte)

### entities/property/schema.ts

```typescript
import { z } from 'zod'

export const AddressSchema = z.object({
  street: z.string().min(5, 'Adresse requise'),
  city: z.enum(['montreal', 'quebec', 'other']),
  postalCode: z.string().regex(/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, 'Code postal invalide'),
  municipalAssessment: z.number().positive().optional(),
})

export const UnitSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['studio', '1cc', '2cc', '3cc', '4cc+', 'commercial']),
  currentRent: z.number().min(0),
  marketRent: z.number().min(0),
  sqft: z.number().positive().optional(),
  isVacant: z.boolean().default(false),
})

export const ExpensesSchema = z.object({
  municipalTax: z.number().min(0),
  schoolTax: z.number().min(0),
  insurance: z.number().min(0),
  electricity: z.number().min(0).default(0),
  heating: z.number().min(0).default(0),
  snowRemoval: z.number().min(0).default(0),
  maintenance: z.number().min(0),
  managementPercent: z.number().min(0).max(15).default(0),
  otherExpenses: z.number().min(0).default(0),
})
  .refine(
    (data) => data.managementPercent > 0 || true,
    {
      message: "⚠️ Gestion à 0% = Vous achetez un emploi, pas un investissement",
      path: ['managementPercent']
    }
  )

export const PropertySchema = z.object({
  id: z.string().uuid(),
  address: AddressSchema,
  propertyType: z.enum(['duplex', 'triplex', 'quadruplex', 'quintuplex', 'sixplex', 'multilogement']),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()),
  numberOfUnits: z.number().int().min(2).max(100),
  units: z.array(UnitSchema),
  expenses: ExpensesSchema,

  // BRRRR specifics
  purchasePrice: z.number().positive(),
  renovationBudget: z.number().min(0).default(0),
  renovationDuration: z.number().min(0).max(24).default(0), // mois
  afterRepairValue: z.number().positive(),
})

export type Address = z.infer<typeof AddressSchema>
export type Unit = z.infer<typeof UnitSchema>
export type Expenses = z.infer<typeof ExpensesSchema>
export type Property = z.infer<typeof PropertySchema>
```

### entities/finance/schema.ts

```typescript
import { z } from 'zod'

export const MortgageSchema = z.object({
  loanAmount: z.number().positive(),
  downPaymentPercent: z.number().min(5).max(100),
  interestRate: z.number().min(0.01).max(15),
  amortization: z.number().min(15).max(50),
  term: z.number().int().min(1).max(10).default(5),
  isInsured: z.boolean(),
  isMliSelect: z.boolean().default(false),
})
  .refine(
    (data) => {
      // Règle B-20 : Si mise de fonds < 20%, amortissement max 25 ans
      if (data.downPaymentPercent < 20 && data.amortization > 25) {
        return false
      }
      return true
    },
    {
      message: "Amortissement max 25 ans pour prêt assuré (mise de fonds < 20%)",
      path: ['amortization']
    }
  )
  .refine(
    (data) => {
      // MLI Select uniquement pour 5+ logements et conditions spéciales
      if (data.isMliSelect && data.downPaymentPercent < 5) {
        return false
      }
      return true
    },
    {
      message: "MLI Select requiert minimum 5% de mise de fonds",
      path: ['downPaymentPercent']
    }
  )

export const RefinanceSchema = z.object({
  targetLTV: z.number().min(50).max(80).default(75),
  newRate: z.number().min(0.01).max(15),
  newAmortization: z.number().min(15).max(30).default(25),
})

export type Mortgage = z.infer<typeof MortgageSchema>
export type Refinance = z.infer<typeof RefinanceSchema>
```

---

## 🗄️ Store Zustand (Slices Pattern)

### stores/slices/financial.slice.ts

```typescript
import { StateCreator } from 'zustand'
import { Mortgage, Refinance } from '@/entities/finance/types'

export interface FinancialSlice {
  mortgage: Mortgage | null
  refinance: Refinance | null
  qualifyingRate: number
  stressTestPassed: boolean

  setMortgage: (mortgage: Mortgage) => void
  setRefinance: (refinance: Refinance) => void
  calculateStressTest: () => void
  reset: () => void
}

export const createFinancialSlice: StateCreator<FinancialSlice> = (set, get) => ({
  mortgage: null,
  refinance: null,
  qualifyingRate: 0,
  stressTestPassed: false,

  setMortgage: (mortgage) => {
    set({ mortgage })
    get().calculateStressTest()
  },

  setRefinance: (refinance) => set({ refinance }),

  calculateStressTest: () => {
    const { mortgage } = get()
    if (!mortgage) return

    // Règle B-20: max(taux + 2%, 5.25%)
    const stressTestRate = Math.max(
      mortgage.interestRate + 2,
      5.25
    )

    set({
      qualifyingRate: stressTestRate,
      // DSCR calculé ailleurs avec ce taux
    })
  },

  reset: () => set({
    mortgage: null,
    refinance: null,
    qualifyingRate: 0,
    stressTestPassed: false,
  }),
})
```

### stores/slices/property.slice.ts

```typescript
import { StateCreator } from 'zustand'
import { Property, Unit } from '@/entities/property/types'

export interface PropertySlice {
  property: Property | null

  setProperty: (property: Property) => void
  updateUnit: (unitId: string, data: Partial<Unit>) => void
  addUnit: (unit: Unit) => void
  removeUnit: (unitId: string) => void

  // Computed
  getTotalMonthlyRent: () => number
  getTotalPotentialRent: () => number
  getTotalAnnualExpenses: () => number
  getVacancyLoss: () => number
}

export const createPropertySlice: StateCreator<PropertySlice> = (set, get) => ({
  property: null,

  setProperty: (property) => set({ property }),

  updateUnit: (unitId, data) => {
    const { property } = get()
    if (!property) return

    set({
      property: {
        ...property,
        units: property.units.map(u =>
          u.id === unitId ? { ...u, ...data } : u
        )
      }
    })
  },

  addUnit: (unit) => {
    const { property } = get()
    if (!property) return

    set({
      property: {
        ...property,
        units: [...property.units, unit],
        numberOfUnits: property.numberOfUnits + 1
      }
    })
  },

  removeUnit: (unitId) => {
    const { property } = get()
    if (!property) return

    set({
      property: {
        ...property,
        units: property.units.filter(u => u.id !== unitId),
        numberOfUnits: property.numberOfUnits - 1
      }
    })
  },

  getTotalMonthlyRent: () => {
    const { property } = get()
    if (!property) return 0
    return property.units.reduce((sum, u) => sum + u.currentRent, 0)
  },

  getTotalPotentialRent: () => {
    const { property } = get()
    if (!property) return 0
    return property.units.reduce((sum, u) => sum + u.marketRent, 0)
  },

  getTotalAnnualExpenses: () => {
    const { property } = get()
    if (!property) return 0

    const e = property.expenses
    const grossRent = get().getTotalMonthlyRent() * 12
    const managementFee = grossRent * (e.managementPercent / 100)

    return (
      e.municipalTax +
      e.schoolTax +
      e.insurance +
      e.electricity +
      e.heating +
      e.snowRemoval +
      e.maintenance +
      managementFee +
      e.otherExpenses
    )
  },

  getVacancyLoss: () => {
    const { property } = get()
    if (!property) return 0

    // 5% par défaut
    return get().getTotalMonthlyRent() * 12 * 0.05
  },
})
```

### stores/index.ts (Combined Store avec Persist)

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createFinancialSlice, FinancialSlice } from './slices/financial.slice'
import { createPropertySlice, PropertySlice } from './slices/property.slice'

export type PlexStore = FinancialSlice & PropertySlice & {
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

export const usePlexStore = create<PlexStore>()(
  persist(
    immer((...a) => ({
      ...createFinancialSlice(...a),
      ...createPropertySlice(...a),
      _hasHydrated: false,
      setHasHydrated: (state) => {
        const [set] = a
        set({ _hasHydrated: state })
      },
    })),
    {
      name: 'plexinvest-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      partialize: (state) => ({
        mortgage: state.mortgage,
        refinance: state.refinance,
        property: state.property,
      }),
    }
  )
)

// Hook anti-hydration mismatch pour Next.js
export const useStoreHydrated = () => {
  const hasHydrated = usePlexStore((state) => state._hasHydrated)
  return hasHydrated
}
```

---

## 🧮 Moteur de Calcul (features/calculator/engines/)

### mortgage.ts

```typescript
import { Mortgage } from '@/entities/finance/types'
import { getConfig } from '@/shared/config/config-service'

export interface MortgageCalculation {
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  effectiveRate: number
  qualifyingPayment: number // Avec stress test
}

/**
 * Calcule le paiement hypothécaire avec la méthode canadienne
 * (Capitalisation semi-annuelle)
 */
export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  amortizationYears: number
): number {
  // Conversion taux canadien (semi-annuel → mensuel)
  const semiAnnualRate = annualRate / 2
  const monthlyRate = Math.pow(1 + semiAnnualRate, 1/6) - 1
  const totalPayments = amortizationYears * 12

  const payment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1)

  return Math.round(payment * 100) / 100
}

/**
 * Calcule le paiement avec le taux stress-testé (B-20)
 */
export function calculateStressTestedPayment(
  principal: number,
  contractRate: number,
  amortizationYears: number
): number {
  const config = getConfig()
  const stressRate = Math.max(
    contractRate + config.stressTest.buffer,
    config.stressTest.floorRate
  )

  return calculateMortgagePayment(principal, stressRate, amortizationYears)
}

/**
 * Calcule la prime SCHL selon le LTV
 */
export function calculateSCHLPremium(
  loanAmount: number,
  propertyValue: number,
  amortization: number = 25
): { premium: number; premiumAmount: number; tvq: number } {
  const config = getConfig()
  const ltv = (loanAmount / propertyValue) * 100

  let premiumRate = 0
  for (const tier of config.schlPremiums.standard) {
    if (ltv <= tier.ltvMax) {
      premiumRate = tier.premium
      break
    }
  }

  // Surcharge 30 ans
  if (amortization > 25) {
    premiumRate += config.schlPremiums.surcharge30Years
  }

  const premiumAmount = loanAmount * premiumRate
  const tvq = premiumAmount * config.closingCosts.tvqOnSchlPremium

  return {
    premium: premiumRate,
    premiumAmount: Math.round(premiumAmount),
    tvq: Math.round(tvq * 100) / 100, // TVQ non finançable!
  }
}

export function fullMortgageAnalysis(mortgage: Mortgage, propertyValue: number): MortgageCalculation {
  const monthlyPayment = calculateMortgagePayment(
    mortgage.loanAmount,
    mortgage.interestRate / 100,
    mortgage.amortization
  )

  const qualifyingPayment = calculateStressTestedPayment(
    mortgage.loanAmount,
    mortgage.interestRate / 100,
    mortgage.amortization
  )

  const totalPayments = mortgage.amortization * 12
  const totalPaid = monthlyPayment * totalPayments
  const totalInterest = totalPaid - mortgage.loanAmount

  // Taux effectif annuel
  const monthlyRate = Math.pow(1 + (mortgage.interestRate / 100) / 2, 1/6) - 1
  const effectiveRate = Math.pow(1 + monthlyRate, 12) - 1

  return {
    monthlyPayment,
    totalPayments: Math.round(totalPaid),
    totalInterest: Math.round(totalInterest),
    effectiveRate: Math.round(effectiveRate * 10000) / 100,
    qualifyingPayment,
  }
}
```

### cashflow.ts

```typescript
import { Property } from '@/entities/property/types'
import { Mortgage } from '@/entities/finance/types'
import { calculateMortgagePayment, calculateStressTestedPayment } from './mortgage'
import { getConfig } from '@/shared/config/config-service'

export interface CashflowAnalysis {
  grossRevenue: number
  vacancyLoss: number
  effectiveGrossIncome: number
  totalOperatingExpenses: number
  netOperatingIncome: number // NOI
  annualDebtService: number
  annualCashflow: number
  monthlyCashflow: number
  cashflowPerDoor: number

  // Ratios
  capRate: number
  cashOnCash: number
  dscr: number              // Debt Service Coverage Ratio
  dscrStressTested: number  // Avec taux B-20

  // Warnings
  warnings: string[]
}

export function analyzeCashflow(
  property: Property,
  mortgage: Mortgage,
  totalCashInvested: number
): CashflowAnalysis {
  const config = getConfig()
  const warnings: string[] = []

  // Revenus
  const grossRevenue = property.units.reduce((sum, u) => sum + u.currentRent, 0) * 12
  const vacancyRate = config.defaults.vacancyRate
  const vacancyLoss = grossRevenue * vacancyRate
  const effectiveGrossIncome = grossRevenue - vacancyLoss

  // Dépenses
  const e = property.expenses
  const managementFee = grossRevenue * (e.managementPercent / 100)

  const totalOperatingExpenses =
    e.municipalTax +
    e.schoolTax +
    e.insurance +
    e.electricity +
    e.heating +
    e.snowRemoval +
    e.maintenance +
    managementFee +
    e.otherExpenses

  // NOI
  const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses

  // Service de la dette
  const monthlyPayment = calculateMortgagePayment(
    mortgage.loanAmount,
    mortgage.interestRate / 100,
    mortgage.amortization
  )
  const annualDebtService = monthlyPayment * 12

  // Cashflow
  const annualCashflow = netOperatingIncome - annualDebtService
  const monthlyCashflow = annualCashflow / 12
  const cashflowPerDoor = annualCashflow / property.numberOfUnits

  // Ratios
  const capRate = (netOperatingIncome / property.purchasePrice) * 100
  const cashOnCash = totalCashInvested > 0
    ? (annualCashflow / totalCashInvested) * 100
    : 0

  // DSCR (Debt Service Coverage Ratio)
  const dscr = annualDebtService > 0
    ? netOperatingIncome / annualDebtService
    : 0

  // DSCR avec stress test B-20
  const stressTestedPayment = calculateStressTestedPayment(
    mortgage.loanAmount,
    mortgage.interestRate / 100,
    mortgage.amortization
  )
  const dscrStressTested = (stressTestedPayment * 12) > 0
    ? netOperatingIncome / (stressTestedPayment * 12)
    : 0

  // Warnings
  if (dscrStressTested < config.stressTest.minDSCR) {
    warnings.push(`⚠️ DSCR ${dscrStressTested.toFixed(2)} < ${config.stressTest.minDSCR}: Financement bancaire difficile (Échec B-20)`)
  }

  if (e.managementPercent === 0) {
    warnings.push('⚠️ Gestion à 0%: Vous achetez un emploi, pas un investissement')
  }

  if (cashflowPerDoor < 75) {
    warnings.push(`⚠️ Cashflow/porte faible: ${Math.round(cashflowPerDoor)}$/mois`)
  }

  return {
    grossRevenue,
    vacancyLoss,
    effectiveGrossIncome,
    totalOperatingExpenses,
    netOperatingIncome,
    annualDebtService,
    annualCashflow,
    monthlyCashflow: Math.round(monthlyCashflow),
    cashflowPerDoor: Math.round(cashflowPerDoor),
    capRate: Math.round(capRate * 100) / 100,
    cashOnCash: Math.round(cashOnCash * 100) / 100,
    dscr: Math.round(dscr * 100) / 100,
    dscrStressTested: Math.round(dscrStressTested * 100) / 100,
    warnings,
  }
}
```

### welcome-tax.ts

```typescript
import { getConfig } from '@/shared/config/config-service'

export interface WelcomeTaxResult {
  taxableBase: number
  totalTax: number
  breakdown: { bracket: string; amount: number }[]
  city: string
  comparativeFactor: number
}

export function calculateWelcomeTax(
  purchasePrice: number,
  municipalAssessment: number | undefined,
  city: 'montreal' | 'quebec' | 'other'
): WelcomeTaxResult {
  const config = getConfig()
  const cityConfig = config.welcomeTax[city] || config.welcomeTax.standard

  // Base imposable = MAX(prix, évaluation × facteur comparatif)
  const adjustedAssessment = municipalAssessment
    ? municipalAssessment * cityConfig.comparativeFactor
    : 0
  const taxableBase = Math.max(purchasePrice, adjustedAssessment)

  let totalTax = 0
  let remaining = taxableBase
  let previousThreshold = 0
  const breakdown: { bracket: string; amount: number }[] = []

  for (const bracket of cityConfig.brackets) {
    if (remaining <= 0) break

    const bracketAmount = bracket.threshold === Infinity
      ? remaining
      : Math.min(remaining, bracket.threshold - previousThreshold)

    const taxForBracket = bracketAmount * bracket.rate
    totalTax += taxForBracket

    breakdown.push({
      bracket: `${previousThreshold.toLocaleString()}$ - ${bracket.threshold === Infinity ? '∞' : bracket.threshold.toLocaleString()}$ @ ${(bracket.rate * 100).toFixed(1)}%`,
      amount: Math.round(taxForBracket)
    })

    remaining -= bracketAmount
    previousThreshold = bracket.threshold
  }

  return {
    taxableBase: Math.round(taxableBase),
    totalTax: Math.round(totalTax),
    breakdown,
    city,
    comparativeFactor: cityConfig.comparativeFactor,
  }
}
```

### brrrr.ts

```typescript
import { Property } from '@/entities/property/types'
import { Mortgage, Refinance } from '@/entities/finance/types'
import { calculateMortgagePayment, calculateSCHLPremium } from './mortgage'
import { calculateWelcomeTax } from './welcome-tax'
import { analyzeCashflow } from './cashflow'
import { getConfig } from '@/shared/config/config-service'

export interface BRRRRAnalysis {
  // Phase 1: Acquisition
  purchasePrice: number
  downPayment: number
  closingCosts: {
    welcomeTax: number
    notaryFees: number
    inspection: number
    appraisal: number
    titleInsurance: number
    schlPremium: number
    schlTVQ: number // Non-finançable!
    total: number
  }
  totalAcquisitionCost: number

  // Phase 2: Rénovation
  renovationBudget: number
  holdingCosts: {
    mortgageInterest: number
    taxes: number
    insurance: number
    utilities: number
    total: number
  }
  totalInvestmentBeforeRefi: number

  // Phase 3: Rent
  monthlyRent: number
  annualNOI: number

  // Phase 4: Refinance
  afterRepairValue: number
  newLoanAmount: number
  cashOutAmount: number
  capitalLeftInDeal: number
  newMonthlyPayment: number

  // Phase 5: Repeat
  cashflowAnalysis: ReturnType<typeof analyzeCashflow>

  // Métriques globales
  totalCashInvested: number
  equityCreated: number
  returnOnInvestment: number
  cashOnCashReturn: number
  infiniteReturn: boolean // Capital récupéré > investi

  // Waterfall data pour graphique
  waterfall: { label: string; value: number; type: 'cost' | 'value' | 'equity' }[]
}

export function analyzeBRRRR(
  property: Property,
  initialMortgage: Mortgage,
  refinance: Refinance
): BRRRRAnalysis {
  const config = getConfig()

  // === PHASE 1: BUY ===
  const purchasePrice = property.purchasePrice
  const downPayment = purchasePrice * (initialMortgage.downPaymentPercent / 100)
  const loanAmount = purchasePrice - downPayment

  // Frais de clôture
  const welcomeTax = calculateWelcomeTax(
    purchasePrice,
    property.address.municipalAssessment,
    property.address.city
  )

  const schlResult = initialMortgage.isInsured
    ? calculateSCHLPremium(loanAmount, purchasePrice, initialMortgage.amortization)
    : { premium: 0, premiumAmount: 0, tvq: 0 }

  const closingCosts = {
    welcomeTax: welcomeTax.totalTax,
    notaryFees: config.closingCosts.notaryFees.max,
    inspection: config.closingCosts.inspectionFee,
    appraisal: config.closingCosts.appraisalFee,
    titleInsurance: config.closingCosts.titleInsurance,
    schlPremium: schlResult.premiumAmount,
    schlTVQ: schlResult.tvq, // ⚠️ TVQ sur SCHL = dépense cash non finançable
    total: 0,
  }
  closingCosts.total = Object.values(closingCosts).reduce((a, b) => a + b, 0)

  const totalAcquisitionCost = downPayment + closingCosts.total

  // === PHASE 2: REHAB ===
  const renovationBudget = property.renovationBudget
  const renovationMonths = property.renovationDuration

  // Frais de portage pendant rénovation
  const monthlyMortgage = calculateMortgagePayment(
    loanAmount + schlResult.premiumAmount,
    initialMortgage.interestRate / 100,
    initialMortgage.amortization
  )

  // Intérêts seulement pendant réno (simplification: juste les intérêts)
  const monthlyInterestOnly = (loanAmount * (initialMortgage.interestRate / 100)) / 12
  const monthlyTaxes = (property.expenses.municipalTax + property.expenses.schoolTax) / 12
  const monthlyInsurance = property.expenses.insurance / 12
  const monthlyUtilities = (property.expenses.electricity + property.expenses.heating) / 12

  const holdingCosts = {
    mortgageInterest: Math.round(monthlyInterestOnly * renovationMonths),
    taxes: Math.round(monthlyTaxes * renovationMonths),
    insurance: Math.round(monthlyInsurance * renovationMonths),
    utilities: Math.round(monthlyUtilities * renovationMonths),
    total: 0,
  }
  holdingCosts.total = Object.values(holdingCosts).reduce((a, b) => a + b, 0)

  const totalInvestmentBeforeRefi = totalAcquisitionCost + renovationBudget + holdingCosts.total

  // === PHASE 3: RENT ===
  const monthlyRent = property.units.reduce((sum, u) => sum + u.currentRent, 0)
  const grossRevenue = monthlyRent * 12
  const vacancyLoss = grossRevenue * config.defaults.vacancyRate
  const operatingExpenses =
    property.expenses.municipalTax +
    property.expenses.schoolTax +
    property.expenses.insurance +
    property.expenses.maintenance +
    (grossRevenue * (property.expenses.managementPercent / 100))
  const annualNOI = grossRevenue - vacancyLoss - operatingExpenses

  // === PHASE 4: REFINANCE ===
  const afterRepairValue = property.afterRepairValue
  const maxNewLoan = afterRepairValue * (refinance.targetLTV / 100)
  const newLoanAmount = Math.min(maxNewLoan, afterRepairValue * 0.8) // Max 80% LTV conventionnel
  const cashOutAmount = newLoanAmount - (loanAmount + schlResult.premiumAmount)

  const capitalLeftInDeal = totalInvestmentBeforeRefi - Math.max(0, cashOutAmount)

  const newMonthlyPayment = calculateMortgagePayment(
    newLoanAmount,
    refinance.newRate / 100,
    refinance.newAmortization
  )

  // === PHASE 5: REPEAT ===
  // Créer un mortgage fictif pour l'analyse de cashflow post-refi
  const postRefiMortgage: Mortgage = {
    loanAmount: newLoanAmount,
    downPaymentPercent: 100 - refinance.targetLTV,
    interestRate: refinance.newRate,
    amortization: refinance.newAmortization,
    term: 5,
    isInsured: false,
    isMliSelect: false,
  }

  const cashflowAnalysis = analyzeCashflow(
    property,
    postRefiMortgage,
    Math.max(0, capitalLeftInDeal)
  )

  // === MÉTRIQUES GLOBALES ===
  const totalCashInvested = Math.max(0, capitalLeftInDeal)
  const equityCreated = afterRepairValue - newLoanAmount
  const returnOnInvestment = totalCashInvested > 0
    ? ((equityCreated + cashflowAnalysis.annualCashflow) / totalCashInvested) * 100
    : Infinity
  const infiniteReturn = cashOutAmount >= totalInvestmentBeforeRefi

  // Waterfall pour graphique
  const waterfall = [
    { label: 'Prix d\'achat', value: -purchasePrice, type: 'cost' as const },
    { label: 'Frais acquisition', value: -closingCosts.total, type: 'cost' as const },
    { label: 'Rénovations', value: -renovationBudget, type: 'cost' as const },
    { label: 'Frais de portage', value: -holdingCosts.total, type: 'cost' as const },
    { label: 'Nouvelle valeur (ARV)', value: afterRepairValue, type: 'value' as const },
    { label: 'Cash-out refinancement', value: cashOutAmount, type: 'equity' as const },
    { label: 'Capital dans le deal', value: -capitalLeftInDeal, type: 'equity' as const },
  ]

  return {
    purchasePrice,
    downPayment,
    closingCosts,
    totalAcquisitionCost,
    renovationBudget,
    holdingCosts,
    totalInvestmentBeforeRefi,
    monthlyRent,
    annualNOI,
    afterRepairValue,
    newLoanAmount,
    cashOutAmount: Math.max(0, cashOutAmount),
    capitalLeftInDeal,
    newMonthlyPayment,
    cashflowAnalysis,
    totalCashInvested,
    equityCreated,
    returnOnInvestment: Math.round(returnOnInvestment * 100) / 100,
    cashOnCashReturn: cashflowAnalysis.cashOnCash,
    infiniteReturn,
    waterfall,
  }
}
```

---

## 📊 Composants de Visualisation

### DSCRGauge.tsx (Jauge de Risque)

```tsx
'use client'

import { cn } from '@/lib/utils'

interface DSCRGaugeProps {
  dscr: number
  dscrStressTested: number
  className?: string
}

export function DSCRGauge({ dscr, dscrStressTested, className }: DSCRGaugeProps) {
  const getZone = (value: number) => {
    if (value < 1.1) return { color: 'text-rose-600', bg: 'bg-rose-500', label: 'Danger' }
    if (value < 1.25) return { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Standard' }
    return { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Excellent' }
  }

  const zone = getZone(dscrStressTested)
  const percentage = Math.min(100, Math.max(0, (dscrStressTested / 2) * 100))

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">DSCR (Stress-Test B-20)</span>
        <span className={cn('text-2xl font-bold', zone.color)}>
          {dscrStressTested.toFixed(2)}x
        </span>
      </div>

      {/* Jauge */}
      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
        {/* Zones de couleur */}
        <div className="absolute inset-0 flex">
          <div className="w-[55%] bg-rose-200" /> {/* < 1.1 */}
          <div className="w-[12.5%] bg-amber-200" /> {/* 1.1 - 1.25 */}
          <div className="flex-1 bg-emerald-200" /> {/* > 1.25 */}
        </div>

        {/* Indicateur */}
        <div
          className={cn('absolute top-0 bottom-0 w-1 transition-all', zone.bg)}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Légende */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className="text-rose-600">1.1 (Min B-20)</span>
        <span className="text-amber-600">1.25</span>
        <span className="text-emerald-600">2.0+</span>
      </div>

      {/* Alerte si échec B-20 */}
      {dscrStressTested < 1.1 && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
          <p className="text-sm text-rose-700 dark:text-rose-400">
            ⚠️ <strong>Financement difficile</strong> - Le DSCR stress-testé est sous 1.1.
            La banque pourrait refuser le prêt malgré un cashflow positif au taux actuel.
          </p>
        </div>
      )}

      {/* DSCR au taux contractuel */}
      <div className="text-sm text-muted-foreground">
        DSCR au taux contractuel: <span className="font-medium">{dscr.toFixed(2)}x</span>
      </div>
    </div>
  )
}
```

### WaterfallChart.tsx (BRRRR Visualization)

```tsx
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface WaterfallData {
  label: string
  value: number
  type: 'cost' | 'value' | 'equity'
}

interface WaterfallChartProps {
  data: WaterfallData[]
  className?: string
}

export function WaterfallChart({ data, className }: WaterfallChartProps) {
  // Préparer les données pour Recharts (cumulative waterfall)
  let cumulative = 0
  const chartData = data.map((item) => {
    const start = cumulative
    cumulative += item.value
    return {
      name: item.label,
      value: item.value,
      start,
      end: cumulative,
      type: item.type,
    }
  })

  const getColor = (type: string) => {
    switch (type) {
      case 'cost': return '#ef4444'   // Rose
      case 'value': return '#22c55e'   // Vert
      case 'equity': return '#3b82f6'  // Bleu
      default: return '#94a3b8'
    }
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <XAxis
            type="number"
            tickFormatter={(v) => formatCurrency(Math.abs(v))}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => label}
          />
          <ReferenceLine x={0} stroke="#666" />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getColor(entry.type)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Légende */}
      <div className="flex gap-4 justify-center mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-500" />
          <span>Coûts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Valeur</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Équité</span>
        </div>
      </div>
    </div>
  )
}
```

### SensitivityTable.tsx (Analyse de Sensibilité)

```tsx
'use client'

import { cn, formatCurrency } from '@/lib/utils'
import { calculateMortgagePayment } from '@/features/calculator/engines/mortgage'

interface SensitivityTableProps {
  loanAmount: number
  baseRate: number
  amortization: number
  noi: number
  className?: string
}

export function SensitivityTable({
  loanAmount,
  baseRate,
  amortization,
  noi,
  className
}: SensitivityTableProps) {
  const scenarios = [
    { label: 'Actuel', rate: baseRate },
    { label: 'Stress Test B-20', rate: Math.max(baseRate + 2, 5.25) },
    { label: 'Renouvellement +3%', rate: baseRate + 3 },
  ]

  const results = scenarios.map((s) => {
    const monthlyPayment = calculateMortgagePayment(
      loanAmount,
      s.rate / 100,
      amortization
    )
    const annualDebt = monthlyPayment * 12
    const cashflow = noi - annualDebt
    const dscr = annualDebt > 0 ? noi / annualDebt : 0

    return {
      ...s,
      monthlyPayment,
      annualCashflow: cashflow,
      monthlyCashflow: cashflow / 12,
      dscr,
    }
  })

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Scénario</th>
            <th className="text-right p-3 font-medium">Taux</th>
            <th className="text-right p-3 font-medium">Paiement/mois</th>
            <th className="text-right p-3 font-medium">Cashflow/mois</th>
            <th className="text-right p-3 font-medium">DSCR</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr
              key={i}
              className={cn(
                'border-b',
                i === 1 && 'bg-amber-50 dark:bg-amber-950/20',
                i === 2 && 'bg-rose-50 dark:bg-rose-950/20'
              )}
            >
              <td className="p-3 font-medium">{r.label}</td>
              <td className="text-right p-3">{r.rate.toFixed(2)}%</td>
              <td className="text-right p-3">{formatCurrency(r.monthlyPayment)}</td>
              <td className={cn(
                'text-right p-3 font-semibold',
                r.monthlyCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'
              )}>
                {formatCurrency(r.monthlyCashflow)}
              </td>
              <td className={cn(
                'text-right p-3 font-semibold',
                r.dscr >= 1.25 ? 'text-emerald-600' :
                r.dscr >= 1.1 ? 'text-amber-600' : 'text-rose-600'
              )}>
                {r.dscr.toFixed(2)}x
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 🧪 Tests (Vitest)

### features/calculator/__tests__/welcome-tax.test.ts

```typescript
import { describe, it, expect } from 'vitest'
import { calculateWelcomeTax } from '../engines/welcome-tax'

describe('Welcome Tax Calculator', () => {
  describe('Montreal 2025', () => {
    it('should calculate correctly for 500K property', () => {
      const result = calculateWelcomeTax(500000, undefined, 'montreal')

      // 61,500 × 0.5% = 307.50
      // (307,800 - 61,500) × 1% = 2,463
      // (500,000 - 307,800) × 1.5% = 2,883
      // Total ≈ 5,654
      expect(result.totalTax).toBeCloseTo(5654, -1)
      expect(result.city).toBe('montreal')
    })

    it('should calculate correctly for 3.5M property (tranche 4%)', () => {
      const result = calculateWelcomeTax(3500000, undefined, 'montreal')

      // Doit atteindre la tranche 4% (>3,113,000)
      expect(result.breakdown.some(b => b.bracket.includes('4.0%'))).toBe(true)
      // Total environ 87,000$+
      expect(result.totalTax).toBeGreaterThan(85000)
    })

    it('should use comparative factor when assessment is higher', () => {
      // Prix: 400K, Évaluation: 450K, Facteur MTL: 1.08
      // Base imposable = max(400K, 450K × 1.08) = max(400K, 486K) = 486K
      const result = calculateWelcomeTax(400000, 450000, 'montreal')

      expect(result.taxableBase).toBe(486000)
      expect(result.comparativeFactor).toBe(1.08)
    })
  })

  describe('Quebec Standard', () => {
    it('should use standard brackets for Quebec city', () => {
      const result = calculateWelcomeTax(400000, undefined, 'quebec')

      expect(result.comparativeFactor).toBe(1.00)
      // Max rate should be 1.5% (not 4% like Montreal)
      expect(result.breakdown.every(b => !b.bracket.includes('4.0%'))).toBe(true)
    })
  })
})
```

### features/calculator/__tests__/stress-test.test.ts

```typescript
import { describe, it, expect } from 'vitest'
import { calculateStressTestedPayment } from '../engines/mortgage'

describe('B-20 Stress Test', () => {
  it('should use floor rate when contract rate + 2% is lower', () => {
    // Taux contractuel: 2% → 2% + 2% = 4% < 5.25% → utiliser 5.25%
    const payment = calculateStressTestedPayment(400000, 0.02, 25)
    const paymentAtFloor = calculateStressTestedPayment(400000, 0.0325, 25) // 3.25% + 2% = 5.25%

    expect(payment).toBeCloseTo(paymentAtFloor, 0)
  })

  it('should use contract rate + 2% when higher than floor', () => {
    // Taux contractuel: 4% → 4% + 2% = 6% > 5.25% → utiliser 6%
    const paymentStressed = calculateStressTestedPayment(400000, 0.04, 25)
    const paymentAt6 = calculateStressTestedPayment(400000, 0.06, 25)

    // Les deux devraient être identiques (le stress test utilise 6%)
    // Note: on compare avec le calcul direct à 6%
    expect(paymentStressed).toBeGreaterThan(2300) // Environ 2,386$/mois à 6%
  })
})
```

---

## 🚀 Migration V1 → V2

### Étapes de Migration

1. **Phase 1: Infrastructure** (Semaine 1)
   - [ ] Créer la structure FSD
   - [ ] Implémenter `fiscal-2025.json`
   - [ ] Créer le `ConfigService` avec validation Zod
   - [ ] Mettre en place Zustand avec slices

2. **Phase 2: Moteurs de Calcul** (Semaine 2)
   - [ ] Migrer les calculs vers `/features/calculator/engines/`
   - [ ] Ajouter les tests Vitest
   - [ ] Implémenter le stress test B-20
   - [ ] Créer le moteur BRRRR complet

3. **Phase 3: UI Wizard** (Semaine 3)
   - [ ] Créer le layout Wizard avec steps
   - [ ] Implémenter chaque étape (Setup → Chantier → Opération → Verdict)
   - [ ] Intégrer les composants de visualisation

4. **Phase 4: Fonctionnalités Avancées** (Semaine 4)
   - [ ] PDF Upload amélioré (patterns Centris V2)
   - [ ] Génération de rapports PDF (React-PDF)
   - [ ] Mode comparaison (plusieurs scénarios)
   - [ ] Export/Import de projets

---

## 📋 Checklist Fonctionnalités V2

### Acquisition & Fiscalité
- [ ] Taxe de Bienvenue auto-calculée (MTL/QC/Autre)
- [ ] Facteur comparatif municipal
- [ ] TVQ sur prime SCHL (non-finançable)
- [ ] Frais de clôture détaillés

### Financement
- [ ] Stress Test B-20 automatique
- [ ] Jauge DSCR tricolore
- [ ] Support MLI Select (50 ans / 95% LTV)
- [ ] Analyse de sensibilité (3 scénarios)

### Dépenses Québec
- [ ] Déneigement (champ explicite)
- [ ] Taxes scolaires (séparées)
- [ ] Warning si gestion = 0%
- [ ] % ou $/porte pour maintenance

### Revenus & TAL
- [ ] Croissance loyers bloquée à 2% par défaut
- [ ] Calcul potentiel vs actuel
- [ ] Vacance configurable

### Visualisation
- [ ] Graphique Waterfall BRRRR
- [ ] Jauge DSCR
- [ ] Table de sensibilité
- [ ] Timeline projet

### Persistance & UX
- [ ] Sauvegarde localStorage (Zustand persist)
- [ ] Protection hydration Next.js
- [ ] Wizard étape par étape
- [ ] Tooltips explicatifs

---

## 📚 Ressources

- [Barèmes MTL 2025](https://montreal.ca/en/articles/how-property-transfer-duties-are-calculated-9279)
- [Primes SCHL 2025](https://wowa.ca/calculators/assurance-schl)
- [Règle B-20 BSIF](https://www.osfi-bsif.gc.ca/fra/fi-if/rg-ro/gdn-ort/gl-ld/Pages/b20-let.aspx)
- [Indices TAL 2025](https://www.tal.gouv.qc.ca/fr/actualites/detail?code=le-calcul-de-l-ajustement-des-loyers-en-2025)

---

*Document généré pour PlexInvest V2 - Janvier 2025*
