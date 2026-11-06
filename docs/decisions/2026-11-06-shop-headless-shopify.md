# Shop unter /shop: Shopify headless + 3D-Kleiderschrank (06.11.2026)

Der Shopify-Shop (shop.thesartorialist.ch, `thesartorialistch.myshopify.com`) ist jetzt unter
`thesartorialist.ch/shop/` in die Website integriert. Gleiche Lösung wie racher.ch und Versaloro:
Shopify bleibt die Quelle (Produkte, Preise, Grössen, Lager, Bilder, Checkout), Next.js macht
Darstellung, Filter, SEO. Fokus der Website bleibt der Massanzug; der Shop ist «Begleiter».

## Architektur
- `output: 'standalone'` statt statischem Export (Warenkorb braucht Server Actions). Marketing-Seiten
  bleiben vorgerendert, Shop-Seiten ISR 15 Min. Nixpacks startet `node .next/standalone/server.js` (Port 3000).
- Storefront API **tokenless** (`lib/shop/shopify.ts`, Retry bei Drosselung). Optional
  `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_CHECKOUT_DOMAIN`.
- Warenkorb = Shopify-Cart (`lib/shop/cart.ts`, Cookie `ts_cart`, HttpOnly), Checkout bei Shopify
  (Primärdomain shop.thesartorialist.ch).
- Next 15.1.6 → 15.5.x (CVE-2025-66478 betrifft Server Actions).

## Routen
- `/shop/` 3D-Kleiderschrank + Sortiment mit Filter · `/shop/<slug>/` Landingpages
  (Marken, Herren/Damen, Kategorien; `lib/shop/pages.ts`) · `/shop/products/<handle>/` Produkt
  (ProductGroup-JSON-LD, Grössen-Chips). Alte Theme-Pfade `/products/<handle>` → 308.
- Marke steht in Shopify in den Collections (Vendor ist der Shopname): Zuordnung `BRAND_BY_COLLECTION`
  in `lib/shop/catalog.ts` (Collection `test` = Woolrich, `pullover` = Gran Sasso).

## Filter (Muster Versaloro)
Drei Ebenen aus dem Titel abgeleitet (`lib/shop/taxonomy.ts`): Kategorie-Pills → Unterkategorie-Kacheln
(mit freigestellten Bildern) → Modell-Pills. Leiste mit Panels (Marke, Grösse nach System
International/IT/Bundweite, Farbe, Preis-Slider mit Histogramm), «Alle Filter» als Seitenpanel/Vollbild,
aktive Chips, Live-Zahl, Ansicht kompakt/gross, Zustand in der URL (`?kategorie=…&art=…`).

## 3D-Kleiderschrank
`components/shop/WardrobeScene.tsx` (three.js / react-three-fiber, lädt erst im Browser):
Nussbaum-Schrank mit prozeduraler Maserung, Türen schwingen auf, Kamera fährt heran; 15 freigestellte
Stücke an Messingstange, Pendel-Physik, ziehen/wischen/Pfeile/Tastatur, Klick öffnet das Produkt.
Bilder: `npm i --no-save sharp && npm run schrank` stellt die Flat-Lays aus Shopify frei
(Flood-Fill vom Rand) → `public/media/schrank/*.webp` + `lib/shop/wardrobe-data.json`.
Nur Fotos ohne Model; beige Chino auf hellem Grund lässt sich so nicht freistellen.

## Offen (Go-live)
- shop.thesartorialist.ch zeigt weiterhin das Shopify-Theme (doppelte Inhalte). Empfehlung: im Theme
  Produkt-/Kollektionsseiten per Weiterleitung auf `thesartorialist.ch/shop/…` schicken, Checkout bleibt dort.
- Shopify-Analysen (Hydrogen `ShopifyScripts`, Ereignisse, Pixel) wie racher noch nicht eingebaut.
- Woolrich-Produkte ohne Bilder (GTX Jacket, Madison Long Coat) erscheinen erst mit Bild.
