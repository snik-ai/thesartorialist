// Konfigurator-Analyse: wie viele den Stil-Konfigurator öffnen, wählen, welche Schritte sie erreichen, wo sie
// aufhören, was gewählt wird und wie viele daraus einen Termin machen. Zeitraum wie auf der Webseitenanalyse in
// der URL (?zeitraum=…&von=…&bis=…), verglichen mit der gleich langen Vorperiode.
import type { Metadata } from 'next';
import Link from 'next/link';
import '@/components/admin/webanalyse/webanalyse.css';
import { heuteZuerich, zeitraumAus } from '@/lib/crm/webanalyse';
import { konfigAnalyse, type KKennzahlen, type KStufe } from '@/lib/crm/konfiganalyse';
import Zeitraumwahl from '@/components/admin/webanalyse/Zeitraumwahl';
import KonfigTrichter from '@/components/admin/webanalyse/KonfigTrichter';
import { Delta, Karte, Tabelle, type Spalte } from '@/components/admin/webanalyse/Bausteine';
import { bereichText, dauer, eimerText, quote, veraenderung, zahl } from '@/components/admin/webanalyse/format';

export const metadata: Metadata = { title: 'Konfigurator · Webseitenanalyse' };
export const dynamic = 'force-dynamic';

const wert = (st: KStufe[], key: string) => st.find((s) => s.stufe === key)?.wert ?? 0;
const ppDelta = (a: number | null, b: number | null) => (a !== null && b !== null ? (a - b) * 100 : null);
const komma = (v: number | null, stellen = 1) => (v === null ? '–' : v.toLocaleString('de-CH', { minimumFractionDigits: stellen, maximumFractionDigits: stellen }));

function Kpis({ k, v }: { k: KKennzahlen; v: KKennzahlen }) {
  const haupt: { label: string; wert: string; d: number | null; pp?: boolean; unter?: string; gold?: boolean }[] = [
    { label: 'Geöffnet', wert: zahl(k.geoeffnet), d: veraenderung(k.geoeffnet, v.geoeffnet), unter: 'Sitzungen auf der Konfigurator-Seite' },
    { label: 'Mit Auswahl', wert: zahl(k.mitAuswahl), d: veraenderung(k.mitAuswahl, v.mitAuswahl), unter: `${quote(k.startquote)} der Geöffneten` },
    { label: 'Anzug vollständig', wert: zahl(k.anzugVollstaendig), d: veraenderung(k.anzugVollstaendig, v.anzugVollstaendig), unter: 'Sakko und Hose ganz konfiguriert' },
    { label: 'PDF', wert: zahl(k.pdf), d: veraenderung(k.pdf, v.pdf), unter: 'Auswahl als PDF geladen' },
    { label: 'Weiter zum Termin', wert: zahl(k.termin), d: veraenderung(k.termin, v.termin), unter: 'Klick «Termin mit Auswahl»' },
    { label: 'Anfrage mit Stil', wert: zahl(k.anfrage), d: veraenderung(k.anfrage, v.anfrage), unter: 'Terminanfrage gesendet', gold: true },
  ];
  const neben: { label: string; wert: string; d: number | null; pp?: boolean; besserIst?: 'hoch' | 'tief' }[] = [
    { label: 'Startquote', wert: quote(k.startquote), d: ppDelta(k.startquote, v.startquote), pp: true },
    { label: 'Abschlussquote', wert: quote(k.abschlussquote), d: ppDelta(k.abschlussquote, v.abschlussquote), pp: true },
    { label: 'Ø Details je Sitzung', wert: komma(k.wahlenSchnitt), d: veraenderung(k.wahlenSchnitt, v.wahlenSchnitt) },
    { label: 'Median Details', wert: komma(k.wahlenMedian, 0), d: veraenderung(k.wahlenMedian, v.wahlenMedian) },
    { label: 'Median bis PDF', wert: dauer(k.bisPdfS), d: veraenderung(k.bisPdfS, v.bisPdfS), besserIst: 'tief' },
    { label: 'Median bis Termin', wert: dauer(k.bisTerminS), d: veraenderung(k.bisTerminS, v.bisTerminS), besserIst: 'tief' },
    { label: 'Stoffnummer notiert', wert: zahl(k.stoffNotiert), d: veraenderung(k.stoffNotiert, v.stoffNotiert) },
    { label: 'Auswahl geleert', wert: zahl(k.geleert), d: veraenderung(k.geleert, v.geleert), besserIst: 'tief' },
  ];
  return (
    <section className="wa-bilanz" aria-label="Kennzahlen Konfigurator">
      <div className="wa-k-kacheln">
        {haupt.map((z) => (
          <div key={z.label} className={`wa-kachel${z.gold ? ' gold' : ''}`}>
            <span className="a-kicker">{z.label}</span>
            <strong className="zahl">{z.wert}</strong>
            <Delta wert={z.d} pp={z.pp} />
            {z.unter ? <small>{z.unter}</small> : null}
          </div>
        ))}
      </div>
      <div className="wa-neben acht">
        {neben.map((z) => (
          <div key={z.label}>
            <span>{z.label}</span>
            <b className="zahl">{z.wert}</b>
            <Delta wert={z.d} pp={z.pp} besserIst={z.besserIst} />
          </div>
        ))}
      </div>
      <p className="wa-fussnote">
        Startquote = Sitzungen mit mindestens einer Auswahl ÷ geöffnet. Abschlussquote = geöffnet und danach Terminanfrage mit Stil gesendet ÷ geöffnet. Zeiten = Median vom Öffnen bis
        zum PDF bzw. bis zum Klick auf «Termin». Vergleich mit der gleich langen Vorperiode.
      </p>
    </section>
  );
}

