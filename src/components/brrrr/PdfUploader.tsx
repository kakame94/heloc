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
  FileSearch,
  ScanText,
  DollarSign,
  Home,
  Building2,
  Check,
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

type UploadState = 'idle' | 'processing' | 'success' | 'error'

// Étapes de progression avec descriptions vulgarisées
const PROCESSING_STEPS = [
  {
    id: 'upload',
    label: 'Chargement du fichier',
    description: 'Lecture du document PDF...',
    icon: Upload,
    duration: 400
  },
  {
    id: 'parse',
    label: 'Analyse du document',
    description: 'Extraction du texte de chaque page...',
    icon: FileSearch,
    duration: 600
  },
  {
    id: 'detect',
    label: 'Détection de la source',
    description: 'Identification: Centris, DuProprio, RE/MAX...',
    icon: ScanText,
    duration: 400
  },
  {
    id: 'price',
    label: 'Recherche du prix',
    description: 'Extraction du prix demandé et évaluation...',
    icon: DollarSign,
    duration: 500
  },
  {
    id: 'property',
    label: 'Infos propriété',
    description: 'Adresse, nombre de logements, superficie...',
    icon: Home,
    duration: 400
  },
  {
    id: 'financials',
    label: 'Données financières',
    description: 'Loyers, taxes, assurances, revenus...',
    icon: Building2,
    duration: 500
  },
  {
    id: 'complete',
    label: 'Analyse terminée',
    description: 'Vérification et validation des données',
    icon: Check,
    duration: 300
  },
]

export function PdfUploader({ onDataExtracted, className }: PdfUploaderProps) {
  const [state, setState] = React.useState<UploadState>('idle')
  const [currentStep, setCurrentStep] = React.useState(0)
  const [allStepsComplete, setAllStepsComplete] = React.useState(false)
  const [extractedData, setExtractedData] = React.useState<ExtractedPropertyData | null>(null)
  const [fileName, setFileName] = React.useState<string>('')
  const [showDetails, setShowDetails] = React.useState(false)
  const [dragActive, setDragActive] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const processingRef = React.useRef<boolean>(false)

  const handleFile = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setState('error')
      return
    }

    if (processingRef.current) return
    processingRef.current = true

    setFileName(file.name)
    setState('processing')
    setCurrentStep(0)
    setAllStepsComplete(false)

    try {
      // Lancer l'extraction avec progression simulée en parallèle
      let stepIndex = 0
      const stepInterval = setInterval(() => {
        if (stepIndex < PROCESSING_STEPS.length - 1) {
          stepIndex++
          setCurrentStep(stepIndex)
        }
      }, 350) // Avancer rapidement

      const data = await extractPropertyDataFromPdf(file)

      // Arrêter l'intervalle et passer directement à la fin
      clearInterval(stepInterval)
      setCurrentStep(PROCESSING_STEPS.length - 1)

      // Marquer toutes les étapes comme complètes (pour afficher la coche verte)
      setAllStepsComplete(true)

      // Court délai pour montrer "Analyse terminée ✓" puis afficher les résultats
      await new Promise(resolve => setTimeout(resolve, 400))

      setExtractedData(data)
      setState('success')
    } catch (error) {
      console.error('Erreur:', error)
      setState('error')
    } finally {
      processingRef.current = false
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
    setCurrentStep(0)
    setAllStepsComplete(false)
    setExtractedData(null)
    setFileName('')
    setShowDetails(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const validation = extractedData ? validateExtractedData(extractedData) : null
  const progressPercent = ((currentStep + 1) / PROCESSING_STEPS.length) * 100

  return (
    <Card className={cn('overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950/20', className)}>
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-primary/20 to-primary/10">
        <CardTitle className="text-sm flex items-center gap-2 text-primary">
          <FileText className="h-4 w-4" />
          Importer une fiche PDF (Centris, DuProprio...)
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

        {state === 'processing' && (
          <div className="py-4 space-y-4">
            {/* Nom du fichier */}
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium truncate">{fileName}</span>
            </div>

            {/* Barre de progression principale */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Analyse en cours...</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Liste des étapes */}
            <div className="space-y-2 mt-4">
              {PROCESSING_STEPS.map((step, index) => {
                const StepIcon = step.icon
                const isLastStep = index === PROCESSING_STEPS.length - 1
                const isCompleted = index < currentStep || (isLastStep && allStepsComplete)
                const isCurrent = index === currentStep && !allStepsComplete
                const isPending = index > currentStep

                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg transition-all duration-300',
                      isCurrent && 'bg-primary/10',
                      isCompleted && !isLastStep && 'opacity-60',
                      isCompleted && isLastStep && 'bg-emerald-50 dark:bg-emerald-950/30'
                    )}
                  >
                    {/* Icône de statut */}
                    <div className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                      isCompleted && 'bg-emerald-100 text-emerald-600',
                      isCurrent && 'bg-primary/20 text-primary',
                      isPending && 'bg-muted text-muted-foreground'
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>

                    {/* Texte */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        isCompleted && isLastStep && 'text-emerald-700 dark:text-emerald-400',
                        isCurrent && 'text-primary',
                        isPending && 'text-muted-foreground'
                      )}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-muted-foreground truncate">
                          {step.description}
                        </p>
                      )}
                      {isCompleted && isLastStep && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-500">
                          Prêt à appliquer les données!
                        </p>
                      )}
                    </div>

                    {/* Indicateur de complétion */}
                    {isCompleted && (
                      <span className={cn(
                        'text-xs font-medium',
                        isLastStep ? 'text-emerald-600 font-semibold' : 'text-emerald-600'
                      )}>
                        {isLastStep ? '✓' : 'OK'}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Erreur lors de la lecture du PDF
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vérifiez que le fichier n&apos;est pas protégé ou corrompu
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
