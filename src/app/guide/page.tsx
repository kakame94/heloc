'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Building2,
  ArrowLeft,
  Home,
  Hammer,
  Key,
  Building,
  RefreshCw,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  BookOpen,
  Target,
  Wallet,
  PiggyBank,
  ArrowRight,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function GuidePage() {
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
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/calculateur">
                <Calculator className="h-4 w-4 mr-2" />
                Calculateur
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            Guide de l'investisseur
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Comprendre l'investissement immobilier au Québec
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tous les termes, acronymes et stratégies expliqués simplement avec des exemples concrets.
          </p>
        </div>

        {/* Table des matières */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>📚 Table des matières</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="#brrrr" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span>La stratégie BRRRR</span>
              </a>
              <a href="#heloc" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <Wallet className="h-5 w-5 text-primary" />
                <span>HELOC et financement</span>
              </a>
              <a href="#bsif" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <span>Règles BSIF (B-20)</span>
              </a>
              <a href="#kpis" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <Target className="h-5 w-5 text-primary" />
                <span>KPIs et métriques</span>
              </a>
              <a href="#schl" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <Building className="h-5 w-5 text-primary" />
                <span>SCHL et MLI Select</span>
              </a>
              <a href="#exemple" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
                <Calculator className="h-5 w-5 text-primary" />
                <span>Exemple complet</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Section BRRRR */}
        <section id="brrrr" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">La stratégie BRRRR</h2>
              <p className="text-muted-foreground">Buy, Rehab, Rent, Refinance, Repeat</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-lg mb-6">
                Le BRRRR est une stratégie d'investissement qui permet de <strong>recycler son capital</strong> pour
                acheter plusieurs propriétés avec le même argent initial. L'idée est simple : acheter sous la valeur
                marchande, rénover pour créer de la valeur, puis refinancer pour récupérer sa mise de fonds.
              </p>

              {/* Les 5 étapes */}
              <div className="grid gap-4">
                <StepCard
                  icon={Home}
                  letter="B"
                  title="Buy (Acheter)"
                  description="Acheter une propriété sous sa valeur marchande. L'objectif est de trouver un vendeur motivé ou une propriété qui nécessite des travaux."
                  example="Marie trouve un quadruplex à 380 000$ alors que les comparables rénovés se vendent 500 000$."
                  color="blue"
                />
                <StepCard
                  icon={Hammer}
                  letter="R"
                  title="Rehab (Rénover)"
                  description="Effectuer des rénovations stratégiques pour augmenter la valeur. Focus sur cuisine, salles de bain et éléments visibles."
                  example="Marie investit 50 000$ en rénovations : nouvelles cuisines, salles de bain refaites, peinture fraîche."
                  color="orange"
                />
                <StepCard
                  icon={Key}
                  letter="R"
                  title="Rent (Louer)"
                  description="Trouver des locataires et générer des revenus. Les loyers doivent couvrir toutes les dépenses + un cashflow positif."
                  example="Marie loue les 4 logements pour un total de 4 200$/mois. Après les charges, elle génère 800$/mois de cashflow."
                  color="emerald"
                />
                <StepCard
                  icon={Building}
                  letter="R"
                  title="Refinance (Refinancer)"
                  description="Obtenir une nouvelle hypothèque basée sur la nouvelle valeur (ARV). Ceci permet d'extraire le capital investi."
                  example="La banque évalue la propriété à 500 000$. Marie refinance à 80% = 400 000$. Elle rembourse son prêt initial et récupère son cash."
                  color="purple"
                />
                <StepCard
                  icon={RefreshCw}
                  letter="R"
                  title="Repeat (Répéter)"
                  description="Utiliser le capital récupéré pour acheter une nouvelle propriété et recommencer le cycle."
                  example="Marie a récupéré sa mise de fonds initiale et possède maintenant un immeuble qui génère 800$/mois. Elle recommence!"
                  color="indigo"
                />
              </div>
            </CardContent>
          </Card>

          {/* Résultat visuel */}
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4">🎯 Le résultat "Infinite Return"</h3>
              <p className="mb-4">
                Quand vous récupérez <strong>100% de votre capital initial</strong> au refinancement, votre rendement
                devient <strong>infini</strong> (vous gagnez de l'argent sur un investissement de 0$).
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">0$</div>
                  <div className="text-sm text-muted-foreground">Capital restant</div>
                </div>
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">800$/m</div>
                  <div className="text-sm text-muted-foreground">Cashflow</div>
                </div>
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">∞</div>
                  <div className="text-sm text-muted-foreground">ROI</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section HELOC */}
        <section id="heloc" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">HELOC - Marge de Crédit Hypothécaire</h2>
              <p className="text-muted-foreground">Home Equity Line of Credit</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-lg mb-6">
                Un <strong>HELOC</strong> est une marge de crédit garantie par l'équité de votre maison.
                C'est l'outil préféré des investisseurs BRRRR car il permet d'accéder rapidement à des liquidités
                pour financer les mises de fonds et rénovations.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Avantages
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Accès rapide aux fonds (comme une carte de crédit)</li>
                    <li>• Paiement d'intérêts seulement sur le montant utilisé</li>
                    <li>• Taux plus bas qu'un prêt personnel</li>
                    <li>• Réutilisable après remboursement</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Points d'attention
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Taux variable (peut augmenter)</li>
                    <li>• Limite de 65% LTV en mode rotatif (règle BSIF)</li>
                    <li>• Votre maison est en garantie</li>
                    <li>• Nécessite de l'équité existante</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exemple HELOC */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Exemple concret</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Valeur de votre maison</span>
                  <span className="font-bold font-tabular">600 000$</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Hypothèque actuelle</span>
                  <span className="font-bold font-tabular">-350 000$</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Équité totale</span>
                  <span className="font-bold font-tabular text-emerald-600">250 000$</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                    <span>HELOC disponible (65% de 600k - 350k)</span>
                    <span className="font-bold font-tabular text-emerald-600">40 000$</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    * Calcul : (600 000$ × 65%) - 350 000$ = 390 000$ - 350 000$ = 40 000$
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section BSIF */}
        <section id="bsif" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Règles BSIF (Ligne directrice B-20)</h2>
              <p className="text-muted-foreground">Bureau du surintendant des institutions financières</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-lg mb-6">
                Le <strong>BSIF</strong> est l'organisme fédéral qui réglemente les banques canadiennes.
                La <strong>ligne directrice B-20</strong> impose des règles strictes sur les prêts hypothécaires
                pour protéger le système financier.
              </p>

              <div className="space-y-4">
                <RuleCard
                  title="Limite HELOC Rotatif : 65% LTV"
                  description="La portion de votre marge de crédit où vous payez seulement les intérêts ne peut pas dépasser 65% de la valeur de votre propriété."
                  impact="Si vous voulez emprunter plus de 65%, la portion excédentaire doit être en prêt amorti (capital + intérêts)."
                />
                <RuleCard
                  title="Limite Refinancement : 80% LTV"
                  description="Vous ne pouvez pas refinancer au-delà de 80% de la valeur de votre propriété (pour 1-4 logements)."
                  impact="Sur un immeuble de 500 000$, vous pouvez refinancer maximum 400 000$."
                />
                <RuleCard
                  title="Stress Test : Taux + 2%"
                  description="Vous devez vous qualifier au taux contractuel + 2% OU au taux plancher de 5.25% (le plus élevé)."
                  impact="Même si votre taux est 5%, vous devez prouver que vous pouvez payer à 7%."
                />
              </div>
            </CardContent>
          </Card>

          {/* Pourquoi c'est important */}
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-4">⚠️ Pourquoi c'est crucial pour le BRRRR</h3>
              <p className="mb-4">
                Beaucoup de calculateurs américains ignorent ces règles et montrent des projections irréalistes
                pour le Canada. PlexInvest intègre ces contraintes automatiquement pour que vos calculs
                soient <strong>réalisables auprès d'une vraie banque</strong>.
              </p>
              <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-sm">
                  <strong>Exemple :</strong> Un calculateur américain pourrait vous dire que vous pouvez
                  refinancer à 90% LTV avec paiement intérêts seulement. Au Canada, c'est impossible.
                  Maximum 80%, et la portion au-delà de 65% doit être amortie.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section KPIs */}
        <section id="kpis" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">KPIs et Métriques</h2>
              <p className="text-muted-foreground">Les chiffres clés pour évaluer un deal</p>
            </div>
          </div>

          <div className="grid gap-4">
            <MetricExplanation
              name="Cash-on-Cash (CoC)"
              formula="Cashflow annuel ÷ Capital investi × 100"
              description="Le rendement annuel sur l'argent que VOUS avez mis dans le deal. C'est la métrique #1 pour comparer des investissements."
              example="Vous investissez 80 000$ et générez 9 600$/an de cashflow. CoC = 9 600 ÷ 80 000 = 12%"
              target="Visez minimum 8-10%"
            />
            <MetricExplanation
              name="Cap Rate (Taux de capitalisation)"
              formula="NOI annuel ÷ Valeur de la propriété × 100"
              description="Mesure le rendement intrinsèque de la propriété, indépendamment du financement. Utile pour comparer des propriétés."
              example="NOI de 30 000$/an sur une propriété de 500 000$. Cap Rate = 30 000 ÷ 500 000 = 6%"
              target="Varie selon le marché (4-8%)"
            />
            <MetricExplanation
              name="NOI (Net Operating Income)"
              formula="Revenus - Dépenses d'exploitation (sans l'hypothèque)"
              description="Le revenu net avant le paiement de l'hypothèque. Inclut : loyers - vacance - taxes - assurance - maintenance."
              example="Loyers 48 000$ - Vacance 2 400$ - Taxes 5 000$ - Assurance 2 400$ - Maintenance 2 400$ = NOI 35 800$"
              target="Doit être positif!"
            />
            <MetricExplanation
              name="DCR (Debt Coverage Ratio)"
              formula="NOI annuel ÷ Service de la dette annuel"
              description="Mesure la capacité à payer l'hypothèque. Obligatoire pour le financement commercial (5+ logements)."
              example="NOI 35 800$ ÷ Paiements hypothécaires 28 000$ = DCR 1.28"
              target="Minimum 1.25x requis"
            />
            <MetricExplanation
              name="LTV (Loan-to-Value)"
              formula="Montant du prêt ÷ Valeur de la propriété × 100"
              description="Le pourcentage de la valeur qui est financé. Plus le LTV est bas, moins vous avez de risque."
              example="Prêt de 400 000$ sur propriété de 500 000$. LTV = 400 000 ÷ 500 000 = 80%"
              target="Max 80% (résidentiel)"
            />
            <MetricExplanation
              name="ARV (After Repair Value)"
              formula="Valeur estimée après les rénovations"
              description="La valeur que votre propriété aura APRÈS les travaux. C'est sur cette valeur que vous refinancerez."
              example="Acheté 380 000$ + 50 000$ rénos. Comparables rénovés à 500 000$. ARV = 500 000$"
              target="Doit justifier les rénos"
            />
          </div>
        </section>

        {/* Section SCHL */}
        <section id="schl" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">SCHL et MLI Select</h2>
              <p className="text-muted-foreground">Société canadienne d'hypothèques et de logement</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Assurance prêt hypothécaire SCHL</h3>
              <p className="mb-6">
                Si votre mise de fonds est inférieure à 20%, vous devez payer une <strong>prime d'assurance SCHL</strong>.
                Cette prime protège la banque (pas vous!) en cas de défaut de paiement.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Mise de fonds</th>
                      <th className="text-left py-2">Prime SCHL</th>
                      <th className="text-left py-2">Sur prêt de 400 000$</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">5% - 9.99%</td>
                      <td className="py-2">4.00%</td>
                      <td className="py-2 font-tabular">16 000$</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">10% - 14.99%</td>
                      <td className="py-2">3.10%</td>
                      <td className="py-2 font-tabular">12 400$</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">15% - 19.99%</td>
                      <td className="py-2">2.80%</td>
                      <td className="py-2 font-tabular">11 200$</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">20%+</td>
                      <td className="py-2 text-emerald-600 font-semibold">0%</td>
                      <td className="py-2 text-emerald-600 font-semibold">0$</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <p className="text-sm">
                  <strong>💡 Note pour investisseurs :</strong> L'assurance SCHL n'est généralement pas disponible
                  pour les investisseurs non-occupants. Vous devez mettre 20% minimum si vous n'habitez pas la propriété.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏢 MLI Select (5+ logements)</CardTitle>
              <CardDescription>Programme spécial pour les immeubles multi-logements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Pour les immeubles de 5 logements et plus, le programme <strong>MLI Select</strong> de la SCHL
                offre des conditions avantageuses si vous atteignez certains critères sociaux.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">50 ans</div>
                  <div className="text-sm text-muted-foreground">Amortissement max</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">95%</div>
                  <div className="text-sm text-muted-foreground">LTV max</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">↓ Taux</div>
                  <div className="text-sm text-muted-foreground">Taux réduits</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Critères pour points :</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Abordabilité :</strong> Loyers sous la médiane du marché</li>
                  <li>• <strong>Accessibilité :</strong> Unités adaptées pour personnes handicapées</li>
                  <li>• <strong>Efficacité énergétique :</strong> Amélioration de 25%+ vs bâtiment de référence</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section Exemple Complet */}
        <section id="exemple" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Exemple Complet : Le Quadruplex de Marie</h2>
              <p className="text-muted-foreground">Un deal BRRRR réaliste au Québec</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📍 Le contexte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Marie trouve un quadruplex à Montréal-Nord. Le propriétaire est motivé (succession) et la propriété
                nécessite des mises à jour. Les comparables rénovés dans le secteur se vendent autour de 520 000$.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Situation actuelle</h4>
                  <ul className="text-sm space-y-1">
                    <li>Prix demandé : 420 000$</li>
                    <li>Loyers actuels : 3 200$/mois</li>
                    <li>État : Daté, cuisines/SDB d'origine</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Potentiel</h4>
                  <ul className="text-sm space-y-1">
                    <li>ARV estimé : 520 000$</li>
                    <li>Loyers après rénos : 4 400$/mois</li>
                    <li>Budget rénos : 55 000$</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculs détaillés */}
          <div className="space-y-4">
            <ExamplePhase
              phase="1"
              title="Acquisition"
              items={[
                { label: "Prix d'achat négocié", value: "400 000$" },
                { label: "Mise de fonds (20%)", value: "80 000$" },
                { label: "Droits de mutation (Montréal)", value: "6 475$" },
                { label: "Notaire + inspection", value: "2 800$" },
                { label: "Total cash à l'achat", value: "89 275$", highlight: true },
              ]}
            />
            <ExamplePhase
              phase="2"
              title="Rénovation"
              items={[
                { label: "4 cuisines refaites", value: "28 000$" },
                { label: "4 salles de bain", value: "16 000$" },
                { label: "Peinture complète", value: "6 000$" },
                { label: "Contingence (10%)", value: "5 000$" },
                { label: "Total rénovations", value: "55 000$", highlight: true },
                { label: "Durée des travaux", value: "3 mois" },
              ]}
            />
            <ExamplePhase
              phase="3"
              title="Location"
              items={[
                { label: "Loyer total mensuel", value: "4 400$" },
                { label: "Vacance (5%)", value: "-220$" },
                { label: "Taxes municipales", value: "-375$" },
                { label: "Taxes scolaires", value: "-50$" },
                { label: "Assurance", value: "-200$" },
                { label: "Maintenance (5%)", value: "-209$" },
                { label: "NOI mensuel", value: "3 346$", highlight: true },
              ]}
            />
            <ExamplePhase
              phase="4"
              title="Refinancement"
              items={[
                { label: "Valeur après rénos (ARV)", value: "520 000$" },
                { label: "Refinancement à 80%", value: "416 000$" },
                { label: "Remboursement prêt initial", value: "-320 000$" },
                { label: "Frais de refinancement", value: "-1 600$" },
                { label: "Cash extrait", value: "94 400$", highlight: true },
              ]}
            />
          </div>

          {/* Résultat final */}
          <Card className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-400">🎉 Résultat Final</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Investissement</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cash investi total</span>
                      <span className="font-tabular">144 275$</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash récupéré au refi</span>
                      <span className="font-tabular text-emerald-600">94 400$</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Capital restant dans le deal</span>
                      <span className="font-tabular">49 875$</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Rendement</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cashflow mensuel</span>
                      <span className="font-tabular text-emerald-600">+892$</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cashflow annuel</span>
                      <span className="font-tabular text-emerald-600">+10 704$</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Cash-on-Cash Return</span>
                      <span className="font-tabular text-emerald-600">21.5%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-sm">
                  <strong>📊 Analyse :</strong> Marie a un excellent rendement de 21.5% sur son capital restant.
                  Elle génère 892$/mois de cashflow et a récupéré 65% de sa mise initiale. Elle peut maintenant
                  utiliser les 94 400$ récupérés pour un prochain projet!
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Final */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-4">Prêt à analyser votre prochain deal?</h3>
            <p className="mb-6 opacity-90">
              Utilisez notre calculateur pour obtenir une analyse complète avec toutes les règles BSIF intégrées.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/calculateur">
                <Calculator className="h-5 w-5 mr-2" />
                Lancer le calculateur BRRRR
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Les informations présentées sont à titre éducatif. Consultez un professionnel pour vos décisions d'investissement.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Composants helper

