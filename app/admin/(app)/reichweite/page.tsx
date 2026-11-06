import type { Metadata } from 'next';
import Link from 'next/link';
import ReichweiteChart from '@/components/admin/ReichweiteChart';
import { BAHNEN } from '@/lib/crm/bahnen';
import { kontakte, reichweite, type Summen } from '@/lib/crm/reichweite';

export const metadata: Metadata = { title: 'Reichweite & Anfragen' };
export const dynamic = 'force-dynamic';

const ZEITRAUM = [7, 30, 90] as const;
const zahl = (n: number) => n.toLocaleString('de-CH');
const prozent = (z: number, n: number) => (n ? (z / n) * 100 : 0);

function Delta({ jetzt, vorher, prozentpunkte }: { jetzt: number; vorher: number; prozentpunkte?: boolean }) {
  if (prozentpunkte) {
    const d = jetzt - vorher;
    if (Math.abs(d) < 0.05) return <span className="delta gleich">± 0 Pp. zur Vorperiode</span>;
    return <span className={`delta ${d > 0 ? 'auf' : 'ab'}`}>{`${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)} Pp. zur Vorperiode`}</span>;
  }
  if (!vorher) return <span className="delta gleich">{jetzt ? 'neu in diesem Zeitraum' : 'keine Daten'}</span>;
  const d = ((jetzt - vorher) / vorher) * 100;
  if (Math.abs(d) < 0.5) return <span className="delta gleich">± 0 % zur Vorperiode</span>;
  return <span className={`delta ${d > 0 ? 'auf' : 'ab'}`}>{`${d > 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(0)} % zur Vorperiode`}</span>;
}

