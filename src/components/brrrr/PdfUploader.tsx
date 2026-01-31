'use client'

import * as React from 'react'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  extractPropertyDataFromPdf,
  validateExtractedData,
  type ExtractedPropertyData,
} from '@/lib/pdf-extractor'

interface PdfUploaderProps {
  onDataExtracted: (data: ExtractedPropertyData) => void
  className?: string
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

export function PdfUploader({ onDataExtracted, className }: PdfUploaderProps) {
  const [state, setState] = React.useState<UploadState>('idle')
  const [extractedData, setExtractedData] = React.useState<ExtractedPropertyData | null>(null)
  const [fileName, setFileName] = React.useState<string>('')
  const [showDetails, setShowDetails] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setState('error')
      return
    }

    setFileName(file.name)
    setState('uploading')

    // Simuler un délai pour l'UX
    await new Promise((resolve) => setTimeout(resolve, 500))
    setState('processing')

    try {
      const data = await extractPropertyDataFromPdf(file)
      setExtractedData(data)
      setState('success')
    } catch (error) {
      console.error('Erreur:', error)
      setState('error')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleApplyData = () => {
    if (extractedData) {
      onDataExtracted(extractedData)
    }
  }

  const handleReset = () => {
    setState('idle')
    setExtractedData(null)
    setFileName('')
    setShowDetails(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const validation = extractedData ? validateExtractedData(extractedData) : null

  return (
    <Card className={cn('overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950/20', className)}>
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-primary/20 to-primary/10">
        <CardTitle className="text-sm flex items-center gap-2 text-primary">
          <FileText className="h-4 w-4" />
          📄 Importer une fiche PDF (Centris, DuProprio...)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {state === 'idle' && (
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
              dragActive
                ? 'border-primary bg-primary/10 scale-[1.02]'
                : 'border-primary/40 hover:border-primary hover:bg-primary/5 hover:scale-[1.01]'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleChange}
            />
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-base font-semibold text-foreground">
              Glissez-déposez une fiche PDF
            </p>
            <p className="text-sm text-primary mt-1">
              ou cliquez pour sélectionner un fichier
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Extraction automatique des prix, loyers, taxes...
            </p>
          </div>
        )}

        {(state === 'uploading' || state === 'processing') && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
            <p className="text-sm font-medium">
              {state === 'uploading' ? 'Chargement...' : 'Extraction des données...'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{fileName}</p>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Erreur lors de la lecture du PDF
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleReset}>
              Réessayer
            </Button>
          </div>
        )}

        {state === 'success' && extractedData && (
          <div className="space-y-4">
            {/* Header avec confiance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium">Données extraites</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    (extractedData.extractionConfidence ?? 0) >= 60
                      ? 'bg-emerald-100 text-emerald-700'
                      : (extractedData.extractionConfidence ?? 0) >= 40
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  )}
                >
                  Confiance: {extractedData.extractionConfidence}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Source détectée */}
            {extractedData.source && extractedData.source !== 'unknown' && (
              <div className="text-xs text-muted-foreground">
                Source détectée: <span className="font-medium capitalize">{extractedData.source}</span>
              </div>
            )}

            {/* Résumé des données principales */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {extractedData.askingPrice && (
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Prix demandé</div>
                  <div className="font-semibold">{formatCurrency(extractedData.askingPrice)}</div>
                </div>
              )}
              {extractedData.numberOfUnits && (
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Logements</div>
                  <div className="font-semibold">{extractedData.numberOfUnits}</div>
                </div>
              )}
              {extractedData.totalMonthlyRent && (
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Loyers/mois</div>
                  <div className="font-semibold">{formatCurrency(extractedData.totalMonthlyRent)}</div>
                </div>
              )}
              {extractedData.municipalTaxes && (
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Taxes mun./an</div>
                  <div className="font-semibold">{formatCurrency(extractedData.municipalTaxes)}</div>
                </div>
              )}
            </div>

            {/* Adresse */}
            {extractedData.address && (
              <div className="text-sm">
                <span className="text-muted-foreground">Adresse: </span>
                <span className="font-medium">{extractedData.address}</span>
                {extractedData.postalCode && (
                  <span className="text-muted-foreground"> ({extractedData.postalCode})</span>
                )}
              </div>
            )}

            {/* Warnings */}
            {validation && !validation.isValid && (
              <div className="text-xs p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                <div className="font-medium text-amber-700 dark:text-amber-400 mb-1">
                  Données manquantes:
                </div>
                <ul className="list-disc list-inside text-amber-600 dark:text-amber-500">
                  {validation.missingFields.map((field, i) => (
                    <li key={i}>{field}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Toggle détails */}
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showDetails ? 'Masquer les détails' : 'Voir tous les détails'}
            </button>

            {/* Détails complets */}
            {showDetails && (
              <div className="text-xs space-y-1 p-3 bg-muted/30 rounded max-h-40 overflow-y-auto">
                {extractedData.mlsNumber && <div>MLS: {extractedData.mlsNumber}</div>}
                {extractedData.yearBuilt && <div>Année: {extractedData.yearBuilt}</div>}
                {extractedData.livingArea && <div>Superficie: {extractedData.livingArea} pi²</div>}
                {extractedData.monthlyRents && extractedData.monthlyRents.length > 0 && (
                  <div>
                    Loyers détaillés: {extractedData.monthlyRents.map(r => formatCurrency(r)).join(', ')}
                  </div>
                )}
                {extractedData.schoolTaxes && (
                  <div>Taxes scolaires: {formatCurrency(extractedData.schoolTaxes)}/an</div>
                )}
                {extractedData.grossAnnualIncome && (
                  <div>Revenus bruts annuels: {formatCurrency(extractedData.grossAnnualIncome)}</div>
                )}
                {extractedData.municipalAssessment && (
                  <div>Évaluation municipale: {formatCurrency(extractedData.municipalAssessment)}</div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleApplyData}
              >
                Appliquer au calculateur
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
