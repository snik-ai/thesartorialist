// Wörterbücher aller Sprachen — nur auf dem Server verwenden (Seiten, Layouts, API).
// Client-Komponenten bekommen ihre Texte als Props bzw. über den SprachKontext,
// damit nie alle Sprachen im Browser-Bundle landen.
import { de, type Woerterbuch } from './de';
import { en } from './en';
import { fr } from './fr';
import { it } from './it';
import { es } from './es';
import { ptPt } from './pt-pt';
import { ru } from './ru';
import { sr } from './sr';
import { sq } from './sq';
import type { Sprache } from './sprachen';

const ALLE: Record<Sprache, Woerterbuch> = { de, en, fr, it, es, 'pt-pt': ptPt, ru, sr, sq };

export function woerterbuch(lang: Sprache): Woerterbuch {
  return ALLE[lang] ?? de;
}

export type { Woerterbuch };