function Ring({ teile }: { teile: { label: string; n: number; farbe: string }[] }) {
  const total = teile.reduce((s, t) => s + t.n, 0);
  const r = 46;
  const u = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="a-ring">
      <svg viewBox="0 0 120 120" role="img" aria-label="Geräte">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#efede8" strokeWidth="14" />
        {total > 0 &&
          teile.map((t) => {
            const len = (t.n / total) * u;
            const el = <circle key={t.label} cx="60" cy="60" r={r} fill="none" stroke={t.farbe} strokeWidth="14" strokeDasharray={`${len} ${u - len}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />;
            offset += len;
            return el;
          })}
        <text x="60" y="58" textAnchor="middle" style={{ font: '600 20px var(--sans)', fill: 'var(--a-ink)', fontVariantNumeric: 'tabular-nums' }}>
          {total ? `${Math.round(prozent(teile[0].n, total))}%` : '–'}
        </text>
        <text x="60" y="76" textAnchor="middle" style={{ font: '9px var(--sans)', fill: 'var(--a-muted)', letterSpacing: '0.04em' }}>
          {teile[0].label.toUpperCase()}
        </text>
      </svg>
      <div className="a-legende" style={{ flexDirection: 'column', gap: 8 }}>
        {teile.map((t) => (
          <span key={t.label}>
            <i style={{ background: t.farbe }} />
            {t.label} <b className="zahl">{total ? `${Math.round(prozent(t.n, total))} %` : '–'}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function Balken({ zeilen, farbe }: { zeilen: { label: string; n: number; extra?: string }[]; farbe?: string }) {
  const max = Math.max(1, ...zeilen.map((z) => z.n));
  if (!zeilen.length) return <p className="a-sub">Noch keine Daten in diesem Zeitraum.</p>;
  return (
    <ul className="a-balken">
      {zeilen.map((z) => (
        <li key={z.label}>
          <span title={z.label}>{z.label}</span>
          <b>
            {zahl(z.n)}
            {z.extra ? <small style={{ color: 'var(--a-muted)', fontWeight: 400 }}> {z.extra}</small> : null}
          </b>
          <i style={{ ['--w' as string]: `${(z.n / max) * 100}%`, ['--c' as string]: farbe }} />
        </li>
      ))}
    </ul>
  );
}

export default async function ReichweitePage({ searchParams }: { searchParams: Promise<{ tage?: string }> }) {
  const sp = await searchParams;
  const tage = ZEITRAUM.includes(Number(sp.tage) as 7) ? Number(sp.tage) : 30;
  const r = await reichweite(tage);
  const s: Summen = r.summe;
  const v: Summen = r.vorSumme;
  const quote = prozent(kontakte(s), s.besucher);
  const vorQuote = prozent(kontakte(v), v.besucher);
  const anfragen = s.rueckruf + s.termin;

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Website · cookielos gemessen</span>
          <h1>Reichweite &amp; Anfragen</h1>
          <p className="a-sub">Besucher, Kontaktwege und Anfragen der letzten {tage} Tage — im Vergleich zur Vorperiode.</p>
        </div>
        <div className="a-chips" role="navigation" aria-label="Zeitraum">
          {ZEITRAUM.map((z) => (
            <Link key={z} href={`/admin/reichweite/?tage=${z}`} className="a-chip" aria-current={z === tage ? 'page' : undefined}>
              {z} Tage
            </Link>
          ))}
        </div>
      </div>

      <div className="a-kpis">
        <div className="a-kpi">
          <span className="a-kicker">
            <i style={{ background: '#b08d57' }} />
            Besucher
          </span>
          <strong>{zahl(s.besucher)}</strong>
          <Delta jetzt={s.besucher} vorher={v.besucher} />
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Seitenaufrufe</span>
          <strong>{zahl(s.aufrufe)}</strong>
          <Delta jetzt={s.aufrufe} vorher={v.aufrufe} />
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Kontakte gesamt</span>
          <strong>{zahl(kontakte(s))}</strong>
          <Delta jetzt={kontakte(s)} vorher={kontakte(v)} />
        </div>
        <div className="a-kpi">
          <span className="a-kicker">
            <i style={{ background: '#b08d57' }} />
            Anfragen
          </span>
          <strong>{zahl(anfragen)}</strong>
          <Delta jetzt={anfragen} vorher={v.rueckruf + v.termin} />
        </div>
        <div className="a-kpi akzent">
          <span className="a-kicker">Conversion-Rate</span>
          <strong>{s.besucher ? `${quote.toFixed(1)} %` : '–'}</strong>
          <Delta jetzt={quote} vorher={vorQuote} prozentpunkte />
        </div>
      </div>

      <div className="a-karte" style={{ marginBottom: 18 }}>
        <div className="a-karte-kopf" style={{ flexWrap: 'wrap' }}>
          <h2>Besucher &amp; Kontaktwege pro Tag</h2>
          <div className="a-legende">
            <span>
              <i style={{ background: '#b08d57' }} />
              Besucher
            </span>
            <span>
              <i style={{ background: 'transparent', borderTop: '2px dashed #a9a49a', height: 0, width: 14 }} />
              Vorperiode
            </span>
            {BAHNEN.map((b) => (
              <span key={b.key}>
                <i style={{ background: b.farbe }} />
                {b.label}
              </span>
            ))}
          </div>
        </div>
        <div className="a-karte-inhalt">
          <ReichweiteChart tage={r.tage} vorTage={r.vorTage} />
          <p className="a-sub" style={{ fontSize: 12.5, marginTop: 10 }}>
            Conversion-Rate = Kontakte (Anruf-, WhatsApp- und E-Mail-Klicks, Rückrufe, Terminanfragen) ÷ Besucher. Ein Besucher zählt pro Tag einmal. Routen-Klicks: {zahl(s.route)}.
          </p>
        </div>
      </div>

      <div className="a-raster" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="a-karte">
          <div className="a-karte-kopf">
            <h2>Top-Seiten</h2>
          </div>
          <div className="a-karte-inhalt">
            <Balken zeilen={r.seiten.map((x) => ({ label: x.pfad, n: x.aufrufe, extra: `· ${x.besucher} Bes.` }))} />
          </div>
        </div>
        <div className="a-karte">
          <div className="a-karte-kopf">
            <h2>Herkunft</h2>
          </div>
          <div className="a-karte-inhalt">
            <Balken zeilen={r.herkunft.map((h) => ({ label: h.label, n: h.n }))} farbe="#b08d57" />
          </div>
        </div>
        <div className="a-karte">
          <div className="a-karte-kopf">
            <h2>Geräte</h2>
          </div>
          <div className="a-karte-inhalt">
            <Ring
              teile={[
                { label: 'Smartphone', n: r.geraete[0].n, farbe: '#101010' },
                { label: 'Computer', n: r.geraete[1].n, farbe: '#b08d57' },
                { label: 'Tablet', n: r.geraete[2].n, farbe: '#a9a49a' },
              ]}
            />
            {r.kampagnen.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <span className="a-kicker">Kampagnen (UTM)</span>
                <Balken zeilen={r.kampagnen.map((k) => ({ label: `${k.kampagne}${k.quelle ? ` · ${k.quelle}` : ''}`, n: k.n }))} farbe="#3b5b8c" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
