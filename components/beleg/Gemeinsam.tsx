'use client';
// Gemeinsame Teile von Angebot und Rechnung: «Wie weiter?»-Leiste (VoxCRM WieWeiter.tsx), Verlauf, Sprache, Versionen,
// Senden-Panel, PDF-Download.
import { useEffect, useState, type ReactNode } from 'react';
import type { BelegSprache } from '@/lib/db/schema';
import { BELEG_SPRACHEN } from '@/lib/beleg/texte';
import { Icon, Knopf, Panel, Fehlermeldung, Textfeld, geld } from '@/components/vx/ui';
import type { Aktion } from './Rahmen';

export type WieWeiterTon = 'info' | 'ok' | 'warn' | 'bad' | 'neutral';

export function WieWeiter({ ton, icon, titel, text, haupt, optionen = [] }: { ton: WieWeiterTon; icon: string; titel: ReactNode; text?: ReactNode; haupt?: Aktion | null; optionen?: (Aktion | null | false | undefined)[] }) {
  const liste = optionen.filter(Boolean) as Aktion[];
  return (
    <section className={`ww ww-${ton}`}>
      <span className="ww-ic" aria-hidden="true">
        <Icon name={icon} size={17} />
      </span>
      <div className="ww-text">
        <b>{titel}</b>
        {text && <p>{text}</p>}
      </div>
      {(haupt || liste.length > 0) && (
        <div className="ww-akt">
          {haupt && (
            <button type="button" className="knopf knopf-dunkel ww-haupt" onClick={haupt.onClick} disabled={haupt.disabled || haupt.laedt} title={haupt.text}>
              {haupt.laedt ? <span className="spinner" aria-hidden="true" /> : <Icon name={haupt.icon} size={16} />}
              <span>{haupt.label}</span>
            </button>
          )}
          {liste.map((a) => (
            <button key={a.label} type="button" className={`ww-opt ${a.gefahr ? 'gefahr' : ''}`} onClick={a.onClick} disabled={a.disabled || a.laedt} title={a.text}>
              <Icon name={a.icon} size={15} />
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export type VerlaufZeile = { id: string; kanal: string; titel: string; text: string | null; erstelltAm: string };
const KANAL_ICON: Record<string, string> = { mail: 'Mail', whatsapp: 'MessageCircle', sms: 'MessageSquare', anruf: 'Phone', notiz: 'StickyNote', formular: 'MousePointerClick', system: 'Dot' };
const zeit = (s: string) => new Date(s).toLocaleString('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function Zeitleiste({ eintraege }: { eintraege: VerlaufZeile[] }) {
  if (!eintraege.length) return <p className="vk-hinweis">Noch keine Einträge.</p>;
  return (
    <ol className="vk-tl" style={{ padding: '2px 0 0' }}>
      {eintraege.map((e) => (
        <li key={e.id} className={`vk-tl-i ${/angenommen|bezahlt/i.test(e.titel) ? 'ok' : /abgelehnt|storniert|mahnung|erinnerung/i.test(e.titel) ? 'bad' : /angesehen/i.test(e.titel) ? 'acc' : ''}`}>
          <span className="d">
            <Icon name={KANAL_ICON[e.kanal] ?? 'Dot'} size={12} />
          </span>
          <div>
            <b>{e.titel}</b>
            <span>
              {zeit(e.erstelltAm)}
              {e.text && e.kanal !== 'mail' ? ` · ${e.text.slice(0, 120)}` : ''}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SprachWahl({ wert, onWahl, gesperrt }: { wert: BelegSprache; onWahl: (s: BelegSprache) => void; gesperrt?: boolean }) {
  return (
    <div className="dk-sprachen" role="radiogroup" aria-label="Dokumentsprache">
      {BELEG_SPRACHEN.map((s) => (
        <button key={s.code} type="button" role="radio" aria-checked={wert === s.code} className={`chip-w ${wert === s.code ? 'an' : ''}`} disabled={gesperrt} onClick={() => onWahl(s.code)} title={s.name}>
          {s.kurz}
          <em>{s.name}</em>
        </button>
      ))}
    </div>
  );
}

export type VersionZeile = { id: string; version: number; grund: string; totalRp: number; erstelltAm: string };
export function Versionen({ liste, aktuell, onWiederherstellen, onSichern, gesperrt }: { liste: VersionZeile[]; aktuell: number; onWiederherstellen: (id: string) => void; onSichern: () => void; gesperrt: boolean }) {
  return (
    <>
      {liste.length === 0 && <p className="dk-klein" style={{ marginTop: 0 }}>Noch keine gesicherte Fassung. Beim Senden wird automatisch eine Version gesichert.</p>}
      {liste.map((v) => (
        <div key={v.id} className="dk-version">
          <Icon name="History" size={15} />
          <span>
            Version {v.version} · <span className="num">{geld(v.totalRp, true)}</span>
            <small>
              {v.grund === 'gesendet' ? 'beim Senden' : v.grund === 'vor-wiederherstellen' ? 'vor dem Wiederherstellen' : 'gesichert'} · {zeit(v.erstelltAm)}
            </small>
          </span>
          {!gesperrt && (
            <button type="button" onClick={() => onWiederherstellen(v.id)}>
              Laden
            </button>
          )}
        </div>
      ))}
      {!gesperrt && (
        <div className="dk-zeile-k">
          <Knopf klein icon="Save" onClick={onSichern}>
            Version {aktuell} sichern
          </Knopf>
        </div>
      )}
    </>
  );
}

/** Senden per E-Mail (mit PDF und – beim Angebot – Annahme-Link) */
export function SendenPanel({ offen, onZu, an, art, onSenden, mailBereit }: { offen: boolean; onZu: () => void; an: string | null; art: string; onSenden: (nachricht: string) => Promise<void>; mailBereit: boolean }) {
  const [nachricht, setNachricht] = useState('');
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  useEffect(() => {
    if (offen) setFehler(null);
  }, [offen]);
  return (
    <Panel
      offen={offen}
      onZu={onZu}
      titel={`${art} senden`}
      fuss={
        <>
          <Knopf art="geist" onClick={onZu}>
            Abbrechen
          </Knopf>
          <Knopf
            art="dunkel"
            icon="Send"
            laedt={laedt}
            disabled={!an || !mailBereit}
            onClick={async () => {
              setLaedt(true);
              setFehler(null);
              try {
                await onSenden(nachricht.trim());
              } catch (e) {
                setFehler((e as Error).message);
              } finally {
                setLaedt(false);
              }
            }}
          >
            Jetzt senden
          </Knopf>
        </>
      }
    >
      <div className="formular">
        <div className="vk-von">
          <Icon name="Mail" size={16} />
          <span>
            <b>{an ?? 'Keine E-Mail-Adresse beim Kunden'}</b>
            <small>{mailBereit ? 'Das PDF liegt bei, in der Sprache des Dokuments.' : 'E-Mail-Versand ist nicht eingerichtet – Link kopieren oder PDF herunterladen.'}</small>
          </span>
        </div>
        <Textfeld label="Persönliche Nachricht (optional)" value={nachricht} onChange={(e) => setNachricht(e.target.value)} placeholder="Erscheint oben in der E-Mail" rows={4} />
        {fehler && <Fehlermeldung text={fehler} />}
      </div>
    </Panel>
  );
}

/** PDF als Datei herunterladen (ohne neuen Tab), vorher speichern */
export async function pdfHerunterladen(pfad: string, vorher?: () => Promise<unknown>) {
  await vorher?.();
  const r = await fetch(`${pfad}?download=1`);
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.fehler ?? 'PDF nicht verfügbar');
  const blob = await r.blob();
  const name = /filename="([^"]+)"/i.exec(r.headers.get('content-disposition') ?? '')?.[1] ?? 'Beleg.pdf';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export type Schritt = 'angebot' | 'auftrag' | 'rechnung' | 'bezahlt';
/** Ablauf Angebot → Auftrag → Rechnung → Bezahlt (VoxCRM Bausteine.tsx Ablauf) */
export function Ablauf({ erledigt, aktuell, links }: { erledigt: Schritt[]; aktuell: Schritt | null; links?: Partial<Record<Schritt, string | null>> }) {
  const schritte: [Schritt, string][] = [
    ['angebot', 'Angebot'],
    ['auftrag', 'Auftrag'],
    ['rechnung', 'Rechnung'],
    ['bezahlt', 'Bezahlt'],
  ];
  return (
    <div className="flow" role="list" aria-label="Ablauf">
      {schritte.map(([s, l]) => {
        const k = erledigt.includes(s) ? 'd' : aktuell === s ? 'c' : '';
        const href = links?.[s];
        const inhalt = (
          <>
            <i />
            {l}
          </>
        );
        return (
          <div key={s} className={k} role="listitem" aria-current={aktuell === s ? 'step' : undefined}>
            {href ? <a href={href}>{inhalt}</a> : inhalt}
          </div>
        );
      })}
    </div>
  );
}
