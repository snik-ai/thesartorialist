'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { chf } from '@/lib/shop/format';

function thumb(url: string) {
  const u = new URL(url);
  u.searchParams.set('width', '200');
  return u.toString();
}

export default function CartDrawer() {
  const { cart, open, setOpen, update, pending } = useCart();
  const lines = cart?.lines ?? [];

  return (
    <>
      <div className={`cart-scrim${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        className={`cart-drawer${open ? ' is-open' : ''}`}
        aria-label="Warenkorb"
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
      >
        <div className="cart-head">
          <span className="eyebrow">Warenkorb{cart?.count ? ` · ${cart.count}` : ''}</span>
          <button type="button" className="cart-close" onClick={() => setOpen(false)} aria-label="Warenkorb schliessen" tabIndex={open ? 0 : -1}>
            <span />
            <span />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <p className="serif">Ihr Warenkorb ist leer.</p>
            <Link href="/shop/" className="text-link" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              Zum Shop
            </Link>
          </div>
        ) : (
          <>
            <ul className={`cart-lines${pending ? ' is-pending' : ''}`}>
              {lines.map((l) => (
                <li key={l.id} className="cart-line">
                  <Link href={`/shop/products/${l.handle}/`} onClick={() => setOpen(false)} className="cart-thumb" tabIndex={open ? 0 : -1}>
                    {l.image && <img src={thumb(l.image)} alt="" width={90} height={120} loading="lazy" />}
                  </Link>
                  <div className="cart-info">
                    <Link href={`/shop/products/${l.handle}/`} onClick={() => setOpen(false)} className="cart-title" tabIndex={open ? 0 : -1}>
                      {l.title}
                    </Link>
                    {l.size && <span className="cart-size">Grösse {l.size}</span>}
                    <div className="cart-qty">
                      <button type="button" onClick={() => update(l.id, l.quantity - 1)} aria-label="Menge verringern" tabIndex={open ? 0 : -1}>
                        −
                      </button>
                      <span className="num">{l.quantity}</span>
                      <button type="button" onClick={() => update(l.id, l.quantity + 1)} aria-label="Menge erhöhen" tabIndex={open ? 0 : -1}>
                        +
                      </button>
                      <button type="button" className="cart-remove" onClick={() => update(l.id, 0)} tabIndex={open ? 0 : -1}>
                        Entfernen
                      </button>
                    </div>
                  </div>
                  <span className="cart-price num">{chf(l.total)}</span>
                </li>
              ))}
            </ul>
            <div className="cart-foot">
              <div className="cart-sum">
                <span>Zwischensumme</span>
                <strong className="num">{chf(cart!.subtotal)}</strong>
              </div>
              <p className="cart-note">Versand und allfällige Rabattcodes im nächsten Schritt.</p>
              <a href={cart!.checkoutUrl} className="btn btn--wide" tabIndex={open ? 0 : -1}>
                Zur Kasse
              </a>
              <button type="button" className="text-link cart-continue" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                Weiter einkaufen
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
