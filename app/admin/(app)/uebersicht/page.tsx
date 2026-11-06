import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { brauchtAdmin } from '@/lib/admin/zugang';
import Icon from '@/components/admin/Icon';
import TaskHaken from '@/components/admin/TaskHaken';
import { NeuBelegKnopf } from '@/components/admin/NeuBeleg';
import { chf, chfKurz } from '@/lib/crm/geld';
import { AUFTRAG_SCHRITTE, LEAD_PHASEN } from '@/lib/crm/belege';
import { faelligText, tageBis, tagKurz, terminKurz, TZ } from '@/lib/zeit';

export const metadata: Metadata = { title: 'Übersicht' };
export const dynamic = 'force-dynamic';

const tz = sql.raw(`'${TZ}'`);

export default async function Uebersicht() {
  const s = await brauchtAdmin();
  const [[k], termine, tasks, auftragStatus, rechnungen, lieferungen, monate, pipeline] = await Promise.all([
    db().execute<{
      anfragen: number;
      angebote_n: number;
      angebote_rp: number;
      auftraege: number;
      offen_rp: number;
      ueber_rp: number;
      ueber_n: number;
      monat_rp: number;
      jahr_rp: number;
      vorjahr_rp: number;
      kunden: number;
    }>(sql`select
      (select count(*)::int from termin where status = 'angefragt') as anfragen,
      (select count(*)::int from angebot where status = 'gesendet') as angebote_n,
      (select coalesce(sum(total_rp), 0)::int from angebot where status = 'gesendet') as angebote_rp,
      (select count(*)::int from auftrag where status not in ('abgeholt', 'abgeschlossen', 'storniert')) as auftraege,
      (select coalesce(sum(betrag_rp - bezahlt_rp), 0)::int from rechnung where status in ('offen', 'teilbezahlt')) as offen_rp,
      (select coalesce(sum(betrag_rp - bezahlt_rp), 0)::int from rechnung where status in ('offen', 'teilbezahlt') and faellig_am < now() - interval '1 day') as ueber_rp,
      (select count(*)::int from rechnung where status in ('offen', 'teilbezahlt') and faellig_am < now() - interval '1 day') as ueber_n,
      (select coalesce(sum(betrag_rp), 0)::int from zahlung where date_trunc('month', datum at time zone ${tz}) = date_trunc('month', now() at time zone ${tz})) as monat_rp,
      (select coalesce(sum(betrag_rp), 0)::int from zahlung where date_trunc('year', datum at time zone ${tz}) = date_trunc('year', now() at time zone ${tz})) as jahr_rp,
      (select coalesce(sum(betrag_rp), 0)::int from zahlung where date_trunc('year', datum at time zone ${tz}) = date_trunc('year', now() at time zone ${tz}) - interval '1 year'
         and (datum at time zone ${tz}) <= (now() at time zone ${tz}) - interval '1 year') as vorjahr_rp,
      (select count(*)::int from kontakt where status = 'kunde' and zusammengefuehrt_in is null) as kunden`),
    db().execute<{ id: string; start: Date; status: string; zweck: string; name: string; kontakt_id: string }>(sql`
      select t.id, coalesce(t.bestaetigt_start, t.wunsch_start) as start, t.status, t.zweck, k.name, k.id as kontakt_id
      from termin t join kontakt k on k.id = t.kontakt_id
      where t.art = 'termin' and t.status in ('angefragt', 'bestaetigt') and coalesce(t.bestaetigt_start, t.wunsch_start) between now() - interval '2 hours' and now() + interval '7 days'
      order by 2 limit 12`),
    db().execute<{ id: string; titel: string; faellig_am: Date | null; auftrag_id: string; nummer: string; name: string; wer: string | null }>(sql`
      select t.id, t.titel, t.faellig_am, a.id as auftrag_id, a.nummer, k.name, coalesce(u.name, split_part(u.email, '@', 1)) as wer
      from auftrag_task t join auftrag a on a.id = t.auftrag_id join kontakt k on k.id = a.kontakt_id left join admin_user u on u.id = t.zustaendig_id
      where t.erledigt_am is null and a.status not in ('abgeschlossen', 'storniert') and t.faellig_am < now() + interval '7 days'
      order by t.faellig_am nulls last limit 12`),
    db().execute<{ status: string; n: number }>(sql`select status, count(*)::int as n from auftrag where status not in ('abgeschlossen', 'storniert') group by 1`),
    db().execute<{ id: string; nummer: string; offen: number; faellig_am: Date; name: string }>(sql`
      select r.id, r.nummer, (r.betrag_rp - r.bezahlt_rp)::int as offen, r.faellig_am, k.name from rechnung r join kontakt k on k.id = r.kontakt_id
      where r.status in ('offen', 'teilbezahlt') order by r.faellig_am limit 6`),
    db().execute<{ id: string; nummer: string; titel: string; liefertermin: Date; name: string; anlass_datum: Date | null }>(sql`
      select a.id, a.nummer, a.titel, a.liefertermin, k.name, a.anlass_datum from auftrag a join kontakt k on k.id = a.kontakt_id
      where a.status in ('bestellt', 'produktion') and a.liefertermin is not null and a.liefertermin < now() + interval '21 days' order by a.liefertermin limit 6`),
    db().execute<{ monat: string; rp: number }>(sql`
      select to_char(date_trunc('month', datum at time zone ${tz}), 'YYYY-MM') as monat, sum(betrag_rp)::int as rp from zahlung
      where datum > now() - interval '12 months' group by 1 order by 1`),
    db().execute<{ phase: string; n: number; rp: number }>(sql`
      select k.lead_phase as phase, count(*)::int as n,
        coalesce(sum(coalesce(k.potenzial_rp, (select max(total_rp) from angebot a where a.kontakt_id = k.id and a.status in ('entwurf', 'gesendet')), 0)), 0)::int as rp
      from kontakt k where k.zusammengefuehrt_in is null and k.status = 'lead' group by 1`),
  ]);

  const schritte = AUFTRAG_SCHRITTE.filter((x) => x.key !== 'abgeschlossen');
  const maxStatus = Math.max(1, ...auftragStatus.map((a) => a.n));
  const jetzt = new Date();
  const zwoelf = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(jetzt.getUTCFullYear(), jetzt.getUTCMonth() - 11 + i, 15));
    const key = d.toISOString().slice(0, 7);
    return { key, label: d.toLocaleDateString('de-CH', { month: 'short', timeZone: 'UTC' }).replace('.', ''), rp: monate.find((m) => m.monat === key)?.rp ?? 0 };
  });
  const maxMonat = Math.max(1, ...zwoelf.map((m) => m.rp));
  const name = (s.user.name ?? '').trim().split(/\s+/)[0] ?? '';
  const stunde = Number(jetzt.toLocaleString('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }));
  const gruss = stunde < 11 ? 'Guten Morgen' : stunde < 18 ? 'Guten Tag' : 'Guten Abend';
  const pipeSumme = pipeline.filter((p) => !['gewonnen', 'verloren'].includes(p.phase)).reduce((a, p) => a + p.rp, 0);

  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">{jetzt.toLocaleDateString('de-CH', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h1>{name ? `${gruss}, ${name}.` : `${gruss}.`}</h1>
          <p className="a-sub">Das Atelier auf einen Blick — Anfragen, Angebote, Aufträge und Zahlungen.</p>
        </div>
        <div className="a-knopfreihe">
          <Link href="/admin/termine/" className="a-knopf linie">
            <Icon name="kalender" /> Anfragen
          </Link>
          <NeuBelegKnopf art="rechnung" linie />
          <NeuBelegKnopf art="angebot" />
        </div>
      </div>

      <div className="a-kpis">
        <Link href="/admin/termine/" className="a-kpi akzent">
          <span className="a-kicker">Neue Anfragen</span>
          <strong className="zahl">{k.anfragen}</strong>
          <span className="delta gleich">{k.anfragen ? 'warten auf Bestätigung' : 'alles beantwortet'}</span>
        </Link>
        <Link href="/admin/angebote/?f=offen" className="a-kpi">
          <span className="a-kicker">Angebote offen</span>
          <strong className="zahl">{chfKurz(k.angebote_rp)}</strong>
          <span className="delta gleich">{k.angebote_n} Angebot{k.angebote_n === 1 ? '' : 'e'} beim Kunden</span>
        </Link>
        <Link href="/admin/auftraege/" className="a-kpi">
          <span className="a-kicker">Aufträge in Arbeit</span>
          <strong className="zahl">{k.auftraege}</strong>
          <span className="delta gleich">{tasks.length} Aufgaben fällig</span>
        </Link>
        <Link href="/admin/rechnungen/?f=offen" className="a-kpi">
          <span className="a-kicker">Offene Rechnungen</span>
          <strong className="zahl">{chfKurz(k.offen_rp)}</strong>
          <span className={`delta ${k.ueber_n ? 'ab' : 'gleich'}`}>{k.ueber_n ? `${chfKurz(k.ueber_rp)} überfällig` : 'nichts überfällig'}</span>
        </Link>
        <div className="a-kpi">
          <span className="a-kicker">Umsatz {jetzt.toLocaleDateString('de-CH', { month: 'long', timeZone: TZ })}</span>
          <strong className="zahl">{chfKurz(k.monat_rp)}</strong>
          <span className="delta gleich">Zahlungseingänge</span>
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Umsatz {jetzt.toLocaleDateString('de-CH', { year: 'numeric', timeZone: TZ })}</span>
          <strong className="zahl">{chfKurz(k.jahr_rp)}</strong>
          <span className={`delta ${k.vorjahr_rp ? (k.jahr_rp >= k.vorjahr_rp ? 'auf' : 'ab') : 'gleich'}`}>
            {k.vorjahr_rp ? `${k.jahr_rp >= k.vorjahr_rp ? '+' : '−'}${Math.abs(Math.round(((k.jahr_rp - k.vorjahr_rp) / k.vorjahr_rp) * 100))} % zum Vorjahr` : `${k.kunden} Kunden`}
          </span>
        </div>
      </div>

      <div className="a-dash">
        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Nächste Termine</h2>
            <Link href="/admin/termine/?f=bestaetigt" className="a-mehr">
              Alle
            </Link>
          </div>
          {termine.length === 0 ? (
            <div className="a-leer klein">
              <Icon name="kalender" />
              <p>In den nächsten 7 Tagen keine Termine.</p>
            </div>
          ) : (
            <ul className="a-agenda">
              {termine.map((t) => {
                const d = new Date(t.start);
                return (
                  <li key={t.id}>
                    <Link href={`/admin/termine/${t.id}/`}>
                      <time className="zahl">{terminKurz(d)}</time>
                      <span>
                        <b>{t.name || 'Ohne Namen'}</b>
                        <small>{{ beratung: 'Beratung', massnehmen: 'Massnehmen', anprobe: 'Anprobe', abholung: 'Abholung' }[t.zweck] ?? 'Termin'}</small>
                      </span>
                      <span className={`a-pill ${t.status}`}>{t.status === 'bestaetigt' ? 'Bestätigt' : 'Wunsch'}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Fällige Aufgaben</h2>
            <Link href="/admin/auftraege/?ansicht=zeitstrahl" className="a-mehr">
              Planung
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="a-leer klein">
              <Icon name="task" />
              <p>Keine fälligen Aufgaben — gut gemacht.</p>
            </div>
          ) : (
            <ul className="a-tasks kompakt">
              {tasks.map((t) => {
                const f = t.faellig_am ? new Date(t.faellig_am) : null;
                const spaet = f ? tageBis(f) < 0 : false;
                return (
                  <li key={t.id}>
                    <TaskHaken auftragId={t.auftrag_id} taskId={t.id} erledigt={false} />
                    <Link href={`/admin/auftraege/${t.auftrag_id}/`} className="a-task-text">
                      <b>{t.titel}</b>
                      <small>
                        {t.nummer} · {t.name}
                        {t.wer ? ` · ${t.wer}` : ''}
                      </small>
                    </Link>
                    {f && <span className={`a-faellig${spaet ? ' spaet' : tageBis(f) === 0 ? ' heute' : ''}`}>{faelligText(f)}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Aufträge nach Status</h2>
            <Link href="/admin/auftraege/" className="a-mehr">
              Board
            </Link>
          </div>
          <div className="a-karte-inhalt">
          <ul className="a-balken">
            {schritte.map((x) => {
              const n = auftragStatus.find((a) => a.status === x.key)?.n ?? 0;
              return (
                <li key={x.key}>
                  <span>{x.label}</span>
                  <b className="zahl">{n}</b>
                  <i style={{ ['--w' as string]: `${(n / maxStatus) * 100}%`, ['--c' as string]: x.key === 'fertig' ? 'var(--a-ok)' : 'var(--a-ink)' }} />
                </li>
              );
            })}
          </ul>
          </div>
        </section>

        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Lead-Pipeline</h2>
            <Link href="/admin/leads/" className="a-mehr">
              {chfKurz(pipeSumme)} Potenzial
            </Link>
          </div>
          <ul className="a-pipe-mini a-karte-inhalt">
            {LEAD_PHASEN.filter((p) => p.key !== 'gewonnen').map((p) => {
              const x = pipeline.find((q) => q.phase === p.key);
              return (
                <li key={p.key}>
                  <Link href={`/admin/leads/#${p.key}`}>
                    <span>{p.label}</span>
                    <b className="zahl">{x?.n ?? 0}</b>
                    <small className="zahl">{x?.rp ? chfKurz(x.rp) : '–'}</small>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Offene Rechnungen</h2>
            <Link href="/admin/rechnungen/?f=offen" className="a-mehr">
              Alle
            </Link>
          </div>
          {rechnungen.length === 0 ? (
            <div className="a-leer klein">
              <Icon name="rechnung" />
              <p>Alles bezahlt.</p>
            </div>
          ) : (
            <ul className="a-agenda">
              {rechnungen.map((r) => {
                const f = new Date(r.faellig_am);
                const spaet = tageBis(f) < -1;
                return (
                  <li key={r.id}>
                    <Link href={`/admin/rechnungen/${r.id}/`}>
                      <time className="zahl">{r.nummer}</time>
                      <span>
                        <b>{r.name}</b>
                        <small className={spaet ? 'rot' : ''}>{spaet ? `überfällig ${faelligText(f)}` : `fällig ${tagKurz(f)}`}</small>
                      </span>
                      <b className="zahl">{chf(r.offen)}</b>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Erwartete Lieferungen</h2>
          </div>
          {lieferungen.length === 0 ? (
            <div className="a-leer klein">
              <Icon name="auftrag" />
              <p>Keine Lieferung in den nächsten 3 Wochen eingetragen.</p>
            </div>
          ) : (
            <ul className="a-agenda">
              {lieferungen.map((l) => {
                const d = new Date(l.liefertermin);
                const knapp = l.anlass_datum && tageBis(new Date(l.anlass_datum)) - tageBis(d) < 10;
                return (
                  <li key={l.id}>
                    <Link href={`/admin/auftraege/${l.id}/`}>
                      <time className="zahl">{tagKurz(d)}</time>
                      <span>
                        <b>{l.name}</b>
                        <small className={knapp ? 'rot' : ''}>
                          {l.nummer} · {l.titel || 'Auftrag'}
                          {knapp ? ' · knapp vor dem Anlass' : ''}
                        </small>
                      </span>
                      <span className="a-faellig">{faelligText(d)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="a-karte" style={{ marginTop: 18 }}>
        <div className="a-karte-kopf">
          <h2>Zahlungseingänge · 12 Monate</h2>
          <span className="a-sub zahl" style={{ margin: 0 }}>
            {chf(zwoelf.reduce((a, m) => a + m.rp, 0))}
          </span>
        </div>
        <div className="a-karte-inhalt">
          <div className="a-monate" role="img" aria-label="Zahlungseingänge pro Monat">
            {zwoelf.map((m) => (
              <div key={m.key} title={`${m.label}: ${chf(m.rp)}`}>
                <span className="wert zahl">{m.rp ? chfKurz(m.rp).replace('CHF ', '') : ''}</span>
                <i style={{ height: `${Math.max(2, (m.rp / maxMonat) * 100)}%` }} className={m.key === zwoelf[11].key ? 'jetzt' : ''} />
                <small>{m.label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
