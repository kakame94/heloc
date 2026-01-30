'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Building2,
  TrendingUp,
  Calculator,
  Table2,
  Lightbulb,
  ChevronRight,
  Plus,
  Trash2,
  BarChart3,
  DollarSign,
  Percent,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input, CurrencyInput, PercentInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  analyzeWithComparables,
  calculatePropertyMultipliers,
  EXAMPLE_SUBJECT,
  EXAMPLE_COMPARABLES,
  type ComparableProperty,
} from '@/lib/calculations/comparables'

import {
  calculateProjections,
  calculate8thWonder,
  EXAMPLE_PROJECTION_PARAMS,
} from '@/lib/calculations/projections'

import {
  generateAmortizationSchedule,
  compareAmortizations,
} from '@/lib/calculations/amortization'

import {
  analyzeCashBackStrategy,
  analyzeCapitalOnlyStrategy,
  analyzeAcceleratedPayments,
} from '@/lib/calculations/strategies'

type TabId = 'comparables' | 'projections' | 'amortization' | 'strategies'

export default function AnalysePage() {
  const [activeTab, setActiveTab] = React.useState<TabId>('comparables')

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'comparables', label: 'Comparables', icon: Building2 },
    { id: 'projections', label: 'Projections 5 ans', icon: TrendingUp },
    { id: 'amortization', label: 'Amortissement', icon: Table2 },
    { id: 'strategies', label: 'Stratégies', icon: Lightbulb },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">PlexInvest</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Québec
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/calculateur" className="text-sm font-medium hover:text-primary transition-colors">
              Calculateur
            </Link>
            <Link href="/analyse" className="text-sm font-medium text-primary">
              Analyse
            </Link>
            <Link href="/guide" className="text-sm font-medium hover:text-primary transition-colors">
              Guide
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analyse Avancée</h1>
          <p className="text-muted-foreground">
            Outils professionnels d'analyse immobilière inspirés du modèle Walkens
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'comparables' && <ComparablesTab />}
        {activeTab === 'projections' && <ProjectionsTab />}
        {activeTab === 'amortization' && <AmortizationTab />}
        {activeTab === 'strategies' && <StrategiesTab />}
      </div>
    </div>
  )
}

