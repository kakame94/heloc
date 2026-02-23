"""
Definitions des regions geographiques (bounding boxes) pour le scraping.
Grande region de Montreal + Gatineau.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Region:
    """Zone geographique definie par un rectangle lat/lon."""

    name: str
    label: str  # Nom affichable
    lat_min: float
    lat_max: float
    lon_min: float
    lon_max: float


# --- Regions principales ---

MONTREAL = Region(
    name="montreal",
    label="Grande Region de Montreal",
    lat_min=45.35,
    lat_max=45.72,
    lon_min=-74.05,
    lon_max=-73.40,
)

GATINEAU = Region(
    name="gatineau",
    label="Gatineau / Outaouais",
    lat_min=45.40,
    lat_max=45.55,
    lon_min=-75.85,
    lon_max=-75.55,
)

LAVAL = Region(
    name="laval",
    label="Laval",
    lat_min=45.53,
    lat_max=45.63,
    lon_min=-73.82,
    lon_max=-73.62,
)

LONGUEUIL = Region(
    name="longueuil",
    label="Longueuil / Rive-Sud",
    lat_min=45.43,
    lat_max=45.55,
    lon_min=-73.55,
    lon_max=-73.40,
)

# Toutes les regions a scraper
ALL_REGIONS = [MONTREAL, GATINEAU, LAVAL, LONGUEUIL]

# Regions par defaut (prioritaires)
DEFAULT_REGIONS = [MONTREAL, GATINEAU]
