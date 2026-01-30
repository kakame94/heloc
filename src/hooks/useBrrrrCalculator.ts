/**
 * PlexInvest Québec - Hook React useBrrrrCalculator
 *
 * Hook personnalisé pour calculer les KPIs BRRRR en temps réel.
 * Utilise useMemo pour optimiser les recalculs et éviter les re-renders inutiles.
 */

import { useMemo, useCallback, useState } from 'react'
import type {
  PropertyFinancials,
  BrrrrCalculationResult,
  MunicipalityCode,
  RenoFinancingType,
} from '@/types/financial'
import { calculateBRRRR, quickBrrrrMetrics, type QuickBrrrrMetrics } from '@/lib/calculations/brrrr-engine'
import { calculateHelocCapacity, type HelocCapacityResult } from '@/lib/calculations/heloc'
import { getMunicipalityFromPostalCode } from '@/lib/calculations/transfer-tax'

/**
 * Valeurs par défaut pour les champs non fournis
 */
const DEFAULTS = {
  downPaymentPercent: 0.20,
  mortgageRate: 0.0525, // 5.25%
  amortizationYears: 25,
  renovationContingencyPercent: 10,
  renovationDurationMonths: 3,
  renoFinancingType: 'HELOC' as RenoFinancingType,
  helocRateForReno: 0.0695, // 6.95%
  vacancyRatePercent: 5,
  maintenancePercent: 5,
  managementPercent: 0,
  utilitiesMonthly: 0,
  refinanceRate: 0.0525,
  refinanceAmortYears: 25,
  notaryFees: 2000,
  inspectionFees: 800,
  insuranceAnnual: 2400, // ~200$/mois
}

/**
 * Input simplifié pour le formulaire utilisateur
 * Les champs optionnels utilisent les defaults si non fournis
 */
export interface BrrrrFormInput {
  // Requis
  purchasePrice: number
  afterRepairValue: number
  projectedMonthlyRent: number
  renovationBudget: number
  municipalTaxes: number
  schoolTaxes: number
  totalUnits: number

  // Optionnels avec defaults
  municipality?: MunicipalityCode
  postalCode?: string
  downPaymentPercent?: number
  mortgageRate?: number
  amortizationYears?: number
  renovationContingencyPercent?: number
  renovationDurationMonths?: number
  renoFinancingType?: RenoFinancingType
  helocRateForReno?: number
  vacancyRatePercent?: number
  insuranceAnnual?: number
  maintenancePercent?: number
  managementPercent?: number
  utilitiesMonthly?: number
  refinanceRate?: number
  refinanceAmortYears?: number
  notaryFees?: number
  inspectionFees?: number
  isOwnerOccupied?: boolean
}

/**
 * Résultat du hook avec KPIs principaux facilement accessibles
 */
export interface UseBrrrrCalculatorResult {
  // KPIs rapides (toujours disponibles)
  roi: number
  roie: number // Return on Initial Equity (same as CoC for BRRRR)
  cashFlowMonthly: number
  cashFlowAnnual: number
  refinanceCashOutAmount: number
  isInfiniteReturn: boolean
  capRate: number
  dcr: number

  // Calcul complet (si demandé)
  fullAnalysis: BrrrrCalculationResult | null

  // Statut
  isCalculating: boolean
  hasErrors: boolean
  errors: string[]
  warnings: string[]

  // Actions
  recalculate: () => void
}

/**
 * Hook principal pour le calculateur BRRRR
 *
 * @param input - Données de la propriété et paramètres
 * @param options - Options de calcul
 * @returns KPIs et analyse complète
 *
 * @example
 * ```tsx
 * const { roi, cashFlowMonthly, isInfiniteReturn } = useBrrrrCalculator({
 *   purchasePrice: 400000,
 *   afterRepairValue: 500000,
 *   projectedMonthlyRent: 3500,
 *   renovationBudget: 50000,
 *   municipalTaxes: 4000,
 *   schoolTaxes: 600,
 *   totalUnits: 4,
 * })
 * ```
 */