// ============================================================================
// TAB: COMPARABLES
// ============================================================================
function ComparablesTab() {
  const [subject, setSubject] = React.useState<ComparableProperty>(EXAMPLE_SUBJECT)
  const [comparables, setComparables] = React.useState<ComparableProperty[]>(EXAMPLE_COMPARABLES)

  const analysis = React.useMemo(() => {
    if (comparables.length === 0) return null
    return analyzeWithComparables(subject, comparables)
  }, [subject, comparables])

  const subjectMetrics = calculatePropertyMultipliers(subject)

  return (
    <div className="space-y-6">
      {/* Propriété Sujet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Propriété Sujet
          </CardTitle>
          <CardDescription>La propriété que vous analysez</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={subject.address}
                onChange={(e) => setSubject({ ...subject, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix de vente</Label>
              <CurrencyInput
                value={subject.salePrice}
                onChange={(e) => setSubject({ ...subject, salePrice: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre de logements</Label>
              <Input
                type="number"
                value={subject.numberOfUnits}
                onChange={(e) => setSubject({ ...subject, numberOfUnits: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Loyers mensuels (séparés par virgule)</Label>
              <Input
                value={subject.monthlyRents.join(', ')}
                onChange={(e) => {
                  const rents = e.target.value.split(',').map(r => Number(r.trim()) || 0)
                  setSubject({ ...subject, monthlyRents: rents })
                }}
                placeholder="1150, 1720"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Taxes municipales (annuel)</Label>
              <CurrencyInput
                value={subject.annualExpenses.municipalTax}
                onChange={(e) => setSubject({
                  ...subject,
                  annualExpenses: { ...subject.annualExpenses, municipalTax: Number(e.target.value) || 0 }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Taxes scolaires (annuel)</Label>
              <CurrencyInput
                value={subject.annualExpenses.schoolTax}
                onChange={(e) => setSubject({
                  ...subject,
                  annualExpenses: { ...subject.annualExpenses, schoolTax: Number(e.target.value) || 0 }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Assurance (annuel)</Label>
              <CurrencyInput
                value={subject.annualExpenses.insurance}
                onChange={(e) => setSubject({
                  ...subject,
                  annualExpenses: { ...subject.annualExpenses, insurance: Number(e.target.value) || 0 }
                })}
              />
            </div>
          </div>

          {/* Multiplicateurs du sujet */}
          <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{subjectMetrics.grossRentMultiplier.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">MRB</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{subjectMetrics.netIncomeMultiplier.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">MRN</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(subjectMetrics.pricePerDoor)}</div>
              <div className="text-sm text-muted-foreground">Prix/Porte</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparables ({comparables.length})
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setComparables([...comparables, {
                address: '',
                numberOfUnits: subject.numberOfUnits,
                salePrice: 0,
                monthlyRents: [],
                annualExpenses: { municipalTax: 0, schoolTax: 0, insurance: 0 }
              }])}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparables.map((comp, index) => {
              const metrics = calculatePropertyMultipliers(comp)
              return (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Comparable #{index + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setComparables(comparables.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Adresse</Label>
                      <Input
                        value={comp.address}
                        onChange={(e) => {
                          const updated = [...comparables]
                          updated[index] = { ...comp, address: e.target.value }
                          setComparables(updated)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prix</Label>
                      <CurrencyInput
                        value={comp.salePrice}
                        onChange={(e) => {
                          const updated = [...comparables]
                          updated[index] = { ...comp, salePrice: Number(e.target.value) || 0 }
                          setComparables(updated)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Logements</Label>
                      <Input
                        type="number"
                        value={comp.numberOfUnits}
                        onChange={(e) => {
                          const updated = [...comparables]
                          updated[index] = { ...comp, numberOfUnits: Number(e.target.value) || 1 }
                          setComparables(updated)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Loyers</Label>
                      <Input
                        value={comp.monthlyRents.join(', ')}
                        onChange={(e) => {
                          const rents = e.target.value.split(',').map(r => Number(r.trim()) || 0)
                          const updated = [...comparables]
                          updated[index] = { ...comp, monthlyRents: rents }
                          setComparables(updated)
                        }}
                        placeholder="2000, 850"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded">
                    <div className="text-center">
                      <div className="font-semibold">{metrics.grossRentMultiplier.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">MRB</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{metrics.netIncomeMultiplier.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">MRN</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{formatCurrency(metrics.pricePerDoor)}</div>
                      <div className="text-xs text-muted-foreground">Prix/Porte</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Résultat de l'analyse */}
      {analysis && (
        <Card className={cn(
          'border-2',
          analysis.priceVariance.isOverpriced ? 'border-amber-500' : 'border-emerald-500'
        )}>
          <CardHeader>
            <CardTitle>Résultat de l'Analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Moyennes des Comparables</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MRB moyen</span>
                    <span className="font-medium">{analysis.averages.grossRentMultiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MRN moyen</span>
                    <span className="font-medium">{analysis.averages.netIncomeMultiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prix/Porte moyen</span>
                    <span className="font-medium">{formatCurrency(analysis.averages.pricePerDoor)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Valeur Marchande Estimée</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Par MRB</span>
                    <span className="font-medium">{formatCurrency(analysis.estimatedValues.byGrossRentMultiplier)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Par MRN</span>
                    <span className="font-medium">{formatCurrency(analysis.estimatedValues.byNetIncomeMultiplier)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Par Prix/Porte</span>
                    <span className="font-medium">{formatCurrency(analysis.estimatedValues.byPricePerDoor)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-semibold">Moyenne</span>
                    <span className="font-bold text-lg">{formatCurrency(analysis.estimatedValues.averageEstimate)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(
              'mt-6 p-4 rounded-lg text-center',
              analysis.priceVariance.isOverpriced ? 'bg-amber-100 dark:bg-amber-950' : 'bg-emerald-100 dark:bg-emerald-950'
            )}>
              <div className="text-sm text-muted-foreground mb-1">
                {analysis.priceVariance.isOverpriced ? 'Surpayé de' : 'Sous-évalué de'}
              </div>
              <div className={cn(
                'text-3xl font-bold flex items-center justify-center gap-2',
                analysis.priceVariance.isOverpriced ? 'text-amber-600' : 'text-emerald-600'
              )}>
                {analysis.priceVariance.isOverpriced ? <ArrowUpRight /> : <ArrowDownRight />}
                {formatCurrency(Math.abs(analysis.priceVariance.amount))}
                <span className="text-lg">({Math.abs(analysis.priceVariance.percent).toFixed(1)}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// TAB: PROJECTIONS
// ============================================================================
function ProjectionsTab() {
  const [params, setParams] = React.useState(EXAMPLE_PROJECTION_PARAMS)

  const projections = React.useMemo(() => {
    return calculateProjections(params)
  }, [params])

  const wonderGrowth = React.useMemo(() => {
    return calculate8thWonder(params.purchasePrice * params.downPaymentPercent, 0.7, 10)
  }, [params])

  return (
    <div className="space-y-6">
      {/* Paramètres */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Prix d'achat</Label>
              <CurrencyInput
                value={params.purchasePrice}
                onChange={(e) => setParams({ ...params, purchasePrice: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mise de fonds (%)</Label>
              <PercentInput
                value={params.downPaymentPercent * 100}
                onChange={(e) => setParams({ ...params, downPaymentPercent: (Number(e.target.value) || 0) / 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Taux hypothécaire (%)</Label>
              <PercentInput
                value={params.mortgageRate * 100}
                onChange={(e) => setParams({ ...params, mortgageRate: (Number(e.target.value) || 0) / 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Loyer mensuel</Label>
              <CurrencyInput
                value={params.monthlyRent}
                onChange={(e) => setParams({ ...params, monthlyRent: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Croissance loyers (%/an)</Label>
              <PercentInput
                value={params.rentGrowthRate * 100}
                onChange={(e) => setParams({ ...params, rentGrowthRate: (Number(e.target.value) || 0) / 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dépenses annuelles</Label>
              <CurrencyInput
                value={params.annualExpenses}
                onChange={(e) => setParams({ ...params, annualExpenses: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Appréciation (%/an)</Label>
              <PercentInput
                value={params.appreciationRate * 100}
                onChange={(e) => setParams({ ...params, appreciationRate: (Number(e.target.value) || 0) / 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prime SCHL (%)</Label>
              <PercentInput
                value={(params.schlPremiumPercent ?? 0) * 100}
                onChange={(e) => setParams({ ...params, schlPremiumPercent: (Number(e.target.value) || 0) / 100 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{formatCurrency(projections.initialInvestment)}</div>
              <div className="text-sm text-muted-foreground">Investissement initial</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(projections.summary.totalCashflow)}</div>
              <div className="text-sm text-muted-foreground">Cashflow total (5 ans)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(projections.summary.finalEquity)}</div>
              <div className="text-sm text-muted-foreground">Équité finale</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Percent className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-purple-600">{projections.summary.averageTotalReturn.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Rendement moyen/an</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des projections */}
      <Card>
        <CardHeader>
          <CardTitle>Projections sur 5 ans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Année</th>
                  <th className="text-right p-2">Revenus</th>
                  <th className="text-right p-2">Dépenses</th>
                  <th className="text-right p-2">Hypothèque</th>
                  <th className="text-right p-2">Cashflow</th>
                  <th className="text-right p-2">CoC %</th>
                  <th className="text-right p-2">Valeur</th>
                  <th className="text-right p-2">Équité</th>
                  <th className="text-right p-2">Rendement Total</th>
                </tr>
              </thead>
              <tbody>
                {projections.projections.map((p) => (
                  <tr key={p.year} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">Année {p.year}</td>
                    <td className="text-right p-2">{formatCurrency(p.annualRent)}</td>
                    <td className="text-right p-2">{formatCurrency(p.annualExpenses)}</td>
                    <td className="text-right p-2">{formatCurrency(p.annualMortgagePayment)}</td>
                    <td className={cn('text-right p-2 font-medium', p.annualCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                      {formatCurrency(p.annualCashflow)}
                    </td>
                    <td className="text-right p-2">{p.cashOnCashReturn.toFixed(1)}%</td>
                    <td className="text-right p-2">{formatCurrency(p.propertyValue)}</td>
                    <td className="text-right p-2">{formatCurrency(p.equity)}</td>
                    <td className="text-right p-2 font-bold text-primary">{p.totalReturn.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 8ème Merveille */}
      <Card>
        <CardHeader>
          <CardTitle>La 8ème Merveille du Monde - Effet Composé BRRRR</CardTitle>
          <CardDescription>
            Si vous réinvestissez votre mise de fonds avec un rendement de 70% par cycle BRRRR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cycle</th>
                  <th className="text-right p-2">Montant Initial</th>
                  <th className="text-right p-2">Gain</th>
                  <th className="text-right p-2">Nouveau Montant</th>
                  <th className="text-right p-2">Multiplicateur</th>
                </tr>
              </thead>
              <tbody>
                {wonderGrowth.slice(0, 10).map((row) => (
                  <tr key={row.period} className="border-b hover:bg-muted/50">
                    <td className="p-2">{row.period}</td>
                    <td className="text-right p-2">{formatCurrency(row.startingAmount)}</td>
                    <td className="text-right p-2 text-emerald-600">{formatCurrency(row.gain)}</td>
                    <td className="text-right p-2 font-medium">{formatCurrency(row.endingAmount)}</td>
                    <td className="text-right p-2 font-bold text-primary">{row.multiplier.toFixed(1)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// TAB: AMORTIZATION
// ============================================================================
function AmortizationTab() {
  const [loanAmount, setLoanAmount] = React.useState(409760)
  const [rate, setRate] = React.useState(4)
  const [years, setYears] = React.useState(25)

  const schedule = React.useMemo(() => {
    return generateAmortizationSchedule(loanAmount, rate / 100, years)
  }, [loanAmount, rate, years])

  const comparison = React.useMemo(() => {
    return compareAmortizations(loanAmount, rate / 100, 25, 30)
  }, [loanAmount, rate])

  return (
    <div className="space-y-6">
      {/* Paramètres */}
      <Card>
        <CardHeader>
          <CardTitle>Table d'Amortissement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Montant du prêt</Label>
              <CurrencyInput
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Taux d'intérêt (%)</Label>
              <PercentInput
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amortissement (années)</Label>
              <Input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value) || 25)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{formatCurrency(schedule.monthlyPayment)}</div>
            <div className="text-sm text-muted-foreground">Paiement mensuel</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-rose-600">{formatCurrency(schedule.totalInterest)}</div>
            <div className="text-sm text-muted-foreground">Intérêts totaux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{formatCurrency(schedule.totalCost)}</div>
            <div className="text-sm text-muted-foreground">Coût total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{(schedule.effectiveRate * 100).toFixed(3)}%</div>
            <div className="text-sm text-muted-foreground">Taux effectif annuel</div>
          </CardContent>
        </Card>
      </div>

      {/* Comparaison 25 vs 30 ans */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison 25 ans vs 30 ans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">25 ans</div>
              <div className="text-xl font-bold">{formatCurrency(comparison.scenario1.monthlyPayment)}/mois</div>
              <div className="text-sm text-rose-600">Intérêts: {formatCurrency(comparison.scenario1.totalInterest)}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">30 ans</div>
              <div className="text-xl font-bold">{formatCurrency(comparison.scenario2.monthlyPayment)}/mois</div>
              <div className="text-sm text-rose-600">Intérêts: {formatCurrency(comparison.scenario2.totalInterest)}</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Différence</div>
              <div className="text-xl font-bold text-primary">{formatCurrency(Math.abs(comparison.difference.monthlyPayment))}/mois</div>
              <div className="text-sm text-emerald-600">Économie: {formatCurrency(Math.abs(comparison.difference.totalInterest))}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table annuelle */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé Annuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Année</th>
                  <th className="text-right p-2">Solde début</th>
                  <th className="text-right p-2">Capital payé</th>
                  <th className="text-right p-2">Intérêts payés</th>
                  <th className="text-right p-2">Solde fin</th>
                  <th className="text-right p-2">% remboursé</th>
                </tr>
              </thead>
              <tbody>
                {schedule.annualSummary.slice(0, 10).map((row) => (
                  <tr key={row.year} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{row.year}</td>
                    <td className="text-right p-2">{formatCurrency(row.startingBalance)}</td>
                    <td className="text-right p-2 text-emerald-600">{formatCurrency(row.totalPrincipalPaid)}</td>
                    <td className="text-right p-2 text-rose-600">{formatCurrency(row.totalInterestPaid)}</td>
                    <td className="text-right p-2">{formatCurrency(row.endingBalance)}</td>
                    <td className="text-right p-2">{row.percentPaidOff.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// TAB: STRATEGIES
// ============================================================================
function StrategiesTab() {
  const [loanAmount, setLoanAmount] = React.useState(394000)
  const [baseRate, setBaseRate] = React.useState(4.5)
  const [cashBackRate, setCashBackRate] = React.useState(5.5)
  const [cashBackPercent, setCashBackPercent] = React.useState(3)

  const cashBackAnalysis = React.useMemo(() => {
    return analyzeCashBackStrategy({
      purchasePrice: loanAmount / 0.95,
      downPaymentPercent: 0.05,
      amortizationYears: 25,
      rateWithoutCashBack: baseRate / 100,
      rateWithCashBack: cashBackRate / 100,
      cashBackPercent: cashBackPercent / 100,
    })
  }, [loanAmount, baseRate, cashBackRate, cashBackPercent])

  const capitalOnlyAnalysis = React.useMemo(() => {
    return analyzeCapitalOnlyStrategy({
      loanAmount,
      annualRate: baseRate / 100,
      amortizationYears: 25,
      interestOnlyPeriodMonths: 12,
    })
  }, [loanAmount, baseRate])

  const acceleratedAnalysis = React.useMemo(() => {
    return analyzeAcceleratedPayments({
      loanAmount,
      annualRate: baseRate / 100,
      amortizationYears: 25,
      additionalMonthlyPayment: 200,
      additionalAnnualPayment: 0,
    })
  }, [loanAmount, baseRate])

  return (
    <div className="space-y-6">
      {/* Paramètres communs */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Montant du prêt</Label>
              <CurrencyInput
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Taux de base (%)</Label>
              <PercentInput
                value={baseRate}
                onChange={(e) => setBaseRate(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Taux avec Cash Back (%)</Label>
              <PercentInput
                value={cashBackRate}
                onChange={(e) => setCashBackRate(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cash Back (%)</Label>
              <PercentInput
                value={cashBackPercent}
                onChange={(e) => setCashBackPercent(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stratégie Cash Back */}
      <Card>
        <CardHeader>
          <CardTitle>Stratégie #1 - Cash Back</CardTitle>
          <CardDescription>
            Analysez si accepter un taux plus élevé en échange d'une remise en vaut la peine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Sans Cash Back ({(baseRate).toFixed(2)}%)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Paiement mensuel</span>
                  <span className="font-medium">{formatCurrency(cashBackAnalysis.withoutCashBack.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Intérêts totaux</span>
                  <span>{formatCurrency(cashBackAnalysis.withoutCashBack.totalInterest)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Avec Cash Back ({(cashBackRate).toFixed(2)}%)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Paiement mensuel</span>
                  <span className="font-medium">{formatCurrency(cashBackAnalysis.withCashBack.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Back reçu</span>
                  <span className="text-emerald-600 font-bold">{formatCurrency(cashBackAnalysis.withCashBack.cashBackAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mise de fonds effective</span>
                  <span>{formatCurrency(cashBackAnalysis.withCashBack.effectiveDownPayment)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            'mt-6 p-4 rounded-lg',
            cashBackAnalysis.analysis.isWorthIt ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-amber-100 dark:bg-amber-950'
          )}>
            <div className="font-semibold mb-2">
              {cashBackAnalysis.analysis.isWorthIt ? '✅ Recommandé' : '⚠️ Non recommandé'}
            </div>
            <p className="text-sm">{cashBackAnalysis.analysis.recommendation}</p>
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Break-even: </span>
              <span className="font-medium">
                {cashBackAnalysis.analysis.breakEvenMonths === Infinity
                  ? 'Jamais (gratuit!)'
                  : `${cashBackAnalysis.analysis.breakEvenMonths} mois`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stratégie Capital Only */}
      <Card>
        <CardHeader>
          <CardTitle>Stratégie #2 - Intérêts Seulement</CardTitle>
          <CardDescription>
            Payer seulement les intérêts pendant la période de rénovation pour maximiser le cashflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Standard (Capital + Intérêts)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Paiement mensuel</span>
                  <span className="font-medium">{formatCurrency(capitalOnlyAnalysis.standard.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capital payé (1ère année)</span>
                  <span className="text-emerald-600">{formatCurrency(capitalOnlyAnalysis.standard.principalPaidFirstYear)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Intérêts Seulement (12 mois)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Paiement pendant IO</span>
                  <span className="font-medium">{formatCurrency(capitalOnlyAnalysis.interestOnly.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Boost de cashflow</span>
                  <span className="text-emerald-600 font-bold">+{formatCurrency(capitalOnlyAnalysis.interestOnly.cashflowBoost)}/mois</span>
                </div>
                <div className="flex justify-between">
                  <span>Paiement après IO</span>
                  <span>{formatCurrency(capitalOnlyAnalysis.interestOnly.monthlyPaymentAfter)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-950 rounded-lg">
            <p className="text-sm">{capitalOnlyAnalysis.impact.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stratégie Paiements Accélérés */}
      <Card>
        <CardHeader>
          <CardTitle>Stratégie #3 - Paiements Accélérés</CardTitle>
          <CardDescription>
            Impact des paiements additionnels ou bi-hebdomadaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Standard</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Mensuel</span>
                  <span>{formatCurrency(acceleratedAnalysis.standard.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durée</span>
                  <span>{acceleratedAnalysis.standard.totalMonths} mois</span>
                </div>
                <div className="flex justify-between">
                  <span>Intérêts</span>
                  <span>{formatCurrency(acceleratedAnalysis.standard.totalInterest)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Bi-hebdomadaire Accéléré</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Aux 2 semaines</span>
                  <span>{formatCurrency(acceleratedAnalysis.biWeekly.acceleratedBiWeekly)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mois économisés</span>
                  <span className="text-emerald-600">{acceleratedAnalysis.biWeekly.monthsSaved}</span>
                </div>
                <div className="flex justify-between">
                  <span>Intérêts économisés</span>
                  <span className="text-emerald-600">{formatCurrency(acceleratedAnalysis.biWeekly.interestSaved)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-primary/5">
              <h4 className="font-semibold mb-3">+200$/mois</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Nouveau paiement</span>
                  <span>{formatCurrency(acceleratedAnalysis.withAdditional.newMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mois économisés</span>
                  <span className="text-emerald-600 font-bold">{acceleratedAnalysis.withAdditional.monthsSaved}</span>
                </div>
                <div className="flex justify-between">
                  <span>Intérêts économisés</span>
                  <span className="text-emerald-600 font-bold">{formatCurrency(acceleratedAnalysis.withAdditional.interestSaved)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
