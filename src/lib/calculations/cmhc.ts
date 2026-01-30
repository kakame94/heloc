/**
 * PlexInvest Québec - Calculs SCHL/CMHC
 *
 * La Société canadienne d'hypothèques et de logement (SCHL) assure
 * les prêts hypothécaires à ratio élevé (mise de fonds < 20%).
 * Les primes varient selon le % de mise de fonds.
 */

import Decimal from 'decimal.js'
import { CMHC_RULES } from '@/types/financial'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Primes d'assurance SCHL selon la mise de fonds
 * Pour propriétés 1-4 logements (résidentiel)
 */
const CMHC_PREMIUM_RATES = {
  // Mise de fonds 5% à 9.99%
  LOW: { minDown: 0.05, maxDown: 0.0999, rate: 0.04 },
  // Mise de fonds 10% à 14.99%
  MEDIUM: { minDown: 0.10, maxDown: 0.1499, rate: 0.031 },
  // Mise de fonds 15% à 19.99%
  HIGH: { minDown: 0.15, maxDown: 0.1999, rate: 0.028 },
} as const

/**
 * Règles spéciales pour propriétaire-occupant vs investisseur
 */
export interface CMHCContext {
  isOwnerOccupied: boolean
  propertyValue: number
  downPaymentPercent: number
  totalUnits: number
  purchasePrice: number
}

export interface CMHCResult {
  requiresInsurance: boolean
  premiumRate: number | null
  premiumAmount: number | null
  totalMortgageWithPremium: number
  effectiveDownPaymentRequired: number
  notes: string[]
}

/**
 * Calcule la prime d'assurance SCHL et valide l'éligibilité
 *
 * Règles clés:
 * - Obligatoire si mise de fonds < 20%
 * - Maximum 1-4 logements pour haute ratio
 * - Investisseurs: mise de fonds minimum 20% (pas de SCHL)
 * - Propriétaire-occupant: mise de fonds min 5% (1 logement) ou 10% (2-4 logements)
 *
 * @param context - Contexte de l'achat
 * @returns Résultat du calcul SCHL
 */
export function calculateCMHCPremium(context: CMHCContext): CMHCResult {
  const {
    isOwnerOccupied,
    propertyValue,
    downPaymentPercent,
    totalUnits,
    purchasePrice,
  } = context

  const notes: string[] = []
  const loanAmount = new Decimal(purchasePrice).times(1 - downPaymentPercent)

  // Vérifier si l'assurance est requise
  if (downPaymentPercent >= CMHC_RULES.INSURANCE_THRESHOLD) {
    return {
      requiresInsurance: false,
      premiumRate: null,
      premiumAmount: null,
      totalMortgageWithPremium: loanAmount.toNumber(),
      effectiveDownPaymentRequired: downPaymentPercent,
      notes: ['Mise de fonds ≥ 20%: Aucune assurance SCHL requise'],
    }
  }

  // Investisseur pur (non propriétaire-occupant)
  if (!isOwnerOccupied) {
    notes.push('⚠️ Investisseur non-occupant: Mise de fonds minimum 20% requise')
    notes.push('L\'assurance SCHL n\'est pas disponible pour les investisseurs purs')
    return {
      requiresInsurance: false,
      premiumRate: null,
      premiumAmount: null,
      totalMortgageWithPremium: loanAmount.toNumber(),
      effectiveDownPaymentRequired: 0.20, // Force 20% pour investisseur
      notes,
    }
  }

  // Vérifier le nombre de logements
  if (totalUnits > 4) {
    notes.push('⚠️ Immeubles 5+ logements: Financement commercial requis (voir MLI Select)')
    return {
      requiresInsurance: false,
      premiumRate: null,
      premiumAmount: null,
      totalMortgageWithPremium: loanAmount.toNumber(),
      effectiveDownPaymentRequired: 0.20,
      notes,
    }
  }

  // Vérifier mise de fonds minimum selon type
  let minDownPayment = 0.05 // 5% pour unifamiliale

  if (totalUnits >= 2 && totalUnits <= 4) {
    minDownPayment = 0.10 // 10% pour 2-4 logements
    notes.push('Plex 2-4 logements: Mise de fonds minimum 10%')
  }

  if (downPaymentPercent < minDownPayment) {
    notes.push(`⚠️ Mise de fonds insuffisante: ${(minDownPayment * 100).toFixed(0)}% minimum requis`)
    return {
      requiresInsurance: true,
      premiumRate: null,
      premiumAmount: null,
      totalMortgageWithPremium: loanAmount.toNumber(),
      effectiveDownPaymentRequired: minDownPayment,
      notes,
    }
  }

  // Vérifier le prix maximum assurable (999 999$ depuis 2024)
  const maxInsurablePrice = 999999
  if (purchasePrice > maxInsurablePrice) {
    notes.push(`⚠️ Prix > ${formatCurrency(maxInsurablePrice)}: Non assurable SCHL`)
    notes.push('Mise de fonds 20% requise pour propriétés > 1M$')
    return {
      requiresInsurance: false,
      premiumRate: null,
      premiumAmount: null,
      totalMortgageWithPremium: loanAmount.toNumber(),
      effectiveDownPaymentRequired: 0.20,
      notes,
    }
  }

  // Calculer la mise de fonds effective pour propriétés > 500k
  // 5% sur premiers 500k, 10% sur le reste
  let effectiveMinDown = minDownPayment
  if (purchasePrice > 500000 && totalUnits === 1) {
    const downOn500k = 500000 * 0.05
    const downOnExcess = (purchasePrice - 500000) * 0.10
    const totalMinDown = downOn500k + downOnExcess
    effectiveMinDown = totalMinDown / purchasePrice
    notes.push(`Prix > 500k$: ${formatPercent(effectiveMinDown)} minimum requis`)
  }

  // Déterminer le taux de prime
  let premiumRate = 0.04 // Par défaut 4%

  if (downPaymentPercent >= 0.15) {
    premiumRate = 0.028 // 2.8%
    notes.push('Prime réduite: Mise de fonds 15-19.99%')
  } else if (downPaymentPercent >= 0.10) {
    premiumRate = 0.031 // 3.1%
    notes.push('Prime standard: Mise de fonds 10-14.99%')
  } else {
    premiumRate = 0.04 // 4.0%
    notes.push('Prime maximale: Mise de fonds 5-9.99%')
  }

  // Calculer la prime
  const premiumAmount = loanAmount.times(premiumRate).toDecimalPlaces(2).toNumber()
  const totalWithPremium = loanAmount.plus(premiumAmount).toNumber()

  notes.push(`Prime SCHL de ${formatPercent(premiumRate)} ajoutée au prêt`)

  return {
    requiresInsurance: true,
    premiumRate,
    premiumAmount,
    totalMortgageWithPremium: totalWithPremium,
    effectiveDownPaymentRequired: effectiveMinDown,
    notes,
  }
}

