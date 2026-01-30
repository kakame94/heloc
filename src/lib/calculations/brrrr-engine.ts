/**
 * PlexInvest Québec - Moteur de Calcul BRRRR
 *
 * Ce module est le cœur algorithmique de l'application.
 * Il intègre toutes les règles métier spécifiques au Québec:
 * - Droits de mutation par municipalité
 * - Règles BSIF pour HELOC et refinancement
 * - Primes SCHL si applicable
 * - Composition semestrielle canadienne des taux
 * - MLI Select pour 5+ logements
 */

import Decimal from 'decimal.js'
import type {
  PropertyFinancials,
  BrrrrCalculationResult,
  BSIF_RULES,
} from '@/types/financial'

import {
  calculateMonthlyMortgagePayment,
  calculateInterestOnlyPayment,
  calculateStressTestRate,
  calculateDCR,
} from './mortgage'

import {
  calculateTransferTax,
  getMunicipalityFromPostalCode,
} from './transfer-tax'

import {
  calculateCMHCPremium,
  calculateMinimumDownPayment,
} from './cmhc'

import {
  calculateOptimalRefinanceStructure,
  simulateRenovationFinancing,
} from './heloc'

// Configuration Decimal.js pour calculs financiers précis
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

// Constantes BSIF (règles hard-coded)
const BSIF = {
  HELOC_ROTATING_LTV_MAX: 0.65,
  REFINANCE_LTV_MAX: 0.80,
  STRESS_TEST_BUFFER: 0.02,
  STRESS_TEST_FLOOR: 0.0525,
  MIN_DCR_COMMERCIAL: 1.25,
}

/**
 * Calcul BRRRR complet - Point d'entrée principal
 *
 * Exécute le calcul des 4 phases BRRRR et retourne tous les KPIs
 *
 * @param input - Paramètres financiers de la propriété
 * @returns Résultat complet avec tous les KPIs et validations
 */
