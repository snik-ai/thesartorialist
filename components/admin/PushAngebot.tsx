'use client';
// «Benachrichtigungen aktivieren» — grosses Bottom-Sheet direkt nach der Anmeldung, solange dieses Gerät
// noch kein Push-Abo hat. iOS verlangt eine Nutzer-Geste: deshalb der Knopf, und der Schlüssel ist vorher geladen.
// «Später» gilt für diese Sitzung — beim nächsten Login erscheint das Angebot wieder.
// Im iOS-Safari-Tab (nicht installiert) gibt es kein Web-Push: dort Anleitung «Zum Home-Bildschirm».
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { aboMelden, aktivieren, aktuellesAbo, kennungVon, pushStatus, umgebung } from '@/lib/admin/push-geraet';

const MERKER = 'ts.push.spaeter';

type Modus = 'aus' | 'aktivieren' | 'ios' | 'erfolg';

export default function PushAngebot({ sitzung, onFertig }: { sitzung: string; onFertig: () => void }) {
  const [modus, setModus] = useState<Modus>('aus');
  const [schluessel, setSchluessel] = useState('');
  const [laedt, setLaedt] = useState(false);
  const [meldung, setMeldung] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  const fertigRef = useRef(onFertig);
  fertigRef.current = onFertig;

  const spaeterGemerkt = useCallback(() => {
    try {
      return localStorage.getItem(MERKER) === sitzung;
    } catch {
      return false;
    }
  }, [sitzung]);

  useEffect(() => {
    let weg = false;
    const fertig = () => !weg && fertigRef.current();
    (async () => {
      const u = umgebung();
      if (u.iosBrowser && !u.kann) {
        if (spaeterGemerkt()) return fertig();
        return setModus('ios');
      }
      if (!u.kann || u.erlaubnis === 'denied') return fertig();
      try {
        const [sub, status] = await Promise.all([aktuellesAbo(), pushStatus()]);
        if (weg) return;
        if (sub) {
          // Abo besteht lokal — fehlt es dem Server (z. B. nach 410), still nachmelden
          const k = await kennungVon(sub.endpoint);
          if (!status.geraete.some((g) => g.kennung === k)) await aboMelden(sub).catch(() => {});
          return fertig();
        }
        if (spaeterGemerkt()) return fertig();
        setSchluessel(status.publicKey);
        setModus('aktivieren');
      } catch {
        fertig();
      }
    })();
    return () => {
      weg = true;
    };
  }, [spaeterGemerkt]);

  const offen = modus !== 'aus';

  useEffect(() => {
    if (!offen) return;
    document.body.classList.add('a-sheet-offen');
    const t = setTimeout(() => dialog.current?.focus(), 350);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && schliessen(true);
    window.addEventListener('keydown', esc);
    return () => {
      clearTimeout(t);
      document.body.classList.remove('a-sheet-offen');
      window.removeEventListener('keydown', esc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offen]);

  function schliessen(spaeter: boolean) {
    if (spaeter) {
      try {
        localStorage.setItem(MERKER, sitzung);
      } catch {}
    }
    setModus('aus');
    fertigRef.current();
  }

  // Direkt im Klick-Handler: requestPermission ist der erste Aufruf (iOS: Nutzer-Geste)
  async function los() {
    setLaedt(true);
    setMeldung('');
    try {
      await aktivieren(schluessel);
      setModus('erfolg');
      setTimeout(() => dialog.current?.focus(), 50);
    } catch (e) {
      setMeldung((e as Error).message);
    } finally {
      setLaedt(false);
    }
  }

  if (!offen) return null;

  return (
    <div className="a-sheet-hg" onClick={(e) => e.target === e.currentTarget && schliessen(modus !== 'erfolg')}>
      <div ref={dialog} tabIndex={-1} className="a-sheet" role="dialog" aria-modal="true" aria-labelledby="push-titel" aria-describedby="push-text">
        <span className="a-sheet-griff" aria-hidden="true" />
        {modus === 'aktivieren' && (
          <>
            <div className="a-sheet-symbol" aria-hidden="true">
              <Icon name="glocke" />
            </div>
            <span className="a-kicker">Mitteilungen</span>
            <h2 id="push-titel">Benachrichtigungen aktivieren</h2>
            <p id="push-text">Sie erhalten jede Terminanfrage und jeden Rückruf sofort — auch wenn die App geschlossen ist.</p>
            <Vorschau />
            {meldung && (
              <p className="a-hinweis rot" role="alert">
                {meldung}
              </p>
            )}
            <div className="a-sheet-knoepfe">
              <button type="button" className="a-knopf gold voll gross" onClick={los} disabled={laedt || !schluessel}>
                {laedt ? 'Moment …' : 'Aktivieren'}
              </button>
              <button type="button" className="a-knopf leise voll" onClick={() => schliessen(true)}>
                Später
              </button>
            </div>
          </>
        )}
        {modus === 'ios' && (
          <>
            <div className="a-sheet-symbol" aria-hidden="true">
              <Icon name="plusquadrat" />
            </div>
            <span className="a-kicker">Mitteilungen auf dem iPhone</span>
            <h2 id="push-titel">Zum Home-Bildschirm hinzufügen</h2>
            <p id="push-text">Auf dem iPhone kommen Benachrichtigungen nur in der installierten App an. So geht es:</p>
            <ol className="a-sheet-schritte">
              <li>
                <i className="zahl">1</i>
                <span>
                  Unten in Safari auf <b>Teilen</b> tippen <Icon name="teilen" className="a-inline-icon" />
                </span>
              </li>
              <li>
                <i className="zahl">2</i>
                <span>
                  <b>Zum Home-Bildschirm</b> wählen <Icon name="plusquadrat" className="a-inline-icon" />
                </span>
              </li>
              <li>
                <i className="zahl">3</i>
                <span>Die App «Sartorialist» öffnen, anmelden und Benachrichtigungen aktivieren.</span>
              </li>
            </ol>
            <div className="a-sheet-knoepfe">
              <button type="button" className="a-knopf voll gross" onClick={() => schliessen(true)}>
                Verstanden
              </button>
            </div>
          </>
        )}
        {modus === 'erfolg' && (
          <>
            <div className="a-sheet-symbol ok" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <span className="a-kicker">Mitteilungen</span>
            <h2 id="push-titel">Benachrichtigungen sind aktiv</h2>
            <p id="push-text">Eine Test-Nachricht ist unterwegs. Ab jetzt meldet sich die App bei jeder neuen Anfrage.</p>
            <div className="a-sheet-knoepfe">
              <button type="button" className="a-knopf voll gross" onClick={() => schliessen(false)}>
                Fertig
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** So sieht eine Mitteilung aus (Beispiel, keine echten Daten) */
function Vorschau() {
  return (
    <div className="a-sheet-vorschau" aria-hidden="true">
      <img src="/icon-192.png" alt="" width={38} height={38} />
      <div>
        <small>
          <span>SARTORIALIST</span>
          <span>jetzt</span>
        </small>
        <b>Neue Terminanfrage — Max Muster</b>
        <span>Do, 13.11. um 14:00 · mit Stil-Auswahl</span>
      </div>
    </div>
  );
}
