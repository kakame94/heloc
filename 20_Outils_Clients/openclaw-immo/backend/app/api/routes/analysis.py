"""
Routes API pour l'analyse financiere.
"""

from fastapi import APIRouter, Query

from app.analysis.cashflow import calculate_cashflow
from app.analysis.taxes_qc import calculate_welcome_tax, calculate_startup_costs

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.get("/simulate")
async def simulate_cashflow(
    price: int = Query(..., description="Prix d'achat"),
    num_units: int = Query(3, description="Nombre d'unites (3=triplex, 4=quadruplex)"),
    rent_per_unit: int = Query(1200, description="Loyer mensuel moyen par unite"),
    region: str = Query("montreal", description="Region (montreal, gatineau)"),
    municipal_eval: int = Query(0, description="Evaluation municipale (0 = auto)"),
    down_payment_pct: float = Query(0.10, description="% mise de fonds"),
    interest_rate: float = Query(0.0499, description="Taux d'interet annuel"),
):
    """
    Simulateur de cashflow — calculer l'analyse pour un bien hypothetique.
    Utile pour comparer des scenarios.
    """
    result = calculate_cashflow(
        price=price,
        num_units=num_units,
        estimated_rent_per_unit=rent_per_unit,
        municipal_eval=municipal_eval,
        region=region,
        down_payment_pct=down_payment_pct,
        interest_rate=interest_rate,
    )

    return {
        "revenue": {
            "gross_rent_monthly": result.gross_rent_monthly,
            "effective_rent_monthly": result.effective_rent_monthly,
            "vacancy_monthly": result.vacancy_monthly,
        },
        "expenses": {
            "mortgage_monthly": result.mortgage_monthly,
            "municipal_tax_monthly": result.municipal_tax_monthly,
            "school_tax_monthly": result.school_tax_monthly,
            "insurance_monthly": result.insurance_monthly,
            "maintenance_monthly": result.maintenance_monthly,
            "total_expenses_monthly": result.total_expenses_monthly,
        },
        "results": {
            "cashflow_monthly": result.cashflow_monthly,
            "cashflow_annual": result.cashflow_annual,
            "dcr": result.dcr,
            "cap_rate": result.cap_rate,
            "cash_on_cash": result.cash_on_cash,
            "grm": result.grm,
        },
        "one_time_costs": {
            "welcome_tax": result.welcome_tax,
            "cmhc_premium": result.cmhc_premium,
            "total_startup_costs": result.total_startup_costs,
        },
        "mortgage": {
            "purchase_price": result.mortgage.purchase_price,
            "down_payment": result.mortgage.down_payment,
            "mortgage_principal": result.mortgage.mortgage_principal,
            "cmhc_premium": result.mortgage.cmhc_premium,
            "total_mortgage": result.mortgage.total_mortgage,
            "monthly_payment": result.mortgage.monthly_payment,
            "total_interest": result.mortgage.total_interest,
        },
        "assumptions": result.assumptions,
    }


@router.get("/welcome-tax")
async def get_welcome_tax(
    price: int = Query(..., description="Prix d'achat"),
    region: str = Query("montreal", description="Region"),
):
    """Calcule la taxe de bienvenue pour un prix donne."""
    tax = calculate_welcome_tax(price, region)
    startup = calculate_startup_costs(price, region)
    return {
        "welcome_tax": tax,
        "startup_costs": startup,
    }
