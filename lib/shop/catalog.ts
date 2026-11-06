// Shop-Katalog aus Shopify (Storefront API). Shopify bleibt die Quelle für Produkte,
// Preise, Grössen, Lager und Bilder — gepflegt wird alles im Shopify-Admin
// (shop.thesartorialist.ch). Hier wird nur gelesen und für die Darstellung aufbereitet.
import { cache } from 'react';
import { shopify } from './shopify';
import { colorOf, sizeKey, taxonomy } from './taxonomy';
import WARDROBE from './wardrobe-data.json';

const CUTOUTS = new Set((WARDROBE as { handle: string }[]).map((w) => w.handle));

export type ShopImage = { url: string; width: number; height: number; alt: string };
export type ShopVariant = {
  id: string;
  title: string;
  size: string | null;
  available: boolean;
  price: number;
  compareAt: number | null;
};
export type Gender = 'Herren' | 'Damen';
export type ShopProduct = {
  id: string;
  handle: string;
  title: string;
  brand: string;
  gender: Gender;
  /** Unterkategorie (Parkas, Strickjacken, Sakkos …) */
  category: string;
  group: string;
  type: string | null;
  color: string | null;
  price: number;
  compareAt: number | null;
  available: boolean;
  images: ShopImage[];
  variants: ShopVariant[];
  descriptionHtml: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
};

const PRODUCT = `id handle title vendor updatedAt availableForSale descriptionHtml description
  seo { title description }
  collections(first: 10) { nodes { handle } }
  images(first: 12) { nodes { url width height altText } }
  variants(first: 50) { nodes { id title availableForSale
    price { amount } compareAtPrice { amount }
    selectedOptions { name value } } }`;

type Raw = {
  id: string; handle: string; title: string; vendor: string; updatedAt: string; availableForSale: boolean;
  descriptionHtml: string; description: string;
  seo: { title: string | null; description: string | null };
  collections: { nodes: { handle: string }[] };
  images: { nodes: { url: string; width: number; height: number; altText: string | null }[] };
  variants: { nodes: { id: string; title: string; availableForSale: boolean; price: { amount: string };
    compareAtPrice: { amount: string } | null; selectedOptions: { name: string; value: string }[] }[] };
};

// Die Marke steckt im Shop in den Collections (Vendor ist meist der Shopname).
const BRAND_BY_COLLECTION: Record<string, string> = {
  test: 'Woolrich',
  pullover: 'Gran Sasso',
  'gran-sasso-rundhals-wool': 'Gran Sasso',
  tramarossa: 'Tramarossa',
  'maria-santangelo': 'Maria Santangelo',
  'he-sartorialist': 'The Sartorialist',
  berwich: 'Berwich',
  'gimo-s': "Gimo's",
};

function brandOf(r: Raw): string {
  for (const c of r.collections.nodes) if (BRAND_BY_COLLECTION[c.handle]) return BRAND_BY_COLLECTION[c.handle];
  if (r.vendor && !/^thesartorialist/i.test(r.vendor)) return r.vendor;
  return 'The Sartorialist';
}

const KEEP_UPPER = new Set(['GTX', 'XL', 'XXL']);
/** «CLOUD PARKA OLIVE GRÜN» → «Cloud Parka Olive Grün»; gemischte Schreibweisen bleiben, erster Buchstabe gross. */
export function niceTitle(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  const letters = t.replace(/[^A-Za-zÄÖÜäöü]/g, '');
  if (letters && letters === letters.toUpperCase()) {
    return t
      .split(' ')
      .map((w) => (KEEP_UPPER.has(w) ? w : w.charAt(0) + w.slice(1).toLowerCase()))
      .join(' ');
  }
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

function normalize(r: Raw): ShopProduct {
  const brand = brandOf(r);
  const title = niceTitle(r.title);
  const variants: ShopVariant[] = r.variants.nodes.map((v) => {
    const size = v.selectedOptions.find((o) => /size|grösse|grosse|taglia/i.test(o.name))?.value ?? null;
    return {
      id: v.id,
      title: v.title,
      size: size ?? (v.title === 'Default Title' ? null : v.title),
      available: v.availableForSale,
      price: Number(v.price.amount),
      compareAt: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
    };
  });
  variants.sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.size ?? ''), ib = SIZE_ORDER.indexOf(b.size ?? '');
    if (ia >= 0 && ib >= 0) return ia - ib;
    const na = Number(a.size), nb = Number(b.size);
    return Number.isFinite(na) && Number.isFinite(nb) ? na - nb : 0;
  });
  const price = Math.min(...variants.map((v) => v.price));
  const cmp = variants.map((v) => v.compareAt ?? 0).filter((x) => x > price);
  const handles = r.collections.nodes.map((c) => c.handle);
  return {
    id: r.id,
    handle: r.handle,
    title,
    brand,
    gender: handles.includes('woman') ? 'Damen' : 'Herren',
    ...(() => {
      const tx = taxonomy(title, brand);
      return { category: tx.sub, group: tx.group, type: tx.type };
    })(),
    color: colorOf(title),
    price,
    compareAt: cmp.length ? Math.max(...cmp) : null,
    available: r.availableForSale,
    images: r.images.nodes.map((i) => ({ url: i.url, width: i.width, height: i.height, alt: i.altText || `${title} — ${brand}` })),
    variants,
    descriptionHtml: r.descriptionHtml,
    description: r.description,
    seoTitle: r.seo.title,
    seoDescription: r.seo.description,
    updatedAt: r.updatedAt,
  };
}

