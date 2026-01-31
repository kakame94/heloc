/**
 * PlexInvest V2 - Exports des moteurs de calcul
 */

// Mortgage
export {
  calculateMortgagePayment,
  calculateStressTestedPayment,
  calculateSCHLPremium,
  fullMortgageAnalysis,
  generateAmortizationSummary,
  compareAmortizations,
  type MortgageCalculation,
  type SCHLResult,
} from './mortgage'

// Welcome Tax
export {
  calculateWelcomeTax,
  estimateWelcomeTax,
  isHighValueProperty,
  compareCityTaxes,
  type WelcomeTaxResult,
} from './welcome-tax'

// Cashflow
export {
  analyzeCashflow,
  quickCashflowAnalysis,
  projectCashflow,
  type CashflowAnalysis,
} from './cashflow'

// BRRRR
export {
  analyzeBRRRR,
  calculateMaxPurchasePrice,
  sensitivityAnalysis,
  type BRRRRAnalysis,
  type WaterfallItem,
} from './brrrr'
