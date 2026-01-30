/**
 * PlexInvest Québec - Projections sur 5 ans
 *
 * Basé sur le modèle "Créateur de plex - Walkens" (feuille FINANCEMENT)
 * Calcule les projections de revenus, dépenses, cashflow et prise de valeur
 */

import Decimal from 'decimal.js'
import { calculateMonthlyMortgagePayment } from './mortgage'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Paramètres d'entrée pour les projections
 */
export interface ProjectionParams {
  // Prix et financement
  purchasePrice: number
  downPaymentPercent: number
  mortgageRate: number
  amortizationYears: number

  // Revenus
  monthlyRent: number
  rentGrowthRate: number // % par an (ex: 0.05 = 5%)

  // Dépenses
  annualExpenses: number
  expenseGrowthRate: number // % par an

  // Prise de valeur
  appreciationRate: number // % par an

  // SCHL si applicable
  schlPremiumPercent?: number

  // Nombre d'années de projection
  years?: number
}

/**
 * Données d'une année de projection
 */
export interface YearProjection {
  year: number

  // Revenus
  monthlyRent: number
  annualRent: number

  // Dépenses
  annualExpenses: number

  // Hypothèque
  annualMortgagePayment: number
  principalPaid: number
  interestPaid: number
  remainingBalance: number

  // Cashflow
  annualCashflow: number
  cashOnCashReturn: number // %

  // Valeur
  propertyValue: number
  equity: number
  appreciationGain: number
  returnOnAppreciation: number // %

  // Rendement total
  totalReturn: number // Cash on Cash + Remboursement dette + Appréciation
  cumulativeReturn: number
}

/**
 * Résultat complet des projections
 */
export interface ProjectionResult {
  initialInvestment: number
  mortgageAmount: number
  schlPremium: number
  totalLoanAmount: number
  monthlyPayment: number

  projections: YearProjection[]

  summary: {
    totalCashflow: number
    totalPrincipalPaid: number
    totalInterestPaid: number
    totalAppreciation: number
    finalEquity: number
    averageCashOnCash: number
    averageTotalReturn: number
  }
}

/**
 * Calcule les projections sur 5 ans (ou plus)
 */
