"""
Notifications WhatsApp via OpenClaw Gateway.

Utilise l'API REST du gateway OpenClaw (gratuit, deja dans Docker)
pour envoyer des messages WhatsApp sans passer par Twilio.

Le gateway tourne localement sur la machine hote (pas dans Docker).
Le backend Docker accede au gateway via host.docker.internal.
"""

import logging
import os
from typing import Optional

import httpx

from app.config import settings
from app.analysis.ratios import format_analysis_summary

logger = logging.getLogger(__name__)

# Le webhook-proxy tourne sur la machine hote (port 18790) et relaie
# les messages vers le CLI openclaw pour envoyer via WhatsApp.
# host.docker.internal resout vers l'hote depuis un container Docker Desktop (macOS/Windows).
GATEWAY_URL = os.getenv("OPENCLAW_GATEWAY_URL", "http://host.docker.internal:18790")


async def send_whatsapp_alert(message: str) -> bool:
    """
    Envoie un message WhatsApp via le gateway OpenClaw.

    Le gateway expose une API REST pour envoyer des messages
    sur le canal WhatsApp connecte (via QR code).

    Args:
        message: Texte du message

    Returns:
        True si envoye, False sinon
    """
    gateway_token = settings.openclaw_gateway_token
    if not gateway_token:
        logger.warning(
            "OPENCLAW_GATEWAY_TOKEN non configure — alertes WhatsApp desactivees. "
            "Les nouvelles proprietes seront visibles dans Google Sheets et le dashboard."
        )
        return False

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{GATEWAY_URL}/api/send",
                json={"message": message},
                headers={
                    "Authorization": f"Bearer {gateway_token}",
                    "Content-Type": "application/json",
                },
            )

            if resp.status_code == 200:
                logger.info("WhatsApp envoye via OpenClaw Gateway")
                return True
            else:
                logger.warning(
                    "Gateway reponse %d: %s — le message sera visible dans Google Sheets",
                    resp.status_code, resp.text[:200],
                )
                return False

    except httpx.ConnectError:
        logger.info(
            "OpenClaw Gateway non disponible (profil 'openclaw' non demarre). "
            "Les nouvelles proprietes sont dans Google Sheets et le dashboard."
        )
        return False
    except Exception as exc:
        logger.error("Erreur envoi WhatsApp via Gateway: %s", exc)
        return False


def format_listing_message(listing: dict, analysis: Optional[dict] = None) -> str:
    """
    Formate un listing en message WhatsApp lisible.

    Args:
        listing: Dict avec les donnees du listing
        analysis: Dict optionnel avec les resultats d'analyse

    Returns:
        Message formate
    """
    price = listing.get("price", 0)
    price_str = f"{price:,}".replace(",", " ")

    msg = (
        f"*NOUVEAU {listing.get('property_type', 'PLEX').upper()} — {price_str} $*\n"
        f"📍 {listing.get('address', 'Adresse inconnue')}\n"
        f"🏠 {listing.get('property_type', '').capitalize()} | "
        f"{listing.get('num_units', '?')} unites"
    )

    if listing.get("year_built"):
        msg += f" | {listing['year_built']}"
    msg += "\n"

    if listing.get("living_area_sqft"):
        msg += f"📐 {listing['living_area_sqft']:,} pi2".replace(",", " ")
        if listing.get("lot_size_sqft"):
            msg += f" | Terrain: {listing['lot_size_sqft']:,} pi2".replace(",", " ")
        msg += "\n"

    # Analyse financiere
    if analysis:
        cashflow = analysis.get("cashflow_monthly", 0)
        dcr = analysis.get("dcr", 0)
        cap_rate = analysis.get("cap_rate", 0)
        cash_on_cash = analysis.get("cash_on_cash", 0)

        msg += format_analysis_summary(cashflow, dcr, cap_rate, cash_on_cash) + "\n"

        if analysis.get("welcome_tax"):
            msg += f"🏛️ Taxe bienvenue: {analysis['welcome_tax']:,} $\n".replace(",", " ")

    if listing.get("listing_url"):
        msg += f"🔗 {listing['listing_url']}\n"

    if listing.get("mls_number"):
        msg += f"MLS: {listing['mls_number']}"

    return msg


async def notify_new_listings(listings: list[dict]) -> int:
    """
    Envoie une notification WhatsApp pour chaque nouveau listing.

    Si > 5 nouveaux listings, envoie un resume au lieu de messages individuels.
    Si le gateway n'est pas disponible, log seulement (les donnees sont dans Sheets/DB).

    Args:
        listings: Liste de dicts (listing + analysis)

    Returns:
        Nombre de messages envoyes
    """
    if not listings:
        return 0

    sent = 0

    if len(listings) <= 5:
        # Messages individuels
        for item in listings:
            analysis = item.get("analysis")
            msg = format_listing_message(item, analysis)
            if await send_whatsapp_alert(msg):
                sent += 1
    else:
        # Resume
        summary = f"*📊 {len(listings)} nouveaux plex trouves !*\n\n"
        for i, item in enumerate(listings[:10], 1):
            price = item.get("price", 0)
            line = (
                f"{i}. {item.get('property_type', '').capitalize()} — "
                f"{price:,} $ — {item.get('city', '')}".replace(",", " ")
            )
            if item.get("listing_url"):
                line += f"\n   🔗 {item['listing_url']}"
            summary += line + "\n"

        if len(listings) > 10:
            summary += f"\n... et {len(listings) - 10} autres.\n"

        summary += "\n📋 Voir tous les details sur la page web ou Google Sheets."

        if await send_whatsapp_alert(summary):
            sent = 1

    return sent
