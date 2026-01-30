/**
 * PlexInvest Québec - Estimateur de Coûts de Rénovation
 *
 * Données de coûts basées sur le marché québécois 2025.
 * Sources: TD Reno, RénoAssistance, données de l'industrie.
 *
 * Ces coûts incluent matériaux et main-d'œuvre.
 */

import Decimal from 'decimal.js'
import type {
  RenovationCategory,
  RenovationTier,
  RenovationCostEstimate,
  RenovationBudget,
} from '@/types/financial'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Matrice des coûts de rénovation (Québec 2025)
 * Prix en dollars canadiens
 */
export const RENOVATION_COST_MATRIX: Record<
  RenovationCategory,
  {
    name: string
    unit: 'piece' | 'sqft' | 'item' | 'linear_ft'
    unitLabel: string
    tiers: Record<RenovationTier, { min: number; max: number; typical: number }>
    notes?: string
  }
> = {
  kitchen: {
    name: 'Cuisine complète',
    unit: 'piece',
    unitLabel: 'par cuisine',
    tiers: {
      ECONOMIC: { min: 15000, max: 20000, typical: 17500 },
      STANDARD: { min: 25000, max: 45000, typical: 35000 },
      PREMIUM: { min: 60000, max: 100000, typical: 75000 },
    },
    notes: 'Inclut armoires, comptoirs, appareils de base',
  },

  bathroom: {
    name: 'Salle de bain complète',
    unit: 'piece',
    unitLabel: 'par salle de bain',
    tiers: {
      ECONOMIC: { min: 10000, max: 15000, typical: 12500 },
      STANDARD: { min: 18000, max: 28000, typical: 23000 },
      PREMIUM: { min: 35000, max: 60000, typical: 45000 },
    },
    notes: 'Bain/douche, vanité, toilette, céramique',
  },

  flooring: {
    name: 'Revêtement de sol',
    unit: 'sqft',
    unitLabel: '/pi²',
    tiers: {
      ECONOMIC: { min: 4, max: 6, typical: 5 },
      STANDARD: { min: 7, max: 12, typical: 9 },
      PREMIUM: { min: 15, max: 25, typical: 18 },
    },
    notes: 'Économique=vinyle, Standard=bois flottant, Premium=bois franc',
  },

  painting: {
    name: 'Peinture intérieure',
    unit: 'sqft',
    unitLabel: '/pi² de surface murale',
    tiers: {
      ECONOMIC: { min: 2, max: 3, typical: 2.5 },
      STANDARD: { min: 4, max: 5, typical: 4.5 },
      PREMIUM: { min: 6, max: 8, typical: 7 },
    },
    notes: 'Surface murale ≈ 2.5x superficie habitable',
  },

  basement: {
    name: 'Finition sous-sol',
    unit: 'sqft',
    unitLabel: '/pi²',
    tiers: {
      ECONOMIC: { min: 40, max: 60, typical: 50 },
      STANDARD: { min: 60, max: 85, typical: 75 },
      PREMIUM: { min: 90, max: 130, typical: 100 },
    },
    notes: 'Inclut électricité de base, isolation, gypse',
  },

  roof: {
    name: 'Toiture (bardeaux asphalte)',
    unit: 'sqft',
    unitLabel: '/pi²',
    tiers: {
      ECONOMIC: { min: 6, max: 9, typical: 8 },
      STANDARD: { min: 10, max: 14, typical: 12 },
      PREMIUM: { min: 15, max: 22, typical: 18 },
    },
    notes: 'Économique=bardeau standard 25 ans, Premium=architectural 50 ans',
  },

  windows: {
    name: 'Fenêtres',
    unit: 'item',
    unitLabel: 'par fenêtre',
    tiers: {
      ECONOMIC: { min: 400, max: 600, typical: 500 },
      STANDARD: { min: 700, max: 1000, typical: 850 },
      PREMIUM: { min: 1200, max: 2000, typical: 1500 },
    },
    notes: 'Double vitrage Energy Star minimum',
  },

  electrical: {
    name: 'Mise à niveau électrique',
    unit: 'item',
    unitLabel: 'forfait',
    tiers: {
      ECONOMIC: { min: 3000, max: 5000, typical: 4000 },
      STANDARD: { min: 6000, max: 10000, typical: 8000 },
      PREMIUM: { min: 12000, max: 20000, typical: 15000 },
    },
    notes: 'Économique=mise à jour panneau, Premium=recâblage complet',
  },

  plumbing: {
    name: 'Plomberie',
    unit: 'item',
    unitLabel: 'forfait',
    tiers: {
      ECONOMIC: { min: 2500, max: 4000, typical: 3000 },
      STANDARD: { min: 5000, max: 10000, typical: 7500 },
      PREMIUM: { min: 12000, max: 25000, typical: 18000 },
    },
    notes: 'Économique=réparations, Premium=remplacement complet',
  },

  hvac: {
    name: 'Chauffage/Climatisation',
    unit: 'item',
    unitLabel: 'système',
    tiers: {
      ECONOMIC: { min: 4000, max: 6000, typical: 5000 },
      STANDARD: { min: 8000, max: 15000, typical: 12000 },
      PREMIUM: { min: 18000, max: 35000, typical: 25000 },
    },
    notes: 'Économique=plinthes, Standard=thermopompe, Premium=central',
  },

  exterior: {
    name: 'Revêtement extérieur',
    unit: 'sqft',
    unitLabel: '/pi²',
    tiers: {
      ECONOMIC: { min: 8, max: 12, typical: 10 },
      STANDARD: { min: 14, max: 20, typical: 17 },
      PREMIUM: { min: 25, max: 40, typical: 30 },
    },
    notes: 'Économique=vinyle, Standard=Canexel, Premium=brique/pierre',
  },

  other: {
    name: 'Autres travaux',
    unit: 'item',
    unitLabel: 'forfait',
    tiers: {
      ECONOMIC: { min: 1000, max: 3000, typical: 2000 },
      STANDARD: { min: 3000, max: 8000, typical: 5000 },
      PREMIUM: { min: 8000, max: 20000, typical: 12000 },
    },
    notes: 'Divers: portes, balcons, aménagement, etc.',
  },
}

