/**
 * PlexInvest Québec - Calcul des Droits de Mutation (Taxe de Bienvenue)
 *
 * Les droits de mutation immobilière varient selon la municipalité.
 * Montréal a des tranches additionnelles pour les propriétés > 500k$.
 * Ces données sont à jour pour 2025.
 */

import Decimal from 'decimal.js'
import type { MunicipalityCode, MunicipalityTransferTax, TransferTaxBracket } from '@/types/financial'

// Configuration Decimal.js
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Grilles de taxation par municipalité (2025)
 * Source: Données municipales officielles
 */
export const TRANSFER_TAX_TABLES: Record<MunicipalityCode, MunicipalityTransferTax> = {
  MONTREAL: {
    code: 'MONTREAL',
    name: 'Montréal',
    brackets: [
      { min: 0, max: 58900, rate: 0.005 },           // 0.5%
      { min: 58900, max: 294500, rate: 0.01 },       // 1.0%
      { min: 294500, max: 500000, rate: 0.015 },     // 1.5%
      { min: 500000, max: 1000000, rate: 0.02 },     // 2.0%
      { min: 1000000, max: 2000000, rate: 0.025 },   // 2.5%
      { min: 2000000, max: Infinity, rate: 0.03 },   // 3.0%
    ],
    additionalRates: [
      // Droit supplétif pour immeubles > 2 136 600$ (2025)
      { threshold: 2136600, rate: 0.005 }, // 0.5% additionnel
    ],
  },

  QUEBEC_CITY: {
    code: 'QUEBEC_CITY',
    name: 'Québec',
    brackets: [
      { min: 0, max: 55200, rate: 0.005 },
      { min: 55200, max: 276200, rate: 0.01 },
      { min: 276200, max: 500000, rate: 0.015 },
      { min: 500000, max: Infinity, rate: 0.02 },
    ],
  },

  LAVAL: {
    code: 'LAVAL',
    name: 'Laval',
    brackets: [
      { min: 0, max: 55200, rate: 0.005 },
      { min: 55200, max: 276200, rate: 0.01 },
      { min: 276200, max: 500000, rate: 0.015 },
      { min: 500000, max: Infinity, rate: 0.02 },
    ],
  },

  LONGUEUIL: {
    code: 'LONGUEUIL',
    name: 'Longueuil',
    brackets: [
      { min: 0, max: 55200, rate: 0.005 },
      { min: 55200, max: 276200, rate: 0.01 },
      { min: 276200, max: 500000, rate: 0.015 },
      { min: 500000, max: Infinity, rate: 0.02 },
    ],
  },

  GATINEAU: {
    code: 'GATINEAU',
    name: 'Gatineau',
    brackets: [
      { min: 0, max: 55200, rate: 0.005 },
      { min: 55200, max: 276200, rate: 0.01 },
      { min: 276200, max: Infinity, rate: 0.015 },
    ],
  },

  SHERBROOKE: {
    code: 'SHERBROOKE',
    name: 'Sherbrooke',
    brackets: [
      { min: 0, max: 55200, rate: 0.005 },
      { min: 55200, max: 276200, rate: 0.01 },
      { min: 276200, max: Infinity, rate: 0.015 },
    ],
  },

  TROIS_RIVIERES: {
    code: 'TROIS_RIVIERES',
    name: 'Trois-Rivières',
    brackets: [
      { min: 0, max: 55200, rate: 0.005 },
      { min: 55200, max: 276200, rate: 0.01 },
      { min: 276200, max: Infinity, rate: 0.015 },
    ],
  },

  // Grille provinciale par défaut pour autres municipalités
  OTHER_QC: {
    code: 'OTHER_QC',
    name: 'Autre (Québec)',
    brackets: [
      { min: 0, max: 55200, rate: 0.005 },
      { min: 55200, max: 276200, rate: 0.01 },
      { min: 276200, max: Infinity, rate: 0.015 },
    ],
  },
}

/**
 * Calcule les droits de mutation (taxe de bienvenue)
 * Applique les tranches progressives selon la municipalité
 *
 * @param purchasePrice - Prix d'achat ou valeur marchande (le plus élevé)
 * @param municipality - Code de la municipalité
 * @returns Montant total des droits de mutation
 */
