/**
 * PlexInvest Québec - Stratégies d'investissement
 *
 * Basé sur le modèle "Créateur de plex - Walkens" (feuille STRATEGIES)
 * Stratégies: Cash Back, Capital Only, Paiements accélérés
 */

import Decimal from 'decimal.js'
import { calculateMonthlyMortgagePayment } from './mortgage'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * ============================================================================
 * STRATÉGIE #1 - CASH BACK
 * ============================================================================
 * Certaines banques offrent des remises (cash back) en échange d'un taux
 * plus élevé. Cette stratégie analyse si c'est avantageux.
 */

export interface CashBackParams {
  purchasePrice: number
  downPaymentPercent: number
  amortizationYears: number

  // Scénario sans cash back
  rateWithoutCashBack: number

  // Scénario avec cash back
  rateWithCashBack: number
  cashBackPercent: number // % du prêt retourné en cash
}

export interface CashBackResult {
  withoutCashBack: {
    loanAmount: number
    monthlyPayment: number
    totalInterest: number
    effectiveDownPayment: number
  }
  withCashBack: {
    loanAmount: number
    monthlyPayment: number
    totalInterest: number
    cashBackAmount: number
    effectiveDownPayment: number // Mise de fonds réelle après cash back
  }
  analysis: {
    monthlyDifference: number // Positif = avec cash back coûte plus
    totalInterestDifference: number
    breakEvenMonths: number // Mois pour récupérer le cash back
    isWorthIt: boolean
    recommendation: string
  }
}

export function analyzeCashBackStrategy(params: CashBackParams): CashBackResult {
  const purchasePrice = new Decimal(params.purchasePrice)
  const downPaymentPercent = new Decimal(params.downPaymentPercent)
  const downPayment = purchasePrice.times(downPaymentPercent)
  const loanAmount = purchasePrice.minus(downPayment)
  const totalMonths = params.amortizationYears * 12

  // Sans cash back
  const monthlyWithout = calculateMonthlyMortgagePayment(
    loanAmount.toNumber(),
    params.rateWithoutCashBack,
    params.amortizationYears
  )
  const totalInterestWithout = (monthlyWithout * totalMonths) - loanAmount.toNumber()

  // Avec cash back
  const monthlyWith = calculateMonthlyMortgagePayment(
    loanAmount.toNumber(),
    params.rateWithCashBack,
    params.amortizationYears
  )
  const totalInterestWith = (monthlyWith * totalMonths) - loanAmount.toNumber()
  const cashBackAmount = loanAmount.times(params.cashBackPercent).toNumber()

  // Analyse
  const monthlyDifference = monthlyWith - monthlyWithout
  const totalInterestDifference = totalInterestWith - totalInterestWithout

  // Break even: combien de mois pour que le surcoût dépasse le cash back
  const breakEvenMonths = monthlyDifference > 0
    ? Math.ceil(cashBackAmount / monthlyDifference)
    : Infinity

  const isWorthIt = breakEvenMonths > 60 // Worth it si break even > 5 ans (terme typique)

  let recommendation: string
  if (breakEvenMonths === Infinity) {
    recommendation = 'Le cash back est gratuit (même taux ou moins)! Prenez-le.'
  } else if (isWorthIt) {
    recommendation = `Le cash back vaut la peine. Vous récupérerez le surcoût après ${breakEvenMonths} mois, bien après le renouvellement typique de 5 ans.`
  } else {
    recommendation = `Le cash back ne vaut PAS la peine. Le surcoût mensuel (${monthlyDifference.toFixed(0)}$) effacera le cash back en seulement ${breakEvenMonths} mois.`
  }

  return {
    withoutCashBack: {
      loanAmount: loanAmount.toNumber(),
      monthlyPayment: monthlyWithout,
      totalInterest: totalInterestWithout,
      effectiveDownPayment: downPayment.toNumber(),
    },
    withCashBack: {
      loanAmount: loanAmount.toNumber(),
      monthlyPayment: monthlyWith,
      totalInterest: totalInterestWith,
      cashBackAmount,
      effectiveDownPayment: downPayment.minus(cashBackAmount).toNumber(),
    },
    analysis: {
      monthlyDifference,
      totalInterestDifference,
      breakEvenMonths,
      isWorthIt,
      recommendation,
    },
  }
}

/**
 * ============================================================================
 * STRATÉGIE #2 - CAPITAL ONLY (Intérêts seulement)
 * ============================================================================
 * Certains prêts permettent de payer seulement les intérêts pendant une
 * période, maximisant le cashflow à court terme.
 */

export interface CapitalOnlyParams {
  loanAmount: number
  annualRate: number
  amortizationYears: number
  interestOnlyPeriodMonths: number // Période de paiements intérêts seulement
}

