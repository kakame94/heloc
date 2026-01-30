/**
 * PlexInvest Québec - Calculs Hypothécaires Canadiens
 *
 * IMPORTANT: Au Canada, les taux hypothécaires sont composés semi-annuellement (2x/an),
 * contrairement aux États-Unis où ils sont composés mensuellement.
 * Cela affecte tous les calculs de paiements mensuels.
 */

import Decimal from 'decimal.js'

// Configuration Decimal.js pour précision financière
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Convertit un taux nominal composé semi-annuellement en taux mensuel effectif
 * Formule canadienne: (1 + r/2)^2 = (1 + m)^12
 * Donc: m = (1 + r/2)^(2/12) - 1 = (1 + r/2)^(1/6) - 1
 *
 * @param nominalAnnualRate - Taux nominal annuel (ex: 0.05 pour 5%)
 * @returns Taux mensuel effectif
 */
export function convertToMonthlyEffectiveRate(nominalAnnualRate: number): number {
  const r = new Decimal(nominalAnnualRate)
  const semiAnnualRate = r.div(2)
  const monthlyRate = semiAnnualRate.plus(1).pow(new Decimal(1).div(6)).minus(1)
  return monthlyRate.toNumber()
}

/**
 * Calcule le paiement hypothécaire mensuel (capital + intérêts)
 * Utilise la formule canadienne avec composition semi-annuelle
 *
 * @param principal - Montant du prêt
 * @param nominalAnnualRate - Taux nominal annuel (ex: 0.05 pour 5%)
 * @param amortizationYears - Période d'amortissement en années
 * @returns Paiement mensuel
 */
export function calculateMonthlyMortgagePayment(
  principal: number,
  nominalAnnualRate: number,
  amortizationYears: number
): number {
  if (principal <= 0) return 0
  if (nominalAnnualRate <= 0) return principal / (amortizationYears * 12)

  const P = new Decimal(principal)
  const monthlyRate = new Decimal(convertToMonthlyEffectiveRate(nominalAnnualRate))
  const n = amortizationYears * 12

  // Formule: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const onePlusR = monthlyRate.plus(1)
  const onePlusRPowN = onePlusR.pow(n)
  const numerator = monthlyRate.times(onePlusRPowN)
  const denominator = onePlusRPowN.minus(1)

  const payment = P.times(numerator).div(denominator)
  return payment.toDecimalPlaces(2).toNumber()
}

/**
 * Calcule le paiement d'intérêts seulement (HELOC rotatif)
 *
 * @param principal - Solde du prêt
 * @param nominalAnnualRate - Taux nominal annuel
 * @returns Paiement mensuel (intérêts seulement)
 */
export function calculateInterestOnlyPayment(
  principal: number,
  nominalAnnualRate: number
): number {
  if (principal <= 0 || nominalAnnualRate <= 0) return 0

  const P = new Decimal(principal)
  const monthlyRate = new Decimal(convertToMonthlyEffectiveRate(nominalAnnualRate))

  return P.times(monthlyRate).toDecimalPlaces(2).toNumber()
}

/**
 * Génère un tableau d'amortissement complet
 *
 * @param principal - Montant initial
 * @param nominalAnnualRate - Taux nominal annuel
 * @param amortizationYears - Période d'amortissement
 * @returns Tableau des paiements avec détail capital/intérêt
 */
export interface AmortizationEntry {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
  cumulativeInterest: number
  cumulativePrincipal: number
}

export function generateAmortizationSchedule(
  principal: number,
  nominalAnnualRate: number,
  amortizationYears: number
): AmortizationEntry[] {
  const schedule: AmortizationEntry[] = []
  const monthlyPayment = calculateMonthlyMortgagePayment(principal, nominalAnnualRate, amortizationYears)
  const monthlyRate = convertToMonthlyEffectiveRate(nominalAnnualRate)

  let balance = new Decimal(principal)
  let cumulativeInterest = new Decimal(0)
  let cumulativePrincipal = new Decimal(0)

  const totalMonths = amortizationYears * 12

  for (let month = 1; month <= totalMonths; month++) {
    const interestPortion = balance.times(monthlyRate)
    const principalPortion = new Decimal(monthlyPayment).minus(interestPortion)

    balance = balance.minus(principalPortion)
    if (balance.lessThan(0)) balance = new Decimal(0)

    cumulativeInterest = cumulativeInterest.plus(interestPortion)
    cumulativePrincipal = cumulativePrincipal.plus(principalPortion)

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPortion.toDecimalPlaces(2).toNumber(),
      interest: interestPortion.toDecimalPlaces(2).toNumber(),
      balance: balance.toDecimalPlaces(2).toNumber(),
      cumulativeInterest: cumulativeInterest.toDecimalPlaces(2).toNumber(),
      cumulativePrincipal: cumulativePrincipal.toDecimalPlaces(2).toNumber(),
    })
  }

  return schedule
}

/**
 * Calcule le solde restant après X mois
 *
 * @param principal - Montant initial
 * @param nominalAnnualRate - Taux nominal annuel
 * @param amortizationYears - Période d'amortissement
 * @param monthsElapsed - Nombre de mois écoulés
 * @returns Solde restant
 */
