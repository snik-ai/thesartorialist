import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, asc, desc, eq, gte, isNotNull } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import { Avatar, StilAuswahl, Verlauf } from '@/components/admin/Bausteine';
import { AuftragMassblatt, AuftragNotiz, AuftragPlanung, AuftragRechnungen, AuftragSchritte, AuftragTasks } from '@/components/admin/Auftrag';
import { AUFTRAG_LABEL, RECHNUNG_ART, RECHNUNG_STATUS, rechnungAnzeigeStatus } from '@/lib/crm/belege';
import { chf, positionBetrag } from '@/lib/crm/geld';
import { firma } from '@/lib/crm/firma';
import { mailBereit } from '@/lib/mail';
import { isoVon, tageBis, tagDatum } from '@/lib/zeit';
import { UUID } from '@/lib/admin/zugang';

export const metadata: Metadata = { title: 'Auftrag' };
export const dynamic = 'force-dynamic';

export default async function AuftragSeite({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ schritt?: string }> }) {
  const { id } = await params;
  const { schritt } = await searchParams;
  if (!UUID.test(id)) notFound();
  const [au] = await db().select().from(schema.auftrag).where(eq(schema.auftrag.id, id)).limit(1);
  if (!au || !au.kontaktId) notFound();
  const [[k], tasks, admins, termine, rechnungen, massblaetter, verlauf, belegt, [an], f] = await Promise.all([
    db().select().from(schema.kontakt).where(eq(schema.kontakt.id, au.kontaktId)).limit(1),
    db().select().from(schema.auftragTask).where(eq(schema.auftragTask.auftragId, id)).orderBy(asc(schema.auftragTask.reihenfolge), asc(schema.auftragTask.erstelltAm)),
    db().select({ id: schema.adminUser.id, name: schema.adminUser.name, email: schema.adminUser.email }).from(schema.adminUser).where(eq(schema.adminUser.aktiv, true)),
    db().select().from(schema.termin).where(eq(schema.termin.auftragId, id)).orderBy(asc(schema.termin.bestaetigtStart)),
    db().select().from(schema.rechnung).where(eq(schema.rechnung.auftragId, id)).orderBy(asc(schema.rechnung.erstelltAm)),
    db().select().from(schema.massblatt).where(eq(schema.massblatt.kontaktId, au.kontaktId)).orderBy(desc(schema.massblatt.version)),
    db().select().from(schema.aktivitaet).where(eq(schema.aktivitaet.auftragId, id)).orderBy(desc(schema.aktivitaet.erstelltAm)).limit(80),
    db()
      .select({ start: schema.termin.bestaetigtStart })
      .from(schema.termin)
      .where(and(eq(schema.termin.status, 'bestaetigt'), isNotNull(schema.termin.bestaetigtStart), gte(schema.termin.bestaetigtStart, new Date(Date.now() - 86400_000)))),
    au.angebotId ? db().select({ id: schema.angebot.id, nummer: schema.angebot.nummer }).from(schema.angebot).where(eq(schema.angebot.id, au.angebotId)).limit(1) : Promise.resolve([] as { id: string; nummer: string | null }[]),
    firma(),
  ]);

  const adminListe = admins.map((a) => ({ id: a.id, name: a.name || a.email.split('@')[0] }));
  const offeneTasks: Record<string, number> = {};
  for (const t of tasks) if (!t.erledigtAm && t.schritt) offeneTasks[t.schritt] = (offeneTasks[t.schritt] ?? 0) + 1;
  const aktiv = rechnungen.filter((r) => r.status !== 'storniert');
  const bezahlt = aktiv.reduce((a, r) => a + r.bezahltRp, 0);
  const offen = aktiv.filter((r) => r.status === 'offen' || r.status === 'teilbezahlt').reduce((a, r) => a + r.betragRp - r.bezahltRp, 0);

  return (
    <>
      <Link href="/admin/auftraege/" className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> Alle Aufträge
      </Link>
      <div className="a-kopf">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
          <Avatar name={k.name || '?'} brandDomain={k.brandDomain} gross />
          <div style={{ minWidth: 0 }}>
            <span className="a-kicker zahl">
              Auftrag {au.nummer}
              {an ? ` · aus Angebot ${an.nummer}` : ''}
            </span>
            <h1>{au.titel || 'Massanfertigung'}</h1>
            <p className="a-sub">
              <span className={`a-pill au-${au.status}`}>{AUFTRAG_LABEL[au.status]}</span> {k.name} · eröffnet {tagDatum(au.erstelltAm)}
              {au.anlassDatum ? ` · ${au.anlass || 'Anlass'} ${tagDatum(au.anlassDatum)} (${tageBis(au.anlassDatum) >= 0 ? `in ${tageBis(au.anlassDatum)} Tagen` : 'vorbei'})` : ''}
            </p>
          </div>
        </div>
        <div className="a-knopfreihe">
          {an && (
            <Link href={`/admin/angebote/${an.id}/`} className="a-knopf leise">
              <Icon name="dokument" /> Angebot
            </Link>
          )}
          <Link href={`/admin/kontakte/${k.id}/`} className="a-knopf linie">
            <Icon name="kunde" /> Kundenakte
          </Link>
        </div>
      </div>

      <AuftragSchritte id={au.id} status={au.status} zeiten={au.statusZeiten} liefertermin={isoVon(au.liefertermin)} emailDa={Boolean(k.email)} mailBereit={mailBereit()} offeneTasks={offeneTasks} vorwahl={schritt} />

      <div className="a-beleg" style={{ marginTop: 18 }}>
        <div className="a-beleg-haupt">
          <AuftragTasks
            id={au.id}
            status={au.status}
            admins={adminListe}
            tasks={tasks.map((t) => ({ id: t.id, titel: t.titel, schritt: t.schritt, faelligAm: isoVon(t.faelligAm), erledigt: Boolean(t.erledigtAm), zustaendigId: t.zustaendigId, spaet: Boolean(t.faelligAm && !t.erledigtAm && tageBis(t.faelligAm) < 0) }))}
          />

          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Positionen</h2>
              <b className="zahl">{chf(au.totalRp)}</b>
            </div>
            <div className="a-liste">
              {au.positionen.map((p, i) => (
                <div key={p.id} className="a-zeile" style={{ gridTemplateColumns: '28px minmax(0,1fr) auto' }}>
                  <span className="a-sub zahl" style={{ margin: 0 }}>{i + 1}</span>
                  <span style={{ minWidth: 0 }}>
                    <span className="a-zeile-titel" style={{ display: 'block', whiteSpace: 'normal' }}>
                      {p.menge !== 1 ? `${p.menge} × ` : ''}
                      {p.bezeichnung}
                    </span>
                    {(p.beschreibung || p.stoffnummer) && (
                      <span className="a-zeile-sub" style={{ display: 'block', whiteSpace: 'pre-line' }}>
                        {[p.beschreibung, p.stoffnummer ? `Stoff ${p.stoffnummer}` : ''].filter(Boolean).join('\n')}
                      </span>
                    )}
                  </span>
                  <b className="zahl">{chf(positionBetrag(p))}</b>
                </div>
              ))}
              {au.rabattProzent > 0 || au.rabattRp > 0 ? (
                <div className="a-zeile" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                  <span className="a-zeile-sub">Rabatt {au.rabattProzent ? `${au.rabattProzent} %` : ''}</span>
                  <span className="a-zeile-sub">im Total berücksichtigt</span>
                </div>
              ) : null}
            </div>
          </section>

          {(au.stil.length > 0 || au.stoffe.length > 0) && <StilAuswahl stil={au.stil} stoffe={au.stoffe} />}

          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Notizen &amp; Verlauf</h2>
            </div>
            <div className="a-karte-inhalt">
              <AuftragNotiz id={au.id} />
              <div style={{ marginTop: 18 }}>
                <Verlauf eintraege={verlauf} />
              </div>
            </div>
          </section>
        </div>

        <aside className="a-beleg-seite">
          <AuftragPlanung
            id={au.id}
            liefertermin={isoVon(au.liefertermin)}
            anlass={au.anlass ?? ''}
            anlassDatum={isoVon(au.anlassDatum)}
            abholung={isoVon(au.abholungGeplant)}
            zustaendigId={au.zustaendigId}
            bestellnotiz={au.bestellnotiz ?? ''}
            admins={adminListe}
            termine={termine.filter((t) => t.bestaetigtStart).map((t) => ({ id: t.id, zweck: t.zweck, start: t.bestaetigtStart!.toISOString(), status: t.status }))}
            belegt={belegt.map((b) => b.start!.toISOString())}
          />

          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Rechnungen</h2>
              <span className="a-sub zahl" style={{ margin: 0 }}>
                {chf(bezahlt)} bezahlt
              </span>
            </div>
            {rechnungen.length > 0 && (
              <div className="a-liste">
                {rechnungen.map((r) => {
                  const st = rechnungAnzeigeStatus(r);
                  return (
                    <Link key={r.id} href={`/admin/rechnungen/${r.id}/`} className="a-zeile" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                      <span style={{ minWidth: 0 }}>
                        <span className="a-zeile-titel zahl" style={{ display: 'block' }}>{r.nummer}</span>
                        <span className="a-zeile-sub" style={{ display: 'block' }}>
                          {RECHNUNG_ART[r.art]} · {chf(r.betragRp)}
                        </span>
                      </span>
                      <span className={`a-pill re-${st}`}>{RECHNUNG_STATUS[st]}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="a-karte-inhalt">
              {offen > 0 && <div className="a-hinweis" style={{ marginBottom: 12 }}>Offen: {chf(offen)}</div>}
              <AuftragRechnungen
                id={au.id}
                totalRp={au.totalRp}
                verrechnetRp={aktiv.filter((r) => r.art !== 'anzahlung').reduce((a, r) => a + r.totalRp, 0)}
                hatAnzahlung={aktiv.some((r) => r.art === 'anzahlung')}
                hatSchluss={aktiv.some((r) => r.art === 'schluss' || r.art === 'rechnung')}
                anzahlungProzent={f.anzahlungProzent}
              />
            </div>
          </section>

          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Massblatt</h2>
            </div>
            <div className="a-karte-inhalt">
              <AuftragMassblatt id={au.id} kontaktId={k.id} massblattId={au.massblattId} versionen={massblaetter.map((m) => ({ id: m.id, label: `V${m.version} · ${tagDatum(m.gemessenAm)}${m.aktiv ? ' (aktuell)' : ''}` }))} />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
