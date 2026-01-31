/**
 * PlexInvest V2 - Moteur de calcul BRRRR
 *
 * Analyse complète de la stratégie Buy-Rehab-Rent-Refinance-Repeat
 */

import type { Property } from '@/entities/property'
import type { Mortgage, Refinance } from '@/entities/finance'
import { calculateMortgagePayment, calculateSCHLPremium } from './mortgage'
import { calculateWelcomeTax } from './welcome-tax'
import { analyzeCashflow, type CashflowAnalysis } from './cashflow'
import { getConfig } from '@/shared/config/config-service'

export interface BRRRRAnalysis {
  // Phase 1: BUY (Acquisition)
  purchasePrice: number
  downPayment: number
  closingCosts: {
    welcomeTax: number
    notaryFees: number
    inspection: number
    appraisal: number
    titleInsurance: number
    schlPremium: number
    schlTVQ: number // NON finançable!
    total: number
  }
  totalAcquisitionCost: number

  // Phase 2: REHAB (Rénovation)
  renovationBudget: number
  holdingCosts: {
    mortgageInterest: number
    taxes: number
    insurance: number
    utilities: number
    total: number
  }
  totalInvestmentBeforeRefi: number

  // Phase 3: RENT (Location)
  monthlyRent: number
  annualNOI: number

  // Phase 4: REFINANCE
  afterRepairValue: number
  maxNewLoan: number
  newLoanAmount: number
  cashOutAmount: number
  capitalLeftInDeal: number
  newMonthlyPayment: number

  // Phase 5: REPEAT
  cashflowAnalysis: CashflowAnalysis

  // Métriques globales
  totalCashInvested: number
  equityCreated: number
  returnOnInvestment: number
  cashOnCashReturn: number
  infiniteReturn: boolean

  // Données pour graphique Waterfall
  waterfall: WaterfallItem[]

  // Résumé
  verdict: {
    isGoodDeal: boolean
    reasons: string[]
    recommendation: string
  }
}

export interface WaterfallItem {
  label: string
  value: number
  type: 'cost' | 'value' | 'equity' | 'neutral'
  cumulative: number
}

/**
 * Analyse BRRRR complète
 */
