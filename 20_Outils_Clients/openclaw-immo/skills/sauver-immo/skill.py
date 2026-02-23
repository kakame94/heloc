#!/usr/bin/env python3
"""
Skill OpenClaw : sauver-immo
Ajoute un bien immobilier dans Google Sheets via l'API Sheets v4.

Auteur  : Eliot Alanmanou
Date    : 2026-02-11
Client  : Personnel (recherche triplex Gatineau / MTL)
Version : 1.0.0

Prérequis :
  - Variable d'env GOOGLE_SHEETS_ID (ID de la feuille)
  - Variable d'env GOOGLE_SERVICE_ACCOUNT_JSON (JSON du service account, base64)
  - La feuille doit avoir les colonnes :
    A: Adresse | B: Prix | C: Type | D: Revenus | E: Lien | F: Secteur | G: Notes | H: Date
"""

import base64
import json
import logging
import os
import sys
from datetime import datetime
from typing import Any

# --- Configuration du logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def get_google_credentials() -> dict[str, Any]:
    """Récupère les credentials Google depuis la variable d'env (base64)."""
    raw = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "")
    if not raw:
        raise EnvironmentError(
            "GOOGLE_SERVICE_ACCOUNT_JSON non définie. "
            "Encoder le JSON du service account en base64 et l'assigner."
        )
    try:
        decoded = base64.b64decode(raw)
        return json.loads(decoded)
    except Exception as exc:
        raise ValueError(f"Impossible de décoder GOOGLE_SERVICE_ACCOUNT_JSON: {exc}")


def get_access_token(credentials: dict[str, Any]) -> str:
    """Obtient un access token via JWT (sans dépendance externe)."""
    import time
    import hashlib
    import hmac

    # On utilise urllib pour éviter des dépendances lourdes
    import urllib.request
    import urllib.parse

    # Construire le JWT
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "RS256", "typ": "JWT"}).encode()
    ).rstrip(b"=").decode()

    now = int(time.time())
    payload_data = {
        "iss": credentials["client_email"],
        "scope": "https://www.googleapis.com/auth/spreadsheets",
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now,
        "exp": now + 3600,
    }
    payload = base64.urlsafe_b64encode(
        json.dumps(payload_data).encode()
    ).rstrip(b"=").decode()

    signing_input = f"{header}.{payload}"

    # Signer avec la clé privée RSA (nécessite cryptography ou jwt)
    try:
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding

        private_key = serialization.load_pem_private_key(
            credentials["private_key"].encode(), password=None
        )
        signature = private_key.sign(
            signing_input.encode(),
            padding.PKCS1v15(),
            hashes.SHA256(),
        )
        sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()
    except ImportError:
        raise ImportError(
            "Le package 'cryptography' est nécessaire. "
            "Installer avec : pip install cryptography"
        )

    jwt_token = f"{signing_input}.{sig_b64}"

    # Échanger le JWT contre un access token
    data = urllib.parse.urlencode({
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt_token,
    }).encode()

    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        token_data = json.loads(resp.read())

    return token_data["access_token"]


def append_to_sheet(
    access_token: str,
    spreadsheet_id: str,
    adresse: str,
    prix: str,
    type_bien: str,
    revenus: str,
    lien: str,
    secteur: str,
    notes: str,
) -> dict[str, Any]:
    """Ajoute une ligne dans Google Sheets via l'API v4."""
    import urllib.request

    url = (
        f"https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}"
        f"/values/A:H:append?valueInputOption=USER_ENTERED"
        f"&insertDataOption=INSERT_ROWS"
    )

    date_ajout = datetime.now().strftime("%Y-%m-%d %H:%M")
    body = json.dumps({
        "values": [[adresse, prix, type_bien, revenus, lien, secteur, notes, date_ajout]]
    })

    req = urllib.request.Request(
        url,
        data=body.encode(),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def execute(params: dict[str, str]) -> str:
    """Point d'entrée du Skill OpenClaw."""
    try:
        spreadsheet_id = os.environ.get("GOOGLE_SHEETS_ID", "")
        if not spreadsheet_id:
            return "❌ GOOGLE_SHEETS_ID non configuré dans les variables d'env."

        credentials = get_google_credentials()
        access_token = get_access_token(credentials)

        result = append_to_sheet(
            access_token=access_token,
            spreadsheet_id=spreadsheet_id,
            adresse=params.get("adresse", ""),
            prix=params.get("prix", ""),
            type_bien=params.get("type_bien", ""),
            revenus=params.get("revenus", "N/A"),
            lien=params.get("lien", ""),
            secteur=params.get("secteur", ""),
            notes=params.get("notes", ""),
        )

        updated_range = result.get("updates", {}).get("updatedRange", "?")
        logger.info("Bien ajouté dans %s", updated_range)
        return (
            f"✅ Bien ajouté dans Google Sheets.\n"
            f"  Adresse : {params.get('adresse')}\n"
            f"  Prix    : {params.get('prix')}\n"
            f"  Lien    : {params.get('lien')}\n"
            f"  Range   : {updated_range}"
        )

    except Exception as exc:
        logger.exception("Erreur lors de l'ajout du bien")
        return f"❌ Erreur : {exc}"


if __name__ == "__main__":
    # Test local
    test_params = {
        "adresse": "123 Rue Test, Gatineau",
        "prix": "575 000 $",
        "type_bien": "Triplex",
        "revenus": "2 400 $/mois",
        "lien": "https://www.centris.ca/fr/triplex~a-vendre~gatineau/12345678",
        "secteur": "Gatineau - Hull",
        "notes": "Bon état, proche bus",
    }
    print(execute(test_params))
