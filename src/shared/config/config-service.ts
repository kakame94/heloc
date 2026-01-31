/**
 * PlexInvest V2 - Service de Configuration Fiscale
 *
 * Charge et valide la configuration fiscale 2025 pour le Québec/Canada
 */

import { z } from 'zod'
import fiscalConfig from './fiscal-2025.json'

// Schéma de validation pour la configuration
const TaxBracketSchema = z.object({
  threshold: z.number().nullable(),
  rate: z.number().min(0).max(1),
})

const WelcomeTaxCitySchema = z.object({
  comparativeFactor: z.number().positive(),
  brackets: z.array(TaxBracketSchema),
})

const SCHLTierSchema = z.object({
  ltvMax: z.number().min(0).max(100),
  premium: z.number().min(0).max(0.1),
})

const FiscalConfigSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),

  welcomeTax: z.object({
    montreal: WelcomeTaxCitySchema,
    quebec: WelcomeTaxCitySchema,
    standard: WelcomeTaxCitySchema,
  }),

  schlPremiums: z.object({
    standard: z.array(SCHLTierSchema),
    surcharge30Years: z.number(),
    aphSelectDiscount: z.object({
      tier1: z.number(),
      tier2: z.number(),
      tier3: z.number(),
    }),
  }),

  stressTest: z.object({
    floorRate: z.number(),
    buffer: z.number(),
    minDSCR: z.number(),
  }),

  mliSelect: z.object({
    enabled: z.boolean(),
    maxAmortization: z.number(),
    maxLTV: z.number(),
    minUnits: z.number(),
  }),

  taxBrackets: z.object({
    federal2025: z.object({
      indexation: z.number(),
      brackets: z.array(TaxBracketSchema),
      quebecAbatement: z.number(),
    }),
    quebec2025: z.object({
      indexation: z.number(),
      brackets: z.array(TaxBracketSchema),
    }),
  }),

  talGuidance: z.object({
    rentIncreaseIndex2025: z.number(),
    maintenanceIndex: z.number(),
    taxesPassthrough: z.number(),
    minNoticeDays: z.number(),
  }),

  closingCosts: z.object({
    notaryFees: z.object({
      min: z.number(),
      max: z.number(),
    }),
    inspectionFee: z.number(),
    appraisalFee: z.number(),
    titleInsurance: z.number(),
    tvqOnSchlPremium: z.number(),
  }),

  defaults: z.object({
    vacancyRate: z.number(),
    managementFee: z.number(),
    maintenancePerDoor: z.number(),
    snowRemovalPerUnit: z.number(),
    insurancePerDoor: z.number(),
    rentGrowthRate: z.number(),
  }),
})

export type FiscalConfig = z.infer<typeof FiscalConfigSchema>

// Singleton pour la configuration validée
let validatedConfig: FiscalConfig | null = null

/**
 * Charge et valide la configuration fiscale
 * @throws Si la configuration est invalide
 */
export function getConfig(): FiscalConfig {
  if (!validatedConfig) {
    const result = FiscalConfigSchema.safeParse(fiscalConfig)

    if (!result.success) {
      console.error('Configuration fiscale invalide:', result.error.format())
      throw new Error(`Configuration fiscale invalide: ${result.error.message}`)
    }

    validatedConfig = result.data
  }

  return validatedConfig
}

/**
 * Récupère la configuration de taxe de bienvenue pour une ville
 */
export function getWelcomeTaxConfig(city: 'montreal' | 'quebec' | 'other' | 'standard') {
  const config = getConfig()
  const cityKey = city === 'other' ? 'standard' : city
  return config.welcomeTax[cityKey] || config.welcomeTax.standard
}

/**
 * Récupère le taux de prime SCHL pour un LTV donné
 */
export function getSCHLPremiumRate(ltvPercent: number, amortizationYears: number = 25): number {
  const config = getConfig()

  let premiumRate = 0
  for (const tier of config.schlPremiums.standard) {
    if (ltvPercent <= tier.ltvMax) {
      premiumRate = tier.premium
      break
    }
  }

  // Surcharge pour amortissement > 25 ans
  if (amortizationYears > 25) {
    premiumRate += config.schlPremiums.surcharge30Years
  }

  return premiumRate
}

/**
 * Calcule le taux qualifiant pour le stress test B-20
 */
export function getStressTestRate(contractRate: number): number {
  const config = getConfig()
  return Math.max(
    contractRate + config.stressTest.buffer,
    config.stressTest.floorRate
  )
}

/**
 * Vérifie si le DSCR respecte le minimum B-20
 */
export function isStressTestPassed(dscr: number): boolean {
  const config = getConfig()
  return dscr >= config.stressTest.minDSCR
}

/**
 * Récupère les frais de clôture par défaut
 */
export function getDefaultClosingCosts() {
  return getConfig().closingCosts
}

/**
 * Récupère les valeurs par défaut pour les calculs
 */
export function getDefaults() {
  return getConfig().defaults
}

/**
 * Récupère les paramètres TAL (Tribunal Administratif du Logement)
 */
export function getTALGuidance() {
  return getConfig().talGuidance
}

/**
 * Version de la configuration
 */
export function getConfigVersion(): string {
  return getConfig().version
}
