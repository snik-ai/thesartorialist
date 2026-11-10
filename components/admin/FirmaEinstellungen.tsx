'use client';
// Einstellungen in der Datenbank: Firma & Dokumente (MWST, IBAN/QR-IBAN, Fristen, Texte), Termin-Erinnerung, Preisliste, Logo.
import { useRef, useState } from 'react';
import Icon from './Icon';
import Auswahl from './Auswahl';
import { MeldungZeile, useAktion } from './useAktion';
import { KATEGORIEN } from '@/lib/crm/belege';
import { neueId, rpAusText, rpZuText } from '@/lib/crm/geld';
import type { Firma, KatalogEintrag } from '@/lib/crm/firma';
import { bankPruefen, ibanGruppen, ibanPruefen } from '@/lib/beleg/bank';
import { planStandardAus, planWahl } from '@/lib/crm/zahlungsplan';
import './zahlung.css';

const URL = '/api/admin/firma/';

function Feld({ label, wert, onChange, ...rest }: { label: string; wert: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  return (
    <label className="a-feld">
      <span>{label}</span>
      <input className="a-input" value={wert} onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  );
}

function ZahlChips({ label, wert, optionen, onChange, einheit }: { label: string; wert: number; optionen: number[]; onChange: (n: number) => void; einheit: string }) {
  const [text, setText] = useState(String(wert));
  return (
    <div className="a-feld">
      <span>{label}</span>
      <div className="a-zahlchips">
        <div className="a-segment klein" role="group" aria-label={label}>
          {optionen.map((o) => (
            <button key={o} type="button" aria-pressed={wert === o} onClick={() => { onChange(o); setText(String(o)); }}>
              {String(o).replace('.', ',')} {einheit}
            </button>
          ))}
        </div>
        <input className="a-input zahl klein" inputMode="decimal" value={text} aria-label={`${label} frei`} onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value.replace(',', '.'));
          if (Number.isFinite(n)) onChange(n);
        }} />
      </div>
    </div>
  );
}

/** IBAN-Feld mit Live-Prüfung (swissqrbill): 4er-Gruppen beim Verlassen, Häkchen bei gültig, Hinweis zur Referenzart */
function IbanFeld({ label, wert, feld, onChange, placeholder }: { label: string; wert: string; feld: 'iban' | 'qr'; onChange: (v: string) => void; placeholder: string }) {
  const [beruehrt, setBeruehrt] = useState(false);
  const p = ibanPruefen(wert, feld);
  const zeigeFehler = !p.leer && p.fehler && (beruehrt || p.formatiert.replace(/\s/g, '').length >= 21);
  return (
    <label className="a-feld bank-feld">
      <span>{label}</span>
      <span className={`bank-eingabe${p.ok ? ' ok' : zeigeFehler ? ' fehler' : ''}`}>
        <input
          className="a-input zahl"
          value={wert}
          placeholder={placeholder}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          aria-invalid={Boolean(zeigeFehler)}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onBlur={() => {
            setBeruehrt(true);
            if (wert.trim()) onChange(ibanGruppen(wert));
          }}
        />
        {p.ok && <Icon name="check" />}
      </span>
      {p.ok ? (
        <small className="bank-info ok">{p.qr ? 'Gültige QR-IBAN → Rechnungen mit QR-Referenz (27 Ziffern)' : 'Gültige IBAN → Rechnungen mit Creditor Reference (RF …)'}</small>
      ) : zeigeFehler ? (
        <small className="bank-info fehler">{p.fehler}</small>
      ) : (
        <small className="bank-info">{feld === 'qr' ? 'Nur falls die Bank eine QR-IBAN vergeben hat (Institut-ID 30000–31999).' : 'Steht auf dem Kontoauszug bzw. im E-Banking (21 Zeichen, beginnt mit CH).'}</small>
      )}
    </label>
  );
}

