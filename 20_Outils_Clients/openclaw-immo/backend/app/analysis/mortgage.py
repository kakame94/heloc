"""
Calculateur hypothecaire avec assurance SCHL (CMHC).

Specifique au Canada :
- Assurance SCHL obligatoire si mise de fonds < 20%
- Taux SCHL variables selon le % de mise de fonds
- Amortissement maximum 25 ans si assure
"""

from dataclasses import dataclass


@dataclass
class MortgageResult:
    """Resultat du calcul hypothecaire."""

    purchase_price: int
    down_payment: int
    down_payment_pct: float
    mortgage_principal: int
    cmhc_premium: int
    cmhc_rate_pct: float
    total_mortgage: int  # principal + SCHL
    monthly_payment: int
    total_interest: int
    total_cost: int
    amortization_years: int
    interest_rate: float


# Taux SCHL (CMHC) 2025-2026 pour proprietaire-occupant
# Source : https://www.cmhc-schl.gc.ca/
CMHC_RATES = {
    # (down_pct_min, down_pct_max): rate
    (0.05, 0.0999): 0.0400,  # 5-9.99% → 4.00%
    (0.10, 0.1499): 0.0310,  # 10-14.99% → 3.10%
    (0.15, 0.1999): 0.0280,  # 15-19.99% → 2.80%
}


def get_cmhc_rate(down_payment_pct: float) -> float:
    """
    Retourne le taux de prime SCHL selon le % de mise de fonds.

    Args:
        down_payment_pct: Pourcentage de mise de fonds (ex: 0.10 pour 10%)

    Returns:
        Taux SCHL (ex: 0.031 pour 3.10%), 0.0 si >= 20%
    """
    if down_payment_pct >= 0.20:
        return 0.0

    for (pct_min, pct_max), rate in CMHC_RATES.items():
        if pct_min <= down_payment_pct <= pct_max:
            return rate

    # Fallback pour < 5% (pas normalement permis)
    return 0.04


def calculate_mortgage(
    price: int,
    down_payment_pct: float = 0.10,
    interest_rate: float = 0.0499,
    amortization_years: int = 25,
) -> MortgageResult:
    """
    Calcule le paiement hypothecaire mensuel incluant la prime SCHL.

    Au Canada, la prime SCHL est ajoutee au capital du pret.

    Args:
        price: Prix d'achat
        down_payment_pct: % mise de fonds (ex: 0.10 pour 10%)
        interest_rate: Taux d'interet annuel (ex: 0.0499 pour 4.99%)
        amortization_years: Duree d'amortissement en annees

    Returns:
        MortgageResult avec tous les details
    """
    down_payment = round(price * down_payment_pct)
    mortgage_principal = price - down_payment

    # Prime SCHL
    cmhc_rate = get_cmhc_rate(down_payment_pct)
    cmhc_premium = round(mortgage_principal * cmhc_rate)

    # Le total du pret inclut la prime SCHL
    total_mortgage = mortgage_principal + cmhc_premium

    # Calcul du paiement mensuel (formule standard)
    monthly_rate = interest_rate / 12
    n_payments = amortization_years * 12

    if monthly_rate > 0:
        monthly_payment = total_mortgage * (
            monthly_rate * (1 + monthly_rate) ** n_payments
        ) / ((1 + monthly_rate) ** n_payments - 1)
    else:
        monthly_payment = total_mortgage / n_payments

    monthly_payment = round(monthly_payment)
    total_cost = monthly_payment * n_payments
    total_interest = total_cost - total_mortgage

    return MortgageResult(
        purchase_price=price,
        down_payment=down_payment,
        down_payment_pct=down_payment_pct,
        mortgage_principal=mortgage_principal,
        cmhc_premium=cmhc_premium,
        cmhc_rate_pct=cmhc_rate * 100,
        total_mortgage=total_mortgage,
        monthly_payment=monthly_payment,
        total_interest=total_interest,
        total_cost=total_cost,
        amortization_years=amortization_years,
        interest_rate=interest_rate,
    )
