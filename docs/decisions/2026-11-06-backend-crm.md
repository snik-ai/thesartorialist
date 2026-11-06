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
  Phase 2 nur Datenmodell: `angebot`, `auftrag`, `rechnung`, `massblatt` (Seiten zeigen «folgt»).
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
- **Dashboard «Reichweite & Anfragen»:** eigenes SVG (Besucher-Fläche + Vorperiode, darunter
  Bahnen für Anrufe/WhatsApp/E-Mail/Rückrufe/Terminanfragen), KPIs mit Vergleich, Conversion-Rate,
  Top-Seiten, Herkunft (Referrer/UTM), Geräte, Kampagnen, Zeitraum 7/30/90 Tage.
- **Tracking (cookielos):** Inline-Skript (`lib/tracking/skript.ts`) → `POST /api/t/` (sendBeacon):
  pageview (inkl. Client-Navigation), click_tel/whatsapp/mail/route, cta (`data-track`), form_submit.
  Besucher-ID = sha256(IP|UA|Tag|Secret) gekürzt, IP nie gespeichert, Referrer nur als Host, Bots
  und angemeldete Admins verworfen, Rate-Limit. Datenschutzerklärung ergänzt. DLM-Pixel bleibt.

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
- Phase 2: Angebote, Aufträge, Rechnungen, Massblätter ausbauen.
