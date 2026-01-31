/**
 * PlexInvest V2 - Graphique Waterfall BRRRR
 *
 * Visualisation du flux de capitaux dans un deal BRRRR
 */

'use client'

import { cn } from '@/lib/utils'
import type { WaterfallItem } from '../engines/brrrr'

interface WaterfallChartProps {
  data: WaterfallItem[]
  className?: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function WaterfallChart({ data, className }: WaterfallChartProps) {
  // Trouver la valeur max/min pour l'échelle
  const values = data.map((d) => Math.abs(d.value))
  const maxValue = Math.max(...values, ...data.map((d) => Math.abs(d.cumulative)))

  const getBarColor = (type: WaterfallItem['type'], value: number) => {
    if (type === 'cost') return 'bg-rose-500'
    if (type === 'value') return 'bg-emerald-500'
    if (type === 'equity') return 'bg-blue-500'
    return value >= 0 ? 'bg-slate-400' : 'bg-slate-500'
  }

  const getBarWidth = (value: number) => {
    return Math.min(100, (Math.abs(value) / maxValue) * 100)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Graphique */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Label */}
            <div className="w-32 text-sm text-right truncate" title={item.label}>
              {item.label}
            </div>

            {/* Barre */}
            <div className="flex-1 flex items-center h-8">
              {/* Zone négative */}
              <div className="flex-1 flex justify-end">
                {item.value < 0 && (
                  <div
                    className={cn(
                      'h-6 rounded-l transition-all duration-500',
                      getBarColor(item.type, item.value)
                    )}
                    style={{ width: `${getBarWidth(item.value)}%` }}
                  />
                )}
              </div>

              {/* Ligne centrale */}
              <div className="w-px h-8 bg-border" />

              {/* Zone positive */}
              <div className="flex-1">
                {item.value > 0 && (
                  <div
                    className={cn(
                      'h-6 rounded-r transition-all duration-500',
                      getBarColor(item.type, item.value)
                    )}
                    style={{ width: `${getBarWidth(item.value)}%` }}
                  />
                )}
              </div>
            </div>

            {/* Valeur */}
            <div
              className={cn(
                'w-24 text-sm font-medium text-right',
                item.value < 0 ? 'text-rose-600' : 'text-emerald-600'
              )}
            >
              {item.value >= 0 ? '+' : ''}
              {formatCurrency(item.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Ligne de cumul */}
      <div className="pt-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-32 text-sm text-right font-semibold">Équité finale</div>
          <div className="flex-1 flex items-center h-8">
            <div className="flex-1" />
            <div className="w-px h-8 bg-border" />
            <div className="flex-1">
              {data.length > 0 && data[data.length - 1].cumulative > 0 && (
                <div
                  className="h-6 rounded-r bg-gradient-to-r from-blue-500 to-emerald-500"
                  style={{
                    width: `${getBarWidth(data[data.length - 1].cumulative)}%`,
                  }}
                />
              )}
            </div>
          </div>
          <div className="w-24 text-sm font-bold text-right text-blue-600">
            {data.length > 0 && formatCurrency(data[data.length - 1].cumulative)}
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-6 justify-center pt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500" />
          <span className="text-muted-foreground">Coûts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-muted-foreground">Valeur</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-muted-foreground">Équité</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-400" />
          <span className="text-muted-foreground">Neutre</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Version compacte du waterfall pour les dashboards
 */
export function MiniWaterfall({
  totalInvested,
  cashOut,
  equityCreated,
  className,
}: {
  totalInvested: number
  cashOut: number
  equityCreated: number
  className?: string
}) {
  const capitalRecovered = (cashOut / totalInvested) * 100
  const isInfiniteReturn = cashOut >= totalInvested

  return (
    <div className={cn('space-y-3', className)}>
      {/* Barre de récupération du capital */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Capital récupéré</span>
          <span className={cn('font-medium', isInfiniteReturn ? 'text-emerald-600' : 'text-blue-600')}>
            {isInfiniteReturn ? '100%+' : `${capitalRecovered.toFixed(0)}%`}
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isInfiniteReturn
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-blue-500'
            )}
            style={{ width: `${Math.min(100, capitalRecovered)}%` }}
          />
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded">
          <div className="font-semibold text-rose-600">{formatCurrency(totalInvested)}</div>
          <div className="text-xs text-muted-foreground">Investi</div>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded">
          <div className="font-semibold text-emerald-600">{formatCurrency(cashOut)}</div>
          <div className="text-xs text-muted-foreground">Cash-out</div>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
          <div className="font-semibold text-blue-600">{formatCurrency(equityCreated)}</div>
          <div className="text-xs text-muted-foreground">Équité</div>
        </div>
      </div>

      {isInfiniteReturn && (
        <div className="text-center p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            🎉 Retour Infini! Capital 100% recyclé
          </span>
        </div>
      )}
    </div>
  )
}
