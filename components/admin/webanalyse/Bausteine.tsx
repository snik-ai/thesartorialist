// Server-Bausteine der Webseitenanalyse: Bilanz, Kanal-Rangliste, Tabellen. Ohne Client-JavaScript.
import type { ReactNode } from 'react';
import type { Kennzahlen, Uebersicht } from '@/lib/crm/webanalyse';
import { kontakteSumme } from '@/lib/crm/webanalyse';
import { KONTAKTARTEN } from '@/lib/crm/bahnen';
import { dauer, quote, veraenderung, zahl } from './format';

/* ---------- Vergleich ---------- */

export function Delta({ wert, besserIst = 'hoch', pp, hell }: { wert: number | null; besserIst?: 'hoch' | 'tief'; pp?: boolean; hell?: boolean }) {
  if (wert === null) return <span className={`wa-delta leer${hell ? ' hell' : ''}`}>keine Vergleichsbasis</span>;
  const nahe = Math.abs(wert) < (pp ? 0.05 : 0.5);
  const gut = nahe ? null : wert > 0 === (besserIst === 'hoch');
  return (
    <span className={`wa-delta${gut === null ? '' : gut ? ' gut' : ' schlecht'}${hell ? ' hell' : ''}`}>
      {nahe ? '±' : wert > 0 ? '▲' : '▼'} {pp ? `${Math.abs(wert).toFixed(1)} Pp.` : `${Math.abs(wert).toFixed(0)} %`}
    </span>
  );
}

function Funke({ werte, farbe }: { werte: number[]; farbe: string }) {
  const max = Math.max(1, ...werte);
  const n = werte.length;
  if (n < 2) return null;
  const b = 120 / n;
  return (
    <svg className="wa-funke" viewBox="0 0 120 30" preserveAspectRatio="none" aria-hidden>
      <line x1="0" x2="120" y1="29.5" y2="29.5" stroke="var(--a-line)" />
      {werte.map((v, i) => (v ? <rect key={i} x={i * b + b * 0.15} width={Math.max(0.8, b * 0.7)} y={30 - Math.max(2, (v / max) * 28)} height={Math.max(2, (v / max) * 28)} fill={farbe} /> : null))}
    </svg>
  );
}

/* ---------- Bilanz ---------- */

export function Bilanz({ k, v, verlauf, backend }: { k: Kennzahlen; v: Kennzahlen; verlauf: Uebersicht['verlauf']; backend: Uebersicht['backend'] }) {
  const kontakte = kontakteSumme(k.kontakte);
  const kontakteV = kontakteSumme(v.kontakte);
  const pp = k.conversionRate !== null && v.conversionRate !== null ? (k.conversionRate - v.conversionRate) * 100 : null;
  const neben: { label: string; wert: string; d: number | null; besserIst?: 'hoch' | 'tief'; pp?: boolean }[] = [
    { label: 'Sitzungen', wert: zahl(k.sitzungen), d: veraenderung(k.sitzungen, v.sitzungen) },
    { label: 'Seitenaufrufe', wert: zahl(k.aufrufe), d: veraenderung(k.aufrufe, v.aufrufe) },
    { label: 'Seiten je Sitzung', wert: k.seitenJeSitzung ? k.seitenJeSitzung.toFixed(1) : '–', d: veraenderung(k.seitenJeSitzung, v.seitenJeSitzung) },
    { label: 'Ø Verweildauer', wert: dauer(k.verweildauerS), d: veraenderung(k.verweildauerS, v.verweildauerS) },
    {
      label: 'Absprungrate',
      wert: quote(k.absprungrate, 0),
      d: k.absprungrate !== null && v.absprungrate !== null ? (k.absprungrate - v.absprungrate) * 100 : null,
      besserIst: 'tief',
      pp: true,
    },
    { label: 'Engagierte Sitzungen', wert: zahl(k.engagiert), d: veraenderung(k.engagiert, v.engagiert) },
    { label: 'Route geöffnet', wert: zahl(k.route), d: veraenderung(k.route, v.route) },
  ];
  return (
    <section className="wa-bilanz" aria-label="Bilanz">
      <div className="wa-bilanz-band">
        <div className="wa-schritt">
          <span className="a-kicker">Besucher</span>
          <strong className="zahl">{zahl(k.besucher)}</strong>
          <Delta wert={veraenderung(k.besucher, v.besucher)} hell />
        </div>
        <span className="wa-pfeil-gross" aria-hidden>
          →
        </span>
        <div className="wa-schritt">
          <span className="a-kicker">Kontakte</span>
          <strong className="zahl">{zahl(kontakte)}</strong>
          <Delta wert={veraenderung(kontakte, kontakteV)} hell />
        </div>
        <span className="wa-pfeil-gross" aria-hidden>
          =
        </span>
        <div className="wa-schritt gold">
          <span className="a-kicker">Conversion-Rate</span>
          <strong className="zahl">{quote(k.conversionRate)}</strong>
          <Delta wert={pp} pp hell />
          <small>{zahl(k.mitKontakt)} von {zahl(k.sitzungen)} Sitzungen mit Kontakt</small>
        </div>
      </div>

      <div className="wa-kontakt-kacheln">
        {KONTAKTARTEN.map((a) => (
          <div className="wa-kachel" key={a.key}>
            <span className="a-kicker">
              <i style={{ background: a.farbe }} />
              {a.label}
            </span>
            <strong className="zahl">{zahl(k.kontakte[a.key])}</strong>
            <Delta wert={veraenderung(k.kontakte[a.key], v.kontakte[a.key])} />
            <Funke werte={verlauf.map((p) => p[a.key])} farbe={a.farbe} />
            <small>{a.quelle === 'backend' ? 'im Backend eingegangen' : 'Klicks auf der Website'}</small>
          </div>
        ))}
      </div>

      <div className="wa-neben">
        {neben.map((z) => (
          <div key={z.label}>
            <span>{z.label}</span>
            <b className="zahl">{z.wert}</b>
            <Delta wert={z.d} besserIst={z.besserIst} pp={z.pp} />
          </div>
        ))}
      </div>
      <p className="wa-fussnote">
        Anfragen im Backend: {zahl(backend.termin)} Terminanfragen, {zahl(backend.konfig)} mit Konfiguration, {zahl(backend.rueckruf)} Rückrufbitten (ohne im Atelier eingetragene Termine).
        Conversion-Rate = Sitzungen mit Anruf-, WhatsApp- oder E-Mail-Klick bzw. gesendeter Anfrage ÷ Sitzungen.
      </p>
    </section>
  );
}

