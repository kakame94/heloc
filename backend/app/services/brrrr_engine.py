"""
PlexInvest Québec - Moteur de Calcul BRRRR

Ce module est le cœur algorithmique de l'application.
Il intègre toutes les règles métier spécifiques au Québec.
"""

from decimal import Decimal, ROUND_HALF_UP

from app.core.config import settings
from app.models.financial import (
    PropertyFinancialsInput,
    BrrrrCalculationResult,
    AcquisitionResult,
    RenovationResult,
    RentalResult,
    RefinanceResult,
    KPIsResult,
    ValidationResult,
    HelocCapacityInput,
    HelocCapacityResult,
    QuickMetrics,
)
from app.services.mortgage import (
    calculate_monthly_mortgage_payment,
    calculate_interest_only_payment,
    calculate_stress_test_rate,
    calculate_dcr,
)
from app.services.transfer_tax import calculate_transfer_tax

PRECISION = Decimal("0.01")

# Règles BSIF (hard-coded)
BSIF_HELOC_ROTATING_LTV_MAX = Decimal("0.65")
BSIF_REFINANCE_LTV_MAX = Decimal("0.80")
BSIF_MIN_DCR_COMMERCIAL = Decimal("1.25")


def calculate_cmhc_premium(
    loan_amount: Decimal,
    down_payment_percent: Decimal,
    is_owner_occupied: bool,
    total_units: int,
    purchase_price: Decimal,
) -> tuple[Decimal | None, Decimal | None, list[str]]:
    """
    Calcule la prime SCHL si applicable.

    Returns:
        (premium_amount, premium_rate, notes)
    """
    notes = []

    # Pas de SCHL si mise de fonds >= 20%
    if down_payment_percent >= Decimal("0.20"):
        notes.append("Mise de fonds ≥ 20%: Aucune assurance SCHL requise")
        return None, None, notes

    # Investisseur pur: pas de SCHL
    if not is_owner_occupied:
        notes.append("Investisseur non-occupant: Mise de fonds 20% minimum requise")
        return None, None, notes

    # 5+ logements: pas de SCHL résidentiel
    if total_units > 4:
        notes.append("5+ logements: Financement commercial requis")
        return None, None, notes

    # Vérifier prix max assurable
    if purchase_price > Decimal("999999"):
        notes.append("Prix > 1M$: Non assurable SCHL, 20% minimum requis")
        return None, None, notes

    # Déterminer le taux de prime
    if down_payment_percent >= Decimal("0.15"):
        rate = Decimal("0.028")  # 2.8%
        notes.append("Prime SCHL 2.8%: Mise de fonds 15-19.99%")
    elif down_payment_percent >= Decimal("0.10"):
        rate = Decimal("0.031")  # 3.1%
        notes.append("Prime SCHL 3.1%: Mise de fonds 10-14.99%")
    else:
        rate = Decimal("0.04")  # 4.0%
        notes.append("Prime SCHL 4.0%: Mise de fonds 5-9.99%")

    premium = loan_amount * rate
    return premium.quantize(PRECISION), rate, notes


