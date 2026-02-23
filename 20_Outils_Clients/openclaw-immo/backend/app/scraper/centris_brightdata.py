"""
Scraper Centris.ca via Bright Data Unlocker API.

Utilise l'API Unlocker de Bright Data pour contourner les protections
anti-bot de Centris, puis reutilise le parsing HTML existant.

Flux :
  1. POST vers api.brightdata.com/request avec l'URL Centris cible
  2. Recevoir le HTML deverrouille
  3. Reutiliser _parse_html_listings() de centris.py

Fallback automatique vers le scraping direct si Bright Data echoue.
"""

import asyncio
import logging
import random
import re
from typing import Optional

import httpx

from app.config import settings
from app.scraper.centris import (
    _parse_html_listings,
    _parse_price,
    BASE_URL,
    SEARCH_URLS,
    USER_AGENTS,
)

logger = logging.getLogger(__name__)

# --- Bright Data API ---
BRIGHTDATA_API_URL = "https://api.brightdata.com/request"
BRIGHTDATA_TIMEOUT = 60.0  # Unlocker peut etre lent (rendering JS)


def _random_ua() -> str:
    return random.choice(USER_AGENTS)


async def _fetch_via_brightdata(
    client: httpx.AsyncClient,
    url: str,
    zone: str,
    api_key: str,
) -> Optional[str]:
    """
    Recupere le contenu HTML d'une URL via Bright Data Unlocker.

    Args:
        client: Client HTTP reutilisable
        url: URL cible (Centris)
        zone: Nom de la zone Bright Data Unlocker
        api_key: Cle API Bright Data (Bearer token)

    Returns:
        Le HTML brut de la page, ou None en cas d'echec
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "zone": zone,
        "url": url,
        "format": "raw",
        "country": "ca",
    }

    try:
        resp = await client.post(
            BRIGHTDATA_API_URL,
            json=payload,
            headers=headers,
            timeout=BRIGHTDATA_TIMEOUT,
        )

        if resp.status_code == 200:
            html = resp.text
            logger.info(
                "Bright Data OK — %s (%d caracteres)",
                url[:80], len(html),
            )
            return html

        logger.warning(
            "Bright Data HTTP %d pour %s — %s",
            resp.status_code, url[:80], resp.text[:200],
        )
        return None

    except httpx.TimeoutException:
        logger.warning("Bright Data timeout pour %s", url[:80])
        return None
    except Exception as exc:
        logger.error("Bright Data erreur pour %s: %s", url[:80], exc)
        return None


async def search_centris_brightdata(
    search_key: str,
    search_url: str,
    max_pages: int = 10,
) -> list[dict]:
    """
    Scrape une categorie Centris via Bright Data Unlocker.

    Charge la page de recherche complete, puis parse le HTML
    pour en extraire les listings.
    """
    api_key = settings.brightdata_api_key
    zone = settings.brightdata_zone

    if not api_key:
        logger.error("BRIGHTDATA_API_KEY non configuree — abandon")
        return []

    all_listings: list[dict] = []
    full_url = f"{BASE_URL}{search_url}"

    async with httpx.AsyncClient(follow_redirects=True) as client:
        # Recuperer la page de recherche principale
        html = await _fetch_via_brightdata(client, full_url, zone, api_key)

        if not html:
            logger.warning(
                "Pas de HTML pour %s — skip", search_key,
            )
            return []

        # Parser les listings de la page
        page_listings = _parse_html_listings(html, search_key)
        all_listings.extend(page_listings)

        logger.info(
            "%s: page principale => %d listings",
            search_key, len(page_listings),
        )

        # Pagination — chercher les liens de pages suivantes
        # Centris utilise des boutons de pagination avec data-pagenumber
        page_numbers = re.findall(r'data-pagenumber="(\d+)"', html)
        if page_numbers:
            max_page = min(int(max(page_numbers)), max_pages)
            logger.info("%s: %d pages detectees", search_key, max_page)

            for page_num in range(2, max_page + 1):
                # Ajouter le parametre de page a l'URL
                page_url = f"{full_url}&page={page_num}"

                # Rate limiting respectueux
                delay = random.uniform(2.0, 5.0)
                await asyncio.sleep(delay)

                page_html = await _fetch_via_brightdata(
                    client, page_url, zone, api_key,
                )
                if not page_html:
                    logger.info(
                        "%s: page %d vide — arret pagination",
                        search_key, page_num,
                    )
                    break

                page_results = _parse_html_listings(page_html, search_key)
                all_listings.extend(page_results)

                logger.info(
                    "%s: page %d => %d listings",
                    search_key, page_num, len(page_results),
                )

                if not page_results:
                    break

    logger.info(
        "Bright Data %s termine : %d listings",
        search_key, len(all_listings),
    )
    return all_listings


async def scrape_all_centris_brightdata(price_max: int = 0) -> list[dict]:
    """
    Scrape toutes les categories Centris via Bright Data.
    Deduplique par MLS number.

    Si Bright Data n'est pas configure, retourne une liste vide
    (le caller devrait fallback vers le scraping direct).
    """
    api_key = settings.brightdata_api_key
    if not api_key:
        logger.warning(
            "Bright Data non configure — "
            "definir BRIGHTDATA_API_KEY dans .env"
        )
        return []

    all_listings: list[dict] = []
    seen_mls: set[str] = set()

    for search_key, search_url in SEARCH_URLS.items():
        # Injecter le prix max dans l'URL
        if price_max > 0:
            search_url = re.sub(r"pmax=\d+", f"pmax={price_max}", search_url)

        logger.info("=== Bright Data scraping: %s ===", search_key)
        results = await search_centris_brightdata(search_key, search_url)

        for listing in results:
            mls = listing["mls_number"]
            if mls not in seen_mls:
                all_listings.append(listing)
                seen_mls.add(mls)
            else:
                logger.debug("Doublon MLS %s ignore", mls)

        # Pause entre les categories
        delay = random.uniform(3.0, 6.0)
        logger.info("Pause %.1fs avant prochaine categorie", delay)
        await asyncio.sleep(delay)

    logger.info(
        "Bright Data total : %d listings uniques",
        len(all_listings),
    )
    return all_listings
