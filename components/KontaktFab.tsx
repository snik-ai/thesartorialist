'use client';

// Schwebender Kontakt-Knopf unten rechts: WhatsApp und Termin in einem Panel,
// mit Live-Öffnungszeiten (Zeitzone Zürich). Geöffnet: WhatsApp, Anrufen, Termin.
// Geschlossen: WhatsApp, Rückruf anfordern, Terminanfrage.
// Rückruf läuft wie die Terminbuchung über eine vorbefüllte E-Mail (kein Server).
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/lib/site';
import { pfad } from '@/lib/i18n/routen';
import { fmt } from '@/lib/i18n/fmt';
import { useSprache, type ClientTexte } from './i18n/SprachKontext';
import { melde } from '@/lib/tracking/melden';
import RatgeberKnopf from './ratgeber/RatgeberKnopf';
import { RATGEBER, RATGEBER_EVENT } from '@/lib/ratgeber';

const ZEITEN_DE = ['Vormittag', 'Mittag', 'Nachmittag', 'Abend'];
// Nur zum Lesen der Zürcher Uhrzeit (Intl de-CH), nicht zur Anzeige
const KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Jetzt in Zürich: Wochentag und Minuten seit Mitternacht. */
function jetztZuerich() {
  const parts = new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const tag = KURZ.indexOf(get('weekday').replace('.', '').slice(0, 2));
  return { tag, min: Number(get('hour')) * 60 + Number(get('minute')) };
}
const zuMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

export type Status = { offen: boolean; text: string; morgen?: boolean };
export function oeffnungsStatus(t: ClientTexte['fab']): Status {
  const { tag, min } = jetztZuerich();
  const heute = SITE.hours[tag];
  if (heute && min >= zuMin(heute[0]) && min < zuMin(heute[1])) {
    const rest = zuMin(heute[1]) - min;
    return { offen: true, text: fmt(rest <= 30 ? t.offenBald : t.offenBis, { zeit: heute[1] }) };
  }
  // nächste Öffnung suchen
  for (let i = 0; i < 8; i++) {
    const tg = (tag + i) % 7;
    const h = SITE.hours[tg];
    if (!h) continue;
    if (i === 0 && min >= zuMin(h[0])) continue;
    const wann = i === 0 ? t.heute : i === 1 ? t.morgen : t.tage[tg];
    return { offen: false, text: fmt(t.geschlossenBis, { wann, zeit: h[0] }), morgen: i === 1 };
  }
  return { offen: false, text: t.geschlossen };
}

