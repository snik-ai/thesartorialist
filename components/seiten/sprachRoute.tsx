// Gemeinsame Logik der Sprachrouten app/(<sprache>)/<sprache>/[[...pfad]]/page.tsx:
// Pfad → Seiten-Schlüssel (lib/i18n/routen.json) → Seitenkomponente aus der Registry.
// Nicht freigeschaltete Sprachen erzeugen keine Seiten (alte URLs leitet next.config.mjs um).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ROUTEN, SEITEN_KEYS, type SeitenKey } from '@/lib/i18n/routen';
import { istAktiv, type Fremdsprache } from '@/lib/i18n/sprachen';
import { seitenModul } from './registry';

type Params = { params: Promise<{ pfad?: string[] }> };

const segmente = (p: string) => p.split('/').filter(Boolean).slice(1); // ohne Sprachpräfix

function dekodiert(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function keyFuer(lang: Fremdsprache, pfad: string[] = []): SeitenKey | null {
  const p = `/${[lang, ...pfad.map(dekodiert)].join('/')}/`;
  for (const key of SEITEN_KEYS) {
    if (key === 'shop') continue; // eigene Routen
    if (ROUTEN[key][lang] === p) return key;
  }
  return null;
}

export function sprachRoute(lang: Fremdsprache) {
  return {
    generateStaticParams(): { pfad: string[] }[] {
      if (!istAktiv(lang)) return [];
      return SEITEN_KEYS.filter((k) => k !== 'shop' && ROUTEN[k][lang] && seitenModul(k)).map((k) => ({
        pfad: segmente(ROUTEN[k][lang]!),
      }));
    },
    async generateMetadata({ params }: Params): Promise<Metadata> {
      const { pfad } = await params;
      const key = keyFuer(lang, pfad);
      const m = key && seitenModul(key);
      return m && istAktiv(lang) ? m.meta(lang) : {};
    },
    async Seite({ params }: Params) {
      const { pfad } = await params;
      const key = keyFuer(lang, pfad);
      const m = key && seitenModul(key);
      if (!m || !istAktiv(lang)) notFound();
      return <m.Seite lang={lang} />;
    },
  };
}
