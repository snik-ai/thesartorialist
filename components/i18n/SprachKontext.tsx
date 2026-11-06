'use client';
// Sprache und gemeinsame Client-Texte (Header, Menü, Kontakt-Knopf, Warenkorb) für
// Client-Komponenten. Das Root-Layout jeder Sprache gibt nur die eigene Sprache mit.
import { createContext, useContext } from 'react';
import type { Woerterbuch } from '@/lib/i18n/de';
import type { Sprache } from '@/lib/i18n/sprachen';

export type ClientTexte = Woerterbuch['allgemein']['client'];
type Ctx = { lang: Sprache; t: ClientTexte };

const SprachCtx = createContext<Ctx | null>(null);

export function useSprache(): Ctx {
  const c = useContext(SprachCtx);
  if (!c) throw new Error('useSprache ausserhalb von SprachKontext');
  return c;
}

export default function SprachKontext({ lang, t, children }: Ctx & { children: React.ReactNode }) {
  return <SprachCtx.Provider value={{ lang, t }}>{children}</SprachCtx.Provider>;
}
