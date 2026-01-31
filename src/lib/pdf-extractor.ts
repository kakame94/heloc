'use client'

/**
 * PlexInvest Québec - Extracteur de données PDF
 *
 * Extrait automatiquement les informations immobilières des fiches PDF
 * (Centris, DuProprio, Courtier, etc.)
 */

// PDF.js sera importé dynamiquement côté client uniquement
let pdfjsLib: typeof import('pdfjs-dist') | null = null

async function getPdfLib() {
  if (typeof window === 'undefined') {
    throw new Error('PDF extraction is only available in the browser')
  }

  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  }

  return pdfjsLib
}

/**
 * Données extraites d'une fiche immobilière
 */
export interface ExtractedPropertyData {
  // Identification
  address?: string
  postalCode?: string
  city?: string
  mlsNumber?: string

  // Prix et financement
  askingPrice?: number
  municipalAssessment?: number

  // Caractéristiques
  numberOfUnits?: number
  yearBuilt?: number
  lotSize?: string
  livingArea?: number

  // Revenus (par logement)
  monthlyRents?: number[]
  totalMonthlyRent?: number
  grossAnnualIncome?: number

  // Dépenses
  municipalTaxes?: number
  schoolTaxes?: number
  insurance?: number
  electricity?: number
  heating?: number
  otherExpenses?: number
  totalAnnualExpenses?: number

  // Calculé
  netOperatingIncome?: number

  // Métadonnées
  source?: 'centris' | 'duproprio' | 'remax' | 'royal_lepage' | 'unknown'
  extractionConfidence?: number
  rawText?: string
  warnings?: string[]
}

/**
 * Patterns de reconnaissance pour différentes sources
 */
