/**
 * PlexInvest V2 - Jauge DSCR (Debt Service Coverage Ratio)
 *
 * Visualisation du ratio de couverture de la dette avec zones de risque
 */

'use client'

import { cn } from '@/lib/utils'

interface DSCRGaugeProps {
  dscr: number
  dscrStressTested: number
  className?: string
}

export function DSCRGauge({ dscr, dscrStressTested, className }: DSCRGaugeProps) {
  const getZone = (value: number) => {
    if (value < 1.0) return { color: 'text-rose-600', bg: 'bg-rose-500', label: 'Déficit', emoji: '🔴' }
    if (value < 1.1) return { color: 'text-rose-600', bg: 'bg-rose-500', label: 'Danger', emoji: '🔴' }
    if (value < 1.25) return { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Standard', emoji: '🟡' }
    if (value < 1.5) return { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Bon', emoji: '🟢' }
    return { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Excellent', emoji: '🟢' }
  }

  const zone = getZone(dscrStressTested)

  // Position de l'indicateur (0% à 100% sur une échelle de 0 à 2)
  const percentage = Math.min(100, Math.max(0, (dscrStressTested / 2) * 100))

  return (
    <div className={cn('space-y-4', className)}>
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-medium text-muted-foreground">
            DSCR (Stress-Test B-20)
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ratio de couverture du service de la dette
          </p>
        </div>
        <div className="text-right">
          <span className={cn('text-3xl font-bold', zone.color)}>
            {dscrStressTested.toFixed(2)}x
          </span>
          <span className="text-sm ml-2">{zone.emoji}</span>
        </div>
      </div>

      {/* Jauge visuelle */}
      <div className="relative h-6 bg-muted rounded-full overflow-hidden">
        {/* Zones de couleur */}
        <div className="absolute inset-0 flex">
          <div className="w-[50%] bg-rose-200 dark:bg-rose-950/50" /> {/* 0 - 1.0 */}
          <div className="w-[5%] bg-rose-300 dark:bg-rose-900/50" /> {/* 1.0 - 1.1 */}
          <div className="w-[7.5%] bg-amber-200 dark:bg-amber-950/50" /> {/* 1.1 - 1.25 */}
          <div className="w-[12.5%] bg-emerald-200 dark:bg-emerald-950/50" /> {/* 1.25 - 1.5 */}
          <div className="flex-1 bg-emerald-300 dark:bg-emerald-900/50" /> {/* 1.5+ */}
        </div>

        {/* Lignes de référence */}
        <div className="absolute top-0 bottom-0 left-[50%] w-px bg-rose-400" title="1.0 - Seuil critique" />
        <div className="absolute top-0 bottom-0 left-[55%] w-px bg-rose-500" title="1.1 - Minimum B-20" />
        <div className="absolute top-0 bottom-0 left-[62.5%] w-px bg-amber-400" title="1.25 - Recommandé" />

        {/* Indicateur */}
        <div
          className="absolute top-0 bottom-0 w-1.5 bg-foreground rounded-full shadow-lg transition-all duration-500 ease-out"
          style={{ left: `calc(${percentage}% - 3px)` }}
        />
      </div>

      {/* Légende */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className="text-rose-600 font-medium">1.0</span>
        <span className="text-rose-600 font-semibold">1.1 (B-20)</span>
        <span className="text-amber-600">1.25</span>
        <span className="text-emerald-600">1.5</span>
        <span className="text-emerald-600">2.0+</span>
      </div>

      {/* Alerte si échec B-20 */}
      {dscrStressTested < 1.1 && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
          <p className="text-sm text-rose-700 dark:text-rose-400">
            ⚠️ <strong>Financement difficile</strong> - Le DSCR stress-testé est sous 1.1.
            La banque pourrait refuser le prêt malgré un cashflow positif au taux actuel.
          </p>
          {dscrStressTested < 1.0 && (
            <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">
              🚨 <strong>Cashflow négatif au taux qualifiant!</strong> Ce deal ne passe pas le test B-20.
            </p>
          )}
        </div>
      )}

      {/* DSCR au taux contractuel */}
      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
        <span className="text-sm text-muted-foreground">DSCR au taux contractuel:</span>
        <span className={cn('font-semibold', getZone(dscr).color)}>
          {dscr.toFixed(2)}x
        </span>
      </div>

      {/* Explication */}
      <div className="text-xs text-muted-foreground border-t pt-3">
        <p><strong>DSCR</strong> = Revenu Net d'Exploitation ÷ Service de la dette</p>
        <ul className="mt-1 space-y-0.5 ml-2">
          <li>• &lt; 1.0 = Cashflow négatif (déficit)</li>
          <li>• 1.0 - 1.1 = Juste au seuil, risque élevé</li>
          <li>• 1.1 - 1.25 = Acceptable (minimum bancaire)</li>
          <li>• 1.25+ = Confortable, marge de sécurité</li>
        </ul>
      </div>
    </div>
  )
}