def calculate_brrrr(input_data: PropertyFinancialsInput) -> BrrrrCalculationResult:
    """
    Calcul BRRRR complet.

    Args:
        input_data: Paramètres financiers de la propriété

    Returns:
        Résultat complet avec tous les KPIs et validations
    """
    warnings: list[str] = []
    errors: list[str] = []

    # =========================================================================
    # PHASE 1: ACQUISITION (BUY)
    # =========================================================================

    purchase_price = input_data.purchase_price
    down_payment_percent = input_data.down_payment_percent
    down_payment_amount = purchase_price * down_payment_percent

    # Droits de mutation
    transfer_tax = calculate_transfer_tax(purchase_price, input_data.municipality)

    # Frais de clôture
    notary_fees = input_data.notary_fees
    inspection_fees = input_data.inspection_fees
    other_closing_costs = input_data.other_closing_costs

    # Hypothèque initiale
    loan_amount = purchase_price - down_payment_amount

    # SCHL
    cmhc_premium, cmhc_rate, cmhc_notes = calculate_cmhc_premium(
        loan_amount,
        down_payment_percent,
        input_data.is_owner_occupied,
        input_data.total_units,
        purchase_price,
    )
    warnings.extend(cmhc_notes)

    initial_mortgage_amount = loan_amount
    if cmhc_premium:
        initial_mortgage_amount += cmhc_premium

    # Paiement mensuel initial
    initial_monthly_payment = calculate_monthly_mortgage_payment(
        initial_mortgage_amount,
        input_data.mortgage_rate,
        input_data.amortization_years,
    )

    # Total cash à l'acquisition
    total_closing_costs = transfer_tax + notary_fees + inspection_fees + other_closing_costs
    total_cash_at_acquisition = down_payment_amount + total_closing_costs

    acquisition = AcquisitionResult(
        purchase_price=purchase_price,
        down_payment_amount=down_payment_amount.quantize(PRECISION),
        down_payment_percent=down_payment_percent,
        transfer_tax=transfer_tax,
        notary_fees=notary_fees,
        inspection_fees=inspection_fees,
        other_closing_costs=other_closing_costs,
        cmhc_premium=cmhc_premium,
        cmhc_premium_percent=cmhc_rate,
        total_closing_costs=total_closing_costs.quantize(PRECISION),
        initial_mortgage_amount=initial_mortgage_amount.quantize(PRECISION),
        initial_monthly_payment=initial_monthly_payment,
        total_cash_at_acquisition=total_cash_at_acquisition.quantize(PRECISION),
    )

    # =========================================================================
    # PHASE 2: RÉNOVATION (REHAB)
    # =========================================================================

    reno_budget_base = input_data.renovation_budget
    contingency_percent = input_data.renovation_contingency_percent
    contingency_amount = reno_budget_base * (contingency_percent / Decimal("100"))
    total_reno_budget = reno_budget_base + contingency_amount

    # Coût de portage pendant rénovations
    monthly_property_taxes = input_data.municipal_taxes / Decimal("12")
    monthly_school_taxes = input_data.school_taxes / Decimal("12")
    monthly_insurance = input_data.insurance_annual / Decimal("12")

    monthly_carry_cost = (
        initial_monthly_payment +
        monthly_property_taxes +
        monthly_school_taxes +
        monthly_insurance
    )

    # Ajouter intérêts HELOC si financement par HELOC
    if input_data.reno_financing_type.value == "HELOC" and input_data.heloc_rate_for_reno:
        # Estimation moyenne: moitié du budget tiré en moyenne
        avg_heloc_balance = total_reno_budget / Decimal("2")
        monthly_heloc_interest = calculate_interest_only_payment(
            avg_heloc_balance, input_data.heloc_rate_for_reno
        )
        monthly_carry_cost += monthly_heloc_interest

    total_carry_cost = monthly_carry_cost * input_data.renovation_duration_months

    renovation = RenovationResult(
        budget_base=reno_budget_base,
        contingency=contingency_amount.quantize(PRECISION),
        total_budget=total_reno_budget.quantize(PRECISION),
        duration_months=input_data.renovation_duration_months,
        financing_type=input_data.reno_financing_type,
        monthly_carry_cost=monthly_carry_cost.quantize(PRECISION),
        total_carry_cost=total_carry_cost.quantize(PRECISION),
    )

    # =========================================================================
    # PHASE 3: LOCATION (RENT)
    # =========================================================================

    gross_monthly_rent = input_data.projected_monthly_rent
    vacancy_rate = input_data.vacancy_rate_percent / Decimal("100")
    vacancy_loss = gross_monthly_rent * vacancy_rate
    effective_gross_income = gross_monthly_rent - vacancy_loss

    # Charges mensuelles
    monthly_muni_tax = input_data.municipal_taxes / Decimal("12")
    monthly_school_tax = input_data.school_taxes / Decimal("12")
    monthly_insurance_op = input_data.insurance_annual / Decimal("12")

    maintenance_rate = input_data.maintenance_percent / Decimal("100")
    monthly_maintenance = effective_gross_income * maintenance_rate

    management_rate = input_data.management_percent / Decimal("100")
    monthly_management = effective_gross_income * management_rate

    monthly_utilities = input_data.utilities_monthly

    total_operating_expenses = (
        monthly_muni_tax +
        monthly_school_tax +
        monthly_insurance_op +
        monthly_maintenance +
        monthly_management +
        monthly_utilities
    )

    monthly_noi = effective_gross_income - total_operating_expenses
    annual_noi = monthly_noi * Decimal("12")

    rental = RentalResult(
        gross_monthly_rent=gross_monthly_rent,
        effective_gross_income=effective_gross_income.quantize(PRECISION),
        vacancy_loss=vacancy_loss.quantize(PRECISION),
        municipal_taxes=monthly_muni_tax.quantize(PRECISION),
        school_taxes=monthly_school_tax.quantize(PRECISION),
        insurance=monthly_insurance_op.quantize(PRECISION),
        maintenance=monthly_maintenance.quantize(PRECISION),
        management=monthly_management.quantize(PRECISION),
        utilities=monthly_utilities,
        total_operating_expenses=total_operating_expenses.quantize(PRECISION),
        monthly_noi=monthly_noi.quantize(PRECISION),
        annual_noi=annual_noi.quantize(PRECISION),
    )

    # =========================================================================
    # PHASE 4: REFINANCEMENT (REFINANCE)
    # =========================================================================

    arv = input_data.after_repair_value

    # Structure selon règles BSIF
    max_total_borrowing = arv * BSIF_REFINANCE_LTV_MAX
    max_rotating = arv * BSIF_HELOC_ROTATING_LTV_MAX

    # Portion rotative (jusqu'à 65%)
    heloc_portion = min(max_total_borrowing, max_rotating)

    # Portion amortie (65% à 80%)
    amortized_portion = max_total_borrowing - heloc_portion

    # Paiements mensuels
    monthly_heloc_payment = calculate_interest_only_payment(
        heloc_portion, input_data.refinance_rate
    )

    monthly_mortgage_payment = Decimal("0")
    if amortized_portion > 0:
        monthly_mortgage_payment = calculate_monthly_mortgage_payment(
            amortized_portion,
            input_data.refinance_rate,
            input_data.refinance_amort_years,
        )

    total_monthly_debt_service = monthly_heloc_payment + monthly_mortgage_payment

    # Frais de refinancement
    appraisal_fee = Decimal("400")
    legal_fees = Decimal("1200")
    total_refi_costs = appraisal_fee + legal_fees

    # Extraction de capital
    total_debt_before_refi = initial_mortgage_amount + total_reno_budget
    new_mortgage_amount = max_total_borrowing
    gross_cash_out = new_mortgage_amount - total_debt_before_refi
    net_cash_out = gross_cash_out - total_refi_costs

    refinance = RefinanceResult(
        after_repair_value=arv,
        max_ltv_total=BSIF_REFINANCE_LTV_MAX,
        max_ltv_rotating=BSIF_HELOC_ROTATING_LTV_MAX,
        new_mortgage_amount=new_mortgage_amount.quantize(PRECISION),
        heloc_portion_amount=heloc_portion.quantize(PRECISION),
        amortized_portion_amount=amortized_portion.quantize(PRECISION),
        monthly_mortgage_payment=monthly_mortgage_payment,
        monthly_heloc_payment=monthly_heloc_payment,
        total_monthly_debt_service=total_monthly_debt_service.quantize(PRECISION),
        appraisal_fee=appraisal_fee,
        legal_fees=legal_fees,
        total_refinance_costs=total_refi_costs,
        gross_cash_out=gross_cash_out.quantize(PRECISION),
        net_cash_out=net_cash_out.quantize(PRECISION),
    )

    # =========================================================================
    # KPIs FINAUX
    # =========================================================================

    total_cash_invested = total_cash_at_acquisition + total_reno_budget + total_carry_cost

    cash_extracted = max(Decimal("0"), net_cash_out)
    equity_left_in_deal = max(Decimal("0"), total_cash_invested - cash_extracted)

    monthly_cashflow = monthly_noi - total_monthly_debt_service
    annual_cashflow = monthly_cashflow * Decimal("12")

    # Rendements
    is_infinite_return = equity_left_in_deal <= 0

    if is_infinite_return:
        cash_on_cash = Decimal("999999")  # Représente l'infini
        return_on_equity = Decimal("999999")
    else:
        cash_on_cash = (annual_cashflow / equity_left_in_deal * Decimal("100")).quantize(PRECISION)
        return_on_equity = cash_on_cash

    cap_rate = Decimal("0")
    if arv > 0:
        cap_rate = (annual_noi / arv * Decimal("100")).quantize(PRECISION)

    gross_rent_multiplier = Decimal("0")
    if gross_monthly_rent > 0:
        gross_rent_multiplier = (purchase_price / (gross_monthly_rent * Decimal("12"))).quantize(PRECISION)

    # DCR
    annual_debt_service = total_monthly_debt_service * Decimal("12")
    dcr = calculate_dcr(annual_noi, annual_debt_service)
    meets_min_dcr = dcr >= BSIF_MIN_DCR_COMMERCIAL

    if input_data.total_units >= 5 and not meets_min_dcr:
        warnings.append(f"DCR de {dcr} inférieur au minimum de {BSIF_MIN_DCR_COMMERCIAL}")

    # Stress test
    stress_test_rate = calculate_stress_test_rate(input_data.refinance_rate)
    monthly_payment_stress = calculate_monthly_mortgage_payment(
        new_mortgage_amount, stress_test_rate, input_data.refinance_amort_years
    )
    cashflow_at_stress = monthly_noi - monthly_payment_stress
    passes_stress_test = cashflow_at_stress >= 0

    if not passes_stress_test:
        warnings.append(f"Cashflow négatif au taux du stress test ({float(stress_test_rate)*100:.2f}%)")

    # Validations
    if monthly_cashflow < 0:
        warnings.append("Cashflow négatif - Ce projet coûte de l'argent chaque mois")

    if cash_on_cash < 5 and not is_infinite_return:
        warnings.append("Cash-on-Cash inférieur à 5% - Rendement faible")

    kpis = KPIsResult(
        total_cash_invested=total_cash_invested.quantize(PRECISION),
        cash_extracted_at_refi=cash_extracted.quantize(PRECISION),
        equity_left_in_deal=equity_left_in_deal.quantize(PRECISION),
        monthly_noi=monthly_noi.quantize(PRECISION),
        monthly_debt_service=total_monthly_debt_service.quantize(PRECISION),
        monthly_cashflow=monthly_cashflow.quantize(PRECISION),
        annual_cashflow=annual_cashflow.quantize(PRECISION),
        cash_on_cash_return=cash_on_cash,
        return_on_equity=return_on_equity,
        cap_rate=cap_rate,
        gross_rent_multiplier=gross_rent_multiplier,
        is_infinite_return=is_infinite_return,
        debt_coverage_ratio=dcr,
        meets_min_dcr=meets_min_dcr,
        stress_test_rate=stress_test_rate,
        monthly_payment_at_stress_rate=monthly_payment_stress,
        passes_stress_test=passes_stress_test,
    )

    validation = ValidationResult(
        is_valid=len(errors) == 0,
        warnings=warnings,
        errors=errors,
    )

    return BrrrrCalculationResult(
        acquisition=acquisition,
        renovation=renovation,
        rental=rental,
        refinance=refinance,
        kpis=kpis,
        validation=validation,
    )


