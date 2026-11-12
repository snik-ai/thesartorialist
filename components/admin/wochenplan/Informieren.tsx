'use client';
// Nach dem Verschieben eines Kundentermins: fragen, ob und wie der Kunde informiert wird. Nichts geht automatisch raus.
// E-Mail automatisch = bestehende Terminbestätigung mit Kalendereintrag; WhatsApp/SMS/Mailprogramm mit vorbereitetem Text.
import { useState } from 'react';
import Icon from '../Icon';
import { smsLink, waLink } from '@/lib/crm/telefon';
import { bestaetigungNachricht, nachrichtSprache, telefonNeuNachricht, type BestaetigungsKanal, type NachrichtSprache } from '@/lib/crm/nachrichten';
import { terminLang } from '@/lib/zeit';
import type { KalItem } from '@/lib/kalender';

export default function Informieren({ item, start, mailBereit, onClose, onMeldung }: { item: KalItem; start: string; mailBereit: boolean; onClose: () => void; onMeldung: (text: string, rot?: boolean) => void }) {
  const k = item.kontakt!;
  const [sprache, setSprache] = useState<NachrichtSprache>(nachrichtSprache(k.sprache));
  const [laedt, setLaedt] = useState(false);
  const telefon = item.typ === 'telefon';
  const d = new Date(start);
  const text = (kanal: BestaetigungsKanal) => (telefon ? telefonNeuNachricht(kanal, k.name, d, sprache) : bestaetigungNachricht(kanal, k.name, d, sprache));
  const sperre = (ok: boolean) => (!k.telefon ? 'Keine Telefonnummer' : k.abgemeldet ? 'Abgemeldet' : !ok ? 'Keine Einwilligung für WhatsApp/SMS' : '');

  function loggen(kanal: BestaetigungsKanal) {
    const name = { whatsapp: 'WhatsApp', sms: 'SMS', mail: 'E-Mail (Mailprogramm)' }[kanal];
    fetch('/api/admin/aktivitaet/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kontaktId: k.id, terminId: item.id, kanal, richtung: 'aus', titel: `Neue Zeit per ${name} mitgeteilt: ${terminLang(d)}`, text: text(kanal).text }),
      keepalive: true,
    }).catch(() => {});
    onMeldung(`${name} mit vorbereiteter Nachricht geöffnet`);
    onClose();
  }

  async function mailSenden() {
    setLaedt(true);
    try {
      const r = await fetch(`/api/admin/termine/${item.id}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aktion: 'bestaetigen', start, mail: true, sprache }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.fehler || 'Das hat nicht geklappt.');
      onMeldung(j.meldung || 'Bestätigung verschickt.', Boolean(j.mailFehler));
      onClose();
    } catch (e) {
      onMeldung((e as Error).message, true);
    } finally {
      setLaedt(false);
    }
  }

  const mailto = k.email ? `mailto:${k.email}?subject=${encodeURIComponent(text('mail').betreff)}&body=${encodeURIComponent(text('mail').text)}` : null;

  return (
    <div className="a-ebene" role="dialog" aria-modal="true" aria-labelledby="wp-info-titel" onKeyDown={(e) => e.key === 'Escape' && onClose()} onClick={onClose}>
      <div className="a-ebene-karte best-wahl" onClick={(e) => e.stopPropagation()}>
        <div className="a-karte-kopf">
          <h2 id="wp-info-titel">{k.name} informieren?</h2>
          <button type="button" className="a-x" aria-label="Schliessen" onClick={onClose} autoFocus>
            <Icon name="x" />
          </button>
        </div>
        <div className="a-karte-inhalt">
          <p className="a-sub" style={{ marginTop: 0 }}>
            Neue Zeit: <b>{terminLang(d)}</b>. Im System ist der Termin bereits verschoben — dem Kunden geht nur etwas raus, wenn Sie hier einen Weg wählen.
          </p>
          <div className="best-sprache">
            <span className="a-kicker">Sprache für den Kunden</span>
            <div className="a-segment klein" role="radiogroup" aria-label="Sprache">
              {(['de', 'en'] as const).map((s) => (
                <button key={s} type="button" role="radio" aria-checked={sprache === s} aria-pressed={sprache === s} onClick={() => setSprache(s)}>
                  {s === 'de' ? 'Deutsch' : 'English'}
                </button>
              ))}
            </div>
          </div>
          <div className="best-optionen">
            {!telefon && k.email && mailBereit && (
              <button type="button" className="best-opt mail" disabled={laedt} onClick={mailSenden}>
                <Icon name="mail" />
                <span>
                  <b>{laedt ? 'Moment …' : 'E-Mail automatisch senden'}</b>
                  <small>Neue Bestätigung mit Kalendereintrag an {k.email}</small>
                </span>
              </button>
            )}
            {k.telefon && !sperre(k.whatsappOk) ? (
              <a className="best-opt whatsapp" href={waLink(k.telefon, text('whatsapp').text)} target="_blank" rel="noopener" onClick={() => loggen('whatsapp')}>
                <Icon name="whatsapp" />
                <span>
                  <b>WhatsApp öffnen</b>
                  <small>Nachricht mit der neuen Zeit vorbereitet</small>
                </span>
              </a>
            ) : (
              <span className="best-opt whatsapp" aria-disabled="true">
                <Icon name="whatsapp" />
                <span>
                  <b>WhatsApp öffnen</b>
                  <small>{sperre(k.whatsappOk)}</small>
                </span>
              </span>
            )}
            {k.telefon && !sperre(k.smsOk) && (
              <a className="best-opt sms" href={smsLink(k.telefon, text('sms').text)} onClick={() => loggen('sms')}>
                <Icon name="sms" />
                <span>
                  <b>SMS öffnen</b>
                  <small>Kurze Nachricht vorbereitet</small>
                </span>
              </a>
            )}
            {mailto && (
              <a className="best-opt mailapp" href={mailto} onClick={() => loggen('mail')}>
                <Icon name="stift" />
                <span>
                  <b>Im eigenen Mailprogramm</b>
                  <small>E-Mail selbst prüfen und senden</small>
                </span>
              </a>
            )}
          </div>
          <button type="button" className="a-knopf leise voll" onClick={onClose}>
            Nicht informieren
          </button>
        </div>
      </div>
    </div>
  );
}
