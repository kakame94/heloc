"""
PlexInvest Québec - Modèles Pydantic pour les calculs financiers
"""

from pydantic import BaseModel, Field, field_validator
from decimal import Decimal
from typing import Optional, Literal
from enum import Enum


class MunicipalityCode(str, Enum):
    MONTREAL = "MONTREAL"
    QUEBEC_CITY = "QUEBEC_CITY"
    LAVAL = "LAVAL"
    LONGUEUIL = "LONGUEUIL"
    GATINEAU = "GATINEAU"
    SHERBROOKE = "SHERBROOKE"
    TROIS_RIVIERES = "TROIS_RIVIERES"
    OTHER_QC = "OTHER_QC"


class RenoFinancingType(str, Enum):
    CASH = "CASH"
    HELOC = "HELOC"
    PERSONAL_LOC = "PERSONAL_LOC"
    PRIVATE_LOAN = "PRIVATE_LOAN"


class PropertyFinancialsInput(BaseModel):
    """
    Input pour le calcul BRRRR complet
    """
    # Phase 1: Acquisition
    purchase_price: Decimal = Field(..., ge=10000, description="Prix d'achat")
    down_payment_percent: Decimal = Field(
        default=Decimal("0.20"),
        ge=Decimal("0.05"),
        le=Decimal("1.0"),
        description="Pourcentage de mise de fonds"
    )
    municipality: MunicipalityCode = Field(
        default=MunicipalityCode.MONTREAL,
        description="Code de la municipalité pour les droits de mutation"
    )
    notary_fees: Decimal = Field(default=Decimal("2000"), ge=0)
    inspection_fees: Decimal = Field(default=Decimal("800"), ge=0)
    other_closing_costs: Decimal = Field(default=Decimal("0"), ge=0)

    # Financement initial
    mortgage_rate: Decimal = Field(
        default=Decimal("0.0525"),
        ge=0,
        le=Decimal("0.20"),
        description="Taux hypothécaire nominal annuel"
    )
    amortization_years: int = Field(default=25, ge=5, le=30)

    # Phase 2: Rénovation
    renovation_budget: Decimal = Field(default=Decimal("0"), ge=0)
    renovation_contingency_percent: Decimal = Field(
        default=Decimal("10"),
        ge=0,
        le=50,
        description="% de contingence sur le budget rénos"
    )
    renovation_duration_months: int = Field(default=3, ge=0, le=24)
    reno_financing_type: RenoFinancingType = Field(default=RenoFinancingType.HELOC)
    heloc_rate_for_reno: Optional[Decimal] = Field(
        default=Decimal("0.0695"),
        ge=0,
        le=Decimal("0.20")
    )

    # Phase 3: Location
    projected_monthly_rent: Decimal = Field(..., ge=0, description="Loyer mensuel total projeté")
    vacancy_rate_percent: Decimal = Field(
        default=Decimal("5"),
        ge=0,
        le=50,
        description="Taux d'inoccupation %"
    )
    municipal_taxes: Decimal = Field(..., ge=0, description="Taxes municipales annuelles")
    school_taxes: Decimal = Field(default=Decimal("500"), ge=0)
    insurance_annual: Decimal = Field(default=Decimal("2400"), ge=0)
    maintenance_percent: Decimal = Field(
        default=Decimal("5"),
        ge=0,
        le=20,
        description="% des revenus pour maintenance"
    )
    management_percent: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        le=15,
        description="% pour gestion externe"
    )
    utilities_monthly: Decimal = Field(default=Decimal("0"), ge=0)

    # Phase 4: Refinancement
    after_repair_value: Decimal = Field(..., ge=0, description="Valeur après rénovations (ARV)")
    refinance_rate: Decimal = Field(
        default=Decimal("0.0525"),
        ge=0,
        le=Decimal("0.20")
    )
    refinance_amort_years: int = Field(default=25, ge=5, le=30)

    # Contexte
    total_units: int = Field(default=1, ge=1, le=100)
    is_owner_occupied: bool = Field(default=False)

    @field_validator('down_payment_percent')
    @classmethod
    def validate_down_payment(cls, v, info):
        """Valide la mise de fonds selon le contexte"""
        # Note: validation complète avec is_owner_occupied
        # sera faite dans le service
        return v


