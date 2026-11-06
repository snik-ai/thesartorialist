'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';
import { chf } from '@/lib/shop/format';
import { pfad } from '@/lib/i18n/routen';
import { fmt } from '@/lib/i18n/fmt';
import { useSprache } from '@/components/i18n/SprachKontext';

function thumb(url: string) {
  const u = new URL(url);
  u.searchParams.set('width', '200');
  return u.toString();
}

export default function CartDrawer() {
  const { cart, open, setOpen, update, pending } = useCart();
  const { lang, t: alle } = useSprache();
  const t = alle.warenkorb;
  const produkt = (handle: string) => pfad(lang, 'shop', `products/${handle}/`);
  const lines = cart?.lines ?? [];

  return (
    <>
      <div className={`cart-scrim${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        className={`cart-drawer${open ? ' is-open' : ''}`}
        aria-label={t.titel}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
      >
        <div className="cart-head">
          <span className="eyebrow">{t.titel}{cart?.count ? ` · ${cart.count}` : ''}</span>
          <button type="button" className="cart-close" onClick={() => setOpen(false)} aria-label={t.schliessen} tabIndex={open ? 0 : -1}>
            <span />
            <span />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <p className="serif">{t.leer}</p>
            <Link href={pfad(lang, 'shop')} className="text-link" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              {t.zumShop}
            </Link>
          </div>
        ) : (
          <>
            <ul className={`cart-lines${pending ? ' is-pending' : ''}`}>
              {lines.map((l) => (
                <li key={l.id} className="cart-line">
                  <Link href={produkt(l.handle)} onClick={() => setOpen(false)} className="cart-thumb" tabIndex={open ? 0 : -1}>
                    {l.image && <img src={thumb(l.image)} alt="" width={90} height={120} loading="lazy" />}
                  </Link>
                  <div className="cart-info">
                    <Link href={produkt(l.handle)} onClick={() => setOpen(false)} className="cart-title" tabIndex={open ? 0 : -1}>
                      {l.title}
                    </Link>
                    {l.size && <span className="cart-size">{fmt(t.groesse, { g: l.size })}</span>}
                    <div className="cart-qty">
                      <button type="button" onClick={() => update(l.id, l.quantity - 1)} aria-label={t.weniger} tabIndex={open ? 0 : -1}>
                        −
                      </button>
                      <span className="num">{l.quantity}</span>
                      <button type="button" onClick={() => update(l.id, l.quantity + 1)} aria-label={t.mehr} tabIndex={open ? 0 : -1}>
                        +
                      </button>
                      <button type="button" className="cart-remove" onClick={() => update(l.id, 0)} tabIndex={open ? 0 : -1}>
                        {t.entfernen}
                      </button>
                    </div>
                  </div>
                  <span className="cart-price num">{chf(l.total)}</span>
                </li>
              ))}
            </ul>
            <div className="cart-foot">
              <div className="cart-sum">
                <span>{t.zwischensumme}</span>
                <strong className="num">{chf(cart!.subtotal)}</strong>
              </div>
              <p className="cart-note">{t.hinweis}</p>
              <a href={cart!.checkoutUrl} className="btn btn--wide" tabIndex={open ? 0 : -1}>
                {t.kasse}
              </a>
              <button type="button" className="text-link cart-continue" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                {t.weiter}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
