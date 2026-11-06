'use client';

// Schwebender Kontakt-Knopf unten rechts: WhatsApp und Termin in einem Panel,
// mit Live-Öffnungszeiten (Zeitzone Zürich). Geöffnet: WhatsApp, Anrufen, Termin.
// Geschlossen: WhatsApp, Rückruf anfordern, Terminanfrage.
// Rückruf läuft wie die Terminbuchung über eine vorbefüllte E-Mail (kein Server).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/lib/site';

const TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Jetzt in Zürich: Wochentag und Minuten seit Mitternacht. */
function jetztZuerich() {
  const parts = new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const tag = KURZ.indexOf(get('weekday').replace('.', '').slice(0, 2));
  return { tag, min: Number(get('hour')) * 60 + Number(get('minute')) };
}
const zuMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

export type Status = { offen: boolean; text: string };
export function oeffnungsStatus(): Status {
  const { tag, min } = jetztZuerich();
  const heute = SITE.hours[tag];
  if (heute && min >= zuMin(heute[0]) && min < zuMin(heute[1])) {
    const rest = zuMin(heute[1]) - min;
    return { offen: true, text: rest <= 30 ? `Geöffnet · schliesst um ${heute[1]}` : `Jetzt geöffnet · bis ${heute[1]} Uhr` };
  }
  // nächste Öffnung suchen
  for (let i = 0; i < 8; i++) {
    const t = (tag + i) % 7;
    const h = SITE.hours[t];
    if (!h) continue;
    if (i === 0 && min >= zuMin(h[0])) continue;
    const wann = i === 0 ? 'heute' : i === 1 ? 'morgen' : TAGE[t];
    return { offen: false, text: `Geschlossen · öffnet ${wann} um ${h[0]} Uhr` };
  }
  return { offen: false, text: 'Geschlossen' };
}

const WA_TEXT = 'Grüezi, ich interessiere mich für einen Massanzug und hätte gerne eine Beratung.';

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
const IconCal = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const IconTel = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export default function KontaktFab() {
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
    const t = () => setStatus(oeffnungsStatus());
    t();
    const id = setInterval(t, 60_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const c = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', k);
    document.addEventListener('mousedown', c);
    return () => {
      document.removeEventListener('keydown', k);
      document.removeEventListener('mousedown', c);
    };
  }, [open]);

  const telOk = tel.replace(/\D/g, '').length >= 9;
  const sendeRueckruf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telOk) return;
    const body = [`Bitte um Rückruf`, '', `Name: ${name || '–'}`, `Telefon: ${tel}`, `Wunschzeit: ${zeit || 'egal'}`].join('\n');
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Rückrufbitte — ${name || tel}`)}&body=${encodeURIComponent(body)}`;
    setGesendet(true);
  };

  const offen = status?.offen ?? false;
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(WA_TEXT)}`;

  return (
    <div className={`kfab${open ? ' is-open' : ''}${path.startsWith('/massanzug-konfigurator') ? ' kfab--hoch' : ''}`} ref={box}>
      <div className="kfab-panel" role="dialog" aria-label="Kontakt" aria-hidden={!open}>
        <div className="kfab-head">
          <p className="kfab-title">The Sartorialist Zürich</p>
          {status && (
            <p className={`kfab-status${offen ? ' is-open' : ''}`}>
              <span className="kfab-dot" aria-hidden="true" />
              {status.text}
            </p>
          )}
        </div>

        {!rueckruf ? (
          <div className="kfab-actions">
            <a className="kfab-btn kfab-btn--wa" href={wa} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
              <IconWa />
              <span>
                <strong>WhatsApp</strong>
                <small>{offen ? 'Wir antworten sofort' : 'Wir antworten zu den Öffnungszeiten'}</small>
              </span>
            </a>
            {offen ? (
              <a className="kfab-btn" href={SITE.phoneHref} tabIndex={open ? 0 : -1}>
                <IconTel />
                <span>
                  <strong>Anrufen</strong>
                  <small>{SITE.phone}</small>
                </span>
              </a>
            ) : (
              <button type="button" className="kfab-btn" onClick={() => setRueckruf(true)} tabIndex={open ? 0 : -1}>
                <IconTel />
                <span>
                  <strong>Rückruf anfordern</strong>
                  <small>Wir rufen Sie zurück</small>
                </span>
              </button>
            )}
            <Link className="kfab-btn kfab-btn--ink" href="/termin/" tabIndex={open ? 0 : -1}>
              <IconCal />
              <span>
                <strong>{offen ? 'Termin buchen' : 'Terminanfrage'}</strong>
                <small>Beratung im Atelier, 60–90 Minuten</small>
              </span>
            </Link>
          </div>
        ) : gesendet ? (
          <div className="kfab-done">
            <p>
              <strong>Danke{name ? `, ${name}` : ''}.</strong> Wir rufen Sie {status?.text.includes('morgen') ? 'morgen' : 'so rasch wie möglich'} zurück.
            </p>
            <button type="button" className="linkbtn" onClick={() => { setRueckruf(false); setGesendet(false); }}>
              Zurück
            </button>
          </div>
        ) : (
          <form className="kfab-form" onSubmit={sendeRueckruf}>
            <label className="kfab-field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label className="kfab-field">
              <span>Telefon</span>
              <input value={tel} onChange={(e) => setTel(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="079 123 45 67" required />
            </label>
            <div className="kfab-chips" role="radiogroup" aria-label="Wunschzeit">
              {['Vormittag', 'Mittag', 'Nachmittag', 'Abend'].map((z) => (
                <button key={z} type="button" role="radio" aria-checked={zeit === z} className={zeit === z ? 'is-on' : ''} onClick={() => setZeit(zeit === z ? '' : z)}>
                  {z}
                </button>
              ))}
            </div>
            <div className="kfab-form-row">
              <button type="button" className="linkbtn" onClick={() => setRueckruf(false)}>
                Zurück
              </button>
              <button type="submit" className="btn" disabled={!telOk}>
                Rückruf anfordern
              </button>
            </div>
          </form>
        )}

        <details className="kfab-hours">
          <summary>Öffnungszeiten</summary>
          <ul>
            {SITE.openingHours.map((h) => (
              <li key={h.days}>
                <span>{h.days}</span>
                <span className="num">{h.time}</span>
              </li>
            ))}
          </ul>
          <p>
            {SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}
          </p>
        </details>
      </div>

      <button type="button" className="kfab-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Kontakt schliessen' : 'Kontakt: WhatsApp, Anruf, Termin'}>
        <span className="kfab-icon">{open ? <span className="kfab-x" aria-hidden="true" /> : <IconChat />}</span>
        {status && <span className={`kfab-badge${offen ? ' is-open' : ''}`} aria-hidden="true" />}
      </button>
    </div>
  );
}
