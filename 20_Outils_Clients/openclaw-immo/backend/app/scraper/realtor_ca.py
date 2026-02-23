"""
Scraper Realtor.ca — utilise l'API semi-publique REST.

Endpoints :
  POST https://api37.realtor.ca/Listing.svc/PropertySearch_Post
  GET  https://api37.realtor.ca/Listing.svc/PropertyDetails

Rate limiting : 3-8 secondes entre requetes, rotation User-Agent.
"""

import asyncio
import logging
import random
from datetime import datetime
from typing import Optional

import httpx

from app.config import settings
from app.scraper.regions import Region, DEFAULT_REGIONS

logger = logging.getLogger(__name__)

# Pool de User-Agents reels
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0",
]

BASE_URL = "https://api37.realtor.ca/Listing.svc"


def _random_ua() -> str:
    return random.choice(USER_AGENTS)


def _build_headers() -> dict[str, str]:
    return {
        "User-Agent": _random_ua(),
        "Accept": "*/*",
        "Accept-Language": "fr-CA,fr;q=0.9,en-CA;q=0.8,en;q=0.7",
        "Origin": "https://www.realtor.ca",
        "Referer": "https://www.realtor.ca/",
        "Content-Type": "application/x-www-form-urlencoded",
    }


def _build_search_params(
    region: Region,
    price_max: int,
    current_page: int = 1,
    records_per_page: int = 50,
) -> dict[str, str]:
    """Construit les parametres pour PropertySearch_Post."""
    return {
        "CultureId": "2",  # 2 = francais, 1 = anglais
        "ApplicationId": "37",
        "PropertySearchTypeId": "1",  # Residentiel
        "TransactionTypeId": "2",  # A vendre
        "PriceMin": "0",
        "PriceMax": str(price_max),
        "BuildingTypeId": "0",  # Tous (on filtre apres par type)
        "LatitudeMax": str(region.lat_max),
        "LatitudeMin": str(region.lat_min),
        "LongitudeMax": str(region.lon_max),
        "LongitudeMin": str(region.lon_min),
        "SortBy": "1",  # Tri par date
        "SortOrder": "D",  # Descendant
        "CurrentPage": str(current_page),
        "RecordsPerPage": str(records_per_page),
        "NumberOfDays": "0",
        "BedRange": "0-0",
        "BathRange": "0-0",
    }


def _parse_listing(raw: dict) -> Optional[dict]:
    """Parse un listing brut de l'API Realtor.ca en dict normalise."""
    try:
        building = raw.get("Building", {})
        property_info = raw.get("Property", {})
        address = property_info.get("Address", {})
        land = raw.get("Land", {})

        # Determiner le type de propriete
        building_type = building.get("Type", "").lower()
        # On cherche triplex, quadruplex, ou multiplex
        property_type = None
        type_str = building_type
        # Verifier aussi dans le nom du listing
        public_remarks = raw.get("PublicRemarks", "").lower()

        if "triplex" in type_str or "triplex" in public_remarks:
            property_type = "triplex"
        elif "quadruplex" in type_str or "quadruplex" in public_remarks or "fourplex" in type_str:
            property_type = "quadruplex"
        elif "quintuplex" in type_str or "quintuplex" in public_remarks:
            property_type = "quintuplex"
        elif "duplex" in type_str and ("triplex" not in type_str):
            property_type = "duplex"
        elif "plex" in type_str or "multi" in type_str:
            # Essayer de detecter le nombre d'unites
            units_str = building.get("StoriesTotal", "")
            property_type = f"multiplex"
        else:
            # Pas un plex — on ignore
            return None

        # Filtrer : on ne garde que triplex et quadruplex
        if property_type not in ("triplex", "quadruplex"):
            return None

        # Extraire le prix
        price_str = property_info.get("Price", "0")
        price = int(float(str(price_str).replace(",", "").replace("$", "").replace(" ", "").strip()))

        # Extraire l'adresse
        addr_text = address.get("AddressText", "")
        city = address.get("CityDistrict", "") or address.get("City", "")
        postal = address.get("PostalCode", "")

        # Coordonnees
        lat = float(address.get("Latitude", 0) or 0)
        lon = float(address.get("Longitude", 0) or 0)

        # Details du batiment
        bedrooms = int(building.get("Bedrooms", 0) or 0)
        bathrooms = int(building.get("BathroomTotal", 0) or 0)

        # Superficie
        size_interior = building.get("SizeInterior", "")
        living_area = 0
        if size_interior:
            # Format: "1234 sqft" ou "1234 pc"
            area_str = str(size_interior).replace(",", "").split(" ")[0]
            try:
                living_area = int(float(area_str))
            except (ValueError, IndexError):
                pass

        # Lot size
        lot_size = 0
        lot_info = land.get("SizeTotal", "")
        if lot_info:
            lot_str = str(lot_info).replace(",", "").split(" ")[0]
            try:
                lot_size = int(float(lot_str))
            except (ValueError, IndexError):
                pass

        # MLS
        mls_number = raw.get("MlsNumber", "") or raw.get("Id", "")

        # Photo
        photo = ""
        photos = raw.get("Property", {}).get("Photo", [])
        if isinstance(photos, list) and photos:
            photo = photos[0].get("HighResPath", "") or photos[0].get("MedResPath", "")
        elif isinstance(photos, dict):
            photo = photos.get("HighResPath", "") or photos.get("MedResPath", "")

        # URL
        relative_url = raw.get("RelativeDetailsURL", "")
        listing_url = f"https://www.realtor.ca{relative_url}" if relative_url else ""

        return {
            "mls_number": str(mls_number),
            "source": "realtor_ca",
            "property_type": property_type,
            "price": price,
            "address": addr_text,
            "city": city,
            "postal_code": postal,
            "latitude": lat,
            "longitude": lon,
            "bedrooms_total": bedrooms,
            "bathrooms_total": bathrooms,
            "num_units": 3 if property_type == "triplex" else 4,
            "lot_size_sqft": lot_size,
            "living_area_sqft": living_area,
            "photo_url": photo,
            "listing_url": listing_url,
            "raw_data": raw,
        }
    except Exception as exc:
        logger.warning("Erreur parsing listing: %s", exc)
        return None


