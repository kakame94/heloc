"""
PlexInvest Québec - Routes API FastAPI
"""

from fastapi import APIRouter, HTTPException
from decimal import Decimal

from app.models.financial import (
    PropertyFinancialsInput,
    BrrrrCalculationResult,
    HelocCapacityInput,
    HelocCapacityResult,
    TransferTaxBreakdown,
    MunicipalityCode,
    QuickMetrics,
)
from app.services.brrrr_engine import (
    calculate_brrrr,
    calculate_heloc_capacity,
    quick_brrrr_metrics,
)
from app.services.transfer_tax import (
    get_transfer_tax_breakdown,
    get_municipality_from_postal_code,
)

router = APIRouter()


# =============================================================================
# BRRRR Calculator
# =============================================================================

@router.post("/brrrr/calculate", response_model=BrrrrCalculationResult)
async def calculate_brrrr_endpoint(input_data: PropertyFinancialsInput):
    """
    Calcule une analyse BRRRR complète.

    Retourne tous les KPIs, les détails par phase, et les validations.
    """
    try:
        result = calculate_brrrr(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/brrrr/quick-metrics", response_model=QuickMetrics)
async def quick_metrics_endpoint(
    purchase_price: Decimal,
    renovation_budget: Decimal,
    monthly_rent: Decimal,
    arv: Decimal,
    mortgage_rate: Decimal = Decimal("0.0525"),
):
    """
    Calcul rapide des métriques pour comparaison de propriétés.

    Utile pour le tri/filtrage de multiples propriétés.
    """
    try:
        result = quick_brrrr_metrics(
            purchase_price=purchase_price,
            renovation_budget=renovation_budget,
            monthly_rent=monthly_rent,
            arv=arv,
            mortgage_rate=mortgage_rate,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============================================================================
# HELOC Calculator
# =============================================================================

@router.post("/heloc/capacity", response_model=HelocCapacityResult)
async def heloc_capacity_endpoint(input_data: HelocCapacityInput):
    """
    Calcule la capacité HELOC disponible selon les règles BSIF.

    Retourne les limites 65% (rotatif) et 80% (total), ainsi que
    l'équité disponible.
    """
    try:
        result = calculate_heloc_capacity(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============================================================================
# Transfer Tax (Droits de Mutation)
# =============================================================================

@router.get("/transfer-tax/calculate", response_model=TransferTaxBreakdown)
async def transfer_tax_endpoint(
    purchase_price: Decimal,
    municipality: MunicipalityCode = MunicipalityCode.MONTREAL,
):
    """
    Calcule les droits de mutation (taxe de bienvenue) avec détail par tranche.
    """
    try:
        result = get_transfer_tax_breakdown(purchase_price, municipality)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transfer-tax/municipality-from-postal")
async def municipality_from_postal_endpoint(postal_code: str):
    """
    Détermine la municipalité à partir d'un code postal.
    """
    try:
        municipality = get_municipality_from_postal_code(postal_code)
        return {"postal_code": postal_code, "municipality": municipality}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============================================================================
# Health Check
# =============================================================================

@router.get("/health")
async def health_check():
    """
    Vérifie que l'API est fonctionnelle.
    """
    return {
        "status": "healthy",
        "service": "PlexInvest Québec API",
        "version": "1.0.0",
    }


# =============================================================================
# Règles Réglementaires
# =============================================================================

@router.get("/rules/bsif")
async def get_bsif_rules():
    """
    Retourne les règles BSIF hard-coded.

    Ces valeurs sont des contraintes réglementaires et ne sont pas configurables.
    """
    return {
        "heloc_rotating_ltv_max": "65%",
        "refinance_ltv_max": "80%",
        "stress_test_buffer": "+2%",
        "stress_test_floor": "5.25%",
        "min_dcr_commercial": "1.25x",
        "source": "Ligne directrice B-20 du BSIF",
        "last_updated": "2025-01",
    }


@router.get("/rules/cmhc")
async def get_cmhc_rules():
    """
    Retourne les règles SCHL/CMHC.
    """
    return {
        "insurance_threshold": "20%",
        "max_insurable_price": 999999,
        "premiums": {
            "5-9.99%": "4.00%",
            "10-14.99%": "3.10%",
            "15-19.99%": "2.80%",
        },
        "mli_select": {
            "min_units": 5,
            "max_amortization": 50,
            "max_ltv": "95%",
        },
        "source": "SCHL/CMHC",
        "last_updated": "2025-01",
    }
