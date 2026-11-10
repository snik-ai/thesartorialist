'use client';
// Echtzeit: jetzt auf der Website (letzte 5 Min. inkl. Heartbeat), Aufrufe je Minute der letzten 30 Minuten,
// gerade gelesene Seiten und die letzten Ereignisse. Fragt alle 30 s nach (nur solange der Tab sichtbar ist).
import { useCallback, useEffect, useState } from 'react';
import type { Echtzeit as Daten } from '@/lib/crm/webanalyse';
import { zahl } from './format';

const KONTAKT = /^(click_tel|click_whatsapp|click_mail|anfrage_)/;
const uhr = (iso: string) => new Date(iso).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' });

export default function Echtzeit({ start }: { start: Daten | null }) {
  const [d, setD] = useState<Daten | null>(start);
  const [fehler, setFehler] = useState(false);

  const laden = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/webanalyse/echtzeit/', { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      setD(await r.json());
      setFehler(false);
    } catch {
      setFehler(true);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => document.visibilityState === 'visible' && laden(), 30_000);
    const sicht = () => document.visibilityState === 'visible' && laden();
    document.addEventListener('visibilitychange', sicht);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', sicht);
    };
  }, [laden]);

  const max = Math.max(1, ...(d?.minuten ?? [0]));
  const letzte = (d?.letzte ?? []).slice(0, 6);

  return (
    <section className="wa-echtzeit" aria-label="Echtzeit">
      <div className="wa-echt-jetzt">
        <span className={`wa-puls${d && d.aktiv > 0 ? ' an' : ''}`} aria-hidden />
        <div>
          <strong className="zahl" data-testid="echtzeit-aktiv">
            {d ? zahl(d.aktiv) : '…'}
          </strong>
          <span>jetzt auf der Website</span>
        </div>
      </div>

      <div className="wa-echt-minuten">
        <div className="wa-minuten" role="img" aria-label="Seitenaufrufe je Minute, letzte 30 Minuten">
          {(d?.minuten ?? Array(30).fill(0)).map((m, i) => (
            <i key={i} title={`vor ${29 - i} Min.: ${m} Aufrufe`} style={{ height: `${Math.max(5, (m / max) * 100)}%`, opacity: m ? 0.4 + 0.6 * (i / 29) : 0.14 }} className={m ? 'voll' : ''} />
          ))}
        </div>
        <p>
          Letzte 30 Min.: <b className="zahl">{zahl(d?.besucher ?? 0)}</b> Besucher · <b className="zahl">{zahl(d?.aufrufe ?? 0)}</b> Aufrufe ·{' '}
          <b className="zahl">{zahl(d?.kontakte ?? 0)}</b> Kontakte
          {d?.kanaele.length ? <> · meist über {d.kanaele[0].label}</> : null}
        </p>
      </div>

      <ul className="wa-echt-liste">
        {letzte.length === 0 && <li className="leer">{fehler ? 'Echtzeit gerade nicht erreichbar.' : 'In den letzten 30 Minuten war niemand auf der Website.'}</li>}
        {letzte.map((e, i) => (
          <li key={`${e.zeit}-${i}`} className={KONTAKT.test(e.typ) ? 'kontakt' : e.typ === 'pageview' ? '' : 'aktion'}>
            <time className="zahl">{uhr(e.zeit)}</time>
            <span>
              <b>{e.typ === 'pageview' ? e.pfad : e.label}</b>
              <small>
                {e.typ === 'pageview' ? e.kanal : e.pfad}
                {e.land ? ` · ${e.land}` : ''}
              </small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
