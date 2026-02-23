"""
Scraper Centris.ca — API semi-publique du MLS Quebec.

Strategie :
  1. GET page de recherche => cookies de session
  2. POST /Property/GetInscriptions => HTML paginé
  3. Parse HTML => dicts normalises

Rate limiting : 2-5 secondes entre requetes.
"""

import asyncio
import logging
import random
import re
from html import unescape
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://www.centris.ca"

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
]

# Pages de recherche Centris avec filtres pre-appliques
# NOTE: Centris a change ses URLs en 2025/2026.
#   Ancien format: /fr/triplex~a-vendre~...  → retourne 404
#   Nouveau format: /fr/plex~a-vendre~...    → fonctionne
SEARCH_URLS = {
    "plex_montreal_ile": "/fr/plex~a-vendre~montreal-ile?view=Thumbnail&uc=0&pmax=610000",
    "duplex_montreal_ile": "/fr/duplex~a-vendre~montreal-ile?view=Thumbnail&uc=0&pmax=610000",
    "plex_gatineau": "/fr/plex~a-vendre~gatineau?view=Thumbnail&uc=0&pmax=610000",
    "duplex_gatineau": "/fr/duplex~a-vendre~gatineau?view=Thumbnail&uc=0&pmax=610000",
    "plex_laval": "/fr/plex~a-vendre~laval?view=Thumbnail&uc=0&pmax=610000",
    "plex_longueuil": "/fr/plex~a-vendre~longueuil-agglomeration?view=Thumbnail&uc=0&pmax=610000",
}


def _random_ua() -> str:
    return random.choice(USER_AGENTS)


def _parse_price(price_str: str) -> int:
    """Parse un prix Centris ('1 095 000 $' ou '525000')."""
    cleaned = re.sub(r"[^\d]", "", price_str)
    try:
        return int(cleaned)
    except ValueError:
        return 0


def _parse_html_listings(html: str, search_key: str) -> list[dict]:
    """Parse le HTML de Centris pour extraire les listings."""
    listings = []

    # Determine property type from search key
    if "triplex" in search_key:
        property_type = "triplex"
        num_units = 3
    elif "quadruplex" in search_key:
        property_type = "quadruplex"
        num_units = 4
    else:
        property_type = "plex"
        num_units = 3

    # Determine region
    if "montreal" in search_key:
        region = "montreal"
    elif "gatineau" in search_key:
        region = "gatineau"
    elif "laval" in search_key:
        region = "laval"
    elif "longueuil" in search_key:
        region = "longueuil"
    else:
        region = "montreal"

    # Split HTML into individual property cards
    cards = re.split(
        r'<div class="property-thumbnail-item thumbnailItem',
        html,
    )

    for card in cards[1:]:  # Skip first empty split
        try:
            listing = _parse_card(card, property_type, num_units, region)
            if listing:
                listings.append(listing)
        except Exception as exc:
            logger.debug("Erreur parsing card Centris: %s", exc)
            continue

    return listings


def _parse_card(card: str, property_type: str, num_units: int, region: str) -> Optional[dict]:
    """Parse une card HTML individuelle."""

    # MLS number
    mls_match = re.search(r'data-mlsnumber=[\'"](\d+)[\'"]', card)
    if not mls_match:
        mls_match = re.search(r'itemprop="sku"\s*content="(\d+)"', card)
    if not mls_match:
        return None
    mls_number = mls_match.group(1)

    # Price
    price = 0
    price_match = re.search(r'itemprop="price"\s*content="(\d+)"', card)
    if price_match:
        price = int(price_match.group(1))
    else:
        price_span = re.search(r'<span>([^<]*\$)', card)
        if price_span:
            price = _parse_price(price_span.group(1))

    # Filter by max price
    max_price = settings.max_price
    if price <= 0 or price > max_price:
        return None

    # Address
    address_parts = []
    addr_divs = re.findall(r'<div class="address">\s*(.*?)\s*</div>', card, re.DOTALL)
    if addr_divs:
        inner_divs = re.findall(r"<div>([^<]+)</div>", addr_divs[0])
        address_parts = [unescape(d.strip()) for d in inner_divs]

    address = ", ".join(address_parts) if address_parts else ""
    city = address_parts[-1] if len(address_parts) > 1 else ""

    # Listing URL (extract early for filtering)
    listing_url = ""
    url_match = re.search(r'href="(/fr/[^"]*?/\d+)"', card)
    if url_match:
        listing_url = f"{BASE_URL}{url_match.group(1)}"

    # Category (verify it's actually a plex)
    category = ""
    cat_match = re.search(r'<div class="category"[^>]*>.*?<div>\s*([^<]+)\s*</div>', card, re.DOTALL)
    if cat_match:
        category = unescape(cat_match.group(1).strip().lower())

    # Also check meta description for type
    meta_content = ""
    meta_match = re.search(r'itemprop="name"\s*content="([^"]+)"', card)
    if meta_match:
        meta_content = unescape(meta_match.group(1)).lower()

    # Also check the listing URL for type hints
    url_lower = listing_url.lower() if listing_url else ""

    # STRICT FILTER: only keep triplex/quadruplex
    # Check category text AND URL for plex keywords
    plex_keywords = ("duplex", "triplex", "quadruplex", "quintuplex", "plex", "multiplex")
    exclude_keywords = ("terrain", "condo", "maison en copropri", "loft", "studio",
                       "appartement", "jumelé", "jumele", "unifamili", "bungalow",
                       "cottage", "bi-génération", "bi-generation", "split")

    # Combine all text sources for checking
    all_text = f"{category} {url_lower} {meta_content}"

    # Must contain at least one plex keyword
    has_plex = any(kw in all_text for kw in plex_keywords)

    # Must NOT contain exclude keywords
    has_exclude = any(kw in all_text for kw in exclude_keywords)

    if not has_plex or has_exclude:
        return None

    # Refine property_type based on actual category
    if "quadruplex" in category or "quadruplex" in url_lower:
        property_type = "quadruplex"
        num_units = 4
    elif "triplex" in category or "triplex" in url_lower:
        property_type = "triplex"
        num_units = 3
    elif "duplex" in category or "duplex" in url_lower:
        property_type = "duplex"
        num_units = 2

    # Photo URL
    photo = ""
    img_match = re.search(r'itemprop="image"\s*src="([^"]+)"', card)
    if img_match:
        photo = unescape(img_match.group(1))

    # Bedrooms / bathrooms from feature icons
    bedrooms = 0
    bathrooms = 0
    bed_match = re.search(r'class="cac"[^>]*>(\d+)', card)
    if bed_match:
        bedrooms = int(bed_match.group(1))
    bath_match = re.search(r'class="sdb"[^>]*>(\d+)', card)
    if bath_match:
        bathrooms = int(bath_match.group(1))

    return {
        "mls_number": mls_number,
        "source": "centris",
        "property_type": property_type,
        "price": price,
        "address": address,
        "city": city,
        "postal_code": "",
        "latitude": 0.0,
        "longitude": 0.0,
        "bedrooms_total": bedrooms,
        "bathrooms_total": bathrooms,
        "num_units": num_units,
        "lot_size_sqft": 0,
        "living_area_sqft": 0,
        "photo_url": photo,
        "listing_url": listing_url,
        "region": region,
        "raw_data": {"source_html_length": len(card)},
    }


