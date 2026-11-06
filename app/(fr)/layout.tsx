import SprachRahmen, { rahmenMeta } from '@/components/rahmen/SprachRahmen';

// Root-Layout der Sprache «fr» (/fr/…): eigenes <html lang>. Seiten erscheinen erst,
// wenn die Sprache in lib/i18n/aktive-sprachen.json freigeschaltet ist.
export const metadata = rahmenMeta('fr');

export default function SprachLayout({ children }: { children: React.ReactNode }) {
  return <SprachRahmen lang="fr">{children}</SprachRahmen>;
}
