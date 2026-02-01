'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Building2,
  Home,
  Hammer,
  DollarSign,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Loader2,
  FileText,
  Calculator,
  BarChart3,
  Gauge,
  ArrowLeft,
  Info,
  Sparkles,
  RefreshCw,
  Target,
  PiggyBank,
  Wallet,
  BadgePercent,
  Clock,
  MapPin,
} from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input, CurrencyInput, PercentInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Imports V2 Engines
import {
  calculateMortgagePayment,
  calculateSCHLPremium,
  fullMortgageAnalysis,
  calculateWelcomeTax,
  analyzeCashflow,
  analyzeBRRRR,
} from '@/features/calculator/engines'

// Imports V2 Components
import { DSCRGauge } from '@/features/calculator/components/DSCRGauge'
import { WaterfallChart, MiniWaterfall } from '@/features/calculator/components/WaterfallChart'
import { SensitivityTable } from '@/features/calculator/components/SensitivityTable'

// Import V2 Store
import { usePlexStore, useStoreHydrated } from '@/stores'

// Import PDF Uploader
import type { ExtractedPropertyData } from '@/lib/pdf-extractor'

const DynamicPdfUploader = dynamic(
  () => import('@/components/brrrr/PdfUploader').then((mod) => mod.PdfUploader),
  { ssr: false, loading: () => <div className="h-32 flex items-center justify-center"><Loader2 className="animate-spin" /></div> }
)

// Types
type WizardStep = 'setup' | 'chantier' | 'operation' | 'verdict'

interface WizardData {
  // Setup
  address: string
  city: 'montreal' | 'quebec' | 'other'
  propertyType: 'duplex' | 'triplex' | 'quadruplex' | 'quintuplex' | 'sixplex' | 'multilogement'
  numberOfUnits: number
  purchasePrice: number
  monthlyRents: number[]
  downPaymentPercent: number
  interestRate: number
  amortization: number

  // Chantier
  renovationBudget: number
  renovationDuration: number
  afterRepairValue: number

  // Operation
  municipalTax: number
  schoolTax: number
  insurance: number
  maintenance: number
  managementPercent: number
  snowRemoval: number
}

const DEFAULT_DATA: WizardData = {
  address: '',
  city: 'montreal',
  propertyType: 'triplex',
  numberOfUnits: 3,
  purchasePrice: 500000,
  monthlyRents: [1200, 1100, 900],
  downPaymentPercent: 20,
  interestRate: 5,
  amortization: 25,
  renovationBudget: 0,
  renovationDuration: 0,
  afterRepairValue: 500000,
  municipalTax: 5000,
  schoolTax: 1000,
  insurance: 2400,
  maintenance: 1500,
  managementPercent: 8,
  snowRemoval: 600,
}

const STEPS: { id: WizardStep; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'setup', label: 'Propriété', icon: Home, description: 'Informations de base' },
  { id: 'chantier', label: 'Rénovation', icon: Hammer, description: 'Budget et travaux' },
  { id: 'operation', label: 'Opération', icon: DollarSign, description: 'Revenus et dépenses' },
  { id: 'verdict', label: 'Verdict', icon: TrendingUp, description: 'Analyse complète' },
]

