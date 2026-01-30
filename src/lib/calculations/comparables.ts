/**
 * PlexInvest Québec - Analyse des Comparables
 *
 * Basé sur le modèle "Créateur de plex - Walkens"
 * Permet d'analyser une propriété sujet contre 3 comparables
 * et de calculer les multiplicateurs (MRB, MRN, Prix par porte)
 */

import Decimal from 'decimal.js'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Structure d'une propriété comparable
 */
export interface ComparableProperty {
  address: string
  referenceNumber?: string
  numberOfUnits: number
  salePrice: number
  monthlyRents: number[] // Loyers par logement
  annualExpenses: {
    municipalTax: number
    schoolTax: number
    electricity?: number
    heating?: number
    gas?: number
    insurance: number
    telecom?: number
    snowRemoval?: number
    janitor?: number
    maintenance?: number
    management?: number
  }
}

/**
 * Multiplicateurs calculés pour une propriété
 */
export interface PropertyMultipliers {
  // Multiplicateur de Revenus Brut (MRB) = Prix / Revenus Bruts Annuels
  grossRentMultiplier: number
  // Multiplicateur de Revenus Nets (MRN) = Prix / NOI
  netIncomeMultiplier: number
  // Prix par Porte (PPP)
  pricePerDoor: number
  // Revenus mensuels totaux
  totalMonthlyRent: number
  // Revenus annuels bruts
  grossAnnualIncome: number
  // Dépenses annuelles totales
  totalAnnualExpenses: number
  // NOI (Net Operating Income)
  annualNOI: number
}

/**
 * Résultat de l'analyse comparative
 */
export interface ComparableAnalysisResult {
  subject: PropertyMultipliers
  comparables: PropertyMultipliers[]
  averages: {
    grossRentMultiplier: number
    netIncomeMultiplier: number
    pricePerDoor: number
    totalMonthlyRent: number
  }
  estimatedValues: {
    // Valeur estimée par MRB (revenus bruts du sujet × MRB moyen)
    byGrossRentMultiplier: number
    // Valeur estimée par MRN (NOI du sujet × MRN moyen)
    byNetIncomeMultiplier: number
    // Valeur estimée par PPP (nombre de portes × PPP moyen)
    byPricePerDoor: number
    // Moyenne des 3 estimations
    averageEstimate: number
  }
  // Écart entre le prix demandé et la valeur estimée
  priceVariance: {
    amount: number
    percent: number
    isOverpriced: boolean
  }
}

/**
 * Calcule les multiplicateurs pour une propriété
 */
export function calculatePropertyMultipliers(property: ComparableProperty): PropertyMultipliers {
  const totalMonthlyRent = property.monthlyRents.reduce((sum, rent) => sum + rent, 0)
  const grossAnnualIncome = totalMonthlyRent * 12

  const expenses = property.annualExpenses
  const totalAnnualExpenses =
    (expenses.municipalTax || 0) +
    (expenses.schoolTax || 0) +
    (expenses.electricity || 0) +
    (expenses.heating || 0) +
    (expenses.gas || 0) +
    (expenses.insurance || 0) +
    (expenses.telecom || 0) +
    (expenses.snowRemoval || 0) +
    (expenses.janitor || 0) +
    (expenses.maintenance || 0) +
    (expenses.management || 0)

  const annualNOI = grossAnnualIncome - totalAnnualExpenses

  const grossRentMultiplier = grossAnnualIncome > 0
    ? new Decimal(property.salePrice).div(grossAnnualIncome).toNumber()
    : 0

  const netIncomeMultiplier = annualNOI > 0
    ? new Decimal(property.salePrice).div(annualNOI).toNumber()
    : 0

  const pricePerDoor = property.numberOfUnits > 0
    ? new Decimal(property.salePrice).div(property.numberOfUnits).toNumber()
    : 0

  return {
    grossRentMultiplier,
    netIncomeMultiplier,
    pricePerDoor,
    totalMonthlyRent,
    grossAnnualIncome,
    totalAnnualExpenses,
    annualNOI,
  }
}

/**
 * Analyse complète avec comparables
 * Compare une propriété sujet à 1-3 propriétés comparables
 */