export function calculateBRRRR(input: PropertyFinancials): BrrrrCalculationResult {
  const warnings: string[] = []
  const errors: string[] = []

  // =========================================================================
  // PHASE 1: ACQUISITION (BUY)
  // =========================================================================

  const purchasePrice = new Decimal(input.purchasePrice)
  const downPaymentPercent = new Decimal(input.downPaymentPercent)
  const downPaymentAmount = purchasePrice.times(downPaymentPercent)

  // Calcul des droits de mutation (taxe de bienvenue)
  const transferTax = calculateTransferTax(input.purchasePrice, input.municipality)

  // Frais de clôture
  const notaryFees = input.notaryFees ?? 2000
  const inspectionFees = input.inspectionFees ?? 800
  const otherClosingCosts = input.otherClosingCosts ?? 0

  // Calcul SCHL si applicable
  const cmhcResult = calculateCMHCPremium({
    isOwnerOccupied: input.isOwnerOccupied,
    propertyValue: input.purchasePrice,
    downPaymentPercent: input.downPaymentPercent,
    totalUnits: input.totalUnits,
    purchasePrice: input.purchasePrice,
  })

  // Validation mise de fonds
  if (cmhcResult.effectiveDownPaymentRequired > input.downPaymentPercent) {
    errors.push(
      `Mise de fonds insuffisante: ${(input.downPaymentPercent * 100).toFixed(1)}% fourni, ` +
      `${(cmhcResult.effectiveDownPaymentRequired * 100).toFixed(1)}% requis`
    )
  }

  // Montant hypothécaire initial
  const loanAmount = purchasePrice.minus(downPaymentAmount)
  const initialMortgageAmount = cmhcResult.premiumAmount
    ? loanAmount.plus(cmhcResult.premiumAmount).toNumber()
    : loanAmount.toNumber()

  // Paiement hypothécaire mensuel initial
  const initialMonthlyPayment = calculateMonthlyMortgagePayment(
    initialMortgageAmount,
    input.mortgageRate,
    input.amortizationYears
  )

  // Total cash à l'acquisition
  const totalClosingCosts = transferTax + notaryFees + inspectionFees + otherClosingCosts
  const totalCashAtAcquisition = downPaymentAmount.plus(totalClosingCosts).toNumber()

  const acquisition = {
    purchasePrice: input.purchasePrice,
    downPaymentAmount: downPaymentAmount.toNumber(),
    downPaymentPercent: input.downPaymentPercent,
    transferTax,
    notaryFees,
    inspectionFees,
    otherClosingCosts,
    cmhcPremium: cmhcResult.premiumAmount,
    cmhcPremiumPercent: cmhcResult.premiumRate,
    totalClosingCosts,
    initialMortgageAmount,
    initialMonthlyPayment,
    totalCashAtAcquisition,
  }

  // =========================================================================
  // PHASE 2: RÉNOVATION (REHAB)
  // =========================================================================

  const renovationBudgetBase = new Decimal(input.renovationBudget)
  const contingencyPercent = input.renovationContingencyPercent ?? 10
  const contingencyAmount = renovationBudgetBase.times(contingencyPercent / 100)
  const totalRenovationBudget = renovationBudgetBase.plus(contingencyAmount)

  // Simuler le financement des rénovations
  const renoFinancing = input.renoFinancingType === 'HELOC' && input.helocRateForReno
    ? simulateRenovationFinancing({
        renovationBudget: totalRenovationBudget.toNumber(),
        helocRate: input.helocRateForReno,
        renovationMonths: input.renovationDurationMonths,
        drawdownSchedule: 'PROGRESSIVE',
      })
    : null

  // Coût de portage pendant les rénovations
  // (hypothèque + taxes + assurance + HELOC intérêts)
  const monthlyPropertyTaxes = new Decimal(input.municipalTaxes).div(12)
  const monthlySchoolTaxes = new Decimal(input.schoolTaxes).div(12)
  const monthlyInsurance = new Decimal(input.insuranceAnnual).div(12)

  const monthlyCarryCostBase = new Decimal(initialMonthlyPayment)
    .plus(monthlyPropertyTaxes)
    .plus(monthlySchoolTaxes)
    .plus(monthlyInsurance)

  const avgMonthlyHelocInterest = renoFinancing?.avgMonthlyCarry ?? 0
  const monthlyCarryCost = monthlyCarryCostBase.plus(avgMonthlyHelocInterest)
  const totalCarryCost = monthlyCarryCost.times(input.renovationDurationMonths)

  const renovation = {
    budgetBase: renovationBudgetBase.toNumber(),
    contingency: contingencyAmount.toNumber(),
    totalBudget: totalRenovationBudget.toNumber(),
    durationMonths: input.renovationDurationMonths,
    financingType: input.renoFinancingType,
    monthlyCarryCost: monthlyCarryCost.toNumber(),
    totalCarryCost: totalCarryCost.toNumber(),
  }

  // =========================================================================
  // PHASE 3: LOCATION (RENT)
  // =========================================================================

  const grossMonthlyRent = new Decimal(input.projectedMonthlyRent)
  const vacancyRate = input.vacancyRatePercent ?? 5
  const vacancyLoss = grossMonthlyRent.times(vacancyRate / 100)
  const effectiveGrossIncome = grossMonthlyRent.minus(vacancyLoss)

  // Charges d'exploitation mensuelles
  const monthlyMunicipalTax = new Decimal(input.municipalTaxes).div(12)
  const monthlySchoolTax = new Decimal(input.schoolTaxes).div(12)
  const monthlyInsuranceOp = new Decimal(input.insuranceAnnual).div(12)

  const maintenancePercent = input.maintenancePercent ?? 5
  const monthlyMaintenance = effectiveGrossIncome.times(maintenancePercent / 100)

  const managementPercent = input.managementPercent ?? 0
  const monthlyManagement = effectiveGrossIncome.times(managementPercent / 100)

  const monthlyUtilities = new Decimal(input.utilitiesMonthly ?? 0)

  const totalOperatingExpenses = monthlyMunicipalTax
    .plus(monthlySchoolTax)
    .plus(monthlyInsuranceOp)
    .plus(monthlyMaintenance)
    .plus(monthlyManagement)
    .plus(monthlyUtilities)

  const monthlyNOI = effectiveGrossIncome.minus(totalOperatingExpenses)
  const annualNOI = monthlyNOI.times(12)

  const rental = {
    grossMonthlyRent: grossMonthlyRent.toNumber(),
    effectiveGrossIncome: effectiveGrossIncome.toNumber(),
    vacancyLoss: vacancyLoss.toNumber(),
    municipalTaxes: monthlyMunicipalTax.toNumber(),
    schoolTaxes: monthlySchoolTax.toNumber(),
    insurance: monthlyInsuranceOp.toNumber(),
    maintenance: monthlyMaintenance.toNumber(),
    management: monthlyManagement.toNumber(),
    utilities: monthlyUtilities.toNumber(),
    totalOperatingExpenses: totalOperatingExpenses.toNumber(),
    monthlyNOI: monthlyNOI.toNumber(),
    annualNOI: annualNOI.toNumber(),
  }

  // =========================================================================
  // PHASE 4: REFINANCEMENT (REFINANCE)
  // =========================================================================

  const arv = new Decimal(input.afterRepairValue)

  // Structure optimale selon règles BSIF (65% rotatif max, 80% total max)
  const refinanceStructure = calculateOptimalRefinanceStructure(
    input.afterRepairValue,
    BSIF.REFINANCE_LTV_MAX, // 80%
    input.refinanceRate, // Taux HELOC pour portion rotative
    input.refinanceRate, // Taux hypothèque pour portion amortie
    input.refinanceAmortYears
  )

  // Frais de refinancement
  const appraisalFee = 400
  const legalFees = 1200
  const totalRefinanceCosts = appraisalFee + legalFees

  // Calcul de l'extraction de capital
  const totalDebtBeforeRefi = new Decimal(initialMortgageAmount)
    .plus(totalRenovationBudget)
    .plus(renoFinancing?.interestDuringReno ?? 0)

  const newMortgageAmount = refinanceStructure.totalFinancing
  const grossCashOut = new Decimal(newMortgageAmount).minus(totalDebtBeforeRefi)
  const netCashOut = grossCashOut.minus(totalRefinanceCosts)

  const refinance = {
    afterRepairValue: input.afterRepairValue,
    maxLtvTotal: BSIF.REFINANCE_LTV_MAX,
    maxLtvRotating: BSIF.HELOC_ROTATING_LTV_MAX,
    newMortgageAmount,
    helocPortionAmount: refinanceStructure.rotatingPortion.amount,
    amortizedPortionAmount: refinanceStructure.amortizedPortion.amount,
    monthlyMortgagePayment: refinanceStructure.amortizedPortion.monthlyPayment,
    monthlyHelocPayment: refinanceStructure.rotatingPortion.monthlyPayment,
    totalMonthlyDebtService: refinanceStructure.totalMonthlyPayment,
    appraisalFee,
    legalFees,
    totalRefinanceCosts,
    grossCashOut: grossCashOut.toNumber(),
    netCashOut: netCashOut.toNumber(),
  }

  // =========================================================================
  // KPIs FINAUX
  // =========================================================================

  // Investissement total
  const totalCashInvested = new Decimal(totalCashAtAcquisition)
    .plus(totalRenovationBudget)
    .plus(totalCarryCost)
    .plus(input.renoFinancingType === 'CASH' ? 0 : 0) // Si HELOC, pas de cash additionnel

  // Équité restante dans le deal
  const cashExtracted = netCashOut.greaterThan(0) ? netCashOut : new Decimal(0)
  const equityLeftInDeal = totalCashInvested.minus(cashExtracted)

  // Cashflow mensuel après refinancement
  const monthlyDebtService = new Decimal(refinanceStructure.totalMonthlyPayment)
  const monthlyCashflow = monthlyNOI.minus(monthlyDebtService)
  const annualCashflow = monthlyCashflow.times(12)

  // Rendements
  const cashOnCashReturn = equityLeftInDeal.greaterThan(0)
    ? annualCashflow.div(equityLeftInDeal).times(100)
    : new Decimal(Infinity) // Infinite return si équité = 0

  const isInfiniteReturn = equityLeftInDeal.lessThanOrEqualTo(0)

  const returnOnEquity = cashOnCashReturn // Même calcul pour BRRRR simplifié

  const capRate = arv.greaterThan(0)
    ? annualNOI.div(arv).times(100)
    : new Decimal(0)

  const grossRentMultiplier = grossMonthlyRent.greaterThan(0)
    ? purchasePrice.div(grossMonthlyRent.times(12))
    : new Decimal(0)

  // DCR (pour 5+ logements)
  const annualDebtService = monthlyDebtService.times(12)
  const dcr = calculateDCR(annualNOI.toNumber(), annualDebtService.toNumber())
  const meetsMinDCR = dcr >= BSIF.MIN_DCR_COMMERCIAL

  if (input.totalUnits >= 5 && !meetsMinDCR) {
    warnings.push(
      `DCR de ${dcr.toFixed(2)} inférieur au minimum de ${BSIF.MIN_DCR_COMMERCIAL} ` +
      `pour financement commercial`
    )
  }

  // Stress test BSIF
  const stressTestRate = calculateStressTestRate(input.refinanceRate)
  const monthlyPaymentAtStressRate = calculateMonthlyMortgagePayment(
    newMortgageAmount,
    stressTestRate,
    input.refinanceAmortYears
  )

  // Simplifié: on vérifie juste si le cashflow reste positif au taux stressé
  const cashflowAtStressRate = monthlyNOI.minus(monthlyPaymentAtStressRate)
  const passesStressTest = cashflowAtStressRate.greaterThanOrEqualTo(0)

  if (!passesStressTest) {
    warnings.push(
      `Cashflow négatif au taux du stress test (${(stressTestRate * 100).toFixed(2)}%)`
    )
  }

  const kpis = {
    totalCashInvested: totalCashInvested.toNumber(),
    cashExtractedAtRefi: cashExtracted.toNumber(),
    equityLeftInDeal: Math.max(0, equityLeftInDeal.toNumber()),
    monthlyNOI: monthlyNOI.toNumber(),
    monthlyDebtService: monthlyDebtService.toNumber(),
    monthlyCashflow: monthlyCashflow.toNumber(),
    annualCashflow: annualCashflow.toNumber(),
    cashOnCashReturn: isInfiniteReturn ? Infinity : cashOnCashReturn.toDecimalPlaces(2).toNumber(),
    returnOnEquity: isInfiniteReturn ? Infinity : returnOnEquity.toDecimalPlaces(2).toNumber(),
    capRate: capRate.toDecimalPlaces(2).toNumber(),
    grossRentMultiplier: grossRentMultiplier.toDecimalPlaces(2).toNumber(),
    isInfiniteReturn,
    debtCoverageRatio: dcr,
    meetsMinDCR,
    stressTestRate,
    monthlyPaymentAtStressRate,
    passesStressTest,
  }

  // =========================================================================
  // VALIDATION FINALE
  // =========================================================================

  // Vérifications de cohérence
  if (monthlyCashflow.lessThan(0)) {
    warnings.push('⚠️ Cashflow négatif - Ce projet coûte de l\'argent chaque mois')
  }

  if (cashOnCashReturn.lessThan(5) && !isInfiniteReturn) {
    warnings.push('Cash-on-Cash inférieur à 5% - Rendement faible')
  }

  if (arv.lessThanOrEqualTo(purchasePrice.plus(totalRenovationBudget))) {
    warnings.push('ARV ne couvre pas le coût total (achat + rénovations)')
  }

  const isValid = errors.length === 0

  return {
    acquisition,
    renovation,
    rental,
    refinance,
    kpis,
    validation: {
      isValid,
      warnings,
      errors,
    },
  }
}

