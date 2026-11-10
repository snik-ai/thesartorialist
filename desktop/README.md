# The Sartorialist – Mac-App (Admin-Backend)

Das Backend (`https://thesartorialist.ch/admin/`) als eigene Mac-App: Tauri v2 mit WKWebView, dieselbe Web-App im nativen
Fenster, dazu Menüleiste, Mitteilungen, Dock-Badge und ein Schreibtisch-Widget. Vorbild ist die VoxCRM-Mac-App.
Entscheid und Grenzen: `docs/decisions/2026-11-10-mac-app.md`.

## Installation (für das Atelier)

1. `TheSartorialist-Mac-App-universal.dmg` öffnen (läuft auf Apple Silicon und Intel, ab macOS 12).
2. «The Sartorialist» in den Ordner «Programme» ziehen.
3. **Erster Start (Gatekeeper):** Die App ist nur ad-hoc signiert (ohne Apple-Developer-Konto). macOS meldet darum
   «kann nicht geöffnet werden» bzw. «Entwickler nicht verifiziert». Einmalig so öffnen:
   - im Finder unter «Programme» **Rechtsklick auf die App → Öffnen → Öffnen**, oder (neuere macOS-Versionen)
     **Systemeinstellungen → Datenschutz & Sicherheit → «Dennoch öffnen»**, oder im Terminal:
   - `xattr -dr com.apple.quarantine "/Applications/The Sartorialist.app"`
4. Mit der Atelier-E-Mail anmelden, 6-stelligen Code aus der Mail eingeben. Die Sitzung bleibt erhalten (14 Tage).
5. Mitteilungen erlauben, wenn macOS fragt (Systemeinstellungen → Mitteilungen → The Sartorialist).

**Face ID / Passkey geht in der Mac-App nicht** (siehe unten) – in der App immer mit E-Mail-Code anmelden.
Im Browser und auf dem iPhone funktioniert Face ID weiterhin.

## Was die App kann

- **Fenster** mit transparenter Titelleiste; die Ampel-Knöpfe liegen über der dunklen Seitenleiste in einer festen
  40-px-Zone (`app/admin/mac-app.css`, greift nur mit `html.mac-app`). Fensterzustand wird gemerkt.
- **Menüleiste:** The Sartorialist (Einstellungen ⌘, · Bei der Anmeldung starten), Ablage (Neues Angebot ⌘N,
  Neues Massblatt ⌘⇧M), Bearbeiten, Darstellung (Zurück ⌘[ · Vorwärts ⌘] · Übersicht ⌘1 · Termine ⌘2 · Leads ⌘3 ·
  Kunden ⌘4 · Angebote ⌘5 · Aufträge ⌘6 · Rechnungen ⌘7 · Reichweite ⌘8 · Alle Kontakte · Massblätter · Produkte ·
  Neu laden ⌘R · Zoom ⌘+ ⌘− ⌘0 · Vollbild), Fenster (Widget ein/aus, Hauptfenster ⌥⌘0), Hilfe.
- **Menüleisten-Symbol** (Monogramm) mit Schnellaktionen: öffnen, Übersicht, Termine, Aufträge, Rechnungen,
  Neues Angebot, Widget, Autostart, Beenden.
- **Fenster schliessen = App läuft weiter** (Menüleiste, Mitteilungen). Beenden mit ⌘Q. Klick aufs Dock-Symbol holt das
  Fenster zurück. Mit «Bei der Anmeldung starten» startet die App still im Hintergrund (nur Widget und Menüleiste).
- **Mitteilungen:** jede Minute fragt die App `/api/admin/mitteilungen/` ab (nur mit Sitzung) und zeigt neue
  Terminanfragen und Rückrufbitten als macOS-Mitteilung – gleicher Text wie der Web-Push. Klick öffnet
  `/admin/termine/<id>/`. **Dock-Badge** = Anzahl offener Anfragen.
- **Downloads:** PDFs (Rechnung, Angebot, Massblatt, Mahnung) landen in «Downloads» und werden im Finder gezeigt.
- **Externe Links** (öffentliche Website, Google Maps, WhatsApp …) öffnen im Standardbrowser; `mailto:`/`tel:` im
  passenden Programm.
