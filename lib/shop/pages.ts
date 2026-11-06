// Shop-Landingpages (/shop/<slug>/): Marken, Damen/Herren und Kategorien.
// Jede Seite hat eigenen Text (H1, Einleitung, Meta) und erscheint nur, wenn
// Shopify mindestens ein passendes Produkt mit Bild liefert.
// Deutsch ist die Quelle; andere Sprachen überlagern die Texte je Slug aus dem
// Wörterbuch (shop.seiten), siehe seiteIn(). Slugs sind in allen Sprachen gleich.
// Nur auf dem Server verwenden.
import type { ShopProduct } from './catalog';
import { woerterbuch } from '@/lib/i18n';
import type { Sprache } from '@/lib/i18n/sprachen';

export type ShopPage = {
  slug: string;
  group: 'Marke' | 'Für' | 'Kategorie';
  label: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  /** Slug der Brand-Seite auf der Hauptsite (Herkunft, Geschichte), Pfad via markenPfad(). */
  brandPage?: string;
  match: (p: ShopProduct) => boolean;
};

export const SHOP_PAGES: ShopPage[] = [
  {
    slug: 'woolrich',
    group: 'Marke',
    label: 'Woolrich',
    h1: 'Woolrich Parkas & Jacken online kaufen',
    title: 'Woolrich Parka & Jacken kaufen — Shop Zürich',
    description:
      'Woolrich bei The Sartorialist Zürich: Arctic Parka, Cloud Parka, Wool Shirt Jackets und Mäntel für Herren und Damen. Online bestellen oder im Showroom anprobieren.',
    intro:
      'Seit 1830 steht Woolrich für Outdoor-Bekleidung, die echte Winter aushält. Bei uns finden Sie die Ikonen der Marke — vom Arctic Parka mit Daunenfüllung bis zur Wool Shirt Jacket aus Melton-Wolle — für Herren und Damen. Bestellen Sie online oder probieren Sie Ihre Grösse im Showroom an der Kuttelgasse 7 an.',
    brandPage: 'woolrich',
    match: (p) => p.brand === 'Woolrich',
  },
  {
    slug: 'gran-sasso',
    group: 'Marke',
    label: 'Gran Sasso',
    h1: 'Gran Sasso Strick online kaufen',
    title: 'Gran Sasso Pullover & Cashmere kaufen — Shop Zürich',
    description:
      'Gran Sasso bei The Sartorialist Zürich: Merino-Pullover, Cashmere-Strick, Troyer und Strickjacken aus den Abruzzen. Online bestellen oder im Showroom anprobieren.',
    intro:
      'Gran Sasso strickt seit 1952 in den Abruzzen — Merino, Cashmere und Seide, gefertigt in der eigenen Manufaktur in Sant’Egidio alla Vibrata. Die Pullover, Troyer und Strickjacken passen unter das Sakko genauso wie zur Jeans und sind die ideale Ergänzung zu Ihrem Massanzug.',
    brandPage: 'gran-sasso',
    match: (p) => p.brand === 'Gran Sasso',
  },
  {
    slug: 'tramarossa',
    group: 'Marke',
    label: 'Tramarossa',
    h1: 'Tramarossa Sakkos & Chinos online kaufen',
    title: 'Tramarossa Sakko & Chino kaufen — Shop Zürich',
    description:
      'Tramarossa bei The Sartorialist Zürich: entspannte Sakkos und Chinos aus italienischer Gabardine. Online bestellen oder im Showroom anprobieren.',
    intro:
      'Tramarossa aus Venetien verbindet italienische Schneiderei mit lässiger Haltung: unkonstruierte Sakkos und Chinos aus weicher Gabardine, die im Alltag genauso funktionieren wie im Büro. Kombinieren lässt sich alles untereinander — Sakko und Chino in derselben Farbe ergeben einen entspannten Anzug.',
    match: (p) => p.brand === 'Tramarossa',
  },
  {
    slug: 'herren',
    group: 'Für',
    label: 'Herren',
    h1: 'Herrenmode online kaufen',
    title: 'Herrenmode online kaufen — Parkas, Strick & Sakkos',
    description:
      'Italienische Herrenmode im Shop von The Sartorialist Zürich: Woolrich Parkas, Gran Sasso Strick und Tramarossa Sakkos. Versand in der ganzen Schweiz.',
    intro:
      'Ausgewählte Herrenmode zum Massanzug: Parkas und Mäntel für den Winter, Strick aus Merino und Cashmere, entspannte Sakkos und Chinos. Alles, was wir im Showroom an der Kuttelgasse führen, bestellen Sie hier direkt — mit Versand in die ganze Schweiz.',
    match: (p) => p.gender === 'Herren',
  },
  {
    slug: 'damen',
    group: 'Für',
    label: 'Damen',
    h1: 'Damen Parkas & Mäntel online kaufen',
    title: 'Damen Parka & Mantel kaufen — Shop Zürich',
    description:
      'Damen-Parkas und Mäntel von Woolrich bei The Sartorialist Zürich: Arctic Parka, Kelly Parka und Madison Coat. Online bestellen, Versand in der ganzen Schweiz.',
    intro:
      'Für Damen führen wir die Winterjacken von Woolrich: den klassischen Arctic Parka, den langen Kelly Parka und den Madison Coat — warm, wasserabweisend und zeitlos geschnitten. Gerne zeigen wir Ihnen die Modelle auch im Showroom in Zürich.',
    match: (p) => p.gender === 'Damen',
  },
  {
    slug: 'parkas',
    group: 'Kategorie',
    label: 'Parkas',
    h1: 'Parkas online kaufen',
    title: 'Parka kaufen — Woolrich Arctic & Cloud Parka',
    description:
      'Parkas für Herren und Damen bei The Sartorialist Zürich: Woolrich Arctic Parka, Cloud Parka, Polar und Ramar. Daunengefüllt und wasserabweisend.',
    intro:
      'Ein guter Parka hält den Schweizer Winter aus und sieht über dem Anzug genauso gut aus wie zur Jeans. Unsere Parkas von Woolrich sind mit Daunen gefüttert, wasserabweisend und haben eine abnehmbare Kapuze — vom kurzen Cloud Parka bis zum langen Arctic Parka.',
    match: (p) => p.category === 'Parkas',
  },
  {
    slug: 'maentel',
    group: 'Kategorie',
    label: 'Mäntel',
    h1: 'Mäntel online kaufen',
    title: 'Mantel kaufen — Wollmantel & Coat für Herren und Damen',
    description:
      'Mäntel bei The Sartorialist Zürich: Wollmäntel und Coats von Woolrich für Herren und Damen — elegant über dem Anzug, warm im Winter.',
    intro:
      'Ein Mantel ist das, was man über dem Anzug zuerst sieht. Unsere Mäntel aus Wolle und technischen Stoffen sind lang genug für das Sakko darunter und schlicht genug für jeden Anlass.',
    match: (p) => p.category === 'Mäntel',
  },
  {
    slug: 'strick',
    group: 'Kategorie',
    label: 'Strick',
    h1: 'Pullover & Strick online kaufen',
    title: 'Pullover & Cashmere kaufen — Strick aus Italien',
    description:
      'Pullover, Troyer und Strickjacken aus Merino und Cashmere bei The Sartorialist Zürich — gefertigt von Gran Sasso in Italien.',
    intro:
      'Strick aus Italien, der unter dem Sakko nicht aufträgt: feine Merino-Rollkragen, Troyer mit Reissverschluss, Cashmere-Pullover und Strickjacken. Die leichten Qualitäten tragen Sie das ganze Jahr, die schweren ersetzen im Herbst die Jacke.',
    match: (p) => p.group === 'Strick',
  },
  {
    slug: 'jacken',
    group: 'Kategorie',
    label: 'Jacken & Overshirts',
    h1: 'Jacken & Overshirts online kaufen',
    title: 'Jacke & Overshirt kaufen — Woolrich Wool Shirt Jacket',
    description:
      'Jacken und Overshirts bei The Sartorialist Zürich: Woolrich Wool Shirt Jackets, technische Overshirts und kurze Jacken für Herren und Damen.',
    intro:
      'Zwischen Hemd und Mantel: Overshirts aus Wolle und kurze Jacken für die Übergangszeit. Die Woolrich Wool Shirt Jacket ist seit Jahrzehnten ein Klassiker — robust, warm und in Melton-Wolle gewebt.',
    match: (p) => p.category === 'Jacken' || p.category === 'Overshirts',
  },
  {
    slug: 'sakkos-hosen',
    group: 'Kategorie',
    label: 'Sakkos & Hosen',
    h1: 'Sakkos & Hosen online kaufen',
    title: 'Sakko & Chino kaufen — italienische Herrenmode',
    description:
      'Sakkos und Chinos bei The Sartorialist Zürich: unkonstruierte Sakkos und Chinos aus italienischer Gabardine. Für den Massanzug: Termin im Showroom.',
    intro:
      'Sakkos und Hosen von der Stange, aber mit italienischer Hand: unkonstruiert, weich und bequem. Wer einen Anzug sucht, der wirklich sitzt, bucht bei uns einen Termin für den Massanzug — ab CHF 1’690, in 20 Arbeitstagen fertig.',
    match: (p) => p.group === 'Sakkos & Hosen',
  },
];

export function pageProducts(page: ShopPage, all: ShopProduct[]) {
  return all.filter(page.match);
}

export function activePages(all: ShopProduct[]) {
  return SHOP_PAGES.filter((pg) => all.some(pg.match));
}

/** Landingpage mit den Texten der Sprache (Deutsch = Original aus SHOP_PAGES). */
export function seiteIn(lang: Sprache, page: ShopPage): ShopPage {
  if (lang === 'de') return page;
  return { ...page, ...(woerterbuch(lang).shop.seiten[page.slug] ?? {}) };
}
