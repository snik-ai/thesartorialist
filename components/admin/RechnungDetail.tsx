'use client';
// Rechnung: Entwurf bearbeiten, festschreiben/senden (PDF mit QR-Zahlteil), Zahlungen erfassen, stornieren.
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import DatumPicker from './DatumPicker';
import PositionenEditor from './PositionenEditor';
import { MeldungZeile, useAktion } from './useAktion';
import { chf, rpAusText, rpZuText, summen } from '@/lib/crm/geld';
import { ZAHLUNG_ART } from '@/lib/crm/belege';
import type { Abzug, Position, ZahlungArt } from '@/lib/db/schema';
import type { KatalogEintrag } from '@/lib/crm/firma';

export type RechnungDaten = {
  id: string;
  status: string;
  art: string;
  titel: string;
  einleitung: string;
  schluss: string;
  positionen: Position[];
  rabattProzent: number;
  rabattRp: number;
  mwstSatz: number;
  abzug: Abzug[];
  betragRp: number;
  bezahltRp: number;
  rechnungsdatum: string | null;
  faelligAm: string | null;
};
export type ZahlungDaten = { id: string; betragRp: number; datum: string; art: ZahlungArt; notiz: string | null };

export default function RechnungDetail({ r, zahlungen, katalog, emailDa, mailBereit, kontoDa }: { r: RechnungDaten; zahlungen: ZahlungDaten[]; katalog: KatalogEintrag[]; emailDa: boolean; mailBereit: boolean; kontoDa: boolean }) {
  const router = useRouter();
  const [d, setD] = useState(r);
  const [geaendert, setGeaendert] = useState(false);
  const [senden, setSenden] = useState(false);
  const [nachricht, setNachricht] = useState('');
  const offen = Math.max(0, r.betragRp - r.bezahltRp);
  const [betrag, setBetrag] = useState(offen ? rpZuText(offen) : '');
  const [datum, setDatum] = useState<string | null>(new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' }));
  const [art, setArt] = useState<ZahlungArt>('bank');
  const a = useAktion();
  const entwurf = d.status === 'entwurf';
  const set = (t: Partial<RechnungDaten>) => {
    setD({ ...d, ...t });
    setGeaendert(true);
  };
  const s = useMemo(() => summen(d.positionen, { rabattProzent: d.rabattProzent, rabattRp: d.rabattRp, mwstSatz: d.mwstSatz }), [d]);
  const abzugSumme = d.abzug.reduce((x, z) => x + z.betragRp, 0);
  const zuZahlen = Math.max(0, s.totalRp - abzugSumme);
  const url = `/api/admin/rechnungen/${d.id}/`;

  async function speichern(still = false) {
    const ok = await a.senden(url, { titel: d.titel, einleitung: d.einleitung, schluss: d.schluss, positionen: d.positionen, rabattProzent: d.rabattProzent, rabattRp: d.rabattRp, rechnungsdatum: d.rechnungsdatum, faelligAm: d.faelligAm }, 'PATCH', { still });
    if (ok) setGeaendert(false);
    return Boolean(ok);
  }
  async function aktion(body: Record<string, unknown>) {
    if (geaendert && entwurf && !(await speichern(true))) return null;
    return a.senden(url, body);
  }

  return (
    <div className="a-beleg">
      <div className="a-beleg-haupt">
        {entwurf ? (
          <>
            <section className="a-karte">
              <div className="a-karte-inhalt">
                <label className="a-feld">
                  <span>Titel</span>
                  <input className="a-input gross" value={d.titel} onChange={(e) => set({ titel: e.target.value })} />
                </label>
                <label className="a-feld" style={{ margin: 0 }}>
                  <span>Einleitung</span>
                  <textarea className="a-input" rows={3} value={d.einleitung} onChange={(e) => set({ einleitung: e.target.value })} />
                </label>
              </div>
            </section>
            <section className="a-karte">
              <div className="a-karte-kopf">
                <h2>Positionen</h2>
                <span className="a-sub" style={{ margin: 0 }}>
                  Preise inkl. MWST
                </span>
              </div>
              <div className="a-karte-inhalt">
                <PositionenEditor positionen={d.positionen} onChange={(p) => set({ positionen: p })} katalog={katalog} />
              </div>
            </section>
            <section className="a-karte">
              <div className="a-karte-inhalt">
                <label className="a-feld" style={{ margin: 0 }}>
                  <span>Schlusstext</span>
                  <textarea className="a-input" rows={3} value={d.schluss} onChange={(e) => set({ schluss: e.target.value })} />
                </label>
              </div>
            </section>
          </>
        ) : (
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Positionen</h2>
              <a href={`${url}pdf/`} target="_blank" rel="noopener" className="a-knopf leise klein">
                <Icon name="pdf" /> PDF
              </a>
            </div>
            <div className="a-liste">
              {d.positionen.map((p, i) => (
                <div key={p.id} className="a-zeile" style={{ gridTemplateColumns: '28px minmax(0,1fr) auto' }}>
                  <span className="a-sub zahl" style={{ margin: 0 }}>
                    {i + 1}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="a-zeile-titel" style={{ display: 'block', whiteSpace: 'normal' }}>
                      {p.menge !== 1 ? `${p.menge} × ` : ''}
                      {p.bezeichnung}
                    </span>
                    {p.beschreibung && (
                      <span className="a-zeile-sub" style={{ display: 'block', whiteSpace: 'pre-line' }}>
                        {p.beschreibung}
                      </span>
                    )}
                  </span>
                  <b className="zahl">{chf(Math.round(p.menge * p.einzelpreisRp * (1 - (p.rabattProzent ?? 0) / 100)))}</b>
                </div>
              ))}
            </div>
          </section>
        )}

        {!entwurf && (
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Zahlungen</h2>
              <span className="a-sub zahl" style={{ margin: 0 }}>
                {chf(r.bezahltRp)} von {chf(r.betragRp)}
              </span>
            </div>
            <div className="a-mini-fortschritt gross">
              <i style={{ width: `${r.betragRp ? Math.min(100, (r.bezahltRp / r.betragRp) * 100) : 100}%`, background: 'var(--a-ok)' }} />
            </div>
            {zahlungen.length > 0 && (
              <div className="a-liste">
                {zahlungen.map((z) => (
                  <div key={z.id} className="a-zeile" style={{ gridTemplateColumns: 'minmax(0,1fr) auto auto' }}>
                    <span>
                      <span className="a-zeile-titel" style={{ display: 'block' }}>
                        {ZAHLUNG_ART[z.art]} · {new Date(z.datum).toLocaleDateString('de-CH', { timeZone: 'Europe/Zurich' })}
                      </span>
                      {z.notiz && <span className="a-zeile-sub">{z.notiz}</span>}
                    </span>
                    <b className="zahl">{chf(z.betragRp)}</b>
                    <button type="button" className="a-x" aria-label="Zahlung entfernen" onClick={() => confirm('Zahlung entfernen?') && a.senden(url, { aktion: 'zahlung-loeschen', zahlungId: z.id })}>
                      <Icon name="papierkorb" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {d.status !== 'storniert' && (
              <div className="a-karte-inhalt a-zahlung-neu">
                <label className="a-pos-feld preis">
                  <span>Betrag</span>
                  <span className="a-betrag">
                    <em>CHF</em>
                    <input className="a-input zahl" inputMode="decimal" value={betrag} onChange={(e) => setBetrag(e.target.value)} />
                  </span>
                </label>
                <DatumPicker label="Eingang am" wert={datum} onChange={setDatum} entfernbar={false} schnell={[['Heute', 0], ['Gestern', -1]]} />
                <div className="a-pos-feld">
                  <span>Art</span>
                  <div className="a-segment klein" role="group" aria-label="Zahlungsart">
                    {(Object.keys(ZAHLUNG_ART) as ZahlungArt[]).map((x) => (
                      <button key={x} type="button" aria-pressed={art === x} onClick={() => setArt(x)}>
                        {ZAHLUNG_ART[x].replace('Banküberweisung', 'Bank')}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="a-knopf gruen"
                  disabled={a.laedt || !rpAusText(betrag)}
                  onClick={async () => {
                    const ok = await a.senden(url, { aktion: 'zahlung', betragRp: rpAusText(betrag), datum, art });
                    if (ok) setBetrag('');
                  }}
                >
                  <Icon name="check" /> Zahlung erfassen
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      <aside className="a-beleg-seite">
        <section className="a-karte a-summe">
          <div className="a-karte-inhalt">
            {s.rabattRp > 0 && (
              <>
                <div className="a-summe-zeile">
                  <span>Zwischentotal</span>
                  <b className="zahl">{chf(s.zwischenRp)}</b>
                </div>
                <div className="a-summe-zeile">
                  <span>Rabatt{d.rabattProzent ? ` ${d.rabattProzent} %` : ''}</span>
                  <b className="zahl">− {chf(s.rabattRp)}</b>
                </div>
              </>
            )}
            <div className={abzugSumme ? 'a-summe-zeile' : 'a-summe-total'}>
              <span>Total</span>
              <b className="zahl">{chf(s.totalRp)}</b>
            </div>
            {d.mwstSatz > 0 && (
              <div className="a-summe-zeile leise">
                <span>inkl. MWST {String(d.mwstSatz).replace('.', ',')} %</span>
                <span className="zahl">{chf(s.mwstRp)}</span>
              </div>
            )}
            {d.abzug.map((z) => (
              <div key={z.rechnungId} className="a-summe-zeile">
                <span>abzüglich Anzahlung {z.nummer}</span>
                <b className="zahl">− {chf(z.betragRp)}</b>
              </div>
            ))}
            {abzugSumme > 0 && (
              <div className="a-summe-total">
                <span>Zu bezahlen</span>
                <b className="zahl">{chf(zuZahlen)}</b>
              </div>
            )}
            {!entwurf && r.bezahltRp > 0 && (
              <div className="a-summe-zeile">
                <span>Offen</span>
                <b className="zahl">{chf(offen)}</b>
              </div>
            )}
            {entwurf ? (
              <>
                <DatumPicker label="Rechnungsdatum" wert={d.rechnungsdatum} onChange={(v) => v && set({ rechnungsdatum: v })} entfernbar={false} />
                <DatumPicker label="Zahlbar bis" wert={d.faelligAm} onChange={(v) => v && set({ faelligAm: v })} entfernbar={false} schnell={[['10 Tage', 10], ['30 Tage', 30]]} />
                <button type="button" className={`a-knopf voll${geaendert ? '' : ' linie'}`} style={{ marginTop: 14 }} disabled={a.laedt || !geaendert} onClick={() => speichern()}>
                  {geaendert ? 'Änderungen speichern' : 'Gespeichert'}
                </button>
              </>
            ) : (
              <p className="a-sub" style={{ marginTop: 12 }}>
                Rechnungsdatum {d.rechnungsdatum ? new Date(d.rechnungsdatum).toLocaleDateString('de-CH') : '–'} · zahlbar bis {d.faelligAm ? new Date(d.faelligAm).toLocaleDateString('de-CH') : '–'}
              </p>
            )}
          </div>
        </section>

        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Versand</h2>
          </div>
          <div className="a-karte-inhalt a-aktionen">
            {!kontoDa && (
              <div className="a-hinweis rot">
                Für den QR-Zahlteil fehlt die IBAN. <a href="/admin/einstellungen/#firma" style={{ textDecoration: 'underline' }}>Unter Einstellungen erfassen</a>
              </div>
            )}
            <a
              href={`${url}pdf/`}
              target="_blank"
              rel="noopener"
              className="a-knopf linie voll"
              onClick={async (e) => {
                if (geaendert && entwurf) {
                  e.preventDefault();
                  if (await speichern(true)) window.open(`${url}pdf/`, '_blank', 'noopener');
                }
              }}
            >
              <Icon name="pdf" /> PDF mit QR-Zahlteil
            </a>
            {d.status !== 'storniert' && d.status !== 'bezahlt' && (
              <>
                <button type="button" className="a-knopf gold voll" onClick={() => setSenden(!senden)} aria-expanded={senden} disabled={!kontoDa}>
                  <Icon name="senden" /> Per E-Mail senden
                </button>
                {senden && (
                  <div className="a-unterpanel">
                    {!emailDa ? (
                      <p className="a-sub" style={{ margin: 0 }}>
                        Keine E-Mail-Adresse beim Kunden — PDF herunterladen und übergeben.
                      </p>
                    ) : (
                      <>
                        <label className="a-feld" style={{ margin: 0 }}>
                          <span>Persönliche Nachricht (optional)</span>
                          <textarea className="a-input" rows={3} value={nachricht} onChange={(e) => setNachricht(e.target.value)} />
                        </label>
                        <button type="button" className="a-knopf voll" disabled={a.laedt || !mailBereit} onClick={async () => (await aktion({ aktion: 'senden', nachricht })) && setSenden(false)}>
                          {mailBereit ? 'Rechnung senden' : 'E-Mail-Versand nicht konfiguriert'}
                        </button>
                      </>
                    )}
                  </div>
                )}
                {entwurf && (
                  <button type="button" className="a-knopf linie voll" disabled={a.laedt || !kontoDa} onClick={() => aktion({ aktion: 'festschreiben' })}>
                    <Icon name="check" /> Festschreiben (ohne Versand)
                  </button>
                )}
              </>
            )}
            <div className="a-knopfreihe">
              {entwurf ? (
                <button
                  type="button"
                  className="a-knopf leise klein rot"
                  onClick={async () => {
                    if (!confirm('Entwurf löschen?')) return;
                    if (await a.senden(url, undefined, 'DELETE', { ohneRefresh: true })) router.push('/admin/rechnungen/');
                  }}
                >
                  Entwurf löschen
                </button>
              ) : (
                d.status !== 'storniert' && (
                  <button type="button" className="a-knopf leise klein rot" onClick={() => confirm('Rechnung stornieren?') && aktion({ aktion: 'stornieren' })}>
                    Stornieren
                  </button>
                )
              )}
            </div>
            <MeldungZeile m={a.meldung} />
          </div>
        </section>
      </aside>
    </div>
  );
}
