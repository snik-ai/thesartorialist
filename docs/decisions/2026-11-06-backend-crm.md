# Backend / CRM unter /admin (06.11.2026)

Eigenes Backend für das Atelier: Anfragen aus der Website landen in einer Postgres-DB, das Team
bestätigt Termine, schlägt neue vor, führt Kontakte (Golden Record) und sieht Reichweite und
Anfragen auf einem Dashboard. Muster und Sicherheit nach VoxCRM (Login, Passkey, Sitzungen).

## Aufbau
- **DB:** Drizzle ORM + `postgres`-Treiber. Schema `lib/db/schema.ts`, Migrationen `drizzle/`
  (`npm run db:generate` nach Schemaänderungen). Eingespielt automatisch beim Serverstart
  (`instrumentation.ts`, Advisory-Lock, idempotent) oder manuell `npm run db:migrate`.
  `postbuild` kopiert `drizzle/` nach `.next/standalone/` (der Standalone-Server wechselt dorthin).
  `outputFileTracingRoot` zeigt auf den Projektordner (Builds aus Worktrees bleiben flach).
- **Tabellen:** `admin_user`, `login_code`, `passkey`, `passkey_challenge`, `sitzung`, `kontakt`,
  `termin` (art termin|rueckruf, status angefragt|bestaetigt|vorgeschlagen|abgesagt|erledigt),
  `aktivitaet` (Verlauf: mail/whatsapp/sms/anruf/notiz/formular/system), `ereignis` (Tracking).
  Phase 2: `angebot`, `auftrag`, `auftrag_task`, `rechnung`, `zahlung`, `massblatt` (Versionen), `firma_einstellung`, `nummernkreis` (siehe unten).
- **Anfragen:** `app/api/anfrage/route.ts` speichert Kontakt + Termin/Rückruf (auch ohne Resend → 200),
  sendet danach wie bisher die Mails, markiert `atelier_mail_am`/`eingang_mail_am`. Weder DB noch
  Resend → 503 (Formular fällt aufs Mailprogramm zurück). Übernimmt optional `firma`, `brandDomain`,
  `einwilligung` (bool + `einwilligungText`, oder direkt der Text) und `sprache`.
- **Golden Record:** `lib/crm/kontakte.ts` — Treffer über E-Mail ODER Telefon (letzte 9 Ziffern),
  ergänzt nur leere Felder, abweichende Angaben landen im Verlauf. Duplikate (E-Mail/Telefon/Name)
  unter /admin/kontakte/duplikate/ zusammenführen (Termine, Verlauf, Belege wandern mit).
- **Login:** /admin/login — E-Mail + 6-stelliger Code (nur HMAC gespeichert, 10 Min., einmalig,
  Sperre nach 5 Fehlversuchen für 15 Min., gleiche Antwort für unbekannte E-Mails, max. 5 Codes/h)
  oder Face ID/Passkey (`@simplewebauthn`, discoverable credentials, Challenges in der DB, Autofill
  im E-Mail-Feld). Nach dem Login Angebot «Face ID einrichten?» (nur frische Sitzung < 10 Min.).
  Sitzung in der DB, Cookie HttpOnly, SameSite=Lax, in Produktion `__Host-ts_admin` + Secure,
  14 Tage absolut / 7 Tage Leerlauf. CSRF: Origin-Prüfung bei allen schreibenden Anfragen.
- **Schutz:** `middleware.ts` (kein Cookie → Login bzw. 401, `X-Robots-Tag: noindex`), echte Prüfung
  serverseitig (`lib/admin/zugang.ts`). robots.txt sperrt `/admin/` und `/api/`. Öffentlicher Rahmen
  (Header, Footer, Fabs, DLM-Pixel, Tracking) wird im Admin nicht gerendert (`components/NurOeffentlich.tsx`).
- **Admin-App:** PWA (`/admin/manifest.webmanifest`, `public/admin/sw.js` ohne Daten-Cache,
  Offline-Seite). Termine-Eingang, Detail mit Stil-Auswahl (Sakko/Hose/Weste/Smoking), Stoffnummern,
  Bestätigen (Mail mit .ics CONFIRMED), Vorschlagen (eigener Kalender/Slot-Picker nach
  `SITE.hours`, 30-Min.-Raster, 90 Min. Beratung, belegte Termine gesperrt, 1–3 Vorschläge),
  danach vorbereitete 1:1-Nachricht für WhatsApp (`wa.me`) und SMS (`sms:`) — nur mit Einwilligung,
  sonst E-Mail/Anruf. Jede Aktion landet im Verlauf. Kontakte mit Suche, Firmenlogo (serverseitig
  geladen, SSRF-Schutz, `lib/admin/logo.ts`), Einwilligungen erfassen/widerrufen.
