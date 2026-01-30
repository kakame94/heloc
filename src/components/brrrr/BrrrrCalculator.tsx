'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Hammer,
  Key,
  Building2,
  Calculator,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  Download,
} from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencyInput, PercentInput, Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KpiGrid } from './KpiCard'
import { BrrrrTimeline } from './BrrrrTimeline'
import { useBrrrrCalculator, type BrrrrFormInput } from '@/hooks/useBrrrrCalculator'

// Schéma de validation
const brrrrFormSchema = z.object({
  // Acquisition
  purchasePrice: z.coerce.number().min(10000, 'Prix minimum 10,000$'),
  downPaymentPercent: z.coerce.number().min(5).max(100).default(20),
  postalCode: z.string().optional(),

  // Rénovation
  renovationBudget: z.coerce.number().min(0).default(0),
  renovationDurationMonths: z.coerce.number().min(0).max(24).default(3),

  // Location
  projectedMonthlyRent: z.coerce.number().min(0),
  totalUnits: z.coerce.number().min(1).max(100).default(1),

  // Charges
  municipalTaxes: z.coerce.number().min(0),
  schoolTaxes: z.coerce.number().min(0).default(500),
  insuranceAnnual: z.coerce.number().min(0).default(2400),

  // Refinancement
  afterRepairValue: z.coerce.number().min(0),
  mortgageRate: z.coerce.number().min(0).max(20).default(5.25),
  refinanceRate: z.coerce.number().min(0).max(20).default(5.25),

  // Options
  isOwnerOccupied: z.boolean().default(false),
})

type BrrrrFormData = z.infer<typeof brrrrFormSchema>

interface BrrrrCalculatorProps {
  initialData?: Partial<BrrrrFormData>
  onSave?: (data: BrrrrFormData, results: ReturnType<typeof useBrrrrCalculator>) => void
  className?: string
}

/**
 * Calculateur BRRRR interactif complet
 * Interface "data-dense" inspirée Bloomberg avec UX Airbnb
 */
