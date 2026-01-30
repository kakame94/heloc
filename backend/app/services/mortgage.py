"""
PlexInvest Québec - Calculs Hypothécaires Canadiens

IMPORTANT: Au Canada, les taux hypothécaires sont composés semi-annuellement (2x/an),
contrairement aux États-Unis où ils sont composés mensuellement.
"""

from decimal import Decimal, ROUND_HALF_UP
import math

# Précision pour les calculs financiers
PRECISION = Decimal("0.01")


def convert_to_monthly_effective_rate(nominal_annual_rate: Decimal) -> Decimal:
    """
    Convertit un taux nominal composé semi-annuellement en taux mensuel effectif.

    Formule canadienne: (1 + r/2)^2 = (1 + m)^12
    Donc: m = (1 + r/2)^(1/6) - 1

    Args:
        nominal_annual_rate: Taux nominal annuel (ex: 0.05 pour 5%)

    Returns:
        Taux mensuel effectif
    """
    r = float(nominal_annual_rate)
    semi_annual_rate = r / 2
    monthly_rate = (1 + semi_annual_rate) ** (1/6) - 1
    return Decimal(str(monthly_rate))


def calculate_monthly_mortgage_payment(
    principal: Decimal,
    nominal_annual_rate: Decimal,
    amortization_years: int
) -> Decimal:
    """
    Calcule le paiement hypothécaire mensuel (capital + intérêts).
    Utilise la formule canadienne avec composition semi-annuelle.

    Args:
        principal: Montant du prêt
        nominal_annual_rate: Taux nominal annuel
        amortization_years: Période d'amortissement en années

    Returns:
        Paiement mensuel
    """
    if principal <= 0:
        return Decimal("0")

    if nominal_annual_rate <= 0:
        return (principal / (amortization_years * 12)).quantize(PRECISION, ROUND_HALF_UP)

    P = float(principal)
    monthly_rate = float(convert_to_monthly_effective_rate(nominal_annual_rate))
    n = amortization_years * 12

    # Formule: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    one_plus_r = 1 + monthly_rate
    one_plus_r_pow_n = one_plus_r ** n
    numerator = monthly_rate * one_plus_r_pow_n
    denominator = one_plus_r_pow_n - 1

    payment = P * numerator / denominator
    return Decimal(str(payment)).quantize(PRECISION, ROUND_HALF_UP)


def calculate_interest_only_payment(
    principal: Decimal,
    nominal_annual_rate: Decimal
) -> Decimal:
    """
    Calcule le paiement d'intérêts seulement (HELOC rotatif).

    Args:
        principal: Solde du prêt
        nominal_annual_rate: Taux nominal annuel

    Returns:
        Paiement mensuel (intérêts seulement)
    """
    if principal <= 0 or nominal_annual_rate <= 0:
        return Decimal("0")

    monthly_rate = convert_to_monthly_effective_rate(nominal_annual_rate)
    payment = principal * monthly_rate
    return payment.quantize(PRECISION, ROUND_HALF_UP)


def calculate_stress_test_rate(contract_rate: Decimal) -> Decimal:
    """
    Calcule le taux du stress test BSIF.

    Le taux de qualification est le PLUS ÉLEVÉ entre:
    - Taux contractuel + 2%
    - 5.25% (plancher)

    Args:
        contract_rate: Taux du contrat hypothécaire

    Returns:
        Taux de qualification pour stress test
    """
    rate_with_buffer = contract_rate + Decimal("0.02")
    floor = Decimal("0.0525")
    return max(rate_with_buffer, floor)


def calculate_dcr(annual_noi: Decimal, annual_debt_service: Decimal) -> Decimal:
    """
    Calcule le DCR (Debt Coverage Ratio) pour immeubles commerciaux.

    DCR = NOI annuel / Service de la dette annuel
    Minimum requis: généralement 1.25x

    Args:
        annual_noi: Net Operating Income annuel
        annual_debt_service: Service de la dette annuel

    Returns:
        DCR
    """
    if annual_debt_service <= 0:
        return Decimal("0")

    return (annual_noi / annual_debt_service).quantize(PRECISION, ROUND_HALF_UP)


def calculate_remaining_balance(
    principal: Decimal,
    nominal_annual_rate: Decimal,
    amortization_years: int,
    months_elapsed: int
) -> Decimal:
    """
    Calcule le solde restant après X mois.

    Args:
        principal: Montant initial
        nominal_annual_rate: Taux nominal annuel
        amortization_years: Période d'amortissement
        months_elapsed: Nombre de mois écoulés

    Returns:
        Solde restant
    """
    monthly_payment = calculate_monthly_mortgage_payment(
        principal, nominal_annual_rate, amortization_years
    )
    monthly_rate = convert_to_monthly_effective_rate(nominal_annual_rate)

    balance = principal
    for _ in range(months_elapsed):
        interest_portion = balance * monthly_rate
        principal_portion = monthly_payment - interest_portion
        balance = balance - principal_portion
        if balance < 0:
            return Decimal("0")

    return balance.quantize(PRECISION, ROUND_HALF_UP)


def calculate_max_mortgage_from_dcr(
    annual_noi: Decimal,
    target_dcr: Decimal,
    nominal_rate: Decimal,
    amort_years: int
) -> Decimal:
    """
    Calcule le montant maximum d'hypothèque basé sur un DCR cible.

    Args:
        annual_noi: NOI annuel
        target_dcr: DCR cible (ex: 1.25)
        nominal_rate: Taux hypothécaire
        amort_years: Amortissement

    Returns:
        Montant hypothécaire maximum
    """
    # Service de dette annuel max = NOI / DCR cible
    max_annual_debt_service = annual_noi / target_dcr
    max_monthly_payment = max_annual_debt_service / 12

    # Inverse du calcul de paiement pour trouver le principal
    monthly_rate = float(convert_to_monthly_effective_rate(nominal_rate))
    n = amort_years * 12

    one_plus_r = 1 + monthly_rate
    one_plus_r_pow_n = one_plus_r ** n

    # P = M * [(1+r)^n - 1] / [r(1+r)^n]
    principal = float(max_monthly_payment) * (one_plus_r_pow_n - 1) / (monthly_rate * one_plus_r_pow_n)

    return Decimal(str(int(principal)))
