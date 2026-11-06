'use client';
// Mahnwesen einer Rechnung (Seitenleiste): Vorschlag der nächsten Stufe, Stufen als Chips (Zahlungserinnerung,
// 1. Mahnung, 2. Mahnung), Mail in der Kundensprache an/aus, bisherige Mahnungen mit PDF (QR-Zahlteil) und Versand.
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { MeldungZeile, useAktion } from './useAktion';
import { chf } from '@/lib/crm/geld';
import './zahlung.css';

type Mahnung = { id: string; nummer: string; stufe: number; bezeichnung: string; datum: string; fristBis: string; gebuehrRp: number; offenRp: number; versendetAm: string | null; versendetAn: string | null };
type Daten = { status: string; mahnstufe: number; mahngebuehrenRp: number; offenRp: number; mahnfristBis: string | null; mahnungen: Mahnung[]; vorschlag: { stufe: number; faellig: boolean; ab: string; tageUeberfaellig: number; gebuehrRp: number; bezeichnung: string } | null };

const STUFEN: [number, string][] = [
  [1, 'Zahlungserinnerung'],
  [2, '1. Mahnung'],
  [3, '2. Mahnung'],
];
const tag = (iso: string) => new Date(iso).toLocaleDateString('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric' });

export default function MahnPanel({ rechnungId, emailDa, mailBereit }: { rechnungId: string; emailDa: boolean; mailBereit: boolean }) {
  const router = useRouter();
  const { laedt, meldung, senden } = useAktion();
  const [d, setD] = useState<Daten | null>(null);
  const [mail, setMail] = useState(emailDa && mailBereit);
  const url = `/api/admin/rechnungen/${rechnungId}/mahnung/`;
  const laden = useCallback(() => {
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setD(j))
      .catch(() => {});
  }, [url]);
  useEffect(laden, [laden]);

  if (!d) return <p className="a-sub" style={{ margin: 0 }}>Mahnwesen wird geladen …</p>;
  const offen = d.status === 'offen' || d.status === 'teilbezahlt';
  const naechste = d.mahnstufe + 1;
  const v = d.vorschlag;

  async function mahnen() {
    const r = await senden<{ id: string }>(url, { stufe: naechste, mail }, 'POST', { ohneRefresh: true });
    if (r) {
      laden();
      router.refresh();
    }
  }
  async function sendeMahnung(id: string) {
    if (await senden(`/api/admin/mahnungen/${id}/`, { aktion: 'senden' }, 'POST', { ohneRefresh: true })) laden();
  }

  return (
    <div className="mp">
      {offen && v && (
        <div className={`mp-vorschlag${v.faellig ? ' faellig' : ''}`}>
          <b>{v.faellig ? `${v.bezeichnung} fällig` : `Nächste Stufe: ${v.bezeichnung}`}</b>
          {v.tageUeberfaellig > 0 ? `${v.tageUeberfaellig} Tage überfällig` : 'Noch nicht überfällig'}
          {!v.faellig && ` · vorgeschlagen ab ${tag(v.ab)}`}
          {v.gebuehrRp ? ` · Mahngebühr ${chf(v.gebuehrRp)}` : ''}
        </div>
      )}
      {offen && naechste <= 3 && (
        <>
          <div className="a-chips" role="group" aria-label="Mahnstufe">
            {STUFEN.map(([s, l]) => (
              <span key={s} className={`a-chip klein statisch${s === naechste ? ' dunkel' : ''}`} aria-current={s === naechste ? 'step' : undefined}>
                {s <= d.mahnstufe ? <Icon name="check" /> : null}
                {l}
              </span>
            ))}
          </div>
          {emailDa && (
            <button type="button" className="a-toggle" aria-pressed={mail} disabled={!mailBereit} onClick={() => setMail(!mail)}>
              <i /> {mailBereit ? 'Per E-Mail senden (Sprache der Rechnung, PDF im Anhang)' : 'E-Mail-Versand nicht konfiguriert'}
            </button>
          )}
          <button type="button" className="a-knopf voll" disabled={laedt} onClick={mahnen}>
            <Icon name="mail" /> {STUFEN[naechste - 1][1]} {mail ? 'erstellen & senden' : 'erstellen'}
          </button>
        </>
      )}
      {offen && naechste > 3 && <div className="a-hinweis rot">Die 2. Mahnung ist verschickt. Als Nächstes folgt die Betreibung (ausserhalb des Backends).</div>}
      {!offen && !d.mahnungen.length && <p className="a-sub" style={{ margin: 0 }}>{d.status === 'bezahlt' ? 'Bezahlt – kein Mahnwesen nötig.' : 'Gemahnt werden nur festgeschriebene, offene Rechnungen.'}</p>}

      {d.mahnungen.length > 0 && (
        <ol className="mp-liste" aria-label="Bisherige Mahnungen">
          {d.mahnungen.map((m) => (
            <li key={m.id}>
              <span className="mp-stufe zahl">{m.stufe}</span>
              <span style={{ minWidth: 0 }}>
                <b>
                  {m.bezeichnung} <span className="zahl">{m.nummer}</span>
                </b>
                <small className="zahl">
                  {tag(m.datum)} · Frist {tag(m.fristBis)} · {chf(m.offenRp)}
                  {m.gebuehrRp ? ` inkl. ${chf(m.gebuehrRp)} Gebühr` : ''}
                  {m.versendetAm ? ` · gesendet ${tag(m.versendetAm)}` : ' · nicht per Mail gesendet'}
                </small>
              </span>
              <span className="mp-akt">
                <a className="a-knopf leise klein" href={`/api/admin/mahnungen/${m.id}/pdf/`} target="_blank" rel="noopener">
                  <Icon name="pdf" /> PDF
                </a>
                {!m.versendetAm && emailDa && mailBereit && offen && (
                  <button type="button" className="a-knopf linie klein" disabled={laedt} onClick={() => sendeMahnung(m.id)}>
                    <Icon name="senden" /> Senden
                  </button>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
      {d.mahngebuehrenRp > 0 && offen && (
        <p className="a-sub zahl" style={{ margin: 0 }}>
          Offen inkl. Mahngebühren: <b>{chf(d.offenRp)}</b>
        </p>
      )}
      <MeldungZeile m={meldung} />
    </div>
  );
}

/** Knopf in der Liste «Zu mahnen»: nächste Stufe erstellen (und senden, wenn möglich) */
export function MahnKnopf({ rechnungId, stufe, label, mail }: { rechnungId: string; stufe: number; label: string; mail: boolean }) {
  const { laedt, meldung, senden } = useAktion();
  return (
    <span className="zm-akt">
      <button type="button" className="a-knopf klein" disabled={laedt} onClick={() => senden(`/api/admin/rechnungen/${rechnungId}/mahnung/`, { stufe, mail })}>
        <Icon name={mail ? 'senden' : 'rechnung'} /> {label} {mail ? 'senden' : 'erstellen'}
      </button>
      <MeldungZeile m={meldung} />
    </span>
  );
}