- **Webseitenanalyse** (`/admin/reichweite/`, Navigation «Webseitenanalyse», seit 10.11.2026): Informationsumfang
  wie Karo, im Atelier-Design (Tinte/Gold, eckig, Playfair + Inter mit tabular-nums). Seite
  `app/admin/(app)/reichweite/page.tsx`, Bausteine `components/admin/webanalyse/` (Zeitraumwahl, Echtzeit, Bilanz,
  Verlauf, Trichter, KanalFluss, KanalListe, Wochenraster, Tabellen, `webanalyse.css`), Auswertung
  `lib/crm/webanalyse.ts`, Kontaktarten/Farben `lib/crm/bahnen.ts`.
  - **Zeitraum** in der URL (`?zeitraum=heute|gestern|7|30|90|frei&von=JJJJ-MM-TT&bis=…`, altes `?tage=` geht weiter),
    Schnellwahl-Chips, Blättern um die Bereichslänge, eigener Bereichs-Kalender (kein natives Datumsfeld), Vorperiode
    gleich lang direkt davor. Einzeltag = Verlauf je Stunde; Klick auf einen Tag im Verlauf öffnet ihn stündlich.
  - **Echtzeit** (`GET /api/admin/webanalyse/echtzeit/`, alle 30 s, nur bei sichtbarem Tab): jetzt auf der Website
    (Zeile oder Heartbeat in den letzten 5 Min.), Aufrufe je Minute (30 Min.), Besucher/Aufrufe/Kontakte, letzte Ereignisse.
  - **Bilanz:** Besucher → Kontakte → Conversion-Rate mit Vorperiode; je Kontaktart (Anrufe, Terminanfragen,
    Konfigurator, Rückrufe, E-Mail, WhatsApp) Kachel mit Mini-Verlauf; Sitzungen, Seitenaufrufe, Seiten je Sitzung,
    Ø Verweildauer, Absprungrate, engagierte Sitzungen, Routen-Klicks.
  - **Verlauf** Besucher/Sitzungen/Aufrufe (Fläche, Vorperiode gestrichelt) + alle sechs Kontaktarten als Bahnen;
    **Trichter** Besuche → Interaktion → Interesse (Termin-/Kontakt-/Konfigurator-/Shopseite oder Konfigurator-/
    Shop-Aktion) → Kontakt, auch je Kanal; **Fluss** Kanal → erste Kontaktart; **Kanäle** mit Conversion-Rate;
    **Wochenraster** Wochentag × Stunde (Besuche/Kontakte).
  - **Details:** Seiten (Titel, Aufrufe, Besucher, Ø Zeit, Ausstiege), Geräte, Verweildauer-Verteilung,
    Einstiegs- und Ausstiegsseiten (Absprung, Conv.-Rate, Ausstiegsquote), Herkunft (Referrer-Domain + Kanal),
    UTM-Kampagnen inkl. term/content und Google-Klickkennung, Browser, Betriebssysteme, Länder (Näherung, siehe
    unten), Bildschirmklassen, Sprachen der Website (9 Sprachen, aus dem Pfad), Browsersprachen, Aktionen
    (Konfigurator, Shop, Formulare, Kontaktwege), Kontaktziele.
  - **Begriffe:** Besucher = Tages-Prüfwerte (je Tag einmal). Sitzung = gleicher Tages-Besucher, max. 30 Min. Ruhe
    (serverseitig gebildet). Engagiert = ≥ 2 Seiten, eine Aktion oder ≥ 10 s sichtbar; Absprung = nicht engagiert.
    Conversion-Rate = Sitzungen mit Kontakt ÷ Sitzungen. Kanal = erster Seitenaufruf der Sitzung (Google Ads per
    gclid/cpc, Google organisch, andere Suchmaschinen, KI-Assistenten, Social, E-Mail, Kampagne, Verweis, Direkt).
  - **Zwei Quellen für Anfragen:** Verlauf/Bilanz zählen Termin-, Rückruf- und Konfigurator-Anfragen aus der Tabelle
    `termin` (nur Website: `quelle <> 'atelier'`, ohne Auftrag; Konfigurator = Termin mit Stil). Trichter, Fluss und
    Kanäle brauchen die Sitzung und nutzen die Tracking-Ereignisse `anfrage_*`.
  - **Leistung:** eine Auswertung = eine Transaktion; das Zeitfenster wird einmal in Temp-Tabellen gelesen
    (`w_ev`/`w_s`, Vorperiode `v_ev`/`v_s`), alle Aufteilungen lesen nur noch diese (lokal 90 Tage ≈ 0,1 s).
  - Testdaten (nur lokal): `npx tsx scripts/webanalyse-testdaten.mts` (`--leeren` entfernt sie).