def calculate_heloc_capacity(input_data: HelocCapacityInput) -> HelocCapacityResult:
    """
    Calcule la capacité HELOC disponible.
    """
    property_value = input_data.current_property_value
    mortgage_balance = input_data.current_mortgage_balance
    heloc_balance = input_data.current_heloc_balance

    total_current_debt = mortgage_balance + heloc_balance
    current_ltv = total_current_debt / property_value if property_value > 0 else Decimal("0")

    max_total_borrowing = property_value * BSIF_REFINANCE_LTV_MAX
    max_rotating_credit = property_value * BSIF_HELOC_ROTATING_LTV_MAX

    total_equity = property_value - total_current_debt

    # Disponible en rotatif (jusqu'à 65%)
    available_at_rotating = max(Decimal("0"), max_rotating_credit - total_current_debt)

    # Disponible en amorti (jusqu'à 80%)
    available_at_total = max(Decimal("0"), max_total_borrowing - total_current_debt)

    can_access_rotating = total_current_debt <= max_rotating_credit
    recommended_heloc_limit = available_at_rotating if can_access_rotating else Decimal("0")

    after_heloc_debt = total_current_debt + available_at_total
    after_heloc_ltv = after_heloc_debt / property_value if property_value > 0 else Decimal("0")

    return HelocCapacityResult(
        max_ltv_total=BSIF_REFINANCE_LTV_MAX,
        max_ltv_rotating=BSIF_HELOC_ROTATING_LTV_MAX,
        max_total_borrowing=max_total_borrowing.quantize(PRECISION),
        max_rotating_credit=max_rotating_credit.quantize(PRECISION),
        total_equity=total_equity.quantize(PRECISION),
        available_equity_at_rotating=available_at_rotating.quantize(PRECISION),
        available_equity_at_total=available_at_total.quantize(PRECISION),
        recommended_heloc_limit=recommended_heloc_limit.quantize(PRECISION),
        can_access_rotating=can_access_rotating,
        current_ltv=current_ltv.quantize(Decimal("0.0001")),
        after_heloc_ltv=after_heloc_ltv.quantize(Decimal("0.0001")),
    )


