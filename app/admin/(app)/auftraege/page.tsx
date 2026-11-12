import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import StatusWeiter from '@/components/admin/StatusWeiter';
import TaskHaken from '@/components/admin/TaskHaken';
import { AUFTRAG_LABEL, AUFTRAG_SCHRITTE } from '@/lib/crm/belege';
import { chf, chfKurz } from '@/lib/crm/geld';
import { faelligText, tageBis, tagKurz, tagDatum, terminKurz } from '@/lib/zeit';
import type { AuftragStatus } from '@/lib/db/schema';

export const metadata: Metadata = { title: 'Aufträge' };
export const dynamic = 'force-dynamic';

type Karte = {
  id: string;
  nummer: string;
  titel: string;
  status: AuftragStatus;
  total_rp: number;
  liefertermin: Date | null;
  anlass: string | null;
  anlass_datum: Date | null;
  name: string;
  kontakt_id: string;
  offen: number;
  alle: number;
  naechste: string | null;
  naechste_am: Date | null;
  bezahlt: number;
  verrechnet: number;
  abgeschlossen_am: Date | null;
};

type Ereignis = { art: 'task' | 'lieferung' | 'anlass' | 'termin'; am: Date; titel: string; auftrag_id: string; nummer: string; name: string; task_id: string | null; zweck: string | null };