export interface CapitalOnlyResult {
  standard: {
    monthlyPayment: number
    totalPaymentsFirstYear: number
    principalPaidFirstYear: number
    interestPaidFirstYear: number
  }
  interestOnly: {
    monthlyPayment: number // Pendant période intérêts seulement
    monthlyPaymentAfter: number // Après la période
    totalPaymentsFirstYear: number
    principalPaidFirstYear: number // 0$ pendant intérêts seulement
    interestPaidFirstYear: number
    cashflowBoost: number // Économie mensuelle vs standard
  }
  impact: {
    additionalInterestOverLife: number
    balanceAfterInterestOnlyPeriod: number
    recommendation: string
  }
}

export function analyzeCapitalOnlyStrategy(params: CapitalOnlyParams): CapitalOnlyResult {
  const { loanAmount, annualRate, amortizationYears, interestOnlyPeriodMonths } = params

  // Paiement standard (capital + intérêts)
  const standardMonthly = calculateMonthlyMortgagePayment(
    loanAmount,
    annualRate,
    amortizationYears
  )

  // Paiement intérêts seulement
  const semiAnnualRate = annualRate / 2
  const monthlyEffectiveRate = Math.pow(1 + semiAnnualRate, 1/6) - 1
  const interestOnlyMonthly = loanAmount * monthlyEffectiveRate

  // Après la période IO, l'amortissement est raccourci
  const remainingMonths = (amortizationYears * 12) - interestOnlyPeriodMonths
  const monthlyAfterIO = calculateMonthlyMortgagePayment(
    loanAmount, // Balance inchangée car aucun capital payé
    annualRate,
    remainingMonths / 12
  )

  // Calculs première année (12 mois)
  const ioMonthsInFirstYear = Math.min(interestOnlyPeriodMonths, 12)
  const standardMonthsInFirstYear = 12 - ioMonthsInFirstYear

  // Standard: calcul du capital payé première année
  let standardPrincipalY1 = 0
  let standardInterestY1 = 0
  let balance = loanAmount
  for (let i = 0; i < 12; i++) {
    const monthInterest = balance * monthlyEffectiveRate
    const monthPrincipal = standardMonthly - monthInterest
    standardInterestY1 += monthInterest
    standardPrincipalY1 += monthPrincipal
    balance -= monthPrincipal
  }

  // Interest Only première année
  const ioPrincipalY1 = 0
  const ioInterestY1 = interestOnlyMonthly * ioMonthsInFirstYear +
    (standardMonthsInFirstYear > 0 ? loanAmount * monthlyEffectiveRate * standardMonthsInFirstYear : 0)

  // Intérêts additionnels sur la vie du prêt
  const standardTotalInterest = (standardMonthly * amortizationYears * 12) - loanAmount

  // Avec IO: intérêts pendant période IO + intérêts sur prêt raccourci
  const interestDuringIO = interestOnlyMonthly * interestOnlyPeriodMonths
  const paymentsAfterIO = monthlyAfterIO * remainingMonths
  const interestAfterIO = paymentsAfterIO - loanAmount
  const ioTotalInterest = interestDuringIO + interestAfterIO

  const additionalInterest = ioTotalInterest - standardTotalInterest

  const cashflowBoost = standardMonthly - interestOnlyMonthly

  let recommendation: string
  if (cashflowBoost > 500) {
    recommendation = `Excellent pour le cashflow! Vous économisez ${cashflowBoost.toFixed(0)}$/mois pendant ${interestOnlyPeriodMonths} mois. Idéal pour la période de rénovation BRRRR.`
  } else if (cashflowBoost > 200) {
    recommendation = `Bon boost de cashflow de ${cashflowBoost.toFixed(0)}$/mois. Utile si vous avez des rénovations à financer.`
  } else {
    recommendation = `Faible impact sur le cashflow (${cashflowBoost.toFixed(0)}$/mois). Le prêt standard est probablement préférable.`
  }

  return {
    standard: {
      monthlyPayment: standardMonthly,
      totalPaymentsFirstYear: standardMonthly * 12,
      principalPaidFirstYear: standardPrincipalY1,
      interestPaidFirstYear: standardInterestY1,
    },
    interestOnly: {
      monthlyPayment: interestOnlyMonthly,
      monthlyPaymentAfter: monthlyAfterIO,
      totalPaymentsFirstYear: interestOnlyMonthly * ioMonthsInFirstYear +
        (standardMonthsInFirstYear > 0 ? monthlyAfterIO * standardMonthsInFirstYear : 0),
      principalPaidFirstYear: ioPrincipalY1,
      interestPaidFirstYear: ioInterestY1,
      cashflowBoost,
    },
    impact: {
      additionalInterestOverLife: additionalInterest,
      balanceAfterInterestOnlyPeriod: loanAmount, // Inchangé
      recommendation,
    },
  }
}

