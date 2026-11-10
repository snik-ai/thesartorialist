import type { Metadata } from 'next';
import Link from 'next/link';
import { and, desc, ilike, isNull, or, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import { Avatar } from '@/components/admin/Bausteine';
import { duplikatGruppen } from '@/lib/crm/kontakte';
import { telAnzeige } from '@/lib/crm/telefon';
import { relativ } from '@/lib/zeit';

export const metadata: Metadata = { title: 'Kontakte' };
export const dynamic = 'force-dynamic';

const likeEsc = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export default async function KontaktePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').trim().slice(0, 80);
  const k = schema.kontakt;
  const such = q
    ? or(
        ilike(k.name, `%${likeEsc(q)}%`),
        ilike(k.email, `%${likeEsc(q)}%`),
        ilike(k.firma, `%${likeEsc(q)}%`),
        q.replace(/\D/g, '').length >= 3 ? ilike(k.telefonNorm, `%${q.replace(/\D/g, '').slice(-9)}%`) : undefined,
      )
    : undefined;

  const [reihen, [{ gesamt }], dups] = await Promise.all([
    db()
      .select({
        id: k.id,
        name: k.name,
        email: k.email,
        telefon: k.telefon,
        firma: k.firma,
        brandDomain: k.brandDomain,
        einwilligung: k.einwilligungWhatsapp,
        ratgeber: sql<boolean>`exists(select 1 from aktivitaet ra where ra.kontakt_id = ${k.id} and ra.daten->>'art' = 'ratgeber')`,
        aktualisiertAm: k.aktualisiertAm,
        termine: sql<number>`(select count(*)::int from termin t where t.kontakt_id = ${k.id})`,
        letzte: sql<Date | null>`(select max(a.erstellt_am) from aktivitaet a where a.kontakt_id = ${k.id})`.mapWith((v) => (v ? new Date(v) : null)),
      })
      .from(k)
      .where(and(isNull(k.zusammengefuehrtIn), such))
      .orderBy(desc(k.aktualisiertAm))
      .limit(300),
    db().select({ gesamt: sql<number>`count(*)::int` }).from(k).where(isNull(k.zusammengefuehrtIn)),
    duplikatGruppen(),
  ]);

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">CRM</span>
          <h1>Kontakte</h1>
          <p className="a-sub">
            <span className="zahl">{gesamt}</span> Kontakte · zusammengeführt über E-Mail oder Telefon
          </p>
        </div>
        {dups.length > 0 && (
          <Link href="/admin/kontakte/duplikate/" className="a-knopf gold">
            <Icon name="merge" /> {dups.length} mögliche Duplikate
          </Link>
        )}
      </div>

      <form className="a-suche" style={{ marginBottom: 16 }} role="search">
        <Icon name="suche" />
        <input className="a-input" type="search" name="q" defaultValue={q} placeholder="Name, E-Mail, Telefon oder Firma" aria-label="Kontakte durchsuchen" />
      </form>

      <div className="a-karte">
        {reihen.length === 0 ? (
          <div className="a-leer">
            <h3>{q ? 'Nichts gefunden' : 'Noch keine Kontakte'}</h3>
            <p>{q ? `Kein Kontakt passt zu «${q}».` : 'Kontakte entstehen automatisch aus Anfragen auf der Website.'}</p>
          </div>
        ) : (
          <div className="a-liste">
            {reihen.map((r) => (
              <Link key={r.id} href={`/admin/kontakte/${r.id}/`} className="a-zeile">
                <Avatar name={r.name || r.email || '?'} brandDomain={r.brandDomain} />
                <span style={{ minWidth: 0 }}>
                  <span className="a-zeile-titel" style={{ display: 'block' }}>
                    {r.name || r.email || (r.telefon ? telAnzeige(r.telefon) : 'Ohne Namen')}
                    {r.firma ? <span style={{ fontWeight: 400, color: 'var(--a-muted)' }}> · {r.firma}</span> : null}
                  </span>
                  <span className="a-zeile-sub" style={{ display: 'block' }}>
                    {[r.email, r.telefon ? telAnzeige(r.telefon) : null].filter(Boolean).join(' · ') || '–'}
                  </span>
                </span>
                <span className="a-zeile-rechts">
                  <span className="zahl">
                    {r.termine} {r.termine === 1 ? 'Anfrage' : 'Anfragen'}
                    {r.einwilligung ? ' · WA/SMS ✓' : ''}
                    {r.ratgeber ? ' · Ratgeber' : ''}
                  </span>
                  <time>{relativ(r.letzte ?? r.aktualisiertAm)}</time>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
