# Gratis-Ratgeber «Der passende Anzug» als Lead-Magnet (10.11.2026)

## Broschüren
- Zwei Gestaltungskonzepte desselben Inhalts (A4 hoch, 16 Seiten), der Inhaber wählt:
  - **A** editorial/Magazin (Schwarz, Creme, Gold, Playfair + Inter): `Marketing/Ratgeber-Anzug/`
  - **B** grafischer Guide (Nachtblau, Terrakotta, Hanken Grotesk, Entscheidungsbaum, Matrix «Anlass × Option»):
    `Marketing/Ratgeber-Anzug/alternative/`
- Vorschau je Konzept: `…/The-Sartorialist-Ratgeber-Anzug-Vorschau.png`. Quellen und Befehle in `quellen/LIESMICH.txt`.
- Website-Dateien in `public/ratgeber/`: `ratgeber-anzug-{a,b}.pdf`, `cover-{a,b}.webp`, `innen-{a,b}.webp`.
- **Online ist A.** Tausch: `RATGEBER_KONZEPT` in `lib/ratgeber.ts` auf `'b'` — PDF, Cover-Mockup, Innenseite wechseln überall.
- PDF nur Deutsch; fremdsprachige Seiten übersetzen den CTA und sagen, dass der Ratgeber deutsch ist.
- `/ratgeber/*` mit `X-Robots-Tag: noindex` (next.config.mjs), damit der Weg über das Formular führt.

## Website
- Komponenten `components/ratgeber/`: `RatgeberKarte` (3D-Cover, Formular Name + Telefon, Einwilligung WhatsApp/SMS
  optional, Download, Danke mit Termin/WhatsApp), `RatgeberBlock` (Seitenblock voll/kompakt), `RatgeberFenster`
  (Dialog, Event `ts-ratgeber`), `RatgeberKnopf`. Texte: `allgemein.client.ratgeber` in allen 9 Sprachen.
- Platzierung: Startseite (vor Brands), Massanzug, Hochzeitsanzug, Hochzeit 2024, Anzüge, Services, Farbseiten, Über uns,
  Glossar (Hub + Begriffe) als Block vor dem CTA-Band; Konfigurator (kompakter Block nach dem Konfigurator + Knopf in der
  Übersicht); Termin und Kontakt als kompakte Alternative; CTA-Band (alle Seiten mit Band, auch Shop-Kategorie/Produkt)
  und Kontakt-Knopf als Fenster; Shop-Start dezent als Knopf.
- PDF kommt auch, wenn der Server gerade nicht speichern kann; nur ungültige Angaben (400) halten auf.

## Backend
- `POST /api/anfrage/` mit `art: 'ratgeber'` (Name ≥ 2 Zeichen, Telefon): Kontakt über den Golden Record
  (Quelle `formular:ratgeber`), Verlauf «Ratgeber heruntergeladen» (`daten.art = 'ratgeber'`), kein Termin-Datensatz,
  Push an alle Admins (`pushRatgeber`, öffnet die Kundenakte), Mail ans Atelier (`mailRatgeber`), DLM-Lead.
  Gleiche Drosselung und Honeypot wie die anderen Formulare. Keine Schema-Änderung.
- Tracking: `cta` (`ratgeber-ctaband`, `ratgeber-kontaktknopf`, `ratgeber-konfigurator`, `ratgeber-shop`),
  `form_submit` mit `ratgeber`, serverseitig `anfrage_ratgeber` (Trichter wie `anfrage_termin` usw.; beim Zusammenführen
  mit der Webseitenanalyse auf deren Tracking-Funktion umstellen).
- Admin: Badge «Ratgeber geladen» im Leads-Board, «Ratgeber-Lead» und lesbare Quelle in der Kundenakte, Hinweis in der
  Kontaktliste (`lib/crm/quelle.ts`).
