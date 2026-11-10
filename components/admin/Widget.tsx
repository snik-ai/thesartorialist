'use client';
// Schreibtisch-Widget (Mac-App): Termine, offene Anfragen, Rechnungen, Aufträge, Besucher. Aktualisiert sich alle 90 s
// und beim Zurückkommen an den Mac. Klick auf einen Eintrag öffnet die Seite im Hauptfenster der App (Rust: haupt_oeffnen).
import { useCallback, useEffect, useState } from 'react';
import type { WidgetDaten } from '@/app/api/admin/widget/route';
import { chfKurz } from '@/lib/crm/geld';
import { istMacApp, nativ } from '@/lib/admin/mac-app';

const TAKT_MS = 90_000;
const ZWECK: Record<string, string> = { beratung: 'Beratung', massnehmen: 'Massnehmen', anprobe: 'Anprobe', abholung: 'Abholung' };

function oeffnen(pfad: string) {
  if (istMacApp()) void nativ('haupt_oeffnen', { pfad });
  else location.href = pfad;
}

const uhr = (iso: string) => new Date(iso).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' });
function tagText(iso: string) {
  const d = new Date(iso);
  const tz = { timeZone: 'Europe/Zurich' } as const;
  const tag = (x: Date) => x.toLocaleDateString('de-CH', tz);
  const heute = new Date();
  const morgen = new Date(heute.getTime() + 86_400_000);
  if (tag(d) === tag(heute)) return 'heute';
  if (tag(d) === tag(morgen)) return 'morgen';
  return d.toLocaleDateString('de-CH', { ...tz, weekday: 'short', day: 'numeric', month: 'numeric' });
}
const vorname = (n: string) => n.trim().split(/\s+/).slice(0, 2).join(' ') || 'Ohne Namen';

function Zeile({ pfad, kicker, wert, warn, children }: { pfad: string; kicker: string; wert: React.ReactNode; warn?: boolean; children?: React.ReactNode }) {
  return (
    <button type="button" className={`wg-zeile${warn ? ' warn' : ''}`} onClick={() => oeffnen(pfad)}>
      <span className="wg-kicker">{kicker}</span>
      <span className="wg-wert num">{wert}</span>
      {children && <span className="wg-detail">{children}</span>}
    </button>
  );
}