export function BrrrrCalculator({
  initialData,
  onSave,
  className,
}: BrrrrCalculatorProps) {
  const [expandedSections, setExpandedSections] = React.useState({
    acquisition: true,
    renovation: true,
    rental: true,
    refinance: true,
    advanced: false,
  })

  const form = useForm<BrrrrFormData>({
    resolver: zodResolver(brrrrFormSchema),
    defaultValues: {
      purchasePrice: 400000,
      downPaymentPercent: 20,
      renovationBudget: 50000,
      renovationDurationMonths: 3,
      projectedMonthlyRent: 3500,
      totalUnits: 4,
      municipalTaxes: 4500,
      schoolTaxes: 600,
      insuranceAnnual: 2400,
      afterRepairValue: 500000,
      mortgageRate: 5.25,
      refinanceRate: 5.25,
      isOwnerOccupied: false,
      ...initialData,
    },
    mode: 'onChange',
  })

  const watchedValues = form.watch()

  // Convertir les valeurs du formulaire pour le hook
  const calculatorInput: BrrrrFormInput | null = React.useMemo(() => {
    const values = watchedValues
    if (
      !values.purchasePrice ||
      !values.afterRepairValue ||
      !values.projectedMonthlyRent
    ) {
      return null
    }

    return {
      purchasePrice: values.purchasePrice,
      afterRepairValue: values.afterRepairValue,
      projectedMonthlyRent: values.projectedMonthlyRent,
      renovationBudget: values.renovationBudget || 0,
      municipalTaxes: values.municipalTaxes || 0,
      schoolTaxes: values.schoolTaxes || 0,
      totalUnits: values.totalUnits || 1,
      postalCode: values.postalCode,
      downPaymentPercent: (values.downPaymentPercent || 20) / 100,
      mortgageRate: (values.mortgageRate || 5.25) / 100,
      refinanceRate: (values.refinanceRate || 5.25) / 100,
      insuranceAnnual: values.insuranceAnnual || 2400,
      renovationDurationMonths: values.renovationDurationMonths || 3,
      isOwnerOccupied: values.isOwnerOccupied || false,
    }
  }, [watchedValues])

  // Calculs BRRRR
  const results = useBrrrrCalculator(calculatorInput)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const SectionHeader = ({
    icon: Icon,
    title,
    section,
  }: {
    icon: React.ElementType
    title: string
    section: keyof typeof expandedSections
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full py-2 text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-semibold">{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  )

  return (
    <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
      {/* Formulaire - Colonne gauche */}
      <div className="space-y-4">
        <form className="space-y-4">
          {/* Section Acquisition */}
          <Card>
            <CardHeader className="py-4">
              <SectionHeader icon={Home} title="1. Acquisition" section="acquisition" />
            </CardHeader>
            <AnimatePresence initial={false}>
              {expandedSections.acquisition && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">Prix d'achat</Label>
                      <CurrencyInput
                        id="purchasePrice"
                        {...form.register('purchasePrice')}
                        placeholder="400 000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="downPaymentPercent">Mise de fonds (%)</Label>
                      <PercentInput
                        id="downPaymentPercent"
                        {...form.register('downPaymentPercent')}
                        placeholder="20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalUnits">Nombre de logements</Label>
                      <Input
                        id="totalUnits"
                        type="number"
                        {...form.register('totalUnits')}
                        placeholder="4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        {...form.register('postalCode')}
                        placeholder="H2X 1Y4"
                      />
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Section Rénovation */}
          <Card>
            <CardHeader className="py-4">
              <SectionHeader icon={Hammer} title="2. Rénovation" section="renovation" />
            </CardHeader>
            <AnimatePresence initial={false}>
              {expandedSections.renovation && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="renovationBudget">Budget rénovations</Label>
                      <CurrencyInput
                        id="renovationBudget"
                        {...form.register('renovationBudget')}
                        placeholder="50 000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="renovationDurationMonths">Durée (mois)</Label>
                      <Input
                        id="renovationDurationMonths"
                        type="number"
                        {...form.register('renovationDurationMonths')}
                        placeholder="3"
                      />
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Section Location */}
          <Card>
            <CardHeader className="py-4">
              <SectionHeader icon={Key} title="3. Location" section="rental" />
            </CardHeader>
            <AnimatePresence initial={false}>
              {expandedSections.rental && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="projectedMonthlyRent">Loyer mensuel total</Label>
                      <CurrencyInput
                        id="projectedMonthlyRent"
                        {...form.register('projectedMonthlyRent')}
                        placeholder="3 500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="municipalTaxes">Taxes municipales (annuel)</Label>
                      <CurrencyInput
                        id="municipalTaxes"
                        {...form.register('municipalTaxes')}
                        placeholder="4 500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolTaxes">Taxes scolaires (annuel)</Label>
                      <CurrencyInput
                        id="schoolTaxes"
                        {...form.register('schoolTaxes')}
                        placeholder="600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insuranceAnnual">Assurance (annuel)</Label>
                      <CurrencyInput
                        id="insuranceAnnual"
                        {...form.register('insuranceAnnual')}
                        placeholder="2 400"
                      />
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Section Refinancement */}
          <Card>
            <CardHeader className="py-4">
              <SectionHeader
                icon={Building2}
                title="4. Refinancement"
                section="refinance"
              />
            </CardHeader>
            <AnimatePresence initial={false}>
              {expandedSections.refinance && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="afterRepairValue">Valeur après rénos (ARV)</Label>
                      <CurrencyInput
                        id="afterRepairValue"
                        {...form.register('afterRepairValue')}
                        placeholder="500 000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refinanceRate">Taux refinancement (%)</Label>
                      <PercentInput
                        id="refinanceRate"
                        {...form.register('refinanceRate')}
                        placeholder="5.25"
                      />
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </form>

        {/* Warnings et erreurs */}
        {(results.warnings.length > 0 || results.errors.length > 0) && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
            <CardContent className="py-4">
              {results.errors.map((error, i) => (
                <div key={i} className="flex items-start gap-2 text-rose-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              ))}
              {results.warnings.map((warning, i) => (
                <div key={i} className="flex items-start gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{warning}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Résultats - Colonne droite */}
      <div className="space-y-4">
        {/* KPIs principaux */}
        <KpiGrid
          cashOnCash={results.roi}
          monthlyCashflow={results.cashFlowMonthly}
          refinanceCashOut={results.refinanceCashOutAmount}
          capRate={results.capRate}
          isInfiniteReturn={results.isInfiniteReturn}
          dcr={results.dcr}
        />

        {/* Timeline */}
        {results.fullAnalysis && (
          <BrrrrTimeline
            renovationMonths={calculatorInput?.renovationDurationMonths ?? 3}
            monthlyCashflowDuringReno={
              -(results.fullAnalysis.renovation.monthlyCarryCost || 0)
            }
            monthlyCashflowAfterRefi={results.cashFlowMonthly}
            totalInvestment={results.fullAnalysis.kpis.totalCashInvested}
            cashOutAtRefi={results.refinanceCashOutAmount}
          />
        )}

        {/* Détail financier */}
        {results.fullAnalysis && (
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">Détail Financier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="data-dense">
                <div className="data-dense-row">
                  <span className="data-dense-label">Investissement total</span>
                  <span className="data-dense-value">
                    {formatCurrency(results.fullAnalysis.kpis.totalCashInvested)}
                  </span>
                </div>
                <div className="data-dense-row">
                  <span className="data-dense-label">Taxe de bienvenue</span>
                  <span className="data-dense-value">
                    {formatCurrency(results.fullAnalysis.acquisition.transferTax)}
                  </span>
                </div>
                <div className="data-dense-row">
                  <span className="data-dense-label">NOI mensuel</span>
                  <span className="data-dense-value text-emerald-600">
                    {formatCurrency(results.fullAnalysis.rental.monthlyNOI)}
                  </span>
                </div>
                <div className="data-dense-row">
                  <span className="data-dense-label">Service de la dette</span>
                  <span className="data-dense-value text-rose-600">
                    {formatCurrency(results.fullAnalysis.refinance.totalMonthlyDebtService)}
                  </span>
                </div>
                <div className="data-dense-row border-t pt-2 mt-2">
                  <span className="data-dense-label font-semibold">Cashflow net</span>
                  <span
                    className={cn(
                      'data-dense-value font-semibold',
                      results.cashFlowMonthly >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    {formatCurrency(results.cashFlowMonthly)}/mois
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              // TODO: Générer PDF
              console.log('Générer PDF')
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Rapport PDF
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              if (onSave) {
                onSave(form.getValues(), results)
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  )
}
