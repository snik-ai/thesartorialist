'use client';
// Auftrag: Statuskette, Planung (Liefertermin, Anlass, Abholung, Zuständig), Termine (Anprobe …), Aufgaben, Rechnungen.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import Auswahl from './Auswahl';
import DatumPicker from './DatumPicker';
import SlotPicker, { type Belegt } from './SlotPicker';
import { MeldungZeile, useAktion } from './useAktion';
import { AUFTRAG_SCHRITTE, schrittIndex } from '@/lib/crm/belege';
import { chf } from '@/lib/crm/geld';
import { terminLang } from '@/lib/zeit';
import type { AuftragStatus } from '@/lib/db/schema';

type Admin = { id: string; name: string };
const api = (id: string) => `/api/admin/auftraege/${id}/`;

/* ---------- Statuskette ---------- */

export function AuftragSchritte({ id, status, zeiten, liefertermin, emailDa, mailBereit, offeneTasks, vorwahl }: { id: string; status: AuftragStatus; zeiten: Partial<Record<AuftragStatus, string>>; liefertermin: string | null; emailDa: boolean; mailBereit: boolean; offeneTasks: Record<string, number>; vorwahl?: string | null }) {
  const { laedt, meldung, senden } = useAktion();
  const i = schrittIndex(status);
  const [ziel, setZiel] = useState<AuftragStatus | null>(vorwahl && AUFTRAG_SCHRITTE.some((s) => s.key === vorwahl) ? (vorwahl as AuftragStatus) : null);
  const [lt, setLt] = useState<string | null>(liefertermin);
  const [mail, setMail] = useState(emailDa && mailBereit);
  const [anprobe, setAnprobe] = useState<string[]>([]);
  const naechster = AUFTRAG_SCHRITTE[i + 1];
  const storniert = status === 'storniert';

  async function setzen(s: AuftragStatus) {
    const body: Record<string, unknown> = { aktion: 'status', status: s };
    if (s === 'produktion') body.liefertermin = lt;
    if (s === 'fertig') body.mail = mail;
    if (s === 'anprobe' && anprobe[0]) await senden(api(id), { aktion: 'termin', zweck: 'anprobe', start: anprobe[0] }, 'POST', { still: true });
    if (await senden(api(id), body)) setZiel(null);
  }

  const z = ziel ? AUFTRAG_SCHRITTE.find((s) => s.key === ziel)! : null;

  return (
    <section className="a-karte a-schritte-karte">
      <ol className="a-schritte" aria-label="Status des Auftrags">
        {AUFTRAG_SCHRITTE.map((s, j) => {
          const fertig = !storniert && j < i;
          const jetzt = !storniert && j === i;
          return (
            <li key={s.key} className={`${fertig ? 'fertig' : ''}${jetzt ? ' jetzt' : ''}`}>
              <button type="button" onClick={() => (j === i ? null : setZiel(s.key))} disabled={laedt || storniert || j === i} aria-current={jetzt ? 'step' : undefined}>
                <span className="punkt">{fertig ? <Icon name="check" /> : <span className="zahl">{j + 1}</span>}</span>
                <b>{s.kurz}</b>
                <small className="zahl">{zeiten[s.key] ? new Date(zeiten[s.key]!).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', timeZone: 'Europe/Zurich' }) : ''}</small>
                {offeneTasks[s.key] ? <em className="zahl" title="Offene Aufgaben in diesem Schritt">{offeneTasks[s.key]}</em> : null}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="a-karte-inhalt a-schritte-aktion">
        {storniert ? (
          <p className="a-sub">Dieser Auftrag ist storniert.</p>
        ) : !z ? (
          <div className="a-knopfreihe" style={{ alignItems: 'center' }}>
            {naechster && naechster.key !== 'abgeschlossen' && (
              <button type="button" className="a-knopf" disabled={laedt} onClick={() => (['produktion', 'anprobe', 'fertig'].includes(naechster.key) ? setZiel(naechster.key) : setzen(naechster.key))}>
                Weiter: {naechster.label} <Icon name="pfeilRechts" />
              </button>
            )}
            {naechster?.key === 'abgeschlossen' && (
              <button type="button" className="a-knopf gold" disabled={laedt} onClick={() => setzen('abgeschlossen')}>
                <Icon name="check" /> Abschliessen
              </button>
            )}
            <span className="a-sub" style={{ margin: 0 }}>
              {AUFTRAG_SCHRITTE[i]?.text}
            </span>
          </div>
        ) : (
          <div className="a-aktionen">
            <b>{schrittIndex(z.key) < i ? `Zurück zu «${z.label}»?` : z.label}</b>
            {z.key === 'produktion' && <DatumPicker label="Liefertermin der Manufaktur" wert={lt} onChange={setLt} abHeute leer="Liefertermin wählen" schnell={[['+3 Wochen', 21], ['+4 Wochen', 28], ['+6 Wochen', 42]]} />}
            {z.key === 'anprobe' && (
              <>
                <span className="a-sub" style={{ margin: 0 }}>
                  Anprobe-Termin gleich mit eintragen (optional) — der Kunde erhält 2 h vorher eine Erinnerung.
                </span>
                <SlotPicker wert={anprobe} onChange={setAnprobe} />
                {anprobe[0] && <div className="a-hinweis gruen">Anprobe: {terminLang(new Date(anprobe[0]))}</div>}
              </>
            )}
            {z.key === 'fertig' && emailDa && (
              <button type="button" className="a-toggle" aria-pressed={mail} disabled={!mailBereit} onClick={() => setMail(!mail)}>
                <i /> {mailBereit ? 'Kunde per E-Mail informieren: abholbereit' : 'E-Mail-Versand nicht konfiguriert'}
              </button>
            )}
            <div className="a-knopfreihe">
              <button type="button" className="a-knopf" disabled={laedt || (z.key === 'produktion' && !lt)} onClick={() => setzen(z.key)}>
                {z.key === 'produktion' && !lt ? 'Bitte Liefertermin wählen' : 'Bestätigen'}
              </button>
              <button type="button" className="a-knopf linie" onClick={() => setZiel(null)}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
        <MeldungZeile m={meldung} />
      </div>
    </section>
  );
}

/* ---------- Planung ---------- */

export function AuftragPlanung(p: { id: string; liefertermin: string | null; anlass: string; anlassDatum: string | null; abholung: string | null; zustaendigId: string | null; bestellnotiz: string; admins: Admin[]; termine: { id: string; zweck: string; start: string; status: string }[]; belegt: Belegt }) {
  const { laedt, meldung, senden } = useAktion();
  const [anlass, setAnlass] = useState(p.anlass);
  const [notiz, setNotiz] = useState(p.bestellnotiz);
  const [planen, setPlanen] = useState<null | 'anprobe' | 'abholung' | 'massnehmen'>(null);
  const [slot, setSlot] = useState<string[]>([]);
  const patch = (b: Record<string, unknown>) => senden(api(p.id), b, 'PATCH');
  const ZW: Record<string, string> = { massnehmen: 'Massnehmen', anprobe: 'Anprobe', abholung: 'Abholung', beratung: 'Beratung', telefon: 'Telefontermin' };
  const knapp = p.anlassDatum && p.liefertermin && (Date.parse(p.anlassDatum) - Date.parse(p.liefertermin)) / 86400_000 < 10;

  return (
    <section className="a-karte">
      <div className="a-karte-kopf">
        <h2>Planung</h2>
      </div>
      <div className="a-karte-inhalt a-planung">
        <DatumPicker label="Liefertermin Manufaktur" wert={p.liefertermin} onChange={(v) => patch({ liefertermin: v })} leer="noch offen" warnen={Boolean(knapp)} schnell={[['+3 Wochen', 21], ['+4 Wochen', 28], ['+6 Wochen', 42]]} />
        <div className="a-planung-anlass">
          <label className="a-feld" style={{ margin: 0 }}>
            <span>Anlass</span>
            <input className="a-input" value={anlass} onChange={(e) => setAnlass(e.target.value)} onBlur={() => anlass !== p.anlass && patch({ anlass })} placeholder="z. B. Hochzeit, Geschäftsessen" />
          </label>
          <DatumPicker label="Datum des Anlasses" wert={p.anlassDatum} onChange={(v) => patch({ anlassDatum: v })} leer="kein Datum" />
        </div>
        {knapp && <div className="a-hinweis rot">Liefertermin liegt weniger als 10 Tage vor dem Anlass — Anprobe und Änderungen einplanen.</div>}
        <DatumPicker label="Abholung geplant" wert={p.abholung} onChange={(v) => patch({ abholungGeplant: v })} leer="noch offen" />
        <Auswahl label="Zuständig" optionen={p.admins.map((a) => ({ wert: a.id, label: a.name }))} wert={p.zustaendigId} onChange={(v) => patch({ zustaendigId: v })} leerOption="Niemand" platzhalter="Niemand" />
        <label className="a-feld" style={{ margin: 0 }}>
          <span>Bestellung (Stoff-Bestellnr., Futter, Knöpfe, Manufaktur)</span>
          <textarea className="a-input" rows={3} value={notiz} onChange={(e) => setNotiz(e.target.value)} onBlur={() => notiz !== p.bestellnotiz && patch({ bestellnotiz: notiz })} placeholder="z. B. H&S Bestellung 48211, Futter Bemberg bordeaux, Hornknöpfe" />
        </label>

        <div className="a-planung-termine">
          <span className="a-kicker">Termine zum Auftrag</span>
          {p.termine.length === 0 && <p className="a-sub" style={{ margin: 0 }}>Noch keine Termine geplant.</p>}
          {p.termine.map((t) => (
            <a key={t.id} href={`/admin/termine/${t.id}/`} className="a-gewaehlt-zeile">
              <Icon name="kalender" width={16} height={16} />
              <span>
                <strong>{ZW[t.zweck] ?? 'Termin'}</strong> · {terminLang(new Date(t.start))}
              </span>
            </a>
          ))}
          <div className="a-chips">
            {(['massnehmen', 'anprobe', 'abholung'] as const).map((z) => (
              <button key={z} type="button" className="a-chip" aria-pressed={planen === z} onClick={() => setPlanen(planen === z ? null : z)}>
                <Icon name="plus" /> {ZW[z]}
              </button>
            ))}
          </div>
          {planen && (
            <div className="a-unterpanel">
              <SlotPicker wert={slot} onChange={setSlot} belegt={p.belegt} />
              <button
                type="button"
                className="a-knopf voll"
                disabled={laedt || !slot[0]}
                onClick={async () => {
                  if (await senden(api(p.id), { aktion: 'termin', zweck: planen, start: slot[0] })) {
                    setPlanen(null);
                    setSlot([]);
                  }
                }}
              >
                {slot[0] ? `${ZW[planen]} am ${terminLang(new Date(slot[0]))} eintragen` : 'Zeit wählen'}
              </button>
            </div>
          )}
        </div>
        <MeldungZeile m={meldung} />
      </div>
    </section>
  );
}

/* ---------- Aufgaben ---------- */

export type TaskDaten = { id: string; titel: string; schritt: string | null; faelligAm: string | null; erledigt: boolean; zustaendigId: string | null; spaet: boolean };

export function AuftragTasks({ id, tasks, admins, status }: { id: string; tasks: TaskDaten[]; admins: Admin[]; status: AuftragStatus }) {
  const router = useRouter();
  const { laedt, meldung, senden } = useAktion();
  const [neu, setNeu] = useState('');
  const [faellig, setFaellig] = useState<string | null>(null);
  const [lokal, setLokal] = useState<Record<string, boolean>>({});
  const [alle, setAlle] = useState(false);
  const offen = tasks.filter((t) => !(lokal[t.id] ?? t.erledigt));
  const sichtbar = alle ? tasks : tasks.filter((t) => !(lokal[t.id] ?? t.erledigt) || t.schritt === status);
  const task = (taskId: string, b: Record<string, unknown>) => senden(api(id), { aktion: 'task', taskId, ...b }, 'POST', { still: true });

  return (
    <section className="a-karte">
      <div className="a-karte-kopf">
        <h2>Aufgaben</h2>
        <span className="a-sub zahl" style={{ margin: 0 }}>
          {tasks.length - offen.length}/{tasks.length} erledigt
        </span>
      </div>
      <div className="a-mini-fortschritt gross">
        <i style={{ width: `${tasks.length ? ((tasks.length - offen.length) / tasks.length) * 100 : 0}%` }} />
      </div>
      <ul className="a-tasks">
        {sichtbar.map((t) => {
          const erledigt = lokal[t.id] ?? t.erledigt;
          return (
            <li key={t.id} className={erledigt ? 'erledigt' : t.spaet ? 'spaet' : ''}>
              <button
                type="button"
                className="a-haken"
                role="checkbox"
                aria-checked={erledigt}
                aria-label={erledigt ? 'Als offen markieren' : 'Als erledigt markieren'}
                onClick={async () => {
                  setLokal({ ...lokal, [t.id]: !erledigt });
                  if (!(await task(t.id, { erledigt: !erledigt }))) setLokal({ ...lokal, [t.id]: erledigt });
                  else router.refresh();
                }}
              >
                <Icon name="check" />
              </button>
              <div className="a-task-text">
                <b>{t.titel}</b>
                <small>{t.schritt ? AUFTRAG_SCHRITTE.find((s) => s.key === t.schritt)?.kurz : ''}</small>
              </div>
              <div className="a-task-werkzeug">
                <DatumPicker klein wert={t.faelligAm} onChange={(v) => task(t.id, { faelligAm: v })} leer="Fällig" warnen={t.spaet && !erledigt} />
                <Auswahl klein optionen={admins.map((a) => ({ wert: a.id, label: a.name }))} wert={t.zustaendigId} onChange={(v) => task(t.id, { zustaendigId: v })} leerOption="Niemand" platzhalter="Wer?" suche={false} />
                <button type="button" className="a-x" aria-label="Aufgabe löschen" onClick={() => confirm(`«${t.titel}» löschen?`) && senden(api(id), { aktion: 'task-loeschen', taskId: t.id }, 'POST', { still: true })}>
                  <Icon name="papierkorb" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="a-karte-inhalt a-task-neu">
        {tasks.some((t) => (lokal[t.id] ?? t.erledigt) && t.schritt !== status) && (
          <button type="button" className="a-knopf leise klein" onClick={() => setAlle(!alle)}>
            {alle ? 'Erledigte ausblenden' : 'Erledigte anzeigen'}
          </button>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!neu.trim()) return;
            if (await senden(api(id), { aktion: 'task-neu', titel: neu, faelligAm: faellig }, 'POST', { still: true })) {
              setNeu('');
              setFaellig(null);
            }
          }}
        >
          <input className="a-input" value={neu} onChange={(e) => setNeu(e.target.value)} placeholder="Neue Aufgabe, z. B. Knöpfe beim Lieferanten nachfragen" aria-label="Neue Aufgabe" />
          <DatumPicker klein wert={faellig} onChange={setFaellig} leer="Fällig am" abHeute />
          <button type="submit" className="a-knopf" disabled={laedt || !neu.trim()}>
            <Icon name="plus" /> Hinzufügen
          </button>
        </form>
        <MeldungZeile m={meldung?.art === 'rot' ? meldung : null} />
      </div>
    </section>
  );
}

/* ---------- Rechnungen zum Auftrag ---------- */

export function AuftragRechnungen({ id, totalRp, verrechnetRp, hatAnzahlung, hatSchluss, anzahlungProzent }: { id: string; totalRp: number; verrechnetRp: number; hatAnzahlung: boolean; hatSchluss: boolean; anzahlungProzent: number }) {
  const router = useRouter();
  const { laedt, meldung, senden } = useAktion();
  const [prozent, setProzent] = useState(anzahlungProzent || 50);
  const [anz, setAnz] = useState(false);
  const neu = async (art: 'anzahlung' | 'schluss') => {
    const r = await senden<{ id: string }>('/api/admin/rechnungen/', { auftragId: id, art, prozent: art === 'anzahlung' ? prozent : undefined }, 'POST', { ohneRefresh: true });
    if (r) router.push(`/admin/rechnungen/${r.id}/`);
  };
  return (
    <div className="a-aktionen">
      {!hatSchluss && (
        <>
          <button type="button" className="a-knopf linie voll" onClick={() => setAnz(!anz)} aria-expanded={anz} disabled={laedt}>
            <Icon name="rechnung" /> Anzahlung verrechnen
          </button>
          {anz && (
            <div className="a-unterpanel">
              <div className="a-segment" role="group" aria-label="Anteil">
                {[30, 50, 100].map((x) => (
                  <button key={x} type="button" aria-pressed={prozent === x} onClick={() => setProzent(x)}>
                    {x} %
                  </button>
                ))}
              </div>
              <button type="button" className="a-knopf voll" disabled={laedt} onClick={() => neu('anzahlung')}>
                Anzahlung {prozent} % · {chf(Math.round((totalRp * prozent) / 100 / 5) * 5)}
              </button>
            </div>
          )}
          <button type="button" className="a-knopf voll" disabled={laedt} onClick={() => neu('schluss')}>
            <Icon name="rechnung" /> Schlussrechnung erstellen
          </button>
          {hatAnzahlung && <p className="a-sub" style={{ margin: 0, fontSize: 12.5 }}>Bereits verrechnete Anzahlungen werden auf der Schlussrechnung abgezogen.</p>}
        </>
      )}
      {hatSchluss && <p className="a-sub" style={{ margin: 0 }}>Schlussrechnung erstellt{verrechnetRp ? ` · ${chf(verrechnetRp)} verrechnet` : ''}.</p>}
      <MeldungZeile m={meldung} />
    </div>
  );
}

/* ---------- Notiz ---------- */

export function AuftragNotiz({ id }: { id: string }) {
  const { laedt, meldung, senden } = useAktion();
  const [text, setText] = useState('');
  return (
    <div className="a-aktionen">
      <textarea className="a-input" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Notiz zum Auftrag, z. B. Kunde wünscht schmaleres Revers" aria-label="Notiz" />
      <div className="a-knopfreihe">
        <button type="button" className="a-knopf linie klein" disabled={laedt || !text.trim()} onClick={async () => (await senden(api(id), { aktion: 'notiz', text })) && setText('')}>
          Notiz speichern
        </button>
        <button type="button" className="a-knopf leise klein rot" onClick={() => confirm('Auftrag stornieren?') && senden(api(id), { aktion: 'status', status: 'storniert' })}>
          Auftrag stornieren
        </button>
      </div>
      <MeldungZeile m={meldung} />
    </div>
  );
}

/* ---------- Massblatt zuordnen ---------- */

export function AuftragMassblatt({ id, kontaktId, massblattId, versionen }: { id: string; kontaktId: string; massblattId: string | null; versionen: { id: string; label: string }[] }) {
  const { senden } = useAktion();
  return (
    <div className="a-aktionen">
      {versionen.length ? (
        <Auswahl label="Massblatt für diesen Auftrag" optionen={versionen.map((v) => ({ wert: v.id, label: v.label }))} wert={massblattId} onChange={(v) => senden(api(id), { massblattId: v }, 'PATCH')} leerOption="Keines" platzhalter="Keines zugeordnet" suche={false} />
      ) : (
        <p className="a-sub" style={{ margin: 0 }}>Noch kein Massblatt erfasst.</p>
      )}
      <div className="a-knopfreihe">
        {massblattId && (
          <>
            <a href={`/admin/massblaetter/${massblattId}/`} className="a-knopf linie klein">
              <Icon name="mass" /> Öffnen
            </a>
            <a href={`/api/admin/massblaetter/${massblattId}/pdf/`} target="_blank" rel="noopener" className="a-knopf leise klein">
              <Icon name="pdf" /> PDF
            </a>
          </>
        )}
        <a href={`/admin/massblaetter/neu/?kontakt=${kontaktId}&auftrag=${id}`} className="a-knopf leise klein">
          <Icon name="plus" /> Neu messen
        </a>
      </div>
    </div>
  );
}
