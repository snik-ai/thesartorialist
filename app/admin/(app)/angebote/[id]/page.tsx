import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { and, asc, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import AngebotSeite from '@/components/beleg/AngebotSeite';
import { angebotAnzeigeStatus } from '@/lib/crm/belege';
import { belegTexte, firma } from '@/lib/crm/firma';
import { logoFuer } from '@/lib/beleg/laden';
import { mailBereit } from '@/lib/mail';
import { isoVon, tagDatum } from '@/lib/zeit';
import { UUID } from '@/lib/admin/zugang';
import { BELEG_SPRACHEN } from '@/lib/beleg/texte';

export const metadata: Metadata = { title: 'Angebot' };
export const dynamic = 'force-dynamic';

export default async function AngebotDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [a] = await db().select().from(schema.angebot).where(eq(schema.angebot.id, id)).limit(1);
  if (!a || !a.kontaktId) notFound();
  const [[k], quellen, [au], f, logo, verlauf, versionen] = await Promise.all([
    db().select().from(schema.kontakt).where(eq(schema.kontakt.id, a.kontaktId)).limit(1),
    db()
      .select()
      .from(schema.termin)
      .where(and(eq(schema.termin.kontaktId, a.kontaktId), sql`jsonb_array_length(${schema.termin.stil}) > 0`))
      .orderBy(desc(schema.termin.erstelltAm))
      .limit(5),
    db().select({ id: schema.auftrag.id, nummer: schema.auftrag.nummer }).from(schema.auftrag).where(eq(schema.auftrag.angebotId, a.id)).limit(1),
    firma(),
    logoFuer('web'),
    db().select().from(schema.aktivitaet).where(eq(schema.aktivitaet.angebotId, a.id)).orderBy(desc(schema.aktivitaet.erstelltAm)).limit(40),
    db().select().from(schema.belegVersion).where(and(eq(schema.belegVersion.belegId, a.id), eq(schema.belegVersion.art, 'angebot'))).orderBy(desc(schema.belegVersion.version)).limit(20),
  ]);
  const [re] = au
    ? await db()
        .select({ id: schema.rechnung.id, nummer: schema.rechnung.nummer })
        .from(schema.rechnung)
        .where(and(eq(schema.rechnung.auftragId, au.id), inArray(schema.rechnung.status, ['entwurf', 'offen', 'teilbezahlt', 'bezahlt'])))
        .orderBy(asc(schema.rechnung.erstelltAm))
        .limit(1)
    : [];
  void or;
  const texte = Object.fromEntries(BELEG_SPRACHEN.map((s) => [s.code, belegTexte(f, s.code)])) as Parameters<typeof AngebotSeite>[0]['texte'];
  const tag = (d: Date | null) => isoVon(d) ?? '';

  return (
    <AngebotSeite
      a={{
        id: a.id,
        nummer: a.nummer,
        status: a.status,
        anzeigeStatus: angebotAnzeigeStatus(a),
        kontaktId: a.kontaktId,
        titel: a.titel,
        datum: tag(a.datum),
        gueltigBis: tag(a.gueltigBis),
        einleitung: a.einleitung ?? '',
        schluss: a.schluss ?? '',
        positionen: a.positionen,
        rabattProzent: a.rabattProzent,
        rabattRp: a.rabattRp,
        mwstSatz: a.mwstSatz,
        sprache: a.sprache,
        stil: a.stil,
        stoffe: a.stoffe,
        stilAnhang: a.stilAnhang,
        notiz: a.notiz ?? '',
        version: a.version,
        gesendetAm: a.gesendetAm?.toISOString() ?? null,
        angesehenAm: a.angesehenAm?.toISOString() ?? null,
        angesehenAnzahl: a.angesehenAnzahl,
        angenommenAm: a.angenommenAm?.toISOString() ?? null,
        angenommenName: a.angenommenName,
        abgelehntAm: a.abgelehntAm?.toISOString() ?? null,
        abgelehntGrund: a.abgelehntGrund,
      }}
      kunde={{ id: k.id, name: k.name, anrede: k.anrede, firma: k.firma, strasse: k.strasse, plz: k.plz, ort: k.ort, land: k.land, email: k.email, telefon: k.telefon, whatsappOk: Boolean(k.einwilligungWhatsapp) && !k.abgemeldet }}
      firma={f}
      logo={logo}
      texte={texte}
      auftrag={au ?? null}
      rechnung={re ?? null}
      verlauf={verlauf.map((v) => ({ id: v.id, kanal: v.kanal, titel: v.titel, text: v.text, erstelltAm: v.erstelltAm.toISOString() }))}
      versionen={versionen.map((v) => ({ id: v.id, version: v.version, grund: v.grund, totalRp: v.totalRp, erstelltAm: v.erstelltAm.toISOString() }))}
      stilQuellen={quellen.map((t) => ({ terminId: t.id, datum: tagDatum(t.erstelltAm), stil: t.stil, stoffe: t.stoffe }))}
      mailBereit={mailBereit()}
    />
  );
}
