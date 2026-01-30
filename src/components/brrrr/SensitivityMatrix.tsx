'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn, formatPercent, formatCurrency, getSensitivityColor } from '@/lib/utils'
import type { SensitivityPoint } from '@/hooks/useBrrrrCalculator'

interface SensitivityMatrixProps {
  data: SensitivityPoint[][]
  variable1Label: string
  variable2Label: string
  variable1Format?: (v: number) => string
  variable2Format?: (v: number) => string
  valueType?: 'cashOnCash' | 'cashflow'
  highlightBase?: { v1: number; v2: number }
  className?: string
}

/**
 * Matrice de sensibilité pour analyser l'impact de deux variables
 * sur le Cash-on-Cash ou le cashflow
 */
export function SensitivityMatrix({
  data,
  variable1Label,
  variable2Label,
  variable1Format = (v) => formatCurrency(v, { compact: true }),
  variable2Format = (v) => formatCurrency(v, { compact: true }),
  valueType = 'cashOnCash',
  highlightBase,
  className,
}: SensitivityMatrixProps) {
  if (!data.length || !data[0]?.length) {
    return (
      <div className={cn('rounded-xl border bg-card p-6', className)}>
        <p className="text-muted-foreground text-center">
          Données insuffisantes pour la matrice de sensibilité
        </p>
      </div>
    )
  }

  // Extraire les valeurs uniques pour les axes
  const v1Values = [...new Set(data.map((row) => row[0]?.variable1Value))]
  const v2Values = [...new Set(data[0]?.map((cell) => cell?.variable2Value) ?? [])]

  // Trouver min/max pour le gradient de couleur
  const allValues = data.flatMap((row) =>
    row.map((cell) => (valueType === 'cashOnCash' ? cell.cashOnCash : cell.cashflow))
  ).filter((v) => isFinite(v))

  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)

  return (
    <div className={cn('rounded-xl border bg-card p-6 overflow-x-auto', className)}>
      <h3 className="text-lg font-semibold mb-4">
        Matrice de Sensibilité: {valueType === 'cashOnCash' ? 'Cash-on-Cash' : 'Cashflow'}
      </h3>

      <div className="min-w-[500px]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {/* Cellule coin (vide) avec labels */}
              <th className="p-2 text-xs text-muted-foreground">
                <div className="flex flex-col items-center">
                  <span>{variable2Label} →</span>
                  <span>↓ {variable1Label}</span>
                </div>
              </th>
              {/* Headers pour variable 2 */}
              {v2Values.map((v2, i) => (
                <th
                  key={i}
                  className="p-2 text-xs font-medium text-center border-b"
                >
                  {variable2Format(v2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* Header pour variable 1 */}
                <td className="p-2 text-xs font-medium text-right border-r">
                  {variable1Format(v1Values[rowIndex])}
                </td>
                {/* Cellules de données */}
                {row.map((cell, colIndex) => {
                  const value =
                    valueType === 'cashOnCash' ? cell.cashOnCash : cell.cashflow
                  const isBase =
                    highlightBase &&
                    Math.abs(cell.variable1Value - highlightBase.v1) < 0.01 &&
                    Math.abs(cell.variable2Value - highlightBase.v2) < 0.01

                  return (
                    <motion.td
                      key={colIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: (rowIndex * row.length + colIndex) * 0.01,
                      }}
                      className={cn(
                        'sensitivity-cell border',
                        getSensitivityColor(value, minValue, maxValue),
                        isBase && 'ring-2 ring-primary ring-offset-1'
                      )}
                    >
                      {isFinite(value) ? (
                        valueType === 'cashOnCash' ? (
                          formatPercent(value, { decimals: 1 })
                        ) : (
                          formatCurrency(value, { compact: true })
                        )
                      ) : (
                        <span className="text-purple-600 font-bold">∞</span>
                      )}
                    </motion.td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs">
        <span className="text-muted-foreground">Moins rentable</span>
        <div className="flex gap-0.5">
          <div className="w-6 h-4 bg-rose-400 rounded-sm" />
          <div className="w-6 h-4 bg-orange-300 rounded-sm" />
          <div className="w-6 h-4 bg-yellow-200 rounded-sm" />
          <div className="w-6 h-4 bg-emerald-300 rounded-sm" />
          <div className="w-6 h-4 bg-emerald-500 rounded-sm" />
        </div>
        <span className="text-muted-foreground">Plus rentable</span>
        <div className="ml-4 flex items-center gap-1">
          <div className="w-6 h-4 bg-purple-100 rounded-sm" />
          <span className="text-purple-600">= Retour infini</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Composant de sélection des variables pour la matrice
 */
interface VariableSelectorProps {
  value: string
  onChange: (value: string) => void
  label: string
}

export function VariableSelector({
  value,
  onChange,
  label,
}: VariableSelectorProps) {
  const options = [
    { value: 'purchasePrice', label: "Prix d'achat" },
    { value: 'renovationBudget', label: 'Budget rénos' },
    { value: 'rent', label: 'Loyer mensuel' },
    { value: 'arv', label: 'Valeur après rénos' },
    { value: 'rate', label: "Taux d'intérêt" },
  ]

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * Version interactive avec sliders pour ajuster la plage
 */
interface InteractiveSensitivityProps {
  baseValue: number
  variable: 'purchasePrice' | 'renovationBudget' | 'rent' | 'arv' | 'rate'
  onRangeChange: (range: [number, number]) => void
  className?: string
}

export function SensitivityRangeSlider({
  baseValue,
  variable,
  onRangeChange,
  className,
}: InteractiveSensitivityProps) {
  const [variation, setVariation] = React.useState(20) // +/- 20% par défaut

  React.useEffect(() => {
    const min = baseValue * (1 - variation / 100)
    const max = baseValue * (1 + variation / 100)
    onRangeChange([min, max])
  }, [baseValue, variation, onRangeChange])

  const formatValue =
    variable === 'rate'
      ? (v: number) => formatPercent(v * 100)
      : (v: number) => formatCurrency(v, { compact: true })

  const min = baseValue * (1 - variation / 100)
  const max = baseValue * (1 + variation / 100)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Variation: ±{variation}%</span>
        <span className="font-tabular">
          {formatValue(min)} - {formatValue(max)}
        </span>
      </div>
      <input
        type="range"
        min={5}
        max={50}
        step={5}
        value={variation}
        onChange={(e) => setVariation(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}