class AcquisitionResult(BaseModel):
    """Résultats de la phase d'acquisition"""
    purchase_price: Decimal
    down_payment_amount: Decimal
    down_payment_percent: Decimal
    transfer_tax: Decimal
    notary_fees: Decimal
    inspection_fees: Decimal
    other_closing_costs: Decimal
    cmhc_premium: Optional[Decimal]
    cmhc_premium_percent: Optional[Decimal]
    total_closing_costs: Decimal
    initial_mortgage_amount: Decimal
    initial_monthly_payment: Decimal
    total_cash_at_acquisition: Decimal


class RenovationResult(BaseModel):
    """Résultats de la phase de rénovation"""
    budget_base: Decimal
    contingency: Decimal
    total_budget: Decimal
    duration_months: int
    financing_type: RenoFinancingType
    monthly_carry_cost: Decimal
    total_carry_cost: Decimal


class RentalResult(BaseModel):
    """Résultats de la phase de location"""
    gross_monthly_rent: Decimal
    effective_gross_income: Decimal
    vacancy_loss: Decimal
    municipal_taxes: Decimal
    school_taxes: Decimal
    insurance: Decimal
    maintenance: Decimal
    management: Decimal
    utilities: Decimal
    total_operating_expenses: Decimal
    monthly_noi: Decimal
    annual_noi: Decimal


class RefinanceResult(BaseModel):
    """Résultats de la phase de refinancement"""
    after_repair_value: Decimal
    max_ltv_total: Decimal
    max_ltv_rotating: Decimal
    new_mortgage_amount: Decimal
    heloc_portion_amount: Decimal
    amortized_portion_amount: Decimal
    monthly_mortgage_payment: Decimal
    monthly_heloc_payment: Decimal
    total_monthly_debt_service: Decimal
    appraisal_fee: Decimal
    legal_fees: Decimal
    total_refinance_costs: Decimal
    gross_cash_out: Decimal
    net_cash_out: Decimal


class KPIsResult(BaseModel):
    """KPIs calculés"""
    total_cash_invested: Decimal
    cash_extracted_at_refi: Decimal
    equity_left_in_deal: Decimal
    monthly_noi: Decimal
    monthly_debt_service: Decimal
    monthly_cashflow: Decimal
    annual_cashflow: Decimal
    cash_on_cash_return: Decimal
    return_on_equity: Decimal
    cap_rate: Decimal
    gross_rent_multiplier: Decimal
    is_infinite_return: bool
    debt_coverage_ratio: Decimal
    meets_min_dcr: bool
    stress_test_rate: Decimal
    monthly_payment_at_stress_rate: Decimal
    passes_stress_test: bool


class ValidationResult(BaseModel):
    """Résultats de validation"""
    is_valid: bool
    warnings: list[str]
    errors: list[str]


class BrrrrCalculationResult(BaseModel):
    """Résultat complet du calcul BRRRR"""
    acquisition: AcquisitionResult
    renovation: RenovationResult
    rental: RentalResult
    refinance: RefinanceResult
    kpis: KPIsResult
    validation: ValidationResult


class HelocCapacityInput(BaseModel):
    """Input pour le calcul de capacité HELOC"""
    current_property_value: Decimal = Field(..., ge=0)
    current_mortgage_balance: Decimal = Field(..., ge=0)
    current_heloc_balance: Decimal = Field(default=Decimal("0"), ge=0)


class HelocCapacityResult(BaseModel):
    """Résultat du calcul de capacité HELOC"""
    max_ltv_total: Decimal
    max_ltv_rotating: Decimal
    max_total_borrowing: Decimal
    max_rotating_credit: Decimal
    total_equity: Decimal
    available_equity_at_rotating: Decimal
    available_equity_at_total: Decimal
    recommended_heloc_limit: Decimal
    can_access_rotating: bool
    current_ltv: Decimal
    after_heloc_ltv: Decimal


class TransferTaxBreakdownItem(BaseModel):
    """Détail d'une tranche de taxe"""
    range: str
    rate: str
    taxable_amount: Decimal
    tax: Decimal


class TransferTaxBreakdown(BaseModel):
    """Détail complet des droits de mutation"""
    municipality: str
    purchase_price: Decimal
    brackets: list[TransferTaxBreakdownItem]
    additional_tax: Decimal
    total_tax: Decimal


class QuickMetrics(BaseModel):
    """Métriques rapides pour comparaison"""
    cash_on_cash: Decimal
    monthly_cashflow: Decimal
    cap_rate: Decimal
    is_infinite_return: bool
    total_investment: Decimal