/* ---------- Kanäle ---------- */

export function KanalListe({ u }: { u: Uebersicht }) {
  const max = Math.max(1, ...u.kanaele.map((k) => k.sitzungen));
  const schnitt = u.kennzahlen.conversionRate;
  const je = (kanal: string, art: string) => u.fluss.filter((f) => f.kanal === kanal && f.kontakt === art).reduce((s, f) => s + f.sitzungen, 0);
  if (!u.kanaele.length) return <p className="a-sub">Noch keine Besuche in diesem Zeitraum.</p>;
  return (
    <ul className="wa-kanaele">
      {u.kanaele.map((k) => {
        const ueber = schnitt !== null && k.conversionRate !== null && k.conversionRate > schnitt;
        return (
          <li key={k.schluessel}>
            <b className="name">{k.label}</b>
            <div className="spur" title={`${k.sitzungen} Sitzungen`}>
              <i className="grund" style={{ width: `${(k.sitzungen / max) * 100}%` }} />
              <span className="teile" style={{ width: `${(k.sitzungen / max) * 100}%` }}>
                {KONTAKTARTEN.map((a) => {
                  const w = je(k.schluessel, a.key);
                  return w ? <i key={a.key} title={`${a.label}: ${w}`} style={{ width: `${Math.max(2, (w / k.sitzungen) * 100)}%`, background: a.farbe }} /> : null;
                })}
              </span>
              <em className="zahl">{zahl(k.sitzungen)}</em>
            </div>
            <span className="mit zahl">
              <b>{zahl(k.mitKontakt)}</b> mit Kontakt · {dauer(k.verweildauerS)}
            </span>
            <span className={`wa-rate zahl${k.conversionRate === null ? ' leer' : ueber ? ' gut' : ''}`}>{quote(k.conversionRate)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Tabellen ---------- */

export type Spalte<T> = { kopf: string; zahl?: boolean; breit?: boolean; wert: (z: T) => ReactNode };

export function Tabelle<T>({ zeilen, spalten, leer = 'Für diesen Zeitraum liegen keine Zahlen vor.', balken }: { zeilen: readonly T[]; spalten: Spalte<T>[]; leer?: string; balken?: (z: T) => number }) {
  if (!zeilen.length) return <p className="a-sub wa-leer">{leer}</p>;
  const max = balken ? Math.max(1, ...zeilen.map(balken)) : 1;
  return (
    <div className="wa-tabelle-scroll">
      <table className="wa-tabelle">
        <thead>
          <tr>
            {spalten.map((s) => (
              <th key={s.kopf} scope="col" className={`${s.zahl ? 'r' : ''}${s.breit ? ' breit' : ''}`}>
                {s.kopf}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z, i) => (
            <tr key={i} style={balken ? ({ ['--w' as string]: `${(balken(z) / max) * 100}%` } as React.CSSProperties) : undefined} className={balken ? 'mit-balken' : ''}>
              {spalten.map((s) => (
                <td key={s.kopf} className={`${s.zahl ? 'r zahl' : ''}${s.breit ? ' breit' : ''}`}>
                  {s.wert(z)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Karte({ titel, unter, children, className }: { titel: string; unter?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`a-karte wa-karte${className ? ` ${className}` : ''}`}>
      <div className="a-karte-kopf">
        <div>
          <h2>{titel}</h2>
          {unter ? <p className="wa-unter">{unter}</p> : null}
        </div>
      </div>
      <div className="a-karte-inhalt">{children}</div>
    </section>
  );
}

export function Pfad({ pfad, titel }: { pfad: string; titel?: string | null }) {
  return (
    <span className="wa-pfad">
      <b>{pfad}</b>
      {titel ? <small>{titel.replace(/\s*[|–—-]\s*The Sartorialist.*$/i, '')}</small> : null}
    </span>
  );
}
