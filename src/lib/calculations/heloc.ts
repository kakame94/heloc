/**
 * PlexInvest Québec - Calculateur de Capacité HELOC
 *
 * La Marge de Crédit Hypothécaire (HELOC) est un outil crucial pour les
 * investisseurs BRRRR. Cependant, les règles BSIF limitent la portion
 * rotative à 65% LTV maximum.
 *
 * Règles BSIF B-20 (en vigueur):
 * - Portion rotative (intérêts seulement): Max 65% LTV
 * - Portion totale (rotatif + amorti): Max 80% LTV
 */

import Decimal from 'decimal.js'
import { BSIF_RULES, type HelocCapacityInput, type HelocCapacityResult } from '@/types/financial'
export type { HelocCapacityResult } from '@/types/financial'
import { calculateInterestOnlyPayment, calculateMonthlyMortgagePayment } from './mortgage'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Calcule la capacité HELOC disponible sur une propriété
 *
 * Scénarios:
 * 1. Solde < 65% LTV: Tout l'espace jusqu'à 65% disponible en rotatif
 * 2. Solde entre 65-80% LTV: Aucun espace rotatif, mais espace en prêt amorti
 * 3. Solde > 80% LTV: Aucun espace disponible
 *
 * @param input - Données de la propriété
 * @returns Capacité HELOC détaillée
 */
export function calculateHelocCapacity(input: HelocCapacityInput): HelocCapacityResult {
  const {
    currentPropertyValue,
    currentMortgageBalance,
    currentHelocBalance = 0,
  } = input

  const propertyValue = new Decimal(currentPropertyValue)
  const mortgageBalance = new Decimal(currentMortgageBalance)
  const helocBalance = new Decimal(currentHelocBalance)

  const totalCurrentDebt = mortgageBalance.plus(helocBalance)
  const currentLtv = totalCurrentDebt.div(propertyValue)

  // Limites BSIF
  const maxLtvTotal = new Decimal(BSIF_RULES.REFINANCE_LTV_MAX) // 80%
  const maxLtvRotating = new Decimal(BSIF_RULES.HELOC_ROTATING_LTV_MAX) // 65%

  // Calculs de capacité
  const maxTotalBorrowing = propertyValue.times(maxLtvTotal)
  const maxRotatingCredit = propertyValue.times(maxLtvRotating)

  // Équité totale
  const totalEquity = propertyValue.minus(totalCurrentDebt)

  // Espace disponible en rotatif (jusqu'à 65%)
  let availableEquityAtRotating = new Decimal(0)
  if (totalCurrentDebt.lessThan(maxRotatingCredit)) {
    availableEquityAtRotating = maxRotatingCredit.minus(totalCurrentDebt)
  }

  // Espace disponible en prêt amorti (jusqu'à 80%)
  let availableEquityAtTotal = new Decimal(0)
  if (totalCurrentDebt.lessThan(maxTotalBorrowing)) {
    availableEquityAtTotal = maxTotalBorrowing.minus(totalCurrentDebt)
  }

  // Recommandation de limite HELOC
  // Si déjà > 65%, recommander de consolider en hypothèque amortie
  const canAccessRotating = totalCurrentDebt.lessThanOrEqualTo(maxRotatingCredit)
  const recommendedHelocLimit = canAccessRotating
    ? availableEquityAtRotating.toNumber()
    : 0

  // LTV après HELOC si maximisé
  const afterHelocDebt = totalCurrentDebt.plus(availableEquityAtTotal)
  const afterHelocLtv = afterHelocDebt.div(propertyValue)

  return {
    maxLtvTotal: maxLtvTotal.toNumber(),
    maxLtvRotating: maxLtvRotating.toNumber(),
    maxTotalBorrowing: maxTotalBorrowing.toDecimalPlaces(2).toNumber(),
    maxRotatingCredit: maxRotatingCredit.toDecimalPlaces(2).toNumber(),
    totalEquity: totalEquity.toDecimalPlaces(2).toNumber(),
    availableEquityAtRotating: availableEquityAtRotating.toDecimalPlaces(2).toNumber(),
    availableEquityAtTotal: availableEquityAtTotal.toDecimalPlaces(2).toNumber(),
    recommendedHelocLimit: Math.max(0, recommendedHelocLimit),
    canAccessRotating,
    currentLtv: currentLtv.toDecimalPlaces(4).toNumber(),
    afterHelocLtv: afterHelocLtv.toDecimalPlaces(4).toNumber(),
  }
}