export function analyzeBRRRR(
  property: Property,
  initialMortgage: Mortgage,
  refinance: Refinance
): BRRRRAnalysis {
  const config = getConfig()

  // ============================================================
  // PHASE 1: BUY (Acquisition)
  // ============================================================
  const purchasePrice = property.purchasePrice
  const downPayment = purchasePrice * (initialMortgage.downPaymentPercent / 100)
  const loanAmount = purchasePrice - downPayment

  // Taxe de bienvenue
  const welcomeTaxResult = calculateWelcomeTax(
    purchasePrice,
    property.address.municipalAssessment,
    property.address.city
  )

  // Prime SCHL si applicable
  const schlResult = initialMortgage.isInsured
    ? calculateSCHLPremium(loanAmount, purchasePrice, initialMortgage.amortization)
    : { premiumAmount: 0, tvq: 0, newLoanAmount: loanAmount }

  const closingCosts = {
    welcomeTax: welcomeTaxResult.totalTax,
    notaryFees: config.closingCosts.notaryFees.max,
    inspection: config.closingCosts.inspectionFee,
    appraisal: config.closingCosts.appraisalFee,
    titleInsurance: config.closingCosts.titleInsurance,
    schlPremium: schlResult.premiumAmount,
    schlTVQ: schlResult.tvq, // ⚠️ TVQ non finançable!
    total: 0,
  }
  closingCosts.total =
    closingCosts.welcomeTax +
    closingCosts.notaryFees +
    closingCosts.inspection +
    closingCosts.appraisal +
    closingCosts.titleInsurance +
    closingCosts.schlTVQ // Prime SCHL finançable, mais pas la TVQ

  const totalAcquisitionCost = downPayment + closingCosts.total

  // ============================================================
  // PHASE 2: REHAB (Rénovation)
  // ============================================================
  const renovationBudget = property.renovationBudget
  const renovationMonths = property.renovationDuration

  // Frais de portage pendant la rénovation
  const loanWithPremium = schlResult.newLoanAmount
  const monthlyInterestOnly = (loanWithPremium * (initialMortgage.interestRate / 100)) / 12
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
  holdingCosts.total =
    holdingCosts.mortgageInterest +
    holdingCosts.taxes +
    holdingCosts.insurance +
    holdingCosts.utilities

  const totalInvestmentBeforeRefi =
    totalAcquisitionCost + renovationBudget + holdingCosts.total

  // ============================================================
  // PHASE 3: RENT (Location)
  // ============================================================
  const monthlyRent = property.units.reduce((sum, u) => sum + u.currentRent, 0)
  const grossRevenue = monthlyRent * 12
  const vacancyLoss = grossRevenue * config.defaults.vacancyRate
  const operatingExpenses =
    property.expenses.municipalTax +
    property.expenses.schoolTax +
    property.expenses.insurance +
    property.expenses.maintenance +
    property.expenses.snowRemoval +
    grossRevenue * (property.expenses.managementPercent / 100)
  const annualNOI = grossRevenue - vacancyLoss - operatingExpenses

  // ============================================================
  // PHASE 4: REFINANCE
  // ============================================================
  const afterRepairValue = property.afterRepairValue
  const maxNewLoan = afterRepairValue * (refinance.targetLTV / 100)
  // Prêt conventionnel max 80% LTV
  const newLoanAmount = Math.min(maxNewLoan, afterRepairValue * 0.8)
  const cashOutAmount = newLoanAmount - loanWithPremium

  const capitalLeftInDeal = totalInvestmentBeforeRefi - Math.max(0, cashOutAmount)

  const newMonthlyPayment = calculateMortgagePayment(
    newLoanAmount,
    refinance.newRate / 100,
    refinance.newAmortization
  )

  // ============================================================
  // PHASE 5: REPEAT - Analyse post-refinancement
  // ============================================================
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

  // ============================================================
  // MÉTRIQUES GLOBALES
  // ============================================================
  const totalCashInvested = Math.max(0, capitalLeftInDeal)
  const equityCreated = afterRepairValue - newLoanAmount
  const returnOnInvestment =
    totalCashInvested > 0
      ? ((equityCreated + cashflowAnalysis.annualCashflow) / totalCashInvested) * 100
      : Infinity
  const infiniteReturn = cashOutAmount >= totalInvestmentBeforeRefi

  // ============================================================
  // WATERFALL DATA
  // ============================================================
  let cumulative = 0
  const waterfall: WaterfallItem[] = [
    {
      label: "Prix d'achat",
      value: -purchasePrice,
      type: 'cost',
      cumulative: (cumulative -= purchasePrice),
    },
    {
      label: "Mise de fonds",
      value: downPayment,
      type: 'neutral',
      cumulative: (cumulative += downPayment),
    },
    {
      label: 'Frais acquisition',
      value: -closingCosts.total,
      type: 'cost',
      cumulative: (cumulative -= closingCosts.total),
    },
    {
      label: 'Rénovations',
      value: -renovationBudget,
      type: 'cost',
      cumulative: (cumulative -= renovationBudget),
    },
    {
      label: 'Frais de portage',
      value: -holdingCosts.total,
      type: 'cost',
      cumulative: (cumulative -= holdingCosts.total),
    },
    {
      label: 'Nouvelle valeur (ARV)',
      value: afterRepairValue,
      type: 'value',
      cumulative: (cumulative = afterRepairValue),
    },
    {
      label: 'Nouveau prêt',
      value: -newLoanAmount,
      type: 'neutral',
      cumulative: (cumulative -= newLoanAmount),
    },
    {
      label: 'Cash-out',
      value: Math.max(0, cashOutAmount),
      type: 'equity',
      cumulative: (cumulative = equityCreated),
    },
  ]

  // ============================================================
  // VERDICT
  // ============================================================
  const reasons: string[] = []
  let isGoodDeal = true

  if (infiniteReturn) {
    reasons.push('✅ Retour infini: tout le capital récupéré!')
  } else if (capitalLeftInDeal < totalInvestmentBeforeRefi * 0.3) {
    reasons.push('✅ Moins de 30% du capital reste dans le deal')
  } else {
    reasons.push('⚠️ Plus de 30% du capital reste immobilisé')
    isGoodDeal = false
  }

  if (cashflowAnalysis.dscrStressTested >= 1.1) {
    reasons.push(`✅ DSCR stress-testé: ${cashflowAnalysis.dscrStressTested.toFixed(2)}x`)
  } else {
    reasons.push(`❌ DSCR stress-testé faible: ${cashflowAnalysis.dscrStressTested.toFixed(2)}x`)
    isGoodDeal = false
  }

  if (cashflowAnalysis.cashflowPerDoor >= 75) {
    reasons.push(`✅ Cashflow/porte: ${cashflowAnalysis.cashflowPerDoor}$/mois`)
  } else {
    reasons.push(`⚠️ Cashflow/porte faible: ${cashflowAnalysis.cashflowPerDoor}$/mois`)
  }

  const recommendation = isGoodDeal
    ? infiniteReturn
      ? "Excellent deal BRRRR! Capital entièrement recyclé pour le prochain projet."
      : "Bon deal. Le cashflow post-refi est solide."
    : "Deal à risque. Revoir les chiffres ou négocier le prix."

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
    maxNewLoan,
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
    verdict: {
      isGoodDeal,
      reasons,
      recommendation,
    },
  }
}

