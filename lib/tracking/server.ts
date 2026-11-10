// Cookieloses Tracking, Server-Teil: Bots verwerfen, Besucher-ID bilden, IP nie speichern.
// Dazu die reinen Zuordnungen (Kanal, Browser, Betriebssystem, Land, Sprache der Website) —
// ohne Datenbank, darum auch in Tests und im Testdaten-Skript nutzbar.
import { createHash } from 'node:crypto';

/** Was die Website melden darf. «ende» ist keine eigene Zeile, sondern trägt die Verweildauer nach. */
export const TYPEN = [
  'pageview',
  'click_tel',
  'click_whatsapp',
  'click_mail',
  'click_route',
  'cta',
  'form_submit',
  'konfig_start',
  'konfig_pdf',
  'konfig_termin',
  'shop_warenkorb',
  'shop_checkout',
  'anfrage_termin',
  'anfrage_rueckruf',
  'anfrage_konfig',
  'anfrage_ratgeber',
] as const;
export type EreignisTyp = (typeof TYPEN)[number];

const BOT =
  /bot\b|bot\/|crawl|spider|slurp|scrap|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|statuscake|preview|facebookexternalhit|whatsapp\/|telegram|discord|slack|skype|embedly|curl|wget|python|httpx|aiohttp|java\/|go-http|node-fetch|undici|axios|okhttp|httpclient|libwww|phantom|puppeteer|playwright|selenium|webdriver|cypress|chrome-lighthouse|bingpreview|google-inspectiontool|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic|perplexitybot|ccbot|bytespider|yandex|baidu|semrush|ahrefs|mj12|dotbot|petal|seznam|applebot|duckduck|qwant|ia_archiver/i;

export const istBot = (ua: string) => !ua || ua.length < 20 || BOT.test(ua);

export function geraet(ua: string, breite?: number, touch = false): 'mobil' | 'tablet' | 'desktop' {
  if (/iPad|Tablet|PlayBook|Silk|Kindle|SM-T\d|(Android(?!.*Mobile))/i.test(ua)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android|IEMobile|Windows Phone|Opera Mini/i.test(ua)) return 'mobil';
  // iPadOS meldet sich seit Version 13 als Mac — nur das Touch-Signal verrät es.
  if (/Macintosh/i.test(ua) && touch) return 'tablet';
  if (breite && breite < 700) return 'mobil';
  return 'desktop';
}

export function browserVon(ua: string): string {
  if (/Edg(e|A|iOS)?\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/SamsungBrowser\//.test(ua)) return 'Samsung Internet';
  if (/Instagram/.test(ua)) return 'Instagram (In-App)';
  if (/FBAN|FBAV/.test(ua)) return 'Facebook (In-App)';
  if (/Firefox\/|FxiOS\//.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari';
  if (/AppleWebKit/.test(ua) && /Mobile\//.test(ua)) return 'Safari';
  return 'Andere';
}

export function osVon(ua: string, touch = false): string {
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows';
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Macintosh|Mac OS X/.test(ua)) return touch ? 'iPadOS' : 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Andere';
}

export function bildschirmKlasse(breite: unknown): 's' | 'm' | 'l' | 'xl' | null {
  if (typeof breite !== 'number' || !Number.isFinite(breite) || breite <= 0) return null;
  if (breite < 576) return 's';
  if (breite < 992) return 'm';
  if (breite < 1440) return 'l';
  return 'xl';
}

/**
 * Land: zuerst ein Kopf des Proxys (Cloudflare, Vercel, CloudFront …), sonst die Region der ersten
 * Browsersprache («de-CH» → «CH»). Letzteres ist nur eine Näherung und wird als solche markiert —
 * eine Ortung über die IP-Adresse gibt es bewusst nicht.
 */
export function landVon(h: Headers): { land: string | null; quelle: 'proxy' | 'sprache' | null } {
  for (const k of ['cf-ipcountry', 'x-vercel-ip-country', 'x-country-code', 'cloudfront-viewer-country']) {
    const v = h.get(k)?.trim().toUpperCase();
    if (v && /^[A-Z]{2}$/.test(v) && v !== 'XX' && v !== 'T1') return { land: v, quelle: 'proxy' };
  }
  const erste = (h.get('accept-language') ?? '').split(',')[0]?.trim() ?? '';
  const m = erste.match(/^[a-z]{2,3}-([a-z]{2})\b/i);
  return m ? { land: m[1].toUpperCase(), quelle: 'sprache' } : { land: null, quelle: null };
}

/** Sprache der Website aus dem Pfad: Deutsch ohne Präfix, sonst /en/, /fr/, /pt-pt/ … */
const PRAEFIXE = ['en', 'fr', 'it', 'es', 'pt-pt', 'ru', 'sr', 'sq'];
export function seitenSprache(pfad: string): string {
  const erstes = pfad.split('/')[1]?.toLowerCase() ?? '';
  return PRAEFIXE.includes(erstes) ? erstes : 'de';
}

function geheim() {
  return process.env.TRACKING_SECRET || process.env.SESSION_SECRET || 'tracking-lokal';
}

/** sha256(IP|UA|Tag|Secret), gekürzt auf 16 Zeichen — wechselt täglich, nicht rückrechenbar. */
export function besucherId(ip: string, ua: string, jetzt = new Date()) {
  const tag = jetzt.toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });
  return createHash('sha256').update(`${ip}|${ua}|${tag}|${geheim()}`).digest('hex').slice(0, 16);
}

