'use client'

import Link from 'next/link'
import { Building2, ArrowLeft, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrrrrCalculator } from '@/components/brrrr/BrrrrCalculator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function CalculateurPage() {
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
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm">
                  <p className="text-sm">
                    <strong>BRRRR</strong> = Buy, Rehab, Rent, Refinance, Repeat.
                    <br />
                    Stratégie permettant de récupérer son capital initial via
                    refinancement pour réinvestir.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Calculateur BRRRR</h1>
          <p className="text-muted-foreground max-w-2xl">
            Analysez votre projet d'investissement immobilier. Tous les calculs
            intègrent les règles BSIF canadiennes (LTV 65%/80%) et les droits de
            mutation québécois.
          </p>
        </div>

        {/* Calculateur */}
        <BrrrrCalculator
          onSave={(data, results) => {
            console.log('Données sauvegardées:', data)
            console.log('Résultats:', results)
            // TODO: Sauvegarder dans la base de données
          }}
        />

        {/* Guide rapide */}
        <div className="mt-12 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Guide rapide</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-primary mb-2">1. Acquisition</h3>
              <p className="text-muted-foreground">
                Entrez le prix d'achat et la mise de fonds. Pour un investisseur
                non-occupant, le minimum est 20%.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary mb-2">2. Rénovation</h3>
              <p className="text-muted-foreground">
                Estimez le budget travaux. Une contingence de 10% est ajoutée
                automatiquement.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary mb-2">3. Location</h3>
              <p className="text-muted-foreground">
                Indiquez le loyer mensuel total et les charges. Le taux de
                vacance de 5% est appliqué.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary mb-2">4. Refinancement</h3>
              <p className="text-muted-foreground">
                L'ARV (After Repair Value) détermine combien vous pouvez
                refinancer. Maximum 80% LTV.
              </p>
            </div>
          </div>

          {/* Règles BSIF */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-3">Règles BSIF intégrées</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong>HELOC Rotatif:</strong> Max 65% LTV (paiement intérêts
                  seulement)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong>Refinancement:</strong> Max 80% LTV (portion {'>'}65% doit
                  être amortie)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong>Stress Test:</strong> Qualification au taux + 2% ou
                  5.25% minimum
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
