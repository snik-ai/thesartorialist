import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import RechnungDetail from '@/components/admin/RechnungDetail';
import { Avatar } from '@/components/admin/Bausteine';
import { RECHNUNG_ART, RECHNUNG_STATUS, rechnungAnzeigeStatus } from '@/lib/crm/belege';
import { firma, katalog } from '@/lib/crm/firma';
import { mailBereit } from '@/lib/mail';
import { isoVon, tagDatum } from '@/lib/zeit';
import { UUID } from '@/lib/admin/zugang';

export const metadata: Metadata = { title: 'Rechnung' };
export const dynamic = 'force-dynamic';

export default async function RechnungSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [r] = await db().select().from(schema.rechnung).where(eq(schema.rechnung.id, id)).limit(1);
  if (!r || !r.kontaktId) notFound();
  const [[k], zahlungen, kat, f, [au]] = await Promise.all([
    db().select().from(schema.kontakt).where(eq(schema.kontakt.id, r.kontaktId)).limit(1),
    db().select().from(schema.zahlung).where(eq(schema.zahlung.rechnungId, id)).orderBy(asc(schema.zahlung.datum)),
    katalog(),
    firma(),
    r.auftragId ? db().select({ id: schema.auftrag.id, nummer: schema.auftrag.nummer }).from(schema.auftrag).where(eq(schema.auftrag.id, r.auftragId)).limit(1) : Promise.resolve([] as { id: string; nummer: string | null }[]),
  ]);
  const st = rechnungAnzeigeStatus(r);

  return (
    <>
      <Link href="/admin/rechnungen/" className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> Alle Rechnungen
      </Link>
      <div className="a-kopf">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
          <Avatar name={k.name || '?'} brandDomain={k.brandDomain} gross />
          <div style={{ minWidth: 0 }}>
            <span className="a-kicker zahl">
              {RECHNUNG_ART[r.art]} {r.nummer}
              {au ? ` · Auftrag ${au.nummer}` : ''}
            </span>
            <h1>{k.name}</h1>
            <p className="a-sub">
              <span className={`a-pill re-${st}`}>{RECHNUNG_STATUS[st]}</span> {r.gesendetAm ? `Gesendet ${tagDatum(r.gesendetAm)}` : r.status === 'entwurf' ? 'Noch nicht versendet' : 'Festgeschrieben'}
              {r.bezahltAm ? ` · bezahlt ${tagDatum(r.bezahltAm)}` : ''}
              {!k.strasse && ' · Adresse fehlt (QR-Zahlteil ohne Zahlungspflichtigen)'}
            </p>
          </div>
        </div>
        <div className="a-knopfreihe">
          {au && (
            <Link href={`/admin/auftraege/${au.id}/`} className="a-knopf leise">
              <Icon name="auftrag" /> Auftrag
            </Link>
          )}
          <Link href={`/admin/kontakte/${k.id}/`} className="a-knopf linie">
            <Icon name="kunde" /> Kundenakte
          </Link>
        </div>
      </div>
      <RechnungDetail
        r={{
          id: r.id,
          status: r.status,
          art: r.art,
          titel: r.titel,
          einleitung: r.einleitung ?? '',
          schluss: r.schluss ?? '',
          positionen: r.positionen,
          rabattProzent: r.rabattProzent,
          rabattRp: r.rabattRp,
          mwstSatz: r.mwstSatz,
          abzug: r.abzug,
          betragRp: r.betragRp,
          bezahltRp: r.bezahltRp,
          rechnungsdatum: isoVon(r.rechnungsdatum),
          faelligAm: isoVon(r.faelligAm),
        }}
        zahlungen={zahlungen.map((z) => ({ id: z.id, betragRp: z.betragRp, datum: z.datum.toISOString(), art: z.art, notiz: z.notiz }))}
        katalog={kat}
        emailDa={Boolean(k.email)}
        mailBereit={mailBereit()}
        kontoDa={Boolean(f.iban.trim() || f.qrIban.trim())}
      />
    </>
  );
}
