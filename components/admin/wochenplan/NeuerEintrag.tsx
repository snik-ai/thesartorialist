'use client';
// «Neuer Eintrag» der Wochenplanung (Dialog auf dem Desktop, Bottom-Sheet auf dem Handy, nach unten wegwischbar):
// Telefontermin · Termin im Atelier (Beratung/Massnehmen/Anprobe/Abholung) · Privat/Blocker.
// Kundentermine: bestehenden Kontakt suchen oder neu erfassen (Vorname, Name, E-Mail, Telefon → Lead, Golden Record).
// Auch Bearbeiten/Löschen privater Einträge. Keine nativen Auswahl-Elemente: Chips, Segmente, eigene Zeitwahl.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../Icon';
import DatumPicker, { datumLang } from '../DatumPicker';
import { EmailFeld } from '@/components/formular/EmailFeld';
import { TelefonFeld } from '@/components/formular/TelefonFeld';
import { telefonGueltig } from '@/lib/formular/telefon';
import { emailGueltig } from '@/lib/formular/email';
import { dauerText, hhmm, plusTage, ueberlappt, ZEIT_BIS, ZEIT_VON, type Bereich, type KalItem } from '@/lib/kalender';
import { SITE } from '@/lib/site';
import { zuerich, zuerichTeile } from '@/lib/zeit';
import type { TerminZweck } from '@/lib/db/schema';

export type NeuStart = { start?: string; ende?: string; typ?: Art };
export type FertigMeldung = { text: string; rueck?: () => void; link?: { href: string; text: string }; rot?: boolean };
type Art = 'telefon' | 'atelier' | 'privat';
type Treffer = { id: string; name: string; email: string | null; ort: string | null; status: string };

const ZWECKE: [Exclude<TerminZweck, 'telefon'>, string][] = [
  ['beratung', 'Beratung'],
  ['massnehmen', 'Massnehmen'],
  ['anprobe', 'Anprobe'],
  ['abholung', 'Abholung'],
];
const STANDARD: Record<TerminZweck | 'privat', number> = { telefon: 30, beratung: 90, massnehmen: 60, anprobe: 60, abholung: 30, privat: 60 };
const DAUER_KUNDE = [15, 30, 45, 60, 90];
const DAUER_PRIVAT = [15, 30, 60, 90, 120, 180, 240];
const STUNDEN = Array.from({ length: ZEIT_BIS - ZEIT_VON }, (_, i) => ZEIT_VON + i);
const heuteIso = () => zuerichTeile(new Date()).datum;
const minutenVon = (hm: string) => {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
};

