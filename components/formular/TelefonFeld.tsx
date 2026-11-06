'use client';
// Telefon-Feld der Lead-Formulare (Hausstandard, portiert aus VoxCRM): Telefon-Tastatur und Autofill, Schweizer Nummern
// werden beim Tippen gegliedert («079 123 45 67») und beim Verlassen international geschrieben («+41 79 123 45 67»).
// 0…, 0041…, +41… sowie +423, +49, +43 usw. sind erlaubt. Links ein dezentes Länder-Präfix (eigene Auswahl, kein natives
// select), das die Vorwahl zeigt und wechselt. Prüfung erst beim Verlassen bzw. Absenden, freundlich.
import { useEffect, useRef, useState } from 'react';
import { LAENDER, telefonFormatieren, telefonGueltig, telefonLand, telefonLive, telefonMitLand, type Land } from '@/lib/formular/telefon';
import './formular.css';

export interface TelefonTexte { label: string; optional?: string; hinweis?: string; platzhalter: string; fehler: string; land: string; gueltig: string }

export const TELEFON_TEXTE: TelefonTexte = {
  label: 'Telefon',
  platzhalter: '079 123 45 67',
  fehler: 'Bitte prüfen Sie die Telefonnummer.',
  land: 'Land der Telefonnummer',
  gueltig: 'Telefonnummer gültig',
};

export function TelefonFeld({ id, t = TELEFON_TEXTE, wert, setWert, fehlerAktiv, pflicht = true }: {
  id: string; t?: TelefonTexte; wert: string; setWert: (v: string) => void; fehlerAktiv?: boolean; pflicht?: boolean;
}) {
  const [verlassen, setVerlassen] = useState(false);
  const [offen, setOffen] = useState(false);
  const [aktiv, setAktiv] = useState(0);
  const eingabe = useRef<HTMLInputElement>(null);
  const liste = useRef<HTMLUListElement>(null);
  const huelle = useRef<HTMLDivElement>(null);
  const land: Land = telefonLand(wert) ?? LAENDER[0]!;
  const gueltig = !!wert.trim() && telefonGueltig(wert);
  const zeigeFehler = (verlassen && !!wert.trim() && !telefonGueltig(wert)) || !!fehlerAktiv;
  const hinweisId = t.hinweis ? `${id}-h` : undefined;
  const beschrieben = [hinweisId, zeigeFehler ? `${id}-f` : null].filter(Boolean).join(' ') || undefined;
  const listeId = `${id}-laender`;
  const intl = /^\s*(\+|00)/.test(wert);

  // Auswahl schliessen bei Klick ausserhalb
  useEffect(() => {
    if (!offen) return;
    const weg = (e: PointerEvent) => { if (!huelle.current?.contains(e.target as Node)) setOffen(false); };
    document.addEventListener('pointerdown', weg);
    return () => document.removeEventListener('pointerdown', weg);
  }, [offen]);
  useEffect(() => { if (offen) liste.current?.focus(); }, [offen]);

  function oeffnen() {
    setAktiv(Math.max(0, LAENDER.findIndex((l) => l.code === land.code)));
    setOffen(true);
  }
  function waehlen(l: Land) {
    setWert(telefonMitLand(wert, l));
    setOffen(false);
    requestAnimationFrame(() => { const el = eingabe.current; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } });
  }
  function tasten(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAktiv((a) => (a + 1) % LAENDER.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAktiv((a) => (a - 1 + LAENDER.length) % LAENDER.length); }
    else if (e.key === 'Home') { e.preventDefault(); setAktiv(0); }
    else if (e.key === 'End') { e.preventDefault(); setAktiv(LAENDER.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); waehlen(LAENDER[aktiv]!); }
    else if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') e.preventDefault(); setOffen(false); if (e.key === 'Escape') eingabe.current?.focus(); }
  }
  function aendern(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    // Nur gliedern, wenn am Ende getippt wird (sonst springt die Schreibmarke)
    const amEnde = el.selectionStart === el.value.length;
    setWert(amEnde ? telefonLive(el.value) : el.value);
  }

  return (
    <div className="feld">
      <label className="feld__label" htmlFor={id}>{t.label}{t.optional ? <> <i>{t.optional}</i></> : null}</label>
      <div ref={huelle} className={`feld__huelle feld__huelle--praefix ${intl ? 'feld__huelle--intl' : ''} ${gueltig ? 'feld__huelle--ok' : ''}`}>
        <button type="button" className="tel-land" aria-haspopup="listbox" aria-expanded={offen} aria-controls={offen ? listeId : undefined}
          aria-label={`${t.land}: ${land.name.de} +${land.vorwahl}`} onClick={() => (offen ? setOffen(false) : oeffnen())}>
          <span className="tel-land__code">{land.code}</span>
          {/* Steht die Vorwahl schon in der Eingabe («+41 79 …»), zeigt das Präfix nur das Land (keine doppelte Vorwahl) */}
          {!intl && <span className="tel-land__vorwahl">+{land.vorwahl}</span>}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <input ref={eingabe} id={id} className="feld__eingabe" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" required={pflicht}
          placeholder={t.platzhalter} value={wert}
          onChange={aendern} onBlur={() => { setVerlassen(!!wert.trim()); if (wert.trim() && telefonGueltig(wert)) setWert(telefonFormatieren(wert)); }}
          aria-describedby={beschrieben} aria-invalid={zeigeFehler} />
        <span className="feld__ok" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        {gueltig && <span className="sr">{t.gueltig}</span>}
        {offen && (
          <ul ref={liste} id={listeId} className="tel-laender" role="listbox" tabIndex={-1} aria-label={t.land}
            aria-activedescendant={`${listeId}-${LAENDER[aktiv]!.code}`} onKeyDown={tasten}>
            {LAENDER.map((l, i) => (
              <li key={l.code} id={`${listeId}-${l.code}`} role="option" aria-selected={l.code === land.code}
                className={i === aktiv ? 'aktiv' : undefined} onPointerEnter={() => setAktiv(i)} onClick={() => waehlen(l)}>
                <span className="tel-laender__code">{l.code}</span>
                <span className="tel-laender__name">{l.name.de}</span>
                <span className="tel-laender__vorwahl">+{l.vorwahl}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {zeigeFehler && <span className="feld__fehler" id={`${id}-f`}>{t.fehler}</span>}
      {t.hinweis && <span className="feld__hinweis" id={hinweisId}>{t.hinweis}</span>}
    </div>
  );
}
