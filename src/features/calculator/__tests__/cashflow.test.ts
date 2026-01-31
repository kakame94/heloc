/**
 * PlexInvest V2 - Tests du moteur de cashflow
 */

import { describe, it, expect } from 'vitest'
import { analyzeCashflow, quickCashflowAnalysis, projectCashflow } from '../engines/cashflow'
import type { Property } from '@/entities/property'
import type { Mortgage } from '@/entities/finance'

// Property fixture
const createTestProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 'test-123',
  address: {
    street: '123 Test St',
    city: 'montreal',
  },
  propertyType: 'triplex',
  yearBuilt: 1980,
  numberOfUnits: 3,
  units: [
    { id: '1', type: '3cc', currentRent: 1200, marketRent: 1300, isVacant: false },
    { id: '2', type: '3cc', currentRent: 1100, marketRent: 1200, isVacant: false },
    { id: '3', type: '2cc', currentRent: 900, marketRent: 1000, isVacant: false },
  ],
  expenses: {
    municipalTax: 5000,
    schoolTax: 1000,
    insurance: 2400,
    electricity: 0,
    heating: 0,
    snowRemoval: 600,
    maintenance: 1500,
    managementPercent: 8,
    otherExpenses: 0,
  },
  purchasePrice: 500000,
  renovationBudget: 0,
  renovationDuration: 0,
  afterRepairValue: 500000,
  ...overrides,
})

const createTestMortgage = (overrides: Partial<Mortgage> = {}): Mortgage => ({
  loanAmount: 400000,
  downPaymentPercent: 20,
  interestRate: 5,
  amortization: 25,
  term: 5,
  isInsured: false,
  isMliSelect: false,
  ...overrides,
})

describe('Cashflow Analyzer', () => {
  describe('Full cashflow analysis', () => {
    it('should calculate all cashflow metrics', () => {
      const property = createTestProperty()
      const mortgage = createTestMortgage()
      const cashInvested = 100000

      const result = analyzeCashflow(property, mortgage, cashInvested)

      // Revenus
      expect(result.grossRevenue).toBe((1200 + 1100 + 900) * 12)
      expect(result.vacancyLoss).toBeGreaterThan(0)
      expect(result.effectiveGrossIncome).toBeLessThan(result.grossRevenue)

      // Dépenses
      expect(result.totalOperatingExpenses).toBeGreaterThan(0)
      expect(result.expenseBreakdown.management).toBeGreaterThan(0)

      // NOI et Cashflow
      expect(result.netOperatingIncome).toBeGreaterThan(0)
      expect(result.annualDebtService).toBeGreaterThan(0)
      expect(result.monthlyCashflow).toBeDefined()
      expect(result.cashflowPerDoor).toBeDefined()

      // Ratios
      expect(result.capRate).toBeGreaterThan(0)
      expect(result.dscr).toBeGreaterThan(0)
      expect(result.dscrStressTested).toBeLessThan(result.dscr)
    })

    it('should calculate grade based on metrics', () => {
      const property = createTestProperty()
      const mortgage = createTestMortgage()

      const result = analyzeCashflow(property, mortgage, 100000)

      expect(['A', 'B', 'C', 'D', 'F']).toContain(result.grade)
    })

    it('should generate warnings for risky deals', () => {
      // Property with 0% management fee
      const property = createTestProperty({
        expenses: {
          ...createTestProperty().expenses,
          managementPercent: 0,
        },
      })
      const mortgage = createTestMortgage()

      const result = analyzeCashflow(property, mortgage, 100000)

      expect(result.warnings.some((w) => w.includes('Gestion à 0%'))).toBe(true)
    })

    it('should warn when DSCR fails stress test', () => {
      // High debt, low income scenario
      const property = createTestProperty({
        units: [
          { id: '1', type: '3cc', currentRent: 500, marketRent: 500, isVacant: false },
          { id: '2', type: '3cc', currentRent: 500, marketRent: 500, isVacant: false },
          { id: '3', type: '2cc', currentRent: 500, marketRent: 500, isVacant: false },
        ],
      })
      const mortgage = createTestMortgage({ loanAmount: 450000 })

      const result = analyzeCashflow(property, mortgage, 50000)

      if (result.dscrStressTested < 1.1) {
        expect(result.warnings.some((w) => w.includes('B-20'))).toBe(true)
      }
    })
  })

  describe('Quick cashflow analysis', () => {
    it('should return simplified metrics', () => {
      const result = quickCashflowAnalysis(
        3000, // monthly rent
        12000, // annual expenses
        2000, // monthly mortgage
        500000, // purchase price
        100000 // cash invested
      )

      expect(result.monthlyCashflow).toBeDefined()
      expect(result.annualCashflow).toBeDefined()
      expect(result.capRate).toBeGreaterThan(0)
      expect(result.noi).toBeGreaterThan(0)
    })

    it('should calculate positive cashflow for good deal', () => {
      const result = quickCashflowAnalysis(
        4000, // good rent
        10000, // low expenses
        1500, // low mortgage
        400000,
        80000
      )

      expect(result.monthlyCashflow).toBeGreaterThan(0)
      expect(result.cashOnCash).toBeGreaterThan(0)
    })

    it('should calculate negative cashflow for bad deal', () => {
      const result = quickCashflowAnalysis(
        1500, // low rent
        15000, // high expenses
        2500, // high mortgage
        500000,
        100000
      )

      expect(result.monthlyCashflow).toBeLessThan(0)
    })
  })

  describe('Cashflow projections', () => {
    it('should project over multiple years', () => {
      const property = createTestProperty()
      const mortgage = createTestMortgage()
      const baseCashflow = analyzeCashflow(property, mortgage, 100000)

      const projections = projectCashflow(baseCashflow, 5, 0.02, 0.03)

      expect(projections).toHaveLength(5)
      expect(projections[0].year).toBe(1)
      expect(projections[4].year).toBe(5)
    })

    it('should show growing revenue over time', () => {
      const property = createTestProperty()
      const mortgage = createTestMortgage()
      const baseCashflow = analyzeCashflow(property, mortgage, 100000)

      const projections = projectCashflow(baseCashflow, 5, 0.02, 0.03)

      // Revenue should grow each year
      for (let i = 1; i < projections.length; i++) {
        expect(projections[i].grossRevenue).toBeGreaterThan(projections[i - 1].grossRevenue)
      }
    })

    it('should show growing expenses over time', () => {
      const property = createTestProperty()
      const mortgage = createTestMortgage()
      const baseCashflow = analyzeCashflow(property, mortgage, 100000)

      const projections = projectCashflow(baseCashflow, 5, 0.02, 0.03)

      // Expenses should grow each year
      for (let i = 1; i < projections.length; i++) {
        expect(projections[i].expenses).toBeGreaterThan(projections[i - 1].expenses)
      }
    })
  })
})