/**
 * Structure de financement optimale pour un projet BRRRR
 * Combine HELOC rotatif et prêt amorti selon les règles BSIF
 */
export interface OptimalFinancingStructure {
  // Portion rotative (intérêts seulement) - Max 65% LTV
  rotatingPortion: {
    amount: number
    monthlyPayment: number // Intérêts seulement
    isAvailable: boolean
  }

  // Portion amortie (capital + intérêts) - 65% à 80% LTV
  amortizedPortion: {
    amount: number
    monthlyPayment: number
    amortizationYears: number
    isRequired: boolean
  }

  // Total
  totalFinancing: number
  totalMonthlyPayment: number
  effectiveLtv: number

  // Notes
  notes: string[]
}

/**
 * Calcule la structure de financement optimale pour un refinancement BRRRR
 *
 * @param afterRepairValue - Valeur après rénovations (ARV)
 * @param targetLtv - LTV cible (max 80%)
 * @param helocRate - Taux HELOC
 * @param mortgageRate - Taux hypothèque amortie
 * @param amortizationYears - Amortissement pour portion amortie
 * @returns Structure optimale
 */
export function calculateOptimalRefinanceStructure(
  afterRepairValue: number,
  targetLtv: number,
  helocRate: number,
  mortgageRate: number,
  amortizationYears: number = 25
): OptimalFinancingStructure {
  const arv = new Decimal(afterRepairValue)
  const notes: string[] = []

  // Limiter le LTV cible à 80% max
  const effectiveTargetLtv = Math.min(targetLtv, BSIF_RULES.REFINANCE_LTV_MAX)
  if (targetLtv > BSIF_RULES.REFINANCE_LTV_MAX) {
    notes.push(`⚠️ LTV cible réduit de ${(targetLtv * 100).toFixed(0)}% à 80% (limite BSIF)`)
  }

  const totalFinancing = arv.times(effectiveTargetLtv)

  // Portion rotative: jusqu'à 65% LTV
  const maxRotating = arv.times(BSIF_RULES.HELOC_ROTATING_LTV_MAX)
  const rotatingAmount = Decimal.min(totalFinancing, maxRotating)

  // Portion amortie: excédent au-delà de 65%
  const amortizedAmount = totalFinancing.minus(rotatingAmount)

  // Paiements mensuels
  const rotatingMonthlyPayment = calculateInterestOnlyPayment(
    rotatingAmount.toNumber(),
    helocRate
  )

  const amortizedMonthlyPayment = amortizedAmount.greaterThan(0)
    ? calculateMonthlyMortgagePayment(
        amortizedAmount.toNumber(),
        mortgageRate,
        amortizationYears
      )
    : 0

  // Notes explicatives
  if (effectiveTargetLtv <= BSIF_RULES.HELOC_ROTATING_LTV_MAX) {
    notes.push('✓ 100% en HELOC rotatif (intérêts seulement)')
    notes.push('Maximum de flexibilité pour réinvestissement')
  } else {
    const rotatingPercent = (rotatingAmount.toNumber() / totalFinancing.toNumber()) * 100
    notes.push(`Structure mixte: ${rotatingPercent.toFixed(0)}% rotatif + ${(100 - rotatingPercent).toFixed(0)}% amorti`)
    notes.push('Portion au-delà de 65% LTV requiert amortissement')
  }

  return {
    rotatingPortion: {
      amount: rotatingAmount.toDecimalPlaces(2).toNumber(),
      monthlyPayment: rotatingMonthlyPayment,
      isAvailable: true,
    },
    amortizedPortion: {
      amount: amortizedAmount.toDecimalPlaces(2).toNumber(),
      monthlyPayment: amortizedMonthlyPayment,
      amortizationYears,
      isRequired: amortizedAmount.greaterThan(0),
    },
    totalFinancing: totalFinancing.toDecimalPlaces(2).toNumber(),
    totalMonthlyPayment: rotatingMonthlyPayment + amortizedMonthlyPayment,
    effectiveLtv: effectiveTargetLtv,
    notes,
  }
}

/**
 * Simule l'utilisation d'un HELOC pour financer des rénovations
 * pendant la phase de travaux d'un projet BRRRR
 *
 * @param params - Paramètres de simulation
 * @returns Coûts pendant la période de rénovation
 */
export interface RenovationFinancingParams {
  renovationBudget: number
  helocRate: number
  renovationMonths: number
  drawdownSchedule?: 'LUMP_SUM' | 'PROGRESSIVE' // Comment l'argent est tiré
}

