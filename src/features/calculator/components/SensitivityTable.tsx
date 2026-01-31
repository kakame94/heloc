/**
 * PlexInvest V2 - Table de Sensibilité
 *
 * Analyse de l'impact des variations de taux sur le cashflow
 */

'use client'

import { cn } from '@/lib/utils'
import { calculateMortgagePayment } from '../engines/mortgage'
import { getStressTestRate } from '@/shared/config/config-service'

interface SensitivityTableProps {
  loanAmount: number
  baseRate: number // en pourcentage (ex: 5 pour 5%)
  amortization: number
  noi: number
  className?: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function SensitivityTable({
  loanAmount,
  baseRate,
  amortization,
  noi,
  className,
}: SensitivityTableProps) {
  // Scénarios à analyser
  const scenarios = [
    { label: 'Taux actuel', rate: baseRate, highlight: 'current' },
    {
      label: 'Stress Test B-20',
      rate: getStressTestRate(baseRate / 100) * 100,
      highlight: 'stress',
    },
    { label: 'Renouvellement +1%', rate: baseRate + 1, highlight: 'warning' },
    { label: 'Renouvellement +2%', rate: baseRate + 2, highlight: 'warning' },
    { label: 'Renouvellement +3%', rate: baseRate + 3, highlight: 'danger' },
  ]

  const results = scenarios.map((s) => {
    const monthlyPayment = calculateMortgagePayment(
      loanAmount,
      s.rate / 100,
      amortization
    )
    const annualDebt = monthlyPayment * 12
    const cashflow = noi - annualDebt
    const dscr = annualDebt > 0 ? noi / annualDebt : 0

    return {
      ...s,
      monthlyPayment,
      annualCashflow: cashflow,
      monthlyCashflow: cashflow / 12,
      dscr,
    }
  })

  const getRowClass = (highlight: string, dscr: number) => {
    if (dscr < 1.0) return 'bg-rose-100 dark:bg-rose-950/40'
    if (highlight === 'current') return 'bg-blue-50 dark:bg-blue-950/30'
    if (highlight === 'stress') return 'bg-amber-50 dark:bg-amber-950/30'
    if (highlight === 'danger') return 'bg-rose-50 dark:bg-rose-950/20'
    return ''
  }

  const getDSCRClass = (dscr: number) => {
    if (dscr >= 1.25) return 'text-emerald-600 font-semibold'
    if (dscr >= 1.1) return 'text-amber-600 font-medium'
    return 'text-rose-600 font-bold'
  }

  const getCashflowClass = (cashflow: number) => {
    if (cashflow >= 0) return 'text-emerald-600'
    return 'text-rose-600'
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-semibold">Scénario</th>
            <th className="text-right p-3 font-semibold">Taux</th>
            <th className="text-right p-3 font-semibold">Paiement/mois</th>
            <th className="text-right p-3 font-semibold">Cashflow/mois</th>
            <th className="text-right p-3 font-semibold">DSCR</th>
            <th className="text-center p-3 font-semibold">Statut</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr
              key={i}
              className={cn('border-b transition-colors', getRowClass(r.highlight, r.dscr))}
            >
              <td className="p-3">
                <span className="font-medium">{r.label}</span>
                {r.highlight === 'current' && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                    Actuel
                  </span>
                )}
                {r.highlight === 'stress' && (
                  <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    B-20
                  </span>
                )}
              </td>
              <td className="text-right p-3">{r.rate.toFixed(2)}%</td>
              <td className="text-right p-3">{formatCurrency(r.monthlyPayment)}</td>
              <td className={cn('text-right p-3 font-semibold', getCashflowClass(r.monthlyCashflow))}>
                {r.monthlyCashflow >= 0 ? '+' : ''}
                {formatCurrency(r.monthlyCashflow)}
              </td>
              <td className={cn('text-right p-3', getDSCRClass(r.dscr))}>
                {r.dscr.toFixed(2)}x
              </td>
              <td className="text-center p-3">
                {r.dscr >= 1.25 ? (
                  <span className="text-emerald-600">✅</span>
                ) : r.dscr >= 1.1 ? (
                  <span className="text-amber-600">⚠️</span>
                ) : r.dscr >= 1.0 ? (
                  <span className="text-rose-500">🔻</span>
                ) : (
                  <span className="text-rose-600">❌</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Légende */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <div className="text-sm font-medium mb-2">Légende DSCR:</div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-emerald-600">✅</span>
            <span>≥ 1.25: Excellent</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-600">⚠️</span>
            <span>1.1 - 1.25: Acceptable</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-rose-500">🔻</span>
            <span>1.0 - 1.1: Risqué</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-rose-600">❌</span>
            <span>&lt; 1.0: Cashflow négatif</span>
          </div>
        </div>
      </div>

      {/* Alerte si mauvais au stress test */}
      {results[1].dscr < 1.1 && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            ⚠️ <strong>Attention:</strong> Ce deal ne passe pas le stress test B-20.
            Les banques pourraient refuser le financement même si le cashflow est positif au taux actuel.
          </p>
        </div>
      )}

      {/* Alerte si cashflow négatif à +3% */}
      {results[4].monthlyCashflow < 0 && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
          <p className="text-sm text-rose-700 dark:text-rose-400">
            🚨 <strong>Risque de renouvellement:</strong> Avec une hausse de 3%, le cashflow devient négatif ({formatCurrency(results[4].monthlyCashflow)}/mois).
            Prévoyez une réserve de liquidités.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Matrice de sensibilité Prix vs Taux
 */
export function PriceRateSensitivityMatrix({
  basePrice,
  baseRate,
  amortization,
  downPaymentPercent,
  noi,
  className,
}: {
  basePrice: number
  baseRate: number
  amortization: number
  downPaymentPercent: number
  noi: number
  className?: string
}) {
  const priceVariations = [-10, -5, 0, 5, 10] // en %
  const rateVariations = [-1, 0, 1, 2, 3] // en points

  const matrix = priceVariations.map((priceVar) => {
    const price = basePrice * (1 + priceVar / 100)
    const loanAmount = price * (1 - downPaymentPercent / 100)

    return rateVariations.map((rateVar) => {
      const rate = baseRate + rateVar
      const monthlyPayment = calculateMortgagePayment(loanAmount, rate / 100, amortization)
      const annualDebt = monthlyPayment * 12
      const dscr = annualDebt > 0 ? noi / annualDebt : 0
      return { price, rate, dscr, priceVar, rateVar }
    })
  })

  const getCellClass = (dscr: number, isBase: boolean) => {
    let bg = ''
    if (dscr >= 1.25) bg = 'bg-emerald-100 dark:bg-emerald-950/50'
    else if (dscr >= 1.1) bg = 'bg-amber-100 dark:bg-amber-950/50'
    else bg = 'bg-rose-100 dark:bg-rose-950/50'

    if (isBase) bg += ' ring-2 ring-blue-500'
    return bg
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left bg-muted">Prix \ Taux</th>
            {rateVariations.map((rv) => (
              <th key={rv} className="p-2 text-center bg-muted">
                {baseRate + rv}%
                {rv === 0 && <span className="text-xs block text-blue-600">(actuel)</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="p-2 bg-muted font-medium">
                {formatCurrency(row[0].price)}
                {priceVariations[i] === 0 && (
                  <span className="text-xs block text-blue-600">(actuel)</span>
                )}
              </td>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    'p-2 text-center font-medium',
                    getCellClass(cell.dscr, cell.priceVar === 0 && cell.rateVar === 0)
                  )}
                >
                  {cell.dscr.toFixed(2)}x
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