export default async function AuftraegePage({ searchParams }: { searchParams: Promise<{ ansicht?: string }> }) {
  const ansicht = (await searchParams).ansicht === 'zeitstrahl' ? 'zeitstrahl' : (await searchParams).ansicht === 'archiv' ? 'archiv' : 'board';
  const karten = await db().execute<Karte>(sql`
    select a.id, a.nummer, a.titel, a.status, a.total_rp, a.liefertermin, a.anlass, a.anlass_datum, a.abgeschlossen_am, k.name, k.id as kontakt_id,
      (select count(*)::int from auftrag_task t where t.auftrag_id = a.id and t.erledigt_am is null) as offen,
      (select count(*)::int from auftrag_task t where t.auftrag_id = a.id) as alle,
      (select t.titel from auftrag_task t where t.auftrag_id = a.id and t.erledigt_am is null order by t.faellig_am nulls last, t.reihenfolge limit 1) as naechste,
      (select t.faellig_am from auftrag_task t where t.auftrag_id = a.id and t.erledigt_am is null order by t.faellig_am nulls last, t.reihenfolge limit 1) as naechste_am,
      (select coalesce(sum(r.bezahlt_rp), 0)::int from rechnung r where r.auftrag_id = a.id and r.status <> 'storniert') as bezahlt,
      (select coalesce(sum(r.total_rp), 0)::int from rechnung r where r.auftrag_id = a.id and r.status in ('offen', 'teilbezahlt', 'bezahlt') and r.art <> 'anzahlung') as verrechnet
    from auftrag a join kontakt k on k.id = a.kontakt_id
    where ${ansicht === 'archiv' ? sql`a.status in ('abgeschlossen', 'storniert')` : sql`a.status not in ('abgeschlossen', 'storniert')`}
    order by coalesce(a.anlass_datum, a.liefertermin, a.erstellt_am) limit 400`);

  const ereignisse =
    ansicht === 'zeitstrahl'
      ? await db().execute<Ereignis>(sql`
      select * from (
        select 'task' as art, t.faellig_am as am, t.titel, a.id as auftrag_id, a.nummer, k.name, t.id as task_id, null as zweck
          from auftrag_task t join auftrag a on a.id = t.auftrag_id join kontakt k on k.id = a.kontakt_id
          where t.erledigt_am is null and t.faellig_am is not null and a.status not in ('abgeschlossen', 'storniert')
        union all
        select 'lieferung', a.liefertermin, 'Liefertermin · Eingang im Atelier erwartet', a.id, a.nummer, k.name, null, null
          from auftrag a join kontakt k on k.id = a.kontakt_id where a.liefertermin is not null and a.status in ('mass', 'bestellt', 'produktion')
        union all
        select 'anlass', a.anlass_datum, coalesce(a.anlass, 'Anlass'), a.id, a.nummer, k.name, null, null
          from auftrag a join kontakt k on k.id = a.kontakt_id where a.anlass_datum is not null and a.status not in ('abgeschlossen', 'storniert') and a.anlass_datum > now() - interval '2 days'
        union all
        select 'termin', t.bestaetigt_start, t.zweck, a.id, a.nummer, k.name, null, t.zweck
          from termin t join auftrag a on a.id = t.auftrag_id join kontakt k on k.id = a.kontakt_id
          where t.status = 'bestaetigt' and t.bestaetigt_start > now() - interval '1 day'
      ) e where am < now() + interval '70 days' order by am limit 300`)
      : [];

  const spalten = AUFTRAG_SCHRITTE.filter((s) => s.key !== 'abgeschlossen');
  const offenSumme = karten.reduce((a, k) => a + k.total_rp, 0);
  const ZWECK: Record<string, string> = { massnehmen: 'Massnehmen', anprobe: 'Anprobe', abholung: 'Abholung', beratung: 'Beratung', telefon: 'Telefontermin' };

  // Zeitstrahl: Gruppen nach Woche
  const gruppen = new Map<string, Ereignis[]>();
  for (const e of ereignisse) {
    const d = new Date(e.am);
    const t = tageBis(d);
    const key = t < 0 && e.art === 'task' ? '0|Überfällig' : t <= 6 - ((new Date().getDay() + 6) % 7) ? '1|Diese Woche' : t <= 13 - ((new Date().getDay() + 6) % 7) ? '2|Nächste Woche' : `3|${d.toLocaleDateString('de-CH', { month: 'long', year: 'numeric', timeZone: 'Europe/Zurich' })}`;
    gruppen.set(key, [...(gruppen.get(key) ?? []), e]);
  }

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Atelier</span>
          <h1>Aufträge</h1>
          <p className="a-sub">
            {ansicht === 'archiv' ? (
              <>
                <span className="zahl">{karten.length}</span> abgeschlossene oder stornierte Aufträge
              </>
            ) : (
              <>
                <span className="zahl">{karten.length}</span> in Arbeit · Volumen <span className="zahl">{chfKurz(offenSumme)}</span> · Planung mit Aufgaben, Liefertermin und Anprobe
              </>
            )}
          </p>
        </div>
        <div className="a-segment" role="navigation" aria-label="Ansicht">
          <Link href="/admin/auftraege/" aria-pressed={ansicht === 'board'}>
            <Icon name="kanban" /> Board
          </Link>
          <Link href="/admin/auftraege/?ansicht=zeitstrahl" aria-pressed={ansicht === 'zeitstrahl'}>
            <Icon name="zeitstrahl" /> Zeitstrahl
          </Link>
          <Link href="/admin/auftraege/?ansicht=archiv" aria-pressed={ansicht === 'archiv'}>
            <Icon name="task" /> Archiv
          </Link>
        </div>
      </div>

      {ansicht === 'board' && (
        <div className="a-board breit">
          {spalten.map((s) => {
            const liste = karten.filter((k) => k.status === s.key);
            return (
              <section key={s.key} className={`a-spalte au-${s.key}`}>
                <header>
                  <div>
                    <b>{s.label}</b>
                    <small>{s.text}</small>
                  </div>
                  <span className="zahl">{liste.length}</span>
                </header>
                <div className="a-spalte-karten">
                  {liste.length === 0 && <p className="a-spalte-leer">—</p>}
                  {liste.map((k) => {
                    const spaet = k.naechste_am ? tageBis(new Date(k.naechste_am)) < 0 : false;
                    const knapp = k.anlass_datum && k.liefertermin && tageBis(new Date(k.anlass_datum)) - tageBis(new Date(k.liefertermin)) < 10;
                    return (
                      <div key={k.id} className={`a-bkarte${spaet ? ' spaet' : ''}`}>
                        <Link href={`/admin/auftraege/${k.id}/`} className="a-bkarte-link">
                        <div className="a-bkarte-kopf ohne-avatar">
                          <span>
                            <small className="zahl">{k.nummer}</small>
                            <b>{k.name}</b>
                            <small>{k.titel || 'Auftrag'}</small>
                          </span>
                        </div>
                        <div className="a-bkarte-info">
                          {k.anlass_datum && (
                            <span className={knapp ? 'warn' : ''}>
                              <Icon name="kalender" /> {k.anlass || 'Anlass'} {tagKurz(new Date(k.anlass_datum))}
                            </span>
                          )}
                          {k.liefertermin && (
                            <span>
                              <Icon name="auftrag" /> Lieferung {tagKurz(new Date(k.liefertermin))}
                            </span>
                          )}
                          {k.naechste && (
                            <span className={spaet ? 'warn' : ''}>
                              <Icon name="task" /> {k.naechste}
                              {k.naechste_am ? ` · ${faelligText(new Date(k.naechste_am))}` : ''}
                            </span>
                          )}
                        </div>
                        {k.alle > 0 && (
                          <div className="a-mini-fortschritt" aria-label={`${k.alle - k.offen} von ${k.alle} Aufgaben erledigt`}>
                            <i style={{ width: `${((k.alle - k.offen) / k.alle) * 100}%` }} />
                          </div>
                        )}
                        </Link>
                        <div className="a-bkarte-fuss">
                          <b className="zahl">{chfKurz(k.total_rp)}</b>
                          <StatusWeiter id={k.id} status={k.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {ansicht === 'zeitstrahl' && (
        <div className="a-zeitstrahl">
          {ereignisse.length === 0 && (
            <div className="a-karte a-leer">
              <Icon name="zeitstrahl" />
              <h3>Nichts geplant</h3>
              <p>Aufgaben mit Fälligkeit, Liefertermine, Anproben und Anlässe erscheinen hier chronologisch.</p>
            </div>
          )}
          {[...gruppen.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, liste]) => (
              <section key={key} className={`a-zs-gruppe${key.startsWith('0') ? ' spaet' : ''}`}>
                <h2>{key.split('|')[1]}</h2>
                <ol>
                  {liste.map((e, i) => {
                    const d = new Date(e.am);
                    return (
                      <li key={`${e.auftrag_id}-${e.art}-${e.task_id ?? i}`} className={`zs-${e.art}`}>
                        <time className="zahl">{e.art === 'termin' ? terminKurz(d) : tagKurz(d)}</time>
                        <span className="zs-punkt" aria-hidden="true" />
                        {e.art === 'task' && e.task_id ? <TaskHaken auftragId={e.auftrag_id} taskId={e.task_id} erledigt={false} /> : <span className="zs-icon"><Icon name={e.art === 'lieferung' ? 'auftrag' : e.art === 'anlass' ? 'kalender' : 'schere'} /></span>}
                        <Link href={`/admin/auftraege/${e.auftrag_id}/`} className="zs-text">
                          <b>{e.art === 'termin' ? ZWECK[e.zweck ?? ''] ?? 'Termin' : e.titel}</b>
                          <small>
                            {e.nummer} · {e.name}
                            {e.art === 'task' && tageBis(d) < 0 ? ` · ${faelligText(d)}` : ''}
                          </small>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
        </div>
      )}

      {ansicht === 'archiv' && (
        <div className="a-karte">
          {karten.length === 0 ? (
            <div className="a-leer">
              <Icon name="task" />
              <h3>Noch nichts abgeschlossen</h3>
              <p>Ein Auftrag schliesst automatisch ab, wenn er abgeholt und vollständig bezahlt ist.</p>
            </div>
          ) : (
            <div className="a-tabelle" role="table">
              <div className="a-tabelle-kopf beleg" role="row">
                <span>Nr.</span>
                <span>Kunde · Titel</span>
                <span>Status</span>
                <span className="r">Total</span>
                <span className="r">Abgeschlossen</span>
              </div>
              {karten.map((k) => (
                <Link key={k.id} href={`/admin/auftraege/${k.id}/`} className="a-tabelle-zeile beleg" role="row">
                  <span className="zahl a-beleg-nr">{k.nummer}</span>
                  <span className="a-tz-kunde">
                    <span>
                      <b>{k.name}</b>
                      <small>{k.titel}</small>
                    </span>
                  </span>
                  <span>
                    <span className={`a-pill au-${k.status}`}>{AUFTRAG_LABEL[k.status]}</span>
                  </span>
                  <span className="r zahl">{chf(k.total_rp)}</span>
                  <span className="r">{tagDatum(k.abgeschlossen_am ? new Date(k.abgeschlossen_am) : null) || '–'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
