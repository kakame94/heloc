"""
PlexInvest Québec - Configuration Backend
"""

from pydantic_settings import BaseSettings
from decimal import Decimal
from typing import Optional


class BSIFRules(BaseSettings):
    """
    Règles BSIF hard-coded (non configurables)
    Ces valeurs sont des contraintes réglementaires canadiennes
    """
    # Limite LTV pour HELOC rotatif (intérêts seulement)
    HELOC_ROTATING_LTV_MAX: Decimal = Decimal("0.65")

    # Limite LTV totale pour refinancement (1-4 logements)
    REFINANCE_LTV_MAX: Decimal = Decimal("0.80")

    # Buffer du stress test BSIF
    STRESS_TEST_BUFFER: Decimal = Decimal("0.02")

    # Plancher du stress test BSIF
    STRESS_TEST_FLOOR: Decimal = Decimal("0.0525")

    # DCR minimum pour financement commercial (5+ logements)
    MIN_DCR_COMMERCIAL: Decimal = Decimal("1.25")


class CMHCRules(BaseSettings):
    """
    Règles SCHL hard-coded
    """
    # Seuil de mise de fonds pour éviter assurance
    INSURANCE_THRESHOLD: Decimal = Decimal("0.20")

    # Prix maximum assurable
    MAX_INSURABLE_PRICE: int = 999999

    # Amortissement max MLI Select
    MLI_SELECT_MAX_AMORTIZATION: int = 50


class Settings(BaseSettings):
    """
    Configuration de l'application
    """
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "PlexInvest Québec API"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/plexinvest"

    # Redis (pour Celery)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Taux par défaut (mis à jour quotidiennement)
    DEFAULT_MORTGAGE_RATE: Decimal = Decimal("0.0525")  # 5.25%
    DEFAULT_HELOC_RATE: Decimal = Decimal("0.0695")  # 6.95%

    # External APIs
    JLR_API_KEY: Optional[str] = None
    CENTRIS_API_KEY: Optional[str] = None

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://plexinvest.ca",
    ]

    # Règles réglementaires (lecture seule)
    bsif: BSIFRules = BSIFRules()
    cmhc: CMHCRules = CMHCRules()

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