export function calculateProjections(params: ProjectionParams): ProjectionResult {
  const years = params.years ?? 5

  const purchasePrice = new Decimal(params.purchasePrice)
  const downPaymentPercent = new Decimal(params.downPaymentPercent)
  const downPayment = purchasePrice.times(downPaymentPercent)

  // SCHL
  const schlPremiumPercent = params.schlPremiumPercent ?? 0
  const baseLoan = purchasePrice.minus(downPayment)
  const schlPremium = baseLoan.times(schlPremiumPercent)
  const totalLoanAmount = baseLoan.plus(schlPremium)

  // Paiement mensuel
  const monthlyPayment = calculateMonthlyMortgagePayment(
    totalLoanAmount.toNumber(),
    params.mortgageRate,
    params.amortizationYears
  )

  const annualPayment = monthlyPayment * 12

  // Investissement initial (mise de fonds + frais de clôture estimés)
  const closingCosts = purchasePrice.times(0.02).plus(5000) // ~2% + frais fixes
  const initialInvestment = downPayment.plus(closingCosts)

  const projections: YearProjection[] = []
  let remainingBalance = totalLoanAmount.toNumber()
  let cumulativeReturn = 0

  // Taux mensuel effectif (conversion semi-annuelle canadienne)
  const semiAnnualRate = params.mortgageRate / 2
  const monthlyEffectiveRate = Math.pow(1 + semiAnnualRate, 1/6) - 1

  for (let year = 1; year <= years; year++) {
    // Revenus avec croissance
    const rentGrowthFactor = Math.pow(1 + params.rentGrowthRate, year - 1)
    const monthlyRent = params.monthlyRent * rentGrowthFactor
    const annualRent = monthlyRent * 12

    // Dépenses avec croissance (année 1 = pas de croissance)
    const expenseGrowthFactor = year === 1 ? 1 : Math.pow(1 + params.expenseGrowthRate, year - 1)
    const annualExpenses = params.annualExpenses * expenseGrowthFactor

    // Calcul du capital et intérêts pour cette année
    let principalPaidThisYear = 0
    let interestPaidThisYear = 0
    let balanceAtStart = remainingBalance

    for (let month = 0; month < 12; month++) {
      const monthlyInterest = remainingBalance * monthlyEffectiveRate
      const monthlyPrincipal = monthlyPayment - monthlyInterest

      interestPaidThisYear += monthlyInterest
      principalPaidThisYear += monthlyPrincipal
      remainingBalance -= monthlyPrincipal
    }

    // Cashflow
    const annualCashflow = annualRent - annualExpenses - annualPayment
    const cashOnCashReturn = initialInvestment.toNumber() > 0
      ? (annualCashflow / initialInvestment.toNumber()) * 100
      : 0

    // Valeur de la propriété avec appréciation
    const appreciationFactor = Math.pow(1 + params.appreciationRate, year)
    const propertyValue = purchasePrice.times(appreciationFactor).toNumber()
    const appreciationGain = propertyValue - params.purchasePrice
    const equity = propertyValue - remainingBalance

    const returnOnAppreciation = initialInvestment.toNumber() > 0
      ? (appreciationGain / initialInvestment.toNumber()) * 100
      : 0

    // Rendement sur remboursement de dette
    const returnOnDebtPaydown = initialInvestment.toNumber() > 0
      ? (principalPaidThisYear / initialInvestment.toNumber()) * 100
      : 0

    // Rendement total
    const totalReturn = cashOnCashReturn + returnOnDebtPaydown + returnOnAppreciation
    cumulativeReturn += cashOnCashReturn + returnOnDebtPaydown

    projections.push({
      year,
      monthlyRent,
      annualRent,
      annualExpenses,
      annualMortgagePayment: annualPayment,
      principalPaid: principalPaidThisYear,
      interestPaid: interestPaidThisYear,
      remainingBalance,
      annualCashflow,
      cashOnCashReturn,
      propertyValue,
      equity,
      appreciationGain,
      returnOnAppreciation,
      totalReturn,
      cumulativeReturn: cumulativeReturn + returnOnAppreciation,
    })
  }

  // Résumé
  const totalCashflow = projections.reduce((sum, p) => sum + p.annualCashflow, 0)
  const totalPrincipalPaid = projections.reduce((sum, p) => sum + p.principalPaid, 0)
  const totalInterestPaid = projections.reduce((sum, p) => sum + p.interestPaid, 0)
  const lastYear = projections[projections.length - 1]

  return {
    initialInvestment: initialInvestment.toNumber(),
    mortgageAmount: baseLoan.toNumber(),
    schlPremium: schlPremium.toNumber(),
    totalLoanAmount: totalLoanAmount.toNumber(),
    monthlyPayment,
    projections,
    summary: {
      totalCashflow,
      totalPrincipalPaid,
      totalInterestPaid,
      totalAppreciation: lastYear.appreciationGain,
      finalEquity: lastYear.equity,
      averageCashOnCash: projections.reduce((sum, p) => sum + p.cashOnCashReturn, 0) / years,
      averageTotalReturn: projections.reduce((sum, p) => sum + p.totalReturn, 0) / years,
    },
  }
}

/**
 * Calcule la "8ème merveille" - effet composé du BRRRR
 * Montre la croissance exponentielle avec réinvestissement
 */
export interface CompoundGrowthResult {
  period: number
  startingAmount: number
  gain: number
  endingAmount: number
  multiplier: number
}

export function calculate8thWonder(
  initialInvestment: number,
  returnPerPeriod: number, // ex: 0.7 = 70%
  periods: number = 30
): CompoundGrowthResult[] {
  const results: CompoundGrowthResult[] = []
  let currentAmount = initialInvestment

  for (let period = 1; period <= periods; period++) {
    const gain = currentAmount * returnPerPeriod
    const endingAmount = currentAmount + gain
    const multiplier = endingAmount / initialInvestment

    results.push({
      period,
      startingAmount: currentAmount,
      gain,
      endingAmount,
      multiplier,
    })

    currentAmount = endingAmount
  }

  return results
}

/**
 * Exemple basé sur le fichier Walkens
 */
export const EXAMPLE_PROJECTION_PARAMS: ProjectionParams = {
  purchasePrice: 415000,
  downPaymentPercent: 0.05, // 5% mise de fonds
  mortgageRate: 0.04, // 4%
  amortizationYears: 25,
  monthlyRent: 2870,
  rentGrowthRate: 0.05, // 5% par an
  annualExpenses: 4563,
  expenseGrowthRate: 0.05, // 5% par an (0% première année)
  appreciationRate: 0.05, // 5% par an
  schlPremiumPercent: 0.04, // 4% SCHL
}
