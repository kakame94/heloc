import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utilitaire pour combiner les classes Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un montant en devise canadienne
 */
export function formatCurrency(
  amount: number,
  options: {
    decimals?: number
    showSign?: boolean
    compact?: boolean
  } = {}
): string {
  const { decimals = 0, showSign = false, compact = false } = options

  if (compact && Math.abs(amount) >= 1000000) {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }

  const formatted = new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(amount))

  if (showSign && amount !== 0) {
    return amount > 0 ? `+${formatted}` : `-${formatted}`
  }

  return amount < 0 ? `-${formatted}` : formatted
}

/**
 * Formate un pourcentage
 */
export function formatPercent(
  value: number,
  options: {
    decimals?: number
    showSign?: boolean
  } = {}
): string {
  const { decimals = 2, showSign = false } = options

  if (!isFinite(value)) {
    return '∞'
  }

  const formatted = `${Math.abs(value).toFixed(decimals)}%`

  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}` : `-${formatted}`
  }

  return value < 0 ? `-${formatted}` : formatted
}

/**
 * Formate un nombre avec séparateurs de milliers
 */
export function formatNumber(
  value: number,
  options: {
    decimals?: number
  } = {}
): string {
  const { decimals = 0 } = options

  return new Intl.NumberFormat('fr-CA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formate une superficie en pieds carrés
 */
export function formatSqFt(value: number): string {
  return `${formatNumber(value)} pi²`
}

/**
 * Détermine la couleur selon si la valeur est positive ou négative
 */
export function getValueColor(value: number): 'profit' | 'loss' | 'neutral' {
  if (value > 0) return 'profit'
  if (value < 0) return 'loss'
  return 'neutral'
}

/**
 * Détermine la classe CSS pour une valeur de cashflow/ROI
 */
export function getValueColorClass(value: number): string {
  if (value > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (value < 0) return 'text-rose-600 dark:text-rose-400'
  return 'text-slate-600 dark:text-slate-400'
}

/**
 * Détermine la classe de fond pour une valeur
 */
export function getValueBgClass(value: number): string {
  if (value > 0) return 'bg-emerald-50 dark:bg-emerald-950/30'
  if (value < 0) return 'bg-rose-50 dark:bg-rose-950/30'
  return 'bg-slate-50 dark:bg-slate-800'
}

/**
 * Calcule la couleur de gradient pour une matrice de sensibilité
 * @param value - Valeur actuelle
 * @param min - Valeur minimum de la plage
 * @param max - Valeur maximum de la plage
 * @returns Classes Tailwind pour le background
 */
export function getSensitivityColor(value: number, min: number, max: number): string {
  if (!isFinite(value)) return 'bg-purple-100 dark:bg-purple-900/30' // Infinite return

  const range = max - min
  if (range === 0) return 'bg-slate-100 dark:bg-slate-800'

  const normalized = (value - min) / range

  if (normalized >= 0.8) return 'bg-emerald-500 text-white'
  if (normalized >= 0.6) return 'bg-emerald-300 dark:bg-emerald-700'
  if (normalized >= 0.4) return 'bg-yellow-200 dark:bg-yellow-800'
  if (normalized >= 0.2) return 'bg-orange-300 dark:bg-orange-700'
  return 'bg-rose-400 dark:bg-rose-700 text-white'
}

/**
 * Génère une plage de valeurs pour les sliders
 */
export function generateSliderRange(
  center: number,
  percentVariation: number,
  steps: number
): number[] {
  const min = center * (1 - percentVariation)
  const max = center * (1 + percentVariation)
  const step = (max - min) / (steps - 1)

  return Array.from({ length: steps }, (_, i) => Math.round(min + step * i))
}

/**
 * Debounce function pour les inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Valide un code postal canadien
 */
export function isValidPostalCode(code: string): boolean {
  const regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  return regex.test(code)
}

/**
 * Formate un code postal (ajoute espace au milieu)
 */
export function formatPostalCode(code: string): string {
  const cleaned = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  }
  return cleaned
}

/**
 * Calcule le nombre de mois entre deux dates
 */
export function monthsBetween(start: Date, end: Date): number {
  const years = end.getFullYear() - start.getFullYear()
  const months = end.getMonth() - start.getMonth()
  return years * 12 + months
}

/**
 * Génère une couleur de la palette pour les charts
 */
export function getChartColor(index: number): string {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]
  return colors[index % colors.length]
}
