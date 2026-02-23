#!/usr/bin/env python3
"""
Skill OpenClaw : chercher-immo
Cherche des triplex/quadruplex par ville dans la DB PostgreSQL
via l'API FastAPI du backend.

Le backend tourne dans Docker sur le port 8000.
Depuis la machine hote : http://localhost:8000
"""

import json
import logging
import os
import urllib.request
import urllib.parse
import urllib.error

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Le backend FastAPI tourne sur localhost:8000 (Docker port mapping)
BACKEND_URL = os.environ.get("OPENCLAW_BACKEND_URL", "http://localhost:8000")


def search_listings(region: str = "", prix_max: int = 0, type_bien: str = "") -> list[dict]:
    """Query l'API backend pour chercher des listings."""
    params = []
    if region and region.lower() != "tous":
        params.append(f"region={urllib.parse.quote(region)}")
    if prix_max > 0:
        params.append(f"price_max={prix_max}")
    if type_bien and type_bien.lower() != "tous":
        params.append(f"property_type={urllib.parse.quote(type_bien)}")
    params.append("limit=50")

    query = "&".join(params)
    url = f"{BACKEND_URL}/api/listings?{query}"

    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            return data.get("listings", [])
    except urllib.error.HTTPError as e:
        logger.error("API error %d: %s", e.code, e.read().decode()[:200])
        return []
    except Exception as exc:
        logger.error("Erreur recherche: %s", exc)
        return []


def format_listing(l: dict, idx: int) -> str:
    """Formate un listing pour WhatsApp."""
    price = l.get("price", 0)
    price_str = f"{price:,}".replace(",", " ")
    ptype = l.get("property_type", "plex").capitalize()
    address = l.get("address", "Adresse inconnue")
    url = l.get("listing_url", "")

    line = f"{idx}. *{ptype}* — {price_str} $"
    if address:
        line += f"\n   📍 {address}"
    if url:
        line += f"\n   🔗 {url}"

    # Analyse financiere si dispo
    analysis = l.get("analysis")
    if analysis:
        cf = analysis.get("cashflow_monthly")
        dcr = analysis.get("dcr")
        if cf is not None:
            emoji = "✅" if cf >= 0 else "❌"
            line += f"\n   {emoji} Cashflow: {cf:+d} $/mois"
        if dcr:
            line += f" | DCR: {dcr:.2f}"

    return line


def execute(params: dict[str, str]) -> str:
    """Point d'entree du Skill OpenClaw."""
    ville = params.get("ville", "").strip()
    prix_max_str = params.get("prix_max", "0")
    type_bien = params.get("type_bien", "").strip()

    try:
        prix_max = int(prix_max_str.replace(" ", "").replace("$", "").replace(",", ""))
    except (ValueError, AttributeError):
        prix_max = 0

    # Detecter la ville dans le message brut si pas de parametre explicite
    if not ville:
        raw = params.get("_raw_message", "").lower()
        villes_map = {
            # --- Gatineau / Outaouais ---
            "gatineau": "gatineau",
            "hull": "gatineau",
            "aylmer": "gatineau",
            "buckingham": "gatineau",
            "masson-angers": "gatineau",
            "chelsea": "gatineau",
            "cantley": "gatineau",
            "val-des-monts": "gatineau",
            # --- Montréal ---
            "montreal": "montreal",
            "montréal": "montreal",
            "mtl": "montreal",
            "verdun": "montreal",
            "ndg": "montreal",
            "notre-dame-de-grace": "montreal",
            "notre-dame-de-grâce": "montreal",
            "rosemont": "montreal",
            "villeray": "montreal",
            "hochelaga": "montreal",
            "plateau": "montreal",
            "ahuntsic": "montreal",
            "saint-leonard": "montreal",
            "saint-léonard": "montreal",
            "st-léonard": "montreal",
            "st-leonard": "montreal",
            "anjou": "montreal",
            "rivière-des-prairies": "montreal",
            "rdp": "montreal",
            "lachine": "montreal",
            "lasalle": "montreal",
            "côte-des-neiges": "montreal",
            "cote-des-neiges": "montreal",
            "cdn": "montreal",
            "pointe-aux-trembles": "montreal",
            "mercier": "montreal",
            "dorval": "montreal",
            "saint-laurent": "montreal",
            "st-laurent": "montreal",
            "pierrefonds": "montreal",
            "ouest de l'île": "montreal",
            "west island": "montreal",
            # --- Laval ---
            "laval": "laval",
            "chomedey": "laval",
            "vimont": "laval",
            "auteuil": "laval",
            "sainte-dorothée": "laval",
            "ste-dorothée": "laval",
            "ste-dorothee": "laval",
            "laval-des-rapides": "laval",
            "fabreville": "laval",
            "sainte-rose": "laval",
            "ste-rose": "laval",
            "pont-viau": "laval",
            "duvernay": "laval",
            # --- Longueuil / Rive-Sud ---
            "longueuil": "longueuil",
            "rive-sud": "longueuil",
            "rive sud": "longueuil",
            "brossard": "longueuil",
            "saint-hubert": "longueuil",
            "st-hubert": "longueuil",
            "saint-bruno": "longueuil",
            "st-bruno": "longueuil",
            "boucherville": "longueuil",
            "saint-lambert": "longueuil",
            "st-lambert": "longueuil",
            "greenfield park": "longueuil",
            "châteauguay": "longueuil",
            "chateauguay": "longueuil",
            "la prairie": "longueuil",
            "candiac": "longueuil",
            "sainte-julie": "longueuil",
            "ste-julie": "longueuil",
            "varennes": "longueuil",
            "beloeil": "longueuil",
            "chambly": "longueuil",
        }
        for keyword, mapped_ville in villes_map.items():
            if keyword in raw:
                ville = mapped_ville
                break

    # Rechercher — ville correspond a "region" dans l'API
    listings = search_listings(ville, prix_max, type_bien)

    if not listings:
        if ville:
            return (
                f"🔍 Aucun plex trouvé à *{ville.capitalize()}* pour le moment.\n"
                f"Le prochain scrape est dans quelques heures."
            )
        return "🔍 Aucun listing en base. Lance un scrape d'abord !"

    # Formater la reponse
    total = len(listings)
    ville_label = ville.capitalize() if ville else "toutes les régions"

    header = f"🏠 *{total} plex trouvés — {ville_label}*\n\n"

    # Limiter a 10 resultats pour WhatsApp
    shown = min(total, 10)
    lines = []
    for i, listing in enumerate(listings[:shown], 1):
        lines.append(format_listing(listing, i))

    result = header + "\n\n".join(lines)

    if total > shown:
        result += f"\n\n... et {total - shown} autres."

    result += "\n\n📋 Voir tous les détails sur la page web ou Google Sheets."

    return result


if __name__ == "__main__":
    print(execute({"ville": "gatineau"}))
