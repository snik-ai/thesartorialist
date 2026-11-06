// Darstellungs-Bausteine (Server-tauglich): Verlauf, Stil-Auswahl, Kontakt-Avatar mit Firmenlogo.
import Icon from './Icon';
import { stilGruppen } from '@/lib/crm/status';
import { relativ, TZ } from '@/lib/zeit';

export type VerlaufEintrag = { id: string; kanal: string; richtung: string; titel: string; text: string | null; erstelltAm: Date };

const KANAL_ICON: Record<string, string> = { mail: 'mail', whatsapp: 'whatsapp', sms: 'sms', anruf: 'telefon', notiz: 'notiz', formular: 'formular', system: 'system' };

export function Verlauf({ eintraege }: { eintraege: VerlaufEintrag[] }) {
  if (!eintraege.length) return <p className="a-sub">Noch keine Einträge.</p>;
  return (
    <ol className="a-verlauf">
      {eintraege.map((e) => (
        <li key={e.id}>
          <span className={`punkt ${e.kanal}`}>
            <Icon name={KANAL_ICON[e.kanal] ?? 'system'} />
          </span>
          <div>
            <b>{e.titel}</b>
            {e.text && <p>{e.text.length > 600 ? `${e.text.slice(0, 600)} …` : e.text}</p>}
            <time dateTime={e.erstelltAm.toISOString()} title={e.erstelltAm.toLocaleString('de-CH', { timeZone: TZ })}>
              {relativ(e.erstelltAm)} · {e.erstelltAm.toLocaleString('de-CH', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function StilAuswahl({ stil, stoffe }: { stil: { kategorie: string; untergruppe: string; option: string }[]; stoffe: string[] }) {
  if (!stil.length && !stoffe.length) return null;
  return (
    <div className="a-karte">
      <div className="a-karte-kopf">
        <h2>Stil-Auswahl</h2>
        <span className="a-sub zahl" style={{ margin: 0 }}>
          {stil.length} Details
        </span>
      </div>
      <div className="a-karte-inhalt">
        {stoffe.length > 0 && (
          <div style={{ marginBottom: stil.length ? 18 : 0 }}>
            <span className="a-kicker">Stoff · Holland &amp; Sherry</span>
            <div className="a-stoffe">
              {stoffe.map((s) => (
                <a key={s} className="a-stoff" href={`https://apparel.hollandandsherry.com/en/search?q=${encodeURIComponent(s)}`} target="_blank" rel="noopener">
                  <i />
                  {s}
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="a-stil">
          {stilGruppen(stil).map((g) => (
            <section key={g.kategorie} className="a-stil-gruppe">
              <h3>
                {g.kategorie}
                <span className="zahl">{g.zeilen.length}</span>
              </h3>
              <ul>
                {g.zeilen.map((z, i) => (
                  <li key={i}>
                    <span>{z.untergruppe}</span>
                    <b>{z.option}</b>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function initialen(name: string, fallback = '?') {
  const t = name.trim().split(/\s+/).filter(Boolean);
  if (!t.length) return fallback;
  return ((t[0][0] ?? '') + (t.length > 1 ? t[t.length - 1][0] : '')).toUpperCase();
}

/** Monogramm oder Firmenlogo (serverseitig geladen über /api/admin/logo, nie direkt vom Browser zu Dritten). */
export function Avatar({ name, brandDomain, gross }: { name: string; brandDomain?: string | null; gross?: boolean }) {
  return (
    <span className={`a-avatar${gross ? ' gross' : ''}`} aria-hidden="true">
      {brandDomain ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/admin/logo/?domain=${encodeURIComponent(brandDomain)}`} alt="" loading="lazy" />
      ) : (
        initialen(name)
      )}
    </span>
  );
}
