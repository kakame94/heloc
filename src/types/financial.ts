/**
 * PlexInvest Québec - Types financiers et interfaces
 * Ces types définissent la structure des données pour les calculs BRRRR et HELOC
 */

import Decimal from 'decimal.js'

// ============================================================================
// CONSTANTES RÉGLEMENTAIRES BSIF (Hard-coded)
// ============================================================================

export const BSIF_RULES = {
  /** Limite LTV pour portion HELOC rotative (intérêts seulement) */
  HELOC_ROTATING_LTV_MAX: 0.65,
  /** Limite LTV totale pour refinancement (1-4 logements) */
  REFINANCE_LTV_MAX: 0.80,
  /** Buffer du stress test BSIF */
  STRESS_TEST_BUFFER: 0.02,
  /** Plancher du stress test BSIF */
  STRESS_TEST_FLOOR: 0.0525,
  /** DCR minimum pour financement commercial */
  MIN_DCR_COMMERCIAL: 1.25,
} as const

export const CMHC_RULES = {
  /** Seuil de mise de fonds pour éviter l'assurance SCHL */
  INSURANCE_THRESHOLD: 0.20,
  /** Primes SCHL selon mise de fonds (1-4 logements) */
  PREMIUMS: {
    '5-9.99': 0.0400,   // 4.00%
    '10-14.99': 0.0310, // 3.10%
    '15-19.99': 0.0280, // 2.80%
  } as Record<string, number>,
  /** Amortissement max MLI Select */
  MLI_SELECT_MAX_AMORT: 50,
} as const

// ============================================================================
// TYPES D'ENTRÉE POUR LES CALCULS
// ============================================================================

export interface PropertyFinancials {
  // Phase 1: Acquisition
  purchasePrice: number
  downPaymentPercent: number

  // Frais d'acquisition
  municipality: MunicipalityCode
  notaryFees?: number
  inspectionFees?: number
  otherClosingCosts?: number

  // Financement initial
  mortgageRate: number // Taux nominal annuel
  amortizationYears: number

  // Phase 2: Rénovation
  renovationBudget: number
  renovationContingencyPercent?: number
  renovationDurationMonths: number
  renoFinancingType: RenoFinancingType
  helocRateForReno?: number

  // Phase 3: Location
  projectedMonthlyRent: number
  vacancyRatePercent?: number

  // Charges d'exploitation (annuelles sauf indication contraire)
  municipalTaxes: number
  schoolTaxes: number
  insuranceAnnual: number
  maintenancePercent?: number // % des revenus, défaut 5%
  managementPercent?: number  // % des revenus si gestion externe
  utilitiesMonthly?: number

  // Phase 4: Refinancement
  afterRepairValue: number
  refinanceRate: number
  refinanceAmortYears: number

  // Contexte
  totalUnits: number
  isOwnerOccupied: boolean
}

export type RenoFinancingType = 'CASH' | 'HELOC' | 'PERSONAL_LOC' | 'PRIVATE_LOAN'

export type MunicipalityCode =
  | 'MONTREAL'
  | 'QUEBEC_CITY'
  | 'LAVAL'
  | 'LONGUEUIL'
  | 'GATINEAU'
  | 'SHERBROOKE'
  | 'TROIS_RIVIERES'
  | 'OTHER_QC'

// ============================================================================
// RÉSULTATS DES CALCULS BRRRR
// ============================================================================

export interface BrrrrCalculationResult {
  // Phase 1: Acquisition
  acquisition: {
    purchasePrice: number
    downPaymentAmount: number
    downPaymentPercent: number
    transferTax: number
    notaryFees: number
    inspectionFees: number
    otherClosingCosts: number
    cmhcPremium: number | null
    cmhcPremiumPercent: number | null
    totalClosingCosts: number
    initialMortgageAmount: number
    initialMonthlyPayment: number
    totalCashAtAcquisition: number
  }

  // Phase 2: Rénovation
  renovation: {
    budgetBase: number
    contingency: number
    totalBudget: number
    durationMonths: number
    financingType: RenoFinancingType
    monthlyCarryCost: number // Coût mensuel pendant travaux
    totalCarryCost: number
  }

  // Phase 3: Location
  rental: {
    grossMonthlyRent: number
    effectiveGrossIncome: number // Après vacance
    vacancyLoss: number

    // Charges (mensuelles)
    municipalTaxes: number
    schoolTaxes: number
    insurance: number
    maintenance: number
    management: number
    utilities: number
    totalOperatingExpenses: number

    // NOI
    monthlyNOI: number
    annualNOI: number
  }