export function calculateRemainingBalance(
  principal: number,
  nominalAnnualRate: number,
  amortizationYears: number,
  monthsElapsed: number
): number {
  const monthlyPayment = calculateMonthlyMortgagePayment(principal, nominalAnnualRate, amortizationYears)
  const monthlyRate = convertToMonthlyEffectiveRate(nominalAnnualRate)

  let balance = new Decimal(principal)

  for (let i = 0; i < monthsElapsed; i++) {
    const interestPortion = balance.times(monthlyRate)
    const principalPortion = new Decimal(monthlyPayment).minus(interestPortion)
    balance = balance.minus(principalPortion)
    if (balance.lessThan(0)) return 0
  }

  return balance.toDecimalPlaces(2).toNumber()
}

/**
 * Calcule le taux du stress test BSIF
 * Le taux de qualification est le PLUS ÉLEVÉ entre:
 * - Taux contractuel + 2%
 * - 5.25% (plancher)
 *
 * @param contractRate - Taux du contrat hypothécaire
 * @returns Taux de qualification pour stress test
 */
export function calculateStressTestRate(contractRate: number): number {
  const rateWithBuffer = contractRate + 0.02 // +2%
  const floor = 0.0525 // 5.25%
  return Math.max(rateWithBuffer, floor)
}

/**
 * Vérifie si un emprunteur passe le stress test BSIF
 * basé sur le ratio GDS (Gross Debt Service) et TDS (Total Debt Service)
 *
 * @param params - Paramètres de qualification
 * @returns Résultat du stress test
 */
export interface StressTestParams {
  mortgageAmount: number
  contractRate: number
  amortizationYears: number
  grossMonthlyIncome: number
  monthlyPropertyTaxes: number
  monthlyHeatingCost: number // Estimé ~150-200$/mois au Québec
  monthlyCondoFees?: number
  otherMonthlyDebts?: number // Paiements auto, cartes, etc.
}

export interface StressTestResult {
  stressTestRate: number
  monthlyPaymentAtStressRate: number

  // GDS = (Hypothèque + Taxes + Chauffage + Condos) / Revenu
  gdsRatio: number
  gdsLimit: number // 32% ou 39% avec assurance SCHL
  passesGds: boolean

  // TDS = (GDS + Autres dettes) / Revenu
  tdsRatio: number
  tdsLimit: number // 40% ou 44% avec assurance SCHL
  passesTds: boolean

  passesStressTest: boolean
}

export function performStressTest(params: StressTestParams): StressTestResult {
  const stressTestRate = calculateStressTestRate(params.contractRate)
  const monthlyPaymentAtStressRate = calculateMonthlyMortgagePayment(
    params.mortgageAmount,
    stressTestRate,
    params.amortizationYears
  )

  const monthlyHousingCosts =
    monthlyPaymentAtStressRate +
    params.monthlyPropertyTaxes +
    params.monthlyHeatingCost +
    (params.monthlyCondoFees || 0)

  const gdsRatio = monthlyHousingCosts / params.grossMonthlyIncome
  const gdsLimit = 0.32 // 32% standard (39% avec SCHL haute ratio)

  const totalDebtService = monthlyHousingCosts + (params.otherMonthlyDebts || 0)
  const tdsRatio = totalDebtService / params.grossMonthlyIncome
  const tdsLimit = 0.40 // 40% standard (44% avec SCHL)

  return {
    stressTestRate,
    monthlyPaymentAtStressRate,
    gdsRatio,
    gdsLimit,
    passesGds: gdsRatio <= gdsLimit,
    tdsRatio,
    tdsLimit,
    passesTds: tdsRatio <= tdsLimit,
    passesStressTest: gdsRatio <= gdsLimit && tdsRatio <= tdsLimit,
  }
}

/**
 * Calcule le DCR (Debt Coverage Ratio) pour immeubles commerciaux (5+ logements)
 * DCR = NOI annuel / Service de la dette annuel
 * Minimum requis par les prêteurs: généralement 1.25x
 *
 * @param annualNOI - Net Operating Income annuel
 * @param annualDebtService - Service de la dette annuel
 * @returns DCR
 */
export function calculateDCR(annualNOI: number, annualDebtService: number): number {
  if (annualDebtService <= 0) return 0
  return new Decimal(annualNOI).div(annualDebtService).toDecimalPlaces(2).toNumber()
}

/**
 * Calcule le montant maximum d'hypothèque basé sur un DCR cible
 * Utile pour déterminer le prix d'achat maximum
 *
 * @param annualNOI - NOI annuel
 * @param targetDCR - DCR cible (ex: 1.25)
 * @param nominalRate - Taux hypothécaire
 * @param amortYears - Amortissement
 * @returns Montant hypothécaire maximum
 */
export function calculateMaxMortgageFromDCR(
  annualNOI: number,
  targetDCR: number,
  nominalRate: number,
  amortYears: number
): number {
  // Service de dette annuel max = NOI / DCR cible
  const maxAnnualDebtService = annualNOI / targetDCR
  const maxMonthlyPayment = maxAnnualDebtService / 12

  // Inverse du calcul de paiement pour trouver le principal
  const monthlyRate = convertToMonthlyEffectiveRate(nominalRate)
  const n = amortYears * 12

  const onePlusR = 1 + monthlyRate
  const onePlusRPowN = Math.pow(onePlusR, n)

  // P = M * [(1+r)^n - 1] / [r(1+r)^n]
  const principal = maxMonthlyPayment * (onePlusRPowN - 1) / (monthlyRate * onePlusRPowN)

  return Math.floor(principal)
}