export default function WizardPage() {
  const isHydrated = useStoreHydrated()
  const [currentStep, setCurrentStep] = React.useState<WizardStep>('setup')
  const [data, setData] = React.useState<WizardData>(DEFAULT_DATA)
  const [completedSteps, setCompletedSteps] = React.useState<WizardStep[]>([])

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const goToNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id)
    }
  }

  const goToPrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id)
    }
  }

  const handlePdfDataExtracted = (pdfData: ExtractedPropertyData) => {
    updateData({
      address: pdfData.address || '',
      purchasePrice: pdfData.askingPrice || 0,
      numberOfUnits: pdfData.numberOfUnits || 3,
      monthlyRents: pdfData.monthlyRents || [],
      municipalTax: pdfData.municipalTaxes || 0,
      schoolTax: pdfData.schoolTaxes || 0,
      insurance: pdfData.insurance || 2400,
      afterRepairValue: pdfData.askingPrice || 0,
    })
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Retour</span>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Building2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <span className="font-bold text-lg">Calculateur BRRRR</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Analyse en temps réel</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Progress Steps - Desktop */}
        <div className="hidden md:block mb-10">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === step.id
              const isPast = index < currentStepIndex

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => (isCompleted || isPast) && setCurrentStep(step.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 transition-all',
                      (isCompleted || isPast) && 'cursor-pointer',
                      !isCompleted && !isCurrent && !isPast && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm',
                        isCurrent && 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-900',
                        isCompleted && 'bg-emerald-500 text-white',
                        !isCurrent && !isCompleted && 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      )}
                    >
                      {isCompleted ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                    </div>
                    <div className="text-center">
                      <div className={cn('text-sm font-semibold', isCurrent && 'text-emerald-600')}>
                        {step.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-1 mx-4 rounded-full transition-all',
                        index < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                      )}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Progress Steps - Mobile */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Étape {currentStepIndex + 1} sur {STEPS.length}</span>
            <span className="text-sm text-emerald-600 font-semibold">{STEPS[currentStepIndex].label}</span>
          </div>
          <div className="flex gap-1">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex-1 h-2 rounded-full transition-all',
                  index <= currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'setup' && (
            <SetupStep data={data} updateData={updateData} onPdfExtracted={handlePdfDataExtracted} />
          )}
          {currentStep === 'chantier' && <ChantierStep data={data} updateData={updateData} />}
          {currentStep === 'operation' && <OperationStep data={data} updateData={updateData} />}
          {currentStep === 'verdict' && <VerdictStep data={data} />}
        </div>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentStepIndex === 0}
            className="gap-2 h-12 px-6"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          {currentStepIndex < STEPS.length - 1 ? (
            <Button onClick={goToNext} className="gap-2 h-12 px-8 bg-emerald-600 hover:bg-emerald-700">
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="gap-2 h-12 px-8 bg-emerald-600 hover:bg-emerald-700">
              <Check className="h-4 w-4" />
              Télécharger le rapport
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STEP 1: SETUP
// ============================================================================
function SetupStep({
  data,
  updateData,
  onPdfExtracted,
}: {
  data: WizardData
  updateData: (d: Partial<WizardData>) => void
  onPdfExtracted: (d: ExtractedPropertyData) => void
}) {
  const totalRent = data.monthlyRents.reduce((a, b) => a + b, 0)
  const downPaymentAmount = data.purchasePrice * (data.downPaymentPercent / 100)

  return (
    <div className="space-y-6">
      {/* PDF Upload Card */}
      <Card className="border-2 border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Importer une fiche PDF</h3>
              <p className="text-sm text-muted-foreground">
                Importez une fiche Centris, DuProprio ou courtier pour pré-remplir automatiquement les données
              </p>
            </div>
          </div>
          <DynamicPdfUploader onDataExtracted={onPdfExtracted} />
        </CardContent>
      </Card>

      {/* Property Info */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Informations de la propriété</CardTitle>
              <CardDescription>Détails sur l'immeuble à analyser</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={data.address}
                  onChange={(e) => updateData({ address: e.target.value })}
                  placeholder="123 rue Example, Montréal"
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ville</Label>
              <select
                value={data.city}
                onChange={(e) => updateData({ city: e.target.value as WizardData['city'] })}
                className="w-full h-11 px-3 rounded-lg border bg-background text-sm"
              >
                <option value="montreal">Montréal</option>
                <option value="quebec">Québec</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type de propriété</Label>
              <select
                value={data.propertyType}
                onChange={(e) => updateData({ propertyType: e.target.value as WizardData['propertyType'] })}
                className="w-full h-11 px-3 rounded-lg border bg-background text-sm"
              >
                <option value="duplex">Duplex</option>
                <option value="triplex">Triplex</option>
                <option value="quadruplex">Quadruplex</option>
                <option value="quintuplex">Quintuplex</option>
                <option value="sixplex">Sixplex</option>
                <option value="multilogement">Multi (7+)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Logements</Label>
              <Input
                type="number"
                value={data.numberOfUnits}
                onChange={(e) => updateData({ numberOfUnits: Number(e.target.value) || 1 })}
                className="h-11"
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label className="text-sm font-medium">Prix d'achat</Label>
              <CurrencyInput
                value={data.purchasePrice}
                onChange={(e) => updateData({ purchasePrice: Number(e.target.value) || 0 })}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Loyers mensuels (séparés par virgule)</Label>
            <Input
              value={data.monthlyRents.join(', ')}
              onChange={(e) => {
                const rents = e.target.value.split(',').map((r) => Number(r.trim()) || 0)
                updateData({ monthlyRents: rents })
              }}
              placeholder="1200, 1100, 900"
              className="h-11"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{data.monthlyRents.length} loyers entrés</span>
              <span className="font-semibold text-emerald-600">Total: {formatCurrency(totalRent)}/mois</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financing */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Financement</CardTitle>
              <CardDescription>Paramètres de l'hypothèque</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mise de fonds</Label>
              <div className="relative">
                <PercentInput
                  value={data.downPaymentPercent}
                  onChange={(e) => updateData({ downPaymentPercent: Number(e.target.value) || 0 })}
                  className="h-11"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                = {formatCurrency(downPaymentAmount)}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Taux d'intérêt</Label>
              <PercentInput
                value={data.interestRate}
                onChange={(e) => updateData({ interestRate: Number(e.target.value) || 0 })}
                className="h-11"
              />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label className="text-sm font-medium">Amortissement</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={data.amortization}
                  onChange={(e) => updateData({ amortization: Number(e.target.value) || 25 })}
                  className="h-11"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">ans</span>
              </div>
              {data.downPaymentPercent < 20 && data.amortization > 25 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Max 25 ans (prêt assuré)
                </p>
              )}
            </div>
          </div>

          {data.downPaymentPercent < 20 && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                  Prêt assuré SCHL requis
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                  Mise de fonds inférieure à 20%. La prime SCHL sera ajoutée au prêt.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card className="bg-slate-50 dark:bg-slate-900/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickStat
              label="Prix d'achat"
              value={formatCurrency(data.purchasePrice)}
              icon={Building2}
            />
            <QuickStat
              label="Mise de fonds"
              value={formatCurrency(downPaymentAmount)}
              icon={PiggyBank}
            />
            <QuickStat
              label="Revenus/mois"
              value={formatCurrency(totalRent)}
              icon={DollarSign}
              positive
            />
            <QuickStat
              label="Logements"
              value={data.numberOfUnits.toString()}
              icon={Home}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// STEP 2: CHANTIER
// ============================================================================
function ChantierStep({
  data,
  updateData,
}: {
  data: WizardData
  updateData: (d: Partial<WizardData>) => void
}) {
  const arvRatio = data.afterRepairValue > 0 ? (data.purchasePrice / data.afterRepairValue) * 100 : 0
  const potentialEquity = data.afterRepairValue - data.purchasePrice - data.renovationBudget
  const maxRefi = data.afterRepairValue * 0.75
  const totalInvestment = data.purchasePrice + data.renovationBudget

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
            Stratégie BRRRR
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-500 mt-0.5">
            Pour un BRRRR réussi, visez un ratio Prix/ARV inférieur à 75% pour récupérer votre mise de fonds au refinancement.
          </p>
        </div>
      </div>

      {/* Renovation Budget */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Hammer className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Budget Rénovation</CardTitle>
              <CardDescription>Estimez les coûts de vos travaux</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Budget total rénovation</Label>
              <CurrencyInput
                value={data.renovationBudget}
                onChange={(e) => updateData({ renovationBudget: Number(e.target.value) || 0 })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Durée des travaux</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={data.renovationDuration}
                  onChange={(e) => updateData({ renovationDuration: Number(e.target.value) || 0 })}
                  className="h-11 pl-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">mois</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Valeur après rénovation (ARV)</Label>
            <CurrencyInput
              value={data.afterRepairValue}
              onChange={(e) => updateData({ afterRepairValue: Number(e.target.value) || 0 })}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Faites évaluer par un courtier ou un évaluateur agréé pour une estimation précise
            </p>
          </div>
        </CardContent>
      </Card>

      {/* BRRRR Preview */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Target className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Aperçu BRRRR</CardTitle>
              <CardDescription>Projection de votre stratégie</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Ratio Prix/ARV"
              value={`${arvRatio.toFixed(1)}%`}
              status={arvRatio <= 70 ? 'good' : arvRatio <= 75 ? 'warning' : 'bad'}
              hint={arvRatio <= 75 ? 'Idéal ≤ 75%' : 'Trop élevé'}
            />
            <MetricCard
              label="Investissement total"
              value={formatCurrency(totalInvestment)}
              status="neutral"
            />
            <MetricCard
              label="Équité créée"
              value={formatCurrency(potentialEquity)}
              status={potentialEquity >= 0 ? 'good' : 'bad'}
            />
            <MetricCard
              label="Max Refi @ 75%"
              value={formatCurrency(maxRefi)}
              status="neutral"
            />
          </div>

          {data.renovationBudget === 0 && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Achat traditionnel</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sans rénovation, l'analyse se fera comme un achat locatif classique.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// STEP 3: OPERATION
// ============================================================================
function OperationStep({
  data,
  updateData,
}: {
  data: WizardData
  updateData: (d: Partial<WizardData>) => void
}) {
  const totalRent = data.monthlyRents.reduce((a, b) => a + b, 0) * 12
  const managementCost = totalRent * (data.managementPercent / 100)
  const totalExpenses =
    data.municipalTax +
    data.schoolTax +
    data.insurance +
    data.maintenance +
    data.snowRemoval +
    managementCost

  const expenseRatio = totalRent > 0 ? (totalExpenses / totalRent) * 100 : 0
  const noi = totalRent - totalExpenses

  return (
    <div className="space-y-6">
      {/* Expenses */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Dépenses d'exploitation</CardTitle>
              <CardDescription>Coûts annuels de l'immeuble</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Taxes municipales</Label>
              <CurrencyInput
                value={data.municipalTax}
                onChange={(e) => updateData({ municipalTax: Number(e.target.value) || 0 })}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">par année</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Taxes scolaires</Label>
              <CurrencyInput
                value={data.schoolTax}
                onChange={(e) => updateData({ schoolTax: Number(e.target.value) || 0 })}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">par année</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Assurance</Label>
              <CurrencyInput
                value={data.insurance}
                onChange={(e) => updateData({ insurance: Number(e.target.value) || 0 })}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">par année</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Maintenance</Label>
              <CurrencyInput
                value={data.maintenance}
                onChange={(e) => updateData({ maintenance: Number(e.target.value) || 0 })}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Suggéré: {formatCurrency(data.numberOfUnits * 500)}/an
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Déneigement</Label>
              <CurrencyInput
                value={data.snowRemoval}
                onChange={(e) => updateData({ snowRemoval: Number(e.target.value) || 0 })}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">par année</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gestion (%)</Label>
              <PercentInput
                value={data.managementPercent}
                onChange={(e) => updateData({ managementPercent: Number(e.target.value) || 0 })}
                className="h-11"
              />
              {data.managementPercent === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  0% = autogestion
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-slate-50 dark:bg-slate-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Résumé des flux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Revenus annuels"
              value={formatCurrency(totalRent)}
              status="good"
              icon={TrendingUp}
            />
            <MetricCard
              label="Dépenses annuelles"
              value={formatCurrency(totalExpenses)}
              status="bad"
              icon={DollarSign}
            />
            <MetricCard
              label="Ratio dépenses"
              value={`${expenseRatio.toFixed(1)}%`}
              status={expenseRatio <= 40 ? 'good' : expenseRatio <= 50 ? 'warning' : 'bad'}
              hint={expenseRatio <= 40 ? 'Excellent' : expenseRatio <= 50 ? 'Acceptable' : 'Élevé'}
            />
            <MetricCard
              label="NOI"
              value={formatCurrency(noi)}
              status={noi >= 0 ? 'good' : 'bad'}
              icon={BarChart3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// STEP 4: VERDICT
// ============================================================================
function VerdictStep({ data }: { data: WizardData }) {
  // Calculs V2
  const loanAmount = data.purchasePrice * (1 - data.downPaymentPercent / 100)
  const isInsured = data.downPaymentPercent < 20
  const totalRent = data.monthlyRents.reduce((a, b) => a + b, 0)

  // Welcome Tax
  const welcomeTaxResult = calculateWelcomeTax(data.purchasePrice, undefined, data.city)

  // SCHL
  const schlResult = isInsured
    ? calculateSCHLPremium(loanAmount, data.purchasePrice, Math.min(data.amortization, 25))
    : { premiumAmount: 0, tvq: 0, newLoanAmount: loanAmount }

  // Mortgage
  const monthlyPayment = calculateMortgagePayment(
    schlResult.newLoanAmount,
    data.interestRate / 100,
    isInsured ? Math.min(data.amortization, 25) : data.amortization
  )

  // NOI
  const grossRevenue = totalRent * 12
  const vacancyLoss = grossRevenue * 0.05
  const totalExpenses =
    data.municipalTax +
    data.schoolTax +
    data.insurance +
    data.maintenance +
    data.snowRemoval +
    grossRevenue * (data.managementPercent / 100)
  const noi = grossRevenue - vacancyLoss - totalExpenses
  const annualDebt = monthlyPayment * 12
  const annualCashflow = noi - annualDebt
  const cashflowPerDoor = annualCashflow / data.numberOfUnits

  // DSCR
  const dscr = annualDebt > 0 ? noi / annualDebt : 0

  // Stress Test
  const stressRate = Math.max(data.interestRate / 100 + 0.02, 0.0525)
  const stressPayment = calculateMortgagePayment(
    schlResult.newLoanAmount,
    stressRate,
    isInsured ? Math.min(data.amortization, 25) : data.amortization
  )
  const dscrStressTested = (stressPayment * 12) > 0 ? noi / (stressPayment * 12) : 0

  // Cap Rate
  const capRate = (noi / data.purchasePrice) * 100

  // Cash invested
  const downPayment = data.purchasePrice * (data.downPaymentPercent / 100)
  const closingCosts = welcomeTaxResult.totalTax + 2000 + 600 + 400 + 350 + schlResult.tvq
  const totalCashInvested = downPayment + closingCosts + data.renovationBudget

  // Cash on Cash
  const cashOnCash = totalCashInvested > 0 ? (annualCashflow / totalCashInvested) * 100 : 0

  // BRRRR Analysis
  const maxRefi = data.afterRepairValue * 0.75
  const cashOut = maxRefi - schlResult.newLoanAmount
  const capitalLeft = totalCashInvested - Math.max(0, cashOut)
  const infiniteReturn = cashOut >= totalCashInvested

  // Grade
  const getGrade = () => {
    let score = 0
    if (dscrStressTested >= 1.3) score += 40
    else if (dscrStressTested >= 1.2) score += 30
    else if (dscrStressTested >= 1.1) score += 20
    else if (dscrStressTested >= 1.0) score += 10

    if (cashflowPerDoor >= 150) score += 40
    else if (cashflowPerDoor >= 100) score += 30
    else if (cashflowPerDoor >= 75) score += 20
    else if (cashflowPerDoor >= 50) score += 10

    if (capRate >= 6) score += 20
    else if (capRate >= 5) score += 15
    else if (capRate >= 4) score += 10

    if (score >= 85) return { grade: 'A', label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-500' }
    if (score >= 70) return { grade: 'B', label: 'Bon', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500' }
    if (score >= 50) return { grade: 'C', label: 'Acceptable', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-500' }
    if (score >= 30) return { grade: 'D', label: 'Risqué', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500' }
    return { grade: 'F', label: 'Éviter', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-500' }
  }

  const gradeInfo = getGrade()

  return (
    <div className="space-y-6">
      {/* Main Verdict Card */}
      <Card className={cn('border-2', gradeInfo.border)}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">Verdict Final</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">
                {data.address || 'Propriété analysée'}
              </h2>
              <p className="text-muted-foreground">
                {data.propertyType.charAt(0).toUpperCase() + data.propertyType.slice(1)} • {data.numberOfUnits} logements • {data.city === 'montreal' ? 'Montréal' : data.city === 'quebec' ? 'Québec' : 'Autre'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className={cn('w-24 h-24 rounded-2xl flex flex-col items-center justify-center', gradeInfo.bg)}>
                <span className={cn('text-4xl font-bold', gradeInfo.color)}>{gradeInfo.grade}</span>
                <span className={cn('text-xs font-medium', gradeInfo.color)}>{gradeInfo.label}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <div className={cn('text-xl md:text-2xl font-bold', annualCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {formatCurrency(annualCashflow / 12)}
              </div>
              <div className="text-xs text-muted-foreground">Cashflow/mois</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <div className={cn('text-xl md:text-2xl font-bold', cashflowPerDoor / 12 >= 75 ? 'text-emerald-600' : 'text-amber-600')}>
                {formatCurrency(cashflowPerDoor / 12)}
              </div>
              <div className="text-xs text-muted-foreground">Par porte/mois</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <div className="text-xl md:text-2xl font-bold">{capRate.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">Cap Rate</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <div className={cn('text-xl md:text-2xl font-bold', cashOnCash >= 8 ? 'text-emerald-600' : 'text-amber-600')}>
                {cashOnCash.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Cash-on-Cash</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DSCR Gauge */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Gauge className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Stress Test B-20</CardTitle>
              <CardDescription>Ratio de couverture du service de la dette</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DSCRGauge dscr={dscr} dscrStressTested={dscrStressTested} />

          {dscrStressTested < 1.0 && (
            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-800 dark:text-rose-400">
                  DSCR insuffisant sous stress test
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-500 mt-0.5">
                  Avec un taux de {(stressRate * 100).toFixed(2)}%, le NOI ne couvre pas le service de la dette.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sensitivity Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Analyse de Sensibilité</CardTitle>
              <CardDescription>Impact des variations de taux sur le cashflow</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SensitivityTable
            loanAmount={schlResult.newLoanAmount}
            baseRate={data.interestRate}
            amortization={isInsured ? Math.min(data.amortization, 25) : data.amortization}
            noi={noi}
          />
        </CardContent>
      </Card>

      {/* BRRRR Analysis */}
      {data.renovationBudget > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Analyse BRRRR</CardTitle>
                <CardDescription>Buy-Rehab-Rent-Refinance-Repeat</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MiniWaterfall
              totalInvested={totalCashInvested}
              cashOut={Math.max(0, cashOut)}
              equityCreated={data.afterRepairValue - maxRefi}
            />

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-sm text-muted-foreground mb-1">Capital dans le deal</div>
                <div className={cn('text-xl font-bold', capitalLeft <= 0 ? 'text-emerald-600' : 'text-blue-600')}>
                  {capitalLeft <= 0 ? '0$ (Retour Infini!)' : formatCurrency(capitalLeft)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="text-sm text-muted-foreground mb-1">Cash-out au refinancement</div>
                <div className="text-xl font-bold text-emerald-600">
                  {formatCurrency(Math.max(0, cashOut))}
                </div>
              </div>
            </div>

            {infiniteReturn && (
              <div className="mt-4 p-4 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl text-center">
                <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                  🎉 Retour Infini! Tout votre capital est recyclé!
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Closing Costs */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Calculator className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Frais de clôture détaillés</CardTitle>
              <CardDescription>Tous les coûts à prévoir</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <CostLine label={`Taxe de bienvenue (${data.city === 'montreal' ? 'Montréal' : data.city === 'quebec' ? 'Québec' : 'Standard'})`} value={welcomeTaxResult.totalTax} />
            <CostLine label="Notaire" value={2000} />
            <CostLine label="Inspection" value={600} />
            <CostLine label="Évaluation" value={400} />
            <CostLine label="Assurance titre" value={350} />
            {isInsured && (
              <>
                <CostLine label="Prime SCHL (finançable)" value={schlResult.premiumAmount} />
                <CostLine label="TVQ sur SCHL (NON finançable)" value={schlResult.tvq} warning />
              </>
            )}

            <div className="h-px bg-border my-3" />

            <CostLine label="Total frais de clôture" value={closingCosts} bold />
            <CostLine label="Mise de fonds" value={downPayment} bold />
            {data.renovationBudget > 0 && (
              <CostLine label="Budget rénovation" value={data.renovationBudget} bold />
            )}

            <div className="h-px bg-border my-3" />

            <div className="flex justify-between items-center py-2 px-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <span className="font-bold text-base">Total cash requis</span>
              <span className="font-bold text-lg text-emerald-600">{formatCurrency(totalCashInvested)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function QuickStat({
  label,
  value,
  icon: Icon,
  positive
}: {
  label: string
  value: string
  icon: React.ElementType
  positive?: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800">
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        positive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-700'
      )}>
        <Icon className={cn('h-5 w-5', positive ? 'text-emerald-600' : 'text-slate-500')} />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn('font-semibold', positive && 'text-emerald-600')}>{value}</div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  status,
  hint,
  icon: Icon
}: {
  label: string
  value: string
  status: 'good' | 'warning' | 'bad' | 'neutral'
  hint?: string
  icon?: React.ElementType
}) {
  const statusStyles = {
    good: 'text-emerald-600',
    warning: 'text-amber-600',
    bad: 'text-rose-600',
    neutral: 'text-foreground'
  }

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 text-center">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-2">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>
      )}
      <div className={cn('text-xl font-bold', statusStyles[status])}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {hint && <div className={cn('text-xs mt-1', statusStyles[status])}>{hint}</div>}
    </div>
  )
}

function CostLine({
  label,
  value,
  bold,
  warning
}: {
  label: string
  value: number
  bold?: boolean
  warning?: boolean
}) {
  return (
    <div className={cn(
      'flex justify-between items-center',
      bold && 'font-semibold',
      warning && 'text-amber-600'
    )}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  )
}