async def _get_session_cookies(client: httpx.AsyncClient, search_url: str) -> None:
    """Visite la page de recherche pour obtenir les cookies de session."""
    headers = {
        "User-Agent": _random_ua(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-CA,fr;q=0.9,en-CA;q=0.8",
    }
    try:
        resp = await client.get(f"{BASE_URL}{search_url}", headers=headers, follow_redirects=True)
        logger.debug("Session cookies obtenues (status %d)", resp.status_code)
    except Exception as exc:
        logger.warning("Impossible d'obtenir les cookies: %s", exc)


async def _fetch_inscriptions(
    client: httpx.AsyncClient,
    start: int,
    count: int,
    referer: str,
) -> tuple[str, int]:
    """Recupere une page de resultats Centris."""
    headers = {
        "User-Agent": _random_ua(),
        "Content-Type": "application/json;charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": f"{BASE_URL}{referer}",
        "Accept": "application/json, text/javascript, */*; q=0.01",
    }
    payload = {"startPosition": start, "count": count}

    resp = await client.post(
        f"{BASE_URL}/Property/GetInscriptions",
        json=payload,
        headers=headers,
    )
    resp.raise_for_status()
    data = resp.json()

    result = data.get("d", {}).get("Result", {})
    html = result.get("html", "")
    total_count = int(result.get("count", 0))
    return html, total_count


async def search_centris(
    search_key: str,
    search_url: str,
    max_results: int = 200,
) -> list[dict]:
    """Scrape une categorie de recherche Centris."""
    all_listings: list[dict] = []
    page_size = 20

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        # Step 1: Get session cookies
        await _get_session_cookies(client, search_url)
        await asyncio.sleep(random.uniform(1.0, 2.0))

        # Step 2: Paginate through results
        start = 0
        while start < max_results:
            try:
                html, total = await _fetch_inscriptions(
                    client, start, page_size, search_url,
                )
            except httpx.HTTPStatusError as exc:
                logger.warning(
                    "HTTP %d sur Centris %s (start=%d)",
                    exc.response.status_code, search_key, start,
                )
                break
            except Exception as exc:
                logger.error("Erreur Centris %s: %s", search_key, exc)
                break

            if not html or not html.strip():
                logger.info("Plus de resultats pour %s a start=%d", search_key, start)
                break

            page_listings = _parse_html_listings(html, search_key)
            all_listings.extend(page_listings)

            logger.info(
                "%s: page start=%d => %d listings (total API: %d)",
                search_key, start, len(page_listings), total,
            )

            start += page_size
            if start >= total:
                break

            # Rate limiting
            delay = random.uniform(2.0, 5.0)
            await asyncio.sleep(delay)

    logger.info(
        "Centris %s termine : %d listings trouves",
        search_key, len(all_listings),
    )
    return all_listings


async def scrape_all_centris(price_max: int = 0) -> list[dict]:
    """
    Scrape toutes les categories Centris, deduplique par MLS.
    """
    all_listings: list[dict] = []
    seen_mls: set[str] = set()

    for search_key, search_url in SEARCH_URLS.items():
        # Inject price max into URL if provided
        if price_max > 0:
            search_url = re.sub(r"pmax=\d+", f"pmax={price_max}", search_url)

        logger.info("=== Scraping Centris: %s ===", search_key)
        results = await search_centris(search_key, search_url)

        for listing in results:
            mls = listing["mls_number"]
            if mls not in seen_mls:
                all_listings.append(listing)
                seen_mls.add(mls)
            else:
                logger.debug("Doublon MLS %s ignore", mls)

        # Pause between search categories
        delay = random.uniform(3.0, 6.0)
        logger.info("Pause %.1fs avant prochaine categorie", delay)
        await asyncio.sleep(delay)

    logger.info(
        "Centris total : %d listings uniques",
        len(all_listings),
    )
    return all_listings
