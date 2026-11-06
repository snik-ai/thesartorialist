import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { dbBereit } from '@/lib/db';
import { angebotGedrosselt, angebotPerToken } from '@/lib/crm/angebot-oeffentlich';
import { angebotAnzeigeStatus } from '@/lib/crm/belege';
import { chf } from '@/lib/crm/geld';
import { firma } from '@/lib/crm/firma';
import { angebotDokument } from '@/lib/beleg/dokument';
import { logoFuer } from '@/lib/beleg/laden';
import { blattHtml } from '@/lib/beleg/vorlage';
import { PAPIER_CSS, SCHRIFTEN_WEB } from '@/lib/beleg/stil';
import { DOK, datumText, fuell } from '@/lib/beleg/texte';
import { SITE } from '@/lib/site';
import AngebotAnnahme from './AngebotAnnahme';
import { KT } from './texte';

// Kundenansicht des Angebots (nach VoxCRM KundenAnsicht.tsx): dasselbe A4-Blatt wie im Editor und im PDF,
// daneben bzw. darunter die Annahme. Sprache = Dokumentsprache des Angebots.
export const metadata: Metadata = { title: 'Ihr Angebot', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

function Ungueltig({ titel, text }: { titel: string; text: string }) {
  return (
    <main className="k-seite">
      <div className="k-wrap">
        <div className="k-card k-fehlerseite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="k-logo" src="/images/marke/wortmarke-schwarz.png" alt="The Sartorialist Zürich" />
          <h1 className="k-h1">{titel}</h1>
          <p className="k-sub">{text}</p>
          <div className="k-knoepfe">
            <a className="k-btn" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
              {SITE.phone}
            </a>
            <a className="k-btn line" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function AngebotOeffentlich({ params }: { params: Promise<{ token: string }> }) {
  if (!dbBereit()) return <Ungueltig titel="Gerade nicht verfügbar" text="Bitte versuchen Sie es später noch einmal oder melden Sie sich direkt bei uns." />;
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unbekannt';
  if (angebotGedrosselt(ip)) return <Ungueltig titel="Einen Moment bitte" text="Zu viele Aufrufe in kurzer Zeit. Bitte versuchen Sie es in einigen Minuten erneut." />;
  const { token } = await params;
  const t = await angebotPerToken(token, { ansehen: true });
  if (!t) return <Ungueltig titel="Link nicht mehr gültig" text="Dieser Angebotslink ist ungültig oder wurde durch einen neueren ersetzt. Gerne senden wir Ihnen das aktuelle Angebot." />;
  const { a, k } = t;
  const [f, logo] = await Promise.all([firma(), logoFuer('web')]);
  const st = angebotAnzeigeStatus(a);
  const dok = angebotDokument(a, k, f, logo);
  const s = a.sprache;
  const T = KT[s];
  const D = DOK[s];
  const gruss = fuell(T.hallo, { name: [k.anrede, k.name].filter(Boolean).join(' ') || k.name });

  return (
    <main className="k-seite" lang={s}>
      <style dangerouslySetInnerHTML={{ __html: SCHRIFTEN_WEB + PAPIER_CSS }} />
      <div className="k-breit">
        <header className="k-kopf">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="k-logo" src="/images/marke/wortmarke-schwarz.png" alt={f.name} />
          <span className="k-mut">
            {D.angebot} {a.nummer}
          </span>
        </header>
        <div className="k-raster">
          <section className="k-dokument" aria-label={`${D.angebot} ${a.nummer}`}>
            <div className="k-blatt bl" dangerouslySetInnerHTML={{ __html: blattHtml(dok, { fussFest: true }) }} />
          </section>
          <aside className="k-seitenkarte">
            <div className="k-card">
              <p className="k-sub" style={{ margin: '0 0 6px' }}>
                {gruss}
              </p>
              <h1 className="k-h1">{a.titel || D.angebot}</h1>
              <div className="k-tot">
                <span>{D.totalChf}</span>
                <span>{chf(dok.summen.totalRp, false)}</span>
              </div>
              <p className="k-mut k-klein">
                {[a.mwstSatz > 0 ? D.inklMwst : null, a.gueltigBis ? `${D.gueltigBis} ${datumText(a.gueltigBis, s)}` : null].filter(Boolean).join(' · ')}
              </p>
              <AngebotAnnahme token={token} status={st} name={k.name} sprache={s} angenommen={a.angenommenAm ? { name: a.angenommenName ?? k.name, am: datumText(a.angenommenAm, s) } : null} />
              <a className="k-btn line" href={`/api/angebot/${token}/pdf/`} target="_blank" rel="noopener">
                {T.pdf}
              </a>
              <div className="k-note">
                <a href={`tel:${f.telefon.replace(/\s/g, '')}`}>{f.telefon}</a>
                <span>·</span>
                <a href={`mailto:${f.email}`}>{f.email}</a>
              </div>
            </div>
          </aside>
        </div>
        <p className="k-powered">
          {f.name} · {f.strasse}, {f.plz} {f.ort}
        </p>
      </div>
    </main>
  );
}
