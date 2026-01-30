/**
 * PlexInvest Québec - Table d'Amortissement Détaillée
 *
 * Génère une table d'amortissement complète avec calculs canadiens
 * (composition semi-annuelle des taux)
 */

import Decimal from 'decimal.js'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Entrée d'une ligne de la table d'amortissement
 */
export interface AmortizationEntry {
  paymentNumber: number
  year: number
  month: number
  paymentDate: Date
  beginningBalance: number
  scheduledPayment: number
  principalPaid: number
  interestPaid: number
  endingBalance: number
  cumulativePrincipal: number
  cumulativeInterest: number
  percentPaidOff: number
}

/**
 * Résumé annuel de l'amortissement
 */
export interface AnnualAmortizationSummary {
  year: number
  startingBalance: number
  endingBalance: number
  totalPrincipalPaid: number
  totalInterestPaid: number
  totalPayments: number
  percentPaidOff: number
}

/**
 * Résultat complet de la table d'amortissement
 */
export interface AmortizationScheduleResult {
  // Paramètres
  loanAmount: number
  annualRate: number
  amortizationYears: number
  monthlyPayment: number

  // Totaux
  totalPayments: number
  totalInterest: number
  totalCost: number

  // Tables
  schedule: AmortizationEntry[]
  annualSummary: AnnualAmortizationSummary[]

  // Stats additionnelles
  payoffDate: Date
  effectiveRate: number // Taux effectif annuel
}

/**
 * Génère la table d'amortissement complète
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  annualRate: number,
  amortizationYears: number,
  startDate?: Date
): AmortizationScheduleResult {
  const totalMonths = amortizationYears * 12
  const start = startDate ?? new Date()

  // Conversion du taux canadien (semi-annuel) en taux mensuel effectif
  const semiAnnualRate = annualRate / 2
  const monthlyEffectiveRate = Math.pow(1 + semiAnnualRate, 1/6) - 1
  const effectiveAnnualRate = Math.pow(1 + semiAnnualRate, 2) - 1

  // Calcul du paiement mensuel
  const monthlyPayment = calculatePayment(loanAmount, monthlyEffectiveRate, totalMonths)

  const schedule: AmortizationEntry[] = []
  let balance = new Decimal(loanAmount)
  let cumulativePrincipal = new Decimal(0)
  let cumulativeInterest = new Decimal(0)

  for (let i = 1; i <= totalMonths; i++) {
    const year = Math.ceil(i / 12)
    const month = ((i - 1) % 12) + 1

    const paymentDate = new Date(start)
    paymentDate.setMonth(paymentDate.getMonth() + i)

    const beginningBalance = balance.toNumber()
    const interestPayment = balance.times(monthlyEffectiveRate)
    const principalPayment = new Decimal(monthlyPayment).minus(interestPayment)

    // Dernier paiement peut être différent pour fermer le solde
    const actualPrincipal = balance.lessThan(principalPayment)
      ? balance
      : principalPayment

    const actualPayment = actualPrincipal.plus(interestPayment)

    balance = balance.minus(actualPrincipal)
    cumulativePrincipal = cumulativePrincipal.plus(actualPrincipal)
    cumulativeInterest = cumulativeInterest.plus(interestPayment)

    const percentPaidOff = new Decimal(cumulativePrincipal)
      .div(loanAmount)
      .times(100)
      .toNumber()

    schedule.push({
      paymentNumber: i,
      year,
      month,
      paymentDate,
      beginningBalance,
      scheduledPayment: actualPayment.toNumber(),
      principalPaid: actualPrincipal.toNumber(),
      interestPaid: interestPayment.toNumber(),
      endingBalance: Math.max(0, balance.toNumber()),
      cumulativePrincipal: cumulativePrincipal.toNumber(),
      cumulativeInterest: cumulativeInterest.toNumber(),
      percentPaidOff,
    })

    // Si le solde est remboursé, on arrête
    if (balance.lessThanOrEqualTo(0.01)) {
      break
    }
  }

  // Résumé annuel
  const annualSummary = generateAnnualSummary(schedule, loanAmount)

  // Totaux
  const totalInterest = cumulativeInterest.toNumber()
  const totalPayments = cumulativePrincipal.plus(cumulativeInterest).toNumber()

  // Date de remboursement
  const payoffDate = schedule[schedule.length - 1].paymentDate

  return {
    loanAmount,
    annualRate,
    amortizationYears,
    monthlyPayment,
    totalPayments,
    totalInterest,
    totalCost: loanAmount + totalInterest,
    schedule,
    annualSummary,
    payoffDate,
    effectiveRate: effectiveAnnualRate,
  }
}

/**
 * Génère le résumé annuel
 */
