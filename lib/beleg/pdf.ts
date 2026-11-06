// HTML → PDF mit puppeteer-core und einem vorhandenen Chrome (wie VoxCRM apps/api/src/lib/pdf.ts, vereinfacht).
// Ein Browser bleibt offen; pro PDF eine neue Seite. Der Fuss (Firma, Bank, «Seite x von y») kommt als footerTemplate in
// den unteren Rand; der Swiss-QR-Zahlteil wird ohne Fuss gerendert (SIX: unten frei) und mit pdf-lib angehängt.
// Ohne Chrome (CHROME_PATH bzw. bekannte Pfade) wirft htmlZuPdf «KeinChrome» – die Aufrufer fallen dann auf PDFKit zurück.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Browser } from 'puppeteer-core';

export class KeinChrome extends Error {}

const KANDIDATEN = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/nix/var/nix/profiles/default/bin/chromium',
  '/root/.nix-profile/bin/chromium',
];

export function chromePfad(): string | null {
  const env = process.env.CHROME_PATH?.trim();
  if (env && existsSync(env)) return env;
  const k = KANDIDATEN.find((p) => existsSync(p));
  if (k) return k;
  for (const ordner of (process.env.PATH ?? '').split(':')) {
    for (const name of ['chromium', 'chromium-browser', 'google-chrome']) {
      const p = path.join(ordner, name);
      if (ordner && existsSync(p)) return p;
    }
  }
  return null;
}

let browser: Browser | null = null;
let startet: Promise<Browser> | null = null;

async function holeBrowser(): Promise<Browser> {
  if (browser?.connected) return browser;
  if (startet) return startet;
  const pfad = chromePfad();
  if (!pfad) throw new KeinChrome('Auf dem Server ist kein Chrome/Chromium installiert (CHROME_PATH).');
  startet = (async () => {
    const puppeteer = (await import('puppeteer-core')).default;
    const b = await puppeteer.launch({
      executablePath: pfad,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--font-render-hinting=none'],
    });
    b.on('disconnected', () => {
      if (browser === b) browser = null;
    });
    browser = b;
    return b;
  })().finally(() => {
    startet = null;
  });
  return startet;
}

async function rendere(html: string, fuss: string | null): Promise<Buffer> {
  const b = await holeBrowser();
  const page = await b.newPage();
  try {
    // Keine Netzwerkzugriffe aus der Vorlage (Logo und Schriften sind eingebettet)
    await page.setRequestInterception(true);
    page.on('request', (r) => (r.url().startsWith('data:') || r.url() === 'about:blank' ? r.continue() : r.abort()));
    await page.setContent(html, { waitUntil: 'load', timeout: 20_000 });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: Boolean(fuss),
      headerTemplate: '<span></span>',
      footerTemplate: fuss ?? '<span></span>',
    });
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => {});
  }
}

/** Rendert ein HTML-Dokument (lib/beleg/vorlage.ts dokumentHtml) als A4-PDF. */
export async function htmlZuPdf(html: string, fuss: string | null): Promise<Buffer> {
  const mitQr = html.includes('class="bl-qr-seite"');
  if (!mitQr) return rendere(html, fuss);
  const ohne = html.replace('</head>', '<style>.bl-qr-seite{display:none!important}</style></head>');
  const nur = html.replace(
    '</head>',
    '<style>body.bl>*:not(.bl-qr-seite){display:none!important}body.bl{padding:0!important;margin:0!important;border:0!important}.bl-qr-seite{margin-left:0!important;margin-top:0!important;border:0!important;break-before:auto!important}</style></head>',
  );
  const [dok, qr] = await Promise.all([rendere(ohne, fuss), rendere(nur, null)]);
  const { PDFDocument } = await import('pdf-lib');
  const ziel = await PDFDocument.load(dok);
  const quelle = await PDFDocument.load(qr);
  const seiten = await ziel.copyPages(quelle, [0]);
  for (const s of seiten) ziel.addPage(s);
  return Buffer.from(await ziel.save());
}

/* ---------- Eingebettete Dateien (Schriften, Standard-Logo) ---------- */

function datei(...teile: string[]) {
  const k = [path.join(process.cwd(), 'public', ...teile), path.join(process.cwd(), '.next', 'standalone', 'public', ...teile)];
  return k.find((p) => existsSync(p)) ?? null;
}
const cache = new Map<string, string>();
function dataUri(rel: string[], typ: string): string | null {
  const key = rel.join('/');
  if (cache.has(key)) return cache.get(key)!;
  const p = datei(...rel);
  if (!p) return null;
  const uri = `data:${typ};base64,${readFileSync(p).toString('base64')}`;
  cache.set(key, uri);
  return uri;
}

/** @font-face mit eingebetteten Schriften (gleiche Dateien wie im Editor: /fonts/pdf/Inter.ttf, PlayfairDisplay.ttf) */
export function schriftenEingebettet() {
  const sans = dataUri(['fonts', 'pdf', 'Inter.ttf'], 'font/ttf');
  const serif = dataUri(['fonts', 'pdf', 'PlayfairDisplay.ttf'], 'font/ttf');
  return `@font-face{font-family:"BL Sans";src:url(${sans ?? '/fonts/pdf/Inter.ttf'}) format("truetype");font-weight:100 900}
@font-face{font-family:"BL Serif";src:url(${serif ?? '/fonts/pdf/PlayfairDisplay.ttf'}) format("truetype");font-weight:400 900}`;
}

export const STANDARD_LOGO = '/images/marke/wortmarke-schwarz.png';
export const standardLogoEingebettet = () => dataUri(['images', 'marke', 'wortmarke-schwarz.png'], 'image/png');