/**
 * Calcule le montant de mise de fonds requis selon le prix
 * Intègre les règles spéciales pour propriétés > 500k
 *
 * @param purchasePrice - Prix d'achat
 * @param isOwnerOccupied - Si propriétaire-occupant
 * @param totalUnits - Nombre de logements
 * @returns Mise de fonds minimum requise
 */
export function calculateMinimumDownPayment(
  purchasePrice: number,
  isOwnerOccupied: boolean,
  totalUnits: number
): { amount: number; percent: number; notes: string[] } {
  const notes: string[] = []

  // Investisseur pur
  if (!isOwnerOccupied) {
    const amount = purchasePrice * 0.20
    notes.push('Investisseur non-occupant: 20% minimum')
    return { amount, percent: 0.20, notes }
  }

  // 5+ logements
  if (totalUnits > 4) {
    notes.push('Commercial (5+ logements): Variable selon DCR')
    return { amount: purchasePrice * 0.25, percent: 0.25, notes }
  }

  // 2-4 logements propriétaire-occupant
  if (totalUnits >= 2 && totalUnits <= 4) {
    const amount = purchasePrice * 0.10
    notes.push('Plex 2-4 logements (occupant): 10% minimum')
    return { amount, percent: 0.10, notes }
  }

  // Unifamiliale propriétaire-occupant
  if (purchasePrice <= 500000) {
    const amount = purchasePrice * 0.05
    notes.push('Prix ≤ 500k$: 5% minimum')
    return { amount, percent: 0.05, notes }
  }

  if (purchasePrice <= 999999) {
    // 5% sur premiers 500k, 10% sur le reste
    const downOn500k = 500000 * 0.05
    const downOnExcess = (purchasePrice - 500000) * 0.10
    const totalDown = downOn500k + downOnExcess
    const percent = totalDown / purchasePrice
    notes.push('Prix 500k-1M$: 5% sur 500k$ + 10% sur excédent')
    return { amount: totalDown, percent, notes }
  }

  // > 1M$
  const amount = purchasePrice * 0.20
  notes.push('Prix > 1M$: 20% minimum (non assurable SCHL)')
  return { amount, percent: 0.20, notes }
}

