"""
Taches planifiees — scraping, sync, alertes.

Utilise APScheduler pour executer les taches a intervalles reguliers.
"""

import logging
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.config import settings
from app.db.database import async_session
from app.db.models import Listing, Analysis, ScrapeRun
from app.scraper.centris import scrape_all_centris
from app.scraper.centris_brightdata import scrape_all_centris_brightdata
from app.analysis.cashflow import calculate_cashflow
from app.sheets.sync import sync_listings_to_sheet
from app.notifications.whatsapp import notify_new_listings

logger = logging.getLogger(__name__)


# Estimation loyer par unite selon la region
DEFAULT_RENT_ESTIMATES = {
    "montreal": 1_200,
    "gatineau": 1_000,
    "laval": 1_150,
    "longueuil": 1_100,
}


async def run_scrape_job() -> dict:
    """
    Job principal : scrape → DB → analyse → Sheets → WhatsApp.

    Returns:
        Dict avec le resume de l'execution
    """
    logger.info("=== Debut du scrape job ===")
    started_at = datetime.utcnow()

    # 1. Scrape Centris.ca (MLS Quebec)
    #    Priorite : Bright Data si configure, sinon scraping direct
    raw_listings = []
    scrape_method = "direct"

    if settings.brightdata_enabled and settings.brightdata_api_key:
        logger.info("Tentative de scrape via Bright Data...")
        raw_listings = await scrape_all_centris_brightdata(settings.max_price)
        scrape_method = "brightdata"

    if not raw_listings:
        if scrape_method == "brightdata":
            logger.warning(
                "Bright Data n'a retourne aucun resultat — "
                "fallback vers scraping direct"
            )
        logger.info("Scraping direct Centris...")
        raw_listings = await scrape_all_centris(settings.max_price)
        scrape_method = "direct"

    logger.info(
        "Scrape termine (%s) : %d listings bruts",
        scrape_method, len(raw_listings),
    )

    # 2. Inserer/mettre a jour en base
    new_listings = []
    updated_count = 0
    error_count = 0

    async with async_session() as session:
        # Creer le scrape run
        scrape_run = ScrapeRun(
            started_at=started_at,
            region="montreal,gatineau,laval,longueuil",
            listings_found=len(raw_listings),
            status="running",
        )
        session.add(scrape_run)
        await session.flush()

        # Filtrer les prix aberrants (< 50000$)
        raw_listings = [r for r in raw_listings if r.get("price", 0) >= 50_000]

        for raw in raw_listings:
            try:
                # Verifier si le listing existe deja
                result = await session.execute(
                    select(Listing).where(Listing.mls_number == raw["mls_number"])
                )
                existing = result.scalar_one_or_none()

                if existing:
                    # Mise a jour : prix, last_seen, is_active
                    if existing.price != raw["price"]:
                        logger.info(
                            "Prix change MLS %s: %d → %d",
                            raw["mls_number"], existing.price, raw["price"],
                        )
                    existing.price = raw["price"]
                    existing.last_seen_at = datetime.utcnow()
                    existing.is_active = True
                    updated_count += 1
                else:
                    # Nouveau listing
                    listing = Listing(
                        mls_number=raw["mls_number"],
                        source=raw.get("source", "realtor_ca"),
                        property_type=raw["property_type"],
                        price=raw["price"],
                        address=raw["address"],
                        city=raw.get("city"),
                        region=raw.get("region"),
                        postal_code=raw.get("postal_code"),
                        latitude=raw.get("latitude"),
                        longitude=raw.get("longitude"),
                        bedrooms_total=raw.get("bedrooms_total"),
                        bathrooms_total=raw.get("bathrooms_total"),
                        num_units=raw.get("num_units"),
                        lot_size_sqft=raw.get("lot_size_sqft"),
                        living_area_sqft=raw.get("living_area_sqft"),
                        photo_url=raw.get("photo_url"),
                        listing_url=raw.get("listing_url"),
                        raw_data=raw.get("raw_data"),
                    )
                    session.add(listing)
                    await session.flush()

                    # Analyse financiere
                    region = raw.get("region", "montreal")
                    rent_estimate = DEFAULT_RENT_ESTIMATES.get(region, 1_200)
                    num_units = raw.get("num_units", 3)

                    analysis_result = calculate_cashflow(
                        price=raw["price"],
                        num_units=num_units,
                        estimated_rent_per_unit=rent_estimate,
                        region=region,
                    )

                    analysis = Analysis(
                        listing_id=listing.id,
                        estimated_rent_per_unit=rent_estimate,
                        net_rental_income_monthly=analysis_result.effective_rent_monthly,
                        mortgage_payment_monthly=analysis_result.mortgage_monthly,
                        cmhc_premium=analysis_result.cmhc_premium,
                        municipal_tax_monthly=analysis_result.municipal_tax_monthly,
                        school_tax_monthly=analysis_result.school_tax_monthly,
                        insurance_monthly=analysis_result.insurance_monthly,
                        maintenance_monthly=analysis_result.maintenance_monthly,
                        vacancy_monthly=analysis_result.vacancy_monthly,
                        cashflow_monthly=analysis_result.cashflow_monthly,
                        dcr=analysis_result.dcr,
                        cap_rate=analysis_result.cap_rate,
                        cash_on_cash=analysis_result.cash_on_cash,
                        welcome_tax=analysis_result.welcome_tax,
                        assumptions=analysis_result.assumptions,
                    )
                    session.add(analysis)

                    # Preparer pour notifications
                    new_listings.append({
                        **raw,
                        "estimated_rent": f"{rent_estimate}$/unite",
                        "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                        "analysis": {
                            "cashflow_monthly": analysis_result.cashflow_monthly,
                            "dcr": analysis_result.dcr,
                            "cap_rate": analysis_result.cap_rate,
                            "cash_on_cash": analysis_result.cash_on_cash,
                            "welcome_tax": analysis_result.welcome_tax,
                            "mortgage_monthly": analysis_result.mortgage_monthly,
                        },
                    })

            except Exception as exc:
                logger.error("Erreur traitement MLS %s: %s", raw.get("mls_number"), exc)
                error_count += 1

        # Mettre a jour le scrape run
        scrape_run.finished_at = datetime.utcnow()
        scrape_run.new_listings = len(new_listings)
        scrape_run.errors = error_count
        scrape_run.status = "completed"

        await session.commit()

    logger.info(
        "DB: %d nouveaux, %d mis a jour, %d erreurs",
        len(new_listings), updated_count, error_count,
    )

    # 3. Sync Google Sheets
    sheets_added = 0
    if new_listings:
        try:
            sheets_added = sync_listings_to_sheet(new_listings)
        except Exception as exc:
            logger.error("Erreur sync Google Sheets: %s", exc)

    # 4. Alertes WhatsApp
    whatsapp_sent = 0
    if new_listings:
        try:
            whatsapp_sent = await notify_new_listings(new_listings)
        except Exception as exc:
            logger.error("Erreur notifications WhatsApp: %s", exc)

    summary = {
        "total_scraped": len(raw_listings),
        "new_listings": len(new_listings),
        "updated": updated_count,
        "errors": error_count,
        "sheets_added": sheets_added,
        "whatsapp_sent": whatsapp_sent,
    }

    logger.info("=== Scrape job termine : %s ===", summary)
    return summary
