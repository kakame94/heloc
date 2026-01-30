'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Info, TrendingUp, TrendingDown, Infinity } from 'lucide-react'
import { cn, formatCurrency, formatPercent, getValueColorClass } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface KpiCardProps {
  label: string
  value: number
  format: 'currency' | 'percent' | 'number' | 'ratio'
  tooltip?: string
  showTrend?: boolean
  previousValue?: number
  isInfinite?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function KpiCard({
  label,
  value,
  format,
  tooltip,
  showTrend = false,
  previousValue,
  isInfinite = false,
  size = 'md',
  className,
}: KpiCardProps) {
  const formattedValue = React.useMemo(() => {
    if (isInfinite || !isFinite(value)) return '∞'

    switch (format) {
      case 'currency':
        return formatCurrency(value, { compact: size === 'sm' })
      case 'percent':
        return formatPercent(value)
      case 'ratio':
        return value.toFixed(2) + 'x'
      default:
        return value.toLocaleString('fr-CA')
    }
  }, [value, format, isInfinite, size])

  const trend = React.useMemo(() => {
    if (!showTrend || previousValue === undefined) return null
    const change = value - previousValue
    const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0
    return { change, percentChange, isPositive: change >= 0 }
  }, [value, previousValue, showTrend])

  const valueColorClass = isInfinite
    ? 'text-gradient-infinite'
    : getValueColorClass(value)

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border bg-card shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="kpi-label">{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <motion.span
          key={formattedValue}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            'font-bold font-tabular tracking-tight',
            valueSizeClasses[size],
            valueColorClass
          )}
        >
          {isInfinite ? (
            <span className="flex items-center gap-1">
              <Infinity className="h-8 w-8" />
              <span className="text-lg">Return</span>
            </span>
          ) : (
            formattedValue
          )}
        </motion.span>
      </div>

      {trend && (
        <div
          className={cn(
            'mt-2 flex items-center gap-1 text-sm',
            trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
          )}
        >
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="font-tabular">
            {trend.isPositive ? '+' : ''}
            {formatPercent(trend.percentChange)}
          </span>
        </div>
      )}
    </motion.div>
  )
}

/**
 * Grille de KPIs principaux pour le dashboard BRRRR
 */
interface KpiGridProps {
  cashOnCash: number
  monthlyCashflow: number
  refinanceCashOut: number
  capRate: number
  isInfiniteReturn: boolean
  dcr?: number
  className?: string
}

export function KpiGrid({
  cashOnCash,
  monthlyCashflow,
  refinanceCashOut,
  capRate,
  isInfiniteReturn,
  dcr,
  className,
}: KpiGridProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      <KpiCard
        label="Cash-on-Cash"
        value={cashOnCash}
        format="percent"
        isInfinite={isInfiniteReturn}
        tooltip="Rendement annuel sur le capital investi. Un retour infini signifie que tout le capital initial a été récupéré au refinancement."
        size="lg"
      />

      <KpiCard
        label="Cashflow Mensuel"
        value={monthlyCashflow}
        format="currency"
        tooltip="Revenu net après paiement de l'hypothèque et toutes les charges."
        size="lg"
      />

      <KpiCard
        label="Cash-Out au Refi"
        value={refinanceCashOut}
        format="currency"
        tooltip="Montant récupéré au refinancement après remboursement des dettes."
        size="lg"
      />

      <KpiCard
        label="Taux de Capitalisation"
        value={capRate}
        format="percent"
        tooltip="NOI annuel divisé par la valeur après rénovations (ARV). Mesure le rendement intrinsèque de la propriété."
        size="lg"
      />

      {dcr !== undefined && dcr > 0 && (
        <KpiCard
          label="DCR"
          value={dcr}
          format="ratio"
          tooltip="Debt Coverage Ratio: NOI / Service de la dette. Minimum 1.25x requis pour financement commercial."
          size="md"
          className="md:col-span-2 lg:col-span-1"
        />
      )}
    </div>
  )
}
