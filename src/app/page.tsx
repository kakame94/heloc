'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Building2,
  Calculator,
  TrendingUp,
  Home,
  DollarSign,
  ArrowRight,
  Sparkles,
  Shield,
  BarChart3,
  Users,
  ChevronRight,
  Play,
  Star,
  Check,
  FileText,
  Hammer,
  RefreshCw,
  Target,
  Zap,
  PiggyBank,
  LineChart,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const CALCULATOR_CARDS = [
  {
    id: 'brrrr',
    title: 'Calculateur BRRRR',
    description: 'Analysez vos projets Buy-Rehab-Rent-Refinance-Repeat avec précision',
    icon: RefreshCw,
    href: '/wizard',
    color: 'from-emerald-500 to-teal-600',
    features: ['Analyse de rentabilité', 'Stress test B-20', 'Retour infini'],
    badge: 'Populaire',
  },
  {
    id: 'rental',
    title: 'Analyse Locative',
    description: 'Évaluez le cashflow et la rentabilité de vos immeubles locatifs',
    icon: Building2,
    href: '/analyse',
    color: 'from-blue-500 to-indigo-600',
    features: ['DSCR automatique', 'Cap Rate', 'Cash-on-Cash'],
    badge: null,
  },
  {
    id: 'heloc',
    title: 'Calculateur HELOC',
    description: 'Estimez votre marge de crédit hypothécaire disponible',
    icon: PiggyBank,
    href: '/heloc',
    color: 'from-purple-500 to-violet-600',
    features: ['Équité disponible', 'Limite de crédit', 'Stratégies'],
    badge: null,
  },
]

const FEATURES = [
  {
    icon: Target,
    title: 'Précision Québec',
    description: 'Calculs adaptés aux règles fiscales 2025 du Québec et de Montréal',
  },
  {
    icon: Shield,
    title: 'Stress Test B-20',
    description: 'Validation automatique selon les règles hypothécaires canadiennes',
  },
  {
    icon: Zap,
    title: 'Import PDF',
    description: 'Importez vos fiches Centris/DuProprio en un clic',
  },
  {
    icon: LineChart,
    title: 'Visualisation',
    description: 'Graphiques et jauges pour comprendre vos investissements',
  },
]

