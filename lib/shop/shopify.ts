// Shopify Storefront API (GraphQL). Shopify bleibt das System: Produkte,
// Preise, Lager, Collections, Menüs, Rechtstexte, Warenkorb und Checkout.
// Das Frontend liest nur — gepflegt wird alles im Shopify-Admin.
//
// Ohne Token läuft die API «tokenless» (Produkte, Collections, Suche, Menü,
// Warenkorb; Limit 1'000 Kostenpunkte pro Abfrage). Mit einem öffentlichen
// Storefront-Token aus dem Headless-Kanal kommen Metafelder (Bewertungen) und
// höhere Limits dazu — dann SHOPIFY_STOREFRONT_TOKEN setzen.

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? 'thesartorialistch.myshopify.com';
const VERSION = process.env.SHOPIFY_API_VERSION ?? '2025-07';
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const ENDPOINT = `https://${DOMAIN}/api/${VERSION}/graphql.json`;

export const SHOP_DOMAIN = DOMAIN;
export const HAS_TOKEN = Boolean(TOKEN);

type Opts = {
  /** Sekunden bis zur Neuvalidierung (ISR). `false` = nie cachen (Warenkorb). */
  revalidate?: number | false;
  tags?: string[];
  /** Zusätzliche Header (Warenkorb: Besucher-Cookies für Shopifys Sitzungs-Zuordnung). */
  headers?: Record<string, string>;
  /** Antwort-Header lesen (Warenkorb: Set-Cookie von Shopify an den Browser weitergeben). */
  onResponse?: (res: Response) => void | Promise<void>;
};

export class ShopifyError extends Error {}

/** Einmal von Shopify abgelehnt → für diesen Prozess ohne Token arbeiten. */
let tokenUngueltig = false;

/**
 * Schweizer Schreibweise: «ß» aus Shopify-Daten (z. B. Farbnamen der Hersteller wie «Titanweiß»)
 * wird überall als «ss» angezeigt. Adressen, IDs und Bild-URLs bleiben unverändert.
 */
function swiss<T>(v: T): T {
  if (typeof v === 'string') {
    if (!/[ßẞ]/.test(v) || /^(https?:|\/|gid:)/.test(v)) return v;
    return v.replace(/ß/g, 'ss').replace(/ẞ/g, 'SS') as T;
  }
  if (Array.isArray(v)) return v.map(swiss) as T;
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    for (const k of Object.keys(o)) if (k !== 'url' && k !== 'handle' && k !== 'id') o[k] = swiss(o[k]);
  }
  return v;
}

export async function shopify<T>(query: string, variables: Record<string, unknown> = {}, opts: Opts = {}): Promise<T> {
  const { revalidate = 900, tags = [] } = opts;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json', ...opts.headers };
  if (TOKEN && !tokenUngueltig) headers['X-Shopify-Storefront-Access-Token'] = TOKEN;

  let lastErr: unknown;
  // Kurze Wiederholung bei Drosselung (429) oder Netzfehlern, z. B. im Build
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
        // Wiederholungen am Daten-Cache vorbei: Eine abgeschnittene Antwort (JSON-Fehler im Build)
        // käme sonst bei jedem Versuch wieder aus dem Cache
        ...(revalidate === false || attempt > 0 ? { cache: 'no-store' as const } : { next: { revalidate, tags: ['shopify', ...tags] } }),
      });
      if (res.status === 429 || res.status >= 500) throw new ShopifyError(`Shopify ${res.status}`);
      await opts.onResponse?.(res);
      const json = (await res.json()) as { data?: T; errors?: { message: string; extensions?: { code?: string } }[] };
      // Drosselung meldet die Storefront API auch als GraphQL-Fehler mit Status 200
      if (json.errors?.some((e) => e.extensions?.code === 'THROTTLED')) throw new ShopifyError('Shopify 429 THROTTLED');
      // Falscher Storefront-Token (z. B. Admin-Token in SHOPIFY_STOREFRONT_TOKEN): ohne Token weiter
      // (tokenless funktioniert für Produkte, Collections, Warenkorb) statt den ganzen Shop lahmzulegen.
      if ((res.status === 401 || json.errors?.some((e) => e.extensions?.code === 'UNAUTHORIZED')) && headers['X-Shopify-Storefront-Access-Token']) {
        if (!tokenUngueltig) console.warn('[shop] SHOPIFY_STOREFRONT_TOKEN wird von Shopify abgelehnt (UNAUTHORIZED) — es geht ohne Token weiter. Bitte die Variable in Coolify entfernen oder korrigieren.');
        tokenUngueltig = true;
        delete headers['X-Shopify-Storefront-Access-Token'];
        attempt--;
        continue;
      }
      if (json.errors?.length) throw new ShopifyError(json.errors.map((e) => e.message || e.extensions?.code || 'unbekannt').join('; ') || `Shopify ${res.status}`);
      return swiss(json.data as T);
    } catch (e) {
      lastErr = e;
      if (e instanceof ShopifyError && !/^Shopify (429|5\d\d)/.test(e.message)) break;
      await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
    }
  }
  throw lastErr;
}
