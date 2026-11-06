'use client';
// Kontakt-Detail rechts: Kontakt aufnehmen, Notiz, Stammdaten bearbeiten, Einwilligungen.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import KontaktKanaele, { type KanalKontakt } from './KontaktKanaele';
import { textAllgemein } from '@/lib/crm/nachrichten';

type Daten = { name: string; email: string; telefon: string; firma: string; brandDomain: string; notiz: string };

export default function KontaktPanel({ k, daten, whatsapp, sms, abgemeldet }: { k: KanalKontakt; daten: Daten; whatsapp: boolean; sms: boolean; abgemeldet: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState(daten);
  const [notiz, setNotiz] = useState('');
  const [quelle, setQuelle] = useState('');
  const [laedt, setLaedt] = useState(false);
  const [meldung, setMeldung] = useState<{ art: 'gruen' | 'rot'; text: string } | null>(null);
  const [bearbeiten, setBearbeiten] = useState(false);

  async function speichern(body: Record<string, unknown>, ok = 'Gespeichert.') {
    setLaedt(true);
    setMeldung(null);
    try {
      const r = await fetch(`/api/admin/kontakte/${k.id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.fehler || 'Fehler');
      setMeldung({ art: 'gruen', text: ok });
      router.refresh();
      return true;
    } catch (e) {
      setMeldung({ art: 'rot', text: (e as Error).message });
      return false;
    } finally {
      setLaedt(false);
    }
  }

  async function notizSpeichern() {
    setLaedt(true);
    const r = await fetch('/api/admin/aktivitaet/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kontaktId: k.id, kanal: 'notiz', titel: 'Notiz', text: notiz }) });
    setLaedt(false);
    if (r.ok) {
      setNotiz('');
      router.refresh();
    }
  }

  const feld = (key: keyof Daten, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="a-feld">
      <span>{label}</span>
      <input className="a-input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} />
    </label>
  );

  return (
    <div className="a-raster">
      <div className="a-karte">
        <div className="a-karte-kopf">
          <h2>Kontakt aufnehmen</h2>
        </div>
        <div className="a-karte-inhalt">
          <KontaktKanaele k={k} text={textAllgemein(k.name)} betreff="The Sartorialist Zürich" anlass="Kontakt" />
        </div>
      </div>

      <div className="a-karte">
        <div className="a-karte-kopf">
          <h2>Notiz</h2>
        </div>
        <div className="a-karte-inhalt">
          <textarea className="a-input" rows={3} value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="z. B. bevorzugt Termine am Samstag, Hochzeit im Juni" aria-label="Notiz" />
          <button type="button" className="a-knopf linie" style={{ marginTop: 10 }} disabled={laedt || !notiz.trim()} onClick={notizSpeichern}>
            Notiz speichern
          </button>
        </div>
      </div>

      <div className="a-karte">
        <div className="a-karte-kopf">
          <h2>Einwilligungen</h2>
        </div>
        <div className="a-karte-inhalt" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
          <p className="a-sub" style={{ marginTop: 0 }}>
            Nur erfassen, wenn die Person zugestimmt hat (z. B. mündlich im Atelier). Zeitpunkt und Quelle werden gespeichert.
          </p>
          <label className="a-feld" style={{ width: '100%', marginBottom: 4 }}>
            <span>Quelle (optional)</span>
            <input className="a-input" value={quelle} onChange={(e) => setQuelle(e.target.value)} placeholder="z. B. mündlich im Atelier am 6.11." />
          </label>
          <button type="button" className="a-toggle" aria-pressed={whatsapp} disabled={laedt} onClick={() => speichern({ whatsapp: !whatsapp, einwilligungQuelle: quelle })}>
            <i /> WhatsApp erlaubt
          </button>
          <button type="button" className="a-toggle" aria-pressed={sms} disabled={laedt} onClick={() => speichern({ sms: !sms, einwilligungQuelle: quelle })}>
            <i /> SMS erlaubt
          </button>
          <button type="button" className="a-toggle" aria-pressed={abgemeldet} disabled={laedt} onClick={() => speichern({ abgemeldet: !abgemeldet })}>
            <i /> Abgemeldet (keine Nachrichten)
          </button>
        </div>
      </div>

      <div className="a-karte">
        <div className="a-karte-kopf">
          <h2>Stammdaten</h2>
          {!bearbeiten && (
            <button type="button" className="a-knopf leise klein" onClick={() => setBearbeiten(true)}>
              Bearbeiten
            </button>
          )}
        </div>
        {bearbeiten && (
          <div className="a-karte-inhalt">
            {feld('name', 'Name', { autoComplete: 'off' })}
            {feld('email', 'E-Mail', { type: 'email', inputMode: 'email', autoCapitalize: 'none', spellCheck: false })}
            {feld('telefon', 'Telefon', { type: 'tel', inputMode: 'tel' })}
            {feld('firma', 'Firma')}
            {feld('brandDomain', 'Website der Firma (für das Logo)', { placeholder: 'firma.ch', autoCapitalize: 'none', spellCheck: false })}
            <label className="a-feld">
              <span>Interne Notiz</span>
              <textarea className="a-input" value={form.notiz} onChange={(e) => setForm({ ...form, notiz: e.target.value })} />
            </label>
            <div className="a-knopfreihe">
              <button
                type="button"
                className="a-knopf"
                disabled={laedt}
                onClick={async () => {
                  if (await speichern(form)) setBearbeiten(false);
                }}
              >
                Speichern
              </button>
              <button
                type="button"
                className="a-knopf linie"
                onClick={() => {
                  setForm(daten);
                  setBearbeiten(false);
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {meldung && (
        <p className={`a-hinweis ${meldung.art}`} role="status">
          {meldung.text}
        </p>
      )}
    </div>
  );
}
