/**
 * PlexInvest V2 - Store Zustand Principal
 *
 * Combine tous les slices avec persist middleware
 */

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createPropertySlice, type PropertySlice } from './slices/property.slice'
import { createFinancialSlice, type FinancialSlice } from './slices/financial.slice'
import { createSettingsSlice, type SettingsSlice } from './slices/settings.slice'

// Type combiné du store
export type PlexStore = PropertySlice &
  FinancialSlice &
  SettingsSlice & {
    _hasHydrated: boolean
    setHasHydrated: (state: boolean) => void
    resetAll: () => void
  }

// Store principal avec persistence
export const usePlexStore = create<PlexStore>()(
  persist(
    (set, get, api) => ({
      // Slices
      ...createPropertySlice(set, get, api),
      ...createFinancialSlice(set, get, api),
      ...createSettingsSlice(set, get, api),

      // Hydration state (pour SSR/Next.js)
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      // Reset global
      resetAll: () => {
        get().resetProperty()
        get().resetFinancial()
        get().resetWizard()
      },
    }),
    {
      name: 'plexinvest-storage',
      storage: createJSONStorage(() => {
        // Sécurité pour SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      // Sélectionner ce qu'on persiste (pas les settings temporaires)
      partialize: (state) => ({
        // Property data
        property: state.property,
        // Financial data
        mortgage: state.mortgage,
        refinance: state.refinance,
        closingCosts: state.closingCosts,
        // Settings persistés
        showAdvancedOptions: state.showAdvancedOptions,
        defaultVacancyRate: state.defaultVacancyRate,
        defaultManagementFee: state.defaultManagementFee,
        includeSnowRemoval: state.includeSnowRemoval,
      }),
    }
  )
)

/**
 * Hook anti-hydration mismatch pour Next.js
 * Utiliser ce hook pour éviter les erreurs d'hydratation
 */
export function useStoreHydrated(): boolean {
  return usePlexStore((state) => state._hasHydrated)
}

/**
 * Hook pour accéder aux données de la propriété de manière sécurisée
 */
export function useProperty() {
  const isHydrated = useStoreHydrated()
  const property = usePlexStore((state) => state.property)
  const setProperty = usePlexStore((state) => state.setProperty)
  const resetProperty = usePlexStore((state) => state.resetProperty)

  return {
    property: isHydrated ? property : null,
    setProperty,
    resetProperty,
    isReady: isHydrated,
  }
}

/**
 * Hook pour accéder aux données financières de manière sécurisée
 */
export function useFinancial() {
  const isHydrated = useStoreHydrated()
  const mortgage = usePlexStore((state) => state.mortgage)
  const refinance = usePlexStore((state) => state.refinance)
  const closingCosts = usePlexStore((state) => state.closingCosts)
  const setMortgage = usePlexStore((state) => state.setMortgage)
  const setRefinance = usePlexStore((state) => state.setRefinance)
  const stressTestPassed = usePlexStore((state) => state.stressTestPassed)
  const qualifyingRate = usePlexStore((state) => state.qualifyingRate)

  return {
    mortgage: isHydrated ? mortgage : null,
    refinance: isHydrated ? refinance : null,
    closingCosts: isHydrated ? closingCosts : null,
    setMortgage,
    setRefinance,
    stressTestPassed,
    qualifyingRate,
    isReady: isHydrated,
  }
}

/**
 * Hook pour le wizard
 */
export function useWizard() {
  const currentStep = usePlexStore((state) => state.currentStep)
  const completedSteps = usePlexStore((state) => state.completedSteps)
  const goToNextStep = usePlexStore((state) => state.goToNextStep)
  const goToPreviousStep = usePlexStore((state) => state.goToPreviousStep)
  const setCurrentStep = usePlexStore((state) => state.setCurrentStep)
  const resetWizard = usePlexStore((state) => state.resetWizard)

  return {
    currentStep,
    completedSteps,
    goToNextStep,
    goToPreviousStep,
    setCurrentStep,
    resetWizard,
  }
}

// Re-export des types
export type { PropertySlice } from './slices/property.slice'
export type { FinancialSlice } from './slices/financial.slice'
export type { SettingsSlice, WizardStep } from './slices/settings.slice'
