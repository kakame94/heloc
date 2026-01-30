'use client'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { BrrrrCalculationResult } from '@/types/financial'

interface ReportData {
  formValues: {
    purchasePrice: number
    downPaymentPercent: number
    renovationBudget: number
    projectedMonthlyRent: number
    afterRepairValue: number
    totalUnits: number
    municipalTaxes: number
    schoolTaxes: number
    insuranceAnnual: number
    mortgageRate: number
    refinanceRate: number
  }
  results: {
    roi: number
    roie: number
    cashFlowMonthly: number
    refinanceCashOutAmount: number
    capRate: number
    isInfiniteReturn: boolean
    dcr: number
    fullAnalysis: BrrrrCalculationResult | null
  }
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPercent = (value: number): string => {
  if (!isFinite(value)) return '∞'
  return `${value.toFixed(2)}%`
}

export function generateBrrrrPdfReport(data: ReportData): void {
  const { formValues, results } = data
  const analysis = results.fullAnalysis

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(15, 23, 42) // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('PlexInvest Quebec', 20, 20)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Rapport d\'analyse BRRRR', 20, 32)

  doc.setFontSize(10)
  doc.text(new Date().toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }), pageWidth - 20, 32, { align: 'right' })

  // Reset text color
  doc.setTextColor(0, 0, 0)

  let yPos = 55

  // KPIs principaux - Grande section
  doc.setFillColor(240, 253, 244) // green-50
  doc.roundedRect(15, yPos, pageWidth - 30, 45, 3, 3, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Indicateurs Cles de Performance', 20, yPos + 10)

  // KPI boxes
  const kpiBoxWidth = (pageWidth - 50) / 4
  const kpiStartX = 20
  const kpiY = yPos + 18

  const kpis = [
    {
      label: 'Cash-on-Cash',
      value: results.isInfiniteReturn ? '∞' : formatPercent(results.roi),
      color: results.roi >= 10 ? [16, 185, 129] : results.roi >= 5 ? [234, 179, 8] : [239, 68, 68],
    },
    {
      label: 'Cashflow/mois',
      value: formatCurrency(results.cashFlowMonthly),
      color: results.cashFlowMonthly >= 0 ? [16, 185, 129] : [239, 68, 68],
    },
    {
      label: 'Cash-Out Refi',
      value: formatCurrency(results.refinanceCashOutAmount),
      color: results.refinanceCashOutAmount >= 0 ? [16, 185, 129] : [234, 179, 8],
    },
    {
      label: 'Cap Rate',
      value: formatPercent(results.capRate),
      color: [59, 130, 246],
    },
  ]

  kpis.forEach((kpi, i) => {
    const x = kpiStartX + i * kpiBoxWidth

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(kpi.label, x, kpiY)

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2])
    doc.text(kpi.value, x, kpiY + 12)
  })

  doc.setTextColor(0, 0, 0)
  yPos += 55

  // Section Acquisition
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Acquisition', 20, yPos)
  yPos += 5

  const acquisitionData = [
    ['Prix d\'achat', formatCurrency(formValues.purchasePrice)],
    ['Mise de fonds', `${formValues.downPaymentPercent}% (${formatCurrency(formValues.purchasePrice * formValues.downPaymentPercent / 100)})`],
    ['Nombre de logements', formValues.totalUnits.toString()],
    ['Taxe de bienvenue', analysis ? formatCurrency(analysis.acquisition.transferTax) : 'N/A'],
    ['Frais de cloture', analysis ? formatCurrency(analysis.acquisition.totalClosingCosts) : 'N/A'],
    ['Total cash a l\'acquisition', analysis ? formatCurrency(analysis.acquisition.totalCashAtAcquisition) : 'N/A'],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: acquisitionData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'normal', textColor: [100, 100, 100] },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // Section Renovation
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('2. Renovation', 20, yPos)
  yPos += 5

  const renovationData = [
    ['Budget renovations', formatCurrency(formValues.renovationBudget)],
    ['Contingence (10%)', formatCurrency(formValues.renovationBudget * 0.1)],
    ['Total renovations', formatCurrency(formValues.renovationBudget * 1.1)],
    ['Cout de portage', analysis ? formatCurrency(analysis.renovation.totalCarryCost) : 'N/A'],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: renovationData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'normal', textColor: [100, 100, 100] },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // Section Location
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('3. Location', 20, yPos)
  yPos += 5

  const locationData = [
    ['Loyer mensuel brut', formatCurrency(formValues.projectedMonthlyRent)],
    ['Taxes municipales', formatCurrency(formValues.municipalTaxes) + '/an'],
    ['Taxes scolaires', formatCurrency(formValues.schoolTaxes) + '/an'],
    ['Assurance', formatCurrency(formValues.insuranceAnnual) + '/an'],
    ['NOI mensuel', analysis ? formatCurrency(analysis.rental.monthlyNOI) : 'N/A'],
    ['NOI annuel', analysis ? formatCurrency(analysis.rental.annualNOI) : 'N/A'],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: locationData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'normal', textColor: [100, 100, 100] },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  // Nouvelle page si necessaire
  if (yPos > 230) {
    doc.addPage()
    yPos = 20
  }

  // Section Refinancement
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('4. Refinancement', 20, yPos)
  yPos += 5

  const refinanceData = [
    ['Valeur apres renos (ARV)', formatCurrency(formValues.afterRepairValue)],
    ['Taux hypothecaire', formatPercent(formValues.refinanceRate)],
    ['LTV max (BSIF)', '80%'],
    ['Nouveau pret', analysis ? formatCurrency(analysis.refinance.newMortgageAmount) : 'N/A'],
    ['Portion HELOC (max 65%)', analysis ? formatCurrency(analysis.refinance.helocPortionAmount) : 'N/A'],
    ['Portion amortie', analysis ? formatCurrency(analysis.refinance.amortizedPortionAmount) : 'N/A'],
    ['Cash-out brut', analysis ? formatCurrency(analysis.refinance.grossCashOut) : 'N/A'],
    ['Cash-out net', analysis ? formatCurrency(analysis.refinance.netCashOut) : 'N/A'],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: refinanceData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'normal', textColor: [100, 100, 100] },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  })

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

  // Resume Final
  doc.setFillColor(239, 246, 255) // blue-50
  doc.roundedRect(15, yPos, pageWidth - 30, 50, 3, 3, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Resume du Projet', 20, yPos + 10)

  if (analysis) {
    const summaryY = yPos + 20
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    doc.text('Investissement total:', 20, summaryY)
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(analysis.kpis.totalCashInvested), 80, summaryY)

    doc.setFont('helvetica', 'normal')
    doc.text('Equite restante:', 20, summaryY + 8)
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(analysis.kpis.equityLeftInDeal), 80, summaryY + 8)

    doc.setFont('helvetica', 'normal')
    doc.text('Rendement annuel:', 20, summaryY + 16)
    doc.setFont('helvetica', 'bold')
    const cashOnCashText = results.isInfiniteReturn
      ? '∞ (Rendement infini!)'
      : formatPercent(results.roi)
    doc.text(cashOnCashText, 80, summaryY + 16)

    doc.setFont('helvetica', 'normal')
    doc.text('Cashflow annuel:', 20, summaryY + 24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(
      results.cashFlowMonthly >= 0 ? 16 : 239,
      results.cashFlowMonthly >= 0 ? 185 : 68,
      results.cashFlowMonthly >= 0 ? 129 : 68
    )
    doc.text(formatCurrency(results.cashFlowMonthly * 12), 80, summaryY + 24)
  }

  // Footer
  doc.setTextColor(150, 150, 150)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'Les calculs sont fournis a titre indicatif seulement. Consultez un professionnel pour vos decisions d\'investissement.',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  )

  // Telecharger le PDF
  const fileName = `PlexInvest_BRRRR_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
