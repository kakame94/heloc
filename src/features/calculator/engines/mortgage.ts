/**
 * PlexInvest V2 - Moteur de calcul hypothécaire
 *
 * Calculs hypothécaires avec la méthode canadienne
 * (Capitalisation semi-annuelle, stress test B-20, primes SCHL)
 */

import type { Mortgage } from '@/entities/finance'
import { getConfig, getSCHLPremiumRate, getStressTestRate } from '@/shared/config/config-service'

export interface MortgageCalculation {
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  effectiveRate: number
  qualifyingPayment: number // Avec stress test B-20
  qualifyingRate: number
}

export interface SCHLResult {
  premiumRate: number
  premiumAmount: number
  tvq: number // TVQ sur prime SCHL (non finançable!)
  totalInsuranceCost: number
  newLoanAmount: number // Prêt + prime (finançable)
}

/**
 * Calcule le paiement hypothécaire avec la méthode canadienne
 * (Capitalisation semi-annuelle → conversion en taux mensuel)
 *
 * @param principal - Montant du prêt
 * @param annualRate - Taux d'intérêt annuel (décimal, ex: 0.05 pour 5%)
 * @param amortizationYears - Durée d'amortissement en années
 */
export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  amortizationYears: number
): number {
  if (principal <= 0 || annualRate <= 0 || amortizationYears <= 0) {
    return 0
  }

  // Conversion taux canadien (semi-annuel → mensuel)
  // Formule: ((1 + r/2)^(1/6)) - 1
  const semiAnnualRate = annualRate / 2
  const monthlyRate = Math.pow(1 + semiAnnualRate, 1 / 6) - 1
  const totalPayments = amortizationYears * 12

  // Formule de paiement hypothécaire
  const payment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1)

  return Math.round(payment * 100) / 100
}

/**
 * Calcule le paiement avec le taux stress-testé (Règle B-20)
 *
 * Règle B-20: Le taux qualifiant = max(taux contractuel + 2%, 5.25%)
 */
export function calculateStressTestedPayment(
  principal: number,
  contractRate: number,
  amortizationYears: number
): { payment: number; qualifyingRate: number } {
  const qualifyingRate = getStressTestRate(contractRate)

  const payment = calculateMortgagePayment(
    principal,
    qualifyingRate,
    amortizationYears
  )

  return {
    payment,
    qualifyingRate,
  }
}

/**
 * Calcule la prime SCHL et la TVQ associée
 *
 * Important: La TVQ sur la prime SCHL n'est PAS finançable!
 * Elle doit être payée cash à la clôture.
 */
export function calculateSCHLPremium(
  loanAmount: number,
  propertyValue: number,
  amortizationYears: number = 25
): SCHLResult {
  const config = getConfig()
  const ltvPercent = (loanAmount / propertyValue) * 100

  // Pas de prime SCHL si LTV <= 80%
  if (ltvPercent <= 80) {
    return {
      premiumRate: 0,
      premiumAmount: 0,
      tvq: 0,
      totalInsuranceCost: 0,
      newLoanAmount: loanAmount,
    }
  }

  const premiumRate = getSCHLPremiumRate(ltvPercent, amortizationYears)
  const premiumAmount = loanAmount * premiumRate

  // TVQ sur la prime SCHL (9.975% au Québec)
  const tvq = premiumAmount * config.closingCosts.tvqOnSchlPremium

  return {
    premiumRate,
    premiumAmount: Math.round(premiumAmount),
    tvq: Math.round(tvq * 100) / 100,
    totalInsuranceCost: Math.round(premiumAmount + tvq),
    newLoanAmount: Math.round(loanAmount + premiumAmount), // Prime finançable
  }
}

/**
 * Analyse hypothécaire complète
 */
