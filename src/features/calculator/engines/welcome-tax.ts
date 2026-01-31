/**
 * PlexInvest V2 - Moteur de calcul de la taxe de bienvenue
 *
 * Calcule les droits de mutation immobilière selon les barèmes
 * Montréal 2025, Québec 2025, et Standard
 */

import { getWelcomeTaxConfig } from '@/shared/config/config-service'

export interface WelcomeTaxResult {
  taxableBase: number
  totalTax: number
  breakdown: {
    bracketRange: string
    rate: number
    amount: number
  }[]
  city: string
  comparativeFactor: number
  explanation: string
}

/**
 * Calcule la taxe de bienvenue (droits de mutation)
 *
 * La base imposable est le MAXIMUM entre:
 * 1. Le prix de vente
 * 2. L'évaluation municipale × facteur comparatif
 *
 * À Montréal, le facteur comparatif est de 1.08 (2025)
 *
 * @param purchasePrice - Prix d'achat
 * @param municipalAssessment - Évaluation municipale (optionnel)
 * @param city - Ville ('montreal', 'quebec', ou 'other')
 */
export function calculateWelcomeTax(
  purchasePrice: number,
  municipalAssessment: number | undefined,
  city: 'montreal' | 'quebec' | 'other'
): WelcomeTaxResult {
  const cityConfig = getWelcomeTaxConfig(city)

  // Base imposable = MAX(prix, évaluation × facteur comparatif)
  const adjustedAssessment = municipalAssessment
    ? municipalAssessment * cityConfig.comparativeFactor
    : 0
  const taxableBase = Math.max(purchasePrice, adjustedAssessment)

  let totalTax = 0
  let remaining = taxableBase
  let previousThreshold = 0
  const breakdown: WelcomeTaxResult['breakdown'] = []

  for (const bracket of cityConfig.brackets) {
    if (remaining <= 0) break

    const threshold = bracket.threshold ?? Infinity

    const bracketAmount =
      threshold === Infinity
        ? remaining
        : Math.min(remaining, threshold - previousThreshold)

    const taxForBracket = bracketAmount * bracket.rate
    totalTax += taxForBracket

    if (bracketAmount > 0) {
      breakdown.push({
        bracketRange:
          threshold === Infinity
            ? `${formatCurrency(previousThreshold)}+ `
            : `${formatCurrency(previousThreshold)} - ${formatCurrency(threshold)}`,
        rate: bracket.rate * 100,
        amount: Math.round(taxForBracket),
      })
    }

    remaining -= bracketAmount
    previousThreshold = threshold
  }

  // Générer l'explication
  let explanation = `Base imposable: ${formatCurrency(taxableBase)}`
  if (municipalAssessment && adjustedAssessment > purchasePrice) {
    explanation += ` (évaluation ${formatCurrency(municipalAssessment)} × ${cityConfig.comparativeFactor} = ${formatCurrency(adjustedAssessment)})`
  }

  return {
    taxableBase: Math.round(taxableBase),
    totalTax: Math.round(totalTax),
    breakdown,
    city: getCityName(city),
    comparativeFactor: cityConfig.comparativeFactor,
    explanation,
  }
}

/**
 * Estime la taxe de bienvenue rapidement (sans détails)
 */
export function estimateWelcomeTax(
  purchasePrice: number,
  city: 'montreal' | 'quebec' | 'other' = 'montreal'
): number {
  const result = calculateWelcomeTax(purchasePrice, undefined, city)
  return result.totalTax
}

/**
 * Vérifie si une propriété est dans une zone à surtaxe (Montréal 4%)
 */
export function isHighValueProperty(
  purchasePrice: number,
  city: 'montreal' | 'quebec' | 'other'
): boolean {
  // À Montréal, les propriétés > 3.113M ont une tranche à 4%
  return city === 'montreal' && purchasePrice > 3113000
}

/**
 * Calcule la différence de taxe entre deux villes
 */
export function compareCityTaxes(
  purchasePrice: number,
  city1: 'montreal' | 'quebec' | 'other',
  city2: 'montreal' | 'quebec' | 'other'
): {
  city1Tax: number
  city2Tax: number
  difference: number
  cheaper: string
} {
  const tax1 = estimateWelcomeTax(purchasePrice, city1)
  const tax2 = estimateWelcomeTax(purchasePrice, city2)

  return {
    city1Tax: tax1,
    city2Tax: tax2,
    difference: Math.abs(tax1 - tax2),
    cheaper: tax1 < tax2 ? getCityName(city1) : getCityName(city2),
  }
}

// Helpers
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getCityName(city: 'montreal' | 'quebec' | 'other'): string {
  switch (city) {
    case 'montreal':
      return 'Montréal'
    case 'quebec':
      return 'Québec'
    default:
      return 'Autre municipalité'
  }
}
