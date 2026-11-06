'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { chf } from '@/lib/shop/format';
import type { ShopVariant } from '@/lib/shop/catalog';
import type { Woerterbuch } from '@/lib/i18n/de';

/** Kaufbox; Texte und Termin-Link kommen in der Seitensprache vom Server. */
export default function BuyBox({
  variants,
  t,
  terminHref,
}: {
  variants: ShopVariant[];
  t: Woerterbuch['shop']['buybox'];
  terminHref: string;
}) {
  const { add } = useCart();
  const single = variants.length === 1 && !variants[0].size;
  const [sel, setSel] = useState<string | null>(single ? variants[0].id : null);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error' | 'pick'>('idle');
  const v = variants.find((x) => x.id === sel) ?? null;
  const anyAvailable = variants.some((x) => x.available);

  const onAdd = async () => {
    if (!v) {
      setState('pick');
      return;
    }
    setState('busy');
    const ok = await add(v.id, 1);
    setState(ok ? 'done' : 'error');
  };

  return (
    <div className="buybox">
      {!single && (
        <fieldset className="size-pick">
          <legend className="size-legend">
            {t.groesseWaehlen}{state === 'pick' && <span className="size-hint">{t.groesseHinweis}</span>}
          </legend>
          <div className="size-chips" role="radiogroup" aria-label={t.groesseAria}>
            {variants.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={sel === x.id}
                disabled={!x.available}
                className={`size-chip${sel === x.id ? ' is-on' : ''}`}
                onClick={() => {
                  setSel(x.id);
                  setState('idle');
                }}
              >
                {x.size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {v && v.price !== variants[0].price && <p className="buybox-price num">{chf(v.price)}</p>}

      <button type="button" className="btn btn--wide buybox-add" onClick={onAdd} disabled={!anyAvailable || state === 'busy'}>
        {!anyAvailable ? t.ausverkauft : state === 'busy' ? t.busy : state === 'done' ? t.fertig : t.hinzufuegen}
      </button>
      {state === 'error' && (
        <p className="buybox-error">{t.fehler}</p>
      )}
      <Link href={terminHref} className="btn btn--ghost btn--wide">
        {t.anprobieren}
      </Link>
    </div>
  );
}
