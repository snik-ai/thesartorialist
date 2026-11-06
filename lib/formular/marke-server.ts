// Firmenerkennung (Server): liest von der Startseite einer Domain den Namen und das beste Icon (apple-touch-icon, grosse
// PNG/SVG-Icons, sonst /favicon.ico). Ausgeliefert über /api/marke/ und /api/marke/logo/, damit der Browser der Besucherin
// keinen Drittdienst (z. B. einen Favicon-Dienst von Google) mit ihrer Eingabe anfragt. Portiert aus VoxCRM apps/website.
//
// Sicherheit (SSRF): nur http/https auf Port 80/443, keine IP-Adressen als Ziel. Jede DNS-Auflösung läuft durch
// `sichererLookup`, das private, lokale und reservierte Adressen ablehnt – auch bei jeder Weiterleitung, weil die Prüfung
// im Socket-Lookup selbst sitzt (schützt gegen DNS-Rebinding). Höchstens 4 Weiterleitungen, Zeitlimits, Grössenlimits,
// Bildtyp aus den Bytes. Bewusst ohne Importe aus lib/ (Tests mit node --experimental-strip-types).
import http from "node:http";
import https from "node:https";
import dns from "node:dns";
import net from "node:net";

const MAX_HTML = 600_000;
const MAX_ICON = 300_000;
const UA = "Mozilla/5.0 (compatible; TheSartorialist-Firmenerkennung/1.0; +https://thesartorialist.ch/)";
const TTL_MS = 24 * 3600_000;
const CACHE_MAX = 500;

export class MarkeFehler extends Error {}

// ─── Adressprüfung ─────────────────────────────────────────────────────────────

function privatV4(ip: string): boolean {
  const [a = 0, b = 0] = ip.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19));
}

/** Private, lokale, Link-lokale, Multicast- und Dokumentationsadressen (IPv4 und IPv6, auch IPv4-in-IPv6). */
export function istPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return privatV4(ip);
  const v6 = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (!net.isIPv6(v6)) return true;
  if (v6 === "::" || v6 === "::1") return true;
  const gemappt = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/) ?? v6.match(/^::(\d+\.\d+\.\d+\.\d+)$/);
  if (gemappt) return privatV4(gemappt[1]!);
  if (/^::ffff:[0-9a-f]{1,4}:[0-9a-f]{1,4}$/.test(v6)) return true; // ::ffff:7f00:1 usw.
  return /^(fc|fd|fe[89ab]|ff)/.test(v6) || v6.startsWith("64:ff9b:") || v6.startsWith("2001:db8") || v6.startsWith("2002:") || v6.startsWith("100::");
}

type Lookup = NonNullable<http.RequestOptions["lookup"]>;
/** DNS-Auflösung, die nur öffentliche Adressen zurückgibt; sonst Fehler (bei jedem Verbindungsaufbau, auch nach Weiterleitungen). */
export const sichererLookup: Lookup = ((hostname: string, options: dns.LookupOptions, callback: (...a: unknown[]) => void) => {
  dns.lookup(hostname, { ...options, all: true }, (err, adressen) => {
    if (err) return callback(err);
    const liste = adressen as dns.LookupAddress[];
    if (!liste.length || liste.some((a) => istPrivateIp(a.address))) return callback(new MarkeFehler("Adresse nicht erlaubt"));
    if (options?.all) return callback(null, liste);
    callback(null, liste[0]!.address, liste[0]!.family);
  });
}) as unknown as Lookup;

/** Darf diese Adresse überhaupt angefragt werden? (vor der DNS-Prüfung) */
export function zielErlaubt(u: URL): boolean {
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  if (u.port && u.port !== "80" && u.port !== "443") return false;
  if (u.username || u.password) return false;
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host) || !host.includes(".") || /\.(local|localhost|internal|lan|home|corp|test|invalid)$/i.test(host) || /^localhost$/i.test(host)) return false;
  return true;
}

// ─── HTTP ──────────────────────────────────────────────────────────────────────

export interface Abruf { status: number; url: string; typ: string; daten: Buffer }

