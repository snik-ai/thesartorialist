'use server';

// Warenkorb = Shopify-Cart (Storefront API). Die Cart-ID liegt in einem
// HttpOnly-Cookie; der Checkout läuft komplett bei Shopify (Zahlung, Versand,
// Rabattcodes, Steuern, Bestellbestätigung).
import { cookies, headers } from 'next/headers';
import { shopify } from './shopify';
import type { CartData } from './cart-types';
import { niceTitle } from './catalog';

const COOKIE = 'ts_cart';

const CART = `id updatedAt totalQuantity checkoutUrl
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first: 100) { nodes { id quantity
    cost { totalAmount { amount } amountPerQuantity { amount currencyCode } }
    merchandise { ... on ProductVariant { id title sku price { amount } image { url altText }
      product { id handle title vendor productType featuredImage { url } } } } } }`;

type RawCart = {
  id: string; updatedAt: string; totalQuantity: number; checkoutUrl: string;
  cost: { subtotalAmount: { amount: string; currencyCode: string }; totalAmount: { amount: string; currencyCode: string } };
  lines: { nodes: { id: string; quantity: number; cost: { totalAmount: { amount: string }; amountPerQuantity: { amount: string; currencyCode: string } };
    merchandise: { id: string; title: string; sku: string | null; price: { amount: string }; image: { url: string; altText: string | null } | null; product: { id: string; handle: string; title: string; vendor: string; productType: string; featuredImage: { url: string } | null } } }[] };
};

/**
 * Warenkorb-Aufrufe tragen die Shopify-Besucher-Cookies des Browsers mit (wie Hydrogens
 * Request-Context), damit Shopify Warenkorb und Kauf dem Besuch zuordnet (Conversion-Rate).
 * Set-Cookie aus Shopifys Antwort geht an den Browser zurück.
 */
async function visitor(): Promise<{ headers: Record<string, string>; onResponse: (res: Response) => Promise<void> }> {
  const h = await headers();
  const out: Record<string, string> = {};
  const cookie = h.get('cookie');
  if (cookie) out.cookie = cookie;
  const gpc = h.get('sec-gpc');
  if (gpc) out['Sec-GPC'] = gpc;
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = (h.get('x-forwarded-proto') ?? 'https').split(',')[0];
  if (host) out['Sec-Shopify-Storefront-Origin'] = `${proto}://${host}`;
  return {
    headers: out,
    onResponse: async (res) => {
      const jar = await cookies();
      for (const raw of res.headers.getSetCookie()) {
        const [pair, ...attrs] = raw.split(';').map((x) => x.trim());
        const eq = pair.indexOf('=');
        if (eq < 1) continue;
        const name = pair.slice(0, eq);
        if (!name.startsWith('_shopify') && !name.startsWith('_tracking') && name !== 'cart') continue;
        const o: Record<string, string | boolean> = {};
        for (const a of attrs) { const i = a.indexOf('='); o[(i < 0 ? a : a.slice(0, i)).toLowerCase()] = i < 0 ? true : a.slice(i + 1); }
        jar.set(name, pair.slice(eq + 1), {
          path: (o.path as string) || '/',
          ...(typeof o.domain === 'string' && host?.endsWith(o.domain.replace(/^\./, '')) ? { domain: o.domain } : {}),
          ...(typeof o.expires === 'string' ? { expires: new Date(o.expires) } : {}),
          ...(typeof o['max-age'] === 'string' ? { maxAge: Number(o['max-age']) } : {}),
          secure: Boolean(o.secure),
          httpOnly: Boolean(o.httponly),
          sameSite: (typeof o.samesite === 'string' ? o.samesite.toLowerCase() : 'lax') as 'lax' | 'strict' | 'none',
        });
      }
    },
  };
}

