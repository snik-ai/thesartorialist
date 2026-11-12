'use client';
// Schnellaktionen in der Kundenakte: Anrufen, WhatsApp/SMS (nur mit Einwilligung), E-Mail, Angebot, Massblatt, Termin.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import SlotPicker, { type Belegt } from './SlotPicker';
import { MeldungZeile, useAktion } from './useAktion';
import { smsLink, telLink, waLink } from '@/lib/crm/telefon';
import { nachrichtSprache, textAllgemein } from '@/lib/crm/nachrichten';
import { terminLang } from '@/lib/zeit';
import type { KanalKontakt } from './KontaktKanaele';

const ZWECKE = [
  ['beratung', 'Beratung'],
  ['massnehmen', 'Massnehmen'],
  ['anprobe', 'Anprobe'],
  ['abholung', 'Abholung'],
  ['telefon', 'Telefon'],
] as const;

export function AngebotNeuKnopf({ kontaktId, terminId, klasse = 'a-knopf', text = 'Angebot erstellen' }: { kontaktId: string; terminId?: string; klasse?: string; text?: string }) {
  const router = useRouter();
  const { laedt, senden, meldung } = useAktion();
  return (
    <>
      <button
        type="button"
        className={klasse}
        disabled={laedt}
        onClick={async () => {
          const r = await senden<{ id: string }>('/api/admin/angebote/', { kontaktId, terminId }, 'POST', { still: true, ohneRefresh: true });
          if (r) router.push(`/admin/angebote/${r.id}/`);
        }}
      >
        <Icon name="dokument" /> {laedt ? 'Moment …' : text}
      </button>
      {meldung?.art === 'rot' && <MeldungZeile m={meldung} />}
    </>
  );
}

export default function KontaktSchnell({ k, belegt, mailBereit }: { k: KanalKontakt; belegt: Belegt; mailBereit: boolean }) {
  const router = useRouter();
  const [termin, setTermin] = useState(false);
  const [zweck, setZweck] = useState<(typeof ZWECKE)[number][0]>('beratung');
  const [start, setStart] = useState<string[]>([]);
  const [mail, setMail] = useState(Boolean(k.email) && mailBereit);
  const { laedt, meldung, senden } = useAktion();
  const text = textAllgemein(k.name, nachrichtSprache(k.sprache));
  const darf = (ok: boolean) => ok && !k.abgemeldet && Boolean(k.telefon);

  const loggen = (kanal: 'anruf' | 'mail' | 'whatsapp' | 'sms') => {
    const titel = { anruf: 'Angerufen', mail: 'E-Mail geöffnet', whatsapp: 'WhatsApp geöffnet', sms: 'SMS geöffnet' }[kanal];
    fetch('/api/admin/aktivitaet/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kontaktId: k.id, kanal, richtung: 'aus', titel: `${titel} · Kundenakte`, text: kanal === 'anruf' ? null : text }), keepalive: true })
      .then(() => router.refresh())
      .catch(() => {});
  };

  return (
    <div className="a-schnell-wrap">
      <div className="a-schnell" role="toolbar" aria-label="Schnellaktionen">
        {k.telefon ? (
          <a href={telLink(k.telefon)} onClick={() => loggen('anruf')} className="a-schnell-k">
            <Icon name="telefon" /> Anrufen
          </a>
        ) : (
          <span className="a-schnell-k" aria-disabled="true">
            <Icon name="telefon" /> Kein Telefon
          </span>
        )}
        {darf(k.whatsappOk) ? (
          <a href={waLink(k.telefon!, text)} target="_blank" rel="noopener" onClick={() => loggen('whatsapp')} className="a-schnell-k whatsapp">
            <Icon name="whatsapp" /> WhatsApp
          </a>
        ) : (
          <span className="a-schnell-k" aria-disabled="true" title="Nur mit Einwilligung">
            <Icon name="whatsapp" /> WhatsApp
          </span>
        )}
        {darf(k.smsOk) ? (
          <a href={smsLink(k.telefon!, text)} onClick={() => loggen('sms')} className="a-schnell-k">
            <Icon name="sms" /> SMS
          </a>
        ) : (
          <span className="a-schnell-k" aria-disabled="true" title="Nur mit Einwilligung">
            <Icon name="sms" /> SMS
          </span>
        )}
        {k.email ? (
          <a href={`mailto:${k.email}?subject=${encodeURIComponent('The Sartorialist Zürich')}&body=${encodeURIComponent(text)}`} onClick={() => loggen('mail')} className="a-schnell-k">
            <Icon name="mail" /> E-Mail
          </a>
        ) : (
          <span className="a-schnell-k" aria-disabled="true">
            <Icon name="mail" /> Keine E-Mail
          </span>
        )}
        <span className="a-schnell-trenner" aria-hidden="true" />
        <AngebotNeuKnopf kontaktId={k.id} klasse="a-schnell-k gold" text="Angebot" />
        <a href={`/admin/massblaetter/neu/?kontakt=${k.id}`} className="a-schnell-k">
          <Icon name="mass" /> Massblatt
        </a>
        <button type="button" className="a-schnell-k" aria-expanded={termin} onClick={() => setTermin(!termin)}>
          <Icon name="kalender" /> Termin
        </button>
      </div>

      {termin && (
        <div className="a-karte a-schnell-panel">
          <div className="a-karte-kopf">
            <h2>Termin eintragen</h2>
            <button type="button" className="a-x" aria-label="Schliessen" onClick={() => setTermin(false)}>
              <Icon name="x" />
            </button>
          </div>
          <div className="a-karte-inhalt a-aktionen">
            <div className="a-segment" role="group" aria-label="Zweck">
              {ZWECKE.map(([z, l]) => (
                <button key={z} type="button" aria-pressed={zweck === z} onClick={() => setZweck(z)}>
                  {l}
                </button>
              ))}
            </div>
            <SlotPicker wert={start} onChange={setStart} belegt={belegt} />
            {start[0] && <div className="a-hinweis gruen">{terminLang(new Date(start[0]))}</div>}
            {k.email && (
              <button type="button" className="a-toggle" aria-pressed={mail} disabled={!mailBereit} onClick={() => setMail(!mail)}>
                <i /> {mailBereit ? 'Bestätigung per E-Mail (mit Kalender)' : 'E-Mail-Versand nicht konfiguriert'}
              </button>
            )}
            <p className="a-sub" style={{ fontSize: 12.5, margin: 0 }}>
              Der Kunde erhält 2 Stunden vorher automatisch eine Erinnerung per E-Mail.
            </p>
            <MeldungZeile m={meldung} />
            <button
              type="button"
              className="a-knopf voll"
              disabled={laedt || !start[0]}
              onClick={async () => {
                if (await senden('/api/admin/termine/', { kontaktId: k.id, zweck, start: start[0], mail })) {
                  setStart([]);
                  setTermin(false);
                }
              }}
            >
              {laedt ? 'Moment …' : 'Termin eintragen'}
            </button>
          </div>
        </div>
      )}
      {!termin && <MeldungZeile m={meldung} />}
    </div>
  );
}