async def search_region(
    region: Region,
    price_max: int = 0,
    max_pages: int = 10,
) -> list[dict]:
    """
    Scrape toutes les pages de resultats pour une region donnee.
    Retourne une liste de dicts normalises.
    """
    if price_max <= 0:
        price_max = settings.max_price

    all_listings: list[dict] = []
    current_page = 1

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        while current_page <= max_pages:
            params = _build_search_params(region, price_max, current_page)
            headers = _build_headers()

            try:
                logger.info(
                    "Scraping %s - page %d (max prix: %d$)",
                    region.label, current_page, price_max,
                )
                resp = await client.post(
                    f"{BASE_URL}/PropertySearch_Post",
                    data=params,
                    headers=headers,
                )

                if resp.status_code == 403:
                    logger.warning("Rate limited (403) sur %s page %d — arrêt", region.name, current_page)
                    break

                resp.raise_for_status()
                data = resp.json()

            except httpx.HTTPStatusError as exc:
                logger.error("HTTP %d sur %s: %s", exc.response.status_code, region.name, exc)
                break
            except Exception as exc:
                logger.error("Erreur scraping %s: %s", region.name, exc)
                break

            results = data.get("Results", [])
            if not results:
                logger.info("Plus de resultats pour %s a la page %d", region.name, current_page)
                break

            for raw_listing in results:
                parsed = _parse_listing(raw_listing)
                if parsed:
                    all_listings.append(parsed)

            # Pagination
            paging = data.get("Paging", {})
            total_pages = int(paging.get("TotalPages", 1))
            if current_page >= total_pages:
                break

            current_page += 1

            # Rate limiting — delai aleatoire
            delay = random.uniform(settings.scrape_min_delay, settings.scrape_max_delay)
            logger.debug("Delai %.1fs avant page suivante", delay)
            await asyncio.sleep(delay)

    logger.info(
        "Scraping %s termine : %d triplex/quadruplex trouves",
        region.label, len(all_listings),
    )
    return all_listings


async def scrape_all_regions(
    regions: Optional[list[Region]] = None,
    price_max: int = 0,
) -> list[dict]:
    """
    Scrape toutes les regions configurees, deduplique par MLS.
    """
    if regions is None:
        regions = DEFAULT_REGIONS

    all_listings: list[dict] = []
    seen_mls: set[str] = set()

    for region in regions:
        region_listings = await search_region(region, price_max)

        for listing in region_listings:
            mls = listing["mls_number"]
            if mls not in seen_mls:
                listing["region"] = region.name
                all_listings.append(listing)
                seen_mls.add(mls)
            else:
                logger.debug("Doublon MLS %s ignore", mls)

        # Pause entre regions
        if region != regions[-1]:
            delay = random.uniform(5.0, 10.0)
            logger.info("Pause %.1fs entre regions", delay)
            await asyncio.sleep(delay)

    logger.info("Total : %d listings uniques sur %d regions", len(all_listings), len(regions))
    return all_listings