function Verlauf({ punkte, aufloesung }: { punkte: { schluessel: string; offen: number; start: number; ziel: number }[]; aufloesung: 'stunde' | 'tag' }) {
  const max = Math.max(1, ...punkte.map((p) => p.offen));
  const summe = punkte.reduce((s, p) => s + p.offen, 0);
  if (!summe) return <p className="a-sub wa-leer">Im Zeitraum keine Sitzungen im Konfigurator.</p>;
  const jede = Math.max(1, Math.ceil(punkte.length / 8));
  return (
    <div className="wa-kv">
      <div className="wa-kv-legende" aria-hidden>
        <span>
          <i className="o" /> Geöffnet
        </span>
        <span>
          <i className="s" /> Mit Auswahl
        </span>
        <span>
          <i className="z" /> PDF, Termin oder Anfrage
        </span>
      </div>
      <div className="wa-kv-balken" role="img" aria-label={`Sitzungen im Konfigurator ${aufloesung === 'stunde' ? 'pro Stunde' : 'pro Tag'}`}>
        {punkte.map((p) => (
          <div key={p.schluessel} title={`${eimerText(p.schluessel, true)}: ${p.offen} geöffnet, ${p.start} mit Auswahl, ${p.ziel} mit PDF/Termin/Anfrage`}>
            <i className="o" style={{ height: `${(p.offen / max) * 100}%` }} />
            <i className="s" style={{ height: `${(p.start / max) * 100}%` }} />
            <i className="z" style={{ height: `${(p.ziel / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="wa-kv-achse zahl" aria-hidden>
        {punkte.map((p, i) => (
          <span key={p.schluessel}>{i % jede === 0 ? eimerText(p.schluessel) : ''}</span>
        ))}
      </div>
    </div>
  );
}

type StufenZeile = { label: string; stufen: KStufe[] };
const stufenSpalten = (kopf: string): Spalte<StufenZeile>[] => [
  { kopf, wert: (z) => z.label },
  { kopf: 'Offen', zahl: true, wert: (z) => zahl(wert(z.stufen, 'offen')) },
  { kopf: 'Auswahl', zahl: true, breit: true, wert: (z) => zahl(wert(z.stufen, 'start')) },
  { kopf: 'Termin', zahl: true, wert: (z) => zahl(wert(z.stufen, 'termin')) },
  { kopf: 'Anfrage', zahl: true, wert: (z) => zahl(wert(z.stufen, 'anfrage')) },
  { kopf: 'Quote', zahl: true, breit: true, wert: (z) => quote(wert(z.stufen, 'offen') ? wert(z.stufen, 'anfrage') / wert(z.stufen, 'offen') : null, 1) },
];

export default async function KonfiguratorAnalysePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const heute = heuteZuerich();
  const z = zeitraumAus(sp, heute);
  const a = await konfigAnalyse(z);
  const k = a.kennzahlen;
  const q = new URLSearchParams(z.art === 'frei' ? { zeitraum: 'frei', von: z.von, bis: z.bis } : { zeitraum: z.art }).toString();
  const ausstiegSumme = a.ausstieg.reduce((s, x) => s + x.sitzungen, 0);
  const verteilungSumme = a.wahlenVerteilung.reduce((s, x) => s + x.sitzungen, 0);

  return (
    <div className="wa">
      <div className="a-kopf wa-kopf">
        <div>
          <Link href={`/admin/reichweite/?${q}`} className="wa-zurueck">
            ← Webseitenanalyse
          </Link>
          <span className="a-kicker">Website · Stil-Konfigurator</span>
          <h1>Konfigurator</h1>
          <p className="a-sub">
            Alle 9 Sprachen · <span className="zahl">{bereichText(z.von, z.bis)}</span> · verglichen mit <span className="zahl">{bereichText(z.vorher.von, z.vorher.bis)}</span>
          </p>
        </div>
        <Zeitraumwahl art={z.art} von={z.von} bis={z.bis} heute={heute} />
      </div>

      <Kpis k={k} v={a.vorperiode} />

      <Karte
        titel="Schritt für Schritt"
        unter="Jede Stufe zählt Sitzungen, die sie erreicht haben (Abschnitt mindestens 0,8 s im Blick oder eine Wahl darin). Wer per Reiter springt, überspringt Stufen — darum kann eine Stufe mehr haben als die vorige."
      >
        <KonfigTrichter trichter={a.trichter} vorher={a.trichterVorher} geraete={a.trichterGeraete} />
      </Karte>

      <div className="wa-zwei eng breit-links">
        <Karte titel={`Verlauf ${z.aufloesung === 'stunde' ? 'pro Stunde' : 'pro Tag'}`} unter="Sitzungen nach Beginn im Konfigurator">
          <Verlauf punkte={a.verlauf} aufloesung={z.aufloesung} />
        </Karte>
        <Karte titel="Wo sie aufhören" unter="Letzter erreichter Schritt der Sitzungen ohne PDF, Termin oder Anfrage">
          <Tabelle
            zeilen={a.ausstieg}
            balken={(x) => x.sitzungen}
            leer="Keine Abbrüche im Zeitraum."
            spalten={[
              { kopf: 'Letzter Schritt', wert: (x) => x.label },
              { kopf: 'Sitzungen', zahl: true, wert: (x) => zahl(x.sitzungen) },
              { kopf: 'Anteil', zahl: true, wert: (x) => quote(ausstiegSumme ? x.sitzungen / ausstiegSumme : null, 0) },
            ]}
          />
          <h3 className="wa-zwischen">Gewählte Details je Sitzung</h3>
          <Tabelle
            zeilen={a.wahlenVerteilung}
            balken={(x) => x.sitzungen}
            spalten={[
              { kopf: 'Umfang', wert: (x) => x.label },
              { kopf: 'Sitzungen', zahl: true, wert: (x) => zahl(x.sitzungen) },
              { kopf: 'Anteil', zahl: true, wert: (x) => quote(verteilungSumme ? x.sitzungen / verteilungSumme : null, 0) },
            ]}
          />
        </Karte>
      </div>

      <Karte titel="Kategorien" unter="Erreicht, mit mindestens einer Wahl, Ø gewählte Details und vollständig konfiguriert (jede Entscheidung getroffen; Ticket-Tasche und Monogramm sind Extras)">
        <Tabelle
          zeilen={a.kategorien}
          balken={(x) => x.erreicht}
          spalten={[
            { kopf: 'Kategorie', wert: (x) => <span className="wa-pfad"><b>{x.label}</b><small>{x.entscheidungen} Entscheidungen</small></span> },
            { kopf: 'Erreicht', zahl: true, wert: (x) => zahl(x.erreicht) },
            { kopf: 'Wahl', zahl: true, wert: (x) => zahl(x.mitAuswahl) },
            { kopf: 'Quote', zahl: true, breit: true, wert: (x) => quote(x.erreicht ? x.mitAuswahl / x.erreicht : null, 0) },
            { kopf: 'Ø Details', zahl: true, breit: true, wert: (x) => komma(x.wahlenSchnitt) },
            { kopf: 'Komplett', zahl: true, wert: (x) => zahl(x.vollstaendig) },
          ]}
        />
      </Karte>

      <Karte titel="Was gewählt wird" unter="Je Untergruppe: Sitzungen, die eine Option gewählt haben, und ihr Anteil in der Gruppe · «Details» = Info-Dialog geöffnet · «abgewählt» = wieder entfernt">
        <div className="wa-ko">
          {a.kategorien.map((kat, i) => {
            const gruppen = a.untergruppen[kat.id] ?? [];
            return (
              <details key={kat.id} className="wa-ko-kat" open={i === 0}>
                <summary>
                  <b>{kat.label}</b>
                  <span className="zahl">
                    {zahl(kat.mitAuswahl)} Sitzungen mit Wahl · {gruppen.length} Gruppen
                  </span>
                  <svg viewBox="0 0 16 16" aria-hidden>
                    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </summary>
                <div className="wa-ko-gruppen">
                  {gruppen.map((g) => {
                    const max = Math.max(1, ...g.optionen.map((o) => o.sitzungen));
                    return (
                      <section key={g.id} className="wa-ko-gruppe">
                        <h3>
                          {g.label} <span className="zahl">{zahl(g.sitzungen)}</span>
                        </h3>
                        <ol>
                          {g.optionen.map((o, j) => (
                            <li key={o.id} className={j === 0 && o.sitzungen > 0 ? 'top' : o.sitzungen === 0 ? 'null' : ''}>
                              <span className="name">{o.label}</span>
                              <span className="werte zahl">
                                <strong>{zahl(o.sitzungen)}</strong>
                                <em>{quote(o.anteil, 0)}</em>
                              </span>
                              <span className="spur" aria-hidden>
                                <b style={{ width: `${(o.sitzungen / max) * 100}%` }} />
                              </span>
                              {o.details > 0 || o.abwahlen > 0 ? (
                                <small className="zahl">
                                  {o.details > 0 ? `${zahl(o.details)} Details` : ''}
                                  {o.details > 0 && o.abwahlen > 0 ? ' · ' : ''}
                                  {o.abwahlen > 0 ? `${zahl(o.abwahlen)} abgewählt` : ''}
                                </small>
                              ) : null}
                            </li>
                          ))}
                        </ol>
                      </section>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </Karte>

      <div className="wa-zwei eng">
        <Karte titel="Nach Gerät" unter="Sitzungen je Stufe · Quote = Anfrage mit Stil ÷ geöffnet">
          <Tabelle zeilen={a.trichterGeraete} spalten={stufenSpalten('Gerät')} balken={(x) => wert(x.stufen, 'offen')} />
        </Karte>
        <Karte titel="Nach Sprache" unter="Sprachversion der Konfigurator-Seite">
          <Tabelle zeilen={a.sprachen} spalten={stufenSpalten('Sprache')} balken={(x) => wert(x.stufen, 'offen')} />
        </Karte>
      </div>

      <p className="wa-fussnote wa-schluss">
        Gemessen werden: Seite geöffnet, Schritt erreicht (Sakko, Hose, Weste, Smoking, Stoff, Übersicht), jede Wahl und Abwahl einer Option, geöffnete Details, vollständige
        Kategorien, geleerte Auswahl, notierte Stoffnummer, PDF, Klick auf «Termin» und die gesendete Terminanfrage mit Stil. Cookielos, ohne IP-Adressen; Sitzungen wie in der
        Webseitenanalyse. Messpunkte vor dem 12. Nov. 2026 kennen nur «begonnen», «PDF» und «Termin» — Schritte und Optionen gibt es erst ab dann.
      </p>
    </div>
  );
}