- **Tracking (cookielos):** Inline-Skript (`lib/tracking/skript.ts`) → `POST /api/t/` (sendBeacon). Typen:
  pageview (inkl. Client-Navigation, mit Titel), click_tel/whatsapp/mail/route (mit Ziel), cta (`data-track`),
  form_submit, konfig_start/konfig_pdf/konfig_termin, shop_warenkorb/shop_checkout, anfrage_termin/anfrage_rueckruf/
  anfrage_konfig (nach erfolgreichem Versand). Komponenten melden über `melde()` (`lib/tracking/melden.ts`,
  `window.tsT`). «ende» trägt die **sichtbare Verweildauer** nach (beim Verstecken/Verlassen, vor jeder
  Client-Navigation und alle 60 s als Heartbeat → `dauer_ms`, `zuletzt`). Die Aufruf-ID lebt nur im Arbeitsspeicher;
  **kein Cookie, kein local-/sessionStorage**. Die **Sitzung bildet der Server** (`ereignis_besucher_zeit_idx`).
  Server leitet ab: Kanal, Gerät, Browser, Betriebssystem (User-Agent, iPadOS per Touch), Bildschirmklasse,
  Sprache der Website (Pfad), Browsersprache. **Land:** Proxy-Kopf (`cf-ipcountry`, `x-vercel-ip-country`,
  `x-country-code`, `cloudfront-viewer-country`) → `land_quelle = proxy`, sonst Region der Accept-Language
  (`de-CH` → CH) → `land_quelle = sprache` (Näherung, im Dashboard so beschriftet). Coolify/Traefik liefert keinen
  Länderkopf, live ist es also die Näherung. Besucher-ID = sha256(IP|UA|Tag|Secret) gekürzt, IP nie gespeichert,
  Referrer nur als Host, Pfade dekodiert, Bots (inkl. KI-Crawler, Headless), angemeldete Admins und
  DNT/Global-Privacy-Control verworfen, Rate-Limit. Migration `drizzle/0006_webseitenanalyse.sql` (idempotent,
  füllt Sitzung/Kanal/Sprache für alte Zeilen grob nach). Datenschutzerklärung (alle 9 Sprachen) nachgeführt. DLM-Pixel bleibt.

## Push-Benachrichtigungen (Admin-App)
- **Web Push (VAPID)** mit `web-push`. Schlüssel werden beim ersten Bedarf erzeugt und in der Tabelle
  `einstellung` (Schlüssel `vapid`) gespeichert — keine Env-Variable. Der Privatschlüssel verlässt den
  Server nie; Subject `mailto:store@thesartorialist.ch`. Wird die Zeile gelöscht, entstehen neue Schlüssel
  und alle Geräte müssen einmal neu aktivieren (die App macht das beim nächsten Öffnen von selbst).
- **Abos:** Tabelle `push_abo` (je Gerät, Endpoint unique, nur https). 404/410 vom Push-Dienst → Abo
  gelöscht; besteht das Abo im Gerät noch, meldet die App es beim nächsten Öffnen still nach.
  Endpunkte `/api/admin/push/` (GET Schlüssel + eigene Geräte, POST anmelden, DELETE abmelden) und
  `/api/admin/push/test/` — nur mit Admin-Sitzung + Origin-Prüfung.