function StepCard({
  icon: Icon,
  letter,
  title,
  description,
  example,
  color,
}: {
  icon: React.ElementType
  letter: string
  title: string
  description: string
  example: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  }

  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-card">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-semibold mb-1">
          <span className="text-primary">{letter}</span> - {title}
        </h4>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <p className="text-sm p-2 bg-muted rounded">
          <strong>Exemple :</strong> {example}
        </p>
      </div>
    </div>
  )
}

function RuleCard({
  title,
  description,
  impact,
}: {
  title: string
  description: string
  impact: string
}) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <p className="text-sm p-2 bg-amber-50 dark:bg-amber-950/30 rounded">
        <strong>Impact :</strong> {impact}
      </p>
    </div>
  )
}

function MetricExplanation({
  name,
  formula,
  description,
  example,
  target,
}: {
  name: string
  formula: string
  description: string
  example: string
  target: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-1">{name}</h4>
            <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block mb-2">{formula}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="md:w-64 space-y-2">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <strong>Ex:</strong> {example}
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-sm text-emerald-700 dark:text-emerald-400">
              <strong>Cible:</strong> {target}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ExamplePhase({
  phase,
  title,
  items,
}: {
  phase: string
  title: string
  items: Array<{ label: string; value: string; highlight?: boolean }>
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            {phase}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex justify-between items-center p-2 rounded ${
                item.highlight ? 'bg-primary/10 font-semibold' : ''
              }`}
            >
              <span className="text-sm">{item.label}</span>
              <span className="font-tabular text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
