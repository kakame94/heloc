/**
 * PlexInvest V2 - Schémas Zod pour le financement
 *
 * Validation stricte des données hypothécaires et de refinancement
 */

import { z } from 'zod'

export const MortgageSchema = z.object({
  loanAmount: z.number().positive('Le montant du prêt doit être positif'),
  downPaymentPercent: z.number().min(5, 'Mise de fonds minimum 5%').max(100),
  interestRate: z.number().min(0.01, 'Taux minimum 0.01%').max(15, 'Taux maximum 15%'),
  amortization: z.number().min(15, 'Amortissement minimum 15 ans').max(50, 'Amortissement maximum 50 ans'),
  term: z.number().int().min(1).max(10).default(5),
  isInsured: z.boolean(),
  isMliSelect: z.boolean().default(false),
})
  .refine(
    (data) => {
      // Règle B-20 : Si mise de fonds < 20%, amortissement max 25 ans
      if (data.downPaymentPercent < 20 && data.amortization > 25) {
        return false
      }
      return true
    },
    {
      message: "Amortissement max 25 ans pour prêt assuré (mise de fonds < 20%)",
      path: ['amortization']
    }
  )
  .refine(
    (data) => {
      // MLI Select uniquement pour conditions spéciales
      if (data.isMliSelect && data.downPaymentPercent < 5) {
        return false
      }
      return true
    },
    {
      message: "MLI Select requiert minimum 5% de mise de fonds",
      path: ['downPaymentPercent']
    }
  )

export const RefinanceSchema = z.object({
  targetLTV: z.number().min(50, 'LTV minimum 50%').max(80, 'LTV maximum 80%').default(75),
  newRate: z.number().min(0.01).max(15),
  newAmortization: z.number().min(15).max(30).default(25),
})

export const ClosingCostsSchema = z.object({
  welcomeTax: z.number().min(0),
  notaryFees: z.number().min(0),
  inspection: z.number().min(0),
  appraisal: z.number().min(0),
  titleInsurance: z.number().min(0),
  schlPremium: z.number().min(0),
  schlTVQ: z.number().min(0), // TVQ sur SCHL - NON finançable!
  other: z.number().min(0).default(0),
})

// Types inférés
export type Mortgage = z.infer<typeof MortgageSchema>
export type Refinance = z.infer<typeof RefinanceSchema>
export type ClosingCosts = z.infer<typeof ClosingCostsSchema>

// Schéma simplifié pour l'entrée utilisateur
export const MortgageInputSchema = z.object({
  purchasePrice: z.number().positive(),
  downPaymentPercent: z.number().min(5).max(100).default(20),
  interestRate: z.number().min(0.01).max(15).default(5),
  amortization: z.number().min(15).max(50).default(25),
  term: z.number().int().min(1).max(10).default(5),
})

export type MortgageInput = z.infer<typeof MortgageInputSchema>

// Helper pour créer un Mortgage à partir des inputs simplifiés
export function createMortgageFromInput(input: MortgageInput): Mortgage {
  const loanAmount = input.purchasePrice * (1 - input.downPaymentPercent / 100)
  const isInsured = input.downPaymentPercent < 20

  return {
    loanAmount,
    downPaymentPercent: input.downPaymentPercent,
    interestRate: input.interestRate,
    amortization: isInsured ? Math.min(input.amortization, 25) : input.amortization,
    term: input.term,
    isInsured,
    isMliSelect: false,
  }
}

// Calcul des frais de clôture estimés
export function estimateClosingCosts(
  purchasePrice: number,
  loanAmount: number,
  isInsured: boolean,
  city: 'montreal' | 'quebec' | 'other' = 'montreal'
): Partial<ClosingCosts> {
  // Estimations de base (calculs précis dans le moteur welcome-tax)
  return {
    welcomeTax: purchasePrice * 0.015, // ~1.5% estimation
    notaryFees: 2000,
    inspection: 600,
    appraisal: 400,
    titleInsurance: 350,
    schlPremium: isInsured ? loanAmount * 0.04 : 0, // ~4% estimation
    schlTVQ: isInsured ? loanAmount * 0.04 * 0.09975 : 0,
    other: 0,
  }
}

// Validation pour s'assurer que le LTV est cohérent
export function validateLTV(
  purchasePrice: number,
  downPaymentPercent: number
): { isValid: boolean; message?: string } {
  const ltv = 100 - downPaymentPercent

  if (ltv > 95) {
    return { isValid: false, message: 'LTV maximum 95% (mise de fonds minimum 5%)' }
  }

  if (ltv > 80 && ltv <= 95) {
    return {
      isValid: true,
      message: `Prêt assuré requis (SCHL) - LTV ${ltv.toFixed(1)}%`
    }
  }

  return { isValid: true }
}