/**
 * Calcule l'estimation de coût pour une catégorie de rénovation
 *
 * @param category - Type de rénovation
 * @param tier - Gamme de qualité
 * @param quantity - Quantité (pi², unités, etc.)
 * @returns Estimation détaillée
 */
export function estimateRenovationCost(
  category: RenovationCategory,
  tier: RenovationTier,
  quantity: number
): RenovationCostEstimate {
  const costData = RENOVATION_COST_MATRIX[category]
  if (!costData) {
    throw new Error(`Catégorie de rénovation inconnue: ${category}`)
  }

  const tierData = costData.tiers[tier]
  const unitCost = tierData.typical

  return {
    category,
    tier,
    quantity,
    unitCost,
    totalCost: new Decimal(unitCost).times(quantity).toDecimalPlaces(2).toNumber(),
  }
}

/**
 * Génère un budget de rénovation complet
 *
 * @param items - Liste des items à rénover
 * @param contingencyPercent - % de contingence (défaut 10%)
 * @returns Budget détaillé avec contingence
 */
export function generateRenovationBudget(
  items: Omit<RenovationCostEstimate, 'unitCost' | 'totalCost'>[],
  contingencyPercent: number = 10
): RenovationBudget {
  const estimates = items.map((item) =>
    estimateRenovationCost(item.category, item.tier, item.quantity)
  )

  const subtotal = estimates.reduce((sum, e) => sum + e.totalCost, 0)
  const contingencyAmount = new Decimal(subtotal)
    .times(contingencyPercent / 100)
    .toDecimalPlaces(2)
    .toNumber()

  return {
    items: estimates,
    subtotal,
    contingencyPercent,
    contingencyAmount,
    total: subtotal + contingencyAmount,
  }
}

/**
 * Estimateur rapide basé sur l'état général de la propriété
 * Utile pour une première approximation sans détails
 *
 * @param livingAreaSqFt - Superficie habitable
 * @param condition - État de la propriété
 * @param propertyType - Type de propriété
 * @returns Estimation rapide
 */
export type QuickEstimateCondition =
  | 'TURNKEY'      // Clé en main, rien à faire
  | 'COSMETIC'     // Cosmétique: peinture, plancher
  | 'MODERATE'     // Modéré: cuisine/sdb + cosmétique
  | 'EXTENSIVE'    // Extensif: tout à refaire
  | 'GUT_REHAB'    // Rénovation majeure complète

export interface QuickRenovationEstimate {
  condition: QuickEstimateCondition
  livingAreaSqFt: number
  estimatedCostLow: number
  estimatedCostHigh: number
  estimatedCostTypical: number
  costPerSqFt: { low: number; high: number; typical: number }
  scope: string[]
}