def quick_brrrr_metrics(
    purchase_price: Decimal,
    renovation_budget: Decimal,
    monthly_rent: Decimal,
    arv: Decimal,
    mortgage_rate: Decimal = Decimal("0.0525"),
) -> QuickMetrics:
    """
    Calcul rapide des métriques pour comparaison.
    """
    down_payment = purchase_price * Decimal("0.20")
    closing_costs = purchase_price * Decimal("0.02") + Decimal("5000")
    total_investment = down_payment + closing_costs + renovation_budget

    annual_rent = monthly_rent * Decimal("12")
    annual_noi = annual_rent * Decimal("0.70")  # 30% pour charges

    new_mortgage = arv * Decimal("0.80")
    monthly_mortgage = calculate_monthly_mortgage_payment(new_mortgage, mortgage_rate, 25)
    annual_debt_service = monthly_mortgage * Decimal("12")

    annual_cashflow = annual_noi - annual_debt_service
    monthly_cashflow = annual_cashflow / Decimal("12")

    debt_before_refi = (purchase_price * Decimal("0.80")) + renovation_budget
    cash_out = new_mortgage - debt_before_refi
    equity_left = max(Decimal("0"), total_investment - cash_out)

    if equity_left > 0:
        cash_on_cash = (annual_cashflow / equity_left * Decimal("100")).quantize(PRECISION)
        is_infinite = False
    else:
        cash_on_cash = Decimal("999999")
        is_infinite = True

    cap_rate = (annual_noi / arv * Decimal("100")).quantize(PRECISION) if arv > 0 else Decimal("0")

    return QuickMetrics(
        cash_on_cash=cash_on_cash,
        monthly_cashflow=monthly_cashflow.quantize(PRECISION),
        cap_rate=cap_rate,
        is_infinite_return=is_infinite,
        total_investment=total_investment.quantize(PRECISION),
    )