export default function Widget() {
  const [d, setD] = useState<WidgetDaten | null>(null);
  const [zustand, setZustand] = useState<'laden' | 'ok' | 'abgemeldet' | 'fehler'>('laden');

  const laden = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/widget/', { credentials: 'same-origin', cache: 'no-store' });
      if (r.status === 401 || r.status === 403) return setZustand('abgemeldet');
      if (!r.ok) return setZustand((z) => (z === 'ok' ? 'ok' : 'fehler'));
      setD(await r.json());
      setZustand('ok');
    } catch {
      setZustand((z) => (z === 'ok' ? 'ok' : 'fehler'));
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('wg-html');
    void laden();
    const t = setInterval(laden, TAKT_MS);
    const sichtbar = () => document.visibilityState === 'visible' && void laden();
    document.addEventListener('visibilitychange', sichtbar);
    window.addEventListener('focus', laden);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', sichtbar);
      window.removeEventListener('focus', laden);
    };
  }, [laden]);

  const anfragen = d ? d.anfragen.termine + d.anfragen.rueckrufe : 0;

  return (
    <div className="wg" data-tauri-drag-region>
      <header className="wg-kopf" data-tauri-drag-region>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/marke/monogramm-weiss.png" alt="" width={30} height={24} data-tauri-drag-region />
        <div data-tauri-drag-region>
          <b data-tauri-drag-region>Atelier heute</b>
          <small data-tauri-drag-region>{d ? `Stand ${uhr(d.stand)}` : 'The Sartorialist'}</small>
        </div>
        <button type="button" className="wg-neu" onClick={() => void laden()} aria-label="Aktualisieren" title="Aktualisieren">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />
          </svg>
        </button>
      </header>

      {zustand === 'abgemeldet' && (
        <button type="button" className="wg-hinweis" onClick={() => oeffnen('/admin/login/')}>
          <b>Nicht angemeldet</b>
          <span>In der App anmelden, dann erscheinen hier Termine, Anfragen und Rechnungen.</span>
        </button>
      )}
      {zustand === 'fehler' && !d && (
        <div className="wg-hinweis">
          <b>Keine Verbindung</b>
          <span>Neuer Versuch in Kürze.</span>
        </div>
      )}
      {zustand === 'laden' && !d && <div className="wg-hinweis"><span>Lädt …</span></div>}

      {d && zustand !== 'abgemeldet' && (
        <div className="wg-liste">
          <Zeile
            pfad={d.termine.naechster ? `/admin/termine/${d.termine.naechster.id}/` : '/admin/termine/'}
            kicker="Termine heute"
            wert={d.termine.heute}
          >
            {d.termine.naechster ? (
              <>
                Nächster: <b>{tagText(d.termine.naechster.start)} {uhr(d.termine.naechster.start)}</b> · {vorname(d.termine.naechster.name)} ·{' '}
                {ZWECK[d.termine.naechster.zweck] ?? 'Termin'}
              </>
            ) : (
              'Kein Termin geplant'
            )}
          </Zeile>
          <Zeile
            pfad={d.anfragen.neueste && anfragen === 1 ? `/admin/termine/${d.anfragen.neueste.id}/` : '/admin/termine/'}
            kicker="Neue Anfragen"
            wert={anfragen}
            warn={anfragen > 0}
          >
            {anfragen > 0 ? (
              <>
                {d.anfragen.termine} {d.anfragen.termine === 1 ? 'Terminanfrage' : 'Terminanfragen'} · {d.anfragen.rueckrufe}{' '}
                {d.anfragen.rueckrufe === 1 ? 'Rückruf' : 'Rückrufe'}
                {d.anfragen.neueste && <> · zuletzt {vorname(d.anfragen.neueste.name)}</>}
              </>
            ) : (
              'Alles beantwortet'
            )}
          </Zeile>
          <Zeile pfad="/admin/rechnungen/" kicker="Rechnungen offen" wert={chfKurz(d.rechnungen.offenRp)} warn={d.rechnungen.ueberfaelligAnzahl > 0}>
            {d.rechnungen.offenAnzahl} offen
            {d.rechnungen.ueberfaelligAnzahl > 0 ? (
              <>
                {' '}
                · <em>{d.rechnungen.ueberfaelligAnzahl} überfällig ({chfKurz(d.rechnungen.ueberfaelligRp)})</em>
              </>
            ) : (
              ' · nichts überfällig'
            )}
          </Zeile>
          <Zeile
            pfad={d.auftraege.naechsteLieferung ? `/admin/auftraege/${d.auftraege.naechsteLieferung.id}/` : '/admin/auftraege/'}
            kicker="Aufträge laufend"
            wert={d.auftraege.laufend}
          >
            {d.auftraege.naechsteLieferung ? (
              <>
                Lieferung <b>{tagText(d.auftraege.naechsteLieferung.liefertermin)}</b> · {d.auftraege.naechsteLieferung.nummer ?? d.auftraege.naechsteLieferung.titel}
              </>
            ) : (
              'Kein Liefertermin offen'
            )}
          </Zeile>
          <Zeile pfad="/admin/reichweite/" kicker="Besucher heute" wert={d.besucher.heute}>
            <i className={`wg-live${d.besucher.jetzt > 0 ? ' an' : ''}`} aria-hidden="true" />
            {d.besucher.jetzt} {d.besucher.jetzt === 1 ? 'Person' : 'Personen'} gerade auf der Website
          </Zeile>
        </div>
      )}
    </div>
  );
}