export function calculateTransferTax(
  purchasePrice: number,
  municipality: MunicipalityCode = 'OTHER_QC'
): number {
  const taxTable = TRANSFER_TAX_TABLES[municipality]
  if (!taxTable) {
    throw new Error(`Municipalité non supportée: ${municipality}`)
  }

  let totalTax = new Decimal(0)
  let remainingValue = new Decimal(purchasePrice)

  // Appliquer chaque tranche
  for (const bracket of taxTable.brackets) {
    if (remainingValue.lte(0)) break

    const bracketMin = new Decimal(bracket.min)
    const bracketMax = new Decimal(bracket.max === Infinity ? Number.MAX_SAFE_INTEGER : bracket.max)
    const bracketWidth = bracketMax.minus(bracketMin)

    // Montant dans cette tranche
    const amountInBracket = Decimal.min(
      remainingValue.minus(bracketMin).greaterThan(0) ? remainingValue.minus(bracketMin) : new Decimal(0),
      bracketWidth
    )

    if (amountInBracket.greaterThan(0) && new Decimal(purchasePrice).greaterThan(bracketMin)) {
      // Calculer la portion taxable dans cette tranche
      const taxableInBracket = Decimal.min(
        new Decimal(purchasePrice).minus(bracketMin),
        bracketWidth
      )

      if (taxableInBracket.greaterThan(0)) {
        totalTax = totalTax.plus(taxableInBracket.times(bracket.rate))
      }
    }
  }

  // Recalcul plus simple et correct
  totalTax = new Decimal(0)
  let previousMax = 0

  for (const bracket of taxTable.brackets) {
    if (purchasePrice <= bracket.min) break

    const taxableAmount = Math.min(purchasePrice, bracket.max === Infinity ? purchasePrice : bracket.max) - bracket.min
    if (taxableAmount > 0) {
      totalTax = totalTax.plus(new Decimal(taxableAmount).times(bracket.rate))
    }
  }

  // Ajouter les droits supplémentaires si applicable (Montréal)
  if (taxTable.additionalRates) {
    for (const additional of taxTable.additionalRates) {
      if (purchasePrice > additional.threshold) {
        const additionalAmount = new Decimal(purchasePrice - additional.threshold)
        totalTax = totalTax.plus(additionalAmount.times(additional.rate))
      }
    }
  }

  return totalTax.toDecimalPlaces(2).toNumber()
}

/**
 * Génère le détail des droits de mutation par tranche
 * Utile pour afficher le breakdown dans l'interface
 *
 * @param purchasePrice - Prix d'achat
 * @param municipality - Code de la municipalité
 * @returns Détail par tranche
 */
export interface TransferTaxBreakdown {
  municipality: string
  purchasePrice: number
  brackets: {
    range: string
    rate: string
    taxableAmount: number
    tax: number
  }[]
  additionalTax: number
  totalTax: number
}

export function getTransferTaxBreakdown(
  purchasePrice: number,
  municipality: MunicipalityCode = 'OTHER_QC'
): TransferTaxBreakdown {
  const taxTable = TRANSFER_TAX_TABLES[municipality]
  const brackets: TransferTaxBreakdown['brackets'] = []
  let additionalTax = 0

  for (const bracket of taxTable.brackets) {
    if (purchasePrice <= bracket.min) break

    const taxableAmount = Math.min(
      purchasePrice,
      bracket.max === Infinity ? purchasePrice : bracket.max
    ) - bracket.min

    if (taxableAmount > 0) {
      const tax = taxableAmount * bracket.rate
      brackets.push({
        range: bracket.max === Infinity
          ? `${formatCurrency(bracket.min)}+`
          : `${formatCurrency(bracket.min)} - ${formatCurrency(bracket.max)}`,
        rate: `${(bracket.rate * 100).toFixed(1)}%`,
        taxableAmount,
        tax,
      })
    }
  }

  // Droits supplémentaires
  if (taxTable.additionalRates) {
    for (const additional of taxTable.additionalRates) {
      if (purchasePrice > additional.threshold) {
        additionalTax += (purchasePrice - additional.threshold) * additional.rate
      }
    }
  }

  const totalTax = brackets.reduce((sum, b) => sum + b.tax, 0) + additionalTax

  return {
    municipality: taxTable.name,
    purchasePrice,
    brackets,
    additionalTax,
    totalTax,
  }
}

/**
 * Formatte un montant en devise canadienne
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Détermine la municipalité à partir d'un code postal
 * Mapping simplifié des premiers caractères
 *
 * @param postalCode - Code postal canadien
 * @returns Code de municipalité
 */
export function getMunicipalityFromPostalCode(postalCode: string): MunicipalityCode {
  const prefix = postalCode.toUpperCase().substring(0, 3)

  // Montréal: H1A à H9Z (île de Montréal)
  if (prefix.startsWith('H')) {
    // Laval: H7
    if (prefix.startsWith('H7')) return 'LAVAL'
    return 'MONTREAL'
  }

  // Québec: G1, G2
  if (prefix.startsWith('G1') || prefix.startsWith('G2')) {
    return 'QUEBEC_CITY'
  }

  // Gatineau: J8, J9
  if (prefix.startsWith('J8') || prefix.startsWith('J9')) {
    return 'GATINEAU'
  }

  // Longueuil / Rive-Sud: J4
  if (prefix.startsWith('J4')) {
    return 'LONGUEUIL'
  }

  // Sherbrooke: J1
  if (prefix.startsWith('J1')) {
    return 'SHERBROOKE'
  }

  // Trois-Rivières: G8, G9
  if (prefix.startsWith('G8') || prefix.startsWith('G9')) {
    return 'TROIS_RIVIERES'
  }

  return 'OTHER_QC'
}