const STATS = [
  { value: '100%', label: 'Gratuit' },
  { value: '2025', label: 'Données fiscales' },
  { value: 'B-20', label: 'Stress Test' },
  { value: 'SCHL', label: 'Primes intégrées' },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <Building2 className="h-8 w-8 text-emerald-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight">PlexInvest</span>
                <span className="text-xs text-emerald-600 font-medium ml-1">Québec</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem href="/wizard" icon={Calculator}>Calculateurs</NavItem>
              <NavItem href="/guide" icon={FileText}>Guide</NavItem>
              <NavItem href="/analyse" icon={BarChart3}>Analyse</NavItem>
            </nav>

            {/* CTA + Mobile Menu */}
            <div className="flex items-center gap-3">
              <Link href="/wizard" className="hidden sm:block">
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  Commencer
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-2">
                <MobileNavItem href="/wizard" icon={Calculator} onClick={() => setMobileMenuOpen(false)}>
                  Calculateurs
                </MobileNavItem>
                <MobileNavItem href="/guide" icon={FileText} onClick={() => setMobileMenuOpen(false)}>
                  Guide
                </MobileNavItem>
                <MobileNavItem href="/analyse" icon={BarChart3} onClick={() => setMobileMenuOpen(false)}>
                  Analyse
                </MobileNavItem>
                <MobileNavItem href="/heloc" icon={PiggyBank} onClick={() => setMobileMenuOpen(false)}>
                  HELOC
                </MobileNavItem>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Version 2.0 — Nouveau moteur de calcul
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Analysez vos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                investissements immobiliers
              </span>{' '}
              au Québec
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              La plateforme de calcul la plus complète pour les investisseurs BRRRR et multi-logements.
              Taxe de bienvenue Montréal 2025, stress test B-20, primes SCHL incluses.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/wizard">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-lg h-14 px-8">
                  <Calculator className="h-5 w-5" />
                  Analyser un Plex
                </Button>
              </Link>
              <Link href="/guide">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-lg h-14 px-8">
                  <Play className="h-5 w-5" />
                  Voir le guide
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <div className="text-xl md:text-2xl font-bold text-emerald-600">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Cards Section */}
      <section className="py-16 md:py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
              Nos calculateurs d'investissement
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Des outils professionnels adaptés au marché québécois pour prendre des décisions éclairées
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {CALCULATOR_CARDS.map((card) => (
              <CalculatorCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
              Pourquoi PlexInvest?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Conçu spécifiquement pour les investisseurs immobiliers québécois
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
              Comment ça fonctionne?
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              <StepCard
                number={1}
                icon={FileText}
                title="Importez"
                description="Uploadez votre fiche Centris ou DuProprio"
              />
              <StepCard
                number={2}
                icon={Calculator}
                title="Ajustez"
                description="Modifiez les paramètres selon vos critères"
              />
              <StepCard
                number={3}
                icon={BarChart3}
                title="Analysez"
                description="Obtenez le DSCR, cashflow et stress test"
              />
              <StepCard
                number={4}
                icon={Check}
                title="Décidez"
                description="Prenez une décision éclairée avec le grade A-F"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl md:rounded-3xl p-6 md:p-12 text-white text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                Prêt à analyser votre prochain deal?
              </h2>
              <p className="text-base md:text-lg text-emerald-100 mb-6 md:mb-8 max-w-2xl mx-auto">
                Importez votre fiche Centris, ajustez vos paramètres et obtenez une analyse complète en quelques minutes.
              </p>
              <Link href="/wizard">
                <Button size="lg" variant="secondary" className="gap-2 text-base md:text-lg h-12 md:h-14 px-6 md:px-8 bg-white text-emerald-700 hover:bg-emerald-50">
                  Commencer l'analyse
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-emerald-600" />
              <span className="font-bold">PlexInvest Québec</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm text-muted-foreground">
              <Link href="/wizard" className="hover:text-foreground transition-colors">Calculateurs</Link>
              <Link href="/guide" className="hover:text-foreground transition-colors">Guide</Link>
              <Link href="/analyse" className="hover:text-foreground transition-colors">Analyse</Link>
              <Link href="/heloc" className="hover:text-foreground transition-colors">HELOC</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 PlexInvest. Fait au Québec 🍁
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// COMPONENTS
// ============================================================================

function NavItem({
  href,
  icon: Icon,
  children
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}

function MobileNavItem({
  href,
  icon: Icon,
  children,
  onClick
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Icon className="h-5 w-5 text-emerald-600" />
      {children}
    </Link>
  )
}

function CalculatorCard({
  card
}: {
  card: typeof CALCULATOR_CARDS[0]
}) {
  return (
    <Link href={card.href} className="group">
      <div className="relative h-full bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
        {/* Badge */}
        {card.badge && (
          <div className="absolute -top-3 right-4 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
            {card.badge}
          </div>
        )}

        {/* Icon */}
        <div className={cn(
          'w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br',
          card.color
        )}>
          <card.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-emerald-600 transition-colors">
          {card.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4">
          {card.description}
        </p>

        {/* Features */}
        <ul className="space-y-2 mb-4">
          {card.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Arrow */}
        <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">
          Utiliser le calculateur
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}

function FeatureCard({
  feature
}: {
  feature: typeof FEATURES[0]
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 text-center">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3 md:mb-4">
        <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
      </div>
      <h3 className="font-bold text-sm md:text-base mb-1 md:mb-2">{feature.title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
    </div>
  )
}

function StepCard({
  number,
  icon: Icon,
  title,
  description
}: {
  number: number
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="relative inline-block mb-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Icon className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
          {number}
        </div>
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
