'use client';
// Aktionen einer Anfrage: Bestätigen (Mail mit .ics), neuen Termin vorschlagen (1–3 Slots), Status, Notiz.
// Danach: vorbereitete Nachricht für WhatsApp/SMS (1:1, Knopf öffnet die App).
// Bestätigen fragt den Weg: E-Mail automatisch (mit Kalender), WhatsApp, SMS, eigenes Mailprogramm oder nur im
// System. Ein App-Knopf öffnet die App mit fertigem Text und bestätigt im selben Moment im System (keepalive).
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SlotPicker from './SlotPicker';
import KontaktKanaele, { type KanalKontakt, type KanalTexte } from './KontaktKanaele';
import Icon from './Icon';
import { smsLink, waLink } from '@/lib/crm/telefon';
import { terminLang } from '@/lib/zeit';
import { bestaetigungNachricht, textAllgemein, textBestaetigung, textRueckruf, textVorschlag } from '@/lib/crm/nachrichten';
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

  // Bestätigungstexte je Kanal (WhatsApp mit Emojis, SMS kurz, E-Mail ohne Emojis)
  const bestaetigtFuer = danach?.anlass === 'Bestätigung' ? start[0] : p.status === 'bestaetigt' ? p.bestaetigtStart : null;
  const texteFuer = (iso: string | null): KanalTexte | undefined =>
    iso
      ? {
          whatsapp: bestaetigungNachricht('whatsapp', p.k.name, new Date(iso)).text,
          sms: bestaetigungNachricht('sms', p.k.name, new Date(iso)).text,
          mail: bestaetigungNachricht('mail', p.k.name, new Date(iso)).text,
        }
      : undefined;
  const kanalTexte = texteFuer(bestaetigtFuer);
  const mailBetreff = bestaetigtFuer ? bestaetigungNachricht('mail', p.k.name, new Date(bestaetigtFuer)).betreff : kanalText.betreff;

  // Dialog «Wie bestätigen?»
  const [wahl, setWahl] = useState(false);
  const wahlTexte = texteFuer(start[0] ?? null);
  const sperre = (ok: boolean) => (!p.k.telefon ? 'Keine Telefonnummer' : p.k.abgemeldet ? 'Abgemeldet' : !ok ? 'Keine Einwilligung für WhatsApp/SMS' : '');
  function perApp(kanal: 'whatsapp' | 'sms' | 'mail') {
    const text = wahlTexte?.[kanal] ?? '';
    // keepalive: kommt an, auch wenn der Browser gleich in WhatsApp/SMS/Mail wechselt
    fetch(`/api/admin/termine/${p.terminId}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aktion: 'bestaetigen', start: start[0], mail: false, kanal, text }),
      keepalive: true,
    })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        setMeldung(r.ok ? { art: 'gruen', text: j.meldung || 'Termin bestätigt.' } : { art: 'rot', text: j.fehler || 'Bestätigung im System fehlgeschlagen.' });
        if (r.ok) setDanach({ text: textBestaetigung(p.k.name, terminLang(new Date(start[0]))), betreff: 'Ihr Termin bei The Sartorialist Zürich', anlass: 'Bestätigung' });
        router.refresh();
      })
      .catch(() => setMeldung({ art: 'rot', text: 'Bestätigung im System fehlgeschlagen — bitte nochmals versuchen.' }));
    setWahl(false);
  }
  const mailtoHref =
    p.k.email && start[0] && wahlTexte?.mail
      ? `mailto:${p.k.email}?subject=${encodeURIComponent(bestaetigungNachricht('mail', p.k.name, new Date(start[0])).betreff)}&body=${encodeURIComponent(wahlTexte.mail)}`
      : undefined;

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
            <button type="button" className="a-knopf voll" disabled={laedt || !start[0]} onClick={() => setWahl(true)}>
              {laedt ? 'Moment …' : p.status === 'bestaetigt' ? 'Termin ändern & bestätigen …' : 'Termin bestätigen …'}
            </button>
            {wahl && start[0] && (
              <div className="a-ebene" role="dialog" aria-modal="true" aria-labelledby="best-titel" onKeyDown={(e) => e.key === 'Escape' && setWahl(false)} onClick={() => setWahl(false)}>
                <div className="a-ebene-karte best-wahl" onClick={(e) => e.stopPropagation()}>
                  <div className="a-karte-kopf">
                    <h2 id="best-titel">Wie möchten Sie bestätigen?</h2>
                    <button type="button" className="a-x" aria-label="Schliessen" onClick={() => setWahl(false)} autoFocus>
                      <Icon name="x" />
                    </button>
                  </div>
                  <div className="a-karte-inhalt">
                    <p className="a-sub" style={{ marginTop: 0 }}>
                      {p.k.name} · <b>{terminLang(new Date(start[0]))}</b>. Der Termin wird im System bestätigt, sobald Sie einen Weg wählen.
                    </p>
                    <div className="best-optionen">
                      {p.k.email && p.mailBereit ? (
                        <button
                          type="button"
                          className="best-opt mail"
                          disabled={laedt}
                          onClick={async () => {
                            setWahl(false);
                            await senden('bestaetigen', { start: start[0], mail: true });
                          }}
                        >
                          <Icon name="mail" />
                          <span>
                            <b>E-Mail automatisch senden</b>
                            <small>Mit Kalendereintrag an {p.k.email}</small>
                          </span>
                        </button>
                      ) : (
                        <span className="best-opt mail" aria-disabled="true">
                          <Icon name="mail" />
                          <span>
                            <b>E-Mail automatisch senden</b>
                            <small>{p.k.email ? 'E-Mail-Versand nicht konfiguriert' : 'Keine E-Mail-Adresse'}</small>
                          </span>
                        </span>
                      )}
                      {p.k.telefon && !sperre(p.k.whatsappOk) ? (
                        <a className="best-opt whatsapp" href={waLink(p.k.telefon, wahlTexte?.whatsapp ?? '')} target="_blank" rel="noopener" onClick={() => perApp('whatsapp')}>
                          <Icon name="whatsapp" />
                          <span>
                            <b>WhatsApp öffnen</b>
                            <small>Nachricht mit Termin, Adresse und Karte vorbereitet</small>
                          </span>
                        </a>
                      ) : (
                        <span className="best-opt whatsapp" aria-disabled="true">
                          <Icon name="whatsapp" />
                          <span>
                            <b>WhatsApp öffnen</b>
                            <small>{sperre(p.k.whatsappOk)}</small>
                          </span>
                        </span>
                      )}
                      {p.k.telefon && !sperre(p.k.smsOk) ? (
                        <a className="best-opt sms" href={smsLink(p.k.telefon, wahlTexte?.sms ?? '')} onClick={() => perApp('sms')}>
                          <Icon name="sms" />
                          <span>
                            <b>SMS öffnen</b>
                            <small>Kurze Bestätigung vorbereitet</small>
                          </span>
                        </a>
                      ) : (
                        <span className="best-opt sms" aria-disabled="true">
                          <Icon name="sms" />
                          <span>
                            <b>SMS öffnen</b>
                            <small>{sperre(p.k.smsOk)}</small>
                          </span>
                        </span>
                      )}
                      {mailtoHref && (
                        <a className="best-opt mailapp" href={mailtoHref} onClick={() => perApp('mail')}>
                          <Icon name="stift" />
                          <span>
                            <b>Im eigenen Mailprogramm</b>
                            <small>E-Mail selbst prüfen und senden</small>
                          </span>
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      className="a-knopf leise voll"
                      disabled={laedt}
                      onClick={async () => {
                        setWahl(false);
                        await senden('bestaetigen', { start: start[0], mail: false });
                      }}
                    >
                      Nur im System bestätigen
                    </button>
                  </div>
                </div>
              </div>
            )}
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
          <KontaktKanaele k={p.k} terminId={p.terminId} text={kanalText.text} texte={kanalTexte} betreff={mailBetreff} anlass={kanalText.anlass} />
        </div>
      </div>
    </div>
  );
}