export function fullMortgageAnalysis(
  mortgage: Mortgage,
  propertyValue: number
): MortgageCalculation {
  // Calcul du paiement au taux contractuel
  const monthlyPayment = calculateMortgagePayment(
    mortgage.loanAmount,
    mortgage.interestRate / 100,
    mortgage.amortization
  )

  // Calcul du paiement stress-testé (B-20)
  const { payment: qualifyingPayment, qualifyingRate } = calculateStressTestedPayment(
    mortgage.loanAmount,
    mortgage.interestRate / 100,
    mortgage.amortization
  )

  // Calculs totaux
  const totalPayments = mortgage.amortization * 12
  const totalPaid = monthlyPayment * totalPayments
  const totalInterest = totalPaid - mortgage.loanAmount

  // Taux effectif annuel (conversion semi-annuelle → annuelle)
  const monthlyRate = Math.pow(1 + mortgage.interestRate / 100 / 2, 1 / 6) - 1
  const effectiveRate = Math.pow(1 + monthlyRate, 12) - 1

  return {
    monthlyPayment,
    totalPayments: Math.round(totalPaid),
    totalInterest: Math.round(totalInterest),
    effectiveRate: Math.round(effectiveRate * 10000) / 100, // En pourcentage
    qualifyingPayment,
    qualifyingRate: qualifyingRate * 100, // En pourcentage
  }
}

/**
 * Génère un tableau d'amortissement annuel
 */
export function generateAmortizationSummary(
  principal: number,
  annualRate: number,
  amortizationYears: number,
  maxYears: number = 10
): {
  year: number
  startBalance: number
  principalPaid: number
  interestPaid: number
  endBalance: number
  percentPaidOff: number
}[] {
  const monthlyPayment = calculateMortgagePayment(principal, annualRate, amortizationYears)
  const semiAnnualRate = annualRate / 2
  const monthlyRate = Math.pow(1 + semiAnnualRate, 1 / 6) - 1

  const summary = []
  let balance = principal

  for (let year = 1; year <= Math.min(amortizationYears, maxYears); year++) {
    const startBalance = balance
    let yearPrincipal = 0
    let yearInterest = 0

    for (let month = 0; month < 12; month++) {
      if (balance <= 0) break

      const interestPayment = balance * monthlyRate
      const principalPayment = Math.min(monthlyPayment - interestPayment, balance)

      yearInterest += interestPayment
      yearPrincipal += principalPayment
      balance -= principalPayment
    }

    summary.push({
      year,
      startBalance: Math.round(startBalance),
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      endBalance: Math.round(Math.max(0, balance)),
      percentPaidOff: Math.round(((principal - balance) / principal) * 100 * 10) / 10,
    })
  }

  return summary
}

/**
 * Compare deux scénarios d'amortissement (ex: 25 ans vs 30 ans)
 */
export function compareAmortizations(
  principal: number,
  annualRate: number,
  years1: number,
  years2: number
) {
  const payment1 = calculateMortgagePayment(principal, annualRate, years1)
  const payment2 = calculateMortgagePayment(principal, annualRate, years2)

  const totalPaid1 = payment1 * years1 * 12
  const totalPaid2 = payment2 * years2 * 12

  const interest1 = totalPaid1 - principal
  const interest2 = totalPaid2 - principal

  return {
    scenario1: {
      years: years1,
      monthlyPayment: payment1,
      totalInterest: Math.round(interest1),
    },
    scenario2: {
      years: years2,
      monthlyPayment: payment2,
      totalInterest: Math.round(interest2),
    },
    difference: {
      monthlyPayment: Math.round((payment2 - payment1) * 100) / 100,
      totalInterest: Math.round(interest2 - interest1),
      recommendation:
        payment1 > payment2
          ? `${years2} ans économise ${Math.round(payment1 - payment2)}$/mois mais coûte ${Math.round(interest2 - interest1)}$ de plus en intérêts`
          : `${years1} ans coûte ${Math.round(payment1 - payment2)}$/mois de plus mais économise ${Math.round(interest1 - interest2)}$ en intérêts`,
    },
  }
}