- **Aktivierung:** Direkt nach der Anmeldung erscheint ein Bottom-Sheet «Benachrichtigungen aktivieren»,
  solange das Gerät kein Abo hat (Knopf nötig: iOS verlangt eine Nutzer-Geste für die Erlaubnis).
  «Später» gilt bis zur nächsten Anmeldung. Danach (nicht gleichzeitig) das Angebot «Face ID einrichten?».
  iPhone im Safari-Tab: Anleitung «Teilen → Zum Home-Bildschirm» (Web-Push gibt es auf iOS nur in der
  installierten App, ab iOS 16.4). Nach Erfolg sofort eine Test-Mitteilung. Verwaltung unter
  /admin/einstellungen (Karte «Benachrichtigungen»: Status, Aktivieren/Deaktivieren, Test, Geräte).
- **Auslöser:** jede neue Terminanfrage und Rückrufbitte aus `/api/anfrage` an alle Geräte aller aktiven
  Admins, nach der Antwort (`after()`), mit Timeout — blockiert die Anfrage nie. WhatsApp-/Anruf-Klicks
  aus dem Tracking werden bewusst nicht gepusht. Antippen öffnet `/admin/termine/<id>/`.
- **Service-Worker** (`public/admin/sw.js`, Scope /admin/): `push` zeigt die Mitteilung (Icon, Badge
  `public/admin/badge-96.png`, tag je Termin), `notificationclick` holt ein offenes Admin-Fenster nach vorne
  oder öffnet die Seite, `pushsubscriptionchange` meldet erneuerte Abos. Weiterhin kein Daten-Cache.
- **Datenschutz:** betrifft nur Admins, nicht die öffentliche Website. Gespeichert werden je Gerät nur die
  Push-Adresse des Browser-Herstellers (Apple/Google/Mozilla/Microsoft), deren Schlüssel und ein Gerätename.
  Die Mitteilung enthält nur Art und Name der anfragenden Person (verschlüsselt übertragen, der Push-Dienst
  kann den Inhalt nicht lesen); Telefon, E-Mail und Stil-Details stehen nur im Backend.

## Env-Variablen (Coolify)
| Variable | Zweck |
|---|---|
| `DATABASE_URL` | Postgres-Verbindung (nur hier, nie im Code) |
| (entfällt) | Admins stehen in der Tabelle `admin_user` (Migration 0001 legt store@thesartorialist.ch und s.nikolic@dlm-digital.ch an), Verwaltung unter /admin/einstellungen |
| `SESSION_SECRET` | ≥ 32 Zeichen, HMAC für Codes/Sitzungen (Pflicht in Produktion) |
| `TRACKING_SECRET` | Salz für die Besucher-ID (sonst SESSION_SECRET) |
| `WEBAUTHN_RP_ID` | `thesartorialist.ch` |
| `WEBAUTHN_ORIGIN` | `https://thesartorialist.ch` (kommagetrennt, z. B. plus `https://www.thesartorialist.ch`) |
| `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO` | Mailversand (bestehend) |

## Lokal
Postgres starten, `.env.local` mit lokaler `DATABASE_URL`, `npm run db:migrate`, `npm run db:seed`
(Demo-Daten, nur lokal; `-- --leeren` entfernt sie), `npm run dev`. Ohne Resend steht der Login-Code
in der API-Antwort und im Server-Log.

## Go-live
1. In Coolify eine Postgres-Ressource anlegen (oder bestehende), `DATABASE_URL` setzen — **neues
   Passwort**, das im Chat gepostete gilt als kompromittiert.
2. Env-Variablen oben setzen (`SESSION_SECRET`/`TRACKING_SECRET` z. B. `openssl rand -hex 32`).
3. Deployen — Migrationen laufen beim Start (Log: `[db] Migrationen: ok`).
4. /admin/login mit store@thesartorialist.ch oder s.nikolic@dlm-digital.ch aufrufen, Code aus der Mail, Face ID einrichten.
5. Testanfrage über /termin/ → erscheint unter Termine.

## Offen
- Formulare (BookingWizard, KontaktFab) senden noch keine Einwilligung WhatsApp/SMS, keine Firma und
  keine Marken-Domain — die API nimmt sie an, sobald die Formulare sie mitschicken (Checkbox mit Text).
- ~~Phase 2~~ erledigt (siehe unten).

# Phase 2: Angebot, Auftrag, Rechnung, Massblatt (06.11.2026)