export function useBrrrrCalculator(
  input: BrrrrFormInput | null,
  options: { fullAnalysis?: boolean } = {}
): UseBrrrrCalculatorResult {
  const { fullAnalysis: computeFullAnalysis = true } = options

  // Déterminer la municipalité
  const municipality = useMemo((): MunicipalityCode => {
    if (input?.municipality) return input.municipality
    if (input?.postalCode) return getMunicipalityFromPostalCode(input.postalCode)
    return 'MONTREAL' // Défaut
  }, [input?.municipality, input?.postalCode])

  // Construire l'input complet avec defaults
  const fullInput = useMemo((): PropertyFinancials | null => {
    if (!input) return null

    // Validation minimale
    if (
      input.purchasePrice <= 0 ||
      input.afterRepairValue <= 0 ||
      input.projectedMonthlyRent <= 0
    ) {
      return null
    }

    return {
      purchasePrice: input.purchasePrice,
      downPaymentPercent: input.downPaymentPercent ?? DEFAULTS.downPaymentPercent,
      municipality,
      mortgageRate: input.mortgageRate ?? DEFAULTS.mortgageRate,
      amortizationYears: input.amortizationYears ?? DEFAULTS.amortizationYears,
      renovationBudget: input.renovationBudget,
      renovationContingencyPercent: input.renovationContingencyPercent ?? DEFAULTS.renovationContingencyPercent,
      renovationDurationMonths: input.renovationDurationMonths ?? DEFAULTS.renovationDurationMonths,
      renoFinancingType: input.renoFinancingType ?? DEFAULTS.renoFinancingType,
      helocRateForReno: input.helocRateForReno ?? DEFAULTS.helocRateForReno,
      projectedMonthlyRent: input.projectedMonthlyRent,
      vacancyRatePercent: input.vacancyRatePercent ?? DEFAULTS.vacancyRatePercent,
      municipalTaxes: input.municipalTaxes,
      schoolTaxes: input.schoolTaxes,
      insuranceAnnual: input.insuranceAnnual ?? DEFAULTS.insuranceAnnual,
      maintenancePercent: input.maintenancePercent ?? DEFAULTS.maintenancePercent,
      managementPercent: input.managementPercent ?? DEFAULTS.managementPercent,
      utilitiesMonthly: input.utilitiesMonthly ?? DEFAULTS.utilitiesMonthly,
      afterRepairValue: input.afterRepairValue,
      refinanceRate: input.refinanceRate ?? DEFAULTS.refinanceRate,
      refinanceAmortYears: input.refinanceAmortYears ?? DEFAULTS.refinanceAmortYears,
      totalUnits: input.totalUnits,
      isOwnerOccupied: input.isOwnerOccupied ?? false,
      notaryFees: input.notaryFees ?? DEFAULTS.notaryFees,
      inspectionFees: input.inspectionFees ?? DEFAULTS.inspectionFees,
    }
  }, [input, municipality])

  // Calcul complet BRRRR
  const analysis = useMemo((): BrrrrCalculationResult | null => {
    if (!fullInput || !computeFullAnalysis) return null

    try {
      return calculateBRRRR(fullInput)
    } catch (error) {
      console.error('Erreur calcul BRRRR:', error)
      return null
    }
  }, [fullInput, computeFullAnalysis])

  // Extraction des KPIs
  const result = useMemo((): UseBrrrrCalculatorResult => {
    // Valeurs par défaut si pas de calcul
    if (!analysis) {
      return {
        roi: 0,
        roie: 0,
        cashFlowMonthly: 0,
        cashFlowAnnual: 0,
        refinanceCashOutAmount: 0,
        isInfiniteReturn: false,
        capRate: 0,
        dcr: 0,
        fullAnalysis: null,
        isCalculating: false,
        hasErrors: !fullInput,
        errors: fullInput ? [] : ['Données insuffisantes pour le calcul'],
        warnings: [],
        recalculate: () => {},
      }
    }

    return {
      roi: analysis.kpis.cashOnCashReturn,
      roie: analysis.kpis.returnOnEquity,
      cashFlowMonthly: analysis.kpis.monthlyCashflow,
      cashFlowAnnual: analysis.kpis.annualCashflow,
      refinanceCashOutAmount: analysis.refinance.netCashOut,
      isInfiniteReturn: analysis.kpis.isInfiniteReturn,
      capRate: analysis.kpis.capRate,
      dcr: analysis.kpis.debtCoverageRatio,
      fullAnalysis: analysis,
      isCalculating: false,
      hasErrors: !analysis.validation.isValid,
      errors: analysis.validation.errors,
      warnings: analysis.validation.warnings,
      recalculate: () => {}, // Le recalcul est automatique via useMemo
    }
  }, [analysis, fullInput])

  return result
}

/**
 * Hook pour le calculateur de capacité HELOC
 */
