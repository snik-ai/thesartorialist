// Sortiments-Struktur für Filter und Navigation: Gruppe → Unterkategorie → Modell.
// Shopify liefert keine Produkttypen; abgeleitet wird aus dem Titel. Neue Stücke
// fallen automatisch in die passende Stelle, unbekannte landen in «Jacken».

export type Taxo = { group: string; sub: string; type: string | null };

export const GROUPS = ['Jacken & Mäntel', 'Strick', 'Sakkos & Hosen'] as const;

export function taxonomy(title: string, brand: string): Taxo {
  const t = title.toLowerCase();
  if (/parka/.test(t)) {
    const line = /^cloud/.test(t) ? 'Cloud Parka'
      : /^stretch/.test(t) ? 'Stretch Arctic'
      : /^ramar/.test(t) ? 'Ramar Arctic'
      : /^kelly/.test(t) ? 'Kelly Parka'
      : /^polar/.test(t) ? 'Polar Parka'
      : /arctic/.test(t) ? 'Arctic Parka' : null;
    return { group: 'Jacken & Mäntel', sub: 'Parkas', type: line };
  }
  if (/\bcoat\b|mantel/.test(t)) {
    const line = /madison/.test(t) ? 'Madison' : /wool/.test(t) ? 'Wollmantel' : /ripstop/.test(t) ? 'Technisch' : null;
    return { group: 'Jacken & Mäntel', sub: 'Mäntel', type: line };
  }
  if (/overshirt|shirt jacket/.test(t)) {
    const line = /alaskan/.test(t) ? 'Alaskan' : /keating/.test(t) ? 'Keating' : 'Overshirt';
    return { group: 'Jacken & Mäntel', sub: 'Overshirts', type: line };
  }
  if (/\bpant|chino|hose|jeans/.test(t)) return { group: 'Sakkos & Hosen', sub: 'Chinos', type: null };
  if (/breasted jacket|blazer|sakko/.test(t)) {
    return { group: 'Sakkos & Hosen', sub: 'Sakkos', type: /double/.test(t) ? 'Zweireiher' : 'Einreiher' };
  }
  if (brand === 'Gran Sasso' || /cashmere|merino|knit|crew neck|pullover|polo/.test(t)) {
    const sub = /polo/.test(t) ? 'Polos'
      : /full zip|rib jacket|cardigan/.test(t) ? 'Strickjacken'
      : /mock zip|half zip|troyer/.test(t) ? 'Troyer'
      : /crew neck|rundhals/.test(t) ? 'Rundhals'
      : /mock|turtle|rollkragen/.test(t) ? 'Stehkragen' : 'Pullover';
    const fiber = /cashmere/.test(t) ? 'Cashmere' : /merino/.test(t) ? 'Merino' : /wool/.test(t) ? 'Wolle' : null;
    return { group: 'Strick', sub, type: fiber };
  }
  return { group: 'Jacken & Mäntel', sub: 'Jacken', type: /madison/.test(t) ? 'Madison' : /kelly/.test(t) ? 'Kelly' : null };
}

// Farbfamilien aus den Farbnamen im Titel (englisch oder deutsch)
const COLORS: [RegExp, string][] = [
  [/black|schwarz/, 'Schwarz'],
  [/bordeaux|\bred\b|\brot\b/, 'Rot'],
  [/beige|champagne|sand|ecru/, 'Beige'],
  [/brown|braun|hazel|falcon|earth|camel/, 'Braun'],
  [/green|grün|olive/, 'Grün'],
  [/grey|gray|grau|concrete|charcoal/, 'Grau'],
  [/navy|blue|blau|melton/, 'Blau'],
];
export function colorOf(title: string): string | null {
  const t = title.toLowerCase();
  // Letzte Farbangabe im Titel zählt («… Melton Blue» vs. «Dark Brown»)
  let best: { i: number; c: string } | null = null;
  for (const [re, c] of COLORS) {
    const m = [...t.matchAll(new RegExp(re.source, 'g'))].pop();
    if (m && m.index !== undefined && (!best || m.index > best.i)) best = { i: m.index, c };
  }
  return best?.c ?? null;
}

export const SWATCH: Record<string, string> = {
  Schwarz: '#161616',
  Blau: '#26354f',
  Grün: '#5b6a48',
  Braun: '#6b4a33',
  Grau: '#9a9a96',
  Beige: '#d9cba9',
  Rot: '#6d1f2a',
};

/** Grössensystem: int (XS–XXL), it (44–56), w (Bundweite Hosen). */
export function sizeKey(size: string, sub: string): string {
  if (/^\d+$/.test(size)) return sub === 'Chinos' ? `w-${size}` : `it-${size}`;
  return `int-${size.toUpperCase()}`;
}
export const SIZE_SYSTEMS: Record<string, string> = { int: 'International', it: 'Italienisch (Sakko, Strick)', w: 'Bundweite (Hosen)' };
const LETTERS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
export function sizeSort(a: string, b: string) {
  const [sa, va] = a.split('-');
  const [sb, vb] = b.split('-');
  const sys = ['int', 'it', 'w'];
  if (sa !== sb) return sys.indexOf(sa) - sys.indexOf(sb);
  if (sa === 'int') return LETTERS.indexOf(va) - LETTERS.indexOf(vb);
  return Number(va) - Number(vb);
}