function generateAnnualSummary(
  schedule: AmortizationEntry[],
  loanAmount: number
): AnnualAmortizationSummary[] {
  const summaryMap = new Map<number, AnnualAmortizationSummary>()

  for (const entry of schedule) {
    if (!summaryMap.has(entry.year)) {
      summaryMap.set(entry.year, {
        year: entry.year,
        startingBalance: entry.beginningBalance,
        endingBalance: 0,
        totalPrincipalPaid: 0,
        totalInterestPaid: 0,
        totalPayments: 0,
        percentPaidOff: 0,
      })
    }

    const summary = summaryMap.get(entry.year)!
    summary.endingBalance = entry.endingBalance
    summary.totalPrincipalPaid += entry.principalPaid
    summary.totalInterestPaid += entry.interestPaid
    summary.totalPayments += entry.scheduledPayment
    summary.percentPaidOff = ((loanAmount - entry.endingBalance) / loanAmount) * 100
  }

  return Array.from(summaryMap.values())
}

/**
 * Calcule le paiement mensuel
 */
function calculatePayment(
  principal: number,
  monthlyRate: number,
  totalMonths: number
): number {
  if (monthlyRate === 0) {
    return principal / totalMonths
  }

  const payment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)

  return new Decimal(payment).toDecimalPlaces(2).toNumber()
}

/**
 * Calcule le solde restant après X mois
 */
export function calculateRemainingBalanceAfterMonths(
  loanAmount: number,
  annualRate: number,
  amortizationYears: number,
  monthsElapsed: number
): number {
  const semiAnnualRate = annualRate / 2
  const monthlyEffectiveRate = Math.pow(1 + semiAnnualRate, 1/6) - 1
  const totalMonths = amortizationYears * 12

  const monthlyPayment = calculatePayment(loanAmount, monthlyEffectiveRate, totalMonths)

  let balance = new Decimal(loanAmount)

  for (let i = 0; i < monthsElapsed; i++) {
    const interest = balance.times(monthlyEffectiveRate)
    const principal = new Decimal(monthlyPayment).minus(interest)
    balance = balance.minus(principal)

    if (balance.lessThanOrEqualTo(0)) {
      return 0
    }
  }

  return balance.toNumber()
}

/**
 * Compare deux scénarios d'amortissement (ex: 25 ans vs 30 ans)
 */
export interface AmortizationComparison {
  scenario1: {
    years: number
    monthlyPayment: number
    totalInterest: number
    totalCost: number
  }
  scenario2: {
    years: number
    monthlyPayment: number
    totalInterest: number
    totalCost: number
  }
  difference: {
    monthlyPayment: number // Positif = scénario 1 plus cher
    totalInterest: number
    totalCost: number
  }
}

export function compareAmortizations(
  loanAmount: number,
  annualRate: number,
  years1: number,
  years2: number
): AmortizationComparison {
  const result1 = generateAmortizationSchedule(loanAmount, annualRate, years1)
  const result2 = generateAmortizationSchedule(loanAmount, annualRate, years2)

  return {
    scenario1: {
      years: years1,
      monthlyPayment: result1.monthlyPayment,
      totalInterest: result1.totalInterest,
      totalCost: result1.totalCost,
    },
    scenario2: {
      years: years2,
      monthlyPayment: result2.monthlyPayment,
      totalInterest: result2.totalInterest,
      totalCost: result2.totalCost,
    },
    difference: {
      monthlyPayment: result1.monthlyPayment - result2.monthlyPayment,
      totalInterest: result1.totalInterest - result2.totalInterest,
      totalCost: result1.totalCost - result2.totalCost,
    },
  }
}
