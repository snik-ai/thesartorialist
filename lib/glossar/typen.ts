// Glossar: ein Begriff = eine eigene Seite unter /glossar/<slug>/ (Hausregel).
export type GlossarGruppe = 'Grundlagen' | 'Passform' | 'Sakko' | 'Hose' | 'Weste & Anlass' | 'Hochzeit' | 'Stoffe' | 'Muster' | 'Hemd' | 'Accessoires' | 'Pflege';

export type GlossarBegriff = {
  /** URL-Slug, klein, ohne Umlaute (ae/oe/ue), Bindestriche */
  slug: string;
  /** Begriff wie im H1 (Keyword) */
  begriff: string;
  /** Alternative Bezeichnungen / Synonyme (auch englisch/italienisch) */
  auchGenannt?: string[];
  gruppe: GlossarGruppe;
  /** Meta-Title (≤ 60 Zeichen, ohne Markenname – das Template hängt ihn an) */
  metaTitle: string;
  /** Meta-Description (140–155 Zeichen) */
  metaDescription: string;
  /** Kurzantwort: beantwortet «Was ist …?» direkt in 2–3 Sätzen (GEO) */
  kurz: string;
  /** Ausführliche Abschnitte mit H2 (mind. 4), jeder Text 80–160 Wörter, Absätze mit \n\n trennen */
  abschnitte: { titel: string; text: string }[];
  /** Konkretes Beispiel / Anwendungsfall */
  beispiel: { titel: string; text: string };
  /** 3 echte Fragen mit Antwort (2–4 Sätze) */
  faq: { frage: string; antwort: string }[];
  /** Slugs verwandter Glossar-Begriffe (3–5, müssen existieren) */
  verwandt: string[];
  /** Interne Links auf Leistungs-/Themenseiten (2–4) */
  links: { label: string; href: string }[];
  /** Bild (Pfad aus der Bildliste) + Alt-Text */
  bild: string;
  bildAlt: string;
};
