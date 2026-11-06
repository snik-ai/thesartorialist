import SprachRahmen, { rahmenMeta } from '@/components/rahmen/SprachRahmen';

// Root-Layout der deutschen Website (Hauptsprache, ohne Präfix — alle bisherigen URLs).
// Fremdsprachen haben je ein eigenes Root-Layout in app/(<sprache>)/ mit passendem <html lang>.
export const metadata = rahmenMeta('de');

export default function DeLayout({ children }: { children: React.ReactNode }) {
  return <SprachRahmen lang="de">{children}</SprachRahmen>;
}