  // Phase 4: Refinancement
  refinance: {
    afterRepairValue: number

    // Limites BSIF
    maxLtvTotal: number // 80%
    maxLtvRotating: number // 65%

    // Structure du refinancement
    newMortgageAmount: number
    helocPortionAmount: number // Portion rotative (max 65%)
    amortizedPortionAmount: number // Portion amortie (si > 65%)

    // Paiement après refi
    monthlyMortgagePayment: number
    monthlyHelocPayment: number // Intérêts seulement sur portion rotative
    totalMonthlyDebtService: number

    // Frais de refinancement
    appraisalFee: number
    legalFees: number
    totalRefinanceCosts: number

    // Extraction de capital
    grossCashOut: number
    netCashOut: number
  }

  // KPIs Finaux
  kpis: {
    // Investissement total
    totalCashInvested: number
    cashExtractedAtRefi: number
    equityLeftInDeal: number

    // Cashflow
    monthlyNOI: number
    monthlyDebtService: number
    monthlyCashflow: number
    annualCashflow: number

    // Rendements
    cashOnCashReturn: number // %
    returnOnEquity: number // %
    capRate: number // %
    grossRentMultiplier: number

    // Indicateurs spéciaux
    isInfiniteReturn: boolean
    debtCoverageRatio: number
    meetsMinDCR: boolean

    // Stress test BSIF
    stressTestRate: number
    monthlyPaymentAtStressRate: number
    passesStressTest: boolean
  }

  // Validation et avertissements
  validation: {
    isValid: boolean
    warnings: string[]
    errors: string[]
  }

  // MLI Select (pour 5+ logements)
  mliSelect?: {
    isEligible: boolean
    potentialAmortization: number
    potentialCashflowIncrease: number
  }
}

// ============================================================================
// TYPES POUR LE CALCULATEUR HELOC
// ============================================================================

export interface HelocCapacityInput {
  currentPropertyValue: number
  currentMortgageBalance: number
  currentHelocBalance?: number
}

export interface HelocCapacityResult {
  // Limites
  maxLtvTotal: number // 80%
  maxLtvRotating: number // 65%

  // Calculs de capacité
  maxTotalBorrowing: number // 80% de la valeur
  maxRotatingCredit: number // 65% de la valeur

  // Disponible
  totalEquity: number
  availableEquityAtRotating: number // Disponible en HELOC rotatif
  availableEquityAtTotal: number // Disponible en prêt amorti

  // Recommandation
  recommendedHelocLimit: number
  canAccessRotating: boolean // False si déjà > 65%

  // Détail
  currentLtv: number
  afterHelocLtv: number
}

// ============================================================================
// DROITS DE MUTATION (TAXE DE BIENVENUE)
// ============================================================================

export interface TransferTaxBracket {
  min: number
  max: number
  rate: number
}

export interface MunicipalityTransferTax {
  code: MunicipalityCode
  name: string
  brackets: TransferTaxBracket[]
  additionalRates?: {
    threshold: number
    rate: number
  }[]
}

// ============================================================================
// MATRICE DE SENSIBILITÉ
// ============================================================================

export interface SensitivityMatrixInput {
  baseCase: BrrrrCalculationResult
  variable1: {
    name: 'interestRate' | 'renovationCost' | 'rent' | 'arv' | 'purchasePrice'
    values: number[]
  }
  variable2: {
    name: 'interestRate' | 'renovationCost' | 'rent' | 'arv' | 'purchasePrice'
    values: number[]
  }
}

export interface SensitivityMatrixResult {
  variable1Name: string
  variable1Values: number[]
  variable2Name: string
  variable2Values: number[]

  // Matrice des résultats
  cashOnCashMatrix: number[][]
  cashflowMatrix: number[][]
  roiMatrix: number[][]

  // Analyse
  bestCase: { var1: number; var2: number; value: number }
  worstCase: { var1: number; var2: number; value: number }
  breakEvenPoints: { var1: number; var2: number }[]
}

// ============================================================================
// COÛTS DE RÉNOVATION
// ============================================================================

export type RenovationCategory =
  | 'kitchen'
  | 'bathroom'
  | 'flooring'
  | 'painting'
  | 'basement'
  | 'roof'
  | 'windows'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'exterior'
  | 'other'

export type RenovationTier = 'ECONOMIC' | 'STANDARD' | 'PREMIUM'

export interface RenovationCostEstimate {
  category: RenovationCategory
  tier: RenovationTier
  quantity: number // pi² ou unité selon catégorie
  unitCost: number
  totalCost: number
}

export interface RenovationBudget {
  items: RenovationCostEstimate[]
  subtotal: number
  contingencyPercent: number
  contingencyAmount: number
  total: number
}

// ============================================================================
// TIMELINE BRRRR
// ============================================================================

export interface BrrrrTimelineEvent {
  id: string
  phase: 'acquisition' | 'renovation' | 'renting' | 'refinancing' | 'stabilized'
  name: string
  startMonth: number
  endMonth: number
  cashflowImpact: number // Négatif pendant rénos, positif après
}

export interface BrrrrTimeline {
  events: BrrrrTimelineEvent[]
  totalDurationMonths: number
  cumulativeCashflow: number[]
  breakEvenMonth: number | null
  capitalRecoveryMonth: number | null
}
