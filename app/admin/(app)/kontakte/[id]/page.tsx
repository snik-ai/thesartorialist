import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import KontaktPanel from '@/components/admin/KontaktPanel';
import { Avatar, Verlauf } from '@/components/admin/Bausteine';
import { STATUS_LABEL } from '@/lib/crm/status';
import { telAnzeige } from '@/lib/crm/telefon';
import { terminKurz, TZ } from '@/lib/zeit';
import { UUID } from '@/lib/admin/zugang';

export const metadata: Metadata = { title: 'Kontakt' };
export const dynamic = 'force-dynamic';

const datum = (d: Date | null) => (d ? d.toLocaleDateString('de-CH', { timeZone: TZ }) : '');

export default async function KontaktDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, id)).limit(1);
  if (!k) notFound();
  if (k.zusammengefuehrtIn) redirect(`/admin/kontakte/${k.zusammengefuehrtIn}/`);

  const [termine, verlauf] = await Promise.all([
    db().select().from(schema.termin).where(eq(schema.termin.kontaktId, id)).orderBy(desc(schema.termin.erstelltAm)),
    db().select().from(schema.aktivitaet).where(eq(schema.aktivitaet.kontaktId, id)).orderBy(desc(schema.aktivitaet.erstelltAm)).limit(200),
  ]);

  return (
    <>
      <Link href="/admin/kontakte/" className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> Alle Kontakte
      </Link>
      <div className="a-kopf">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
          <Avatar name={k.name || k.email || '?'} brandDomain={k.brandDomain} gross />
          <div style={{ minWidth: 0 }}>
            <span className="a-kicker">{k.firma ? k.firma : 'Kontakt'}</span>
            <h1>{k.name || k.email || (k.telefon ? telAnzeige(k.telefon) : 'Ohne Namen')}</h1>
            <p className="a-sub">
              Seit {datum(k.erstelltAm)} · Quelle {k.quelle || '–'}
              {k.abgemeldet ? ' · abgemeldet' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="a-detail">
        <div className="w a-karte">
          <div className="a-karte-inhalt">
            <dl className="a-daten">
              <dt>Telefon</dt>
              <dd>{k.telefon ? <a href={`tel:${k.telefon}`}>{telAnzeige(k.telefon)}</a> : '–'}</dd>
              <dt>E-Mail</dt>
              <dd>{k.email ? <a href={`mailto:${k.email}`}>{k.email}</a> : '–'}</dd>
              <dt>Firma</dt>
              <dd>
                {k.firma || '–'}
                {k.brandDomain ? ` · ${k.brandDomain}` : ''}
              </dd>
              <dt>WhatsApp</dt>
              <dd>{k.einwilligungWhatsapp ? `Erlaubt seit ${datum(k.einwilligungWhatsapp)} — ${k.einwilligungWhatsappQuelle ?? ''}` : 'Keine Einwilligung'}</dd>
              <dt>SMS</dt>
              <dd>{k.einwilligungSms ? `Erlaubt seit ${datum(k.einwilligungSms)} — ${k.einwilligungSmsQuelle ?? ''}` : 'Keine Einwilligung'}</dd>
              {k.notiz && (
                <>
                  <dt>Notiz</dt>
                  <dd style={{ whiteSpace: 'pre-line', fontWeight: 400 }}>{k.notiz}</dd>
                </>
              )}
            </dl>
          </div>
        </div>

        <div className="a">
          <KontaktPanel
            k={{ id: k.id, name: k.name, telefon: k.telefon, email: k.email, whatsappOk: Boolean(k.einwilligungWhatsapp), smsOk: Boolean(k.einwilligungSms), abgemeldet: Boolean(k.abgemeldet) }}
            daten={{ name: k.name, email: k.email ?? '', telefon: k.telefon ?? '', firma: k.firma ?? '', brandDomain: k.brandDomain ?? '', notiz: k.notiz ?? '' }}
            whatsapp={Boolean(k.einwilligungWhatsapp)}
            sms={Boolean(k.einwilligungSms)}
            abgemeldet={Boolean(k.abgemeldet)}
          />
        </div>

        <div className="k a-karte">
          <div className="a-karte-kopf">
            <h2>Termine &amp; Rückrufe</h2>
            <span className="a-sub zahl" style={{ margin: 0 }}>
              {termine.length}
            </span>
          </div>
          {termine.length === 0 ? (
            <div className="a-karte-inhalt a-sub">Keine Anfragen.</div>
          ) : (
            <div className="a-liste">
              {termine.map((t) => {
                const start = t.bestaetigtStart ?? t.wunschStart;
                return (
                  <Link key={t.id} href={`/admin/termine/${t.id}/`} className="a-zeile" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                    <span style={{ minWidth: 0 }}>
                      <span className="a-zeile-titel" style={{ display: 'block' }}>
                        {t.art === 'rueckruf' ? 'Rückruf' : 'Termin'} · {start ? terminKurz(start) : t.wunschText || 'nach Absprache'}
                      </span>
                      <span className="a-zeile-sub" style={{ display: 'block' }}>
                        Eingang {datum(t.erstelltAm)}
                        {t.stil.length ? ` · Stil ${t.stil.length}` : ''}
                        {t.stoffe.length ? ` · Stoff ${t.stoffe.join(', ')}` : ''}
                      </span>
                    </span>
                    <span className={`a-pill ${t.status}`}>{STATUS_LABEL[t.status]}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="v a-karte">
          <div className="a-karte-kopf">
            <h2>Verlauf</h2>
          </div>
          <div className="a-karte-inhalt">
            <Verlauf eintraege={verlauf} />
          </div>
        </div>
      </div>
    </>
  );
}
