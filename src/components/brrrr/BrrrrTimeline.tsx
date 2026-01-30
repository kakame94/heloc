'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  Hammer,
  Key,
  Building2,
  CheckCircle2,
  DollarSign,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TimelinePhase {
  id: string
  name: string
  startMonth: number
  endMonth: number
  cashflow: number // Cashflow pendant cette phase (négatif pendant travaux)
  icon: React.ElementType
  color: string
  bgColor: string
}

interface BrrrrTimelineProps {
  acquisitionMonth?: number
  renovationMonths: number
  rentingMonth?: number // Mois où locataires entrent
  refinanceMonth?: number
  monthlyCashflowDuringReno: number // Coût mensuel pendant travaux
  monthlyCashflowAfterRefi: number // Cashflow après refinancement
  totalInvestment: number
  cashOutAtRefi: number
  className?: string
}

export function BrrrrTimeline({
  acquisitionMonth = 0,
  renovationMonths,
  rentingMonth,
  refinanceMonth,
  monthlyCashflowDuringReno,
  monthlyCashflowAfterRefi,
  totalInvestment,
  cashOutAtRefi,
  className,
}: BrrrrTimelineProps) {
  // Calculer les phases
  const phases: TimelinePhase[] = React.useMemo(() => {
    const renting = rentingMonth ?? renovationMonths + 1
    const refi = refinanceMonth ?? renovationMonths + 2

    return [
      {
        id: 'acquisition',
        name: 'Achat',
        startMonth: acquisitionMonth,
        endMonth: acquisitionMonth,
        cashflow: -totalInvestment,
        icon: Home,
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
      },
      {
        id: 'renovation',
        name: 'Rénovation',
        startMonth: acquisitionMonth,
        endMonth: renovationMonths,
        cashflow: monthlyCashflowDuringReno * renovationMonths,
        icon: Hammer,
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
      },
      {
        id: 'renting',
        name: 'Location',
        startMonth: renting,
        endMonth: refi - 1,
        cashflow: 0, // Court délai, souvent 0
        icon: Key,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
      },
      {
        id: 'refinance',
        name: 'Refinancement',
        startMonth: refi,
        endMonth: refi,
        cashflow: cashOutAtRefi,
        icon: Building2,
        color: 'text-purple-600',
        bgColor: 'bg-purple-500',
      },
      {
        id: 'stabilized',
        name: 'Stabilisé',
        startMonth: refi + 1,
        endMonth: refi + 12, // Première année
        cashflow: monthlyCashflowAfterRefi * 12,
        icon: CheckCircle2,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-500',
      },
    ]
  }, [
    acquisitionMonth,
    renovationMonths,
    rentingMonth,
    refinanceMonth,
    totalInvestment,
    monthlyCashflowDuringReno,
    monthlyCashflowAfterRefi,
    cashOutAtRefi,
  ])

  const totalMonths = phases[phases.length - 1].endMonth
  const breakEvenMonth = React.useMemo(() => {
    let cumulative = 0
    for (let month = 0; month <= totalMonths; month++) {
      // Simplification: additionner les cashflows par phase
      for (const phase of phases) {
        if (month >= phase.startMonth && month <= phase.endMonth) {
          const monthsInPhase = phase.endMonth - phase.startMonth + 1
          cumulative += phase.cashflow / monthsInPhase
        }
      }
      if (cumulative >= 0) return month
    }
    return null
  }, [phases, totalMonths])

  return (
    <div className={cn('rounded-xl border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Timeline du Projet BRRRR</h3>

      {/* Barre de timeline */}
      <div className="relative mb-8">
        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
          {phases.map((phase, index) => {
            const width =
              ((phase.endMonth - phase.startMonth + 1) / totalMonths) * 100
            return (
              <TooltipProvider key={phase.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className={cn(
                        'h-full cursor-pointer transition-opacity hover:opacity-80',
                        phase.bgColor
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{phase.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Mois {phase.startMonth} - {phase.endMonth}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>

        {/* Indicateur break-even */}
        {breakEvenMonth !== null && (
          <div
            className="absolute top-full mt-1"
            style={{ left: `${(breakEvenMonth / totalMonths) * 100}%` }}
          >
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-3 bg-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">
                Break-even
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Détail des phases */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {phases.map((phase, index) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div
              className={cn(
                'mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2',
                phase.bgColor + '/20'
              )}
            >
              <phase.icon className={cn('h-5 w-5', phase.color)} />
            </div>
            <p className="text-sm font-medium">{phase.name}</p>
            <p className="text-xs text-muted-foreground">
              {phase.startMonth === phase.endMonth
                ? `Mois ${phase.startMonth}`
                : `Mois ${phase.startMonth}-${phase.endMonth}`}
            </p>
            <p
              className={cn(
                'text-sm font-tabular mt-1',
                phase.cashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {formatCurrency(phase.cashflow, { showSign: true })}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Résumé */}
      <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Durée totale</p>
          <p className="text-lg font-semibold font-tabular">{totalMonths} mois</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Break-even</p>
          <p className="text-lg font-semibold font-tabular text-emerald-600">
            {breakEvenMonth !== null ? `Mois ${breakEvenMonth}` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Cashflow annuel</p>
          <p className="text-lg font-semibold font-tabular text-emerald-600">
            {formatCurrency(monthlyCashflowAfterRefi * 12)}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini timeline pour les listes de propriétés
 */
interface MiniTimelineProps {
  renovationMonths: number
  isInfiniteReturn: boolean
}

export function MiniTimeline({ renovationMonths, isInfiniteReturn }: MiniTimelineProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {/* Acquisition */}
        <div className="w-2 h-2 rounded-full bg-blue-500" title="Achat" />
        {/* Rénovation */}
        {Array.from({ length: Math.min(renovationMonths, 6) }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-orange-500"
            title={`Rénovation mois ${i + 1}`}
          />
        ))}
        {/* Refinancement */}
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            isInfiniteReturn ? 'bg-purple-500' : 'bg-emerald-500'
          )}
          title="Refinancement"
        />
      </div>
      <span className="text-xs text-muted-foreground ml-1">
        {renovationMonths}m
      </span>
    </div>
  )
}