/** Zusammenfassung: Ist der QR-Zahlteil bereit? Was fehlt noch? */
function BankStatus({ f }: { f: Firma }) {
  const b = bankPruefen(f);
  return (
    <div className={`bank-status${b.ok ? ' ok' : ''}`} role="status">
      <Icon name={b.ok ? 'check' : 'rechnung'} />
      <div>
        <b>{b.ok ? 'QR-Rechnung bereit' : b.kontoArt ? 'QR-Rechnung fast bereit' : 'Bankverbindung fehlt'}</b>
        {b.ok ? (
          <p>
            Konto <span className="zahl">{b.konto}</span> · {b.referenzArt === 'QRR' ? 'QR-Referenz (27 Ziffern)' : 'Creditor Reference (RF)'} · Zahlungsempfänger {f.rechtsname || f.name}, {f.strasse}, {f.plz} {f.ort}
          </p>
        ) : (
          <ul>
            {b.fehler.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}
        {!b.ok && <p>Rechnungen lassen sich als Entwurf bearbeiten; festschreiben und versenden geht, sobald hier alles grün ist.</p>}
      </div>
    </div>
  );
}

export function FirmaForm({ firma }: { firma: Firma }) {
  const [f, setF] = useState(firma);
  const { laedt, meldung, senden } = useAktion();
  const s = <K extends keyof Firma>(k: K) => (v: Firma[K]) => setF({ ...f, [k]: v });
  const t = (k: keyof Firma['texte']) => (e: React.ChangeEvent<HTMLTextAreaElement>) => setF({ ...f, texte: { ...f.texte, [k]: e.target.value } });

  return (
    <section className="a-karte" id="firma">
      <div className="a-karte-kopf">
        <h2>Firma &amp; Dokumente</h2>
        <span className="a-sub" style={{ margin: 0 }}>
          für Angebote, Rechnungen und den QR-Zahlteil
        </span>
      </div>
      <div className="a-karte-inhalt a-einst">
        <div className="a-einst-gruppe">
          <span className="a-kicker">Absender</span>
          <Feld label="Name" wert={f.name} onChange={s('name')} />
          <Feld label="Rechtlicher Name (Zahlungsempfänger)" wert={f.rechtsname} onChange={s('rechtsname')} />
          <Feld label="Strasse und Nr." wert={f.strasse} onChange={s('strasse')} />
          <Feld label="PLZ" wert={f.plz} onChange={s('plz')} inputMode="numeric" />
          <Feld label="Ort" wert={f.ort} onChange={s('ort')} />
          <Feld label="Land (Ländercode)" wert={f.land} onChange={(v) => s('land')(v.toUpperCase().slice(0, 2))} maxLength={2} autoCapitalize="characters" />
          <Feld label="Telefon" wert={f.telefon} onChange={s('telefon')} type="tel" />
          <Feld label="E-Mail" wert={f.email} onChange={s('email')} type="email" autoCapitalize="none" />
          <Feld label="Website" wert={f.web} onChange={s('web')} autoCapitalize="none" />
        </div>
        <div className="a-einst-gruppe">
          <span className="a-kicker">MWST &amp; Zahlung</span>
          <button type="button" className="a-toggle" aria-pressed={f.mwstPflichtig} onClick={() => s('mwstPflichtig')(!f.mwstPflichtig)} style={{ marginBottom: 14 }}>
            <i /> MWST-pflichtig (MWST auf Angeboten und Rechnungen ausweisen)
          </button>
          {f.mwstPflichtig && (
            <>
              <ZahlChips label="MWST-Satz" wert={f.mwstSatz} optionen={[8.1, 2.6, 3.8]} onChange={s('mwstSatz')} einheit="%" />
              <Feld label="MWST-Nummer" wert={f.mwstNr} onChange={s('mwstNr')} placeholder="CHE-123.456.789 MWST" />
            </>
          )}
          <ZahlChips label="Zahlungsfrist" wert={f.zahlungsfristTage} optionen={[10, 20, 30]} onChange={s('zahlungsfristTage')} einheit="Tage" />
          <ZahlChips label="Angebot gültig" wert={f.angebotGueltigTage} optionen={[14, 30, 60]} onChange={s('angebotGueltigTage')} einheit="Tage" />
          <ZahlChips label="Anzahlung (Standard)" wert={f.anzahlungProzent} optionen={[30, 50, 100]} onChange={s('anzahlungProzent')} einheit="%" />
          <div className="a-feld">
            <span>Zahlungsplan neuer Angebote</span>
            <div className="a-chips zp-vorlagen" role="group" aria-label="Standard-Zahlungsplan">
              {planWahl(f.anzahlungProzent).map((w) => (
                <button key={w.key} type="button" className="a-chip klein" aria-pressed={planStandardAus(f.zahlungsplanStandard) === w.key} aria-current={planStandardAus(f.zahlungsplanStandard) === w.key ? 'true' : undefined} onClick={() => s('zahlungsplanStandard')(w.key)}>
                  {w.kurz}
                </button>
              ))}
            </div>
            <small className="bank-info">{planWahl(f.anzahlungProzent).find((w) => w.key === planStandardAus(f.zahlungsplanStandard))?.label}. Steht im Angebot (PDF und Annahmeseite), lässt sich je Angebot ändern und wird bei der Annahme in den Auftrag übernommen.</small>
          </div>
          <ZahlChips label="Produktion bis Eingang" wert={f.produktionTage} optionen={[15, 20, 25]} onChange={s('produktionTage')} einheit="Arbeitstage" />
        </div>
        <div className="a-einst-gruppe breit" id="bank">
          <span className="a-kicker">Bankverbindung &amp; QR-Rechnung</span>
          <BankStatus f={f} />
          <div className="bank-felder">
            <IbanFeld label="IBAN" feld="iban" wert={f.iban} onChange={s('iban')} placeholder="CH58 0079 1123 0008 8901 2" />
            <IbanFeld label="QR-IBAN (optional)" feld="qr" wert={f.qrIban} onChange={s('qrIban')} placeholder="CH44 3199 9123 0008 8901 2" />
            <Feld label="Bank" wert={f.bank} onChange={s('bank')} placeholder="z. B. Zürcher Kantonalbank" />
          </div>
          <p className="a-sub" style={{ fontSize: 12.5 }}>
            Zahlungsempfänger auf dem QR-Zahlteil ist der rechtliche Name mit der Adresse oben. Ist eine QR-IBAN eingetragen, hat sie Vorrang (QR-Referenz); sonst gilt die IBAN mit Creditor Reference. Bereits verschickte Rechnungen behalten ihre Referenz.
          </p>
        </div>
        <div className="a-einst-gruppe breit">
          <span className="a-kicker">Standardtexte</span>
          {(
            [
              ['angebotEinleitung', 'Angebot · Einleitung'],
              ['angebotSchluss', 'Angebot · Schluss'],
              ['rechnungEinleitung', 'Rechnung · Einleitung'],
              ['anzahlungEinleitung', 'Anzahlung · Einleitung'],
              ['rechnungSchluss', 'Rechnung · Schluss'],
            ] as const
          ).map(([k, l]) => (
            <label key={k} className="a-feld">
              <span>{l}</span>
              <textarea className="a-input" rows={3} value={f.texte[k]} onChange={t(k)} />
            </label>
          ))}
        </div>
        <div className="a-einst-gruppe breit">
          <span className="a-kicker">Termin-Erinnerung</span>
          <button type="button" className="a-toggle" aria-pressed={f.erinnerungAktiv} onClick={() => s('erinnerungAktiv')(!f.erinnerungAktiv)}>
            <i /> Erinnerungs-Mail vor jedem Termin (auch an unbestätigte Wunschtermine)
          </button>
          {f.erinnerungAktiv && (
            <div style={{ marginTop: 14 }}>
              <ZahlChips label="Vorlauf" wert={f.erinnerungStunden} optionen={[1, 2, 3, 24]} onChange={s('erinnerungStunden')} einheit="Std." />
            </div>
          )}
          <p className="a-sub" style={{ fontSize: 12.5 }}>
            Läuft alle 5 Minuten im Server, nur wenn der Mailversand (Resend) eingerichtet ist. Die Mail kommt in der Sprache des Kunden.
          </p>
        </div>
        <div className="a-einst-gruppe breit">
          <span className="a-kicker">Mahnwesen</span>
          <button type="button" className="a-toggle" aria-pressed={f.mahnVorschlagAktiv} onClick={() => s('mahnVorschlagAktiv')(!f.mahnVorschlagAktiv)}>
            <i /> Mahnung automatisch vorschlagen (Liste «Zu mahnen») – versendet wird nur auf Klick
          </button>
          <div style={{ marginTop: 14, display: 'grid', gap: 4 }}>
            <ZahlChips label="Zahlungserinnerung ab" wert={f.mahnTage1} optionen={[5, 7, 10]} onChange={s('mahnTage1')} einheit="Tage nach Fälligkeit" />
            <ZahlChips label="1. Mahnung ab" wert={f.mahnTage2} optionen={[14, 21, 30]} onChange={s('mahnTage2')} einheit="Tage" />
            <ZahlChips label="2. Mahnung ab" wert={f.mahnTage3} optionen={[30, 35, 45]} onChange={s('mahnTage3')} einheit="Tage" />
            <ZahlChips label="Zahlungsfrist je Mahnung" wert={f.mahnFristTage} optionen={[7, 10, 14]} onChange={s('mahnFristTage')} einheit="Tage" />
            <ZahlChips label="Mahngebühr 1. Mahnung" wert={f.mahnGebuehr2Rp / 100} optionen={[0, 20, 30]} onChange={(n) => s('mahnGebuehr2Rp')(Math.round(n * 100))} einheit="CHF" />
            <ZahlChips label="Mahngebühr 2. Mahnung" wert={f.mahnGebuehr3Rp / 100} optionen={[0, 40, 50]} onChange={(n) => s('mahnGebuehr3Rp')(Math.round(n * 100))} einheit="CHF" />
          </div>
          <p className="a-sub" style={{ fontSize: 12.5 }}>
            Die Zahlungserinnerung ist gebührenfrei. Jede Stufe kommt als A4-Brief mit QR-Zahlteil, per E-Mail in der Sprache des Kunden.
          </p>
        </div>
        <div className="a-einst-fuss">
          <MeldungZeile m={meldung} />
          <button type="button" className="a-knopf" disabled={laedt} onClick={async () => {
            const r = await senden<{ firma: Firma }>(URL, { schluessel: 'firma', wert: f }, 'PUT');
            if (r?.firma) setF(r.firma);
          }}>
            {laedt ? 'Moment …' : 'Firma & Dokumente speichern'}
          </button>
        </div>
      </div>
    </section>
  );
}

export function KatalogForm({ katalog }: { katalog: KatalogEintrag[] }) {
  const [liste, setListe] = useState(katalog.map((k) => ({ ...k, preisText: k.preisRp ? rpZuText(k.preisRp) : '' })));
  const { laedt, meldung, senden } = useAktion();
  const setze = (i: number, t: Partial<(typeof liste)[number]>) => setListe(liste.map((x, j) => (j === i ? { ...x, ...t } : x)));
  return (
    <section className="a-karte" id="preisliste">
      <div className="a-karte-kopf">
        <h2>Preisliste</h2>
        <span className="a-sub" style={{ margin: 0 }}>
          Vorlagen für Angebotspositionen · Preise inkl. MWST
        </span>
      </div>
      <div className="a-karte-inhalt">
        <div className="a-katalog-liste">
          {liste.map((e, i) => (
            <div key={e.id} className="a-katalog-zeile">
              <Auswahl klein optionen={KATEGORIEN.map((k) => ({ wert: k.key, label: k.label }))} wert={e.kategorie} onChange={(v) => setze(i, { kategorie: v ?? 'sonstiges' })} suche={false} />
              <input className="a-input" value={e.bezeichnung} onChange={(x) => setze(i, { bezeichnung: x.target.value })} aria-label="Bezeichnung" />
              <input className="a-input" value={e.beschreibung ?? ''} onChange={(x) => setze(i, { beschreibung: x.target.value })} placeholder="Beschreibung (optional)" aria-label="Beschreibung" />
              <span className="a-betrag">
                <em>CHF</em>
                <input className={`a-input zahl${rpAusText(e.preisText) === null ? ' fehler' : ''}`} inputMode="decimal" value={e.preisText} onChange={(x) => setze(i, { preisText: x.target.value })} placeholder="Preis" aria-label="Preis" />
              </span>
              <button type="button" className="a-x" aria-label="Entfernen" onClick={() => setListe(liste.filter((_, j) => j !== i))}>
                <Icon name="papierkorb" />
              </button>
            </div>
          ))}
        </div>
        <div className="a-knopfreihe" style={{ marginTop: 14, justifyContent: 'space-between' }}>
          <button type="button" className="a-knopf linie" onClick={() => setListe([...liste, { id: neueId(), kategorie: 'sonstiges', bezeichnung: '', preisRp: 0, preisText: '' }])}>
            <Icon name="plus" /> Eintrag
          </button>
          <button
            type="button"
            className="a-knopf"
            disabled={laedt || liste.some((e) => !e.bezeichnung.trim() || rpAusText(e.preisText) === null)}
            onClick={() => senden(URL, { schluessel: 'katalog', wert: liste.map(({ preisText, ...e }) => ({ ...e, preisRp: rpAusText(preisText) ?? 0 })) }, 'PUT')}
          >
            Preisliste speichern
          </button>
        </div>
        <MeldungZeile m={meldung} />
      </div>
    </section>
  );
}

export function LogoForm({ eigenes }: { eigenes: boolean }) {
  const datei = useRef<HTMLInputElement>(null);
  const { laedt, meldung, senden, setMeldung } = useAktion();
  const [stempel, setStempel] = useState(Date.now());
  return (
    <section className="a-karte" id="logo">
      <div className="a-karte-kopf">
        <h2>Logo auf PDFs</h2>
      </div>
      <div className="a-karte-inhalt a-aktionen">
        <div className="a-logo-vorschau">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={eigenes ? `${URL}?v=${stempel}` : '/images/marke/wortmarke-schwarz.png'} alt="Logo" />
        </div>
        <p className="a-sub" style={{ margin: 0 }}>
          {eigenes ? 'Eigenes Logo aktiv.' : 'Standard: Wortmarke «The Sartorialist Zürich».'} PNG mit transparentem Hintergrund oder JPEG, bis 1 MB.
        </p>
        <input
          ref={datei}
          type="file"
          accept="image/png,image/jpeg"
          className="a-sr"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 1_000_000) return setMeldung({ art: 'rot', text: 'Datei ist grösser als 1 MB.' });
            const base64 = await new Promise<string>((res) => {
              const r = new FileReader();
              r.onload = () => res(String(r.result));
              r.readAsDataURL(f);
            });
            if (await senden(URL, { schluessel: 'logo', wert: { base64 } }, 'PUT')) setStempel(Date.now());
            e.target.value = '';
          }}
        />
        <div className="a-knopfreihe">
          <button type="button" className="a-knopf linie" disabled={laedt} onClick={() => datei.current?.click()}>
            <Icon name="plus" /> Logo hochladen
          </button>
          {eigenes && (
            <button type="button" className="a-knopf leise" disabled={laedt} onClick={() => senden(URL, { schluessel: 'logo', wert: null }, 'PUT')}>
              Standard verwenden
            </button>
          )}
        </div>
        <MeldungZeile m={meldung} />
      </div>
    </section>
  );
}