/**
 * ============================================================================
 * STRATÉGIE #3 - PAIEMENTS ACCÉLÉRÉS
 * ============================================================================
 * Compare différentes fréquences de paiement et paiements additionnels
 */

export interface AcceleratedPaymentParams {
  loanAmount: number
  annualRate: number
  amortizationYears: number
  additionalMonthlyPayment?: number
  additionalAnnualPayment?: number
}

export interface AcceleratedPaymentResult {
  standard: {
    monthlyPayment: number
    totalMonths: number
    totalInterest: number
    payoffDate: Date
  }
  biWeekly: {
    biWeeklyPayment: number // Mensuel ÷ 2
    acceleratedBiWeekly: number // Mensuel ÷ 2 × 26/24 (équivaut à 13 paiements mensuels/an)
    monthsSaved: number
    interestSaved: number
  }
  withAdditional: {
    newMonthlyPayment: number
    totalMonths: number
    monthsSaved: number
    interestSaved: number
    payoffDate: Date
  }
}

export function analyzeAcceleratedPayments(params: AcceleratedPaymentParams): AcceleratedPaymentResult {
  const { loanAmount, annualRate, amortizationYears } = params
  const additionalMonthly = params.additionalMonthlyPayment ?? 0
  const additionalAnnual = params.additionalAnnualPayment ?? 0

  const semiAnnualRate = annualRate / 2
  const monthlyEffectiveRate = Math.pow(1 + semiAnnualRate, 1/6) - 1

  // Standard
  const standardMonthly = calculateMonthlyMortgagePayment(loanAmount, annualRate, amortizationYears)
  const standardTotalMonths = amortizationYears * 12
  const standardTotalInterest = (standardMonthly * standardTotalMonths) - loanAmount

  // Bi-weekly
  const biWeeklyPayment = standardMonthly / 2
  const acceleratedBiWeekly = biWeeklyPayment * (26/24) // 26 paiements au lieu de 24

  // Simuler bi-weekly accéléré
  let biWeeklyBalance = loanAmount
  let biWeeklyMonths = 0
  const biWeeklyMonthlyEquivalent = acceleratedBiWeekly * 2 * (26/24)

  while (biWeeklyBalance > 0 && biWeeklyMonths < standardTotalMonths * 2) {
    const interest = biWeeklyBalance * monthlyEffectiveRate
    const principal = biWeeklyMonthlyEquivalent - interest
    biWeeklyBalance -= principal
    biWeeklyMonths++
  }

  const biWeeklyMonthsSaved = standardTotalMonths - biWeeklyMonths
  const biWeeklyInterestSaved = standardTotalInterest - ((biWeeklyMonthlyEquivalent * biWeeklyMonths) - loanAmount)

  // Avec paiements additionnels
  let additionalBalance = loanAmount
  let additionalMonths = 0
  const enhancedMonthly = standardMonthly + additionalMonthly
  const monthlyAdditionalFromAnnual = additionalAnnual / 12

  while (additionalBalance > 0 && additionalMonths < standardTotalMonths * 2) {
    const interest = additionalBalance * monthlyEffectiveRate
    const principal = (enhancedMonthly + monthlyAdditionalFromAnnual) - interest
    additionalBalance -= principal
    additionalMonths++
  }

  const additionalMonthsSaved = standardTotalMonths - additionalMonths
  const additionalTotalPaid = (enhancedMonthly + monthlyAdditionalFromAnnual) * additionalMonths
  const additionalInterestSaved = standardTotalInterest - (additionalTotalPaid - loanAmount)

  const now = new Date()
  const standardPayoffDate = new Date(now)
  standardPayoffDate.setMonth(standardPayoffDate.getMonth() + standardTotalMonths)

  const additionalPayoffDate = new Date(now)
  additionalPayoffDate.setMonth(additionalPayoffDate.getMonth() + additionalMonths)

  return {
    standard: {
      monthlyPayment: standardMonthly,
      totalMonths: standardTotalMonths,
      totalInterest: standardTotalInterest,
      payoffDate: standardPayoffDate,
    },
    biWeekly: {
      biWeeklyPayment,
      acceleratedBiWeekly,
      monthsSaved: Math.max(0, biWeeklyMonthsSaved),
      interestSaved: Math.max(0, biWeeklyInterestSaved),
    },
    withAdditional: {
      newMonthlyPayment: enhancedMonthly + monthlyAdditionalFromAnnual,
      totalMonths: additionalMonths,
      monthsSaved: Math.max(0, additionalMonthsSaved),
      interestSaved: Math.max(0, additionalInterestSaved),
      payoffDate: additionalPayoffDate,
    },
  }
}