- **Schreibtisch-Widget:** kleines, abgerundetes Fenster auf Schreibtisch-Ebene (unter allen Fenstern, auf allen Spaces,
  verschiebbar, Position gemerkt). Zeigt Termine heute/nächster Termin, offene Anfragen/Rückrufe, offene und überfällige
  Rechnungen (CHF), laufende Aufträge mit nächster Lieferung und Besucher heute/jetzt. Aktualisiert sich alle 90 s.
  Klick auf einen Eintrag öffnet die Seite im Hauptfenster. Ein-/ausblenden über «Fenster» oder das Menüleisten-Symbol.
  Daten: `/api/admin/widget/` (nur Kennzahlen, nur mit Sitzung), Seite `/admin/widget/`.

## Entwicklung

Voraussetzungen: Rust (rustup), Xcode Command Line Tools, Node.

```bash
# im Projekt: Backend lokal (Postgres + .env.local, siehe docs/decisions/2026-11-06-backend-crm.md)
npm run dev                     # http://localhost:3000

# Mac-App gegen das lokale Backend
cd desktop
npm install
npm run dev                     # TS_APP_URL=http://localhost:3000/admin/ (überschreibbar)
```

- Adresse: zur Laufzeit `TS_APP_URL`, sonst beim Bauen festgelegt (`npm run build:lokal`), sonst Produktion.
- Rechte (IPC) bekommt nur die Produktionsadresse (`src-tauri/capabilities/default.json`); localhost nur in Debug-Builds
  bzw. `build:lokal`.
- Icons neu erzeugen (aus `public/images/marke/monogramm-*.png`): `npm run icons`.
- Prüf-Modus (nie ausliefern): `cargo build --features pruefen` in `src-tauri/`, dann mit `TS_PRUEFORDNER=<ordner>`
  starten. Eine Datei `auftrag.js` dort wird im Fenster ausgeführt (`// fenster widget`, `// aktion gehe:/admin/leads/`,
  `// warten 2000`), danach entstehen `bild.tiff` (Schnappschuss der WebView), `ampel.json` (Lage der Fensterknöpfe,
  Fensterebene) und `menue.json` (Menüleiste). So lässt sich ohne Bildschirmaufnahme-Rechte prüfen.

## Release

```bash
cd desktop
npm run build:universal         # Apple Silicon + Intel → release/TheSartorialist-Mac-App-universal.dmg
npm run build                   # nur aktuelle Architektur → release/TheSartorialist-Mac-App-apple-silicon.dmg
```

Für `build:universal` einmalig `rustup target add x86_64-apple-darwin`. Falls Homebrew-Rust vor rustup im `PATH` steht,
den rustup-Toolchain-Ordner voranstellen (`export PATH="$(dirname "$(rustup which cargo)"):$PATH"`).
Die App ist ad-hoc signiert (`signingIdentity: "-"`, Hardened Runtime) und nicht notarisiert. Mit einem Apple-Developer-Konto:
`APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` setzen, `signingIdentity` entfernen – Tauri signiert
und notarisiert dann selbst (kein Gatekeeper-Hinweis mehr). `release/` ist nicht im Repo.

## Grenzen

- **Passkey/Face ID:** WKWebView in einer fremden App erlaubt WebAuthn nur mit Associated Domains
  (`webcredentials:thesartorialist.ch` + `apple-app-site-association` auf der Domain) – eine eingeschränkte Berechtigung, die
  ein Apple-Developer-Team mit Provisioning-Profil braucht. In der ad-hoc-signierten App meldet WebKit «kein Plattform-
  Authentifikator» (`isUserVerifyingPlatformAuthenticatorAvailable() = false`). Die Anmeldeseite blendet den Face-ID-Knopf in
  der App darum aus; Anmeldung mit E-Mail-Code.
- **Web-Push** gibt es im WKWebView nicht – ersetzt durch die minütliche Abfrage (nur solange die App läuft).
- **Echtes macOS-Widget (WidgetKit)** ist nicht gebaut, siehe Entscheid.