const IconChat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 5.5h16v10H9l-5 4v-14Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 9.5h8M8 12.5h5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const IconWa = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);
const IconTel = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const IconPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const IconUhr = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function KontaktFab() {
  const { lang, t: alle } = useSprache();
  const t = alle.fab;
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [rueckruf, setRueckruf] = useState(false);
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [zeit, setZeit] = useState('');
  const [gesendet, setGesendet] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setStatus(oeffnungsStatus(t));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [t]);
  useEffect(() => setOpen(false), [path]);
  // Rückruf-Knöpfe auf der Seite öffnen das Panel direkt im Formular
  useEffect(() => {
    const auf = () => {
      setRueckruf(true);
      setGesendet(false);
      setOpen(true);
    };
    window.addEventListener('ts-rueckruf', auf);
    return () => window.removeEventListener('ts-rueckruf', auf);
  }, []);
  // Ratgeber-Fenster öffnet sich → Panel schliessen
  useEffect(() => {
    const zu = () => setOpen(false);
    window.addEventListener(RATGEBER_EVENT, zu);
    return () => window.removeEventListener(RATGEBER_EVENT, zu);
  }, []);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const c = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.('[data-rueckruf]')) return;
      if (box.current && !box.current.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', k);
    document.addEventListener('mousedown', c);
    return () => {
      document.removeEventListener('keydown', k);
      document.removeEventListener('mousedown', c);
    };
  }, [open]);

  const telOk = tel.replace(/\D/g, '').length >= 9;
  const sendeRueckruf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telOk) return;
    // Server-Versand (Resend); ohne Konfiguration oder bei Fehler: Mailprogramm
    try {
      const res = await fetch('/api/anfrage/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          art: 'rueckruf',
          name,
          telefon: tel,
          // Mails ans Atelier bleiben Deutsch: Zeitfenster auf Deutsch mitsenden
          wunsch: ZEITEN_DE[t.zeiten.indexOf(zeit)] ?? zeit,
          pfad: window.location.pathname,
          sprache: lang === 'pt-pt' ? 'pt' : lang,
          _dlmsid: (window as Window & { dlmPx?: { sid?: () => string } }).dlmPx?.sid?.(),
        }),
      });
      if (res.ok) {
        melde('anfrage_rueckruf');
        setGesendet(true);
        return;
      }
    } catch {
      /* weiter mit Mailprogramm */
    }
    const body = [`Bitte um Rückruf`, '', `Name: ${name || '–'}`, `Telefon: ${tel}`, `Wunschzeit: ${zeit || 'egal'}`].join('\n');
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Rückrufbitte — ${name || tel}`)}&body=${encodeURIComponent(body)}`;
    setGesendet(true);
  };

  const offen = status?.offen ?? false;
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(t.waText)}`;
  const karte = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SITE.name}, ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`)}`;

  return (
    <div className={`kfab${open ? ' is-open' : ''}${path.startsWith(pfad(lang, 'konfigurator')) ? ' kfab--hoch' : ''}`} ref={box}>
      <div className="kfab-panel" role="dialog" aria-label={t.kontakt} aria-hidden={!open}>
        <div className="kfab-head">
          <p className="kfab-title">{alle.logoAlt}</p>
          {status && (
            <p className={`kfab-status${offen ? ' is-open' : ''}`}>
              <span className="kfab-dot" aria-hidden="true" />
              {status.text}
            </p>
          )}
        </div>

        {!rueckruf ? (
          <div className="kfab-tiles">
            <a className="kfab-tile kfab-tile--wa" href={wa} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
              <IconWa />
              <strong>WhatsApp</strong>
              <small>{offen ? t.waSofort : t.waSpaeter}</small>
            </a>
            {offen ? (
              <a className="kfab-tile" href={SITE.phoneHref} tabIndex={open ? 0 : -1}>
                <IconTel />
                <strong>{t.anrufen}</strong>
                <small className="num">{SITE.phone}</small>
              </a>
            ) : (
              <button type="button" className="kfab-tile" onClick={() => setRueckruf(true)} tabIndex={open ? 0 : -1}>
                <IconTel />
                <strong>{t.rueckruf}</strong>
                <small>{t.rueckrufKurz}</small>
              </button>
            )}
          </div>
        ) : gesendet ? (
          <div className="kfab-done">
            <p>
              <strong>{t.danke}{name ? `, ${name}` : ''}.</strong> {status?.morgen ? t.zurueckRufenMorgen : t.zurueckRufenBald}
            </p>
            <button type="button" className="linkbtn" onClick={() => { setRueckruf(false); setGesendet(false); }}>
              {t.zurueck}
            </button>
          </div>
        ) : (
          <form className="kfab-form" onSubmit={sendeRueckruf}>
            <label className="kfab-field">
              <span>{t.name}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label className="kfab-field">
              <span>{t.telefon}</span>
              <input value={tel} onChange={(e) => setTel(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="079 123 45 67" required />
            </label>
            <div className="kfab-chips" role="radiogroup" aria-label={t.wunschzeit}>
              {t.zeiten.map((z) => (
                <button key={z} type="button" role="radio" aria-checked={zeit === z} className={zeit === z ? 'is-on' : ''} onClick={() => setZeit(zeit === z ? '' : z)}>
                  {z}
                </button>
              ))}
            </div>
            <div className="kfab-form-row">
              <button type="button" className="linkbtn" onClick={() => setRueckruf(false)}>
                {t.zurueck}
              </button>
              <button type="submit" className="btn" disabled={!telOk}>
                {t.rueckruf}
              </button>
            </div>
          </form>
        )}

        {!rueckruf && (
          <RatgeberKnopf className="kfab-ratgeber" track="ratgeber-kontaktknopf" tabIndex={open ? 0 : -1}>
            <img src={RATGEBER.cover} alt="" width={34} height={48} loading="lazy" decoding="async" />
            <span>
              <strong>{alle.ratgeber.fabTitel}</strong>
              <small>{alle.ratgeber.fabText}</small>
            </span>
            <em aria-hidden="true">→</em>
          </RatgeberKnopf>
        )}

        <div className="kfab-info">
          <a className="kfab-info-row" href={karte} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
            <IconPin />
            <span>
              {SITE.address.street}, {SITE.address.city}
            </span>
            <span className="kfab-info-link" aria-hidden="true">↗</span>
          </a>
          <div className="kfab-info-row">
            <IconUhr />
            <span className="kfab-zeiten">
              {alle.oeffnungszeiten.map((h) => (
                <span key={h.tage}>
                  {h.tage} <span className="num">{h.zeit}</span>
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <button type="button" className="kfab-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? t.schliessen : t.oeffnen}>
        <span className="kfab-icon">{open ? <span className="kfab-x" aria-hidden="true" /> : <IconChat />}</span>
        {status && <span className={`kfab-badge${offen ? ' is-open' : ''}`} aria-hidden="true" />}
      </button>
    </div>
  );
}