/**
 * Calcul rapide des KPIs principaux sans détail complet
 * Utile pour le tri/filtrage de multiples propriétés
 */
export interface QuickBrrrrMetrics {
  cashOnCash: number
  monthlyCashflow: number
  capRate: number
  isInfiniteReturn: boolean
  totalInvestment: number
}

export function quickBrrrrMetrics(
  purchasePrice: number,
  renovationBudget: number,
  monthlyRent: number,
  arv: number,
  mortgageRate: number
): QuickBrrrrMetrics {
  // Estimations simplifiées
  const downPayment = purchasePrice * 0.20
  const closingCosts = purchasePrice * 0.02 + 5000 // ~2% + frais fixes
  const totalInvestment = downPayment + closingCosts + renovationBudget

  // NOI estimé (30% des revenus pour charges)
  const annualRent = monthlyRent * 12
  const annualNOI = annualRent * 0.70

  // Refinancement à 80% ARV
  const newMortgage = arv * 0.80
  const monthlyMortgage = calculateMonthlyMortgagePayment(newMortgage, mortgageRate, 25)
  const annualDebtService = monthlyMortgage * 12

  // Cashflow
  const annualCashflow = annualNOI - annualDebtService
  const monthlyCashflow = annualCashflow / 12

  // Cash out
  const debtBeforeRefi = (purchasePrice * 0.80) + renovationBudget
  const cashOut = newMortgage - debtBeforeRefi
  const equityLeft = Math.max(0, totalInvestment - cashOut)

  const cashOnCash = equityLeft > 0 ? (annualCashflow / equityLeft) * 100 : Infinity
  const capRate = (annualNOI / arv) * 100
  const isInfiniteReturn = equityLeft <= 0

  return {
    cashOnCash: isFinite(cashOnCash) ? Math.round(cashOnCash * 10) / 10 : Infinity,
    monthlyCashflow: Math.round(monthlyCashflow),
    capRate: Math.round(capRate * 10) / 10,
    isInfiniteReturn,
    totalInvestment: Math.round(totalInvestment),
  }
}

/**
 * Calcule le prix d'achat maximum pour atteindre un ROI cible
 * "À quel prix dois-je acheter pour avoir 10% Cash-on-Cash?"
 */
export function calculateMaxPurchasePrice(
  targetCashOnCash: number,
  monthlyRent: number,
  renovationBudget: number,
  arv: number,
  mortgageRate: number,
  downPaymentPercent: number = 0.20
): number {
  // Recherche dichotomique du prix
  let low = 0
  let high = arv
  let iterations = 0
  const maxIterations = 50

  while (high - low > 1000 && iterations < maxIterations) {
    const mid = (low + high) / 2
    const metrics = quickBrrrrMetrics(mid, renovationBudget, monthlyRent, arv, mortgageRate)

    if (metrics.cashOnCash >= targetCashOnCash || metrics.isInfiniteReturn) {
      low = mid
    } else {
      high = mid
    }
    iterations++
  }

  return Math.floor(low)
}
