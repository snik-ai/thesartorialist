import { Playfair_Display, Inter } from 'next/font/google';

// Schriften für alle Root-Layouts (Deutsch, Fremdsprachen, Backend).
// Retro-Serif für Display & Wortmarke — passt zur Logotype.
export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

// Moderne, zeitlose Sans für UI und Fliesstext.
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const schriftKlassen = `${playfair.variable} ${inter.variable}`;
