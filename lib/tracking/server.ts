// Cookieloses Tracking, Server-Teil: Bots verwerfen, Besucher-ID bilden, IP nie speichern.
import { createHash } from 'node:crypto';

export const TYPEN = ['pageview', 'click_tel', 'click_whatsapp', 'click_mail', 'click_route', 'cta', 'form_submit'] as const;
export type EreignisTyp = (typeof TYPEN)[number];

const BOT =
  /bot|crawl|spider|slurp|scrape|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|preview|facebookexternalhit|whatsapp|telegram|discord|slack|skype|embedly|curl|wget|python|java\/|go-http|node-fetch|axios|okhttp|httpclient|phantom|puppeteer|playwright|selenium|chrome-lighthouse|bingpreview|yandex|baidu|semrush|ahrefs|mj12|dotbot|petal|seznam|applebot|duckduck|qwant|ia_archiver/i;

export const istBot = (ua: string) => !ua || ua.length < 20 || BOT.test(ua);

export function geraet(ua: string, breite?: number): 'mobil' | 'tablet' | 'desktop' {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(ua)) return 'mobil';
  if (breite && breite < 700) return 'mobil';
  return 'desktop';
}

function geheim() {
  return process.env.TRACKING_SECRET || process.env.SESSION_SECRET || 'tracking-lokal';
}

/** sha256(IP|UA|Tag|Secret), gekürzt auf 16 Zeichen — wechselt täglich, nicht rückrechenbar. */
export function besucherId(ip: string, ua: string, jetzt = new Date()) {
  const tag = jetzt.toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });
  return createHash('sha256').update(`${ip}|${ua}|${tag}|${geheim()}`).digest('hex').slice(0, 16);
}

/** Pfad bereinigen: ohne Query/Hash, nur intern, Admin/API nie. */
export function pfadOk(p: unknown): string | null {
  if (typeof p !== 'string' || !p.startsWith('/') || p.startsWith('//')) return null;
  const s = p.split(/[?#]/)[0].slice(0, 200);
  if (/^\/(admin|api)(\/|$)/.test(s)) return null;
  return s;
}

/** Referrer nur als Host (ohne Pfad), eigene Domain verworfen. */
export function referrerHost(r: unknown, eigenerHost: string | null): string | null {
  if (typeof r !== 'string' || !r) return null;
  try {
    const h = new URL(r).hostname.replace(/^www\./, '').toLowerCase();
    const eigen = (eigenerHost ?? '').split(':')[0].replace(/^www\./, '').toLowerCase();
    if (!h || h === eigen || h === 'localhost') return null;
    return h.slice(0, 120);
  } catch {
    return null;
  }
}

export const kurz = (v: unknown, max = 80) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