export default function NeuerEintrag({
  start,
  privat,
  mailBereit,
  onClose,
  onFertig,
  onLoeschen,
}: {
  start: NeuStart;
  privat?: KalItem;
  mailBereit: boolean;
  onClose: () => void;
  onFertig: (m: FertigMeldung) => void;
  onLoeschen?: () => void;
}) {
  const router = useRouter();
  const bearbeiten = Boolean(privat);
  // Ausgangswerte: bearbeiteter Eintrag (Serie: erstes Vorkommen) oder Startzeit aus dem Raster
  const anfang = useMemo(() => {
    const s = privat ? new Date(privat.basisStart ?? privat.start) : start.start ? new Date(start.start) : null;
    const e = privat ? new Date(privat.basisEnde ?? privat.ende) : start.ende ? new Date(start.ende) : null;
    const jetzt = zuerichTeile(new Date());
    const naechste = Math.min(ZEIT_BIS * 60 - 60, Math.max(ZEIT_VON * 60, Math.ceil((minutenVon(jetzt.zeit) + 1) / 30) * 30));
    const z = s ? zuerichTeile(s) : null;
    return {
      datum: z?.datum ?? jetzt.datum,
      min: z ? Math.round(minutenVon(z.zeit) / 15) * 15 : naechste,
      dauer: s && e ? Math.max(15, Math.round((e.getTime() - s.getTime()) / 60_000 / 15) * 15) : null,
    };
  }, [privat, start]);

  const [art, setArt] = useState<Art>(privat ? 'privat' : (start.typ ?? 'telefon'));
  const [zweck, setZweck] = useState<Exclude<TerminZweck, 'telefon'>>('beratung');
  const [datum, setDatum] = useState(anfang.datum);
  const [min, setMin] = useState(anfang.min);
  const [dauer, setDauer] = useState(anfang.dauer ?? STANDARD.telefon);
  const [dauerManuell, setDauerManuell] = useState(anfang.dauer !== null);
  const [ganztags, setGanztags] = useState(privat?.ganztaegig ?? false);
  const [woechentlich, setWoechentlich] = useState(privat?.wiederholung === 'woche');
  const [titel, setTitel] = useState(privat?.titel ?? '');
  const [notiz, setNotiz] = useState(privat?.notiz ?? '');
  const [mail, setMail] = useState(mailBereit);
  const [kModus, setKModus] = useState<'suche' | 'neu'>('suche');
  const [q, setQ] = useState('');
  const [treffer, setTreffer] = useState<Treffer[]>([]);
  const [kontakt, setKontakt] = useState<Treffer | null>(null);
  const [neu, setNeu] = useState({ vorname: '', name: '', email: '', telefon: '' });
  const [fehlerFeld, setFehlerFeld] = useState('');
  const [belegt, setBelegt] = useState<Bereich[]>([]);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState('');
  const sheet = useRef<HTMLDivElement>(null);
  const zugY = useRef<{ y: number; id: number } | null>(null);
  const [wisch, setWisch] = useState(0);

  const kunde = art !== 'privat';
  const typ: TerminZweck = art === 'telefon' ? 'telefon' : zweck;

  // Standard-Dauer je Typ, solange nicht von Hand gewählt
  useEffect(() => {
    if (!dauerManuell) setDauer(STANDARD[art === 'privat' ? 'privat' : typ]);
  }, [art, typ, dauerManuell]);

  // Scroll sperren (html + body), Esc schliesst
  useEffect(() => {
    const h = document.documentElement;
    const alt = [h.style.overflow, document.body.style.overflow];
    h.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => {
      h.style.overflow = alt[0];
      document.body.style.overflow = alt[1];
      window.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  // Belegte Zeiten des gewählten Tages (Kollisionen anzeigen)
  useEffect(() => {
    const von = zuerich(datum, '00:00');
    const bis = zuerich(plusTage(datum, 1), '00:00');
    if (!von || !bis) return;
    const ac = new AbortController();
    const u = new URLSearchParams({ von: von.toISOString(), bis: bis.toISOString() });
    if (privat) u.set('ohnePrivat', privat.id);
    fetch(`/api/admin/kalender/?${u}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((b: Bereich[]) => setBelegt(Array.isArray(b) ? b : []))
      .catch(() => {});
    return () => ac.abort();
  }, [datum, privat]);

  // Kontaktsuche (verzögert)
  useEffect(() => {
    if (!kunde || kModus !== 'suche' || kontakt) return;
    const ac = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/api/admin/kontakte/suche/?q=${encodeURIComponent(q.trim())}`, { signal: ac.signal })
        .then((r) => (r.ok ? r.json() : []))
        .then((x: Treffer[]) => setTreffer(Array.isArray(x) ? x.slice(0, 6) : []))
        .catch(() => {});
    }, 180);
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [q, kunde, kModus, kontakt]);

  const startDate = zuerich(datum, hhmm(min));
  const vonMs = ganztags ? zuerich(datum, '00:00')!.getTime() : (startDate?.getTime() ?? 0);
  const bisMs = ganztags ? zuerich(plusTage(datum, 1), '00:00')!.getTime() : vonMs + dauer * 60_000;
  const konflikte = belegt.filter((b) => ueberlappt(new Date(b.start).getTime(), new Date(b.ende).getTime(), vonMs, bisMs));
  const privatKonflikt = kunde ? konflikte.find((b) => b.art === 'privat') : undefined;
  const stundeBelegt = (h: number) => {
    const a = zuerich(datum, hhmm(h * 60))!.getTime();
    return belegt.some((b) => ueberlappt(new Date(b.start).getTime(), new Date(b.ende).getTime(), a, a + 3600_000));
  };
  const oeffnung = SITE.hours[new Date(`${datum}T12:00:00Z`).getUTCDay()];
  const ausserhalb = kunde && art !== 'telefon' && (!oeffnung || min < minutenVon(oeffnung[0]) || min + dauer > minutenVon(oeffnung[1]));
  const vorbei = kunde && vonMs < Date.now() - 3600_000;

  const neuOk = Boolean((neu.vorname.trim() || neu.name.trim()) && (!neu.email || emailGueltig(neu.email)) && (!neu.telefon || telefonGueltig(neu.telefon)) && (art !== 'telefon' || neu.telefon.trim()));
  const kontaktOk = kModus === 'suche' ? Boolean(kontakt) : neuOk;
  const bereit = kunde ? kontaktOk && !privatKonflikt && !vorbei : Boolean(titel.trim());
  const hatMail = kModus === 'suche' ? Boolean(kontakt?.email) : Boolean(neu.email && emailGueltig(neu.email));

  async function speichern() {
    setFehler('');
    if (kunde && kModus === 'neu' && !neuOk) {
      setFehlerFeld(!(neu.vorname.trim() || neu.name.trim()) ? 'name' : neu.email && !emailGueltig(neu.email) ? 'email' : 'tel');
      setFehler(art === 'telefon' && !neu.telefon.trim() ? 'Für einen Telefontermin braucht es eine Telefonnummer.' : 'Bitte die markierten Angaben prüfen.');
      return;
    }
    if (!bereit) return;
    setLaedt(true);
    try {
      if (kunde) {
        const body = {
          zweck: typ,
          start: new Date(vonMs).toISOString(),
          dauerMin: dauer,
          notiz: notiz.trim() || undefined,
          mail: art === 'atelier' && mail && hatMail,
          ...(kModus === 'suche' ? { kontaktId: kontakt!.id } : { neu }),
        };
        const r = await fetch('/api/admin/termine/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.fehler || 'Das hat nicht geklappt.');
        onFertig({ text: j.meldung || 'Eingetragen.', link: { href: `/admin/termine/${j.id}/`, text: 'Öffnen' } });
      } else {
        const body = { titel: titel.trim(), start: new Date(vonMs).toISOString(), ende: new Date(bisMs).toISOString(), ganztaegig: ganztags, notiz: notiz.trim(), wiederholung: woechentlich ? 'woche' : null };
        const r = await fetch(bearbeiten ? `/api/admin/kalender/${privat!.id}/` : '/api/admin/kalender/', {
          method: bearbeiten ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.fehler || 'Das hat nicht geklappt.');
        const id = bearbeiten ? privat!.id : (j.id as string);
        onFertig({
          text: bearbeiten ? 'Gespeichert' : `«${body.titel}» eingetragen`,
          rueck: bearbeiten
            ? undefined
            : async () => {
                await fetch(`/api/admin/kalender/${id}/`, { method: 'DELETE' }).catch(() => {});
                router.refresh();
              },
        });
      }
    } catch (e) {
      setFehler((e as Error).message);
    } finally {
      setLaedt(false);
    }
  }

  // Bottom-Sheet am Griff nach unten wegwischen
  const griff = {
    onPointerDown: (e: React.PointerEvent) => {
      if (window.innerWidth > 640) return;
      zugY.current = { y: e.clientY, id: e.pointerId };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (zugY.current?.id === e.pointerId) setWisch(Math.max(0, e.clientY - zugY.current.y));
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (zugY.current?.id !== e.pointerId) return;
      zugY.current = null;
      if (wisch > 110) onClose();
      else setWisch(0);
    },
    onPointerCancel: () => {
      zugY.current = null;
      setWisch(0);
    },
  };

  const dauerListe = art === 'privat' ? DAUER_PRIVAT : DAUER_KUNDE;
  const knopfText = laedt ? 'Moment …' : bearbeiten ? 'Speichern' : art === 'telefon' ? 'Telefontermin eintragen' : art === 'atelier' ? `${ZWECKE.find((z) => z[0] === zweck)![1]} eintragen` : 'Eintragen';

  return (
    <div className="wp-hg" role="presentation" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="wp-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wp-sheet-titel"
        ref={sheet}
        style={wisch ? { transform: `translateY(${wisch}px)`, transition: 'none' } : undefined}
      >
        <div className="wp-sheet-kopf" {...griff}>
          <span className="wp-sheet-griff" aria-hidden="true" />
          <div>
            <span className="a-kicker">{bearbeiten ? (privat?.wiederholung ? 'Privat · jede Woche' : 'Privat') : 'Wochenplanung'}</span>
            <h2 id="wp-sheet-titel">{bearbeiten ? privat!.titel : 'Neuer Eintrag'}</h2>
          </div>
          <button type="button" className="nb-zu" aria-label="Schliessen" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>

        <div className="wp-sheet-inhalt">
          {!bearbeiten && (
            <div className="wp-typ" role="radiogroup" aria-label="Art des Eintrags">
              {(
                [
                  ['telefon', 'Telefontermin', 'telefon'],
                  ['atelier', 'Im Atelier', 'schere'],
                  ['privat', 'Privat / Blocker', 'uhr'],
                ] as const
              ).map(([a, l, ic]) => (
                <button key={a} type="button" role="radio" aria-checked={art === a} className={`t-${a === 'atelier' ? zweck : a}`} onClick={() => setArt(a)}>
                  <Icon name={ic} />
                  <span>{l}</span>
                </button>
              ))}
            </div>
          )}

          {art === 'atelier' && (
            <div className="wp-gruppe">
              <span className="a-kicker">Zweck</span>
              <div className="a-chips" role="radiogroup" aria-label="Zweck">
                {ZWECKE.map(([z, l]) => (
                  <button key={z} type="button" role="radio" className="a-chip" aria-pressed={zweck === z} aria-checked={zweck === z} onClick={() => setZweck(z)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {kunde && (
            <div className="wp-gruppe">
              <div className="wp-gruppe-kopf">
                <span className="a-kicker">Kunde</span>
                <div className="a-segment klein" role="radiogroup" aria-label="Kontakt">
                  <button type="button" role="radio" aria-checked={kModus === 'suche'} aria-pressed={kModus === 'suche'} onClick={() => setKModus('suche')}>
                    Bestehend
                  </button>
                  <button type="button" role="radio" aria-checked={kModus === 'neu'} aria-pressed={kModus === 'neu'} onClick={() => setKModus('neu')}>
                    Neuer Lead
                  </button>
                </div>
              </div>
              {kModus === 'suche' ? (
                kontakt ? (
                  <div className="wp-kontakt">
                    <span className="nb-avatar">{(kontakt.name || '?').slice(0, 1).toUpperCase()}</span>
                    <span className="nb-t">
                      <b>{kontakt.name || 'Ohne Namen'}</b>
                      <small>{[kontakt.email, kontakt.ort, kontakt.status === 'kunde' ? 'Kunde' : 'Lead'].filter(Boolean).join(' · ')}</small>
                    </span>
                    <button type="button" className="a-knopf leise klein" onClick={() => setKontakt(null)}>
                      Ändern
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="nb-suche">
                      <Icon name="suche" />
                      <input className="a-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, E-Mail oder Telefon" autoComplete="off" aria-label="Kontakt suchen" />
                    </label>
                    <ul className="nb-liste">
                      {treffer.map((t) => (
                        <li key={t.id}>
                          <button type="button" className="nb-treffer" onClick={() => setKontakt(t)}>
                            <span className="nb-avatar">{(t.name || '?').slice(0, 1).toUpperCase()}</span>
                            <span className="nb-t">
                              <b>{t.name || 'Ohne Namen'}</b>
                              <small>{[t.email, t.ort].filter(Boolean).join(' · ') || (t.status === 'kunde' ? 'Kunde' : 'Lead')}</small>
                            </span>
                          </button>
                        </li>
                      ))}
                      {q.trim() && treffer.length === 0 && <li className="nb-leer">Kein Treffer — als neuen Lead erfassen?</li>}
                      <li>
                        <button type="button" className="nb-treffer nb-neu" onClick={() => setKModus('neu')}>
                          <span className="nb-avatar gold">
                            <Icon name="plus" />
                          </span>
                          <span className="nb-t">
                            <b>Neuen Lead erfassen</b>
                            <small>Vorname, Name, E-Mail, Telefon</small>
                          </span>
                        </button>
                      </li>
                    </ul>
                  </>
                )
              ) : (
                <div className="form-grid wp-felder">
                  <label className="a-feld">
                    <span>Vorname</span>
                    <input className="a-input" value={neu.vorname} onChange={(e) => setNeu({ ...neu, vorname: e.target.value })} autoComplete="off" autoCapitalize="words" aria-invalid={fehlerFeld === 'name'} />
                  </label>
                  <label className="a-feld">
                    <span>Name</span>
                    <input className="a-input" value={neu.name} onChange={(e) => setNeu({ ...neu, name: e.target.value })} autoComplete="off" autoCapitalize="words" aria-invalid={fehlerFeld === 'name'} />
                  </label>
                  <EmailFeld id="wp-email" wert={neu.email} setWert={(v) => setNeu({ ...neu, email: v })} pflicht={false} fehlerAktiv={fehlerFeld === 'email'} t={{ label: 'E-Mail', platzhalter: 'name@beispiel.ch', fehler: 'Bitte die E-Mail-Adresse prüfen.', vorschlag: 'Meinten Sie {email}?', gueltig: 'E-Mail-Adresse gültig' }} />
                  <TelefonFeld
                    id="wp-tel"
                    wert={neu.telefon}
                    setWert={(v) => setNeu({ ...neu, telefon: v })}
                    pflicht={art === 'telefon'}
                    fehlerAktiv={fehlerFeld === 'tel'}
                    t={{ label: art === 'telefon' ? 'Telefon' : 'Telefon (optional)', platzhalter: '079 123 45 67', fehler: 'Bitte die Telefonnummer prüfen.', land: 'Land der Telefonnummer', gueltig: 'Telefonnummer gültig' }}
                  />
                  <p className="nb-klein">Wird als Lead gespeichert. Gibt es E-Mail oder Telefon schon, wird der bestehende Kontakt ergänzt.</p>
                </div>
              )}
            </div>
          )}

          {art === 'privat' && (
            <div className="wp-gruppe">
              <label className="a-feld" style={{ margin: 0 }}>
                <span>Titel</span>
                <input className="a-input" value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="z. B. Mittag, Zahnarzt, Stofflieferant" autoComplete="off" />
              </label>
              <div className="a-chips wp-vorlagen">
                {['Mittag', 'Privat', 'Stoffhändler', 'Ferien'].map((v) => (
                  <button key={v} type="button" className="a-chip klein" onClick={() => setTitel(v)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="wp-gruppe">
            <div className="wp-gruppe-kopf">
              <span className="a-kicker">Wann</span>
              {art === 'privat' && (
                <button type="button" className="a-toggle" aria-pressed={ganztags} onClick={() => setGanztags(!ganztags)}>
                  <i /> Ganztägig
                </button>
              )}
            </div>
            <DatumPicker wert={datum} onChange={(d) => d && setDatum(d)} entfernbar={false} schnell={[['Heute', 0], ['Morgen', 1], ['+1 Woche', 7]]} />
            {!ganztags && (
              <>
                <div className="wp-zeitwahl" role="group" aria-label="Uhrzeit">
                  <div className="wp-zeit-gross zahl" aria-live="polite">
                    {hhmm(min)} <span>–</span> {hhmm(min + dauer)}
                  </div>
                  <div className="wp-stunden" role="radiogroup" aria-label="Stunde">
                    {STUNDEN.map((h) => {
                      const zu = !oeffnung || h * 60 < minutenVon(oeffnung[0]) || h * 60 >= minutenVon(oeffnung[1]);
                      return (
                        <button key={h} type="button" role="radio" aria-checked={Math.floor(min / 60) === h} className={`wp-stunde zahl${zu ? ' zu' : ''}${stundeBelegt(h) ? ' belegt' : ''}`} onClick={() => setMin(h * 60 + (min % 60))}>
                          {String(h).padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>
                  <div className="a-segment wp-minuten" role="radiogroup" aria-label="Minuten">
                    {[0, 15, 30, 45].map((m) => (
                      <button key={m} type="button" role="radio" aria-checked={min % 60 === m} aria-pressed={min % 60 === m} className="zahl" onClick={() => setMin(Math.floor(min / 60) * 60 + m)}>
                        :{String(m).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="a-kicker" style={{ marginTop: 14 }}>
                  Dauer
                </span>
                <div className="a-chips" role="radiogroup" aria-label="Dauer">
                  {dauerListe.map((d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      className="a-chip zahl"
                      aria-checked={dauer === d}
                      aria-pressed={dauer === d}
                      onClick={() => {
                        setDauer(d);
                        setDauerManuell(true);
                      }}
                    >
                      {dauerText(d)}
                    </button>
                  ))}
                  {!dauerListe.includes(dauer) && (
                    <span className="a-chip zahl" aria-pressed="true">
                      {dauerText(dauer)}
                    </span>
                  )}
                </div>
              </>
            )}
            <p className="wp-wann zahl">
              {datumLang(datum)}
              {ganztags ? ' · ganztägig' : ` · ${hhmm(min)}–${hhmm(min + dauer)} Uhr`}
              {oeffnung ? ` · Atelier ${oeffnung[0]}–${oeffnung[1]}` : ' · Atelier geschlossen'}
            </p>
            {privatKonflikt && <div className="a-hinweis rot">Diese Zeit ist privat blockiert: {privatKonflikt.titel || 'Privat'} ({zuerichTeile(new Date(privatKonflikt.start)).zeit}–{zuerichTeile(new Date(privatKonflikt.ende)).zeit}).</div>}
            {!privatKonflikt && konflikte.length > 0 && (
              <div className="a-hinweis">
                Überschneidung mit {konflikte.length === 1 ? 'einem Eintrag' : `${konflikte.length} Einträgen`}: {konflikte.map((k) => `${k.titel || (k.art === 'termin' ? 'Kundentermin' : 'Privat')} ${zuerichTeile(new Date(k.start)).zeit}–${zuerichTeile(new Date(k.ende)).zeit}`).join(', ')}
              </div>
            )}
            {ausserhalb && !privatKonflikt && <div className="a-hinweis">Ausserhalb der Öffnungszeiten.</div>}
            {vorbei && <div className="a-hinweis rot">Diese Zeit liegt in der Vergangenheit.</div>}
            {art === 'privat' && (
              <button type="button" className="a-toggle" aria-pressed={woechentlich} onClick={() => setWoechentlich(!woechentlich)} style={{ alignSelf: 'flex-start' }}>
                <i /> Jede Woche wiederholen
              </button>
            )}
          </div>

          <label className="a-feld wp-gruppe" style={{ margin: 0 }}>
            <span>Notiz</span>
            <textarea className="a-input" value={notiz} onChange={(e) => setNotiz(e.target.value)} rows={2} placeholder={art === 'telefon' ? 'Worum geht es? z. B. Rückfragen zur Hochzeit' : 'Optional'} />
          </label>

          {art === 'atelier' && hatMail && (
            <button type="button" className="a-toggle" aria-pressed={mail && mailBereit} disabled={!mailBereit} onClick={() => setMail(!mail)} style={{ alignSelf: 'flex-start' }}>
              <i /> {mailBereit ? 'Bestätigung per E-Mail (mit Kalender)' : 'E-Mail-Versand nicht konfiguriert'}
            </button>
          )}
          {art === 'telefon' && <p className="nb-klein">Sie rufen an — im Termin steht ein grosser «Jetzt anrufen»-Knopf. Der Kunde erhält keine automatische E-Mail.</p>}

          {fehler && (
            <div className="a-hinweis rot" role="alert">
              {fehler}
            </div>
          )}
        </div>

        <div className="wp-sheet-fuss">
          {bearbeiten && onLoeschen && (
            <button type="button" className="a-knopf rot" onClick={onLoeschen}>
              <Icon name="papierkorb" /> Löschen
            </button>
          )}
          <button type="button" className="a-knopf gold wp-speichern" disabled={laedt || (!bereit && !(kunde && kModus === 'neu'))} onClick={speichern}>
            {knopfText}
          </button>
        </div>
      </div>
    </div>
  );
}