/** Pfad bereinigen: ohne Query/Hash, dekodiert (kyrillische Slugs lesbar), nur intern, Admin/API nie. */
export function pfadOk(p: unknown): string | null {
  if (typeof p !== 'string' || !p.startsWith('/') || p.startsWith('//')) return null;
  let s = p.split(/[?#]/)[0];
  try {
    s = decodeURIComponent(s);
  } catch {
    /* kaputte Kodierung: so lassen */
  }
  s = s.replace(/[\u0000-\u001f\u007f]+/g, '').slice(0, 200);
  if (/^\/(admin|api|angebot)(\/|$)/.test(s)) return null;
  return s;
}

/** Referrer nur als Host (ohne Pfad), eigene Domain verworfen. */
export function referrerHost(r: unknown, eigenerHost: string | null): string | null {
  if (typeof r !== 'string' || !r) return null;
  try {
    const u = new URL(r);
    // android-app://com.google.android.googlequicksearchbox/ → Paketname
    const h = (u.hostname || u.host).replace(/^www\d?\./, '').replace(/^(m|l|lm)\.(?=facebook\.com$)/, '').toLowerCase();
    const eigen = (eigenerHost ?? '').split(':')[0].replace(/^www\./, '').toLowerCase();
    if (!h || h === eigen || h === 'localhost' || h === 'thesartorialist.ch' || h.endsWith('.thesartorialist.ch')) return null;
    return h.slice(0, 120);
  } catch {
    return null;
  }
}

export const kurz = (v: unknown, max = 80) => (typeof v === 'string' && v.trim() ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max) : null);

/** Kennung aus dem Browser (Aufruf-ID): nur Buchstaben/Ziffern, 8–32 Zeichen. */
export const kennung = (v: unknown) => (typeof v === 'string' && /^[a-z0-9]{8,32}$/i.test(v) ? v : null);

/* ---------- Kanal ---------- */

export const KANAELE = ['google_ads', 'werbung', 'google_seo', 'suchmaschinen', 'ki', 'social', 'email', 'kampagne', 'verweis', 'direkt'] as const;
export type Kanal = (typeof KANAELE)[number];

export const KANAL_LABEL: Record<Kanal, string> = {
  google_ads: 'Google Ads',
  werbung: 'Andere Werbung',
  google_seo: 'Google (organisch)',
  suchmaschinen: 'Andere Suchmaschinen',
  ki: 'KI-Assistenten',
  social: 'Social Media',
  email: 'E-Mail / Newsletter',
  kampagne: 'Andere Kampagnen',
  verweis: 'Verweise',
  direkt: 'Direkt',
};

const aufDomain = (host: string, d: string) => host === d || host.endsWith(`.${d}`);
const inListe = (host: string, liste: readonly string[]) => liste.some((d) => aufDomain(host, d));

const KI = ['chatgpt.com', 'chat.openai.com', 'openai.com', 'perplexity.ai', 'claude.ai', 'gemini.google.com', 'bard.google.com', 'copilot.microsoft.com', 'you.com', 'phind.com', 'poe.com', 'deepseek.com', 'chat.mistral.ai', 'meta.ai', 'grok.com'];
const KI_QUELLEN = ['chatgpt', 'openai', 'perplexity', 'claude', 'gemini', 'copilot', 'deepseek', 'mistral', 'grok', 'phind'];
const SUCHMASCHINEN = ['bing.com', 'duckduckgo.com', 'yahoo.com', 'ecosia.org', 'search.ch', 'startpage.com', 'search.brave.com', 'qwant.com', 'yandex.ru', 'yandex.com', 'baidu.com', 'kagi.com', 'swisscows.ch', 'web.de', 't-online.de'];
const SOCIAL = ['facebook.com', 'fb.com', 'instagram.com', 'linkedin.com', 'lnkd.in', 'x.com', 'twitter.com', 't.co', 'youtube.com', 'youtu.be', 'tiktok.com', 'pinterest.com', 'pinterest.ch', 'reddit.com', 'xing.com', 'threads.net', 'whatsapp.com', 'wa.me', 't.me', 'snapchat.com'];
const WEBMAIL = ['mail.google.com', 'outlook.live.com', 'outlook.office.com', 'outlook.office365.com', 'mail.yahoo.com', 'gmx.ch', 'gmx.net', 'bluewin.ch', 'mail.proton.me', 'icloud.com'];
const BEZAHLT = /^(cpc|ppc|cpm|cpv|cpa|paid|paidsearch|paid[_-]search|paid[_-]social|paidsocial|sem|display|banner|ads?)$/i;
const MEDIUM_EMAIL = /^(e-?mail|newsletter|mailing)$/i;
const MEDIUM_SOCIAL = /^(social|social[_-]?media|sm|organic[_-]social)$/i;

function istGoogleSuche(host: string) {
  if (host === 'com.google.android.googlequicksearchbox') return true;
  if (inListe(host, ['mail.google.com', 'gemini.google.com', 'bard.google.com', 'ads.google.com', 'docs.google.com', 'drive.google.com'])) return false;
  return /(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host);
}

/**
 * Kanal eines Besuchs (wie Karo): Google-Klickkennung → Ads; bezahltes utm_medium → Ads/Werbung;
 * KI vor Google (sonst wäre Gemini «organisch»); utm_medium E-Mail/Social; Referrer; utm_source ohne
 * Referrer → Kampagne (Flyer, QR-Code); sonst direkt.
 */
export function kanalVon(e: { referrer?: string | null; utmSource?: string | null; utmMedium?: string | null; gclid?: boolean }): Kanal {
  const quelle = (e.utmSource ?? '').trim().toLowerCase();
  const medium = (e.utmMedium ?? '').trim().toLowerCase();
  const ref = e.referrer ?? null;
  if (e.gclid) return 'google_ads';
  if (medium && BEZAHLT.test(medium)) return /google|adwords|gads/.test(quelle) || (!quelle && ref && istGoogleSuche(ref)) ? 'google_ads' : 'werbung';
  if (quelle && KI_QUELLEN.some((k) => quelle.includes(k))) return 'ki';
  if (ref && inListe(ref, KI)) return 'ki';
  if (medium && MEDIUM_EMAIL.test(medium)) return 'email';
  if (medium && MEDIUM_SOCIAL.test(medium)) return 'social';
  if (ref) {
    if (istGoogleSuche(ref)) return 'google_seo';
    if (inListe(ref, SUCHMASCHINEN)) return 'suchmaschinen';
    if (inListe(ref, SOCIAL)) return 'social';
    if (inListe(ref, WEBMAIL)) return 'email';
    return 'verweis';
  }
  if (quelle) {
    if (/google/.test(quelle)) return 'google_seo';
    if (/facebook|instagram|linkedin|tiktok|youtube|twitter|xing|pinterest/.test(quelle)) return 'social';
    if (/newsletter|mail/.test(quelle)) return 'email';
    return 'kampagne';
  }
  return 'direkt';
}
