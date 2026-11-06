// Seiten-Schlüssel → Seitenkomponente und Metadaten. Die deutschen Routen (app/(de)/…)
// binden die Komponenten direkt ein; die Sprachrouten (app/(<sprache>)/<sprache>/[[...pfad]])
// lösen den Pfad über lib/i18n/routen.json auf einen Schlüssel auf und rendern hier.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { SeitenKey } from '@/lib/i18n/routen';
import type { Sprache } from '@/lib/i18n/sprachen';
import Startseite, { meta as startMeta } from './Startseite';
import Massanzug, { meta as massanzugMeta } from './Massanzug';
import Hochzeitsanzug, { meta as hochzeitsanzugMeta } from './Hochzeitsanzug';
import Hochzeit2024, { meta as hochzeit2024Meta } from './Hochzeit2024';
import Anzuege, { meta as anzuegeMeta } from './Anzuege';
import Services, { meta as servicesMeta } from './Services';
import UeberUns, { meta as ueberUnsMeta } from './UeberUns';
import Kontakt, { meta as kontaktMeta } from './Kontakt';
import Termin, { meta as terminMeta } from './Termin';
import Brands, { meta as brandsMeta } from './Brands';
import Newsletter, { meta as newsletterMeta } from './Newsletter';
import Impressum, { meta as impressumMeta } from './Impressum';
import Datenschutz, { meta as datenschutzMeta } from './Datenschutz';
import Agb, { meta as agbMeta } from './Agb';
import Konfigurator, { meta as konfiguratorMeta } from './Konfigurator';
import Marke, { meta as markeMeta } from './Marke';
import Farbe, { meta as farbeMeta } from './Farbe';

export type SeitenModul = {
  Seite: (p: { lang: Sprache }) => ReactNode | Promise<ReactNode>;
  meta: (lang: Sprache) => Metadata | Promise<Metadata>;
};

const einfach = (
  Seite: (p: { lang: Sprache }) => ReactNode | Promise<ReactNode>,
  meta: (lang: Sprache) => Metadata | Promise<Metadata>,
): SeitenModul => ({ Seite, meta });

/** Seiten, die es in den Fremdsprachen über die Sprachroute gibt. Shop hat eigene Routen;
 * Glossar gibt es vorerst nur auf Deutsch. */
export const SEITEN: Partial<Record<SeitenKey, SeitenModul>> = {
  start: einfach(Startseite, startMeta),
  massanzug: einfach(Massanzug, massanzugMeta),
  konfigurator: einfach(Konfigurator, konfiguratorMeta),
  hochzeitsanzug: einfach(Hochzeitsanzug, hochzeitsanzugMeta),
  hochzeit2024: einfach(Hochzeit2024, hochzeit2024Meta),
  anzuege: einfach(Anzuege, anzuegeMeta),
  services: einfach(Services, servicesMeta),
  ueberUns: einfach(UeberUns, ueberUnsMeta),
  kontakt: einfach(Kontakt, kontaktMeta),
  termin: einfach(Termin, terminMeta),
  brands: einfach(Brands, brandsMeta),
  newsletter: einfach(Newsletter, newsletterMeta),
  impressum: einfach(Impressum, impressumMeta),
  datenschutz: einfach(Datenschutz, datenschutzMeta),
  agb: einfach(Agb, agbMeta),
};

export function seitenModul(key: SeitenKey): SeitenModul | undefined {
  if (key.startsWith('marke:')) {
    const slug = key.slice(6);
    return { Seite: ({ lang }) => <Marke lang={lang} slug={slug} />, meta: (lang) => markeMeta(lang, slug) };
  }
  if (key.startsWith('farbe:')) {
    const slug = key.slice(6);
    return { Seite: ({ lang }) => <Farbe lang={lang} slug={slug} />, meta: (lang) => farbeMeta(lang, slug) };
  }
  return SEITEN[key];
}
