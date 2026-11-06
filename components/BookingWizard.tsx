'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { alsText, aufloesen, ladeAuswahl, ladeStoffe, optionText, type Gewaehlt } from '@/lib/konfigurator/auswahl';
import { EmailFeld } from '@/components/formular/EmailFeld';
import { TelefonFeld } from '@/components/formular/TelefonFeld';
import { MarkenChip, MarkenLogo, useMarke } from '@/components/formular/Marke';
import { Einwilligung } from '@/components/formular/Einwilligung';
import { emailGueltig, emailVorschlag } from '@/lib/formular/email';
import { telefonFormatieren, telefonGueltig } from '@/lib/formular/telefon';
import type { Woerterbuch } from '@/lib/i18n/de';
import { pfad } from '@/lib/i18n/routen';
import { fmt, mz } from '@/lib/i18n/fmt';
import { SPRACH_INFO, type Sprache } from '@/lib/i18n/sprachen';

export type WizardTexte = Woerterbuch['termin']['wizard'];

// Moderner Buchungs-Wizard in 3 Schritten: Wunschtermin (Kalender) → Uhrzeit →
// persönliche Angaben. Regeln: Sonntag geschlossen, Samstag nur 10:00–16:00,
// Mo–Fr 10:00–18:00 (letzter Beratungsstart). Versand über /api/anfrage/ (mit Sprache
// für die Kundenmail); ohne Server öffnet sich eine vorbefüllte E-Mail an den Store.
// Texte kommen als Prop in der Seitensprache; ans Atelier geht der Wunschtermin immer auf Deutsch.

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
  // Heute: nur Zeiten, die mindestens 90 Minuten in der Zukunft liegen
  const jetzt = new Date();
  if (sameDay(date, jetzt)) {
    const ab = jetzt.getHours() * 60 + jetzt.getMinutes() + 90;
    return out.filter((t) => {
      const [hh, mm] = t.split(':').map(Number);
      return hh * 60 + mm >= ab;
    });
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

export default function BookingWizard({ lang, t }: { lang: Sprache; t: WizardTexte }) {
  const MONTHS = t.monate;
  const WEEKDAYS = t.wochentage;
  const EINWILLIGUNG_TEXT = t.einwilligung;
  const uhr = (z: string) => fmt(t.uhr, { zeit: z });
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
  const [firma, setFirma] = useState('');
  const [firmaSelbst, setFirmaSelbst] = useState(false);
  const [einwilligung, setEinwilligung] = useState(false);
  const [fehlerFeld, setFehlerFeld] = useState<'' | 'name' | 'email' | 'tel'>('');
  const [sent, setSent] = useState(false);
  // Firmenerkennung aus der E-Mail-Domain (Freemailer ergeben nichts); Firmenname wird vorgeschlagen, bleibt überschreibbar
  // Bei vermutetem Tippfehler («gmial.com») nichts suchen, erst nach der Korrektur
  const suche = useMarke(emailVorschlag(email) ? null : email);
  const markeName = suche.marke?.name ?? '';
  useEffect(() => {
    if (!firmaSelbst) setFirma(markeName);
  }, [markeName, firmaSelbst]);
  // Stil-Auswahl aus dem Massanzug-Konfigurator (liegt im Browser) geht mit der Anfrage mit
  const [stil, setStil] = useState<Gewaehlt[]>([]);
  const [stilMit, setStilMit] = useState(true);
  const [stoffe, setStoffeW] = useState<string[]>([]);
  useEffect(() => {
    setStil(aufloesen(ladeAuswahl()));
    setStoffeW(ladeStoffe());
  }, []);

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
    return d >= today && d <= maxDate && d.getDay() !== 0 && slotsFor(d).length > 0;
  }

  const datumLang = (locale: string) =>
    date ? date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const dateLong = datumLang(SPRACH_INFO[lang].intl);
  /** Für das Atelier (Mail, Backend) immer Deutsch */
  const wunschDe = `${datumLang('de-CH')}, ${time} Uhr`;

  const [busy, setBusy] = useState(false);
  const [fehler, setFehler] = useState('');
  const [honig, setHonig] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFehler('');
    // Eigene, freundliche Prüfung (statt Browser-Blasen): Name, E-Mail und Telefon sind Pflicht
    const feld = !vorname.trim() || !name.trim() ? 'name' : !emailGueltig(email) ? 'email' : !tel.trim() || !telefonGueltig(tel) ? 'tel' : '';
    setFehlerFeld(feld);
    if (feld) {
      // E-Mail und Telefon zeigen ihren Hinweis direkt am Feld
      if (feld === 'name') setFehler(t.fehlerName);
      document.getElementById(feld === 'name' ? (vorname.trim() ? 'bw-name' : 'bw-vorname') : feld === 'email' ? 'bw-email' : 'bw-tel')?.focus();
      return;
    }
    const telefon = telefonFormatieren(tel);
    setTel(telefon);
    setBusy(true);
    // 1. Versand über den Server (Resend) — bei fehlender Konfiguration/Fehler: Mailprogramm
    try {
      const res = await fetch('/api/anfrage/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          art: 'termin',
          name: `${vorname} ${name}`.trim(),
          telefon,
          email,
          firma: firma.trim() || undefined,
          brandDomain: suche.domain ?? undefined,
          einwilligung,
          einwilligungText: EINWILLIGUNG_TEXT,
          wunsch: wunschDe,
          datum: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : undefined,
          zeit: time,
          // Deutsche Bezeichnungen fürs Atelier, IDs für die Kundenmail in der Kundensprache
          stil: stilMit
            ? stil.map((g) => ({ kategorie: g.kategorie, untergruppe: g.untergruppe, option: optionText(g), kategorieId: g.kategorieId, untergruppeId: g.untergruppeId, optionId: g.option.id }))
            : [],
          stoffe: stilMit ? stoffe : [],
          website: honig,
          sprache: SPRACH_INFO[lang].mail,
          pfad: window.location.pathname,
          _dlmsid: (window as Window & { dlmPx?: { sid?: () => string } }).dlmPx?.sid?.(),
        }),
      });
      if (res.ok) {
        setSent(true);
        setBusy(false);
        return;
      }
      if (res.status === 400 || res.status === 429) {
        const j = await res.json().catch(() => ({}));
        setFehler(lang === 'de' ? j.fehler || t.fehlerPruefen : t.fehlerPruefen);
        setBusy(false);
        return;
      }
    } catch {
      /* weiter mit Mailprogramm */
    }
    setBusy(false);
    const subject = `Terminanfrage — Wunschtermin ${wunschDe}`;
    const body = [
      `Wunschtermin: ${wunschDe}`,
      '',
      `Vorname: ${vorname}`,
      `Name: ${name}`,
      `Telefon: ${telefon}`,
      `E-Mail: ${email}`,
      ...(firma.trim() ? [`Firma: ${firma.trim()}`] : []),
      `WhatsApp/SMS-Bestätigung: ${einwilligung ? 'ja' : 'nein'}`,
      ...((stil.length || stoffe.length) && stilMit
        ? ['', `Meine Stil-Auswahl aus dem Konfigurator (${stil.length} Details):`, '', alsText(stil, stoffe)]
        : []),
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
          <span className="eyebrow">{t.gesendetEyebrow}</span>
          <p className="serif wizard-done-title">{fmt(t.danke, { vorname })}</p>
          <p>
            {t.gesendetText1} <strong>{dateLong}, {uhr(time)}</strong> {t.gesendetText2}
          </p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            {t.keineMailApp}{' '}
            <a href={SITE.phoneHref} style={{ textDecoration: 'underline' }}>{SITE.phone}</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard">
      {(stil.length > 0 || stoffe.length > 0) && (
        <div className="wizard-stil">
          <div>
            <strong>
              {stilMit ? t.stilMit : t.stilOhne}
            </strong>
            <p>
              {mz(stil.length, t.stilDetail, t.stilDetails)}
              {stoffe.length > 0 && <> · {t.stilStoff} {stoffe.join(', ')}</>}
            </p>
          </div>
          <div className="wizard-stil-actions">
            <Link href={`${pfad(lang, 'konfigurator')}#uebersicht`}>{t.ansehen}</Link>
            <button type="button" onClick={() => setStilMit((v) => !v)}>
              {stilMit ? t.weglassen : t.dochMit}
            </button>
          </div>
        </div>
      )}
      {/* Schritt-Anzeige */}
      <ol className="wizard-steps">
        {t.schritte.map((label, i) => (
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
          {t.zusammenfassung} <strong>{dateLong}{time ? `, ${uhr(time)}` : ''}</strong>
          {time && t.zusammenfassungZeit}
        </p>
      )}

      {step === 0 && (
        <div>
          <p className="muted wizard-hint">
            {t.hinweisDatum}
          </p>
          <div className="cal">
            <div className="cal-head">
              <button
                type="button"
                onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
                disabled={!canPrev}
                aria-label={t.vorherigerMonat}
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
                aria-label={t.naechsterMonat}
              >
                →
              </button>
            </div>
            <div className="cal-grid" role="group" aria-label={t.datumWaehlen}>
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
            {fmt(t.freieZeiten, { datum: dateLong })}
            {date.getDay() === 6 ? t.samstag : '.'}
          </p>
          <div className="slot-grid">
            {slotsFor(date).map((t) => (
              <button key={t} type="button" className="slot" onClick={() => setTime(t)}>
                {t}
              </button>
            ))}
          </div>
          <button type="button" className="text-link wizard-back" onClick={() => setDate(null)}>
            {t.anderesDatum}
          </button>
        </div>
      )}

      {step === 2 && (
        <form className="form-grid" onSubmit={submit} noValidate>
          <div className="grid-2" style={{ gap: '1.1rem' }}>
            <div>
              <label htmlFor="bw-vorname">{t.vorname}</label>
              <input
                id="bw-vorname"
                className="feld__eingabe"
                type="text"
                required
                autoComplete="given-name"
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="bw-name">{t.name}</label>
              <input
                id="bw-name"
                className="feld__eingabe"
                type="text"
                required
                autoComplete="family-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <EmailFeld id="bw-email" wert={email} setWert={(v) => { setEmail(v); if (fehlerFeld === 'email') setFehlerFeld(''); }}
            fehlerAktiv={fehlerFeld === 'email'} t={t.email} kinder={<MarkenChip suche={suche} t={t.marke} />} />
          <TelefonFeld id="bw-tel" wert={tel} setWert={(v) => { setTel(v); if (fehlerFeld === 'tel') setFehlerFeld(''); }}
            fehlerAktiv={fehlerFeld === 'tel'} t={t.telefon} />
          <div className="feld">
            <label className="feld__label" htmlFor="bw-firma">{t.firma} <i>{t.optional}</i></label>
            <div className={`feld__huelle ${suche.marke && firma.trim() ? 'feld__huelle--marke' : ''}`}>
              {suche.marke && firma.trim() && <MarkenLogo marke={suche.marke} groesse={34} />}
              <input id="bw-firma" className="feld__eingabe" type="text" autoComplete="organization" value={firma}
                onChange={(e) => { setFirma(e.target.value); setFirmaSelbst(true); }} />
            </div>
            {suche.marke?.name && !firmaSelbst && firma === suche.marke.name && (
              <span className="feld__vorgeschlagen">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                {t.firmaUebernommen}
              </span>
            )}
          </div>
          <Einwilligung id="bw-einwilligung" an={einwilligung} setAn={setEinwilligung} text={EINWILLIGUNG_TEXT}
            hinweis={t.einwilligungHinweis} />
          {/* Honeypot gegen Bots (unsichtbar) */}
          <input type="text" name="website" value={honig} onChange={(e) => setHonig(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />
          {fehler && <p className="buybox-error">{fehler}</p>}
          <button type="submit" className="btn btn--wide" disabled={busy}>
            {busy ? t.sendet : t.senden}
          </button>
          <button type="button" className="text-link wizard-back" onClick={() => setTime('')}>
            {t.andereZeit}
          </button>
        </form>
      )}
    </div>
  );
}
