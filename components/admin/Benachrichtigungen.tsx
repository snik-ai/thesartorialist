'use client';
// Einstellungen → Benachrichtigungen: Status dieses Geräts, aktivieren/deaktivieren, Test, Geräteliste.
import { useCallback, useEffect, useState } from 'react';
import Icon from './Icon';
import { aktivieren, aktuellesAbo, deaktivieren, kennungVon, pushStatus, testSenden, umgebung, type GeraetInfo, type Umgebung } from '@/lib/admin/push-geraet';

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

export default function Benachrichtigungen() {
  const [u, setU] = useState<Umgebung | null>(null);
  const [schluessel, setSchluessel] = useState('');
  const [geraete, setGeraete] = useState<GeraetInfo[]>([]);
  const [meins, setMeins] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [meldung, setMeldung] = useState<{ art: 'gruen' | 'rot'; text: string } | null>(null);

  const laden = useCallback(async () => {
    setU(umgebung());
    try {
      const [s, sub] = await Promise.all([pushStatus(), aktuellesAbo()]);
      setSchluessel(s.publicKey);
      setGeraete(s.geraete);
      setMeins(sub ? await kennungVon(sub.endpoint) : null);
    } catch (e) {
      setMeldung({ art: 'rot', text: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    laden();
  }, [laden]);

  const aktivHier = Boolean(meins && geraete.some((g) => g.kennung === meins));

  async function machen(fn: () => Promise<unknown>, ok: string) {
    setLaedt(true);
    setMeldung(null);
    try {
      await fn();
      setMeldung({ art: 'gruen', text: ok });
    } catch (e) {
      setMeldung({ art: 'rot', text: (e as Error).message });
    } finally {
      setLaedt(false);
      laden();
    }
  }

  async function entfernen(g: GeraetInfo) {
    if (g.kennung === meins) return machen(deaktivieren, 'Auf diesem Gerät deaktiviert.');
    if (!confirm(`Benachrichtigungen für «${g.geraet ?? 'Gerät'}» entfernen?`)) return;
    await machen(
      () => fetch('/api/admin/push/', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: g.id }) }),
      'Gerät entfernt.',
    );
  }

  let status: React.ReactNode;
  if (!u) status = 'Wird geprüft …';
  else if (u.iosBrowser && !u.kann)
    status = (
      <>
        Auf dem iPhone nur in der installierten App: in Safari <b>Teilen</b> → <b>Zum Home-Bildschirm</b>, dann die App öffnen.
      </>
    );
  else if (!u.kann) status = 'Dieser Browser unterstützt keine Benachrichtigungen.';
  else if (u.erlaubnis === 'denied') status = 'Blockiert — bitte in den Einstellungen des Geräts bzw. Browsers für diese Seite erlauben.';
  else if (aktivHier) status = 'Aktiv auf diesem Gerät.';
  else status = 'Auf diesem Gerät nicht aktiv.';

  return (
    <div className="a-karte">
      <div className="a-karte-kopf">
        <h2>Benachrichtigungen</h2>
        {aktivHier && <span className="a-pill bestaetigt">aktiv</span>}
      </div>
      <div className="a-karte-inhalt">
        <p className="a-sub" style={{ marginTop: 0 }}>
          Jede neue Terminanfrage und jeder Rückruf als Mitteilung aufs Handy oder den Computer.
        </p>
        <div className="a-push-status">
          <Icon name="glocke" />
          <span>{status}</span>
        </div>
        {u?.kann && u.erlaubnis !== 'denied' && (
          <div className="a-knopfreihe" style={{ marginTop: 14 }}>
            {aktivHier ? (
              <>
                <button type="button" className="a-knopf" disabled={laedt} onClick={() => machen(() => testSenden(undefined), 'Test-Nachricht an Ihre Geräte gesendet.')}>
                  Test senden
                </button>
                <button type="button" className="a-knopf linie" disabled={laedt} onClick={() => machen(deaktivieren, 'Auf diesem Gerät deaktiviert.')}>
                  Deaktivieren
                </button>
              </>
            ) : (
              <button type="button" className="a-knopf gold" disabled={laedt || !schluessel} onClick={() => machen(() => aktivieren(schluessel), 'Aktiviert — eine Test-Nachricht ist unterwegs.')}>
                <Icon name="glocke" /> {laedt ? 'Moment …' : 'Auf diesem Gerät aktivieren'}
              </button>
            )}
          </div>
        )}
        {meldung && (
          <p className={`a-hinweis ${meldung.art}`} style={{ marginTop: 12 }} role="status">
            {meldung.text}
          </p>
        )}
        {geraete.length > 0 && (
          <>
            <div className="a-trenner">Ihre Geräte</div>
            <ul className="a-geraete">
              {geraete.map((g) => (
                <li key={g.id}>
                  <div>
                    <b>
                      {g.geraet ?? 'Gerät'}
                      {g.kennung === meins && <span className="a-pill ohne">dieses Gerät</span>}
                    </b>
                    <small>
                      Seit {fmt(g.erstellt)}
                      {g.zuletztOk ? ` · zuletzt zugestellt ${fmt(g.zuletztOk)}` : ''}
                    </small>
                    {g.fehler && <small className="rot">Letzter Fehler: {g.fehler}</small>}
                  </div>
                  <button type="button" className="a-knopf rot klein" disabled={laedt} onClick={() => entfernen(g)}>
                    Entfernen
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
