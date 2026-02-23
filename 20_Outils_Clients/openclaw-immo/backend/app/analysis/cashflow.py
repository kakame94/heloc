"""
Calcul du cashflow mensuel pour un immeuble a revenus.

Proprietaire-occupant : n-1 unites generent du loyer.
"""

from dataclasses import dataclass

from app.analysis.mortgage import calculate_mortgage, MortgageResult
from app.analysis.taxes_qc import (
    calculate_welcome_tax,
    calculate_school_tax_annual,
    estimate_municipal_tax_annual,
)
from app.config import settings


@dataclass
class CashflowResult:
    """Resultat complet de l'analyse de cashflow."""

    # Revenus
    gross_rent_monthly: int  # Loyer brut (toutes unites sauf proprio)
    effective_rent_monthly: int  # Apres vacance
    vacancy_monthly: int

    # Depenses
    mortgage_monthly: int
    municipal_tax_monthly: int
    school_tax_monthly: int
    insurance_monthly: int
    maintenance_monthly: int
    total_expenses_monthly: int

    # Resultats
    cashflow_monthly: int
    cashflow_annual: int

    # Ratios
    dcr: float  # Debt Coverage Ratio
    cap_rate: float  # Taux de capitalisation %
    cash_on_cash: float  # Rendement cash-on-cash %
    grm: float  # Gross Rent Multiplier

    # Couts ponctuels
    welcome_tax: int
    cmhc_premium: int
    total_startup_costs: int

    # Hypotheque
    mortgage: MortgageResult

    # Hypotheses
    assumptions: dict


def calculate_cashflow(
    price: int,
    num_units: int = 3,
    estimated_rent_per_unit: int = 1_200,
    municipal_eval: int = 0,
    region: str = "montreal",
    down_payment_pct: float = 0.0,
    interest_rate: float = 0.0,
    amortization_years: int = 0,
    insurance_annual: int = 0,
    maintenance_pct: float = 0.0,
    vacancy_pct: float = 0.0,
) -> CashflowResult:
    """
    Calcule le cashflow mensuel complet pour un immeuble a revenus.

    Le proprietaire occupe 1 unite, les n-1 autres generent du loyer.

    Args:
        price: Prix d'achat
        num_units: Nombre total d'unites (3=triplex, 4=quadruplex)
        estimated_rent_per_unit: Loyer mensuel moyen par unite
        municipal_eval: Evaluation municipale (si 0, on utilise 85% du prix)
        region: "montreal" ou "gatineau"
        Autres params: defauts pris de config si = 0

    Returns:
        CashflowResult avec tous les details
    """
    # Appliquer les defauts depuis config
    if down_payment_pct == 0.0:
        down_payment_pct = settings.default_down_payment_pct
    if interest_rate == 0.0:
        interest_rate = settings.default_interest_rate
    if amortization_years == 0:
        amortization_years = settings.default_amortization_years
    if insurance_annual == 0:
        insurance_annual = settings.default_insurance_annual
    if maintenance_pct == 0.0:
        maintenance_pct = settings.default_maintenance_pct
    if vacancy_pct == 0.0:
        vacancy_pct = settings.default_vacancy_pct

    # Evaluation municipale estimee (si non fournie)
    if municipal_eval == 0:
        municipal_eval = round(price * 0.85)

    # --- HYPOTHEQUE ---
    mortgage = calculate_mortgage(price, down_payment_pct, interest_rate, amortization_years)

    # --- REVENUS ---
    # Proprietaire-occupant : n-1 unites
    rented_units = num_units - 1
    gross_rent_monthly = estimated_rent_per_unit * rented_units
    vacancy_monthly = round(gross_rent_monthly * vacancy_pct)
    effective_rent_monthly = gross_rent_monthly - vacancy_monthly

    # --- DEPENSES ---
    municipal_tax_annual = estimate_municipal_tax_annual(municipal_eval, region)
    school_tax_annual = calculate_school_tax_annual(municipal_eval)

    municipal_tax_monthly = round(municipal_tax_annual / 12)
    school_tax_monthly = round(school_tax_annual / 12)
    insurance_monthly = round(insurance_annual / 12)
    maintenance_monthly = round(gross_rent_monthly * maintenance_pct)

    total_expenses_monthly = (
        mortgage.monthly_payment
        + municipal_tax_monthly
        + school_tax_monthly
        + insurance_monthly
        + maintenance_monthly
    )

    # --- CASHFLOW ---
    cashflow_monthly = effective_rent_monthly - total_expenses_monthly
    cashflow_annual = cashflow_monthly * 12

    # --- RATIOS ---
    # NOI = Net Operating Income (avant dette)
    noi_annual = (effective_rent_monthly - municipal_tax_monthly - school_tax_monthly - insurance_monthly - maintenance_monthly) * 12

    # DCR = NOI / Service de la dette annuel
    annual_debt_service = mortgage.monthly_payment * 12
    dcr = round(noi_annual / annual_debt_service, 2) if annual_debt_service > 0 else 0.0

    # Cap Rate = NOI / Prix
    cap_rate = round((noi_annual / price) * 100, 2) if price > 0 else 0.0

    # Cash-on-Cash = Cashflow annuel / Cash investi
    total_cash_invested = mortgage.down_payment + mortgage.cmhc_premium
    cash_on_cash = round((cashflow_annual / total_cash_invested) * 100, 2) if total_cash_invested > 0 else 0.0

    # GRM = Prix / Revenus bruts annuels (inclut toutes les unites pour le ratio standard)
    all_units_rent_annual = estimated_rent_per_unit * num_units * 12
    grm = round(price / all_units_rent_annual, 1) if all_units_rent_annual > 0 else 0.0

    # --- COUTS DE DEMARRAGE ---
    welcome_tax = calculate_welcome_tax(price, region)
    total_startup = mortgage.down_payment + welcome_tax + 1_500 + 700  # notaire + inspection

    return CashflowResult(
        gross_rent_monthly=gross_rent_monthly,
        effective_rent_monthly=effective_rent_monthly,
        vacancy_monthly=vacancy_monthly,
        mortgage_monthly=mortgage.monthly_payment,
        municipal_tax_monthly=municipal_tax_monthly,
        school_tax_monthly=school_tax_monthly,
        insurance_monthly=insurance_monthly,
        maintenance_monthly=maintenance_monthly,
        total_expenses_monthly=total_expenses_monthly,
        cashflow_monthly=cashflow_monthly,
        cashflow_annual=cashflow_annual,
        dcr=dcr,
        cap_rate=cap_rate,
        cash_on_cash=cash_on_cash,
        grm=grm,
        welcome_tax=welcome_tax,
        cmhc_premium=mortgage.cmhc_premium,
        total_startup_costs=total_startup,
        mortgage=mortgage,
        assumptions={
            "down_payment_pct": down_payment_pct,
            "interest_rate": interest_rate,
            "amortization_years": amortization_years,
            "insurance_annual": insurance_annual,
            "maintenance_pct": maintenance_pct,
            "vacancy_pct": vacancy_pct,
            "estimated_rent_per_unit": estimated_rent_per_unit,
            "municipal_eval": municipal_eval,
            "region": region,
        },
    )
