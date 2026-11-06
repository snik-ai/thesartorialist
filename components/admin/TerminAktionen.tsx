'use client';
// Aktionen einer Anfrage: Bestätigen (Mail mit .ics), neuen Termin vorschlagen (1–3 Slots), Status, Notiz.
// Danach: vorbereitete Nachricht für WhatsApp/SMS (1:1, Knopf öffnet die App).
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SlotPicker from './SlotPicker';
import KontaktKanaele, { type KanalKontakt } from './KontaktKanaele';
import { terminLang } from '@/lib/zeit';
import { textAllgemein, textBestaetigung, textRueckruf, textVorschlag } from '@/lib/crm/nachrichten';
import type { TerminStatus } from '@/lib/db/schema';

type Props = {
  terminId: string;
  art: 'termin' | 'rueckruf';
  status: TerminStatus;
  wunschStart: string | null;
  bestaetigtStart: string | null;
  vorschlaege: string[];
  belegt: string[];
  eingangOffen: boolean;
  mailBereit: boolean;
  k: KanalKontakt;
};

type Modus = 'bestaetigen' | 'vorschlagen' | 'mehr';

export default function TerminAktionen(p: Props) {
  const router = useRouter();
  const [modus, setModus] = useState<Modus>(p.art === 'rueckruf' ? 'mehr' : p.status === 'vorgeschlagen' ? 'vorschlagen' : 'bestaetigen');
  const [start, setStart] = useState<string[]>(p.bestaetigtStart ? [p.bestaetigtStart] : p.wunschStart && new Date(p.wunschStart) > new Date() ? [p.wunschStart] : []);
  const [slots, setSlots] = useState<string[]>(p.vorschlaege.filter((v) => new Date(v) > new Date()));
  const [nachricht, setNachricht] = useState('');
  const [mail, setMail] = useState(Boolean(p.k.email) && p.mailBereit);
  const [notiz, setNotiz] = useState('');
  const [laedt, setLaedt] = useState(false);
  const [meldung, setMeldung] = useState<{ art: 'gruen' | 'rot'; text: string } | null>(null);
  const [danach, setDanach] = useState<{ text: string; betreff: string; anlass: string } | null>(null);

  const standardText = useMemo(() => {
    if (p.status === 'bestaetigt' && p.bestaetigtStart) return { text: textBestaetigung(p.k.name, terminLang(new Date(p.bestaetigtStart))), betreff: 'Ihr Termin bei The Sartorialist Zürich', anlass: 'Bestätigung' };
    if (p.status === 'vorgeschlagen' && p.vorschlaege.length) return { text: textVorschlag(p.k.name, p.vorschlaege.map((v) => terminLang(new Date(v)))), betreff: 'Terminvorschläge — The Sartorialist Zürich', anlass: 'Vorschlag' };
    if (p.art === 'rueckruf') return { text: textRueckruf(p.k.name), betreff: 'Ihr Rückruf — The Sartorialist Zürich', anlass: 'Rückruf' };
    return { text: textAllgemein(p.k.name), betreff: 'Ihre Anfrage bei The Sartorialist Zürich', anlass: 'Anfrage' };
  }, [p]);
  const kanalText = danach ?? standardText;

  async function senden(aktion: string, daten: Record<string, unknown> = {}) {
    setLaedt(true);
    setMeldung(null);
    try {
      const r = await fetch(`/api/admin/termine/${p.terminId}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aktion, ...daten }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.fehler || 'Fehler');
      setMeldung({ art: j.mailFehler ? 'rot' : 'gruen', text: j.meldung || 'Gespeichert.' });
      if (j.text) setDanach({ text: j.text, betreff: j.betreff, anlass: j.anlass });
      router.refresh();
      return true;
    } catch (e) {
      setMeldung({ art: 'rot', text: (e as Error).message });
      return false;
    } finally {
      setLaedt(false);
    }
  }

  const Schalter = () =>
    p.k.email ? (
      <button type="button" className="a-toggle" aria-pressed={mail} onClick={() => setMail(!mail)} disabled={!p.mailBereit} title={p.mailBereit ? undefined : 'Resend ist nicht konfiguriert'}>
        <i />
        {p.mailBereit ? 'Per E-Mail senden (mit Kalender)' : 'E-Mail-Versand nicht konfiguriert'}
      </button>
    ) : (
      <p className="a-sub" style={{ fontSize: 12.5 }}>
        Keine E-Mail-Adresse — danach per WhatsApp, SMS oder Anruf mitteilen.
      </p>
    );

  return (
    <div className="a-karte">
      <div className="a-karte-kopf">
        <h2>Aktionen</h2>
      </div>
      <div className="a-karte-inhalt a-aktionen">
        {p.art === 'termin' && (
          <div className="a-aktion-tabs" role="tablist">
            {(
              [
                ['bestaetigen', 'Bestätigen'],
                ['vorschlagen', 'Vorschlagen'],
                ['mehr', 'Status'],
              ] as [Modus, string][]
            ).map(([m, l]) => (
              <button key={m} type="button" role="tab" aria-pressed={modus === m} onClick={() => setModus(m)}>
                {l}
              </button>
            ))}
          </div>
        )}

        {modus === 'bestaetigen' && p.art === 'termin' && (
          <>
            <SlotPicker wert={start} onChange={setStart} belegt={p.belegt} wunsch={p.wunschStart} />
            {start[0] && (
              <div className="a-hinweis gruen">
                Termin: <b>{terminLang(new Date(start[0]))}</b>
              </div>
            )}
            <Schalter />
            <button type="button" className="a-knopf voll" disabled={laedt || !start[0]} onClick={() => senden('bestaetigen', { start: start[0], mail })}>
              {laedt ? 'Moment …' : p.status === 'bestaetigt' ? 'Termin ändern & bestätigen' : 'Termin bestätigen'}
            </button>
          </>
        )}

        {modus === 'vorschlagen' && p.art === 'termin' && (
          <>
            <p className="a-sub" style={{ marginTop: -4 }}>
              Bis zu 3 Termine wählen. Gelb umrandet: Wunschzeit. Gestreift: schon belegt.
            </p>
            <SlotPicker max={3} wert={slots} onChange={setSlots} belegt={p.belegt} wunsch={p.wunschStart} />
            <label className="a-feld" style={{ marginBottom: 0 }}>
              <span>Persönliche Zeile (optional)</span>
              <textarea className="a-input" rows={3} value={nachricht} onChange={(e) => setNachricht(e.target.value)} placeholder="Leider ist Ihr Wunschtermin schon vergeben …" />
            </label>
            <Schalter />
            <button type="button" className="a-knopf voll" disabled={laedt || !slots.length} onClick={() => senden('vorschlagen', { slots, nachricht, mail })}>
              {laedt ? 'Moment …' : `${slots.length || ''} Vorschl${slots.length === 1 ? 'ag' : 'äge'} senden`}
            </button>
          </>
        )}

        {modus === 'mehr' && (
          <>
            <div className="a-knopfreihe">
              {p.status !== 'erledigt' && (
                <button type="button" className="a-knopf linie" disabled={laedt} onClick={() => senden('erledigt')}>
                  Erledigt
                </button>
              )}
              {p.status !== 'abgesagt' && (
                <button type="button" className="a-knopf rot" disabled={laedt} onClick={() => confirm('Anfrage wirklich absagen?') && senden('abgesagt')}>
                  Absagen
                </button>
              )}
              {(p.status === 'erledigt' || p.status === 'abgesagt') && (
                <button type="button" className="a-knopf linie" disabled={laedt} onClick={() => senden('oeffnen')}>
                  Wieder öffnen
                </button>
              )}
              {p.eingangOffen && p.k.email && p.mailBereit && (
                <button type="button" className="a-knopf linie" disabled={laedt} onClick={() => senden('eingangsmail')}>
                  Eingangsbestätigung senden
                </button>
              )}
            </div>
            <label className="a-feld" style={{ marginBottom: 0 }}>
              <span>Notiz</span>
              <textarea className="a-input" rows={3} value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="z. B. Rückruf am Montag vereinbart" />
            </label>
            <button
              type="button"
              className="a-knopf linie"
              disabled={laedt || !notiz.trim()}
              onClick={async () => {
                if (await senden('notiz', { text: notiz })) setNotiz('');
              }}
            >
              Notiz speichern
            </button>
          </>
        )}

        {meldung && (
          <p className={`a-hinweis ${meldung.art}`} role="status">
            {meldung.text}
          </p>
        )}

        <div>
          <span className="a-kicker" style={{ marginTop: 6 }}>
            {danach ? 'Jetzt auch persönlich mitteilen' : 'Kontakt aufnehmen'}
          </span>
          <KontaktKanaele k={p.k} terminId={p.terminId} text={kanalText.text} betreff={kanalText.betreff} anlass={kanalText.anlass} />
        </div>
      </div>
    </div>
  );
}
