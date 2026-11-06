import SprachRahmen, { rahmenMeta } from '@/components/rahmen/SprachRahmen';

// Root-Layout der Sprache «pt-pt» (/pt-pt/…): eigenes <html lang>. Seiten erscheinen erst,
// wenn die Sprache in lib/i18n/aktive-sprachen.json freigeschaltet ist.
export const metadata = rahmenMeta('pt-pt');

export default function SprachLayout({ children }: { children: React.ReactNode }) {
  return <SprachRahmen lang="pt-pt">{children}</SprachRahmen>;
}
