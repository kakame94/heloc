/**
 * PlexInvest V2 - Tests du moteur hypothécaire
 */

import { describe, it, expect } from 'vitest'
import {
  calculateMortgagePayment,
  calculateStressTestedPayment,
  calculateSCHLPremium,
  fullMortgageAnalysis,
  compareAmortizations,
} from '../engines/mortgage'

describe('Mortgage Calculator', () => {
  describe('Canadian mortgage payment calculation', () => {
    it('should calculate monthly payment with semi-annual compounding', () => {
      // Test case: 400K @ 5% sur 25 ans
      const payment = calculateMortgagePayment(400000, 0.05, 25)

      // Le paiement canadien avec capitalisation semi-annuelle
      // devrait être légèrement différent du calcul américain
      expect(payment).toBeGreaterThan(2300)
      expect(payment).toBeLessThan(2400)
    })

    it('should return 0 for invalid inputs', () => {
      expect(calculateMortgagePayment(0, 0.05, 25)).toBe(0)
      expect(calculateMortgagePayment(400000, 0, 25)).toBe(0)
      expect(calculateMortgagePayment(400000, 0.05, 0)).toBe(0)
      expect(calculateMortgagePayment(-100000, 0.05, 25)).toBe(0)
    })

    it('should calculate higher payments for shorter amortization', () => {
      const payment25 = calculateMortgagePayment(400000, 0.05, 25)
      const payment20 = calculateMortgagePayment(400000, 0.05, 20)

      expect(payment20).toBeGreaterThan(payment25)
    })

    it('should calculate higher payments for higher rates', () => {
      const payment5 = calculateMortgagePayment(400000, 0.05, 25)
      const payment7 = calculateMortgagePayment(400000, 0.07, 25)

      expect(payment7).toBeGreaterThan(payment5)
    })
  })

  describe('B-20 Stress Test', () => {
    it('should use floor rate when contract rate + 2% is lower', () => {
      // Taux contractuel: 2% → 2% + 2% = 4% < 5.25% → utiliser 5.25%
      const { qualifyingRate } = calculateStressTestedPayment(400000, 0.02, 25)

      expect(qualifyingRate).toBe(0.0525)
    })

    it('should use contract rate + 2% when higher than floor', () => {
      // Taux contractuel: 4% → 4% + 2% = 6% > 5.25% → utiliser 6%
      const { qualifyingRate } = calculateStressTestedPayment(400000, 0.04, 25)

      expect(qualifyingRate).toBeCloseTo(0.06, 4)
    })

    it('should calculate higher payment with stress-tested rate', () => {
      const regularPayment = calculateMortgagePayment(400000, 0.04, 25)
      const { payment: stressedPayment } = calculateStressTestedPayment(400000, 0.04, 25)

      expect(stressedPayment).toBeGreaterThan(regularPayment)
    })
  })

  describe('SCHL Premium', () => {
    it('should return 0 premium for 80% LTV or less', () => {
      const result = calculateSCHLPremium(320000, 400000, 25) // 80% LTV

      expect(result.premiumRate).toBe(0)
      expect(result.premiumAmount).toBe(0)
      expect(result.tvq).toBe(0)
    })

    it('should calculate premium for 95% LTV', () => {
      const result = calculateSCHLPremium(380000, 400000, 25) // 95% LTV

      expect(result.premiumRate).toBe(0.04) // 4% pour 95%
      expect(result.premiumAmount).toBe(15200) // 380K × 4%
      expect(result.tvq).toBeGreaterThan(0) // TVQ sur la prime
    })

    it('should calculate premium for 90% LTV', () => {
      const result = calculateSCHLPremium(360000, 400000, 25) // 90% LTV

      expect(result.premiumRate).toBe(0.031) // 3.1% pour 90%
    })

    it('should add surcharge for 30-year amortization', () => {
      const result25 = calculateSCHLPremium(380000, 400000, 25)
      const result30 = calculateSCHLPremium(380000, 400000, 30)

      // Surcharge de 0.2% pour 30 ans
      expect(result30.premiumRate).toBe(result25.premiumRate + 0.002)
    })

    it('should include TVQ on premium (non-financeable)', () => {
      const result = calculateSCHLPremium(380000, 400000, 25)

      // TVQ = 9.975% de la prime
      expect(result.tvq).toBeCloseTo(result.premiumAmount * 0.09975, 0)
    })

    it('should calculate new loan amount with premium', () => {
      const result = calculateSCHLPremium(380000, 400000, 25)

      // La prime est finançable
      expect(result.newLoanAmount).toBe(380000 + result.premiumAmount)
    })
  })

  describe('Full Mortgage Analysis', () => {
    it('should return complete analysis', () => {
      const mortgage = {
        loanAmount: 400000,
        downPaymentPercent: 20,
        interestRate: 5,
        amortization: 25,
        term: 5,
        isInsured: false,
        isMliSelect: false,
      }

      const result = fullMortgageAnalysis(mortgage, 500000)

      expect(result.monthlyPayment).toBeGreaterThan(0)
      expect(result.totalPayments).toBeGreaterThan(400000)
      expect(result.totalInterest).toBeGreaterThan(0)
      expect(result.effectiveRate).toBeGreaterThan(5)
      expect(result.qualifyingPayment).toBeGreaterThan(result.monthlyPayment)
      expect(result.qualifyingRate).toBeGreaterThan(5)
    })
  })

  describe('Amortization Comparison', () => {
    it('should compare 25 vs 30 year amortization', () => {
      const result = compareAmortizations(400000, 0.05, 25, 30)

      // 30 ans = paiement plus bas
      expect(result.scenario2.monthlyPayment).toBeLessThan(result.scenario1.monthlyPayment)

      // 30 ans = plus d'intérêts totaux
      expect(result.scenario2.totalInterest).toBeGreaterThan(result.scenario1.totalInterest)

      // La différence devrait être substantielle
      expect(result.difference.totalInterest).toBeGreaterThan(50000)
    })
  })
})