export interface RenovationFinancingResult {
  totalDrawn: number
  interestDuringReno: number
  monthlyInterestPayments: number[]
  totalCarryCost: number
  avgMonthlyCarry: number
}

export function simulateRenovationFinancing(
  params: RenovationFinancingParams
): RenovationFinancingResult {
  const {
    renovationBudget,
    helocRate,
    renovationMonths,
    drawdownSchedule = 'PROGRESSIVE',
  } = params

  const monthlyInterestPayments: number[] = []
  let totalInterest = new Decimal(0)

  if (drawdownSchedule === 'LUMP_SUM') {
    // Tout l'argent tiré au début
    const monthlyInterest = calculateInterestOnlyPayment(renovationBudget, helocRate)
    for (let i = 0; i < renovationMonths; i++) {
      monthlyInterestPayments.push(monthlyInterest)
      totalInterest = totalInterest.plus(monthlyInterest)
    }
  } else {
    // Tirage progressif: 1/3 au début, 1/3 au milieu, 1/3 à la fin
    const monthlyDraw = renovationBudget / renovationMonths
    let runningBalance = new Decimal(0)

    for (let month = 1; month <= renovationMonths; month++) {
      runningBalance = runningBalance.plus(monthlyDraw)
      const monthlyInterest = calculateInterestOnlyPayment(
        runningBalance.toNumber(),
        helocRate
      )
      monthlyInterestPayments.push(monthlyInterest)
      totalInterest = totalInterest.plus(monthlyInterest)
    }
  }

  const avgMonthlyCarry = totalInterest.div(renovationMonths).toDecimalPlaces(2).toNumber()

  return {
    totalDrawn: renovationBudget,
    interestDuringReno: totalInterest.toDecimalPlaces(2).toNumber(),
    monthlyInterestPayments,
    totalCarryCost: totalInterest.toDecimalPlaces(2).toNumber(),
    avgMonthlyCarry,
  }
}

/**
 * Calcule la "puissance d'achat" totale d'un investisseur
 * en combinant son HELOC disponible et sa capacité d'emprunt
 *
 * @param params - Paramètres de l'investisseur
 * @returns Puissance d'achat totale
 */
export interface BuyingPowerParams {
  // HELOC existant
  primaryResidenceValue: number
  primaryMortgageBalance: number
  currentHelocBalance: number

  // Cash disponible
  cashAvailable: number

  // Profil d'emprunt
  maxMortgageRate: number
  targetDownPaymentPercent: number
}

export interface BuyingPowerResult {
  helocAvailable: number
  cashAvailable: number
  totalForDownPayment: number
  maxPurchasePrice: number
  maxMortgageAmount: number
  notes: string[]
}

export function calculateBuyingPower(params: BuyingPowerParams): BuyingPowerResult {
  const {
    primaryResidenceValue,
    primaryMortgageBalance,
    currentHelocBalance,
    cashAvailable,
    targetDownPaymentPercent,
  } = params

  const notes: string[] = []

  // Calculer HELOC disponible
  const helocCapacity = calculateHelocCapacity({
    currentPropertyValue: primaryResidenceValue,
    currentMortgageBalance: primaryMortgageBalance,
    currentHelocBalance,
  })

  const helocAvailable = helocCapacity.canAccessRotating
    ? helocCapacity.availableEquityAtRotating
    : helocCapacity.availableEquityAtTotal

  if (!helocCapacity.canAccessRotating) {
    notes.push('⚠️ LTV actuel > 65%: HELOC disponible en mode amorti seulement')
  }

  // Total disponible pour mise de fonds
  const totalForDownPayment = helocAvailable + cashAvailable

  // Prix d'achat maximum (en supposant 20% down pour investisseur)
  const effectiveDownPercent = Math.max(targetDownPaymentPercent, 0.20)
  const maxPurchasePrice = totalForDownPayment / effectiveDownPercent
  const maxMortgageAmount = maxPurchasePrice * (1 - effectiveDownPercent)

  notes.push(`Mise de fonds: ${(effectiveDownPercent * 100).toFixed(0)}% (${formatCurrency(totalForDownPayment)})`)
  notes.push(`Prix max: ${formatCurrency(maxPurchasePrice)}`)

  return {
    helocAvailable,
    cashAvailable,
    totalForDownPayment,
    maxPurchasePrice: Math.floor(maxPurchasePrice),
    maxMortgageAmount: Math.floor(maxMortgageAmount),
    notes,
  }
}

// Helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
  }).format(amount)
}