/** Lädt alle Produkte (paginiert) direkt bei Shopify. */
async function ladeAlleProdukte(): Promise<ShopProduct[]> {
  const out: ShopProduct[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const data: { products: { nodes: Raw[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } = await shopify(
      `query($after: String) @inContext(country: CH, language: DE) {
        products(first: 100, after: $after, sortKey: CREATED_AT, reverse: true) {
          nodes { ${PRODUCT} } pageInfo { hasNextPage endCursor } } }`,
      { after },
      { tags: ['products'] },
    );
    out.push(...data.products.nodes.map(normalize));
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }
  return out.filter((p) => p.images.length > 0);
}

// Im Build (9 Sprachen × Shop-Seiten, mehrere Worker) den Katalog nur einmal laden:
// gemeinsame Datei in .next/cache plus Promise je Prozess. So drosselt Shopify den Build nicht,
// und ein Shopify-Ausfall lässt den Deploy nicht scheitern (Seiten entstehen dann zur Laufzeit).
const IM_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
let buildKatalog: Promise<ShopProduct[]> | null = null;

async function katalogImBuild(): Promise<ShopProduct[]> {
  const fs = await import('node:fs/promises');
  const pfad = await import('node:path');
  const datei = pfad.join(process.cwd(), '.next', 'cache', 'shop-katalog.json');
  try {
    const st = await fs.stat(datei);
    if (Date.now() - st.mtimeMs < 30 * 60_000) return JSON.parse(await fs.readFile(datei, 'utf8')) as ShopProduct[];
  } catch {
    /* noch keine Datei */
  }
  try {
    const alle = await ladeAlleProdukte();
    await fs.mkdir(pfad.dirname(datei), { recursive: true }).catch(() => {});
    await fs.writeFile(datei, JSON.stringify(alle)).catch(() => {});
    return alle;
  } catch (e) {
    const grund = e instanceof Error ? `${e.name}: ${e.message}${(e as { cause?: unknown }).cause ? ` (${String((e as { cause?: unknown }).cause)})` : ''}` : String(e);
    console.warn(`[shop] Katalog im Build nicht ladbar — Shop-Seiten entstehen zur Laufzeit. Grund: ${grund}`);
    return [];
  }
}

/** Alle Produkte, neueste zuerst wie im Shopify-Shop. Ohne Bild erscheinen sie nicht. */
export const getAllProducts = cache(async (): Promise<ShopProduct[]> => {
  if (IM_BUILD) return (buildKatalog ??= katalogImBuild());
  return ladeAlleProdukte();
});

export const getProduct = cache(async (handle: string): Promise<ShopProduct | null> => {
  const all = await getAllProducts();
  return all.find((p) => p.handle === handle) ?? null;
});

/** Shopify-CDN liefert passende Grössen selbst (WebP für moderne Browser). */
export function img(url: string, width: number, height?: number): string {
  const u = new URL(url);
  u.searchParams.set('width', String(width));
  if (height) {
    u.searchParams.set('height', String(height));
    u.searchParams.set('crop', 'center');
  }
  return u.toString();
}

/**
 * Teilen-Bild 1200×630 als JPEG (WhatsApp & Co. lesen kein WebP zuverlässig).
 * Hochformat-Fotos werden nicht beschnitten, sondern seitlich in Hintergrundgrau aufgefüllt.
 */
export function ogImg(url: string): string {
  const u = new URL(url);
  u.searchParams.set('width', '1200');
  u.searchParams.set('height', '630');
  u.searchParams.set('pad_color', 'ebebeb');
  u.searchParams.set('format', 'jpg');
  return u.toString();
}

export function related(all: ShopProduct[], p: ShopProduct, n = 4): ShopProduct[] {
  const score = (q: ShopProduct) => (q.category === p.category ? 2 : 0) + (q.brand === p.brand ? 1 : 0) + (q.gender === p.gender ? 1 : 0);
  return all
    .filter((q) => q.handle !== p.handle && q.available)
    .map((q, i) => ({ q, s: score(q), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, n)
    .map((x) => x.q);
}

/** Schlanke Kartendaten für Listen und Filter (gehen an den Browser). */
export function toCard(p: ShopProduct) {
  return {
    handle: p.handle,
    title: p.title,
    brand: p.brand,
    category: p.category,
    group: p.group,
    type: p.type,
    color: p.color,
    gender: p.gender,
    price: p.price,
    compareAt: p.compareAt,
    available: p.available,
    image: p.images[0].url,
    hover: p.images[1]?.url ?? null,
    sizes: p.variants.filter((v) => v.available && v.size).map((v) => v.size!),
    sizeKeys: p.variants.filter((v) => v.available && v.size).map((v) => sizeKey(v.size!, p.category)),
    /** Freigestelltes Bild aus dem Kleiderschrank (für Kategorie-Kacheln), falls vorhanden */
    cutout: CUTOUTS.has(p.handle) ? `/media/schrank/${p.handle}.webp` : null,
  };
}