const EXTRACTION_PATTERNS = {
  // Prix
  price: [
    /prix\s*(?:demandé|affiché)?\s*[:\s]*\$?\s*([\d\s,]+)/i,
    /asking\s*price\s*[:\s]*\$?\s*([\d\s,]+)/i,
    /\$\s*([\d]{3}[\s,]?[\d]{3})/,
    /([\d]{3}\s?[\d]{3})\s*\$/,
  ],

  // Adresse
  address: [
    /(\d+[\s,]+(?:rue|avenue|boulevard|boul|av|ch|chemin|place|pl)[\s,]+[\w\s\-']+)/i,
    /adresse\s*[:\s]*([\w\d\s\-',]+)/i,
  ],

  // Code postal
  postalCode: [
    /([A-Z]\d[A-Z]\s*\d[A-Z]\d)/i,
  ],

  // Numéro MLS
  mlsNumber: [
    /(?:mls|centris|#)\s*[:\s#]*(\d{7,8})/i,
    /numéro\s*[:\s]*(\d{7,8})/i,
  ],

  // Nombre de logements
  units: [
    /(\d+)\s*(?:logements?|unités?|appartements?)/i,
    /(?:duplex|triplex|quadruplex|quintuplex|sixplex)/i,
    /(\d+)\s*(?:plex)/i,
  ],

  // Année de construction
  yearBuilt: [
    /(?:année\s*(?:de\s*)?construction|construit\s*en|built\s*in)\s*[:\s]*(\d{4})/i,
    /(\d{4})\s*(?:année|construction)/i,
  ],

  // Taxes municipales
  municipalTax: [
    /taxes?\s*municipales?\s*[:\s]*\$?\s*([\d\s,\.]+)/i,
    /municipal\s*tax(?:es)?\s*[:\s]*\$?\s*([\d\s,\.]+)/i,
    /taxe\s*foncière\s*[:\s]*\$?\s*([\d\s,\.]+)/i,
  ],

  // Taxes scolaires
  schoolTax: [
    /taxes?\s*scolaires?\s*[:\s]*\$?\s*([\d\s,\.]+)/i,
    /school\s*tax(?:es)?\s*[:\s]*\$?\s*([\d\s,\.]+)/i,
  ],

  // Loyers
  rent: [
    /loyer\s*(?:#?\d+)?\s*[:\s]*\$?\s*([\d\s,]+)/gi,
    /(?:logement|unité|appart)\s*(?:#?\d+)?\s*[:\s]*\$?\s*([\d\s,]+)\s*\/?\s*mois/gi,
    /revenus?\s*(?:mensuels?|bruts?)\s*[:\s]*\$?\s*([\d\s,]+)/i,
  ],

  // Revenus totaux
  totalIncome: [
    /revenus?\s*(?:bruts?\s*)?(?:annuels?|totaux?)\s*[:\s]*\$?\s*([\d\s,]+)/i,
    /gross\s*(?:annual\s*)?income\s*[:\s]*\$?\s*([\d\s,]+)/i,
  ],

  // Superficie
  livingArea: [
    /superficie\s*(?:habitable)?\s*[:\s]*([\d\s,]+)\s*(?:pi²|p\.c\.|pc|pieds?)/i,
    /([\d\s,]+)\s*(?:pi²|p\.c\.|pc)\s*(?:habitable)?/i,
    /living\s*area\s*[:\s]*([\d\s,]+)/i,
  ],

  // Évaluation municipale
  assessment: [
    /évaluation\s*(?:municipale|foncière)?\s*[:\s]*\$?\s*([\d\s,]+)/i,
    /assessment\s*[:\s]*\$?\s*([\d\s,]+)/i,
  ],
}

/**
 * Convertit une chaîne de prix en nombre
 */
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0
  const cleaned = priceStr.replace(/[\s,$]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

/**
 * Détermine la source du document
 */
function detectSource(text: string): ExtractedPropertyData['source'] {
  const lowerText = text.toLowerCase()

  if (lowerText.includes('centris') || lowerText.includes('oaciq')) {
    return 'centris'
  }
  if (lowerText.includes('duproprio')) {
    return 'duproprio'
  }
  if (lowerText.includes('remax') || lowerText.includes('re/max')) {
    return 'remax'
  }
  if (lowerText.includes('royal lepage')) {
    return 'royal_lepage'
  }

  return 'unknown'
}

/**
 * Détecte le nombre de logements à partir de mots-clés
 */
function detectUnitsFromKeywords(text: string): number | undefined {
  const lowerText = text.toLowerCase()

  if (lowerText.includes('sixplex') || lowerText.includes('6-plex')) return 6
  if (lowerText.includes('quintuplex') || lowerText.includes('5-plex')) return 5
  if (lowerText.includes('quadruplex') || lowerText.includes('4-plex')) return 4
  if (lowerText.includes('triplex') || lowerText.includes('3-plex')) return 3
  if (lowerText.includes('duplex') || lowerText.includes('2-plex')) return 2

  return undefined
}

/**
 * Extrait toutes les données d'un texte PDF
 */
function extractDataFromText(text: string): ExtractedPropertyData {
  const data: ExtractedPropertyData = {
    warnings: [],
  }

  // Source
  data.source = detectSource(text)

  // Prix demandé
  for (const pattern of EXTRACTION_PATTERNS.price) {
    const match = text.match(pattern)
    if (match) {
      const price = parsePrice(match[1])
      if (price > 50000 && price < 50000000) {
        data.askingPrice = price
        break
      }
    }
  }

  // Adresse
  for (const pattern of EXTRACTION_PATTERNS.address) {
    const match = text.match(pattern)
    if (match) {
      data.address = match[1].trim()
      break
    }
  }

  // Code postal
  for (const pattern of EXTRACTION_PATTERNS.postalCode) {
    const match = text.match(pattern)
    if (match) {
      data.postalCode = match[1].toUpperCase().replace(/\s/g, ' ')
      break
    }
  }

  // Numéro MLS
  for (const pattern of EXTRACTION_PATTERNS.mlsNumber) {
    const match = text.match(pattern)
    if (match) {
      data.mlsNumber = match[1]
      break
    }
  }

  // Nombre de logements
  data.numberOfUnits = detectUnitsFromKeywords(text)
  if (!data.numberOfUnits) {
    for (const pattern of EXTRACTION_PATTERNS.units) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const units = parseInt(match[1])
        if (units >= 1 && units <= 100) {
          data.numberOfUnits = units
          break
        }
      }
    }
  }

  // Année de construction
  for (const pattern of EXTRACTION_PATTERNS.yearBuilt) {
    const match = text.match(pattern)
    if (match) {
      const year = parseInt(match[1])
      if (year >= 1800 && year <= new Date().getFullYear()) {
        data.yearBuilt = year
        break
      }
    }
  }

  // Taxes municipales
  for (const pattern of EXTRACTION_PATTERNS.municipalTax) {
    const match = text.match(pattern)
    if (match) {
      const tax = parsePrice(match[1])
      if (tax > 100 && tax < 100000) {
        data.municipalTaxes = tax
        break
      }
    }
  }

  // Taxes scolaires
  for (const pattern of EXTRACTION_PATTERNS.schoolTax) {
    const match = text.match(pattern)
    if (match) {
      const tax = parsePrice(match[1])
      if (tax > 50 && tax < 10000) {
        data.schoolTaxes = tax
        break
      }
    }
  }

  // Loyers individuels
  const rents: number[] = []
  for (const pattern of EXTRACTION_PATTERNS.rent) {
    let match
    const regex = new RegExp(pattern.source, pattern.flags)
    while ((match = regex.exec(text)) !== null) {
      const rent = parsePrice(match[1])
      if (rent >= 300 && rent <= 10000) {
        rents.push(rent)
      }
    }
  }

  if (rents.length > 0) {
    data.monthlyRents = rents.slice(0, data.numberOfUnits || rents.length)
    data.totalMonthlyRent = data.monthlyRents.reduce((sum, r) => sum + r, 0)
    data.grossAnnualIncome = data.totalMonthlyRent * 12
  }

  // Revenus totaux (si pas de loyers individuels)
  if (!data.totalMonthlyRent) {
    for (const pattern of EXTRACTION_PATTERNS.totalIncome) {
      const match = text.match(pattern)
      if (match) {
        const income = parsePrice(match[1])
        if (income > 5000) {
          if (income > 50000) {
            // Probablement annuel
            data.grossAnnualIncome = income
            data.totalMonthlyRent = income / 12
          } else {
            // Probablement mensuel
            data.totalMonthlyRent = income
            data.grossAnnualIncome = income * 12
          }
          break
        }
      }
    }
  }

  // Superficie
  for (const pattern of EXTRACTION_PATTERNS.livingArea) {
    const match = text.match(pattern)
    if (match) {
      const area = parsePrice(match[1])
      if (area > 100 && area < 100000) {
        data.livingArea = area
        break
      }
    }
  }

  // Évaluation municipale
  for (const pattern of EXTRACTION_PATTERNS.assessment) {
    const match = text.match(pattern)
    if (match) {
      const assessment = parsePrice(match[1])
      if (assessment > 50000 && assessment < 50000000) {
        data.municipalAssessment = assessment
        break
      }
    }
  }

  // Calculer le NOI si possible
  if (data.grossAnnualIncome && data.municipalTaxes) {
    const totalExpenses =
      (data.municipalTaxes || 0) +
      (data.schoolTaxes || 0) +
      (data.insurance || 0) +
      (data.electricity || 0) +
      (data.heating || 0)

    data.totalAnnualExpenses = totalExpenses
    data.netOperatingIncome = data.grossAnnualIncome - totalExpenses
  }

  // Calculer le niveau de confiance
  let confidence = 0
  const fields = [
    data.askingPrice,
    data.address,
    data.numberOfUnits,
    data.totalMonthlyRent,
    data.municipalTaxes,
  ]
  confidence = fields.filter(Boolean).length / fields.length
  data.extractionConfidence = Math.round(confidence * 100)

  // Ajouter des warnings
  if (!data.askingPrice) {
    data.warnings?.push('Prix demandé non trouvé')
  }
  if (!data.numberOfUnits) {
    data.warnings?.push('Nombre de logements non détecté')
  }
  if (!data.totalMonthlyRent) {
    data.warnings?.push('Loyers non trouvés - veuillez les saisir manuellement')
  }

  data.rawText = text.substring(0, 5000) // Garder les premiers 5000 caractères pour debug

  return data
}

/**
 * Extrait le texte d'un fichier PDF
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await getPdfLib()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: unknown) => (item as { str: string }).str)
      .join(' ')
    fullText += pageText + '\n'
  }

  return fullText
}

/**
 * Extrait les données immobilières d'un fichier PDF
 */
export async function extractPropertyDataFromPdf(file: File): Promise<ExtractedPropertyData> {
  try {
    const text = await extractTextFromPdf(file)
    const data = extractDataFromText(text)
    return data
  } catch (error) {
    console.error('Erreur extraction PDF:', error)
    return {
      warnings: ['Erreur lors de la lecture du PDF. Veuillez saisir les données manuellement.'],
      extractionConfidence: 0,
    }
  }
}

/**
 * Valide et complète les données extraites
 */
export function validateExtractedData(data: ExtractedPropertyData): {
  isValid: boolean
  missingFields: string[]
  suggestions: string[]
} {
  const missingFields: string[] = []
  const suggestions: string[] = []

  if (!data.askingPrice) {
    missingFields.push('Prix demandé')
  }

  if (!data.numberOfUnits) {
    missingFields.push('Nombre de logements')
    suggestions.push('Vérifiez si le document mentionne duplex, triplex, etc.')
  }

  if (!data.totalMonthlyRent && !data.monthlyRents?.length) {
    missingFields.push('Loyers')
    suggestions.push('Les loyers sont essentiels pour calculer le rendement')
  }

  if (!data.municipalTaxes) {
    missingFields.push('Taxes municipales')
    suggestions.push('Estimez à environ 1% de la valeur de la propriété')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    suggestions,
  }
}
