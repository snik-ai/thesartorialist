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

---

# Massanzug-Konfigurator, Stil-Studio & Film-Hero (06.11.2026)

Wunsch: Startseite mit Fokus Massanzug, «Styles & Options»-Konfigurator aus dem gelieferten Quellcode
(`sartorialist SourceCode.zip`, Next 16 + Tailwind) extrem benutzerfreundlich ins eigene Design integriert,
schwebender Knopf für den Vollbild-Konfigurator, Shop nur sekundär, Film von thesartorialist.ch auf die Startseite.

- **Daten:** `lib/konfigurator/daten.ts` – 4 Kategorien (Sakko, Hose, Weste, Smoking), 36 Untergruppen,
  118 Optionen, auf Deutsch übersetzt, IDs wie im Original. Illustrationen als WebP in `public/konfigurator/`
  (117 Bilder, 2.4 MB → 0.55 MB). Nicht übernommen: PDF-Seitenansicht (`pdf-pages-data`, ungenutzt im Original),
  Tailwind, Cloudinary-Upload und Calendly (Test-Account des Entwicklers, keine Zugangsdaten).
- **Zustand:** `lib/konfigurator/useAuswahl.ts` (localStorage + Ereignis, `useSyncExternalStore`), geteilt von
  allen Ansichten. Regeln in `lib/konfigurator/regeln.ts`: Einreiher/Zweireiher und Revers-Arten schliessen
  sich aus; das Studio blendet unpassende Schritte aus.
- **Stil-Studio** (`components/konfigurator/StilStudio.tsx`): eine Entscheidung pro Schritt, grosse
  Illustration, Antippen wählt und springt weiter, Zurück/Überspringen/Fortschrittspunkte, Übersicht mit
  Termin, PDF, Kopieren. Inline auf der Startseite (`#stil-studio`) und im Vollbild über `StudioFab`
  (schwebender Knopf auf allen Seiten ausser Konfigurator und Termin; Studio lädt erst beim Öffnen).
- **Konfigurator-Seite** `/massanzug-konfigurator/`: alle Details auf einen Blick, klebende Kategorie-Leiste
  mit Fortschritt, Detail-Dialog, Übersicht. PDF mit jsPDF im Browser (ohne Schatten).
- **Termin:** `/termin/` zeigt die Auswahl und schickt sie in der Anfrage-E-Mail mit (abwählbar).
- **Film-Hero:** Vimeo 459093662 («Create your own Style!») als Hintergrund, `dnt=1`, stumm, Loop; Standbild
  `public/images/hero-film.webp` als LCP; Einblenden erst, wenn Vimeo `play`/`timeupdate` meldet.
  «Film ansehen» öffnet ihn mit Ton. Datenschutz um Vimeo und Konfigurator ergänzt.
- **Shop sekundär:** Shop-Hinweis von der Startseite entfernt, «Shop» in der Navigation zuletzt.
- **Neue Version des Quellcodes (06.11.2026, 09:43):** Adresse überall Kuttelgasse 7, 8001 Zürich (bestätigt
  `lib/site.ts`), Untergruppen mit 5 Optionen auf Desktop 3 pro Reihe zentriert (`.konf-grid--5`), Menüpunkt
  «Styles & Options» in der Hauptnavigation. Daten und Bilder unverändert.

## Umstellung auf One-Pager (06.11.2026, Wunsch Kunde)

Das Schritt-für-Schritt-Stil-Studio war zu lang («Leute klicken sich nicht durch 30 Schritte»). Entfernt
(`StilStudio.tsx`, Vollbild-Overlay). Jetzt:
- «Anzug gestalten» (schwebender Knopf, Hero) führt auf `/massanzug-konfigurator/` («Styles & Options»).
- Alles auf einer Seite wie im Original, Untergruppen-Titel und Karten **zentriert**.
- **Übersicht immer im Blick:** Leiste unten (`.konf-dock`) mit Zahl, Mini-Vorschau, Hinweis «Sie müssen nicht alles
  wählen» und «Zur Übersicht ↓»; leuchtet bei jeder Wahl golden auf. Fortschritt «x/17» in den Tabs entfernt
  (suggerierte Pflicht), nur noch «gewählt»-Zahl.
- Startseite: «Styles & Options»-Vorschau (6 Details) statt Studio.
- SEO: Seite ergänzt «Massanzug selbst gestalten», «Anzug nach Mass Zürich» (30/Mt.), «Anzug massgeschneidert
  Zürich» (50/Mt., Keyword-DB); «Massanzug Zürich» bleibt bei `/massanzug-zuerich/` (keine Kannibalisierung).
- «vis-à-vis Park Hyatt» auf Wunsch überall entfernt (Seiten, Meta, llms.txt, ai.txt, Video-Quelle).

## Kollektion entfernt, Navigation, Karten-Design (06.11.2026)
- Kollektion (kein Content): `/kollektion/` und Unterseiten gelöscht, 308 auf `/massanzug-zuerich/`, aus Sitemap,
  Startseite, Footer (Spalte heisst jetzt «Anzüge»: blau/grün/beige) und Menü entfernt.
- Navigation: Über uns · Styles & Options · Massanzug · Hochzeitsanzug | Shop · Brands · Kontakt (Desktop + Mobile).
- Konfigurator-Karten: eckig, Bezeichnungen in Inter (Sans), gleich hohe Karten, Block-Layout (Safari schnitt Text ab).
  Badges («Beliebt», «Italienisch» …) überall entfernt (Daten und Anzeige).