export function quickRenovationEstimate(
  livingAreaSqFt: number,
  condition: QuickEstimateCondition
): QuickRenovationEstimate {
  // Coûts par pi² selon niveau de rénovation
  const costPerSqFtByCondition: Record<
    QuickEstimateCondition,
    { low: number; high: number; typical: number; scope: string[] }
  > = {
    TURNKEY: {
      low: 0,
      high: 5,
      typical: 2,
      scope: ['Aucune rénovation requise', 'Possibles petites touches'],
    },
    COSMETIC: {
      low: 10,
      high: 25,
      typical: 18,
      scope: ['Peinture complète', 'Planchers', 'Luminaires'],
    },
    MODERATE: {
      low: 30,
      high: 55,
      typical: 42,
      scope: [
        'Peinture complète',
        'Planchers',
        'Cuisine standard',
        'Salle de bain standard',
      ],
    },
    EXTENSIVE: {
      low: 60,
      high: 90,
      typical: 75,
      scope: [
        'Cuisine haut de gamme',
        'Salles de bain refaites',
        'Électricité mise à niveau',
        'Plomberie mise à niveau',
        'Planchers',
        'Peinture',
      ],
    },
    GUT_REHAB: {
      low: 100,
      high: 175,
      typical: 130,
      scope: [
        'Démolition intérieure complète',
        'Structure si nécessaire',
        'Électricité neuve',
        'Plomberie neuve',
        'Isolation',
        'Tout nouveau',
      ],
    },
  }

  const costData = costPerSqFtByCondition[condition]

  return {
    condition,
    livingAreaSqFt,
    estimatedCostLow: Math.round(livingAreaSqFt * costData.low),
    estimatedCostHigh: Math.round(livingAreaSqFt * costData.high),
    estimatedCostTypical: Math.round(livingAreaSqFt * costData.typical),
    costPerSqFt: {
      low: costData.low,
      high: costData.high,
      typical: costData.typical,
    },
    scope: costData.scope,
  }
}

/**
 * Analyse les mots-clés d'une description d'annonce pour
 * suggérer le niveau de rénovation probable
 *
 * @param description - Texte de description de l'annonce
 * @returns Condition estimée et mots-clés détectés
 */
export function analyzeListingDescription(description: string): {
  suggestedCondition: QuickEstimateCondition
  detectedKeywords: string[]
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
} {
  const text = description.toLowerCase()
  const detectedKeywords: string[] = []

  // Mots-clés positifs (bon état)
  const turnkeyKeywords = [
    'rénové', 'renovated', 'neuf', 'impeccable', 'clé en main',
    'move-in ready', 'updated', 'moderne', 'refait',
  ]

  // Mots-clés négatifs (travaux requis)
  const rehabKeywords = [
    'à rénover', 'besoin d\'amour', 'potentiel', 'investor',
    'd\'origine', 'original', 'as is', 'handyman', 'rénover',
    'flip', 'projet', 'travaux', 'needs work',
  ]

  // Mots-clés modérés
  const moderateKeywords = [
    'quelques', 'some updates', 'certains travaux',
    'mise à jour', 'rafraîchir', 'dated', 'fonctionnel',
  ]

  let turnkeyScore = 0
  let rehabScore = 0
  let moderateScore = 0

  for (const kw of turnkeyKeywords) {
    if (text.includes(kw)) {
      turnkeyScore++
      detectedKeywords.push(kw)
    }
  }

  for (const kw of rehabKeywords) {
    if (text.includes(kw)) {
      rehabScore++
      detectedKeywords.push(kw)
    }
  }

  for (const kw of moderateKeywords) {
    if (text.includes(kw)) {
      moderateScore++
      detectedKeywords.push(kw)
    }
  }

  // Déterminer la condition
  let suggestedCondition: QuickEstimateCondition = 'MODERATE'
  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'

  if (rehabScore >= 2) {
    suggestedCondition = 'EXTENSIVE'
    confidence = rehabScore >= 3 ? 'HIGH' : 'MEDIUM'
  } else if (turnkeyScore >= 2) {
    suggestedCondition = 'TURNKEY'
    confidence = turnkeyScore >= 3 ? 'HIGH' : 'MEDIUM'
  } else if (moderateScore >= 1 || (turnkeyScore === 0 && rehabScore === 0)) {
    suggestedCondition = 'MODERATE'
    confidence = moderateScore >= 2 ? 'MEDIUM' : 'LOW'
  }

  return {
    suggestedCondition,
    detectedKeywords,
    confidence,
  }
}

/**
 * Calcule le retour sur investissement de la rénovation
 * ROI Rénos = (Augmentation de valeur - Coût rénos) / Coût rénos
 *
 * @param renovationCost - Coût total des rénovations
 * @param valueIncrease - Augmentation de valeur estimée
 * @returns ROI et analyse
 */
export function calculateRenovationROI(
  renovationCost: number,
  valueIncrease: number
): {
  roi: number
  netGain: number
  isPositive: boolean
  analysis: string
} {
  const netGain = valueIncrease - renovationCost
  const roi = renovationCost > 0 ? (netGain / renovationCost) * 100 : 0

  let analysis: string
  if (roi >= 50) {
    analysis = '🏆 Excellent ROI - Projet très rentable'
  } else if (roi >= 20) {
    analysis = '✓ Bon ROI - Projet valable'
  } else if (roi >= 0) {
    analysis = '○ ROI faible - Évaluer si valeur ajoutée non-financière'
  } else {
    analysis = '⚠️ ROI négatif - Rénos surpassent gain de valeur'
  }

  return {
    roi: Math.round(roi * 10) / 10,
    netGain,
    isPositive: roi > 0,
    analysis,
  }
}
