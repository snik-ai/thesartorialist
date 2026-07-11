'use client';

import { useMemo, useState } from 'react';
import { SITE } from '@/lib/site';

// Moderner Buchungs-Wizard in 3 Schritten: Wunschtermin (Kalender) → Uhrzeit →
// persönliche Angaben. Regeln: Sonntag geschlossen, Samstag nur 10:00–16:00,
// Mo–Fr 10:00–18:00 (letzter Beratungsstart). Statische Site: Der Abschluss
// öffnet eine vorbefüllte E-Mail an den Store.

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];
const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MAX_DAYS_AHEAD = 70;

function slotsFor(date: Date): string[] {
  const day = date.getDay(); // 0 = So, 6 = Sa
  if (day === 0) return [];
  const endHour = day === 6 ? 16 : 18; // Sa nur bis 16:00
  const out: string[] = [];
  for (let h = 10; h <= endHour; h++) {
    out.push(`${h}:00`);
    if (h < endHour) out.push(`${h}:30`);
  }
  return out;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function BookingWizard() {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [monthCursor, setMonthCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [vorname, setVorname] = useState('');
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const step = !date ? 0 : !time ? 1 : 2;

  const maxDate = useMemo(() => {
    const m = new Date(today);
    m.setDate(m.getDate() + MAX_DAYS_AHEAD);
    return m;
  }, [today]);

  // Kalender-Raster des angezeigten Monats (Montag als Wochenstart)
  const grid = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lead = (firstDay.getDay() + 6) % 7; // Mo=0 … So=6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [monthCursor]);

  const canPrev =
    monthCursor.getFullYear() > today.getFullYear() ||
    monthCursor.getMonth() > today.getMonth();
  const canNext = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1) <= maxDate;

  function selectable(d: Date) {
    return d >= today && d <= maxDate && d.getDay() !== 0;
  }

  const dateLong = date
    ? date.toLocaleDateString('de-CH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `Terminanfrage — Wunschtermin ${dateLong}, ${time} Uhr`;
    const body = [
      `Wunschtermin: ${dateLong}, ${time} Uhr`,
      '',
      `Vorname: ${vorname}`,
      `Name: ${name}`,
      `Telefon: ${tel}`,
      `E-Mail: ${email}`,
    ].join('\n');
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="wizard">
        <div className="wizard-done">
          <span className="eyebrow">Anfrage unterwegs</span>
          <p className="serif wizard-done-title">Vielen Dank, {vorname}.</p>
          <p>
            Ihr Wunschtermin: <strong>{dateLong}, {time} Uhr</strong> — genau dann
            nehmen wir uns Zeit für Sie. Wir bestätigen Ihnen den Termin so rasch wie
            möglich per Telefon oder E-Mail.
          </p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            Keine E-Mail-App geöffnet? Rufen Sie uns an:{' '}
            <a href={SITE.phoneHref} style={{ textDecoration: 'underline' }}>{SITE.phone}</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard">
      {/* Schritt-Anzeige */}
      <ol className="wizard-steps">
        {['Wunschtermin', 'Uhrzeit', 'Ihre Angaben'].map((label, i) => (
          <li
            key={label}
            className={i === step ? 'active' : i < step ? 'done' : ''}
            aria-current={i === step ? 'step' : undefined}
          >
            <button
              type="button"
              onClick={() => {
                if (i === 0) { setDate(null); setTime(''); }
                if (i === 1 && date) setTime('');
              }}
              disabled={i > step}
            >
              <span className="num">{i + 1}</span> {label}
            </button>
          </li>
        ))}
      </ol>

      {/* Zusammenfassung */}
      {date && (
        <p className="wizard-summary">
          Ihr Wunschtermin: <strong>{dateLong}{time ? `, ${time} Uhr` : ''}</strong>
          {time && ' — genau dann sind wir ganz für Sie da.'}
        </p>
      )}

      {step === 0 && (
        <div>
          <p className="muted wizard-hint">
            Wählen Sie Datum und Uhrzeit — auf die Minute genau. Sonntags geschlossen,
            samstags Beratung von 10:00 bis 16:00 Uhr.
          </p>
          <div className="cal">
            <div className="cal-head">
              <button
                type="button"
                onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
                disabled={!canPrev}
                aria-label="Vorheriger Monat"
              >
                ←
              </button>
              <span className="serif cal-title">
                {MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
                disabled={!canNext}
                aria-label="Nächster Monat"
              >
                →
              </button>
            </div>
            <div className="cal-grid" role="grid">
              {WEEKDAYS.map((w) => (
                <span key={w} className="cal-wd">{w}</span>
              ))}
              {grid.map((d, i) =>
                d ? (
                  <button
                    key={i}
                    type="button"
                    className={`cal-day${date && sameDay(d, date) ? ' sel' : ''}${sameDay(d, new Date()) ? ' today' : ''}`}
                    disabled={!selectable(d)}
                    onClick={() => { setDate(d); setTime(''); }}
                  >
                    {d.getDate()}
                  </button>
                ) : (
                  <span key={i} />
                )
              )}
            </div>
          </div>
        </div>
      )}

      {step === 1 && date && (
        <div>
          <p className="muted wizard-hint">
            Freie Beratungszeiten am {dateLong}
            {date.getDay() === 6 ? ' — samstags von 10:00 bis 16:00 Uhr.' : '.'}
          </p>
          <div className="slot-grid">
            {slotsFor(date).map((t) => (
              <button key={t} type="button" className="slot" onClick={() => setTime(t)}>
                {t}
              </button>
            ))}
          </div>
          <button type="button" className="text-link wizard-back" onClick={() => setDate(null)}>
            Anderes Datum wählen
          </button>
        </div>
      )}

      {step === 2 && (
        <form className="form-grid" onSubmit={submit}>
          <div className="grid-2" style={{ gap: '1.1rem' }}>
            <div>
              <label htmlFor="bw-vorname">Vorname</label>
              <input
                id="bw-vorname"
                type="text"
                required
                autoComplete="given-name"
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="bw-name">Name</label>
              <input
                id="bw-name"
                type="text"
                required
                autoComplete="family-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="bw-tel">Telefon</label>
            <input
              id="bw-tel"
              type="tel"
              required
              autoComplete="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="bw-email">E-Mail</label>
            <input
              id="bw-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--wide">
            Wunschtermin anfragen
          </button>
          <button type="button" className="text-link wizard-back" onClick={() => setTime('')}>
            Andere Uhrzeit wählen
          </button>
        </form>
      )}
    </div>
  );
}