export function analyzeWithComparables(
  subject: ComparableProperty,
  comparables: ComparableProperty[]
): ComparableAnalysisResult {
  const subjectMetrics = calculatePropertyMultipliers(subject)
  const comparableMetrics = comparables.map(calculatePropertyMultipliers)

  // Moyennes des comparables
  const avgGRM = comparableMetrics.length > 0
    ? comparableMetrics.reduce((sum, c) => sum + c.grossRentMultiplier, 0) / comparableMetrics.length
    : 0

  const avgNIM = comparableMetrics.length > 0
    ? comparableMetrics.reduce((sum, c) => sum + c.netIncomeMultiplier, 0) / comparableMetrics.length
    : 0

  const avgPPD = comparableMetrics.length > 0
    ? comparableMetrics.reduce((sum, c) => sum + c.pricePerDoor, 0) / comparableMetrics.length
    : 0

  const avgRent = comparableMetrics.length > 0
    ? comparableMetrics.reduce((sum, c) => sum + c.totalMonthlyRent, 0) / comparableMetrics.length
    : 0

  // Valeurs estimées basées sur les moyennes des comparables
  const estimatedByGRM = subjectMetrics.grossAnnualIncome * avgGRM
  const estimatedByNIM = subjectMetrics.annualNOI * avgNIM
  const estimatedByPPD = subject.numberOfUnits * avgPPD

  const validEstimates = [estimatedByGRM, estimatedByNIM, estimatedByPPD].filter(v => v > 0)
  const averageEstimate = validEstimates.length > 0
    ? validEstimates.reduce((sum, v) => sum + v, 0) / validEstimates.length
    : 0

  // Écart de prix
  const priceVarianceAmount = subject.salePrice - averageEstimate
  const priceVariancePercent = averageEstimate > 0
    ? (priceVarianceAmount / averageEstimate) * 100
    : 0

  return {
    subject: subjectMetrics,
    comparables: comparableMetrics,
    averages: {
      grossRentMultiplier: avgGRM,
      netIncomeMultiplier: avgNIM,
      pricePerDoor: avgPPD,
      totalMonthlyRent: avgRent,
    },
    estimatedValues: {
      byGrossRentMultiplier: estimatedByGRM,
      byNetIncomeMultiplier: estimatedByNIM,
      byPricePerDoor: estimatedByPPD,
      averageEstimate,
    },
    priceVariance: {
      amount: priceVarianceAmount,
      percent: priceVariancePercent,
      isOverpriced: priceVarianceAmount > 0,
    },
  }
}

/**
 * Données d'exemple basées sur le fichier Walkens
 * 68 Rue Lucienne-Bourgeois, Gatineau (Sujet)
 */
export const EXAMPLE_SUBJECT: ComparableProperty = {
  address: '68 Rue Lucienne-Bourgeois, Gatineau',
  referenceNumber: '18643031',
  numberOfUnits: 2,
  salePrice: 445000,
  monthlyRents: [1150, 1720],
  annualExpenses: {
    municipalTax: 3008,
    schoolTax: 355,
    insurance: 1200,
  },
}

/**
 * Comparables d'exemple du fichier Walkens
 */
export const EXAMPLE_COMPARABLES: ComparableProperty[] = [
  {
    address: '48 Rue Lucienne-Bourgeois, Gatineau',
    referenceNumber: '13043171',
    numberOfUnits: 2,
    salePrice: 514000,
    monthlyRents: [2000, 850],
    annualExpenses: {
      municipalTax: 3181,
      schoolTax: 220,
      insurance: 1200,
    },
  },
  {
    address: '181 Rue Brian, Gatineau',
    referenceNumber: '17888488',
    numberOfUnits: 2,
    salePrice: 530000,
    monthlyRents: [1600, 1500],
    annualExpenses: {
      municipalTax: 2909,
      schoolTax: 240,
      electricity: 1291,
      insurance: 1200,
    },
  },
  {
    address: '8 Rue Marlene-Goyet, Gatineau',
    referenceNumber: '19544030',
    numberOfUnits: 2,
    salePrice: 500999,
    monthlyRents: [1500, 880],
    annualExpenses: {
      municipalTax: 3150,
      schoolTax: 232,
      insurance: 1200,
    },
  },
]