function einmal(ziel: URL, zeitMs: number, max: number, accept: string): Promise<Abruf & { weiter: string | null }> {
  return new Promise((resolve, reject) => {
    if (!zielErlaubt(ziel)) return reject(new MarkeFehler("Ziel nicht erlaubt"));
    const lib = ziel.protocol === "https:" ? https : http;
    const req = lib.request(ziel, {
      method: "GET", lookup: sichererLookup, timeout: zeitMs,
      headers: { "user-agent": UA, accept, "accept-encoding": "identity", "accept-language": "de-CH,de;q=0.9,en;q=0.5" },
    }, (res) => {
      const teile: Buffer[] = [];
      let groesse = 0;
      let fertig = false;
      const ende = () => {
        if (fertig) return;
        fertig = true;
        const loc = res.headers.location;
        resolve({ status: res.statusCode ?? 0, url: ziel.toString(), typ: String(res.headers["content-type"] ?? ""), daten: Buffer.concat(teile), weiter: typeof loc === "string" ? loc : null });
      };
      res.on("data", (c: Buffer) => {
        groesse += c.length;
        if (groesse > max) { teile.push(c.subarray(0, Math.max(0, max - (groesse - c.length)))); res.destroy(); ende(); return; }
        teile.push(c);
      });
      res.on("end", ende);
      res.on("close", ende);
      res.on("error", reject);
    });
    // Gesamtfrist zusätzlich zum Socket-Timeout (langsam tröpfelnde Antworten)
    const frist = setTimeout(() => req.destroy(new MarkeFehler("Zeitüberschreitung")), zeitMs);
    req.on("close", () => clearTimeout(frist));
    req.on("timeout", () => req.destroy(new MarkeFehler("Zeitüberschreitung")));
    req.on("error", reject);
    req.end();
  });
}

/** GET mit höchstens 4 Weiterleitungen; jede Station wird erneut geprüft (Schema, Port, IP, DNS). */
export async function holen(start: URL, zeitMs: number, max: number, accept = "text/html,*/*;q=0.5"): Promise<Abruf> {
  let url = start;
  for (let i = 0; i <= 4; i++) {
    const r = await einmal(url, zeitMs, max, accept);
    if (r.status >= 300 && r.status < 400 && r.weiter) { url = new URL(r.weiter, url); continue; }
    return r;
  }
  throw new MarkeFehler("Zu viele Weiterleitungen");
}

// ─── HTML lesen ────────────────────────────────────────────────────────────────

function entschluesseln(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Math.min(Number(n), 0x10ffff)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(Math.min(parseInt(n, 16), 0x10ffff)))
    .replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

