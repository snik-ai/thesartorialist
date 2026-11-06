'use client';

// Schnellsuche im Glossar: tippen → passende Begriffe mit Kurzantwort; Gruppen als Chips.
import Link from 'next/link';
import { useMemo, useState } from 'react';

type Eintrag = { slug: string; begriff: string; gruppe: string; kurz: string; auch: string[] };

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function GlossarSuche({ begriffe, gruppen }: { begriffe: Eintrag[]; gruppen: string[] }) {
  const [q, setQ] = useState('');
  const [g, setG] = useState('');
  const treffer = useMemo(() => {
    const t = norm(q.trim());
    return begriffe.filter(
      (b) => (!g || b.gruppe === g) && (!t || norm(b.begriff).includes(t) || b.auch.some((a) => norm(a).includes(t)) || norm(b.kurz).includes(t)),
    );
  }, [q, g, begriffe]);
  const aktiv = q.trim() || g;

  return (
    <div className="glossar-suche">
      <label className="glossar-field">
        <span>Begriff suchen</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="z. B. Revers, Flanell, Smoking …" aria-label="Glossar durchsuchen" />
      </label>
      <div className="glossar-chips" role="radiogroup" aria-label="Themen">
        <button type="button" role="radio" aria-checked={!g} className={!g ? 'is-on' : ''} onClick={() => setG('')}>
          Alle
        </button>
        {gruppen.map((x) => (
          <button key={x} type="button" role="radio" aria-checked={g === x} className={g === x ? 'is-on' : ''} onClick={() => setG(g === x ? '' : x)}>
            {x}
          </button>
        ))}
      </div>
      {aktiv && (
        <div className="glossar-treffer" aria-live="polite">
          <p className="muted">{treffer.length} {treffer.length === 1 ? 'Begriff' : 'Begriffe'}</p>
          <ul>
            {treffer.map((b) => (
              <li key={b.slug}>
                <Link href={`/glossar/${b.slug}/`}>
                  <span className="glossar-t">{b.begriff}</span>
                  <span className="glossar-k">{b.kurz}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