/**
 * Der Checkout bleibt bei Shopify. Standard ist die Primärdomain des Shops
 * (shop.thesartorialist.ch). SHOPIFY_CHECKOUT_DOMAIN überschreibt sie, z. B. wenn
 * der Shop später auf checkout.thesartorialist.ch umzieht.
 */
function checkoutHref(url: string) {
  const host = process.env.SHOPIFY_CHECKOUT_DOMAIN;
  if (!host) return url;
  try {
    const u = new URL(url);
    u.host = host;
    return u.toString();
  } catch {
    return url;
  }
}

function normalize(c: RawCart | null): CartData | null {
  if (!c) return null;
  return {
    id: c.id,
    count: c.totalQuantity,
    checkoutUrl: checkoutHref(c.checkoutUrl),
    subtotal: Number(c.cost.subtotalAmount.amount),
    lines: c.lines.nodes.map((l) => ({
      id: l.id,
      quantity: l.quantity,
      total: Number(l.cost.totalAmount.amount),
      variantId: l.merchandise.id,
      size: l.merchandise.title === 'Default Title' ? null : l.merchandise.title,
      price: Number(l.merchandise.price.amount),
      image: l.merchandise.image?.url ?? l.merchandise.product.featuredImage?.url ?? null,
      handle: l.merchandise.product.handle,
      title: niceTitle(l.merchandise.product.title),
    })),
  };
}

async function setCookie(id: string) {
  // Secure nur über HTTPS: Safari verwirft Secure-Cookies auf http://localhost,
  // dann entstünde bei jedem Hinzufügen ein neuer Warenkorb mit nur einem Artikel.
  const h = await headers();
  const https = (h.get('x-forwarded-proto') ?? '').startsWith('https') || (h.get('origin') ?? '').startsWith('https:');
  (await cookies()).set(COOKIE, id, { httpOnly: true, sameSite: 'lax', secure: https, path: '/', maxAge: 60 * 60 * 24 * 14 });
}

export async function getCart(): Promise<CartData | null> {
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id) return null;
  const data = await shopify<{ cart: RawCart | null }>(`query($id: ID!) { cart(id: $id) { ${CART} } }`, { id }, { revalidate: false }).catch(() => null);
  return normalize(data?.cart ?? null);
}

export async function addToCart(variantId: string, quantity = 1): Promise<CartData | null> {
  const id = (await cookies()).get(COOKIE)?.value;
  if (id) {
    const data = await shopify<{ cartLinesAdd: { cart: RawCart | null } }>(
      `mutation($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${CART} } } }`,
      { id, lines: [{ merchandiseId: variantId, quantity }] },
      { revalidate: false, ...(await visitor()) },
    ).catch(() => null);
    if (data?.cartLinesAdd.cart) return normalize(data.cartLinesAdd.cart);
  }
  // Kein oder abgelaufener Warenkorb → neu anlegen
  const data = await shopify<{ cartCreate: { cart: RawCart } }>(
    `mutation($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines, buyerIdentity: { countryCode: CH } }) { cart { ${CART} } } }`,
    { lines: [{ merchandiseId: variantId, quantity }] },
    { revalidate: false, ...(await visitor()) },
  );
  await setCookie(data.cartCreate.cart.id);
  return normalize(data.cartCreate.cart);
}

export async function updateLine(lineId: string, quantity: number): Promise<CartData | null> {
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id) return null;
  if (quantity <= 0) {
    const data = await shopify<{ cartLinesRemove: { cart: RawCart } }>(
      `mutation($id: ID!, $ids: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $ids) { cart { ${CART} } } }`,
      { id, ids: [lineId] },
      { revalidate: false, ...(await visitor()) },
    );
    return normalize(data.cartLinesRemove.cart);
  }
  const data = await shopify<{ cartLinesUpdate: { cart: RawCart } }>(
    `mutation($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${CART} } } }`,
    { id, lines: [{ id: lineId, quantity }] },
    { revalidate: false, ...(await visitor()) },
  );
  return normalize(data.cartLinesUpdate.cart);
}

