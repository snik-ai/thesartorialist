'use client';
// 1:1-Kontakt: Anrufen, E-Mail, WhatsApp, SMS. Ein Klick öffnet die App mit vorbereitetem Text —
// nichts wird automatisch versendet. WhatsApp/SMS nur mit Einwilligung. Jeder Klick landet im Verlauf.
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { smsLink, telAnzeige, telLink, waLink } from '@/lib/crm/telefon';

export type KanalKontakt = {
  id: string;
  name: string;
  telefon: string | null;
  email: string | null;
  whatsappOk: boolean;
  smsOk: boolean;
  abgemeldet: boolean;
  /** Hauptsprache des Kunden (de/en …) — bestimmt Sprache der Nachrichten und Kundenmails */
  sprache?: string;
};

/** Je Kanal eigener Text (z. B. WhatsApp mit Emojis, E-Mail ohne); fehlt einer, gilt `text`. */
export type KanalTexte = Partial<Record<'mail' | 'whatsapp' | 'sms', string>>;

export default function KontaktKanaele({ k, terminId, text, texte, betreff, anlass }: { k: KanalKontakt; terminId?: string; text: string; texte?: KanalTexte; betreff: string; anlass: string }) {
  const t = (kanal: 'mail' | 'whatsapp' | 'sms') => texte?.[kanal] ?? text;
  const router = useRouter();

  function loggen(kanal: 'anruf' | 'mail' | 'whatsapp' | 'sms') {
    const titel = { anruf: 'Angerufen', mail: 'E-Mail geöffnet', whatsapp: 'WhatsApp geöffnet', sms: 'SMS geöffnet' }[kanal];
    const body = JSON.stringify({ kontaktId: k.id, terminId, kanal, richtung: 'aus', titel: `${titel} · ${anlass}`, text: kanal === 'anruf' ? null : t(kanal) });
    // keepalive: der Eintrag kommt an, auch wenn der Browser in die App wechselt
    fetch('/api/admin/aktivitaet/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
      .then(() => router.refresh())
      .catch(() => {});
  }

  const mailHref = k.email ? `mailto:${k.email}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(t('mail'))}` : undefined;
  const sperrGrund = (ok: boolean) => (!k.telefon ? 'Keine Telefonnummer' : k.abgemeldet ? 'Abgemeldet' : !ok ? 'Keine Einwilligung' : '');

  const Knopf = ({ kanal, href, label, sub, grund }: { kanal: 'anruf' | 'mail' | 'whatsapp' | 'sms'; href?: string; label: string; sub: string; grund?: string }) =>
    href && !grund ? (
      <a className={`a-kanal ${kanal}`} href={href} target={kanal === 'whatsapp' ? '_blank' : undefined} rel="noopener" onClick={() => loggen(kanal)}>
        <Icon name={kanal === 'anruf' ? 'telefon' : kanal} />
        <span>
          <b>{label}</b>
          <small>{sub}</small>
        </span>
      </a>
    ) : (
      <span className={`a-kanal ${kanal}`} aria-disabled="true" title={grund || 'Nicht verfügbar'}>
        <Icon name={kanal === 'anruf' ? 'telefon' : kanal} />
        <span>
          <b>{label}</b>
          <small>{grund || 'Nicht verfügbar'}</small>
        </span>
      </span>
    );

  return (
    <div>
      <div className="a-kanaele">
        <Knopf kanal="anruf" href={k.telefon ? telLink(k.telefon) : undefined} label="Anrufen" sub={k.telefon ? telAnzeige(k.telefon) : ''} grund={k.telefon ? '' : 'Keine Telefonnummer'} />
        <Knopf kanal="mail" href={mailHref} label="E-Mail" sub={k.email ?? ''} grund={k.email ? '' : 'Keine E-Mail'} />
        <Knopf kanal="whatsapp" href={k.telefon ? waLink(k.telefon, t('whatsapp')) : undefined} label="WhatsApp" sub="Text vorbereitet" grund={sperrGrund(k.whatsappOk)} />
        <Knopf kanal="sms" href={k.telefon ? smsLink(k.telefon, t('sms')) : undefined} label="SMS" sub="Text vorbereitet" grund={sperrGrund(k.smsOk)} />
      </div>
      {k.telefon && (!k.whatsappOk || !k.smsOk) && !k.abgemeldet && (
        <p className="a-sub" style={{ fontSize: 12.5, marginTop: 10 }}>
          WhatsApp/SMS nur mit Einwilligung der Person. Ohne Einwilligung bitte per E-Mail oder Anruf — die Einwilligung lässt sich im Kontakt erfassen, sobald sie vorliegt.
        </p>
      )}
    </div>
  );
}
