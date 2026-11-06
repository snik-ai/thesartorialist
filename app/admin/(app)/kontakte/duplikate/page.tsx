import type { Metadata } from 'next';
import Link from 'next/link';
import { inArray, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import DuplikatGruppe from '@/components/admin/DuplikatGruppe';
import { duplikatGruppen } from '@/lib/crm/kontakte';

export const metadata: Metadata = { title: 'Duplikate' };
export const dynamic = 'force-dynamic';

const GRUND = { email: 'Gleiche E-Mail', telefon: 'Gleiche Telefonnummer', name: 'Gleicher Name' } as const;

export default async function DuplikatePage() {
  const gruppen = await duplikatGruppen();
  const ids = [...new Set(gruppen.flatMap((g) => g.ids))];
  const k = schema.kontakt;
  const zeilen = ids.length
    ? await db()
        .select({
          id: k.id,
          name: k.name,
          email: k.email,
          telefon: k.telefon,
          firma: k.firma,
          erstelltAm: k.erstelltAm,
          termine: sql<number>`(select count(*)::int from termin t where t.kontakt_id = ${k.id})`,
        })
        .from(k)
        .where(inArray(k.id, ids))
    : [];
  const nachId = new Map(zeilen.map((z) => [z.id, { ...z, erstelltAm: z.erstelltAm.toISOString() }]));

  return (
    <>
      <Link href="/admin/kontakte/" className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> Alle Kontakte
      </Link>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Golden Record</span>
          <h1>Mögliche Duplikate</h1>
          <p className="a-sub">Wählen Sie den Datensatz, der bleibt. Termine, Verlauf und leere Felder werden übernommen.</p>
        </div>
      </div>
      {gruppen.length === 0 ? (
        <div className="a-karte a-leer">
          <h3>Keine Duplikate</h3>
          <p>Alle Kontakte sind eindeutig.</p>
        </div>
      ) : (
        <div className="a-raster">
          {gruppen.map((g) => (
            <DuplikatGruppe key={`${g.grund}:${g.wert}`} titel={`${GRUND[g.grund]}: ${g.wert}`} kontakte={g.ids.map((id) => nachId.get(id)!).filter(Boolean)} />
          ))}
        </div>
      )}
    </>
  );
}
