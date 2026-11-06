// Firmenlogo (Favicon/Apple-Touch-Icon) serverseitig laden — nie aus dem Browser zu Dritten.
// SSRF-Schutz: nur http/https auf Port 80/443, jede DNS-Auflösung gegen private Netze geprüft,
// Timeouts, Grössenlimit, Bildtyp aus den Bytes. Cache im Speicher (24 h).
import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';

export type Logo = { body: Buffer; typ: string };

function privat(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  const x = ip.toLowerCase();
  if (x.startsWith('::ffff:')) return privat(x.slice(7));
  return x === '::' || x === '::1' || x.startsWith('fc') || x.startsWith('fd') || x.startsWith('fe80') || x.startsWith('ff');
}

/** DNS-Auflösung mit Prüfung — wird bei JEDER Verbindung aufgerufen (auch nach Weiterleitungen). */
const sichererLookup: net.LookupFunction = (host, opts, cb) => {
  dns.lookup(host, { ...opts, all: true }, (err, adressen) => {
    if (err) return cb(err, '', 4);
    const liste = adressen as unknown as dns.LookupAddress[];
    if (!liste.length || liste.some((a) => privat(a.address))) return cb(new Error('Adresse nicht erlaubt'), '', 4);
    if ((opts as { all?: boolean }).all) return (cb as unknown as (e: null, a: dns.LookupAddress[]) => void)(null, liste);
    cb(null, liste[0].address, liste[0].family);
  });
};

function holen(url: string, maxBytes: number, tiefe = 0): Promise<{ body: Buffer; typ: string; url: string }> {
  return new Promise((ok, nein) => {
    let u: URL;
    try {
      u = new URL(url);
    } catch {
      return nein(new Error('URL ungültig'));
    }
    if (!['http:', 'https:'].includes(u.protocol) || (u.port && !['80', '443'].includes(u.port)) || u.username || u.password) return nein(new Error('URL nicht erlaubt'));
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.get(u, { lookup: sichererLookup, timeout: 4000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TheSartorialistLogo/1.0)', Accept: '*/*' } }, (res) => {
      const st = res.statusCode ?? 0;
      if (st >= 300 && st < 400 && res.headers.location) {
        res.resume();
        if (tiefe >= 3) return nein(new Error('Zu viele Weiterleitungen'));
        return holen(new URL(res.headers.location, u).toString(), maxBytes, tiefe + 1).then(ok, nein);
      }
      if (st !== 200) {
        res.resume();
        return nein(new Error(`HTTP ${st}`));
      }
      const teile: Buffer[] = [];
      let n = 0;
      res.on('data', (c: Buffer) => {
        n += c.length;
        if (n > maxBytes) {
          req.destroy();
          nein(new Error('Zu gross'));
        } else teile.push(c);
      });
      res.on('end', () => ok({ body: Buffer.concat(teile), typ: String(res.headers['content-type'] ?? ''), url: u.toString() }));
      res.on('error', nein);
    });
    req.on('timeout', () => req.destroy(new Error('Timeout')));
    req.on('error', nein);
  });
}

/** Bildtyp aus den ersten Bytes (Content-Type des Servers zählt nicht). */
export function bildTyp(b: Buffer): string | null {
  if (b.length < 8) return null;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.subarray(0, 4).toString('latin1') === 'GIF8') return 'image/gif';
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return 'image/x-icon';
  const anfang = b.subarray(0, 400).toString('utf8').trimStart().toLowerCase();
  if (anfang.startsWith('<svg') || (anfang.startsWith('<?xml') && anfang.includes('<svg'))) return 'image/svg+xml';
  return null;
}

function iconLinks(html: string, basis: string): string[] {
  const links: { href: string; prio: number }[] = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = /rel\s*=\s*["']?([^"'>]+)/i.exec(tag)?.[1]?.toLowerCase() ?? '';
    const href = /href\s*=\s*["']?([^"'\s>]+)/i.exec(tag)?.[1];
    if (!href || !/icon/.test(rel)) continue;
    const groesse = Number(/sizes\s*=\s*["']?(\d+)/i.exec(tag)?.[1] ?? 0);
    const prio = (rel.includes('apple-touch-icon') ? 1000 : 0) + Math.min(groesse, 512) + (href.endsWith('.svg') ? 300 : 0);
    try {
      links.push({ href: new URL(href, basis).toString(), prio });
    } catch {}
  }
  return links.sort((a, b) => b.prio - a.prio).map((l) => l.href);
}

const cache = new Map<string, { logo: Logo | null; bis: number }>();

export async function ladeLogo(domain: string): Promise<Logo | null> {
  const c = cache.get(domain);
  if (c && c.bis > Date.now()) return c.logo;
  let logo: Logo | null = null;
  try {
    const kandidaten: string[] = [];
    try {
      const seite = await holen(`https://${domain}/`, 400_000);
      kandidaten.push(...iconLinks(seite.body.toString('utf8'), seite.url));
    } catch {}
    kandidaten.push(`https://${domain}/apple-touch-icon.png`, `https://${domain}/favicon.ico`);
    for (const k of kandidaten.slice(0, 5)) {
      try {
        const r = await holen(k, 250_000);
        const typ = bildTyp(r.body);
        if (typ) {
          logo = { body: r.body, typ };
          break;
        }
      } catch {}
    }
  } catch {}
  if (cache.size > 500) cache.clear();
  cache.set(domain, { logo, bis: Date.now() + (logo ? 86400_000 : 3600_000) });
  return logo;
}

export function monogramm(domain: string) {
  const b = (domain[0] ?? '?').toUpperCase().replace(/[<>&"]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#101010"/><text x="32" y="42" font-family="Georgia,serif" font-size="30" fill="#fff" text-anchor="middle">${b}</text></svg>`;
}
