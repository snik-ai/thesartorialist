'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { chf } from '@/lib/shop/format';
import type { ShopVariant } from '@/lib/shop/catalog';

export default function BuyBox({ variants }: { variants: ShopVariant[] }) {
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
            Grösse wählen{state === 'pick' && <span className="size-hint"> — bitte zuerst eine Grösse antippen</span>}
          </legend>
          <div className="size-chips" role="radiogroup" aria-label="Grösse">
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
        {!anyAvailable ? 'Ausverkauft' : state === 'busy' ? 'Wird hinzugefügt …' : state === 'done' ? 'Im Warenkorb ✓' : 'In den Warenkorb'}
      </button>
      {state === 'error' && (
        <p className="buybox-error">Das hat nicht geklappt. Bitte nochmals versuchen oder uns anrufen.</p>
      )}
      <Link href="/termin/" className="btn btn--ghost btn--wide">
        Im Showroom anprobieren
      </Link>
    </div>
  );
}
