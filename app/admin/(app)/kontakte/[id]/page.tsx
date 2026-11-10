import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { and, desc, eq, gte, isNotNull, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import Icon from '@/components/admin/Icon';
import { NeuBelegKnopf } from '@/components/admin/NeuBeleg';
import KontaktPanel from '@/components/admin/KontaktPanel';
import KontaktSchnell, { AngebotNeuKnopf } from '@/components/admin/KontaktSchnell';
import LeadStatus from '@/components/admin/LeadStatus';
import AnfrageInline from '@/components/admin/AnfrageInline';
import { Avatar, StilAuswahl, Verlauf } from '@/components/admin/Bausteine';
import { STATUS_LABEL } from '@/lib/crm/status';
import { ANGEBOT_STATUS, AUFTRAG_LABEL, AUFTRAG_SCHRITTE, KONTAKT_STATUS, LEAD_LABEL, RECHNUNG_ART, RECHNUNG_STATUS, angebotAnzeigeStatus, rechnungAnzeigeStatus, schrittIndex } from '@/lib/crm/belege';
import { chf, chfKurz } from '@/lib/crm/geld';
import { FELD, MASS_BEREICHE, massText } from '@/lib/crm/massblatt';
import { telAnzeige } from '@/lib/crm/telefon';
import { mailBereit } from '@/lib/mail';
import { faelligText, tagDatum, terminKurz, terminLang } from '@/lib/zeit';
import { UUID } from '@/lib/admin/zugang';
import { mahnungenVon } from '@/lib/crm/mahnung';
import { QUELLE_RATGEBER, quelleLabel } from '@/lib/crm/quelle';

export const metadata: Metadata = { title: 'Kundenakte' };
export const dynamic = 'force-dynamic';

const ZWECK: Record<string, string> = { beratung: 'Beratung', massnehmen: 'Massnehmen', anprobe: 'Anprobe', abholung: 'Abholung' };
const KERN = ['sakko.brust', 'sakko.taille', 'sakko.schulter', 'sakko.aermel_li', 'hose.bund', 'hose.schritt', 'hemd.hals', 'allgemein.koerpergroesse'];

export default async function KontaktDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, id)).limit(1);
  if (!k) notFound();
  if (k.zusammengefuehrtIn) redirect(`/admin/kontakte/${k.zusammengefuehrtIn}/`);

  const [termine, verlauf, angebote, auftraege, rechnungen, massblaetter, belegt, [summen]] = await Promise.all([
    db().select().from(schema.termin).where(eq(schema.termin.kontaktId, id)).orderBy(desc(schema.termin.erstelltAm)),
    db().select().from(schema.aktivitaet).where(eq(schema.aktivitaet.kontaktId, id)).orderBy(desc(schema.aktivitaet.erstelltAm)).limit(150),
    db().select().from(schema.angebot).where(eq(schema.angebot.kontaktId, id)).orderBy(desc(schema.angebot.erstelltAm)),
    db()
      .select({
        a: schema.auftrag,
        offen: sql<number>`(select count(*)::int from auftrag_task t where t.auftrag_id = ${schema.auftrag.id} and t.erledigt_am is null)`,
        alle: sql<number>`(select count(*)::int from auftrag_task t where t.auftrag_id = ${schema.auftrag.id})`,
      })
      .from(schema.auftrag)
      .where(eq(schema.auftrag.kontaktId, id))
      .orderBy(desc(schema.auftrag.erstelltAm)),
    db().select().from(schema.rechnung).where(eq(schema.rechnung.kontaktId, id)).orderBy(desc(schema.rechnung.erstelltAm)),
    db().select().from(schema.massblatt).where(eq(schema.massblatt.kontaktId, id)).orderBy(desc(schema.massblatt.version)),
    db()
      .select({ start: schema.termin.bestaetigtStart })
      .from(schema.termin)
      .where(and(eq(schema.termin.status, 'bestaetigt'), isNotNull(schema.termin.bestaetigtStart), gte(schema.termin.bestaetigtStart, new Date(Date.now() - 86400_000)))),
    db().execute<{ umsatz: number }>(sql`select coalesce(sum(z.betrag_rp), 0)::int as umsatz from zahlung z join rechnung r on r.id = z.rechnung_id where r.kontakt_id = ${id}`),
  ]);

  const kanal = { id: k.id, name: k.name, telefon: k.telefon, email: k.email, whatsappOk: Boolean(k.einwilligungWhatsapp), smsOk: Boolean(k.einwilligungSms), abgemeldet: Boolean(k.abgemeldet) };
  const offenRp = rechnungen.filter((r) => r.status === 'offen' || r.status === 'teilbezahlt').reduce((a, r) => a + r.betragRp + r.mahngebuehrenRp - r.bezahltRp, 0);
  const mahnungen = await mahnungenVon(rechnungen.map((r) => r.id));
  const laufend = auftraege.filter((x) => !['abgeschlossen', 'storniert'].includes(x.a.status));
  const angeboteOffen = angebote.filter((a) => a.status === 'gesendet' || a.status === 'entwurf');
  const offeneAnfragen = termine.filter((t) => ['angefragt', 'vorgeschlagen'].includes(t.status) && t.zweck === 'beratung');
  const kommend = termine.filter((t) => t.status === 'bestaetigt' && t.bestaetigtStart && t.bestaetigtStart.getTime() > Date.now() - 3600_000);
  const fruehere = termine.filter((t) => !offeneAnfragen.includes(t) && !kommend.includes(t));
  const mb = massblaetter[0];
  const belegtIso = belegt.map((b) => b.start!.toISOString());

  return (
    <>
      <Link href={k.status === 'kunde' ? '/admin/kunden/' : k.status === 'lead' ? '/admin/leads/' : '/admin/kontakte/'} className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> {k.status === 'kunde' ? 'Alle Kunden' : k.status === 'lead' ? 'Leads' : 'Kontakte'}
      </Link>

      <div className="a-akte-kopf">
        <Avatar name={k.name || k.email || '?'} brandDomain={k.brandDomain} gross />
        <div style={{ minWidth: 0 }}>
          <span className="a-kicker">{k.firma ? k.firma : k.status === 'kunde' ? 'Kunde' : 'Kontakt'}</span>
          <h1>{[k.anrede, k.name || k.email || (k.telefon ? telAnzeige(k.telefon) : 'Ohne Namen')].filter(Boolean).join(' ')}</h1>
          <p className="a-sub">
            <span className={`a-pill k-${k.status}`}>{KONTAKT_STATUS[k.status]}</span>
            {k.status === 'lead' && <span className={`a-pill ohne p-${k.leadPhase}`}>{LEAD_LABEL[k.leadPhase]}</span>}
            {k.quelle === QUELLE_RATGEBER && <span className="a-pill ratgeber">Ratgeber-Lead</span>}
            <span>
              {k.status === 'kunde' && k.kundeSeit ? `Kunde seit ${tagDatum(k.kundeSeit)}` : `Seit ${tagDatum(k.erstelltAm)}`} · Quelle {quelleLabel(k.quelle)}
              {k.abgemeldet ? ' · abgemeldet' : ''}
            </span>
          </p>
        </div>
        <div className="a-knopfreihe a-akte-neu">
          <NeuBelegKnopf art="angebot" kontaktId={k.id} />
          <NeuBelegKnopf art="rechnung" kontaktId={k.id} linie />
        </div>
      </div>

      <KontaktSchnell k={kanal} belegt={belegtIso} mailBereit={mailBereit()} />

      <div className="a-kpis klein">
        <div className="a-kpi">
          <span className="a-kicker">Umsatz bezahlt</span>
          <strong className="zahl">{chfKurz(summen.umsatz)}</strong>
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Offen</span>
          <strong className={`zahl${offenRp ? ' warn' : ''}`}>{chfKurz(offenRp)}</strong>
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Aufträge laufend</span>
          <strong className="zahl">{laufend.length}</strong>
        </div>
        <div className="a-kpi">
          <span className="a-kicker">Angebote offen</span>
          <strong className="zahl">{angeboteOffen.length ? chfKurz(angeboteOffen.reduce((a, x) => a + x.totalRp, 0)) : '–'}</strong>
        </div>
      </div>

      <div className="a-akte">
        <div className="a-akte-haupt">
          {/* Anfragen & Termine */}
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Anfragen &amp; Termine</h2>
              <span className="a-sub zahl" style={{ margin: 0 }}>
                {termine.length}
              </span>
            </div>
            {termine.length === 0 && <div className="a-leer klein"><Icon name="kalender" /><p>Noch keine Anfrage — Termin über «Termin» oben eintragen.</p></div>}
            {offeneAnfragen.map((t) => (
              <div key={t.id} className="a-anfrage">
                <div className="a-anfrage-kopf">
                  <div>
                    <span className="a-kicker">{t.art === 'rueckruf' ? 'Rückrufbitte' : 'Terminanfrage'} · Eingang {tagDatum(t.erstelltAm)}</span>
                    <strong>{t.wunschStart ? terminLang(t.wunschStart) : t.wunschText || 'nach Absprache'}</strong>
                    {t.status === 'vorgeschlagen' && t.vorschlaege.length > 0 && <small>Vorgeschlagen: {t.vorschlaege.map((v) => terminKurz(new Date(v))).join(' · ')}</small>}
                  </div>
                  <span className={`a-pill ${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </div>
                {(t.stil.length > 0 || t.stoffe.length > 0) && (
                  <details className="a-stil-aufklapp">
                    <summary>
                      Stil-Auswahl aus dem Konfigurator · {t.stil.length} Details{t.stoffe.length ? ` · Stoff ${t.stoffe.join(', ')}` : ''}
                    </summary>
                    <StilAuswahl stil={t.stil} stoffe={t.stoffe} />
                  </details>
                )}
                <div className="a-knopfreihe" style={{ alignItems: 'flex-start' }}>
                  <AnfrageInline
                    terminId={t.id}
                    art={t.art}
                    status={t.status}
                    wunschStart={t.wunschStart?.toISOString() ?? null}
                    bestaetigtStart={t.bestaetigtStart?.toISOString() ?? null}
                    vorschlaege={t.vorschlaege}
                    belegt={belegtIso.filter((b) => b !== t.bestaetigtStart?.toISOString())}
                    eingangOffen={!t.eingangMailAm}
                    mailBereit={mailBereit()}
                    k={kanal}
                  />
                  <Link href={`/admin/termine/${t.id}/`} className="a-knopf leise klein">
                    Details
                  </Link>
                  {t.stil.length > 0 && <AngebotNeuKnopf kontaktId={k.id} terminId={t.id} klasse="a-knopf linie klein" text="Angebot mit Stil" />}
                </div>
              </div>
            ))}
            {(kommend.length > 0 || fruehere.length > 0) && (
              <div className="a-liste">
                {[...kommend, ...fruehere].map((t) => {
                  const start = t.bestaetigtStart ?? t.wunschStart;
                  return (
                    <Link key={t.id} href={`/admin/termine/${t.id}/`} className="a-zeile" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                      <span style={{ minWidth: 0 }}>
                        <span className="a-zeile-titel" style={{ display: 'block' }}>
                          {t.art === 'rueckruf' ? 'Rückruf' : ZWECK[t.zweck]} · {start ? terminKurz(start) : t.wunschText || 'nach Absprache'}
                        </span>
                        <span className="a-zeile-sub" style={{ display: 'block' }}>
                          Eingang {tagDatum(t.erstelltAm)}
                          {t.stil.length ? ` · Stil ${t.stil.length}` : ''}
                          {t.erinnerungGesendetAm ? ' · Erinnerung gesendet' : ''}
                        </span>
                      </span>
                      <span className={`a-pill ${t.status}`}>{STATUS_LABEL[t.status]}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Angebote */}
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Angebote</h2>
              <NeuBelegKnopf art="angebot" kontaktId={k.id} klein linie label="Neu" />
            </div>
            {angebote.length === 0 ? (
              <div className="a-leer klein"><Icon name="dokument" /><p>Noch kein Angebot.</p></div>
            ) : (
              <div className="a-liste">
                {angebote.map((a) => {
                  const st = angebotAnzeigeStatus(a);
                  return (
                    <Link key={a.id} href={`/admin/angebote/${a.id}/`} className="a-zeile a-zeile-beleg">
                      <span className="a-beleg-nr zahl">{a.nummer}</span>
                      <span style={{ minWidth: 0 }}>
                        <span className="a-zeile-titel" style={{ display: 'block' }}>{a.titel || 'Angebot'}</span>
                        <span className="a-zeile-sub" style={{ display: 'block' }}>
                          {tagDatum(a.erstelltAm)}
                          {a.angesehenAm && a.status === 'gesendet' ? ' · vom Kunden angesehen' : ''}
                          {a.angenommenAm ? ` · angenommen ${tagDatum(a.angenommenAm)}` : ''}
                        </span>
                      </span>
                      <span className="a-zeile-rechts">
                        <b className="zahl">{chf(a.totalRp)}</b>
                        <span className={`a-pill an-${st}`}>{ANGEBOT_STATUS[st]}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Aufträge */}
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Aufträge</h2>
              <span className="a-sub zahl" style={{ margin: 0 }}>{auftraege.length}</span>
            </div>
            {auftraege.length === 0 ? (
              <div className="a-leer klein"><Icon name="auftrag" /><p>Aufträge entstehen, sobald ein Angebot angenommen wird.</p></div>
            ) : (
              <div className="a-liste">
                {auftraege.map(({ a, offen, alle }) => {
                  const i = schrittIndex(a.status);
                  return (
                    <Link key={a.id} href={`/admin/auftraege/${a.id}/`} className="a-zeile a-zeile-beleg">
                      <span className="a-beleg-nr zahl">{a.nummer}</span>
                      <span style={{ minWidth: 0 }}>
                        <span className="a-zeile-titel" style={{ display: 'block' }}>{a.titel || 'Auftrag'}</span>
                        <span className="a-fortschritt" aria-label={`Schritt ${i + 1} von ${AUFTRAG_SCHRITTE.length}`}>
                          {AUFTRAG_SCHRITTE.map((s, j) => (
                            <i key={s.key} className={j <= i && a.status !== 'storniert' ? 'an' : ''} />
                          ))}
                        </span>
                        <span className="a-zeile-sub" style={{ display: 'block' }}>
                          {a.liefertermin ? `Liefertermin ${tagDatum(a.liefertermin)} · ` : ''}
                          {a.anlassDatum ? `${a.anlass || 'Anlass'} ${tagDatum(a.anlassDatum)} · ` : ''}
                          {alle ? `${alle - offen}/${alle} Aufgaben` : ''}
                        </span>
                      </span>
                      <span className="a-zeile-rechts">
                        <b className="zahl">{chf(a.totalRp)}</b>
                        <span className={`a-pill au-${a.status}`}>{AUFTRAG_LABEL[a.status]}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Rechnungen */}
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Rechnungen</h2>
              {offenRp > 0 && <span className="a-pill ueberfaellig ohne">{chf(offenRp)} offen</span>}
            </div>
            {rechnungen.length === 0 ? (
              <div className="a-leer klein"><Icon name="rechnung" /><p>Noch keine Rechnung.</p></div>
            ) : (
              <div className="a-liste">
                {rechnungen.map((r) => {
                  const st = rechnungAnzeigeStatus(r);
                  return (
                    <Link key={r.id} href={`/admin/rechnungen/${r.id}/`} className="a-zeile a-zeile-beleg">
                      <span className="a-beleg-nr zahl">{r.nummer}</span>
                      <span style={{ minWidth: 0 }}>
                        <span className="a-zeile-titel" style={{ display: 'block' }}>{RECHNUNG_ART[r.art]}{r.titel ? ` · ${r.titel}` : ''}</span>
                        <span className="a-zeile-sub" style={{ display: 'block' }}>
                          {tagDatum(r.rechnungsdatum ?? r.erstelltAm)}
                          {r.faelligAm && (st === 'offen' || st === 'teilbezahlt' || st === 'ueberfaellig') ? ` · fällig ${faelligText(r.faelligAm)}` : ''}
                          {r.bezahltAm ? ` · bezahlt ${tagDatum(r.bezahltAm)}` : ''}
                        </span>
                      </span>
                      <span className="a-zeile-rechts">
                        <b className="zahl">{chf(r.betragRp)}</b>
                        <span className={`a-pill re-${st}`}>{RECHNUNG_STATUS[st]}</span>
                        {r.mahnstufe > 0 && r.status !== 'bezahlt' && <span className="a-pill re-ueberfaellig">{['', 'Erinnerung', '1. Mahnung', '2. Mahnung'][r.mahnstufe]}</span>}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
            {mahnungen.length > 0 && (
              <div className="a-karte-inhalt">
                <span className="a-kicker">Mahnungen</span>
                {mahnungen.map((m) => (
                  <a key={m.id} href={`/api/admin/mahnungen/${m.id}/pdf/`} target="_blank" rel="noopener" className="a-gewaehlt-zeile">
                    <Icon name="pdf" width={16} height={16} />
                    <span>
                      <strong>{m.bezeichnung}</strong> <span className="zahl">{m.nummer}</span> · Rechnung {rechnungen.find((r) => r.id === m.rechnungId)?.nummer} · {tagDatum(new Date(m.datum))} · <span className="zahl">{chf(m.offenRp)}</span>
                      {m.versendetAm ? ' · per E-Mail' : ''}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Massblätter */}
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Massblatt</h2>
              <div className="a-knopfreihe">
                {mb && (
                  <a href={`/api/admin/massblaetter/${mb.id}/pdf/`} target="_blank" rel="noopener" className="a-knopf leise klein">
                    <Icon name="pdf" /> PDF
                  </a>
                )}
                <Link href={`/admin/massblaetter/neu/?kontakt=${k.id}`} className="a-knopf leise klein">
                  <Icon name="plus" /> {mb ? 'Neu messen' : 'Erfassen'}
                </Link>
              </div>
            </div>
            {!mb ? (
              <div className="a-leer klein"><Icon name="mass" /><p>Noch keine Masse erfasst.</p></div>
            ) : (
              <div className="a-karte-inhalt">
                <Link href={`/admin/massblaetter/${mb.id}/`} className="a-mass-kurz">
                  {KERN.filter((f) => mb.masse[f] !== undefined).map((f) => (
                    <span key={f}>
                      <small>{MASS_BEREICHE.find((b) => f.startsWith(`${b.key}.`))?.titel} · {FELD[f].label}</small>
                      <b className="zahl">{massText(mb.masse[f], FELD[f].einheit)}</b>
                    </span>
                  ))}
                </Link>
                {mb.koerper.length > 0 && (
                  <div className="a-chips" style={{ marginTop: 12 }}>
                    {mb.koerper.map((x) => (
                      <span key={x} className="a-chip klein statisch">{x}</span>
                    ))}
                  </div>
                )}
                <div className="a-versionen">
                  {massblaetter.map((m) => (
                    <Link key={m.id} href={`/admin/massblaetter/${m.id}/`} className="a-chip klein" aria-current={m.id === mb.id ? 'page' : undefined}>
                      V{m.version} · {tagDatum(m.gemessenAm)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Verlauf</h2>
              <span className="a-sub zahl" style={{ margin: 0 }}>{verlauf.length}</span>
            </div>
            <div className="a-karte-inhalt">
              <Verlauf eintraege={verlauf} />
            </div>
          </section>
        </div>

        <aside className="a-akte-seite">
          <LeadStatus id={k.id} status={k.status} phase={k.leadPhase} grund={k.verlorenGrund} potenzialRp={k.potenzialRp} />
          <div className="a-karte">
            <div className="a-karte-kopf">
              <h2>Kontakt</h2>
            </div>
            <div className="a-karte-inhalt">
              <dl className="a-daten">
                <dt>Telefon</dt>
                <dd>{k.telefon ? <a href={`tel:${k.telefon}`}>{telAnzeige(k.telefon)}</a> : '–'}</dd>
                <dt>E-Mail</dt>
                <dd>{k.email ? <a href={`mailto:${k.email}`}>{k.email}</a> : '–'}</dd>
                <dt>Adresse</dt>
                <dd>{k.strasse || k.ort ? [k.strasse, [k.plz, k.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ') : <span className="a-sub">fehlt (für den QR-Zahlteil)</span>}</dd>
                <dt>Firma</dt>
                <dd>
                  {k.firma || '–'}
                  {k.brandDomain ? ` · ${k.brandDomain}` : ''}
                </dd>
                <dt>Sprache</dt>
                <dd>{k.sprache.toUpperCase()}</dd>
                <dt>WhatsApp</dt>
                <dd>{k.einwilligungWhatsapp ? `Erlaubt seit ${tagDatum(k.einwilligungWhatsapp)}` : 'Keine Einwilligung'}</dd>
                <dt>SMS</dt>
                <dd>{k.einwilligungSms ? `Erlaubt seit ${tagDatum(k.einwilligungSms)}` : 'Keine Einwilligung'}</dd>
                {k.notiz && (
                  <>
                    <dt>Notiz</dt>
                    <dd style={{ whiteSpace: 'pre-line', fontWeight: 400 }}>{k.notiz}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
          <KontaktPanel
            k={kanal}
            daten={{ name: k.name, email: k.email ?? '', telefon: k.telefon ?? '', firma: k.firma ?? '', brandDomain: k.brandDomain ?? '', notiz: k.notiz ?? '', anrede: k.anrede ?? '', strasse: k.strasse ?? '', plz: k.plz ?? '', ort: k.ort ?? '' }}
            whatsapp={Boolean(k.einwilligungWhatsapp)}
            sms={Boolean(k.einwilligungSms)}
            abgemeldet={Boolean(k.abgemeldet)}
          />
        </aside>
      </div>
    </>
  );
}

