/**
 * PlexInvest V2 - Financial Slice
 *
 * Gestion de l'état financier (hypothèque, refinancement, stress test)
 */

import { StateCreator } from 'zustand'
import type { Mortgage, Refinance, ClosingCosts } from '@/entities/finance'
import { getStressTestRate, isStressTestPassed } from '@/shared/config/config-service'

export interface FinancialSlice {
  mortgage: Mortgage | null
  refinance: Refinance | null
  closingCosts: Partial<ClosingCosts> | null

  // Stress test results
  qualifyingRate: number
  stressTestPassed: boolean

  // Actions
  setMortgage: (mortgage: Mortgage) => void
  setRefinance: (refinance: Refinance) => void
  setClosingCosts: (costs: Partial<ClosingCosts>) => void
  calculateStressTest: (noi: number) => void
  resetFinancial: () => void

  // Computed
  getTotalClosingCosts: () => number
  getMonthlyPayment: () => number
  getAnnualDebtService: () => number
}

/**
 * Calcule le paiement hypothécaire avec la méthode canadienne
 * (Capitalisation semi-annuelle)
 */
function calculateMortgagePaymentInternal(
  principal: number,
  annualRate: number,
  amortizationYears: number
): number {
  if (principal <= 0 || annualRate <= 0 || amortizationYears <= 0) return 0

  // Conversion taux canadien (semi-annuel → mensuel)
  const semiAnnualRate = annualRate / 2
  const monthlyRate = Math.pow(1 + semiAnnualRate, 1 / 6) - 1
  const totalPayments = amortizationYears * 12

  const payment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1)

  return Math.round(payment * 100) / 100
}

export const createFinancialSlice: StateCreator<FinancialSlice> = (set, get) => ({
  mortgage: null,
  refinance: null,
  closingCosts: null,
  qualifyingRate: 0,
  stressTestPassed: false,

  setMortgage: (mortgage) => {
    // Calculer le taux stress-testé
    const qualifyingRate = getStressTestRate(mortgage.interestRate / 100) * 100

    set({
      mortgage,
      qualifyingRate,
    })
  },

  setRefinance: (refinance) => set({ refinance }),

  setClosingCosts: (costs) => set({ closingCosts: costs }),

  calculateStressTest: (noi: number) => {
    const { mortgage, qualifyingRate } = get()
    if (!mortgage) {
      set({ stressTestPassed: false })
      return
    }

    // Calculer le paiement au taux qualifiant
    const stressTestedPayment = calculateMortgagePaymentInternal(
      mortgage.loanAmount,
      qualifyingRate / 100,
      mortgage.amortization
    )

    const annualDebtServiceStressed = stressTestedPayment * 12
    const dscr = annualDebtServiceStressed > 0 ? noi / annualDebtServiceStressed : 0

    set({
      stressTestPassed: isStressTestPassed(dscr),
    })
  },

  resetFinancial: () =>
    set({
      mortgage: null,
      refinance: null,
      closingCosts: null,
      qualifyingRate: 0,
      stressTestPassed: false,
    }),

  getTotalClosingCosts: () => {
    const { closingCosts } = get()
    if (!closingCosts) return 0

    return Object.values(closingCosts).reduce(
      (sum, val) => sum + (typeof val === 'number' ? val : 0),
      0
    )
  },

  getMonthlyPayment: () => {
    const { mortgage } = get()
    if (!mortgage) return 0

    return calculateMortgagePaymentInternal(
      mortgage.loanAmount,
      mortgage.interestRate / 100,
      mortgage.amortization
    )
  },

  getAnnualDebtService: () => {
    return get().getMonthlyPayment() * 12
  },
})
