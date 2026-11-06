# Mehrsprachigkeit (06.11.2026)

## Entscheid
- Deutsch bleibt Hauptsprache **ohne Präfix**; alle bisherigen URLs unverändert.
- Fremdsprachen mit Präfix wie die alte WPML-Seite: `en`, `fr`, `it`, `es`, `pt-pt`, `ru`, `sr`, `sq`.
  Slugs = alte WPML-Slugs (`lib/redirects-sprachen.json`), sonst sinnvoller lokalisierter Slug.
- Phase 1: Architektur + Englisch. Übrige Sprachen liegen als typkompatible Kopie der englischen
  Texte bereit (`// TODO übersetzen`), sind aber nicht freigeschaltet.

## Aufbau
- **Routengruppen mit eigenem Root-Layout je Sprache** (wegen `<html lang>`):
  `app/(de)/…` (alle deutschen Seiten, unverändert adressiert), `app/(<sprache>)/<sprache>/[[...pfad]]`
  (alle Seiten der Sprache über die Slug-Tabelle) plus `app/(<sprache>)/<sprache>/shop/…`.
  Kein gemeinsames `app/layout.tsx` mehr; `app/admin/layout.tsx` und `app/not-found.tsx` rendern `<html>` selbst.
  Ein `app/[lang]` war nicht möglich, weil `app/[slug]` (Brand-/Farbseiten) auf derselben Ebene liegt.
- Gemeinsamer Rahmen: `components/rahmen/SprachRahmen.tsx` (Header, Footer, Fabs, Tracking, JSON-LD).
- Seiten: `components/seiten/<Seite>.tsx` mit `meta(lang)` und `<Seite lang>`; Registry `components/seiten/registry.tsx`.
- Texte: `lib/i18n/de/*.ts` = Quelle und Typ (`Woerterbuch`), `lib/i18n/<sprache>/*.ts` typisiert dagegen.
  Brands, Anzugfarben, Konfigurator-Katalog und Shop-Landingpages: deutsche Quelle bleibt in `lib/…`,
  Fremdsprachen als Überlagerung je Slug/ID (`marken.ts`, `farben.ts`, `konfigDaten.ts`, `shop.ts`).
- Slug-Tabelle: `lib/i18n/routen.json` (auch von `next.config.mjs` gelesen). Links immer über `pfad(lang, key)`.
- SEO: `lib/i18n/seo.ts` → Canonical je Sprache, hreflang (de, en, …, x-default = de), og:locale.
  Sitemap mit allen Sprachfassungen und `alternates`.
- Client-Komponenten bekommen nur die Texte ihrer Sprache (SprachKontext bzw. Props) — keine Wörterbücher aller Sprachen im Bundle.
- Kundenmails in der Sprache des Formulars (`sprache` → `lib/i18n/kundenmail.ts`); Mails ans Atelier bleiben Deutsch.
- Glossar vorerst nur Deutsch; in Fremdsprachen verlinkt der Footer die deutsche Glossarseite.

## Sprache freischalten (Übersetzer)
1. `lib/i18n/<sprache>/*.ts` übersetzen (alle Dateien; `// TODO übersetzen` entfernen). Grösste Brocken:
   `konfigDaten.ts` (Konfigurator-Katalog), `datenschutz.ts`, `agb.ts`, `marken.ts`, `shop.ts`.
2. Slugs in `lib/i18n/routen.json` prüfen (alte WPML-Slugs nicht ändern).
3. Code in `lib/i18n/aktive-sprachen.json` eintragen → Seiten, Sitemap, hreflang, Umschalter und
   Weiterleitungen (alte URLs liefern 200) sind aktiv.
4. Prüfen: `npm run build`, Redirect-Check mit `redirect-check.py`, Stichprobe der Seiten.
   Bei `ru`/`sr` (kyrillische Slugs) die URLs im Produktions-Build besonders prüfen.
Fehlende Wörterbuch-Dateien einer Sprache erzeugt `node scripts/i18n-kopie.mjs <sprache>`.
