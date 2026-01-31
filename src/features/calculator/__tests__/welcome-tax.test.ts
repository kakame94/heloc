/**
 * PlexInvest V2 - Tests de la taxe de bienvenue
 */

import { describe, it, expect } from 'vitest'
import { calculateWelcomeTax, estimateWelcomeTax, isHighValueProperty } from '../engines/welcome-tax'

describe('Welcome Tax Calculator', () => {
  describe('Montréal 2025', () => {
    it('should calculate correctly for a 500K property', () => {
      const result = calculateWelcomeTax(500000, undefined, 'montreal')

      // Tranches Montréal 2025:
      // 0 - 61,500 @ 0.5% = 307.50
      // 61,500 - 307,800 @ 1% = 2,463
      // 307,800 - 500,000 @ 1.5% = 2,883
      // Total ≈ 5,654
      expect(result.totalTax).toBeCloseTo(5654, -1) // Tolérance de 10$
      expect(result.city).toBe('Montréal')
      expect(result.breakdown.length).toBe(3)
    })

    it('should calculate correctly for a 1M property', () => {
      const result = calculateWelcomeTax(1000000, undefined, 'montreal')

      // Doit atteindre la tranche 2% (552,300 - 1,104,700)
      expect(result.breakdown.some((b) => b.rate === 2)).toBe(true)
      expect(result.totalTax).toBeGreaterThan(12000)
    })

    it('should calculate correctly for a 3.5M property (tranche 4%)', () => {
      const result = calculateWelcomeTax(3500000, undefined, 'montreal')

      // Doit atteindre la tranche 4% (> 3,113,000)
      expect(result.breakdown.some((b) => b.rate === 4)).toBe(true)
      expect(result.totalTax).toBeGreaterThan(85000)
    })

    it('should use comparative factor when assessment is higher', () => {
      // Prix: 400K, Évaluation: 450K, Facteur MTL: 1.08
      // Base imposable = max(400K, 450K × 1.08) = max(400K, 486K) = 486K
      const result = calculateWelcomeTax(400000, 450000, 'montreal')

      expect(result.taxableBase).toBe(486000)
      expect(result.comparativeFactor).toBe(1.08)
    })

    it('should use purchase price when higher than adjusted assessment', () => {
      // Prix: 600K, Évaluation: 500K × 1.08 = 540K
      // Base imposable = max(600K, 540K) = 600K
      const result = calculateWelcomeTax(600000, 500000, 'montreal')

      expect(result.taxableBase).toBe(600000)
    })
  })

  describe('Québec Standard', () => {
    it('should use standard brackets for Quebec city', () => {
      const result = calculateWelcomeTax(400000, undefined, 'quebec')

      expect(result.comparativeFactor).toBe(1.0)
      expect(result.city).toBe('Québec')
      // Max rate should be 1.5% (not 4% like Montreal)
      expect(result.breakdown.every((b) => b.rate <= 1.5)).toBe(true)
    })

    it('should calculate less tax than Montreal for high-value properties', () => {
      // Pour les propriétés > 1M, Montréal a des tranches plus élevées (2%, 2.5%, 3.5%, 4%)
      const montrealTax = estimateWelcomeTax(2000000, 'montreal')
      const quebecTax = estimateWelcomeTax(2000000, 'quebec')

      // Québec devrait être moins cher (max 1.5% vs jusqu'à 4% à Montréal)
      expect(quebecTax).toBeLessThan(montrealTax)
    })
  })

  describe('Other municipalities', () => {
    it('should use standard brackets for other cities', () => {
      const result = calculateWelcomeTax(300000, undefined, 'other')

      expect(result.city).toBe('Autre municipalité')
      expect(result.comparativeFactor).toBe(1.0)
    })
  })

  describe('High value property detection', () => {
    it('should detect high value properties in Montreal', () => {
      expect(isHighValueProperty(3500000, 'montreal')).toBe(true)
      expect(isHighValueProperty(3000000, 'montreal')).toBe(false)
    })

    it('should not flag high value for other cities', () => {
      expect(isHighValueProperty(5000000, 'quebec')).toBe(false)
      expect(isHighValueProperty(5000000, 'other')).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle zero assessment', () => {
      const result = calculateWelcomeTax(500000, 0, 'montreal')
      expect(result.taxableBase).toBe(500000)
    })

    it('should handle undefined assessment', () => {
      const result = calculateWelcomeTax(500000, undefined, 'montreal')
      expect(result.taxableBase).toBe(500000)
    })

    it('should handle very small amounts', () => {
      const result = calculateWelcomeTax(50000, undefined, 'montreal')
      // Tout dans la première tranche @ 0.5%
      expect(result.totalTax).toBeCloseTo(250, 0)
    })
  })
})
