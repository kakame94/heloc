"""
PlexInvest Québec - Calcul des Droits de Mutation (Taxe de Bienvenue)

Les droits de mutation varient selon la municipalité.
Données à jour pour 2025.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import TypedDict

from app.models.financial import (
    MunicipalityCode,
    TransferTaxBreakdown,
    TransferTaxBreakdownItem,
)

PRECISION = Decimal("0.01")


class TaxBracket(TypedDict):
    min: Decimal
    max: Decimal  # Use Decimal("Infinity") for unbounded
    rate: Decimal


class MunicipalityTaxConfig(TypedDict):
    name: str
    brackets: list[TaxBracket]
    additional_rates: list[dict] | None


# Grilles de taxation par municipalité (2025)
TRANSFER_TAX_TABLES: dict[MunicipalityCode, MunicipalityTaxConfig] = {
    MunicipalityCode.MONTREAL: {
        "name": "Montréal",
        "brackets": [
            {"min": Decimal("0"), "max": Decimal("58900"), "rate": Decimal("0.005")},
            {"min": Decimal("58900"), "max": Decimal("294500"), "rate": Decimal("0.01")},
            {"min": Decimal("294500"), "max": Decimal("500000"), "rate": Decimal("0.015")},
            {"min": Decimal("500000"), "max": Decimal("1000000"), "rate": Decimal("0.02")},
            {"min": Decimal("1000000"), "max": Decimal("2000000"), "rate": Decimal("0.025")},
            {"min": Decimal("2000000"), "max": Decimal("999999999"), "rate": Decimal("0.03")},
        ],
        "additional_rates": [
            {"threshold": Decimal("2136600"), "rate": Decimal("0.005")},
        ],
    },
    MunicipalityCode.QUEBEC_CITY: {
        "name": "Québec",
        "brackets": [
            {"min": Decimal("0"), "max": Decimal("55200"), "rate": Decimal("0.005")},
            {"min": Decimal("55200"), "max": Decimal("276200"), "rate": Decimal("0.01")},
            {"min": Decimal("276200"), "max": Decimal("500000"), "rate": Decimal("0.015")},
            {"min": Decimal("500000"), "max": Decimal("999999999"), "rate": Decimal("0.02")},
        ],
        "additional_rates": None,
    },
    MunicipalityCode.LAVAL: {
        "name": "Laval",
        "brackets": [
            {"min": Decimal("0"), "max": Decimal("55200"), "rate": Decimal("0.005")},
            {"min": Decimal("55200"), "max": Decimal("276200"), "rate": Decimal("0.01")},
            {"min": Decimal("276200"), "max": Decimal("500000"), "rate": Decimal("0.015")},
            {"min": Decimal("500000"), "max": Decimal("999999999"), "rate": Decimal("0.02")},
        ],
        "additional_rates": None,
    },
    MunicipalityCode.LONGUEUIL: {
        "name": "Longueuil",
        "brackets": [
            {"min": Decimal("0"), "max": Decimal("55200"), "rate": Decimal("0.005")},
            {"min": Decimal("55200"), "max": Decimal("276200"), "rate": Decimal("0.01")},
            {"min": Decimal("276200"), "max": Decimal("500000"), "rate": Decimal("0.015")},
            {"min": Decimal("500000"), "max": Decimal("999999999"), "rate": Decimal("0.02")},
        ],
        "additional_rates": None,
    },
    MunicipalityCode.GATINEAU: {
        "name": "Gatineau",
        "brackets": [
            {"min": Decimal("0"), "max": Decimal("55200"), "rate": Decimal("0.005")},
            {"min": Decimal("55200"), "max": Decimal("276200"), "rate": Decimal("0.01")},
            {"min": Decimal("276200"), "max": Decimal("999999999"), "rate": Decimal("0.015")},
        ],
        "additional_rates": None,
    },
    MunicipalityCode.SHERBROOKE: {
        "name": "Sherbrooke",
        "brackets": [
            {"min": Decimal("0"), "max": Decimal("55200"), "rate": Decimal("0.005")},
            {"min": Decimal("55200"), "max": Decimal("276200"), "rate": Decimal("0.01")},
            {"min": Decimal("276200"), "max": Decimal("999999999"), "rate": Decimal("0.015")},
        ],
        "additional_rates": None,
    },
    MunicipalityCode.TROIS_RIVIERES: {
        "name": "Trois-Rivières",
        "brackets": [
            {"min": Decimal("0"), "max": Decimal("55200"), "rate": Decimal("0.005")},
            {"min": Decimal("55200"), "max": Decimal("276200"), "rate": Decimal("0.01")},
            {"min": Decimal("276200"), "max": Decimal("999999999"), "rate": Decimal("0.015")},
        ],
        "additional_rates": None,
    },
    MunicipalityCode.OTHER_QC: {
        "name": "Autre (Québec)",
        "brackets": [
            {"min": Decimal("0"), "max": Decimal("55200"), "rate": Decimal("0.005")},
            {"min": Decimal("55200"), "max": Decimal("276200"), "rate": Decimal("0.01")},
            {"min": Decimal("276200"), "max": Decimal("999999999"), "rate": Decimal("0.015")},
        ],
        "additional_rates": None,
    },
}


def calculate_transfer_tax(
    purchase_price: Decimal,
    municipality: MunicipalityCode = MunicipalityCode.OTHER_QC
) -> Decimal:
    """
    Calcule les droits de mutation (taxe de bienvenue).

    Args:
        purchase_price: Prix d'achat ou valeur marchande (le plus élevé)
        municipality: Code de la municipalité

    Returns:
        Montant total des droits de mutation
    """
    tax_config = TRANSFER_TAX_TABLES.get(municipality)
    if not tax_config:
        raise ValueError(f"Municipalité non supportée: {municipality}")

    total_tax = Decimal("0")

    # Appliquer chaque tranche
    for bracket in tax_config["brackets"]:
        if purchase_price <= bracket["min"]:
            break

        taxable_max = min(purchase_price, bracket["max"])
        taxable_amount = taxable_max - bracket["min"]

        if taxable_amount > 0:
            total_tax += taxable_amount * bracket["rate"]

    # Ajouter les droits supplémentaires si applicable
    if tax_config["additional_rates"]:
        for additional in tax_config["additional_rates"]:
            if purchase_price > additional["threshold"]:
                additional_amount = purchase_price - additional["threshold"]
                total_tax += additional_amount * additional["rate"]

    return total_tax.quantize(PRECISION, ROUND_HALF_UP)


def get_transfer_tax_breakdown(
    purchase_price: Decimal,
    municipality: MunicipalityCode = MunicipalityCode.OTHER_QC
) -> TransferTaxBreakdown:
    """
    Génère le détail des droits de mutation par tranche.

    Args:
        purchase_price: Prix d'achat
        municipality: Code de la municipalité

    Returns:
        Détail par tranche
    """
    tax_config = TRANSFER_TAX_TABLES.get(municipality)
    if not tax_config:
        raise ValueError(f"Municipalité non supportée: {municipality}")

    brackets = []
    additional_tax = Decimal("0")

    for bracket in tax_config["brackets"]:
        if purchase_price <= bracket["min"]:
            break

        taxable_max = min(purchase_price, bracket["max"])
        taxable_amount = taxable_max - bracket["min"]

        if taxable_amount > 0:
            tax = taxable_amount * bracket["rate"]
            rate_str = f"{float(bracket['rate']) * 100:.1f}%"

            if bracket["max"] >= Decimal("999999999"):
                range_str = f"{int(bracket['min']):,}$+"
            else:
                range_str = f"{int(bracket['min']):,}$ - {int(bracket['max']):,}$"

            brackets.append(TransferTaxBreakdownItem(
                range=range_str,
                rate=rate_str,
                taxable_amount=taxable_amount.quantize(PRECISION),
                tax=tax.quantize(PRECISION),
            ))

    # Droits supplémentaires
    if tax_config["additional_rates"]:
        for additional in tax_config["additional_rates"]:
            if purchase_price > additional["threshold"]:
                additional_tax += (purchase_price - additional["threshold"]) * additional["rate"]

    total_tax = sum(b.tax for b in brackets) + additional_tax

    return TransferTaxBreakdown(
        municipality=tax_config["name"],
        purchase_price=purchase_price,
        brackets=brackets,
        additional_tax=additional_tax.quantize(PRECISION),
        total_tax=total_tax.quantize(PRECISION),
    )


def get_municipality_from_postal_code(postal_code: str) -> MunicipalityCode:
    """
    Détermine la municipalité à partir d'un code postal.

    Args:
        postal_code: Code postal canadien

    Returns:
        Code de municipalité
    """
    prefix = postal_code.upper()[:3] if postal_code else ""

    # Montréal: H1A à H9Z (île de Montréal)
    if prefix.startswith("H"):
        # Laval: H7
        if prefix.startswith("H7"):
            return MunicipalityCode.LAVAL
        return MunicipalityCode.MONTREAL

    # Québec: G1, G2
    if prefix.startswith("G1") or prefix.startswith("G2"):
        return MunicipalityCode.QUEBEC_CITY

    # Gatineau: J8, J9
    if prefix.startswith("J8") or prefix.startswith("J9"):
        return MunicipalityCode.GATINEAU

    # Longueuil / Rive-Sud: J4
    if prefix.startswith("J4"):
        return MunicipalityCode.LONGUEUIL

    # Sherbrooke: J1
    if prefix.startswith("J1"):
        return MunicipalityCode.SHERBROOKE

    # Trois-Rivières: G8, G9
    if prefix.startswith("G8") or prefix.startswith("G9"):
        return MunicipalityCode.TROIS_RIVIERES

    return MunicipalityCode.OTHER_QC
