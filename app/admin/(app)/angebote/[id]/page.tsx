import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import AngebotEditor from '@/components/admin/AngebotEditor';
import { Avatar } from '@/components/admin/Bausteine';
import { ANGEBOT_STATUS, angebotAnzeigeStatus } from '@/lib/crm/belege';
import { katalog } from '@/lib/crm/firma';
import { mailBereit } from '@/lib/mail';
import { isoVon, tagDatum, terminKurz } from '@/lib/zeit';
import { UUID } from '@/lib/admin/zugang';

export const metadata: Metadata = { title: 'Angebot' };
export const dynamic = 'force-dynamic';

export default async function AngebotSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [a] = await db().select().from(schema.angebot).where(eq(schema.angebot.id, id)).limit(1);
  if (!a || !a.kontaktId) notFound();
  const [[k], quellen, [au], kat] = await Promise.all([
    db().select().from(schema.kontakt).where(eq(schema.kontakt.id, a.kontaktId)).limit(1),
    db()
      .select()
      .from(schema.termin)
      .where(and(eq(schema.termin.kontaktId, a.kontaktId), sql`jsonb_array_length(${schema.termin.stil}) > 0`))
      .orderBy(desc(schema.termin.erstelltAm))
      .limit(5),
    db().select({ id: schema.auftrag.id }).from(schema.auftrag).where(eq(schema.auftrag.angebotId, a.id)).limit(1),
    katalog(),
  ]);
  const st = angebotAnzeigeStatus(a);
  const zeitleiste = [
    ['Erstellt', a.erstelltAm],
    ['Gesendet', a.gesendetAm],
    ['Vom Kunden angesehen', a.angesehenAm],
    [a.angenommenWeg === 'online' ? 'Online angenommen' : 'Angenommen', a.angenommenAm],
    ['Abgelehnt', a.abgelehntAm],
  ].filter(([, d]) => d) as [string, Date][];

  return (
    <>
      <Link href="/admin/angebote/" className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> Alle Angebote
      </Link>
      <div className="a-kopf">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
          <Avatar name={k.name || k.email || '?'} brandDomain={k.brandDomain} gross />
          <div style={{ minWidth: 0 }}>
            <span className="a-kicker zahl">Angebot {a.nummer}</span>
            <h1>{k.name || k.email}</h1>
            <p className="a-sub">
              <span className={`a-pill an-${st}`}>{ANGEBOT_STATUS[st]}</span>{' '}
              {zeitleiste.map(([l, d]) => `${l} ${terminKurz(d)}`).join(' · ')}
              {a.angenommenName ? ` · von «${a.angenommenName}»` : ''}
              {a.abgelehntGrund ? ` · ${a.abgelehntGrund}` : ''}
            </p>
          </div>
        </div>
        <Link href={`/admin/kontakte/${k.id}/`} className="a-knopf linie">
          <Icon name="kunde" /> Kundenakte
        </Link>
      </div>
      <AngebotEditor
        a={{
          id: a.id,
          nummer: a.nummer ?? '',
          status: a.status,
          anzeigeStatus: st,
          titel: a.titel,
          einleitung: a.einleitung ?? '',
          schluss: a.schluss ?? '',
          positionen: a.positionen,
          stil: a.stil,
          stoffe: a.stoffe,
          rabattProzent: a.rabattProzent,
          rabattRp: a.rabattRp,
          mwstSatz: a.mwstSatz,
          gueltigBis: isoVon(a.gueltigBis),
          notiz: a.notiz ?? '',
        }}
        kunde={{ name: k.name, email: k.email, telefon: k.telefon, whatsappOk: Boolean(k.einwilligungWhatsapp) && !k.abgemeldet }}
        katalog={kat}
        stilQuellen={quellen.map((t) => ({ terminId: t.id, datum: tagDatum(t.erstelltAm), stil: t.stil, stoffe: t.stoffe }))}
        mailBereit={mailBereit()}
        auftragId={au?.id ?? null}
      />
    </>
  );
}
