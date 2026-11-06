'use client';
// Bausteine des A4-Papiers im Editor – aus VoxCRM apps/web/components/verkauf/editor/Papier.tsx übernommen: Briefkopf mit
// Fenster an derselben Stelle wie im PDF, Empfänger mit Kontaktsuche am Ort, Titel mit Betrag, Angaben-Leiste mit
// Datumsfeldern, Fliesstext, Summen und Zahlungsangaben wie im PDF, Unterschrift, Fuss in Spalten, QR-Zahlteil.
// Texte und Zahlen kommen aus denselben Funktionen wie die PDF-Vorlage (lib/beleg/vorlage.ts).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DOK } from '@/lib/beleg/texte';
import type { BelegSprache } from '@/lib/db/schema';
import { absenderZeilen, empfaengerZeilen, fussSpalten, ruecksendeZeile, stilHtml, totalZeilen, zahlteilHtml, zahlungZeilen, type BelegAbsender, type BelegDokument, type BelegEmpfaenger } from '@/lib/beleg/vorlage';
import { PAPIER_CSS, SCHRIFTEN_WEB } from '@/lib/beleg/stil';
import { Datum, Icon, geld } from '@/components/vx/ui';
import { AutoText } from './Positionen';

/** Papier-CSS (gleich wie im PDF) einmal in die Seite legen – für Zahlteil, Anhang und Kundenansicht */
export const PapierStil = () => <style dangerouslySetInnerHTML={{ __html: SCHRIFTEN_WEB + PAPIER_CSS }} />;

export function Absenderblock({ absender, children }: { absender: BelegAbsender; children?: ReactNode }) {
  return (
    <div className="dk-kopf">
      <div className="dk-logo">
        {absender.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={absender.logo} alt={absender.name} />
        ) : (
          <span className="dk-wort">{absender.name}</span>
        )}
        <i className="dk-goldlinie" />
      </div>
      <div className="dk-abs-z">
        <b>{absender.name}</b>
        <br />
        {absenderZeilen(absender).map((z, i) => (
          <span key={i}>
            {z}
            <br />
          </span>
        ))}
      </div>
      <i className="dk-falz" style={{ top: '90mm' }} />
      <i className="dk-falz" style={{ top: '195mm' }} />
      <i className="dk-falz loch" style={{ top: '133.5mm' }} />
      {children}
    </div>
  );
}

type KontaktTreffer = { id: string; name: string; email: string | null; ort: string | null; status: string };