/**
 * Calcule le prix d'achat maximum pour un deal BRRRR rentable
 */
export function calculateMaxPurchasePrice(
  afterRepairValue: number,
  renovationBudget: number,
  targetLTV: number = 0.75,
  targetProfit: number = 0 // 0 = infinite return
): number {
  // Formule: Prix max = ARV × LTV - Réno - Frais estimés - Profit cible
  const maxLoan = afterRepairValue * targetLTV
  const estimatedClosingCosts = afterRepairValue * 0.03 // ~3%
  const estimatedHoldingCosts = renovationBudget * 0.15 // ~15% du budget réno

  const maxPrice =
    maxLoan - renovationBudget - estimatedClosingCosts - estimatedHoldingCosts - targetProfit

  return Math.round(maxPrice)
}

/**
 * Analyse de sensibilité: impact du prix d'achat sur le ROI
 */
export function sensitivityAnalysis(
  basePrice: number,
  afterRepairValue: number,
  renovationBudget: number,
  variations: number[] = [-10, -5, 0, 5, 10] // en %
): {
  priceVariation: number
  newPrice: number
  capitalLeft: number
  roi: number
  isInfiniteReturn: boolean
}[] {
  return variations.map((variation) => {
    const newPrice = basePrice * (1 + variation / 100)
    const downPayment = newPrice * 0.2
    const closingCosts = newPrice * 0.03
    const holdingCosts = renovationBudget * 0.15
    const totalInvested = downPayment + closingCosts + renovationBudget + holdingCosts

    const newLoan = afterRepairValue * 0.75
    const originalLoan = newPrice * 0.8
    const cashOut = newLoan - originalLoan
    const capitalLeft = totalInvested - cashOut

    const equity = afterRepairValue - newLoan
    const roi = capitalLeft > 0 ? (equity / capitalLeft) * 100 : Infinity

    return {
      priceVariation: variation,
      newPrice: Math.round(newPrice),
      capitalLeft: Math.round(capitalLeft),
      roi: Math.round(roi * 10) / 10,
      isInfiniteReturn: cashOut >= totalInvested,
    }
  })
}
