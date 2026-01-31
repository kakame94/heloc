/**
 * PlexInvest V2 - Moteur de calcul de cashflow
 *
 * Analyse complète des revenus, dépenses et ratios financiers
 * avec stress test B-20 et DSCR
 */

import type { Property } from '@/entities/property'
import type { Mortgage } from '@/entities/finance'
import { calculateMortgagePayment, calculateStressTestedPayment } from './mortgage'
import { getConfig } from '@/shared/config/config-service'

export interface CashflowAnalysis {
  // Revenus
  grossRevenue: number
  vacancyLoss: number
  effectiveGrossIncome: number

  // Dépenses
  totalOperatingExpenses: number
  expenseBreakdown: {
    municipalTax: number
    schoolTax: number
    insurance: number
    electricity: number
    heating: number
    snowRemoval: number
    maintenance: number
    management: number
    other: number
  }

  // NOI et Cashflow
  netOperatingIncome: number
  annualDebtService: number
  annualCashflow: number
  monthlyCashflow: number
  cashflowPerDoor: number

  // Ratios
  capRate: number
  cashOnCash: number
  dscr: number
  dscrStressTested: number
  expenseRatio: number

  // Analyse
  warnings: string[]
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

/**
 * Analyse complète du cashflow d'une propriété
 */
export function analyzeCashflow(
  property: Property,
  mortgage: Mortgage,
  totalCashInvested: number
): CashflowAnalysis {
  const config = getConfig()
  const warnings: string[] = []

  // === REVENUS ===
  const grossRevenue = property.units.reduce((sum, u) => sum + u.currentRent, 0) * 12
  const vacancyRate = config.defaults.vacancyRate
  const vacancyLoss = grossRevenue * vacancyRate
  const effectiveGrossIncome = grossRevenue - vacancyLoss

  // === DÉPENSES ===
  const e = property.expenses
  const managementFee = grossRevenue * (e.managementPercent / 100)

  const expenseBreakdown = {
    municipalTax: e.municipalTax,
    schoolTax: e.schoolTax,
    insurance: e.insurance,
    electricity: e.electricity,
    heating: e.heating,
    snowRemoval: e.snowRemoval,
    maintenance: e.maintenance,
    management: Math.round(managementFee),
    other: e.otherExpenses,
  }

  const totalOperatingExpenses = Object.values(expenseBreakdown).reduce((a, b) => a + b, 0)

  // === NOI (Net Operating Income) ===
  const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses

  // === SERVICE DE LA DETTE ===
  const monthlyPayment = calculateMortgagePayment(
    mortgage.loanAmount,
    mortgage.interestRate / 100,
    mortgage.amortization
  )
  const annualDebtService = monthlyPayment * 12

  // === CASHFLOW ===
  const annualCashflow = netOperatingIncome - annualDebtService
  const monthlyCashflow = annualCashflow / 12
  const cashflowPerDoor = annualCashflow / property.numberOfUnits

  // === RATIOS ===
  // Cap Rate = NOI / Prix d'achat
  const capRate = (netOperatingIncome / property.purchasePrice) * 100

  // Cash-on-Cash = Cashflow annuel / Cash investi
  const cashOnCash =
    totalCashInvested > 0 ? (annualCashflow / totalCashInvested) * 100 : 0

  // DSCR = NOI / Service de la dette
  const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0

  // DSCR avec stress test B-20
  const { payment: stressTestedPayment } = calculateStressTestedPayment(
    mortgage.loanAmount,
    mortgage.interestRate / 100,
    mortgage.amortization
  )
  const dscrStressTested =
    stressTestedPayment * 12 > 0
      ? netOperatingIncome / (stressTestedPayment * 12)
      : 0

  // Expense Ratio = Dépenses / Revenus bruts
  const expenseRatio = (totalOperatingExpenses / grossRevenue) * 100

  // === WARNINGS ===
  if (dscrStressTested < config.stressTest.minDSCR) {
    warnings.push(
      `⚠️ DSCR ${dscrStressTested.toFixed(2)} < ${config.stressTest.minDSCR}: Financement bancaire difficile (Échec B-20)`
    )
  }

  if (e.managementPercent === 0) {
    warnings.push("⚠️ Gestion à 0%: Vous achetez un emploi, pas un investissement")
  }

  if (cashflowPerDoor < 75) {
    warnings.push(`⚠️ Cashflow/porte faible: ${Math.round(cashflowPerDoor)}$/mois (minimum recommandé: 75$)`)
  }

  if (expenseRatio > 50) {
    warnings.push(`⚠️ Ratio de dépenses élevé: ${expenseRatio.toFixed(1)}% (idéal: < 40%)`)
  }

  if (capRate < 4) {
    warnings.push(`⚠️ Cap rate faible: ${capRate.toFixed(2)}% (marché: 4-6%)`)
  }

  // === GRADE ===
  const grade = calculateGrade(dscrStressTested, cashflowPerDoor, capRate)

  return {
    grossRevenue,
    vacancyLoss,
    effectiveGrossIncome,
    totalOperatingExpenses,
    expenseBreakdown,
    netOperatingIncome,
    annualDebtService,
    annualCashflow,
    monthlyCashflow: Math.round(monthlyCashflow),
    cashflowPerDoor: Math.round(cashflowPerDoor),
    capRate: Math.round(capRate * 100) / 100,
    cashOnCash: Math.round(cashOnCash * 100) / 100,
    dscr: Math.round(dscr * 100) / 100,
    dscrStressTested: Math.round(dscrStressTested * 100) / 100,
    expenseRatio: Math.round(expenseRatio * 10) / 10,
    warnings,
    grade,
  }
}

/**
 * Analyse simplifiée du cashflow (sans mortgage détaillé)
 */
export function quickCashflowAnalysis(
  monthlyRent: number,
  annualExpenses: number,
  monthlyMortgage: number,
  purchasePrice: number,
  cashInvested: number
): {
  monthlyCashflow: number
  annualCashflow: number
  capRate: number
  cashOnCash: number
  noi: number
} {
  const grossRevenue = monthlyRent * 12
  const vacancyLoss = grossRevenue * 0.05
  const noi = grossRevenue - vacancyLoss - annualExpenses
  const annualDebt = monthlyMortgage * 12
  const annualCashflow = noi - annualDebt

  return {
    monthlyCashflow: Math.round(annualCashflow / 12),
    annualCashflow: Math.round(annualCashflow),
    capRate: Math.round((noi / purchasePrice) * 10000) / 100,
    cashOnCash: cashInvested > 0
      ? Math.round((annualCashflow / cashInvested) * 10000) / 100
      : 0,
    noi: Math.round(noi),
  }
}

/**
 * Calcule le grade d'investissement
 */
function calculateGrade(
  dscrStressTested: number,
  cashflowPerDoor: number,
  capRate: number
): 'A' | 'B' | 'C' | 'D' | 'F' {
  let score = 0

  // DSCR (40 points max)
  if (dscrStressTested >= 1.3) score += 40
  else if (dscrStressTested >= 1.2) score += 30
  else if (dscrStressTested >= 1.1) score += 20
  else if (dscrStressTested >= 1.0) score += 10

  // Cashflow/porte (40 points max)
  if (cashflowPerDoor >= 150) score += 40
  else if (cashflowPerDoor >= 100) score += 30
  else if (cashflowPerDoor >= 75) score += 20
  else if (cashflowPerDoor >= 50) score += 10

  // Cap Rate (20 points max)
  if (capRate >= 6) score += 20
  else if (capRate >= 5) score += 15
  else if (capRate >= 4) score += 10
  else if (capRate >= 3) score += 5

  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 50) return 'C'
  if (score >= 30) return 'D'
  return 'F'
}

/**
 * Projette le cashflow sur plusieurs années
 */
export function projectCashflow(
  baseCashflow: CashflowAnalysis,
  years: number,
  rentGrowthRate: number = 0.02,
  expenseGrowthRate: number = 0.03
): {
  year: number
  grossRevenue: number
  expenses: number
  noi: number
  cashflow: number
}[] {
  const projections = []
  let revenue = baseCashflow.grossRevenue
  let expenses = baseCashflow.totalOperatingExpenses
  const debtService = baseCashflow.annualDebtService // fixe

  for (let year = 1; year <= years; year++) {
    const noi = revenue * (1 - 0.05) - expenses // 5% vacance
    const cashflow = noi - debtService

    projections.push({
      year,
      grossRevenue: Math.round(revenue),
      expenses: Math.round(expenses),
      noi: Math.round(noi),
      cashflow: Math.round(cashflow),
    })

    // Croissance pour l'année suivante
    revenue *= 1 + rentGrowthRate
    expenses *= 1 + expenseGrowthRate
  }

  return projections
}
