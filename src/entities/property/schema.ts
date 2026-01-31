/**
 * PlexInvest V2 - Schémas Zod pour les propriétés
 *
 * Validation stricte des données immobilières
 */

import { z } from 'zod'

// Regex pour code postal canadien
const POSTAL_CODE_REGEX = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i

export const AddressSchema = z.object({
  street: z.string().min(5, 'Adresse requise (minimum 5 caractères)'),
  city: z.enum(['montreal', 'quebec', 'other']),
  postalCode: z.string().regex(POSTAL_CODE_REGEX, 'Code postal invalide (ex: H2X 1Y4)').optional(),
  municipalAssessment: z.number().positive().optional(),
})

export const UnitSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['studio', '1cc', '2cc', '3cc', '4cc+', 'commercial']),
  currentRent: z.number().min(0, 'Le loyer ne peut pas être négatif'),
  marketRent: z.number().min(0, 'Le loyer marché ne peut pas être négatif'),
  sqft: z.number().positive().optional(),
  isVacant: z.boolean().default(false),
})

export const ExpensesSchema = z.object({
  municipalTax: z.number().min(0, 'Les taxes municipales ne peuvent pas être négatives'),
  schoolTax: z.number().min(0, 'Les taxes scolaires ne peuvent pas être négatives'),
  insurance: z.number().min(0, 'L\'assurance ne peut pas être négative'),
  electricity: z.number().min(0).default(0),
  heating: z.number().min(0).default(0),
  snowRemoval: z.number().min(0).default(0),
  maintenance: z.number().min(0),
  managementPercent: z.number().min(0).max(15).default(0),
  otherExpenses: z.number().min(0).default(0),
})
  .refine(
    (data) => data.managementPercent > 0 || true,
    {
      message: "⚠️ Gestion à 0% = Vous achetez un emploi, pas un investissement",
      path: ['managementPercent']
    }
  )

export const PropertySchema = z.object({
  id: z.string().uuid(),
  address: AddressSchema,
  propertyType: z.enum(['duplex', 'triplex', 'quadruplex', 'quintuplex', 'sixplex', 'multilogement']),
  yearBuilt: z.number().min(1800).max(new Date().getFullYear()),
  numberOfUnits: z.number().int().min(2).max(100),
  units: z.array(UnitSchema),
  expenses: ExpensesSchema,

  // Prix et rénovations
  purchasePrice: z.number().positive('Le prix d\'achat doit être positif'),
  renovationBudget: z.number().min(0).default(0),
  renovationDuration: z.number().min(0).max(24).default(0), // mois
  afterRepairValue: z.number().positive('La valeur après rénovation doit être positive'),
})

// Types inférés des schémas
export type Address = z.infer<typeof AddressSchema>
export type Unit = z.infer<typeof UnitSchema>
export type Expenses = z.infer<typeof ExpensesSchema>
export type Property = z.infer<typeof PropertySchema>

// Schéma simplifié pour l'entrée de données (sans ID, sans units détaillées)
export const PropertyInputSchema = z.object({
  address: z.string().min(5, 'Adresse requise'),
  city: z.enum(['montreal', 'quebec', 'other']).default('montreal'),
  propertyType: z.enum(['duplex', 'triplex', 'quadruplex', 'quintuplex', 'sixplex', 'multilogement']),
  numberOfUnits: z.number().int().min(2).max(100),
  purchasePrice: z.number().positive(),
  monthlyRents: z.array(z.number().min(0)),
  municipalTax: z.number().min(0),
  schoolTax: z.number().min(0),
  insurance: z.number().min(0),
  renovationBudget: z.number().min(0).default(0),
  renovationDuration: z.number().min(0).max(24).default(0),
  afterRepairValue: z.number().positive().optional(),
})

export type PropertyInput = z.infer<typeof PropertyInputSchema>

// Helper pour créer une propriété à partir des données simplifiées
export function createPropertyFromInput(input: PropertyInput): Property {
  const units: Unit[] = input.monthlyRents.map((rent) => ({
    id: crypto.randomUUID(),
    type: '3cc' as const, // Défaut
    currentRent: rent,
    marketRent: rent * 1.05, // +5% potentiel
    isVacant: false,
  }))

  return {
    id: crypto.randomUUID(),
    address: {
      street: input.address,
      city: input.city,
    },
    propertyType: input.propertyType,
    yearBuilt: 1980, // Défaut
    numberOfUnits: input.numberOfUnits,
    units,
    expenses: {
      municipalTax: input.municipalTax,
      schoolTax: input.schoolTax,
      insurance: input.insurance,
      electricity: 0,
      heating: 0,
      snowRemoval: input.numberOfUnits * 200, // 200$/porte
      maintenance: input.numberOfUnits * 500, // 500$/porte
      managementPercent: 8,
      otherExpenses: 0,
    },
    purchasePrice: input.purchasePrice,
    renovationBudget: input.renovationBudget,
    renovationDuration: input.renovationDuration,
    afterRepairValue: input.afterRepairValue || input.purchasePrice + input.renovationBudget * 1.5,
  }
}
