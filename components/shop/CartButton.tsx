'use client';

import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';
import { pfad } from '@/lib/i18n/routen';
import { fmt } from '@/lib/i18n/fmt';
import { useSprache } from '@/components/i18n/SprachKontext';

/** Warenkorb-Knopf im Header: im Shop immer, sonst nur, wenn etwas im Korb liegt. */
export default function CartButton() {
  const { cart, setOpen } = useCart();
  const { lang, t } = useSprache();
  const path = usePathname();
  const count = cart?.count ?? 0;
  if (!path.startsWith(pfad(lang, 'shop')) && count === 0) return null;
  return (
    <button type="button" className="cart-btn" onClick={() => setOpen(true)} aria-label={fmt(t.warenkorb.knopf, { n: count })}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 8h14l-1.2 12H6.2L5 8Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {count > 0 && <span className="cart-count num">{count}</span>}
    </button>
  );
}
