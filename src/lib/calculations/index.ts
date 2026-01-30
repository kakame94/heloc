/**
 * PlexInvest Québec - Export des modules de calcul
 */

// Mortgage calculations
export {
  convertToMonthlyEffectiveRate,
  calculateMonthlyMortgagePayment,
  calculateInterestOnlyPayment,
  generateAmortizationSchedule,
  calculateRemainingBalance,
  calculateStressTestRate,
  performStressTest,
  calculateDCR,
  calculateMaxMortgageFromDCR,
} from './mortgage'
export type { AmortizationEntry, StressTestParams, StressTestResult } from './mortgage'

// Transfer tax (Droits de mutation)
export {
  calculateTransferTax,
  getTransferTaxBreakdown,
  getMunicipalityFromPostalCode,
  TRANSFER_TAX_TABLES,
} from './transfer-tax'
export type { TransferTaxBreakdown } from './transfer-tax'

// CMHC / SCHL
export {
  calculateCMHCPremium,
  calculateMinimumDownPayment,
  evaluateMLISelectEligibility,
} from './cmhc'
export type { CMHCContext, CMHCResult, MLISelectParams, MLISelectResult } from './cmhc'

// HELOC
export {
  calculateHelocCapacity,
  calculateOptimalRefinanceStructure,
  simulateRenovationFinancing,
  calculateBuyingPower,
} from './heloc'
export type {
  OptimalFinancingStructure,
  RenovationFinancingParams,
  RenovationFinancingResult,
  BuyingPowerParams,
  BuyingPowerResult,
} from './heloc'

// Renovation costs
export {
  estimateRenovationCost,
  generateRenovationBudget,
  quickRenovationEstimate,
  analyzeListingDescription,
  calculateRenovationROI,
  RENOVATION_COST_MATRIX,
} from './renovation-costs'
export type { QuickRenovationEstimate, QuickEstimateCondition } from './renovation-costs'

// BRRRR Engine
export {
  calculateBRRRR,
  quickBrrrrMetrics,
  calculateMaxPurchasePrice,
} from './brrrr-engine'
export type { QuickBrrrrMetrics } from './brrrr-engine'

// Comparables
export {
  analyzeWithComparables,
  calculatePropertyMultipliers,
  EXAMPLE_SUBJECT,
  EXAMPLE_COMPARABLES,
} from './comparables'
export type {
  ComparableProperty,
  PropertyMultipliers,
  ComparableAnalysisResult,
} from './comparables'

// Projections
export {
  calculateProjections,
  calculate8thWonder,
  EXAMPLE_PROJECTION_PARAMS,
} from './projections'
export type {
  ProjectionParams,
  YearProjection,
  ProjectionResult,
  CompoundGrowthResult,
} from './projections'

// Amortization (detailed)
export {
  generateAmortizationSchedule as generateDetailedAmortization,
  calculateRemainingBalanceAfterMonths,
  compareAmortizations,
} from './amortization'
export type {
  AmortizationScheduleResult,
  AnnualAmortizationSummary,
  AmortizationComparison,
} from './amortization'

// Strategies
export {
  analyzeCashBackStrategy,
  analyzeCapitalOnlyStrategy,
  analyzeAcceleratedPayments,
} from './strategies'
export type {
  CashBackParams,
  CashBackResult,
  CapitalOnlyParams,
  CapitalOnlyResult,
  AcceleratedPaymentParams,
  AcceleratedPaymentResult,
} from './strategies'
