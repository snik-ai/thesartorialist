// Massblatt-Ansicht (Server): Kopf mit Versionen, Editor mit Vorlage/Vergleich. Für /massblaetter/[id] und /massblaetter/neu.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, desc, eq, notInArray } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from './Icon';
import MassblattEditor from './MassblattEditor';
import { Avatar } from './Bausteine';
import { isoVon, tagDatum } from '@/lib/zeit';

export default async function MassblattAnsicht({ kontaktId, m, auftragVorwahl }: { kontaktId: string; m: typeof schema.massblatt.$inferSelect | null; auftragVorwahl?: string | null }) {
  const [[k], versionen, auftraege] = await Promise.all([
    db().select().from(schema.kontakt).where(eq(schema.kontakt.id, kontaktId)).limit(1),
    db().select().from(schema.massblatt).where(eq(schema.massblatt.kontaktId, kontaktId)).orderBy(desc(schema.massblatt.version)),
    db()
      .select({ id: schema.auftrag.id, nummer: schema.auftrag.nummer, titel: schema.auftrag.titel })
      .from(schema.auftrag)
      .where(and(eq(schema.auftrag.kontaktId, kontaktId), notInArray(schema.auftrag.status, ['storniert'])))
      .orderBy(desc(schema.auftrag.erstelltAm)),
  ]);
  if (!k) notFound();
  // Neu: Vorlage ist die aktuelle Version (Werte übernehmen, nur Abweichungen neu messen)
  const basis = m ?? versionen[0] ?? null;
  const vorher = m ? versionen.find((v) => v.version < m.version) ?? null : versionen[0] ?? null;

  return (
    <>
      <Link href={`/admin/kontakte/${k.id}/`} className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> Kundenakte {k.name}
      </Link>
      <div className="a-kopf">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
          <Avatar name={k.name || '?'} brandDomain={k.brandDomain} gross />
          <div style={{ minWidth: 0 }}>
            <span className="a-kicker">{m ? `Massblatt · Version ${m.version}${m.aktiv ? ' (aktuell)' : ''}` : versionen.length ? `Neue Messung · Version ${versionen[0].version + 1}` : 'Erstes Massblatt'}</span>
            <h1>{k.name}</h1>
            <p className="a-sub">{m ? `Gemessen am ${tagDatum(m.gemessenAm)}` : versionen.length ? `Werte aus V${versionen[0].version} vorausgefüllt — nur Abweichungen ändern.` : 'Masse in cm, Tab springt zum nächsten Feld.'}</p>
          </div>
        </div>
        {versionen.length > 0 && (
          <div className="a-chips">
            {versionen.slice(0, 6).map((v) => (
              <Link key={v.id} href={`/admin/massblaetter/${v.id}/`} className="a-chip klein" aria-current={v.id === m?.id ? 'page' : undefined}>
                V{v.version} · {tagDatum(v.gemessenAm)}
              </Link>
            ))}
          </div>
        )}
      </div>
      <MassblattEditor
        key={m?.id ?? 'neu'}
        kontaktId={k.id}
        id={m?.id ?? null}
        version={m?.version ?? (versionen[0]?.version ?? 0) + 1}
        werte={basis?.masse ?? {}}
        koerper={basis?.koerper ?? []}
        notiz={basis?.notiz ?? ''}
        gemessenAm={m ? isoVon(m.gemessenAm) : null}
        auftragId={m ? m.auftragId : auftragVorwahl ?? null}
        vorher={vorher && vorher.id !== m?.id ? { version: vorher.version, datum: tagDatum(vorher.gemessenAm), masse: vorher.masse } : null}
        auftraege={auftraege.map((a) => ({ id: a.id, label: `${a.nummer} · ${a.titel || 'Auftrag'}` }))}
      />
    </>
  );
}
