'use client';
// Mac-App (desktop/, Tauri v2 mit WKWebView): dasselbe Backend im nativen Fenster.
// - Erkennung über window.__TAURI__ (nur in der App vorhanden; User-Agent trägt zusätzlich «Sartorialist-Mac/…»).
// - Mitteilungen: WKWebView kann kein Web Push. Solange die App läuft (auch nur in der Menüleiste), fragt sie jede Minute
//   /api/admin/mitteilungen/ ab (gleiche Texte wie der Push, lib/admin/push.ts) und zeigt neue Anfragen als macOS-Mitteilung
//   (Rust: mitteilung_zeigen). Klick öffnet /admin/termine/<id>/. Dock-Badge = Anzahl offener Anfragen.
// - Downloads (PDF von Rechnungen, Angeboten, Massblättern, Mahnungen): WKWebView zeigt PDFs sonst selbst an. Klicks auf
//   Download-Links werden abgefangen, die Datei landet in «Downloads» und wird im Finder gezeigt (Rust: datei_speichern).
// - Die Rust-Seite ruft window.__tsNavigieren(pfad) auf (Menü, Menüleisten-Symbol, Widget, Klick auf Mitteilungen).
// Die Klasse «mac-app» am <html> (Titelleiste, Sicherheitszone für die Ampel-Knöpfe) setzt die App selbst beim Laden.

type Invoke = <T>(befehl: string, args?: Record<string, unknown> | ArrayBuffer, optionen?: { headers?: Record<string, string> }) => Promise<T>;
type TauriFenster = Window & { __TAURI__?: { core?: { invoke: Invoke } }; __tsNavigieren?: (pfad: string) => void };

export const istMacApp = () => typeof window !== 'undefined' && !!(window as TauriFenster).__TAURI__?.core?.invoke;

/** Nativen Befehl der Mac-App aufrufen (desktop/src-tauri/src/lib.rs). Ausserhalb der App: nichts. */
export function nativ<T = void>(befehl: string, args?: Record<string, unknown>): Promise<T | undefined> {
  const inv = typeof window !== 'undefined' ? (window as TauriFenster).__TAURI__?.core?.invoke : undefined;
  return inv ? inv<T>(befehl, args).catch(() => undefined) : Promise.resolve(undefined);
}

const lies = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const schreib = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* egal */
  }
};

// ---------- Mitteilungen ----------
const MERKER_SEIT = 'ts:mac-seit';
const MERKER_GESEHEN = 'ts:mac-gesehen';
const TAKT_MS = 60_000;
type Antwort = { jetzt: string; offen: number; mitteilungen: { titel: string; text: string; url: string; tag?: string }[] };

let lauf = 0;

async function abholen(): Promise<'ok' | 'aus' | 'fehler'> {
  // 2 Min. Überlappung (Anfragen, die während der letzten Abfrage gespeichert wurden), doppelte über «gesehen» filtern
  const seit = lies(MERKER_SEIT);
  const ab = seit ? new Date(new Date(seit).getTime() - 120_000).toISOString() : new Date().toISOString();
  const r = await fetch(`/api/admin/mitteilungen/?seit=${encodeURIComponent(ab)}`, { credentials: 'same-origin', cache: 'no-store' });
  if (r.status === 401 || r.status === 403) return 'aus';
  if (!r.ok) return 'fehler';
  const d = (await r.json()) as Antwort;
  let gesehen: string[] = [];
  try {
    gesehen = JSON.parse(lies(MERKER_GESEHEN) ?? '[]');
  } catch {
    gesehen = [];
  }
  for (const m of d.mitteilungen) {
    const tag = m.tag ?? m.url;
    if (gesehen.includes(tag)) continue;
    gesehen.push(tag);
    await nativ('mitteilung_zeigen', { titel: m.titel, text: m.text, url: m.url });
  }
  schreib(MERKER_GESEHEN, JSON.stringify(gesehen.slice(-100)));
  schreib(MERKER_SEIT, d.jetzt);
  void nativ('badge_setzen', { anzahl: d.offen });
  return 'ok';
}

function abholenStarten() {
  const meins = ++lauf;
  void (async () => {
    let pause = 0;
    while (meins === lauf) {
      try {
        const e = await abholen();
        if (e === 'aus') {
          void nativ('badge_setzen', { anzahl: 0 });
          return;
        }
        pause = e === 'ok' ? TAKT_MS : Math.min(5 * TAKT_MS, (pause || TAKT_MS) * 2);
      } catch {
        pause = Math.min(5 * TAKT_MS, (pause || TAKT_MS) * 2); // offline: langsamer weiter versuchen
      }
      await new Promise((ok) => setTimeout(ok, pause));
    }
  })();
}

// ---------- Downloads ----------
/** Datei in «Downloads» speichern und im Finder zeigen. false = nicht in der App oder fehlgeschlagen. */
async function speichern(name: string, daten: ArrayBuffer): Promise<boolean> {
  const inv = (window as TauriFenster).__TAURI__?.core?.invoke;
  if (!inv) return false;
  return inv<string>('datei_speichern', daten, { headers: { 'x-name': encodeURIComponent(name) } }).then(
    () => true,
    () => false,
  );
}

const PDF_PFAD = /^\/api\/admin\/[\w-]+\/[\w-]+\/pdf\/?$/;

async function herunterladen(href: string, name?: string) {
  const r = await fetch(href, { credentials: 'same-origin' });
  if (!r.ok) throw new Error('Download fehlgeschlagen');
  const datei = name || /filename="([^"]+)"/i.exec(r.headers.get('content-disposition') ?? '')?.[1] || 'Dokument.pdf';
  return speichern(datei, await r.arrayBuffer());
}

/** Klicks auf Download-Links abfangen: <a download href="blob:…"> (Rechnung, Angebot) und PDF-Links im neuen Tab. */
function downloadsAbfangen(e: MouseEvent) {
  const a = (e.target as Element | null)?.closest?.('a');
  if (!a || e.defaultPrevented) return;
  const href = a.getAttribute('href') ?? '';
  let url: URL;
  try {
    url = new URL(href, location.href);
  } catch {
    return;
  }
  if (a.hasAttribute('download') && (url.protocol === 'blob:' || url.origin === location.origin)) {
    e.preventDefault();
    void herunterladen(url.href, a.getAttribute('download') || undefined).then((ok) => {
      if (!ok) window.open(url.href, '_blank');
    });
    return;
  }
  if (url.origin === location.origin && PDF_PFAD.test(url.pathname)) {
    e.preventDefault();
    url.searchParams.set('download', '1');
    void herunterladen(url.href).catch(() => window.open(href, '_blank'));
  }
}

/** Einmal im Backend-Rahmen (components/admin/Shell.tsx): Navigation für die Rust-Seite, Mitteilungen, Downloads. */
export function macAppEinrichten(navigieren: (pfad: string) => void): () => void {
  if (!istMacApp()) return () => {};
  document.documentElement.classList.add('mac-app');
  const w = window as TauriFenster;
  w.__tsNavigieren = (pfad: string) => {
    if (typeof pfad === 'string' && pfad.startsWith('/admin/') && !pfad.startsWith('//')) navigieren(pfad);
  };
  document.addEventListener('click', downloadsAbfangen, true);
  abholenStarten();
  void nativ('bereit'); // Rust: wartende Navigationen (Klick auf Mitteilung vor dem Laden) jetzt zustellen
  return () => {
    lauf++;
    document.removeEventListener('click', downloadsAbfangen, true);
    if (w.__tsNavigieren) delete w.__tsNavigieren;
  };
}
