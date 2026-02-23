"""
Test rapide — Valide la connexion Bright Data Unlocker + scrape Centris.
Usage: python3 test_brightdata.py
"""

import asyncio
import httpx
import re
import os
from html import unescape

# --- Config ---
API_KEY = os.getenv("BRIGHTDATA_API_KEY", "5131eaa4-8a5a-4449-9d69-c0131b0aead8")
ZONE = os.getenv("BRIGHTDATA_ZONE", "unlocker")
BRIGHTDATA_URL = "https://api.brightdata.com/request"

# URL de test : triplex a Montreal, max 610k
TEST_URL = "https://www.centris.ca/fr/triplex~a-vendre~montreal-region?view=Thumbnail&uc=0&pmax=610000"


async def test_brightdata_connection():
    """Test 1 : Verifier que l'API Bright Data repond."""
    print("=" * 60)
    print("TEST 1 — Connexion Bright Data Unlocker API")
    print("=" * 60)
    print(f"  API Key: {API_KEY[:8]}...{API_KEY[-4:]}")
    print(f"  Zone:    {ZONE}")
    print(f"  URL:     {TEST_URL[:60]}...")
    print()

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "zone": ZONE,
        "url": TEST_URL,
        "format": "raw",
        "country": "ca",
    }

    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            print("  Envoi de la requete... (peut prendre 30-60s)")
            resp = await client.post(BRIGHTDATA_URL, json=payload, headers=headers)

            print(f"  Status HTTP: {resp.status_code}")
            print(f"  Taille reponse: {len(resp.text)} caracteres")
            print()

            if resp.status_code == 200:
                html = resp.text
                print("✅ Bright Data a repondu avec succes !")
                print()

                # Verifier si c'est bien du HTML Centris
                if "centris" in html.lower() or "property" in html.lower():
                    print("✅ Le HTML contient des references Centris")
                else:
                    print("⚠️  Le HTML ne semble pas etre Centris")
                    print(f"   Premiers 500 chars: {html[:500]}")

                # Compter les cards de proprietes
                cards = re.findall(
                    r'class="property-thumbnail-item', html
                )
                print(f"   Cards HTML trouvees: {len(cards)}")

                # Essayer d'extraire des MLS numbers
                mls_numbers = re.findall(r'data-mlsnumber=[\'"](\d+)[\'"]', html)
                if not mls_numbers:
                    mls_numbers = re.findall(r'itemprop="sku"\s*content="(\d+)"', html)
                print(f"   MLS numbers extraits: {len(mls_numbers)}")
                if mls_numbers:
                    print(f"   Exemples: {mls_numbers[:5]}")

                # Extraire quelques prix
                prices = re.findall(r'itemprop="price"\s*content="(\d+)"', html)
                if prices:
                    prices_int = [int(p) for p in prices]
                    print(f"   Prix trouves: {len(prices_int)}")
                    print(f"   Min: {min(prices_int):,} $ | Max: {max(prices_int):,} $")

                return html

            elif resp.status_code == 401:
                print("❌ ERREUR 401 — Cle API invalide ou expiree")
                print("   → Verifie ta cle sur https://brightdata.com/cp/setting/users")
                print(f"   Reponse: {resp.text[:300]}")

            elif resp.status_code == 400:
                print("❌ ERREUR 400 — Requete invalide")
                print(f"   Reponse: {resp.text[:300]}")
                print("   → La zone 'unlocker' existe-t-elle dans ton dashboard ?")

            elif resp.status_code == 403:
                print("❌ ERREUR 403 — Acces refuse")
                print(f"   Reponse: {resp.text[:300]}")
                print("   → Verifie les permissions de ta zone")

            else:
                print(f"❌ ERREUR HTTP {resp.status_code}")
                print(f"   Reponse: {resp.text[:500]}")

            return None

        except httpx.TimeoutException:
            print("❌ TIMEOUT — La requete a pris trop de temps (>90s)")
            print("   → Reessaie ou verifie brightdata.com/cp")
            return None
        except Exception as exc:
            print(f"❌ ERREUR: {exc}")
            return None


async def test_parsing(html: str):
    """Test 2 : Parser le HTML avec le code existant."""
    print()
    print("=" * 60)
    print("TEST 2 — Parsing HTML (meme logique que centris.py)")
    print("=" * 60)

    # Importer le parser depuis le projet
    import sys
    sys.path.insert(0, "backend")
    from app.scraper.centris import _parse_html_listings

    search_key = "triplex_montreal"
    listings = _parse_html_listings(html, search_key)

    print(f"  Listings parses: {len(listings)}")

    if listings:
        print()
        print("  Top 5 resultats:")
        print("  " + "-" * 56)
        for i, l in enumerate(listings[:5], 1):
            print(f"  {i}. MLS {l['mls_number']} | {l['price']:>9,} $ | {l['address'][:40]}")
        print("  " + "-" * 56)
        print()
        print("✅ Parsing fonctionne !")
    else:
        print("⚠️  Aucun listing parse — le HTML est peut-etre different")
        print("   → Centris a peut-etre change sa structure HTML")


async def main():
    print()
    print("🔍 Test Bright Data + Centris Scraping")
    print("=" * 60)
    print()

    html = await test_brightdata_connection()

    if html:
        await test_parsing(html)
    else:
        print()
        print("⏭️  Parsing ignore (pas de HTML recu)")

    print()
    print("=" * 60)
    print("Test termine.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
