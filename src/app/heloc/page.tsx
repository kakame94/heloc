'use client'

import * as React from 'react'
import Link from 'next/link'
import { Building2, ArrowLeft, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CurrencyInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useHelocCapacity } from '@/hooks/useBrrrrCalculator'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function HelocPage() {
  const [propertyValue, setPropertyValue] = React.useState<number>(500000)
  const [mortgageBalance, setMortgageBalance] = React.useState<number>(300000)
  const [helocBalance, setHelocBalance] = React.useState<number>(0)

  const capacity = useHelocCapacity({
    currentPropertyValue: propertyValue,
    currentMortgageBalance: mortgageBalance,
    currentHelocBalance: helocBalance,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold">PlexInvest</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Calculateur de Capacité HELOC</h1>
          <p className="text-muted-foreground">
            Découvrez combien d'équité vous pouvez extraire de votre résidence
            principale pour financer vos investissements, selon les règles BSIF B-20.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulaire */}
          <Card>
            <CardHeader>
              <CardTitle>Votre Propriété</CardTitle>
              <CardDescription>
                Entrez les données de votre résidence principale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyValue">Valeur actuelle</Label>
                <CurrencyInput
                  id="propertyValue"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                  placeholder="500 000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mortgageBalance">Solde hypothécaire</Label>
                <CurrencyInput
                  id="mortgageBalance"
                  value={mortgageBalance}
                  onChange={(e) => setMortgageBalance(Number(e.target.value))}
                  placeholder="300 000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="helocBalance">Solde HELOC actuel (si applicable)</Label>
                <CurrencyInput
                  id="helocBalance"
                  value={helocBalance}
                  onChange={(e) => setHelocBalance(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Résultats */}
          {capacity && (
            <Card>
              <CardHeader>
                <CardTitle>Capacité Disponible</CardTitle>
                <CardDescription>
                  Basé sur les règles BSIF B-20
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Jauge visuelle */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>LTV Actuel</span>
                    <span className="font-tabular">
                      {formatPercent(capacity.currentLtv * 100)}
                    </span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden relative">
                    {/* Limite 65% */}
                    <div
                      className="absolute h-full w-0.5 bg-amber-500 z-10"
                      style={{ left: '65%' }}
                    />
                    {/* Limite 80% */}
                    <div
                      className="absolute h-full w-0.5 bg-rose-500 z-10"
                      style={{ left: '80%' }}
                    />
                    {/* Barre actuelle */}
                    <div
                      className={cn(
                        'h-full transition-all',
                        capacity.currentLtv <= 0.65
                          ? 'bg-emerald-500'
                          : capacity.currentLtv <= 0.8
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      )}
                      style={{ width: `${Math.min(capacity.currentLtv * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>65% (Rotatif)</span>
                    <span>80% (Max)</span>
                  </div>
                </div>

                {/* Équité disponible */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">
                      Équité Totale
                    </div>
                    <div className="text-2xl font-bold font-tabular">
                      {formatCurrency(capacity.totalEquity)}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'p-4 rounded-lg',
                      capacity.canAccessRotating ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
                    )}
                  >
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      HELOC Disponible
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">
                              {capacity.canAccessRotating
                                ? 'Disponible en mode rotatif (intérêts seulement)'
                                : 'Disponible uniquement en prêt amorti (capital + intérêts)'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div
                      className={cn(
                        'text-2xl font-bold font-tabular',
                        capacity.canAccessRotating ? 'text-emerald-600' : 'text-amber-600'
                      )}
                    >
                      {formatCurrency(
                        capacity.canAccessRotating
                          ? capacity.availableEquityAtRotating
                          : capacity.availableEquityAtTotal
                      )}
                    </div>
                  </div>
                </div>

                {/* Statut */}
                <div
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg',
                    capacity.canAccessRotating
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                  )}
                >
                  {capacity.canAccessRotating ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Accès HELOC Rotatif</p>
                        <p className="text-sm opacity-80">
                          Votre LTV est sous 65%. Vous pouvez accéder jusqu'à{' '}
                          {formatCurrency(capacity.availableEquityAtRotating)} en mode
                          intérêts seulement.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Mode Amorti Seulement</p>
                        <p className="text-sm opacity-80">
                          Votre LTV dépasse 65%. L'accès additionnel ({formatCurrency(capacity.availableEquityAtTotal)})
                          nécessite des paiements capital + intérêts.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Explication des règles */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Comprendre les Règles BSIF B-20</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-emerald-600 mb-2">
                  Portion Rotative (0-65% LTV)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Paiement d'intérêts seulement. Idéal pour le BRRRR car les
                  mensualités sont minimales pendant la phase de rénovation.
                  Vous ne payez que les intérêts sur ce que vous utilisez.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-amber-600 mb-2">
                  Portion Amortie (65-80% LTV)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Paiement capital + intérêts obligatoire. Augmente les
                  mensualités mais permet d'accéder à plus d'équité. Souvent
                  structuré en prêt hypothécaire additionnel.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Pourquoi c'est important pour le BRRRR?</h3>
              <p className="text-sm text-muted-foreground">
                Lors d'un projet BRRRR, vous utilisez votre HELOC pour financer la
                mise de fonds et les rénovations. Pendant les travaux (3-6 mois),
                vous ne générez aucun revenu. Avec un HELOC rotatif (≤65% LTV),
                vous payez uniquement ~500$/mois en intérêts sur 100k$ utilisés.
                En mode amorti, ce serait ~700$/mois. Cette différence de 200$/mois
                sur 6 mois = 1,200$ d'économie pendant la phase la plus tendue.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
