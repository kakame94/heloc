"""
Fonctions utilitaires pour les ratios financiers immobiliers.

Ces fonctions sont utilisees independamment ou via cashflow.py.
"""


def debt_coverage_ratio(noi_annual: float, debt_service_annual: float) -> float:
    """
    Ratio de couverture de la dette (DCR).

    DCR > 1.0 : les revenus couvrent la dette
    DCR > 1.2 : seuil minimum pour la plupart des preteurs
    DCR > 1.3 : confortable

    Args:
        noi_annual: Revenu net d'exploitation annuel (avant dette)
        debt_service_annual: Service de la dette annuel (capital + interets)

    Returns:
        Ratio DCR
    """
    if debt_service_annual <= 0:
        return 0.0
    return round(noi_annual / debt_service_annual, 2)


def capitalization_rate(noi_annual: float, price: int) -> float:
    """
    Taux de capitalisation (Cap Rate).

    Cap Rate > 4% : acceptable a Montreal
    Cap Rate > 5% : bon
    Cap Rate > 7% : excellent (rare en ville)

    Args:
        noi_annual: Revenu net d'exploitation annuel
        price: Prix d'achat

    Returns:
        Cap rate en pourcentage
    """
    if price <= 0:
        return 0.0
    return round((noi_annual / price) * 100, 2)


def cash_on_cash_return(cashflow_annual: float, total_cash_invested: float) -> float:
    """
    Rendement cash-on-cash.

    Mesure le retour sur l'argent reellement investi (mise de fonds + frais).

    CoC > 5% : bon
    CoC > 8% : tres bon
    CoC > 12% : excellent

    Args:
        cashflow_annual: Cashflow net annuel
        total_cash_invested: Total cash investi (mise de fonds + frais)

    Returns:
        Rendement en pourcentage
    """
    if total_cash_invested <= 0:
        return 0.0
    return round((cashflow_annual / total_cash_invested) * 100, 2)


def gross_rent_multiplier(price: int, gross_rent_annual: float) -> float:
    """
    Multiplicateur de revenu brut (GRM / MRB).

    GRM < 12 : excellent
    GRM 12-15 : bon
    GRM > 15 : cher par rapport aux revenus

    Args:
        price: Prix d'achat
        gross_rent_annual: Revenus bruts annuels (toutes unites)

    Returns:
        Multiplicateur GRM
    """
    if gross_rent_annual <= 0:
        return 0.0
    return round(price / gross_rent_annual, 1)


def format_analysis_summary(
    cashflow_monthly: int,
    dcr: float,
    cap_rate: float,
    cash_on_cash: float,
) -> str:
    """
    Genere un resume texte de l'analyse pour WhatsApp ou Google Sheets.
    """
    # Indicateur cashflow
    if cashflow_monthly > 200:
        cf_emoji = "🟢"
    elif cashflow_monthly >= 0:
        cf_emoji = "🟡"
    else:
        cf_emoji = "🔴"

    # Indicateur DCR
    if dcr >= 1.2:
        dcr_emoji = "🟢"
    elif dcr >= 1.0:
        dcr_emoji = "🟡"
    else:
        dcr_emoji = "🔴"

    return (
        f"{cf_emoji} Cashflow: {cashflow_monthly:+d}$/mois\n"
        f"{dcr_emoji} DCR: {dcr:.2f}\n"
        f"   Cap Rate: {cap_rate:.1f}%\n"
        f"   Cash-on-Cash: {cash_on_cash:.1f}%"
    )
