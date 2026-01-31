/**
 * PlexInvest V2 - Property Slice
 *
 * Gestion de l'état de la propriété dans Zustand
 */

import { StateCreator } from 'zustand'
import type { Property, Unit } from '@/entities/property'

export interface PropertySlice {
  property: Property | null

  // Actions
  setProperty: (property: Property) => void
  updateUnit: (unitId: string, data: Partial<Unit>) => void
  addUnit: (unit: Unit) => void
  removeUnit: (unitId: string) => void
  updateExpenses: (expenses: Partial<Property['expenses']>) => void
  resetProperty: () => void

  // Computed (getters)
  getTotalMonthlyRent: () => number
  getTotalPotentialRent: () => number
  getTotalAnnualExpenses: () => number
  getVacancyLoss: (vacancyRate?: number) => number
  getNetOperatingIncome: (vacancyRate?: number) => number
}

export const createPropertySlice: StateCreator<PropertySlice> = (set, get) => ({
  property: null,

  setProperty: (property) => set({ property }),

  updateUnit: (unitId, data) => {
    const { property } = get()
    if (!property) return

    set({
      property: {
        ...property,
        units: property.units.map((u) =>
          u.id === unitId ? { ...u, ...data } : u
        ),
      },
    })
  },

  addUnit: (unit) => {
    const { property } = get()
    if (!property) return

    set({
      property: {
        ...property,
        units: [...property.units, unit],
        numberOfUnits: property.numberOfUnits + 1,
      },
    })
  },

  removeUnit: (unitId) => {
    const { property } = get()
    if (!property) return

    set({
      property: {
        ...property,
        units: property.units.filter((u) => u.id !== unitId),
        numberOfUnits: property.numberOfUnits - 1,
      },
    })
  },

  updateExpenses: (expenses) => {
    const { property } = get()
    if (!property) return

    set({
      property: {
        ...property,
        expenses: { ...property.expenses, ...expenses },
      },
    })
  },

  resetProperty: () => set({ property: null }),

  // Computed values
  getTotalMonthlyRent: () => {
    const { property } = get()
    if (!property) return 0
    return property.units.reduce((sum, u) => sum + u.currentRent, 0)
  },

  getTotalPotentialRent: () => {
    const { property } = get()
    if (!property) return 0
    return property.units.reduce((sum, u) => sum + u.marketRent, 0)
  },

  getTotalAnnualExpenses: () => {
    const { property } = get()
    if (!property) return 0

    const e = property.expenses
    const grossRent = get().getTotalMonthlyRent() * 12
    const managementFee = grossRent * (e.managementPercent / 100)

    return (
      e.municipalTax +
      e.schoolTax +
      e.insurance +
      e.electricity +
      e.heating +
      e.snowRemoval +
      e.maintenance +
      managementFee +
      e.otherExpenses
    )
  },

  getVacancyLoss: (vacancyRate = 0.05) => {
    return get().getTotalMonthlyRent() * 12 * vacancyRate
  },

  getNetOperatingIncome: (vacancyRate = 0.05) => {
    const grossRent = get().getTotalMonthlyRent() * 12
    const vacancyLoss = get().getVacancyLoss(vacancyRate)
    const expenses = get().getTotalAnnualExpenses()

    return grossRent - vacancyLoss - expenses
  },
})
