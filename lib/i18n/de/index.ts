// Deutsches Wörterbuch = Quelle und Typ für alle Sprachen (Woerterbuch).
// Neue Texte immer zuerst hier anlegen; TypeScript meldet dann, wo sie in den
// anderen Sprachen fehlen.
import { allgemein } from './allgemein';
import { start } from './start';
import { massanzug } from './massanzug';
import { hochzeitsanzug } from './hochzeitsanzug';
import { hochzeit2024 } from './hochzeit2024';
import { anzuege } from './anzuege';
import { services } from './services';
import { ueberUns } from './ueberUns';
import { kontakt } from './kontakt';
import { brands } from './brands';
import { marken } from './marken';
import { farben } from './farben';
import { newsletter } from './newsletter';
import { impressum } from './impressum';
import { datenschutz } from './datenschutz';
import { agb } from './agb';
import { konfigurator } from './konfigurator';
import { konfigDaten } from './konfigDaten';
import { shop } from './shop';
import { termin } from './termin';
import { mail } from './mail';

export const de = {
  allgemein,
  start,
  massanzug,
  hochzeitsanzug,
  hochzeit2024,
  anzuege,
  services,
  ueberUns,
  kontakt,
  brands,
  marken,
  farben,
  newsletter,
  impressum,
  datenschutz,
  agb,
  konfigurator,
  konfigDaten,
  shop,
  termin,
  mail,
};

export type Woerterbuch = typeof de;
