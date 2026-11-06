import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, desc, eq, gte, isNotNull, ne } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import TerminAktionen from '@/components/admin/TerminAktionen';
import { Avatar, StilAuswahl, Verlauf } from '@/components/admin/Bausteine';
import { STATUS_LABEL } from '@/lib/crm/status';
import { telAnzeige } from '@/lib/crm/telefon';
import { mailBereit } from '@/lib/mail';
import { relativ, terminLang, TZ } from '@/lib/zeit';
import { UUID } from '@/lib/admin/zugang';

export const metadata: Metadata = { title: 'Anfrage' };
export const dynamic = 'force-dynamic';

export default async function TerminDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [t] = await db().select().from(schema.termin).where(eq(schema.termin.id, id)).limit(1);
  if (!t) notFound();
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, t.kontaktId)).limit(1);
  if (!t.gelesenAm) await db().update(schema.termin).set({ gelesenAm: new Date() }).where(eq(schema.termin.id, id));

  const [verlauf, belegt, andere] = await Promise.all([
    db()
      .select()
      .from(schema.aktivitaet)
      .where(eq(schema.aktivitaet.kontaktId, k.id))
      .orderBy(desc(schema.aktivitaet.erstelltAm))
      .limit(60),
    db()
      .select({ start: schema.termin.bestaetigtStart })
      .from(schema.termin)
      .where(and(eq(schema.termin.status, 'bestaetigt'), isNotNull(schema.termin.bestaetigtStart), ne(schema.termin.id, id), gte(schema.termin.bestaetigtStart, new Date(Date.now() - 86400_000)))),
    db()
      .select({ id: schema.termin.id, status: schema.termin.status, art: schema.termin.art, erstelltAm: schema.termin.erstelltAm })
      .from(schema.termin)
      .where(and(eq(schema.termin.kontaktId, k.id), ne(schema.termin.id, id)))
      .orderBy(desc(schema.termin.erstelltAm))
      .limit(5),
  ]);

  const wunsch = t.wunschStart ? terminLang(t.wunschStart) : t.wunschText || 'nach Absprache';

  return (
    <>
      <Link href="/admin/termine/" className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> Alle Anfragen
      </Link>
      <div className="a-kopf">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
          <Avatar name={k.name || '?'} brandDomain={k.brandDomain} gross />
          <div style={{ minWidth: 0 }}>
            <span className="a-kicker">{t.art === 'rueckruf' ? 'Rückrufbitte' : 'Terminanfrage'}</span>
            <h1>{k.name || (k.telefon ? telAnzeige(k.telefon) : 'Ohne Namen')}</h1>
            <p className="a-sub">
              <span className={`a-pill ${t.status}`}>{STATUS_LABEL[t.status]}</span> &nbsp;Eingang {Date.now() - t.erstelltAm.getTime() < 7 * 86400_000 ? `${relativ(t.erstelltAm)} · ` : ''}
              {t.erstelltAm.toLocaleString('de-CH', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <Link href={`/admin/kontakte/${k.id}/`} className="a-knopf linie">
          <Icon name="kontakte" /> Kontakt
        </Link>
      </div>

      <div className="a-detail">
        <div className="w">
          <div className="a-wunsch">
            <span className="a-kicker">{t.status === 'bestaetigt' && t.bestaetigtStart ? 'Bestätigter Termin' : t.art === 'rueckruf' ? 'Wunschzeit Rückruf' : 'Wunschtermin'}</span>
            <strong>{t.status === 'bestaetigt' && t.bestaetigtStart ? terminLang(t.bestaetigtStart) : wunsch}</strong>
            <small>
              {t.status === 'bestaetigt' && t.bestaetigtStart ? `Ursprünglicher Wunsch: ${wunsch}` : t.art === 'termin' ? 'Persönliche Beratung · 60–90 Minuten' : 'Bitte zurückrufen'}
              {t.status === 'vorgeschlagen' && t.vorschlaege.length > 0 && ` · Vorgeschlagen: ${t.vorschlaege.map((v) => terminLang(new Date(v))).join(' / ')}`}
            </small>
          </div>
        </div>

        <div className="a">
          <TerminAktionen
            terminId={t.id}
            art={t.art}
            status={t.status}
            wunschStart={t.wunschStart?.toISOString() ?? null}
            bestaetigtStart={t.bestaetigtStart?.toISOString() ?? null}
            vorschlaege={t.vorschlaege}
            belegt={belegt.map((b) => b.start!.toISOString())}
            eingangOffen={!t.eingangMailAm}
            mailBereit={mailBereit()}
            k={{
              id: k.id,
              name: k.name,
              telefon: k.telefon,
              email: k.email,
              whatsappOk: Boolean(k.einwilligungWhatsapp),
              smsOk: Boolean(k.einwilligungSms),
              abgemeldet: Boolean(k.abgemeldet),
            }}
          />
        </div>

        <div className="k a-karte">
          <div className="a-karte-kopf">
            <h2>Kunde</h2>
          </div>
          <div className="a-karte-inhalt">
            <dl className="a-daten">
              <dt>Name</dt>
              <dd>{k.name || '–'}</dd>
              <dt>Telefon</dt>
              <dd>{k.telefon ? <a href={`tel:${k.telefon}`}>{telAnzeige(k.telefon)}</a> : '–'}</dd>
              <dt>E-Mail</dt>
              <dd>{k.email ? <a href={`mailto:${k.email}`}>{k.email}</a> : '–'}</dd>
              {k.firma && (
                <>
                  <dt>Firma</dt>
                  <dd>{k.firma}</dd>
                </>
              )}
              <dt>WhatsApp/SMS</dt>
              <dd>{k.einwilligungWhatsapp ? `Einwilligung seit ${k.einwilligungWhatsapp.toLocaleDateString('de-CH', { timeZone: TZ })}` : 'Keine Einwilligung'}</dd>
              <dt>Quelle</dt>
              <dd>
                {t.quelle || '–'}
                {t.eingangMailAm ? ' · Eingangsbestätigung verschickt' : k.email ? ' · Eingangsbestätigung noch offen' : ''}
              </dd>
              {andere.length > 0 && (
                <>
                  <dt>Frühere</dt>
                  <dd>
                    {andere.map((x, i) => (
                      <span key={x.id}>
                        {i > 0 && ' · '}
                        <Link href={`/admin/termine/${x.id}/`}>
                          {x.art === 'rueckruf' ? 'Rückruf' : 'Termin'} {x.erstelltAm.toLocaleDateString('de-CH', { timeZone: TZ })} ({STATUS_LABEL[x.status]})
                        </Link>
                      </span>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>

        <div className="s">
          <StilAuswahl stil={t.stil} stoffe={t.stoffe} />
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
