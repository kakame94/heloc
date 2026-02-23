"""
Configuration centralisee — charge les variables d'environnement.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Parametres de l'application, lus depuis .env ou variables d'env."""

    # --- Database ---
    database_url: str = Field(
        default="postgresql+asyncpg://openclaw:changeme@db:5432/openclaw_immo",
        alias="DATABASE_URL",
    )

    # --- Scraper ---
    max_price: int = Field(default=610_000, alias="MAX_PRICE")
    min_units: int = Field(default=3, alias="MIN_UNITS")
    max_units: int = Field(default=4, alias="MAX_UNITS")
    scrape_interval_hours: int = Field(default=4, alias="SCRAPE_INTERVAL_HOURS")
    scrape_min_delay: float = Field(default=3.0, alias="SCRAPE_MIN_DELAY_SECONDS")
    scrape_max_delay: float = Field(default=8.0, alias="SCRAPE_MAX_DELAY_SECONDS")

    # --- Financial defaults ---
    default_interest_rate: float = Field(default=0.0499, alias="DEFAULT_INTEREST_RATE")
    default_down_payment_pct: float = Field(default=0.10, alias="DEFAULT_DOWN_PAYMENT_PCT")
    default_amortization_years: int = Field(default=25, alias="DEFAULT_AMORTIZATION_YEARS")
    default_insurance_annual: int = Field(default=3000, alias="DEFAULT_INSURANCE_ANNUAL")
    default_maintenance_pct: float = Field(default=0.05, alias="DEFAULT_MAINTENANCE_PCT")
    default_vacancy_pct: float = Field(default=0.03, alias="DEFAULT_VACANCY_PCT")

    # --- Google Sheets ---
    google_sheet_id: str = Field(default="", alias="GOOGLE_SHEET_ID")
    google_service_account_json_path: str = Field(
        default="/app/credentials/gsheets-sa.json",
        alias="GOOGLE_SHEETS_CREDS",
    )

    # --- OpenClaw WhatsApp Gateway (gratuit) ---
    openclaw_gateway_token: str = Field(default="", alias="OPENCLAW_GATEWAY_TOKEN")

    # --- Bright Data (scraping proxy) ---
    brightdata_api_key: str = Field(default="", alias="BRIGHTDATA_API_KEY")
    brightdata_zone: str = Field(default="web_unlocker1", alias="BRIGHTDATA_ZONE")
    brightdata_enabled: bool = Field(default=True, alias="BRIGHTDATA_ENABLED")

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
