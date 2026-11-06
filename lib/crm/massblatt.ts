// Massblatt-Felder je Kleidungsstück (cm), Körperhaltung/Besonderheiten — gleich für Eingabe, Vergleich und PDF.

export type MassFeld = { key: string; label: string; einheit?: 'cm' | 'kg' | ''; hinweis?: string };
export type MassBereich = { key: string; titel: string; felder: MassFeld[] };

const cm = (key: string, label: string, hinweis?: string): MassFeld => ({ key, label, einheit: 'cm', hinweis });

export const MASS_BEREICHE: MassBereich[] = [
  {
    key: 'allgemein',
    titel: 'Allgemein',
    felder: [
      cm('allgemein.koerpergroesse', 'Körpergrösse'),
      { key: 'allgemein.gewicht', label: 'Gewicht', einheit: 'kg' },
      { key: 'allgemein.konfektion', label: 'Konfektionsgrösse', einheit: '' },
      { key: 'allgemein.schuh', label: 'Schuhgrösse', einheit: '' },
    ],
  },
  {
    key: 'sakko',
    titel: 'Sakko',
    felder: [
      cm('sakko.brust', 'Brustumfang'),
      cm('sakko.taille', 'Taillenumfang'),
      cm('sakko.huefte', 'Hüftumfang', 'Gesäss'),
      cm('sakko.schulter', 'Schulterbreite'),
      cm('sakko.ruecken_breite', 'Rückenbreite'),
      cm('sakko.ruecken_laenge', 'Rückenlänge', 'Halswirbel bis Taille'),
      cm('sakko.laenge', 'Sakkolänge'),
      cm('sakko.aermel_li', 'Ärmellänge links'),
      cm('sakko.aermel_re', 'Ärmellänge rechts'),
      cm('sakko.oberarm', 'Oberarmumfang'),
      cm('sakko.handgelenk', 'Handgelenk'),
      cm('sakko.vorderlaenge', 'Vorderlänge'),
    ],
  },
  {
    key: 'hose',
    titel: 'Hose',
    felder: [
      cm('hose.bund', 'Bundweite'),
      cm('hose.huefte', 'Hüftumfang'),
      cm('hose.schritt', 'Schrittlänge'),
      cm('hose.seite', 'Seitenlänge'),
      cm('hose.leibhoehe', 'Leibhöhe', 'Vorder- und Hinterhose'),
      cm('hose.oberschenkel', 'Oberschenkel'),
      cm('hose.knie', 'Knieweite'),
      cm('hose.wade', 'Wadenweite'),
      cm('hose.saum', 'Saumweite'),
    ],
  },
  {
    key: 'weste',
    titel: 'Weste',
    felder: [cm('weste.brust', 'Brustumfang'), cm('weste.taille', 'Taillenumfang'), cm('weste.laenge_vorne', 'Länge vorne'), cm('weste.laenge_hinten', 'Länge hinten'), cm('weste.ausschnitt', 'Ausschnitttiefe')],
  },
  {
    key: 'hemd',
    titel: 'Hemd',
    felder: [
      cm('hemd.hals', 'Halsweite'),
      cm('hemd.brust', 'Brustumfang'),
      cm('hemd.taille', 'Taillenumfang'),
      cm('hemd.huefte', 'Hüftumfang'),
      cm('hemd.schulter', 'Schulterbreite'),
      cm('hemd.laenge', 'Hemdlänge'),
      cm('hemd.aermel_li', 'Ärmellänge links'),
      cm('hemd.aermel_re', 'Ärmellänge rechts'),
      cm('hemd.manschette_li', 'Manschette links'),
      cm('hemd.manschette_re', 'Manschette rechts'),
      cm('hemd.oberarm', 'Oberarmumfang'),
    ],
  },
  {
    key: 'mantel',
    titel: 'Mantel',
    felder: [cm('mantel.brust', 'Brustumfang'), cm('mantel.taille', 'Taillenumfang'), cm('mantel.huefte', 'Hüftumfang'), cm('mantel.schulter', 'Schulterbreite'), cm('mantel.laenge', 'Mantellänge'), cm('mantel.aermel_li', 'Ärmellänge links'), cm('mantel.aermel_re', 'Ärmellänge rechts')],
  },
];

export const ALLE_FELDER = MASS_BEREICHE.flatMap((b) => b.felder);
export const FELD = Object.fromEntries(ALLE_FELDER.map((f) => [f.key, f])) as Record<string, MassFeld>;

/** Körperhaltung und Besonderheiten (Chips) */
export const KOERPER: { gruppe: string; optionen: string[] }[] = [
  { gruppe: 'Schultern', optionen: ['Hängende Schulter links', 'Hängende Schulter rechts', 'Schultern abfallend', 'Schultern gerade', 'Schultern breit'] },
  { gruppe: 'Haltung', optionen: ['Aufrecht', 'Vorgeneigt', 'Rundrücken', 'Hohlkreuz', 'Zurückgelehnt'] },
  { gruppe: 'Figur', optionen: ['Bauch', 'Starkes Gesäss', 'Flaches Gesäss', 'Breiter Brustkorb', 'Kräftige Oberschenkel', 'Kräftige Oberarme'] },
  { gruppe: 'Beine', optionen: ['O-Beine', 'X-Beine', 'Hohe Hüfte rechts', 'Hohe Hüfte links'] },
  { gruppe: 'Vorlieben', optionen: ['Taillierter Schnitt', 'Bequemer Schnitt', 'Ärmel kurz (Hemd sichtbar)', 'Hose ohne Bruch', 'Hose mit leichtem Bruch', 'Uhr links', 'Uhr rechts'] },
];

/** Wert aus Eingabe («98,5» → 98.5); leer → undefined; Text bei Feldern ohne Einheit */
export function massWert(feld: MassFeld, roh: string): number | string | undefined {
  const t = roh.trim();
  if (!t) return undefined;
  if (feld.einheit === '') return t.slice(0, 20);
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) && n > 0 && n < 400 ? Math.round(n * 10) / 10 : undefined;
}

export const massText = (v: number | string | undefined, einheit?: string) =>
  v === undefined || v === '' ? '' : typeof v === 'number' ? `${v.toLocaleString('de-CH', { maximumFractionDigits: 1 })}${einheit ? ` ${einheit}` : ''}` : v;

/** Differenz zur Vorversion («+1.5», «−0.5») oder '' */
export function differenz(jetzt: number | string | undefined, vorher: number | string | undefined): string {
  if (typeof jetzt !== 'number' || typeof vorher !== 'number') return '';
  const d = Math.round((jetzt - vorher) * 10) / 10;
  if (!d) return '';
  return `${d > 0 ? '+' : '−'}${Math.abs(d).toLocaleString('de-CH', { maximumFractionDigits: 1 })}`;
}

/** Masse aus unsicherer Eingabe bereinigen (nur bekannte Felder) */
export function masseAus(v: unknown): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  if (!v || typeof v !== 'object') return out;
  for (const [k, w] of Object.entries(v as Record<string, unknown>)) {
    const f = FELD[k];
    if (!f) continue;
    const x = massWert(f, typeof w === 'number' ? String(w) : typeof w === 'string' ? w : '');
    if (x !== undefined) out[k] = x;
  }
  return out;
}

const ALLE_KOERPER = new Set(KOERPER.flatMap((g) => g.optionen));
export const koerperAus = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && ALLE_KOERPER.has(x)))] : []);
