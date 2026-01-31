/**
 * PlexInvest V2 - Settings Slice
 *
 * Paramètres utilisateur et préférences
 */

import { StateCreator } from 'zustand'

export type WizardStep = 'setup' | 'chantier' | 'operation' | 'verdict'

export interface SettingsSlice {
  // Wizard navigation
  currentStep: WizardStep
  completedSteps: WizardStep[]

  // Display preferences
  showAdvancedOptions: boolean
  currency: 'CAD'
  locale: 'fr-CA' | 'en-CA'

  // Analysis settings
  defaultVacancyRate: number
  defaultManagementFee: number
  includeSnowRemoval: boolean

  // Actions
  setCurrentStep: (step: WizardStep) => void
  markStepComplete: (step: WizardStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  resetWizard: () => void
  toggleAdvancedOptions: () => void
  updateSettings: (settings: Partial<SettingsSlice>) => void
}

const STEP_ORDER: WizardStep[] = ['setup', 'chantier', 'operation', 'verdict']

export const createSettingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  currentStep: 'setup',
  completedSteps: [],
  showAdvancedOptions: false,
  currency: 'CAD',
  locale: 'fr-CA',
  defaultVacancyRate: 0.05,
  defaultManagementFee: 0.08,
  includeSnowRemoval: true,

  setCurrentStep: (step) => set({ currentStep: step }),

  markStepComplete: (step) => {
    const { completedSteps } = get()
    if (!completedSteps.includes(step)) {
      set({ completedSteps: [...completedSteps, step] })
    }
  },

  goToNextStep: () => {
    const { currentStep, completedSteps } = get()
    const currentIndex = STEP_ORDER.indexOf(currentStep)

    if (currentIndex < STEP_ORDER.length - 1) {
      // Marquer l'étape actuelle comme complète
      if (!completedSteps.includes(currentStep)) {
        set({ completedSteps: [...completedSteps, currentStep] })
      }
      // Passer à l'étape suivante
      set({ currentStep: STEP_ORDER[currentIndex + 1] })
    }
  },

  goToPreviousStep: () => {
    const { currentStep } = get()
    const currentIndex = STEP_ORDER.indexOf(currentStep)

    if (currentIndex > 0) {
      set({ currentStep: STEP_ORDER[currentIndex - 1] })
    }
  },

  resetWizard: () =>
    set({
      currentStep: 'setup',
      completedSteps: [],
    }),

  toggleAdvancedOptions: () =>
    set((state) => ({ showAdvancedOptions: !state.showAdvancedOptions })),

  updateSettings: (settings) => set(settings),
})
