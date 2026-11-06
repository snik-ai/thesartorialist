import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { dbBereit } from '@/lib/db';
import { angebotGedrosselt, angebotPerToken } from '@/lib/crm/angebot-oeffentlich';
import { angebotAnzeigeStatus } from '@/lib/crm/belege';
import { chf, positionBetrag, summen } from '@/lib/crm/geld';
import { firma } from '@/lib/crm/firma';
import { stilGruppen } from '@/lib/crm/status';
import { SITE } from '@/lib/site';
import { tagDatum } from '@/lib/zeit';
import AngebotAnnahme from './AngebotAnnahme';

export const metadata: Metadata = { title: 'Ihr Angebot', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

function Ungueltig({ titel, text }: { titel: string; text: string }) {
  return (
    <main className="ao-seite">
      <header className="ao-kopf">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/marke/wortmarke-schwarz.png" alt="The Sartorialist Zürich" width={240} height={36} />
      </header>
      <section className="ao-karte ao-leer">
        <h1>{titel}</h1>
        <p>{text}</p>
        <div className="ao-knoepfe">
          <a className="ao-knopf" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
            {SITE.phone}
          </a>
          <a className="ao-knopf linie" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </div>
      </section>
    </main>
  );
}

export default async function AngebotOeffentlich({ params }: { params: Promise<{ token: string }> }) {
  if (!dbBereit()) return <Ungueltig titel="Gerade nicht verfügbar" text="Bitte versuchen Sie es später noch einmal oder melden Sie sich direkt bei uns." />;
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unbekannt';
  if (angebotGedrosselt(ip)) return <Ungueltig titel="Einen Moment bitte" text="Zu viele Aufrufe in kurzer Zeit. Bitte versuchen Sie es in einigen Minuten erneut." />;
  const { token } = await params;
  const t = await angebotPerToken(token, { ansehen: true });
  if (!t) return <Ungueltig titel="Link nicht mehr gültig" text="Dieser Angebotslink ist ungültig oder wurde durch einen neueren ersetzt. Gerne senden wir Ihnen das aktuelle Angebot." />;
  const { a, k } = t;
  const f = await firma();
  const st = angebotAnzeigeStatus(a);
  const s = summen(a.positionen, { rabattProzent: a.rabattProzent, rabattRp: a.rabattRp, mwstSatz: a.mwstSatz });
  const anrede = [k.anrede, k.name].filter(Boolean).join(' ');

  return (
    <main className="ao-seite">
      <header className="ao-kopf">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/marke/wortmarke-schwarz.png" alt="The Sartorialist Zürich" width={240} height={36} />
        <span>Angebot {a.nummer}</span>
      </header>

      <section className="ao-held">
        <span className="ao-kicker">Ihr persönliches Angebot</span>
        <h1>{a.titel || 'Massanfertigung'}</h1>
        <p>
          {anrede ? `Guten Tag ${anrede}. ` : ''}
          {a.einleitung}
        </p>
        <div className="ao-meta">
          <span>
            Datum <b>{tagDatum(a.gesendetAm ?? a.erstelltAm)}</b>
          </span>
          {a.gueltigBis && (
            <span>
              Gültig bis <b>{tagDatum(a.gueltigBis)}</b>
            </span>
          )}
          <span>
            Total <b>{chf(s.totalRp)}</b>
          </span>
        </div>
      </section>

      <section className="ao-karte">
        <h2>Leistungen</h2>
        <ul className="ao-pos">
          {a.positionen.map((p) => (
            <li key={p.id}>
              <div>
                <b>
                  {p.menge !== 1 ? `${p.menge} × ` : ''}
                  {p.bezeichnung}
                </b>
                {(p.beschreibung || p.stoffnummer) && <small>{[p.beschreibung, p.stoffnummer ? `Stoff ${p.stoffnummer}` : '', p.rabattProzent ? `Rabatt ${p.rabattProzent} %` : ''].filter(Boolean).join('\n')}</small>}
              </div>
              <span>{chf(positionBetrag(p))}</span>
            </li>
          ))}
        </ul>
        <div className="ao-summe">
          {s.rabattRp > 0 && (
            <>
              <div>
                <span>Zwischentotal</span>
                <span>{chf(s.zwischenRp)}</span>
              </div>
              <div>
                <span>Rabatt{a.rabattProzent ? ` ${a.rabattProzent} %` : ''}</span>
                <span>− {chf(s.rabattRp)}</span>
              </div>
            </>
          )}
          <div className="total">
            <span>Total</span>
            <span>{chf(s.totalRp)}</span>
          </div>
          {a.mwstSatz > 0 && (
            <div className="leise">
              <span>inkl. MWST {String(a.mwstSatz).replace('.', ',')} %</span>
              <span>{chf(s.mwstRp)}</span>
            </div>
          )}
        </div>
      </section>

      {(a.stil.length > 0 || a.stoffe.length > 0) && (
        <section className="ao-karte">
          <h2>Ihre Stil-Auswahl</h2>
          {a.stoffe.length > 0 && <p className="ao-stoff">Stoff · Holland &amp; Sherry · {a.stoffe.join(' · ')}</p>}
          <div className="ao-stil">
            {stilGruppen(a.stil).map((g) => (
              <div key={g.kategorie}>
                <h3>{g.kategorie}</h3>
                <dl>
                  {g.zeilen.map((z, i) => (
                    <div key={i}>
                      <dt>{z.untergruppe}</dt>
                      <dd>{z.option}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      {a.schluss && <p className="ao-schluss">{a.schluss}</p>}

      <AngebotAnnahme token={token} status={st} name={k.name} angenommen={a.angenommenAm ? { name: a.angenommenName ?? k.name, am: tagDatum(a.angenommenAm) } : null} />

      <footer className="ao-fuss">
        <a href={`/api/angebot/${token}/pdf/`} target="_blank" rel="noopener">
          Angebot als PDF
        </a>
        <span>
          {f.name} · {f.strasse}, {f.plz} {f.ort} · <a href={`tel:${f.telefon.replace(/\s/g, '')}`}>{f.telefon}</a>
        </span>
      </footer>
    </main>
  );
}
