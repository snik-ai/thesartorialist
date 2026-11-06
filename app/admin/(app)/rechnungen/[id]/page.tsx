import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import RechnungSeite from '@/components/beleg/RechnungSeite';
import { rechnungAnzeigeStatus } from '@/lib/crm/belege';
import { belegTexte, firma } from '@/lib/crm/firma';
import { logoFuer } from '@/lib/beleg/laden';
import { BELEG_SPRACHEN } from '@/lib/beleg/texte';
import { mailBereit } from '@/lib/mail';
import { isoVon } from '@/lib/zeit';
import { UUID } from '@/lib/admin/zugang';

export const metadata: Metadata = { title: 'Rechnung' };
export const dynamic = 'force-dynamic';

export default async function RechnungDetailSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [r] = await db().select().from(schema.rechnung).where(eq(schema.rechnung.id, id)).limit(1);
  if (!r || !r.kontaktId) notFound();
  const [[k], zahlungen, f, logo, [au], verlauf, versionen] = await Promise.all([
    db().select().from(schema.kontakt).where(eq(schema.kontakt.id, r.kontaktId)).limit(1),
    db().select().from(schema.zahlung).where(eq(schema.zahlung.rechnungId, id)).orderBy(asc(schema.zahlung.datum)),
    firma(),
    logoFuer('web'),
    r.auftragId ? db().select({ id: schema.auftrag.id, nummer: schema.auftrag.nummer }).from(schema.auftrag).where(eq(schema.auftrag.id, r.auftragId)).limit(1) : Promise.resolve([] as { id: string; nummer: string | null }[]),
    db().select().from(schema.aktivitaet).where(eq(schema.aktivitaet.rechnungId, r.id)).orderBy(desc(schema.aktivitaet.erstelltAm)).limit(40),
    db().select().from(schema.belegVersion).where(and(eq(schema.belegVersion.belegId, r.id), eq(schema.belegVersion.art, 'rechnung'))).orderBy(desc(schema.belegVersion.version)).limit(20),
  ]);
  const texte = Object.fromEntries(BELEG_SPRACHEN.map((s) => [s.code, belegTexte(f, s.code)])) as Parameters<typeof RechnungSeite>[0]['texte'];
  const tag = (d: Date | null) => isoVon(d) ?? '';
  return (
    <RechnungSeite
      r={{
        id: r.id,
        nummer: r.nummer,
        art: r.art,
        status: r.status,
        anzeigeStatus: rechnungAnzeigeStatus(r),
        kontaktId: r.kontaktId,
        titel: r.titel,
        rechnungsdatum: tag(r.rechnungsdatum ?? r.erstelltAm),
        faelligAm: tag(r.faelligAm),
        einleitung: r.einleitung ?? '',
        schluss: r.schluss ?? '',
        positionen: r.positionen,
        rabattProzent: r.rabattProzent,
        rabattRp: r.rabattRp,
        mwstSatz: r.mwstSatz,
        abzug: r.abzug,
        betragRp: r.betragRp,
        bezahltRp: r.bezahltRp,
        mahngebuehrenRp: r.mahngebuehrenRp,
        mahnstufe: r.mahnstufe,
        referenz: r.referenz,
        sprache: r.sprache,
        version: r.version,
        gesendetAm: r.gesendetAm?.toISOString() ?? null,
        bezahltAm: r.bezahltAm?.toISOString() ?? null,
      }}
      kunde={{ id: k.id, name: k.name, anrede: k.anrede, firma: k.firma, strasse: k.strasse, plz: k.plz, ort: k.ort, land: k.land, email: k.email, telefon: k.telefon, whatsappOk: Boolean(k.einwilligungWhatsapp) && !k.abgemeldet }}
      firma={f}
      logo={logo}
      texte={texte}
      auftrag={au ?? null}
      zahlungen={zahlungen.map((z) => ({ id: z.id, betragRp: z.betragRp, datum: z.datum.toISOString(), art: z.art, notiz: z.notiz }))}
      verlauf={verlauf.map((v) => ({ id: v.id, kanal: v.kanal, titel: v.titel, text: v.text, erstelltAm: v.erstelltAm.toISOString() }))}
      versionen={versionen.map((v) => ({ id: v.id, version: v.version, grund: v.grund, totalRp: v.totalRp, erstelltAm: v.erstelltAm.toISOString() }))}
      mailBereit={mailBereit()}
    />
  );
}
