'use client';
// Zahlungsplan im Auftrag: «Ganz» (eine Rechnung über alles) oder «Teilzahlung» (Raten in % oder CHF, Fälligkeit, Anlass).
// Vorlagen als Chips, Summenprüfung live, je Rate Status und «Rechnung erstellen». Verschickte Raten sind gesperrt.
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import DatumPicker from './DatumPicker';
import { MeldungZeile, useAktion } from './useAktion';
import { chf, rpAusText, rpZuText } from '@/lib/crm/geld';
import { PLAN_GANZ, RATE_STATUS, planPruefen, rate as neueRate, vorlagen, type RateStatus } from '@/lib/crm/zahlungsplan';
import type { Zahlungsplan as Plan, ZahlungsplanRate } from '@/lib/db/schema';
import './zahlung.css';

export type RateInfo = { rechnungId: string; nummer: string | null; status: RateStatus; betragRp: number; bezahltRp: number; mahnstufe: number; gesperrt: boolean };

const PILL: Record<RateStatus, string> = { geplant: 're-entwurf', entwurf: 're-entwurf', verschickt: 're-offen', teilbezahlt: 're-teilbezahlt', bezahlt: 're-bezahlt', ueberfaellig: 're-ueberfaellig' };
const MAHN = ['', 'Erinnerung', '1. Mahnung', '2. Mahnung'];

