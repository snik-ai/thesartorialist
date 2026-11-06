import SprachRahmen, { rahmenMeta } from '@/components/rahmen/SprachRahmen';

// Root-Layout der Sprache «ru» (/ru/…): eigenes <html lang>. Seiten erscheinen erst,
// wenn die Sprache in lib/i18n/aktive-sprachen.json freigeschaltet ist.
export const metadata = rahmenMeta('ru');

export default function SprachLayout({ children }: { children: React.ReactNode }) {
  return <SprachRahmen lang="ru">{children}</SprachRahmen>;
}