/** Empfänger im Fenster rechts. Klick öffnet die Kontaktsuche direkt am Adressfeld. */
export function EmpfaengerFeld({ absender, empfaenger, kontaktId, onWahl, gesperrt, hinweis }: { absender: BelegAbsender; empfaenger: BelegEmpfaenger | null; kontaktId: string | null; onWahl?: (id: string) => void; gesperrt: boolean; hinweis?: string | null }) {
  const [offen, setOffen] = useState(false);
  const [q, setQ] = useState('');
  const [liste, setListe] = useState<KontaktTreffer[] | null>(null);
  const [fokus, setFokus] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!offen) return;
    const t = setTimeout(
      () =>
        fetch(`/api/admin/kontakte/suche/?q=${encodeURIComponent(q)}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((r) => setListe(Array.isArray(r) ? r : []))
          .catch(() => setListe([])),
      q ? 150 : 0,
    );
    return () => clearTimeout(t);
  }, [q, offen]);
  useEffect(() => {
    if (!offen) return;
    const zu = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOffen(false);
    };
    document.addEventListener('mousedown', zu);
    return () => document.removeEventListener('mousedown', zu);
  }, [offen]);
  const waehle = (id: string) => {
    onWahl?.(id);
    setOffen(false);
    setQ('');
  };
  const zeilen = empfaenger ? empfaengerZeilen(empfaenger) : [];
  const n = liste?.length ?? 0;
  const adresse = empfaenger && (
    <>
      {empfaenger.anrede && <span>{empfaenger.anrede}</span>}
      <b>{empfaenger.name}</b>
      {zeilen.map((z, i) => (
        <span key={i}>{z}</span>
      ))}
    </>
  );
  return (
    <div className={`dk-emp ${gesperrt ? '' : 'bearbeitbar'} ${offen ? 'offen' : ''}`} ref={box}>
      <small className="dk-emp-abs">{ruecksendeZeile(absender)}</small>
      {empfaenger ? (
        gesperrt ? (
          <div className="dk-emp-adr">{adresse}</div>
        ) : (
          <button type="button" className="dk-emp-adr" onClick={() => setOffen(!offen)} aria-haspopup="dialog" aria-expanded={offen} title="Anderen Empfänger wählen">
            {adresse}
            {!empfaenger.strasse && !empfaenger.ort && <em className="dk-warn">Adresse fehlt – in der Kundenakte ergänzen</em>}
            <span className="dk-emp-wechsel">
              <Icon name="ArrowLeftRight" size={13} />
              Ändern
            </span>
          </button>
        )
      ) : (
        <button type="button" className="dk-emp-leer" onClick={() => setOffen(true)} disabled={gesperrt}>
          <Icon name="UserRound" size={18} />
          <span>
            <b>Kunde wählen</b>
            <small>Name, E-Mail oder Telefon suchen</small>
          </span>
        </button>
      )}
      {hinweis && <div className="dk-emp-hinweis">{hinweis}</div>}
      {offen && !gesperrt && (
        <div className="dk-emp-pop" role="dialog" aria-label="Kunde wählen">
          <label className="dk-emp-suche">
            <Icon name="Search" size={15} />
            <input
              autoFocus
              value={q}
              placeholder="Name, E-Mail oder Telefon"
              aria-label="Kontakt suchen"
              onChange={(e) => {
                setQ(e.target.value);
                setFokus(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setFokus((f) => Math.min(f + 1, n - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setFokus((f) => Math.max(f - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (liste?.[fokus]) waehle(liste[fokus]!.id);
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  setOffen(false);
                }
              }}
            />
          </label>
          <div className="dk-emp-liste" role="listbox">
            {liste === null && <div className="dk-einf-leer">Lädt …</div>}
            {liste?.length === 0 && <div className="dk-einf-leer">Kein Kontakt gefunden. Neue Kontakte entstehen über Anfragen oder unter Kontakte.</div>}
            {liste?.map((o, i) => (
              <button type="button" key={o.id} role="option" aria-selected={i === fokus} className={`dk-einf-o ${i === fokus ? 'an' : ''}`} onMouseEnter={() => setFokus(i)} onClick={() => waehle(o.id)}>
                <span className="dk-einf-i">
                  <Icon name="User" size={15} />
                </span>
                <span className="t">
                  <b>{o.name || o.email}</b>
                  <small>{[o.status === 'kunde' ? 'Kunde' : 'Lead', o.email, o.ort].filter(Boolean).join(' · ')}</small>
                </span>
                {o.id === kontaktId && <Icon name="Check" size={15} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Einleitung/Schluss: zeigt den Text wie gedruckt, Klick macht ihn zum Feld. */
export function Fliesstext({ wert, onWert, gesperrt, platzhalter, label }: { wert: string; onWert: (s: string) => void; gesperrt: boolean; platzhalter: string; label: string }) {
  const [bearbeiten, setBearbeiten] = useState(false);
  if (gesperrt) return wert.trim() ? <div className="dk-fliess dk-lesen">{wert}</div> : null;
  if (bearbeiten)
    return (
      <div className="dk-fliess-edit">
        <AutoText
          className="dk-fliess"
          wert={wert}
          onWert={onWert}
          autoFocus
          aria-label={label}
          placeholder={platzhalter}
          onBlur={() => setBearbeiten(false)}
          onFocus={(e) => {
            const l = e.currentTarget.value.length;
            e.currentTarget.setSelectionRange(l, l);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
      </div>
    );
  return (
    <div className={`dk-fliess dk-fliess-zeige ${wert.trim() ? '' : 'ohne-text'}`} tabIndex={0} role="textbox" aria-label={label} aria-multiline="true" onFocus={() => setBearbeiten(true)} onClick={() => setBearbeiten(true)}>
      {wert.trim() ? wert : platzhalter}
    </div>
  );
}

export function Angabe({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="dk-angabe">
      <small>{label}</small>
      <span className="dk-angabe-w">{children}</span>
    </div>
  );
}

export function MetaDatum({ label, wert, onWahl, gesperrt, schnell }: { label: string; wert: string; onWahl: (w: string) => void; gesperrt: boolean; schnell?: { label: string; wert: string }[] }) {
  return (
    <Angabe label={label}>
      {gesperrt ? <span className="num">{wert ? `${wert.slice(8, 10)}.${wert.slice(5, 7)}.${wert.slice(0, 4)}` : '—'}</span> : <Datum wert={wert || null} onWahl={onWahl} schnell={schnell} />}
    </Angabe>
  );
}

/** Titel wie im PDF: Dokumentart gross (Playfair), Nummer leiser, Betreff darunter, rechts der Betrag. */
export function TitelBlock({ art, nummer, titel, held, stempel, children }: { art: string; nummer: string; titel: ReactNode; held?: BelegDokument['held']; stempel?: BelegDokument['stempel']; children?: ReactNode }) {
  return (
    <>
      {stempel && <div className={`dk-stempel ${stempel.art === 'storno' ? 'bad' : ''}`}>{stempel.text}</div>}
      <header className="dk-titelblock">
        <div className="dk-titelblock-l">
          <h1 className="dk-h1">
            {art} <span className="nr">{nummer || 'Entwurf'}</span>
          </h1>
          {titel}
        </div>
        {held && (
          <div className="dk-held num">
            <small>{held.label}</small>
            <b>{geld(held.rp)}</b>
            {held.zusatz && <span>{held.zusatz}</span>}
          </div>
        )}
      </header>
      {children && <div className="dk-angaben">{children}</div>}
    </>
  );
}

/** Zahlung links, Totale rechts – dieselben Zeilen wie im PDF (totalZeilen) */
export function PapierSummen({ dok }: { dok: BelegDokument }) {
  const D = DOK[dok.sprache];
  const z = zahlungZeilen(dok);
  return (
    <div className="dk-summen">
      <div className="dk-abschluss">
        <div className="dk-abschluss-l">
          {dok.info && (
            <div className="dk-info">
              <span className="dk-kicker">{D.zahlungsbedingungen}</span>
              {dok.info}
            </div>
          )}
          {z.length > 0 && (
            <div className="dk-zahlinfo num" style={dok.info ? { marginTop: '4mm' } : undefined}>
              <span className="dk-kicker">{D.zahlung}</span>
              <dl>
                {z.map(([l, v]) => (
                  <div key={l}>
                    <dt>{l}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              {dok.zahlung?.qrNotiz && <div className="dk-zahlnotiz">{D.qrNotiz}</div>}
            </div>
          )}
        </div>
        <div className="dk-tot num">
          {totalZeilen(dok).map(([k, t, b], i) => (
            <div key={i} className={k}>
              <span>{t}</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Unterschrift({ sprache }: { sprache: BelegSprache }) {
  const D = DOK[sprache];
  return (
    <div className="dk-unterschrift">
      <div>{D.ortDatum}</div>
      <div>{D.unterschrift}</div>
    </div>
  );
}

export function PapierFuss({ absender, bezug }: { absender: BelegAbsender; bezug: string }) {
  return (
    <footer className="dk-fuss">
      {fussSpalten(absender).map((sp, i) => (
        <div key={i}>
          {sp.map((z, j) => (
            <span key={j}>
              {z}
              <br />
            </span>
          ))}
        </div>
      ))}
      <div className="dk-fuss-bezug">{bezug}</div>
    </footer>
  );
}

/** Zweites Blatt: Swiss QR-Zahlteil (bzw. Stil-Anhang) – exakt das HTML des PDF */
export function ZusatzBlatt({ dok, art }: { dok: BelegDokument; art: 'qr' | 'stil' }) {
  const html = art === 'qr' ? (dok.qr ? zahlteilHtml(dok.qr, dok.sprache, { titel: `${dok.dokTitel} ${dok.nummer}`, zeilen: dok.meta }) : '') : stilHtml(dok);
  if (!html) return null;
  return (
    <div className={`dk-papier dk-zusatz bl ${art === 'qr' ? 'dk-zusatz-qr' : ''}`}>
      <div className="dk-zusatz-marke">
        <Icon name={art === 'qr' ? 'QrCode' : 'Shirt'} size={13} />
        {art === 'qr' ? 'Seite mit QR-Zahlteil' : 'Anhang Stil-Auswahl'}
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