export default function Zahlungsplan({ auftragId, totalRp, plan, raten, anzahlungProzent, bezahltRp, storniert }: { auftragId: string; totalRp: number; plan: Plan | null; raten: Record<string, RateInfo>; anzahlungProzent: number; bezahltRp: number; storniert?: boolean }) {
  const router = useRouter();
  const { laedt, meldung, senden } = useAktion();
  const gespeichert = plan ?? PLAN_GANZ();
  const [p, setP] = useState<Plan>(gespeichert);
  const [texte, setTexte] = useState<Record<string, string>>({});
  const geaendert = JSON.stringify(p) !== JSON.stringify(gespeichert) || !plan;
  const pruef = useMemo(() => planPruefen(p, totalRp), [p, totalRp]);
  const gesperrt = (r: ZahlungsplanRate) => Boolean(raten[r.id]?.gesperrt);
  const irgendGesperrt = p.raten.some(gesperrt);
  const setRate = (id: string, teil: Partial<ZahlungsplanRate>) => setP({ ...p, raten: p.raten.map((r) => (r.id === id ? { ...r, ...teil } : r)) });
  const modus = (m: Plan['modus']) => {
    if (m === p.modus || irgendGesperrt) return;
    setTexte({});
    setP(m === 'ganz' ? PLAN_GANZ() : vorlagen(anzahlungProzent)[0].plan());
  };
  const wertText = (r: ZahlungsplanRate) => texte[r.id] ?? (r.art === 'prozent' ? String(r.wert).replace('.', ',') : rpZuText(r.wert));
  const fortschritt = totalRp > 0 ? Math.min(100, (bezahltRp / totalRp) * 100) : 0;

  async function speichern() {
    const r = await senden<{ plan: Plan }>(`/api/admin/auftraege/${auftragId}/`, { aktion: 'zahlungsplan', plan: p });
    if (r?.plan) {
      setP(r.plan);
      setTexte({});
    }
  }
  async function rechnung(rateId: string) {
    const r = await senden<{ id: string }>(`/api/admin/auftraege/${auftragId}/`, { aktion: 'rate-rechnung', rateId }, 'POST', { ohneRefresh: true });
    if (r) router.push(`/admin/rechnungen/${r.id}/`);
  }

  return (
    <section className="a-karte zp">
      <div className="a-karte-kopf">
        <h2>Zahlung</h2>
        <span className="a-sub zahl" style={{ margin: 0 }}>
          {chf(bezahltRp)} von {chf(totalRp)} bezahlt
        </span>
      </div>
      <div className="a-mini-fortschritt gross" aria-label={`${Math.round(fortschritt)} % bezahlt`}>
        <i style={{ width: `${fortschritt}%` }} />
      </div>
      <div className="a-karte-inhalt zp-inhalt">
        <div className="a-segment zp-modus" role="group" aria-label="Zahlungsart">
          <button type="button" aria-pressed={p.modus === 'ganz'} disabled={storniert || (irgendGesperrt && p.modus !== 'ganz')} onClick={() => modus('ganz')}>
            Ganz
          </button>
          <button type="button" aria-pressed={p.modus === 'teil'} disabled={storniert || (irgendGesperrt && p.modus !== 'teil')} onClick={() => modus('teil')}>
            Teilzahlung
          </button>
        </div>
        {p.modus === 'ganz' ? (
          <p className="a-sub zp-text">Eine Rechnung über das ganze Total von {chf(totalRp)}.</p>
        ) : (
          !irgendGesperrt && (
            <div className="a-chips zp-vorlagen" aria-label="Vorlagen">
              {vorlagen(anzahlungProzent).map((v) => (
                <button key={v.key} type="button" className="a-chip klein" onClick={() => { setTexte({}); setP(v.plan()); }}>
                  {v.label}
                </button>
              ))}
              <button type="button" className="a-chip klein" onClick={() => { setTexte({}); setP({ modus: 'teil', raten: [neueRate('1. Rate', 50, 'prozent', null)] }); }}>
                Frei
              </button>
            </div>
          )
        )}

        <ol className="zp-raten">
          {p.raten.map((r, i) => {
            const info = raten[r.id];
            const zu = gesperrt(r);
            const betrag = pruef.betraege[i] ?? 0;
            const letzte = i === p.raten.length - 1;
            return (
              <li key={r.id} className={`zp-rate${zu ? ' zu' : ''}`}>
                <div className="zp-kopf">
                  <span className="zp-nr zahl">{i + 1}</span>
                  {p.modus === 'teil' && !zu ? (
                    <input className="a-input zp-bez" value={r.bezeichnung} aria-label={`Bezeichnung Rate ${i + 1}`} onChange={(e) => setRate(r.id, { bezeichnung: e.target.value })} />
                  ) : (
                    <b className="zp-bez-t">{r.bezeichnung}</b>
                  )}
                  <b className="zp-betrag zahl">{chf(betrag)}</b>
                  {p.modus === 'teil' && !zu && p.raten.length > 1 && (
                    <button type="button" className="a-x" aria-label={`Rate ${i + 1} entfernen`} onClick={() => setP({ ...p, raten: p.raten.filter((x) => x.id !== r.id) })}>
                      <Icon name="x" />
                    </button>
                  )}
                </div>
                {p.modus === 'teil' && !zu && (
                  <div className="zp-felder">
                    <div className="a-segment klein" role="group" aria-label="Prozent oder Betrag">
                      <button type="button" aria-pressed={r.art === 'prozent'} onClick={() => { setRate(r.id, { art: 'prozent', wert: totalRp ? Math.round((betrag / totalRp) * 1000) / 10 : 0 }); setTexte((t) => { const n = { ...t }; delete n[r.id]; return n; }); }}>
                        %
                      </button>
                      <button type="button" aria-pressed={r.art === 'betrag'} onClick={() => { setRate(r.id, { art: 'betrag', wert: betrag }); setTexte((t) => { const n = { ...t }; delete n[r.id]; return n; }); }}>
                        CHF
                      </button>
                    </div>
                    <label className="zp-wert">
                      <input
                        className="a-input zahl"
                        inputMode="decimal"
                        value={wertText(r)}
                        aria-label={r.art === 'prozent' ? `Prozent Rate ${i + 1}` : `Betrag CHF Rate ${i + 1}`}
                        onChange={(e) => {
                          const t = e.target.value;
                          setTexte({ ...texte, [r.id]: t });
                          const n = r.art === 'prozent' ? Number(t.replace(',', '.')) : rpAusText(t);
                          if (n !== null && Number.isFinite(n) && n >= 0) setRate(r.id, { wert: n });
                        }}
                      />
                      <span>{r.art === 'prozent' ? '%' : 'CHF'}</span>
                    </label>
                    <DatumPicker klein wert={r.faelligAm} onChange={(v) => setRate(r.id, { faelligAm: v })} leer="Fällig am" />
                    <input className="a-input zp-anlass" value={r.anlass ?? ''} placeholder={letzte ? 'z. B. bei Abholung' : 'z. B. bei Bestellung'} aria-label={`Anlass Rate ${i + 1}`} onChange={(e) => setRate(r.id, { anlass: e.target.value || null })} />
                  </div>
                )}
                {(zu || p.modus === 'ganz') && (r.anlass || r.faelligAm) && (
                  <p className="zp-meta">
                    {[r.anlass, r.faelligAm ? `fällig ${r.faelligAm.split('-').reverse().join('.')}` : ''].filter(Boolean).join(' · ')}
                  </p>
                )}
                <div className="zp-status">
                  <span className={`a-pill ${PILL[info?.status ?? 'geplant']}`}>{RATE_STATUS[info?.status ?? 'geplant']}</span>
                  {info?.mahnstufe ? <span className="a-pill re-ueberfaellig">{MAHN[info.mahnstufe]}</span> : null}
                  {info ? (
                    <a href={`/admin/rechnungen/${info.rechnungId}/`} className="a-knopf leise klein">
                      <Icon name="rechnung" /> {info.nummer} öffnen
                    </a>
                  ) : (
                    <button type="button" className="a-knopf linie klein" disabled={laedt || geaendert || !pruef.ok || storniert} title={geaendert ? 'Zuerst den Zahlungsplan speichern' : undefined} onClick={() => rechnung(r.id)}>
                      <Icon name="rechnung" /> {p.raten.length === 1 ? 'Rechnung erstellen' : letzte ? 'Schlussrechnung erstellen' : 'Rechnung erstellen'}
                    </button>
                  )}
                  {info && info.status !== 'bezahlt' && info.bezahltRp > 0 && <span className="a-sub zahl" style={{ margin: 0 }}>{chf(info.bezahltRp)} bezahlt</span>}
                </div>
              </li>
            );
          })}
        </ol>

        {p.modus === 'teil' && p.raten.length < 6 && (
          <button type="button" className="a-knopf leise klein" onClick={() => setP({ ...p, raten: [...p.raten, neueRate(`${p.raten.length + 1}. Rate`, Math.max(0, Math.round(100 - pruef.summeProzent)) || 10, 'prozent', null)] })}>
            <Icon name="plus" /> Rate hinzufügen
          </button>
        )}

        <div className={`zp-summe${pruef.ok ? ' ok' : ' fehlt'}`}>
          <span>
            Summe <b className="zahl">{chf(pruef.summeRp)}</b> · <span className="zahl">{String(pruef.summeProzent).replace('.', ',')} %</span>
          </span>
          <span>{pruef.ok ? <><Icon name="check" /> entspricht dem Total</> : pruef.fehler}</span>
        </div>
        {geaendert && (
          <button type="button" className="a-knopf voll" disabled={laedt || !pruef.ok || storniert} onClick={speichern}>
            {plan ? 'Zahlungsplan speichern' : p.modus === 'ganz' ? 'Ganz verrechnen – festlegen' : 'Zahlungsplan festlegen'}
          </button>
        )}
        {p.modus === 'teil' && <p className="a-sub zp-text">Die letzte Rate ist die Schlussrechnung: Sie weist die bezahlten Raten aus und zieht sie ab. Verschickte Raten bleiben unverändert.</p>}
        <MeldungZeile m={meldung} />
      </div>
    </section>
  );
}
