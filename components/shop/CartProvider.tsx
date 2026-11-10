'use client';

// Warenkorb-Zustand im Browser; Quelle bleibt der Shopify-Cart (Server Actions).
// Abgefragt wird erst nach dem Laden, damit alle Seiten statisch (ISR) bleiben.
import { createContext, useCallback, useContext, useEffect, useState, useTransition } from 'react';
import { addToCart, getCart, updateLine } from '@/lib/shop/cart';
import { melde } from '@/lib/tracking/melden';
import type { CartData } from '@/lib/shop/cart-types';

type Ctx = {
  cart: CartData | null;
  open: boolean;
  pending: boolean;
  setOpen: (v: boolean) => void;
  add: (variantId: string, qty?: number) => Promise<boolean>;
  update: (lineId: string, qty: number) => void;
};

const CartCtx = createContext<Ctx | null>(null);

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error('useCart ausserhalb von CartProvider');
  return c;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    // Nur abfragen, wenn ein Warenkorb existieren kann (Cookie ist HttpOnly → Hinweis-Flag)
    if (document.cookie.includes('ts_has_cart=1')) getCart().then(setCart).catch(() => {});
  }, []);

  useEffect(() => {
    document.body.classList.toggle('cart-open', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const add = useCallback(async (variantId: string, qty = 1) => {
    try {
      const next = await addToCart(variantId, qty);
      setCart(next);
      melde('shop_warenkorb');
      document.cookie = 'ts_has_cart=1; path=/; max-age=1209600; samesite=lax';
      setOpen(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const update = useCallback((lineId: string, qty: number) => {
    start(async () => setCart(await updateLine(lineId, qty)));
  }, []);

  return <CartCtx.Provider value={{ cart, open, pending, setOpen, add, update }}>{children}</CartCtx.Provider>;
}
