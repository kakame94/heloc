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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">PlexInvest</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">V2</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/calculateur" className="text-sm font-medium hover:text-primary transition-colors">
              Calculateur
            </Link>
            <Link href="/analyse" className="text-sm font-medium hover:text-primary transition-colors">
              Analyse
            </Link>
            <Link href="/wizard" className="text-sm font-medium text-primary">
              Wizard V2
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
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
                        'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                        isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                        isCompleted && 'bg-emerald-500 text-white',
                        !isCurrent && !isCompleted && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                    </div>
                    <div className="text-center">
                      <div className={cn('text-sm font-medium', isCurrent && 'text-primary')}>
                        {step.label}
                      </div>
                      <div className="text-xs text-muted-foreground hidden md:block">
                        {step.description}
                      </div>
                    </div>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-1 mx-2 rounded-full transition-all',
                        index < currentStepIndex ? 'bg-emerald-500' : 'bg-muted'
                      )}
                    />
                  )}
                </React.Fragment>
              )
            })}
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
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          {currentStepIndex < STEPS.length - 1 ? (
            <Button onClick={goToNext} className="gap-2">
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Check className="h-4 w-4" />
              Analyse Complète
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

  return (
    <div className="space-y-6">
      {/* PDF Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importer une fiche PDF
          </CardTitle>
          <CardDescription>
            Importez une fiche Centris, DuProprio ou courtier pour pré-remplir automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicPdfUploader onDataExtracted={onPdfExtracted} />
        </CardContent>
      </Card>

      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Informations de la propriété
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={data.address}
                onChange={(e) => updateData({ address: e.target.value })}
                placeholder="123 rue Example, Montréal"
              />
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <select
                value={data.city}
                onChange={(e) => updateData({ city: e.target.value as WizardData['city'] })}
                className="w-full h-10 px-3 rounded-md border bg-background"
              >
                <option value="montreal">Montréal</option>
                <option value="quebec">Québec</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type de propriété</Label>
              <select
                value={data.propertyType}
                onChange={(e) => updateData({ propertyType: e.target.value as WizardData['propertyType'] })}
                className="w-full h-10 px-3 rounded-md border bg-background"
              >
                <option value="duplex">Duplex</option>
                <option value="triplex">Triplex</option>
                <option value="quadruplex">Quadruplex</option>
                <option value="quintuplex">Quintuplex</option>
                <option value="sixplex">Sixplex</option>
                <option value="multilogement">Multi-logement (7+)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Nombre de logements</Label>
              <Input
                type="number"
                value={data.numberOfUnits}
                onChange={(e) => updateData({ numberOfUnits: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix d'achat</Label>
              <CurrencyInput
                value={data.purchasePrice}
                onChange={(e) => updateData({ purchasePrice: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Loyers mensuels (séparés par virgule)</Label>
            <Input
              value={data.monthlyRents.join(', ')}
              onChange={(e) => {
                const rents = e.target.value.split(',').map((r) => Number(r.trim()) || 0)
                updateData({ monthlyRents: rents })
              }}
              placeholder="1200, 1100, 900"
            />
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-medium">{formatCurrency(totalRent)}/mois</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Financement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Mise de fonds (%)</Label>
              <PercentInput
                value={data.downPaymentPercent}
                onChange={(e) => updateData({ downPaymentPercent: Number(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                = {formatCurrency(data.purchasePrice * (data.downPaymentPercent / 100))}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Taux d'intérêt (%)</Label>
              <PercentInput
                value={data.interestRate}
                onChange={(e) => updateData({ interestRate: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Amortissement (années)</Label>
              <Input
                type="number"
                value={data.amortization}
                onChange={(e) => updateData({ amortization: Number(e.target.value) || 25 })}
              />
              {data.downPaymentPercent < 20 && data.amortization > 25 && (
                <p className="text-xs text-amber-600">⚠️ Max 25 ans pour prêt assuré</p>
              )}
            </div>
          </div>

          {data.downPaymentPercent < 20 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                ⚠️ <strong>Prêt assuré SCHL requis</strong> - Mise de fonds &lt; 20%
              </p>
            </div>
          )}
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hammer className="h-5 w-5" />
            Budget Rénovation
          </CardTitle>
          <CardDescription>
            Pour un BRRRR: visez à créer de l'équité pour récupérer votre mise de fonds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget rénovation</Label>
              <CurrencyInput
                value={data.renovationBudget}
                onChange={(e) => updateData({ renovationBudget: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Durée des travaux (mois)</Label>
              <Input
                type="number"
                value={data.renovationDuration}
                onChange={(e) => updateData({ renovationDuration: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valeur après rénovation (ARV)</Label>
            <CurrencyInput
              value={data.afterRepairValue}
              onChange={(e) => updateData({ afterRepairValue: Number(e.target.value) || 0 })}
            />
            <p className="text-sm text-muted-foreground">
              Faites évaluer par un courtier ou un évaluateur agréé
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu BRRRR */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu BRRRR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold">{arvRatio.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Prix / ARV</div>
              {arvRatio > 75 && <p className="text-xs text-amber-600 mt-1">Idéal: &lt; 75%</p>}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className={cn('text-2xl font-bold', potentialEquity >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {formatCurrency(potentialEquity)}
              </div>
              <div className="text-sm text-muted-foreground">Équité potentielle</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(data.afterRepairValue * 0.75)}
              </div>
              <div className="text-sm text-muted-foreground">Max refi @ 75%</div>
            </div>
          </div>

          {data.renovationBudget === 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 Sans rénovation, c'est un achat traditionnel. Pour un BRRRR, ajoutez un budget de rénovation.
              </p>
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
  const totalExpenses =
    data.municipalTax +
    data.schoolTax +
    data.insurance +
    data.maintenance +
    data.snowRemoval +
    totalRent * (data.managementPercent / 100)

  const expenseRatio = totalRent > 0 ? (totalExpenses / totalRent) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Dépenses d'exploitation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Taxes municipales (annuel)</Label>
              <CurrencyInput
                value={data.municipalTax}
                onChange={(e) => updateData({ municipalTax: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Taxes scolaires (annuel)</Label>
              <CurrencyInput
                value={data.schoolTax}
                onChange={(e) => updateData({ schoolTax: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Assurance (annuel)</Label>
              <CurrencyInput
                value={data.insurance}
                onChange={(e) => updateData({ insurance: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Maintenance (annuel)</Label>
              <CurrencyInput
                value={data.maintenance}
                onChange={(e) => updateData({ maintenance: Number(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Suggéré: {formatCurrency(data.numberOfUnits * 500)}/an ({data.numberOfUnits} × 500$)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Déneigement (annuel)</Label>
              <CurrencyInput
                value={data.snowRemoval}
                onChange={(e) => updateData({ snowRemoval: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gestion (%)</Label>
              <PercentInput
                value={data.managementPercent}
                onChange={(e) => updateData({ managementPercent: Number(e.target.value) || 0 })}
              />
              {data.managementPercent === 0 && (
                <p className="text-xs text-amber-600">⚠️ 0% = vous achetez un emploi</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des flux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRent)}</div>
              <div className="text-sm text-muted-foreground">Revenus annuels</div>
            </div>
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-rose-600">{formatCurrency(totalExpenses)}</div>
              <div className="text-sm text-muted-foreground">Dépenses annuelles</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className={cn('text-2xl font-bold', expenseRatio <= 40 ? 'text-emerald-600' : expenseRatio <= 50 ? 'text-amber-600' : 'text-rose-600')}>
                {expenseRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Ratio dépenses</div>
              {expenseRatio > 50 && <p className="text-xs text-rose-600 mt-1">Élevé (&gt;50%)</p>}
            </div>
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

    if (score >= 85) return { grade: 'A', color: 'text-emerald-600', bg: 'bg-emerald-100' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 50) return { grade: 'C', color: 'text-amber-600', bg: 'bg-amber-100' }
    if (score >= 30) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { grade: 'F', color: 'text-rose-600', bg: 'bg-rose-100' }
  }

  const gradeInfo = getGrade()

  return (
    <div className="space-y-6">
      {/* Grade et Verdict */}
      <Card className="border-2 border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Verdict Final</h2>
              <p className="text-muted-foreground">{data.address || 'Propriété analysée'}</p>
            </div>
            <div className={cn('w-20 h-20 rounded-full flex items-center justify-center', gradeInfo.bg)}>
              <span className={cn('text-4xl font-bold', gradeInfo.color)}>{gradeInfo.grade}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className={cn('text-2xl font-bold', annualCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {formatCurrency(annualCashflow / 12)}
              </div>
              <div className="text-sm text-muted-foreground">Cashflow/mois</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className={cn('text-2xl font-bold', cashflowPerDoor >= 75 ? 'text-emerald-600' : 'text-amber-600')}>
                {formatCurrency(cashflowPerDoor / 12)}
              </div>
              <div className="text-sm text-muted-foreground">Par porte/mois</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{capRate.toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground">Cap Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className={cn('text-2xl font-bold', cashOnCash >= 8 ? 'text-emerald-600' : 'text-amber-600')}>
                {cashOnCash.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Cash-on-Cash</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DSCR Gauge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Stress Test B-20
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DSCRGauge dscr={dscr} dscrStressTested={dscrStressTested} />
        </CardContent>
      </Card>

      {/* Sensitivity Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analyse de Sensibilité
          </CardTitle>
          <CardDescription>Impact des variations de taux sur le cashflow</CardDescription>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analyse BRRRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniWaterfall
              totalInvested={totalCashInvested}
              cashOut={Math.max(0, cashOut)}
              equityCreated={data.afterRepairValue - maxRefi}
            />

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Capital dans le deal</div>
                <div className={cn('text-xl font-bold', capitalLeft <= 0 ? 'text-emerald-600' : 'text-blue-600')}>
                  {capitalLeft <= 0 ? '0$ (Retour Infini!)' : formatCurrency(capitalLeft)}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Cash-out au refi</div>
                <div className="text-xl font-bold text-emerald-600">
                  {formatCurrency(Math.max(0, cashOut))}
                </div>
              </div>
            </div>

            {infiniteReturn && (
              <div className="mt-4 p-4 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg text-center">
                <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                  🎉 Retour Infini! Tout votre capital est recyclé!
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Frais de clôture */}
      <Card>
        <CardHeader>
          <CardTitle>Frais de clôture détaillés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Taxe de bienvenue ({data.city === 'montreal' ? 'Montréal' : data.city === 'quebec' ? 'Québec' : 'Standard'})</span>
              <span className="font-medium">{formatCurrency(welcomeTaxResult.totalTax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Notaire</span>
              <span className="font-medium">{formatCurrency(2000)}</span>
            </div>
            <div className="flex justify-between">
              <span>Inspection</span>
              <span className="font-medium">{formatCurrency(600)}</span>
            </div>
            <div className="flex justify-between">
              <span>Évaluation</span>
              <span className="font-medium">{formatCurrency(400)}</span>
            </div>
            <div className="flex justify-between">
              <span>Assurance titre</span>
              <span className="font-medium">{formatCurrency(350)}</span>
            </div>
            {isInsured && (
              <>
                <div className="flex justify-between">
                  <span>Prime SCHL (finançable)</span>
                  <span className="font-medium">{formatCurrency(schlResult.premiumAmount)}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>TVQ sur SCHL (NON finançable!)</span>
                  <span className="font-medium">{formatCurrency(schlResult.tvq)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold">Total frais de clôture</span>
              <span className="font-bold">{formatCurrency(closingCosts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Mise de fonds</span>
              <span className="font-bold">{formatCurrency(downPayment)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2 text-lg">
              <span className="font-bold">Total cash requis</span>
              <span className="font-bold text-primary">{formatCurrency(totalCashInvested)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