## Gesamtprozess
1. **Anfrage** (Website-Termin/Rückruf, oder im Backend «Neuer Kontakt») → Kontakt mit Status **Lead**, Phase **neu**.
   Inaktive Kontakte und verlorene Leads kommen bei einer neuen Anfrage automatisch zurück in die Pipeline.
2. **Beratungstermin** bestätigen/vorschlagen (Termine oder direkt in der Kundenakte) → Phase **Termin vereinbart**.
3. **Angebot** aus der Kundenakte (optional «Angebot mit Stil» = Stil-Auswahl und Stoffnummer der Anfrage):
   Positionen aus der Preisliste (Massanzug, Sakko, Hose, Weste, Hemd, Smoking, Mantel, Änderungen,
   Stoffzuschlag …) oder frei, Menge, Preis inkl. MWST, Rabatt je Position und aufs Total (% oder CHF),
   Gültigkeit (eigener Kalender), Einleitung/Schluss aus den Firmeneinstellungen. Total auf 5 Rappen,
   MWST (8,1 %) wird herausgerechnet und ausgewiesen («inkl. MWST»).
4. **Versand**: Mail mit PDF (Logo) und **Annahme-Link** `/angebot/<token>/` (32 Byte Zufall, in der DB nur
   sha256, jeder neue Link ersetzt den alten; Seite noindex, eigenes Root-Layout ohne Tracking, Drosselung
   40 Aufrufe/10 Min. je IP, ohne gültigen Token keine Daten). Ohne E-Mail: «Link kopieren» bzw. WhatsApp.
   → Phase **Angebot offen**; erstes Öffnen landet im Verlauf («angesehen»).
5. **Annahme** online (vollständiger Name + Bestätigungsschalter) oder «im Atelier erfassen» →
   in einer Transaktion: Angebot angenommen, Kontakt **Kunde** (kunde_seit), **Auftrag AU-…** mit Positionen,
   Stil, aktivem Massblatt und 9 Standard-Aufgaben (Fälligkeit nach Produktionsdauer in Arbeitstagen).
   Kunde erhält eine Auftragsbestätigung, das Atelier eine Meldung mit Link zum Auftrag.
6. **Auftrag**: Statuskette Mass genommen → Stoff & Material bestellt → In Produktion (Liefertermin Pflicht,
   eigener Kalender) → Eingang im Atelier → Anprobe (Termin direkt mit eintragen) → Änderungen →
   Fertig · abholbereit (optional Mail an den Kunden) → Abgeholt → Abgeschlossen; Zeitstempel je Schritt.
   Planung: Liefertermin, Anlass + Datum (Warnung, wenn Liefertermin < 10 Tage vor dem Anlass),
   Abholung, Zuständig, Bestellnotiz; Termine Massnehmen/Anprobe/Abholung; Aufgaben mit Fälligkeit,
   Zuständig, Haken; Notizen und Verlauf. Übersicht als **Board**, **Zeitstrahl** (überfällig, diese/nächste
   Woche, Monate) und **Archiv**.
7. **Rechnung** aus dem Auftrag: Anzahlung (30/50/100 %, Standard aus Einstellungen) und Schlussrechnung
   (zieht Anzahlungen ab). Entwurf → festschreiben/senden (Mail mit PDF), Swiss **QR-Zahlteil** (swissqrbill),
   QR-Referenz bei QR-IBAN, sonst Creditor Reference (RF). Zahlungen (Bank/TWINT/Karte/Bar) → offen /
   teilbezahlt / bezahlt; überfällig = Fälligkeit vorbei. **Abgeholt + alle Rechnungen bezahlt → Auftrag
   automatisch abgeschlossen.**
8. Nummernkreise AN-/AU-/RE-JJJJ-0001 (Tabelle `nummernkreis`, atomar).

## Kundenakte (/admin/kontakte/<id>/)
Schnellaktionen (Anrufen, WhatsApp/SMS nur mit Einwilligung, E-Mail, Angebot, Massblatt, Termin eintragen),
Kennzahlen (Umsatz bezahlt, offen, laufende Aufträge, offene Angebote), Anfragen mit Stil-Auswahl und
Bestätigen/Vorschlagen direkt in der Akte, Termine, Angebote, Aufträge (Fortschritt), Rechnungen, Massblatt
(Kernmasse, Körperhaltung, Versionen), Verlauf; rechts Status (Lead/Kunde/Inaktiv, Pipeline, Potenzial),
Kontakt, Einwilligungen, Stammdaten inkl. Anrede und Adresse (für Rechnung/QR).
Listen: **Leads** (Pipeline-Board mit Potenzial), **Kunden** (Umsatz, offen, laufend), Alle Kontakte.