export interface UseHelocCapacityInput {
  currentPropertyValue: number
  currentMortgageBalance: number
  currentHelocBalance?: number
}

export function useHelocCapacity(
  input: UseHelocCapacityInput | null
): HelocCapacityResult | null {
  return useMemo(() => {
    if (!input || input.currentPropertyValue <= 0) return null

    try {
      return calculateHelocCapacity({
        currentPropertyValue: input.currentPropertyValue,
        currentMortgageBalance: input.currentMortgageBalance,
        currentHelocBalance: input.currentHelocBalance ?? 0,
      })
    } catch (error) {
      console.error('Erreur calcul HELOC:', error)
      return null
    }
  }, [input])
}

/**
 * Hook pour calculs rapides (comparaison de multiples propriétés)
 */
export function useQuickBrrrrMetrics(
  properties: Array<{
    id: string
    purchasePrice: number
    renovationBudget: number
    monthlyRent: number
    arv: number
  }>,
  mortgageRate: number = 0.0525
): Map<string, QuickBrrrrMetrics> {
  return useMemo(() => {
    const results = new Map<string, QuickBrrrrMetrics>()

    for (const property of properties) {
      try {
        const metrics = quickBrrrrMetrics(
          property.purchasePrice,
          property.renovationBudget,
          property.monthlyRent,
          property.arv,
          mortgageRate
        )
        results.set(property.id, metrics)
      } catch {
        // Ignorer les erreurs de calcul individuelles
      }
    }

    return results
  }, [properties, mortgageRate])
}

/**
 * Hook pour la matrice de sensibilité
 */
export interface SensitivityPoint {
  variable1Value: number
  variable2Value: number
  cashOnCash: number
  cashflow: number
}

export function useSensitivityMatrix(
  baseInput: BrrrrFormInput | null,
  variable1: { name: 'purchasePrice' | 'renovationBudget' | 'rent' | 'arv' | 'rate'; range: [number, number]; steps: number },
  variable2: { name: 'purchasePrice' | 'renovationBudget' | 'rent' | 'arv' | 'rate'; range: [number, number]; steps: number }
): SensitivityPoint[][] {
  return useMemo(() => {
    if (!baseInput) return []

    const matrix: SensitivityPoint[][] = []

    // Générer les valeurs pour chaque variable
    const v1Values = generateRange(variable1.range[0], variable1.range[1], variable1.steps)
    const v2Values = generateRange(variable2.range[0], variable2.range[1], variable2.steps)

    for (const v1 of v1Values) {
      const row: SensitivityPoint[] = []

      for (const v2 of v2Values) {
        // Créer une copie modifiée de l'input
        const modifiedInput = { ...baseInput }

        // Appliquer variable 1
        applyVariable(modifiedInput, variable1.name, v1)
        // Appliquer variable 2
        applyVariable(modifiedInput, variable2.name, v2)

        try {
          const metrics = quickBrrrrMetrics(
            modifiedInput.purchasePrice,
            modifiedInput.renovationBudget,
            modifiedInput.projectedMonthlyRent,
            modifiedInput.afterRepairValue,
            modifiedInput.mortgageRate ?? 0.0525
          )

          row.push({
            variable1Value: v1,
            variable2Value: v2,
            cashOnCash: metrics.cashOnCash,
            cashflow: metrics.monthlyCashflow,
          })
        } catch {
          row.push({
            variable1Value: v1,
            variable2Value: v2,
            cashOnCash: NaN,
            cashflow: NaN,
          })
        }
      }

      matrix.push(row)
    }

    return matrix
  }, [baseInput, variable1, variable2])
}

// Helpers
function generateRange(min: number, max: number, steps: number): number[] {
  const result: number[] = []
  const step = (max - min) / (steps - 1)

  for (let i = 0; i < steps; i++) {
    result.push(min + step * i)
  }

  return result
}

function applyVariable(
  input: BrrrrFormInput,
  name: 'purchasePrice' | 'renovationBudget' | 'rent' | 'arv' | 'rate',
  value: number
): void {
  switch (name) {
    case 'purchasePrice':
      input.purchasePrice = value
      break
    case 'renovationBudget':
      input.renovationBudget = value
      break
    case 'rent':
      input.projectedMonthlyRent = value
      break
    case 'arv':
      input.afterRepairValue = value
      break
    case 'rate':
      input.mortgageRate = value
      input.refinanceRate = value
      break
  }
}
