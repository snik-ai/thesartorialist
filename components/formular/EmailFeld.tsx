'use client';
// E-Mail-Feld der Lead-Formulare (Hausstandard, portiert aus VoxCRM): richtige Tastatur und Autofill, keine
// Grossschreibung/Autokorrektur, Leerzeichen fliegen raus, Prüfung erst beim Verlassen bzw. Absenden (freundlich),
// grünes Häkchen bei gültiger Adresse und ein Tippfehler-Vorschlag («Meinten Sie anna@gmail.com?» – ein Klick übernimmt).
import { useState } from 'react';
import { emailBereinigen, emailGueltig, emailVorschlag } from '@/lib/formular/email';
import './formular.css';

export interface EmailTexte { label: string; hinweis?: string; platzhalter: string; fehler: string; vorschlag: string; gueltig: string }

export const EMAIL_TEXTE: EmailTexte = {
  label: 'E-Mail',
  platzhalter: 'name@firma.ch',
  fehler: 'Bitte prüfen Sie die E-Mail-Adresse.',
  vorschlag: 'Meinten Sie {email}?',
  gueltig: 'E-Mail-Adresse gültig',
};

export function EmailFeld({ id, t = EMAIL_TEXTE, wert, setWert, fehlerAktiv, pflicht = true, kinder }: {
  id: string; t?: EmailTexte; wert: string; setWert: (v: string) => void;
  /** true, wenn beim Absenden genau dieses Feld bemängelt wurde */
  fehlerAktiv?: boolean; pflicht?: boolean; kinder?: React.ReactNode;
}) {
  const [verlassen, setVerlassen] = useState(false);
  const gueltig = emailGueltig(wert);
  const vorschlag = verlassen || gueltig ? emailVorschlag(wert) : null;
  const zeigeFehler = (verlassen && !!wert && !gueltig) || !!fehlerAktiv;
  const hinweisId = t.hinweis ? `${id}-h` : undefined;
  const beschrieben = [hinweisId, vorschlag ? `${id}-v` : null, zeigeFehler ? `${id}-f` : null].filter(Boolean).join(' ') || undefined;
  const [lokal, domain] = vorschlag ? [vorschlag.slice(0, vorschlag.indexOf('@') + 1), vorschlag.slice(vorschlag.indexOf('@') + 1)] : ['', ''];
  const vorschlagText = t.vorschlag.split('{email}');

  return (
    <div className="feld">
      <label className="feld__label" htmlFor={id}>{t.label}</label>
      <div className={`feld__huelle ${gueltig && !vorschlag ? 'feld__huelle--ok' : ''}`}>
        <input id={id} className="feld__eingabe" type="email" inputMode="email" autoComplete="email" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          enterKeyHint="next" required={pflicht} placeholder={t.platzhalter} value={wert}
          onChange={(e) => setWert(emailBereinigen(e.target.value))} onBlur={() => setVerlassen(!!wert)}
          aria-describedby={beschrieben} aria-invalid={zeigeFehler} />
        <span className="feld__ok" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        {gueltig && <span className="sr">{t.gueltig}</span>}
      </div>
      {vorschlag && (
        <button type="button" id={`${id}-v`} className="feld__vorschlag" onClick={() => { setWert(vorschlag); document.getElementById(id)?.focus(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4z" /></svg>
          <span>{vorschlagText[0]}{lokal}<b>{domain}</b>{vorschlagText[1]}</span>
        </button>
      )}
      {zeigeFehler && <span className="feld__fehler" id={`${id}-f`}>{t.fehler}</span>}
      {kinder}
      {t.hinweis && <span className="feld__hinweis" id={hinweisId}>{t.hinweis}</span>}
    </div>
  );
}