## Massblätter
Bereiche Allgemein, Sakko, Hose, Weste, Hemd, Mantel (`lib/crm/massblatt.ts`), grosse Zahlenfelder in cm,
Tab-Reihenfolge, Körperhaltung/Besonderheiten als Chips, Notizen, Zuordnung zu einem Auftrag. Jede Messung ist
eine Version (neue Messung übernimmt die Werte der aktuellen), Vergleich mit Differenz zur Vorversion, PDF.

## Termin-Erinnerung
`lib/crm/erinnerung.ts` + `lib/crm/scheduler.ts` (Start in `instrumentation.ts`, alle 5 Min., Advisory-Lock
727301): Termine mit Start in den nächsten X Stunden (Standard 2), bestätigt **und** noch unbestätigte
Wunschtermine (Status angefragt; «vorgeschlagen» nicht, dort gilt der Wunsch nicht mehr), Kontakt mit E-Mail,
nicht abgemeldet. Vor dem Versand wird `erinnerung_gesendet_am` gesetzt (idempotent), bei Fehler zurückgesetzt.
Neue Terminzeit setzt die Erinnerung zurück. Mail in der Kundensprache (alle 9 Sprachen), unbestätigt mit
Hinweis «wir melden uns ggf.». Ein-/ausschaltbar und Vorlauf unter Einstellungen; nur mit Resend.
`SCHEDULER_AUS=1` schaltet den Scheduler ab. Trockentest: `npx tsx scripts/erinnerung-probe.ts`.

## Einstellungen (DB, `firma_einstellung`)
Firma & Dokumente (Absender, Rechtsname, MWST-Pflicht/Satz/Nr., IBAN, QR-IBAN, Bank, Zahlungsfrist,
Angebotsgültigkeit, Anzahlung %, Produktionsdauer, Standardtexte), Preisliste (nur der veröffentlichte Ab-Preis
des Massanzugs ist vorbelegt, übrige Preise trägt das Atelier ein), Logo für PDFs (PNG/JPEG ≤ 1 MB, Typ aus den
Bytes geprüft; Standard: Wortmarke), Termin-Erinnerung.

## Technik
- Migration `0003_crm_phase2.sql` (idempotent). `0002` ist für die Push-Benachrichtigungen reserviert;
  der Journal-Zeitstempel von 0003 liegt bewusst später, damit 0002 nach dem Merge davor einsortiert ist.
- PDFs serverseitig mit PDFKit (Noto Sans/Serif aus `public/fonts/pdf`) + swissqrbill, ohne Schatten
  (`lib/pdf/dokument.ts`). `serverExternalPackages` + `outputFileTracingIncludes` für pdfkit im Standalone-Build.
- Marke: `public/images/marke/` (Monogramm und Wortmarke mit echtem Alphakanal, weiss/schwarz) — Seitenleiste,
  Login, Angebotsseite, PDFs.
- Eigene Steuerelemente: `Auswahl` (Panel mit Suche/Tastatur), `DatumPicker`, Segment-Control, Stepper,
  Haken — keine nativen select/date/time/checkbox.
- Tests: `scripts/test-ablauf.mjs <basis-url>` spielt den ganzen Prozess durch (36 Prüfungen),
  `scripts/pdf-probe.ts` erzeugt Probe-PDFs, `npm run db:seed` legt Demo-Angebote/-Aufträge/-Rechnungen/
  -Massblätter über den echten Ablauf an.

## Offen (Phase 3)
- Angebots-/Rechnungsmails und die Angebotsseite sind Deutsch (die Erinnerung ist mehrsprachig).
- Mahnwesen (Zahlungserinnerung bei überfälligen Rechnungen), Gutschriften/Teilstorno.
- Drag & Drop im Board (heute: Knopf «weiter» bzw. Statuskette im Auftrag).
- Rechnungen: Zahlungseingang per camt.054/Bank-Abgleich.
