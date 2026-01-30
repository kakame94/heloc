import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export const metadata: Metadata = {
  title: 'PlexInvest Québec - Calculateur BRRRR & HELOC',
  description:
    "Plateforme d'analyse d'investissement immobilier pour le Québec. Stratégies BRRRR, HELOC, et optimisation de portefeuille selon les règles BSIF et SCHL.",
  keywords: [
    'BRRRR',
    'investissement immobilier',
    'Québec',
    'HELOC',
    'plex',
    'duplex',
    'triplex',
    'calculateur hypothécaire',
    'rendement immobilier',
  ],
  authors: [{ name: 'PlexInvest' }],
  openGraph: {
    title: 'PlexInvest Québec',
    description: "L'outil d'analyse BRRRR ultime pour l'investisseur québécois",
    type: 'website',
    locale: 'fr_CA',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  )
}
