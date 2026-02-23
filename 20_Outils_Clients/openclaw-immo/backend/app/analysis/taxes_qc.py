"""
Calculs de taxes specifiques au Quebec.

- Taxe de bienvenue (droits de mutation immobiliere)
- Taxe scolaire
- Estimation taxes municipales
"""


def calculate_welcome_tax(price: int, region: str = "montreal") -> int:
    """
    Calcule les droits de mutation (taxe de bienvenue).

    Montreal a des tranches specifiques plus elevees que le reste du Quebec.
    Gatineau utilise les tranches standard du Quebec.

    Args:
        price: Prix d'achat (ou evaluation municipale si plus elevee)
        region: "montreal" ou "gatineau" (ou autre)

    Returns:
        Montant de la taxe de bienvenue en dollars
    """
    if region == "montreal":
        # Tranches Montreal 2025-2026
        brackets = [
            (58_900, 0.005),
            (294_600, 0.01),
            (500_000, 0.015),
            (1_000_000, 0.02),
            (2_000_000, 0.025),
            (float("inf"), 0.03),
        ]
    else:
        # Tranches standard Quebec (Gatineau, Laval, etc.)
        brackets = [
            (58_900, 0.005),
            (294_600, 0.01),
            (float("inf"), 0.015),
        ]

    tax = 0.0
    prev_limit = 0

    for limit, rate in brackets:
        taxable = min(price, limit) - prev_limit
        if taxable <= 0:
            break
        tax += taxable * rate
        prev_limit = int(limit) if limit != float("inf") else prev_limit

    return round(tax)


def calculate_school_tax_annual(municipal_eval: int) -> int:
    """
    Taxe scolaire du Quebec (taux uniforme provincial 2025-2026).

    Taux : 0.08423$ par 100$ d'evaluation
    Exemption : 25 000$

    Args:
        municipal_eval: Evaluation municipale de la propriete

    Returns:
        Taxe scolaire annuelle en dollars
    """
    RATE = 0.0008423  # 0.08423$ par 100$
    EXEMPTION = 25_000
    taxable = max(0, municipal_eval - EXEMPTION)
    return round(taxable * RATE)


def estimate_municipal_tax_annual(municipal_eval: int, region: str = "montreal") -> int:
    """
    Estimation des taxes municipales annuelles.

    Taux approximatifs par 100$ d'evaluation :
    - Montreal : ~0.90$ (variable par arrondissement)
    - Gatineau : ~1.10$
    - Laval    : ~0.80$
    - Longueuil: ~0.85$

    Args:
        municipal_eval: Evaluation municipale
        region: Region

    Returns:
        Estimation taxes municipales annuelles
    """
    rates = {
        "montreal": 0.0090,
        "gatineau": 0.0110,
        "laval": 0.0080,
        "longueuil": 0.0085,
    }
    rate = rates.get(region, 0.0090)
    return round(municipal_eval * rate)


def calculate_startup_costs(price: int, region: str = "montreal") -> dict[str, int]:
    """
    Calcule les frais de demarrage (closing costs).

    Inclut :
    - Droits de mutation (taxe de bienvenue)
    - Frais de notaire (~1 500$)
    - Assurance habitation (~3 000$/an, au prorata)
    - Taxes sur prime SCHL (~9% provincial + ~5% federal)
    - Inspection (~500-800$)

    Args:
        price: Prix d'achat
        region: Region

    Returns:
        Dict avec le detail de chaque frais
    """
    welcome_tax = calculate_welcome_tax(price, region)

    return {
        "welcome_tax": welcome_tax,
        "notary_fees": 1_500,
        "home_insurance_first_year": 3_000,
        "inspection": 700,
        "total": welcome_tax + 1_500 + 3_000 + 700,
    }
