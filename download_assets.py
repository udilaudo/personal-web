"""
Script per scaricare localmente i font di Google Fonts e la libreria Lucide Icons.

Scarica:
- Inter (pesi: 300, 400, 500, 600, 700) - font sans-serif principale
- Playfair Display (pesi: 400, 700) - font display/titoli
- lucide.min.js - libreria icone

Poi crea fonts/fonts.css con le dichiarazioni @font-face che puntano ai file locali.
"""

import os
import re
import urllib.request

# ── Cartelle di destinazione ──────────────────────────────────────────────────
FONTS_DIR   = "fonts"
VENDORS_DIR = "vendors"

os.makedirs(FONTS_DIR,   exist_ok=True)
os.makedirs(VENDORS_DIR, exist_ok=True)

# ── User-Agent moderno: serve per ricevere WOFF2 da Google Fonts ──────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# ── URL Google Fonts CSS ──────────────────────────────────────────────────────
GOOGLE_FONTS_URLS = {
    "Inter":            "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
    "Playfair+Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap",
}

# ── URL Lucide Icons ──────────────────────────────────────────────────────────
# Versione fissa — allineata con quella usata negli HTML (con SRI hash).
# Per aggiornare: cambia la versione qui e ricalcola l'hash con:
#   curl -s "https://cdn.jsdelivr.net/npm/lucide@NUOVA_VERSIONE/dist/umd/lucide.min.js" \
#        | openssl dgst -sha384 -binary | openssl base64 -A
LUCIDE_URL = "https://unpkg.com/lucide@0.577.0/dist/umd/lucide.min.js"


def fetch(url, headers=None):
    """Scarica il contenuto di un URL e lo restituisce come stringa."""
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode("utf-8")


def fetch_bytes(url, headers=None):
    """Scarica il contenuto binario di un URL."""
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req) as resp:
        return resp.read()


def download_google_font(family_name, css_url):
    """
    1. Scarica il CSS di Google Fonts
    2. Trova tutti gli URL .woff2 nel CSS
    3. Scarica ogni file woff2 in fonts/
    4. Restituisce il CSS modificato con percorsi locali
    """
    print(f"\n→ Scaricando CSS per {family_name}...")
    css = fetch(css_url, HEADERS)

    # Trova tutti gli URL woff2 nel CSS (es: url(https://fonts.gstatic.com/s/...)
    woff2_urls = re.findall(r'url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)', css)
    print(f"  Trovati {len(woff2_urls)} file .woff2")

    # Per ogni file woff2, scaricalo e sostituisci l'URL nel CSS con il path locale
    for woff2_url in woff2_urls:
        # Prende solo il nome del file dall'URL
        filename = woff2_url.split("/")[-1]
        local_path = os.path.join(FONTS_DIR, filename)

        print(f"  ↓ {filename}")
        data = fetch_bytes(woff2_url, HEADERS)

        with open(local_path, "wb") as f:
            f.write(data)

        # Sostituisce l'URL remoto con il path locale nel CSS
        css = css.replace(woff2_url, filename)

    return css


# ── Download font ─────────────────────────────────────────────────────────────
all_css_parts = []

for family, url in GOOGLE_FONTS_URLS.items():
    css_part = download_google_font(family, url)
    all_css_parts.append(css_part)

# Unisce tutti i CSS in un unico file fonts.css
combined_css = "\n\n".join(all_css_parts)
fonts_css_path = os.path.join(FONTS_DIR, "fonts.css")

with open(fonts_css_path, "w", encoding="utf-8") as f:
    f.write(combined_css)

print(f"\n✓ fonts/fonts.css creato")

# ── Download Lucide Icons ─────────────────────────────────────────────────────
print(f"\n→ Scaricando Lucide Icons...")
lucide_js = fetch_bytes(LUCIDE_URL, HEADERS)
lucide_path = os.path.join(VENDORS_DIR, "lucide.min.js")

with open(lucide_path, "wb") as f:
    f.write(lucide_js)

print(f"✓ vendors/lucide.min.js scaricato ({len(lucide_js) // 1024} KB)")

# ── Riepilogo finale ──────────────────────────────────────────────────────────
print("\n─────────────────────────────────────────")
print("Fatto! File ripristinati:")
for root, dirs, files in os.walk(FONTS_DIR):
    for fname in sorted(files):
        print(f"  fonts/{fname}")
print(f"  vendors/lucide.min.js")
print("─────────────────────────────────────────")
