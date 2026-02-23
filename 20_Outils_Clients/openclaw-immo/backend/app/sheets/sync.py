"""
Synchronisation PostgreSQL → Google Sheets.

Utilise gspread avec un service account pour ecrire dans Google Sheets.
La feuille sert de "vue" lisible par la page web et par l'utilisateur.
"""

import logging
from typing import Optional

import gspread
from google.oauth2.service_account import Credentials

from app.config import settings
from app.db.models import Listing, Analysis

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

# En-tetes de la feuille (doit correspondre a la page web)
SHEET_HEADERS = [
    "Adresse",
    "Prix",
    "Type",
    "Revenus est.",
    "Lien",
    "Secteur",
    "Notes",
    "Date",
    "MLS",
    "Cashflow/mois",
    "DCR",
    "Cap Rate %",
    "Cash-on-Cash %",
    "Taxe bienvenue",
    "Hypotheque/mois",
    "Nb unites",
]


def _get_client() -> Optional[gspread.Client]:
    """Cree un client gspread avec le service account."""
    creds_path = settings.google_service_account_json_path
    if not creds_path:
        logger.warning("GOOGLE_SHEETS_CREDS non configure — sync desactive")
        return None

    try:
        credentials = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
        return gspread.authorize(credentials)
    except Exception as exc:
        logger.error("Erreur auth Google Sheets: %s", exc)
        return None


def _get_sheet(client: gspread.Client) -> Optional[gspread.Worksheet]:
    """Ouvre la feuille Google Sheets."""
    sheet_id = settings.google_sheet_id
    if not sheet_id:
        logger.warning("GOOGLE_SHEET_ID non configure")
        return None

    try:
        spreadsheet = client.open_by_key(sheet_id)
        return spreadsheet.sheet1
    except Exception as exc:
        logger.error("Erreur ouverture Google Sheets: %s", exc)
        return None


def ensure_headers(sheet: gspread.Worksheet) -> None:
    """Verifie et ajoute les en-tetes si necessaire."""
    try:
        row1 = sheet.row_values(1)
        if not row1 or row1[0] != SHEET_HEADERS[0]:
            sheet.update("A1", [SHEET_HEADERS])
            logger.info("En-tetes ajoutees a Google Sheets")
    except Exception as exc:
        logger.error("Erreur mise a jour en-tetes: %s", exc)


def sync_listings_to_sheet(
    listings: list[dict],
) -> int:
    """
    Synchronise une liste de listings (avec analyses) vers Google Sheets.

    Strategie :
    - Lit tous les MLS existants dans la feuille
    - N'ajoute que les nouveaux (par MLS)
    - Met a jour le prix si change

    Args:
        listings: Liste de dicts avec les donnees listing + analyse

    Returns:
        Nombre de lignes ajoutees/mises a jour
    """
    client = _get_client()
    if not client:
        return 0

    sheet = _get_sheet(client)
    if not sheet:
        return 0

    ensure_headers(sheet)

    # Lire les MLS existants (colonne I = index 8)
    try:
        existing_data = sheet.get_all_values()
        existing_mls = set()
        for row in existing_data[1:]:  # Skip headers
            if len(row) > 8:
                existing_mls.add(row[8])  # Colonne MLS
    except Exception as exc:
        logger.error("Erreur lecture Google Sheets: %s", exc)
        existing_mls = set()

    # Preparer les nouvelles lignes
    new_rows = []
    for item in listings:
        mls = item.get("mls_number", "")
        if mls in existing_mls:
            continue  # Deja dans la feuille

        analysis = item.get("analysis", {})
        row = [
            item.get("address", ""),
            f"{item.get('price', 0):,} $".replace(",", " "),
            item.get("property_type", "").capitalize(),
            f"{item.get('estimated_rent', 'N/A')}",
            item.get("listing_url", ""),
            f"{item.get('city', '')} - {item.get('region', '')}",
            "",  # Notes (vide, l'utilisateur remplit)
            item.get("date", ""),
            mls,
            f"{analysis.get('cashflow_monthly', 'N/A')}",
            f"{analysis.get('dcr', 'N/A')}",
            f"{analysis.get('cap_rate', 'N/A')}",
            f"{analysis.get('cash_on_cash', 'N/A')}",
            f"{analysis.get('welcome_tax', 'N/A')}",
            f"{analysis.get('mortgage_monthly', 'N/A')}",
            str(item.get("num_units", "")),
        ]
        new_rows.append(row)

    if not new_rows:
        logger.info("Aucune nouvelle ligne a ajouter dans Google Sheets")
        return 0

    # Batch append (une seule requete API)
    try:
        sheet.append_rows(new_rows, value_input_option="USER_ENTERED")
        logger.info("%d nouvelles lignes ajoutees a Google Sheets", len(new_rows))
        return len(new_rows)
    except Exception as exc:
        logger.error("Erreur ajout Google Sheets: %s", exc)
        return 0