const attribut = (tag: string, a: string) => {
  const m = tag.match(new RegExp(`\\s${a}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? entschluesseln(m[1] ?? m[2] ?? m[3] ?? "") : null;
};

function meta(html: string, key: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const k = (attribut(tag, "property") ?? attribut(tag, "name") ?? "").toLowerCase();
    if (k === key) return attribut(tag, "content");
  }
  return null;
}

const buchstaben = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
/** Allgemeine Titel-Teile, die kein Firmenname sind. */
const ALLGEMEIN = /^(home|startseite|start|willkommen|welcome|accueil|bienvenue|benvenuti|homepage|index|page d'accueil|pagina iniziale)$/i;

/** Wie nennt sich die Site selbst? og:site_name, application-name, sonst der passendste Titel-Teil. Höchstens 60 Zeichen. */
export function nameAus(html: string, domain: string): string | null {
  const sauber = (s: string | null | undefined) => {
    const v = s?.replace(/\s+/g, " ").trim();
    return v && v.length >= 2 && v.length <= 60 && !ALLGEMEIN.test(v) && !/^https?:\/\//i.test(v) ? v : null;
  };
  const direkt = sauber(meta(html, "og:site_name")) ?? sauber(meta(html, "application-name")) ?? sauber(meta(html, "apple-mobile-web-app-title"));
  if (direkt) return direkt;
  const titel = entschluesseln(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  if (!titel) return null;
  const teile = titel.split(/\s+[|–—·•:-]\s+|\s*\|\s*/).map((p) => p.trim()).filter((p) => p && !ALLGEMEIN.test(p));
  const etikett = buchstaben(domain.split(".")[0] ?? "");
  const treffer = teile.find((p) => { const l = buchstaben(p); return l.length >= 3 && (etikett.includes(l) || l.includes(etikett)); });
  if (treffer) return sauber(treffer);
  if (teile.length > 1) return sauber(teile[teile.length - 1]);
  return sauber(titel.length <= 40 ? titel : null);
}

/** Icon-Kandidaten, bestes zuerst (höchstens 6). */
export function iconsAus(html: string, basis: URL): string[] {
  const gefunden: { href: string; wert: number }[] = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = (attribut(tag, "rel") ?? "").toLowerCase();
    if (!/\bicon\b|apple-touch-icon/.test(rel) || rel.includes("mask-icon")) continue;
    const href = attribut(tag, "href");
    if (!href || href.startsWith("data:")) continue;
    let url: URL;
    try { url = new URL(href, basis); } catch { continue; }
    if (url.protocol !== "https:" && url.protocol !== "http:") continue;
    const typ = (attribut(tag, "type") ?? "").toLowerCase();
    const groesse = Math.max(0, ...(attribut(tag, "sizes") ?? "").split(/\s+/).map((s) => parseInt(s, 10) || 0));
    const svg = typ.includes("svg") || /\.svg$/i.test(url.pathname);
    const ico = typ.includes("icon") || /\.ico$/i.test(url.pathname);
    let wert = rel.includes("apple-touch-icon") ? 90 : svg ? 80 : groesse ? Math.min(85, 20 + groesse / 4) : 40;
    if (ico) wert = 15;
    gefunden.push({ href: url.toString(), wert });
  }
  gefunden.sort((a, b) => b.wert - a.wert);
  const liste = gefunden.map((f) => f.href);
  for (const p of ["/apple-touch-icon.png", "/favicon.ico"]) liste.push(new URL(p, basis).toString());
  return [...new Set(liste)].slice(0, 6);
}

/** Bildtyp aus den ersten Bytes; null, wenn es kein Bild ist (z. B. eine HTML-Fehlerseite). */
export function bildTyp(b: Buffer): string | null {
  if (b.length < 8) return null;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 3).toString("ascii") === "GIF") return "image/gif";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return "image/x-icon";
  const kopf = b.subarray(0, 600).toString("utf8").replace(/^﻿/, "").trimStart().toLowerCase();
  if (kopf.startsWith("<svg") || ((kopf.startsWith("<?xml") || kopf.startsWith("<!--")) && kopf.includes("<svg"))) return "image/svg+xml";
  return null;
}

// ─── Cache und Bremse (pro Prozess; die Webseite läuft als ein Prozess) ──────────

function merken<T>(m: Map<string, { bis: number; v: T }>, k: string, v: T, ttl = TTL_MS) {
  if (m.size >= CACHE_MAX) m.delete(m.keys().next().value as string);
  m.set(k, { bis: Date.now() + ttl, v });
}
function abrufen<T>(m: Map<string, { bis: number; v: T }>, k: string): T | undefined {
  const e = m.get(k);
  if (!e) return undefined;
  if (Date.now() > e.bis) { m.delete(k); return undefined; }
  return e.v;
}

const zaehler = new Map<string, { bis: number; n: number }>();
/** Feste Zeitfenster pro Schlüssel (IP); true = erlaubt. */
export function bremse(schluessel: string, limit: number, fensterMs: number): boolean {
  const jetzt = Date.now();
  const z = zaehler.get(schluessel);
  if (!z || jetzt > z.bis) {
    if (zaehler.size > 5000) for (const [k, w] of zaehler) if (jetzt > w.bis) zaehler.delete(k);
    zaehler.set(schluessel, { bis: jetzt + fensterMs, n: 1 });
    return true;
  }
  z.n++;
  return z.n <= limit;
}

/** IP der Anfrage hinter dem Proxy (erster Eintrag von x-forwarded-for, sonst x-real-ip). */
export const anfrageIp = (h: Headers) => h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unbekannt";

// ─── Erkennung ─────────────────────────────────────────────────────────────────

interface MetaDaten { name: string | null; icons: string[] }
export interface Logo { typ: string; daten: Buffer }

const metaCache = new Map<string, { bis: number; v: MetaDaten }>();
const logoCache = new Map<string, { bis: number; v: Logo | null }>();
const laufend = new Map<string, Promise<MetaDaten>>();

async function ladeMeta(domain: string): Promise<MetaDaten> {
  const c = abrufen(metaCache, domain);
  if (c) return c;
  const offen = laufend.get(domain);
  if (offen) return offen;
  const p = (async () => {
    // Erst die Domain, dann www. (manche Domains antworten nur mit www.), zuletzt ohne TLS (kleine Sites mit falschem Zertifikat)
    for (const start of [`https://${domain}/`, `https://www.${domain}/`, `http://${domain}/`]) {
      try {
        const r = await holen(new URL(start), 5000, MAX_HTML);
        const basis = new URL(r.url);
        if (r.status >= 400) return { name: null, icons: iconsAus("", basis) };
        const html = r.daten.toString("utf8");
        return { name: nameAus(html, domain), icons: iconsAus(html, basis) };
      } catch { /* nächster Host */ }
    }
    return { name: null, icons: [] };
  })();
  laufend.set(domain, p);
  try {
    const v = await p;
    merken(metaCache, domain, v, v.icons.length ? TTL_MS : 3600_000);
    return v;
  } finally { laufend.delete(domain); }
}

export async function markeLogo(domain: string): Promise<Logo | null> {
  const c = abrufen(logoCache, domain);
  if (c !== undefined) return c;
  const { icons } = await ladeMeta(domain);
  let logo: Logo | null = null;
  for (const href of icons) {
    try {
      const r = await holen(new URL(href), 4000, MAX_ICON + 1, "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.3");
      if (r.status !== 200 || !r.daten.length || r.daten.length > MAX_ICON) continue;
      const typ = bildTyp(r.daten);
      if (!typ) continue;
      logo = { typ, daten: r.daten };
      break;
    } catch { /* nächster Kandidat */ }
  }
  merken(logoCache, domain, logo);
  return logo;
}

export async function marke(domain: string): Promise<{ domain: string; name: string | null; icon: boolean }> {
  const { name } = await ladeMeta(domain);
  const logo = await markeLogo(domain);
  return { domain, name, icon: !!logo };
}
