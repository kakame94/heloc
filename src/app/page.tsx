import Link from 'next/link'
import {
  Calculator,
  TrendingUp,
  Building2,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">PlexInvest</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Québec
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/calculateur"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Calculateur
            </Link>
            <Link
              href="/heloc"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              HELOC
            </Link>
            <Link
              href="/analyse"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Analyse
            </Link>
            <Link
              href="/guide"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Guide
            </Link>
          </nav>
          <Button asChild>
            <Link href="/calculateur">Commencer</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            L'outil d'analyse{' '}
            <span className="text-gradient-profit">BRRRR</span> ultime pour
            l'investisseur québécois
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Analysez vos projets immobiliers avec précision. Règles BSIF intégrées,
            calculs hypothécaires canadiens, et optimisation HELOC.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/calculateur">
                <Calculator className="h-5 w-5 mr-2" />
                Calculateur BRRRR
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/heloc">
                <TrendingUp className="h-5 w-5 mr-2" />
                Capacité HELOC
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Conçu pour le marché québécois
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={Calculator}
              title="Calculs Hypothécaires Canadiens"
              description="Composition semi-annuelle des taux, stress test BSIF, et primes SCHL intégrées automatiquement."
            />
            <FeatureCard
              icon={Building2}
              title="Taxe de Bienvenue par Ville"
              description="Calcul précis des droits de mutation selon la municipalité: Montréal, Québec, Laval et plus."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Règles BSIF Intégrées"
              description="Limite 65% LTV pour HELOC rotatif et 80% pour refinancement. Aucune mauvaise surprise."
            />
            <FeatureCard
              icon={BarChart3}
              title="Matrice de Sensibilité"
              description="Visualisez l'impact des variations de taux, prix et loyers sur votre rendement."
            />
            <FeatureCard
              icon={TrendingUp}
              title="MLI Select"
              description="Évaluez l'éligibilité au programme SCHL pour amortissement jusqu'à 50 ans (5+ logements)."
            />
            <FeatureCard
              icon={ArrowRight}
              title="Timeline BRRRR"
              description="Suivez chaque phase de votre projet: achat, rénovation, location, refinancement."
            />
            <FeatureCard
              icon={BookOpen}
              title="Guide Éducatif"
              description="Apprenez les concepts BRRRR, HELOC, et toutes les métriques avec des exemples concrets."
            />
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Métriques BSIF Hard-Coded
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard value="65%" label="LTV Max HELOC Rotatif" />
            <MetricCard value="80%" label="LTV Max Refinancement" />
            <MetricCard value="1.25x" label="DCR Minimum Commercial" />
            <MetricCard value="50 ans" label="Amort. Max MLI Select" />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Source: Ligne directrice B-20 du BSIF et programmes SCHL 2025
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à analyser votre prochain deal?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Entrez les données de votre propriété et obtenez une analyse BRRRR
            complète en quelques secondes.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/calculateur">
              Lancer le calculateur
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold">PlexInvest Québec</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Les calculs sont fournis à titre indicatif seulement. Consultez un
              professionnel pour vos décisions d'investissement.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6 rounded-xl border bg-card">
      <div className="text-3xl font-bold text-primary font-tabular mb-1">
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