/**
 * Vérifie l'éligibilité MLI Select pour immeubles 5+ logements
 * MLI Select permet des conditions avantageuses si critères d'abordabilité,
 * accessibilité ou efficacité énergétique sont rencontrés.
 *
 * @param params - Paramètres de l'immeuble
 * @returns Score et éligibilité MLI Select
 */
export interface MLISelectParams {
  totalUnits: number
  avgRentVsMedian: number // Ratio loyer actuel vs loyer médian du secteur
  accessibleUnits: number // Nombre d'unités accessibles
  energyEfficiencyImprovement: number // % amélioration énergétique prévue
  isNewConstruction: boolean
}

export interface MLISelectResult {
  isEligible: boolean
  score: number // 0-100
  maxAmortization: number // 25, 30, 40 ou 50 ans
  maxLTV: number // 75%, 80%, 85% ou 95%
  incentiveLevel: 'NONE' | 'STANDARD' | 'ENHANCED' | 'PREMIUM'
  recommendations: string[]
}

export function evaluateMLISelectEligibility(params: MLISelectParams): MLISelectResult {
  const { totalUnits, avgRentVsMedian, accessibleUnits, energyEfficiencyImprovement, isNewConstruction } = params

  // MLI Select uniquement pour 5+ logements
  if (totalUnits < 5) {
    return {
      isEligible: false,
      score: 0,
      maxAmortization: 25,
      maxLTV: 0.75,
      incentiveLevel: 'NONE',
      recommendations: ['MLI Select requiert un minimum de 5 logements'],
    }
  }

  let score = 0
  const recommendations: string[] = []

  // Critère d'abordabilité (loyers < médiane)
  if (avgRentVsMedian <= 0.80) {
    score += 40
    recommendations.push('✓ Excellent: Loyers ≤ 80% de la médiane (+40 points)')
  } else if (avgRentVsMedian <= 0.90) {
    score += 25
    recommendations.push('✓ Bon: Loyers ≤ 90% de la médiane (+25 points)')
  } else if (avgRentVsMedian <= 1.0) {
    score += 10
    recommendations.push('○ Loyers au niveau médiane (+10 points)')
  } else {
    recommendations.push('✗ Loyers > médiane: Aucun point abordabilité')
  }

  // Critère d'accessibilité
  const accessiblePercent = accessibleUnits / totalUnits
  if (accessiblePercent >= 0.20) {
    score += 30
    recommendations.push('✓ Excellent: ≥20% unités accessibles (+30 points)')
  } else if (accessiblePercent >= 0.10) {
    score += 15
    recommendations.push('✓ Bon: ≥10% unités accessibles (+15 points)')
  } else if (accessibleUnits >= 1) {
    score += 5
    recommendations.push('○ Au moins 1 unité accessible (+5 points)')
  }

  // Critère d'efficacité énergétique
  if (energyEfficiencyImprovement >= 25) {
    score += 30
    recommendations.push('✓ Excellent: ≥25% amélioration énergétique (+30 points)')
  } else if (energyEfficiencyImprovement >= 15) {
    score += 20
    recommendations.push('✓ Bon: ≥15% amélioration énergétique (+20 points)')
  } else if (energyEfficiencyImprovement >= 10) {
    score += 10
    recommendations.push('○ 10% amélioration énergétique (+10 points)')
  }

  // Déterminer le niveau d'incitatif
  let incentiveLevel: MLISelectResult['incentiveLevel'] = 'NONE'
  let maxAmortization = 25
  let maxLTV = 0.75

  if (score >= 70) {
    incentiveLevel = 'PREMIUM'
    maxAmortization = 50
    maxLTV = 0.95
    recommendations.push('🏆 PREMIUM: Amortissement 50 ans, LTV 95%')
  } else if (score >= 50) {
    incentiveLevel = 'ENHANCED'
    maxAmortization = 40
    maxLTV = 0.90
    recommendations.push('🥈 ENHANCED: Amortissement 40 ans, LTV 90%')
  } else if (score >= 30) {
    incentiveLevel = 'STANDARD'
    maxAmortization = 30
    maxLTV = 0.85
    recommendations.push('🥉 STANDARD: Amortissement 30 ans, LTV 85%')
  } else {
    recommendations.push('❌ Score insuffisant pour MLI Select')
    recommendations.push('Suggestion: Améliorer efficacité énergétique de 25%')
  }

  return {
    isEligible: score >= 30,
    score,
    maxAmortization,
    maxLTV,
    incentiveLevel,
    recommendations,
  }
}

// Helpers
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}
