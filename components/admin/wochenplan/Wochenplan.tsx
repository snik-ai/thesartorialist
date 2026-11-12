'use client';
// Wochenplanung im Stil einer Mac-Kalender-App: Desktop 7 Tage × Stunden, Mobil Tag-Ansicht mit Wochentag-Leiste.
// Drag & Drop (Maus sofort, Touch nach Long-Press), Verlängern am unteren Griff, Aufziehen im leeren Raster zum Erstellen,
// Doppelklick öffnet, Undo-Leiste, Kollisionen nebeneinander, Öffnungszeiten-Band, Jetzt-Linie, Tastatur (← → T N Entf Esc).
// Eigene Pointer-Logik, keine Bibliothek. Raster 15 Minuten.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '../Icon';
import NeuerEintrag, { type NeuStart } from './NeuerEintrag';
import Informieren from './Informieren';
import { SITE } from '@/lib/site';
import { dauerText, hhmm, kalenderwoche, plusTage, TYP_LABEL, ueberlappt, ZEIT_BIS, ZEIT_VON, type KalItem } from '@/lib/kalender';
import { zuerich, zuerichTeile } from '@/lib/zeit';
import './wochenplan.css';

const WT_KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const SNAP = 15;
const snap = (m: number) => Math.round(m / SNAP) * SNAP;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const wochentag = (datum: string) => new Date(`${datum}T12:00:00Z`).getUTCDay();
const tagZahl = (datum: string) => Number(datum.slice(8));
const minuten = (hm: string) => {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
};

type Seg = { item: KalItem; col: number; von: number; bis: number; spalte: number; spalten: number };
type Vorschau = { key: string | null; col: number; start: number; dauer: number; modus: 'verschieben' | 'dauer' | 'neu' };
type Toast = { id: number; text: string; rueck?: () => void; link?: { href: string; text: string }; rot?: boolean };

/** Ein Vorkommen → Segmente je sichtbarem Tag (Minuten seit Mitternacht, Zürich) */
function segmente(items: KalItem[], tage: string[]) {
  const segs: Omit<Seg, 'spalte' | 'spalten'>[] = [];
  const ganz: { item: KalItem; col: number }[] = [];
  for (const it of items) {
    const s = new Date(it.start);
    const e = new Date(it.ende);
    if (it.ganztaegig || e.getTime() - s.getTime() >= 20 * 3600_000) {
      tage.forEach((t, col) => {
        const a = zuerich(t, '00:00')!.getTime();
        const b = zuerich(plusTage(t, 1), '00:00')!.getTime();
        if (ueberlappt(s.getTime(), e.getTime(), a, b)) ganz.push({ item: it, col });
      });
      continue;
    }
    const zs = zuerichTeile(s);
    const ze = zuerichTeile(e);
    const col = tage.indexOf(zs.datum);
    if (col < 0) continue;
    const von = minuten(zs.zeit);
    const bis = ze.datum > zs.datum ? 24 * 60 : Math.max(von + 5, minuten(ze.zeit));
    segs.push({ item: it, col, von, bis });
  }
  return { segs: anordnen(segs), ganz };
}

/** Überlappungen nebeneinander (wie Apple-Kalender): Cluster bilden, Spalten gierig vergeben */
function anordnen(segs: Omit<Seg, 'spalte' | 'spalten'>[]): Seg[] {
  const out: Seg[] = [];
  const nachTag = new Map<number, Omit<Seg, 'spalte' | 'spalten'>[]>();
  for (const s of segs) nachTag.set(s.col, [...(nachTag.get(s.col) ?? []), s]);
  for (const liste of nachTag.values()) {
    liste.sort((a, b) => a.von - b.von || b.bis - a.bis);
    let cluster: Seg[] = [];
    let enden: number[] = [];
    let clusterEnde = -1;
    const flush = () => {
      for (const c of cluster) c.spalten = enden.length;
      out.push(...cluster);
      cluster = [];
      enden = [];
    };
    for (const s of liste) {
      const bisSicht = Math.max(s.bis, s.von + 25);
      if (cluster.length && s.von >= clusterEnde) flush();
      let i = enden.findIndex((e) => e <= s.von);
      if (i < 0) {
        i = enden.length;
        enden.push(bisSicht);
      } else enden[i] = bisSicht;
      cluster.push({ ...s, spalte: i, spalten: 0 });
      clusterEnde = Math.max(clusterEnde, bisSicht);
    }
    flush();
  }
  return out;
}

export default function Wochenplan(p: { montag: string; heute: string; tag?: string | null; items: KalItem[]; mailBereit: boolean; neuOffen?: boolean }) {
  const router = useRouter();
  const tage = useMemo(() => Array.from({ length: 7 }, (_, i) => plusTage(p.montag, i)), [p.montag]);
  const [items, setItems] = useState(p.items);
  useEffect(() => setItems(p.items), [p.items]);
  const [tag, setTag] = useState(() => (p.tag && tage.includes(p.tag) ? p.tag : tage.includes(p.heute) ? p.heute : p.montag));
  useEffect(() => {
    setTag((t) => (tage.includes(t) ? t : p.tag && tage.includes(p.tag) ? p.tag : tage.includes(p.heute) ? p.heute : p.montag));
  }, [tage, p.tag, p.heute, p.montag]);
  const [auswahl, setAuswahl] = useState<string | null>(null);
  const [neu, setNeu] = useState<NeuStart | null>(p.neuOffen ? {} : null);
  // «Neuer Eintrag» ohne Raster-Klick: gewählter Tag (Handy) bzw. heute, nächste halbe Stunde — spät abends morgen 10:00
  const standardStart = (): NeuStart => {
    const jetzt = zuerichTeile(new Date());
    const basis = window.matchMedia('(max-width: 900px)').matches ? tag : tage.includes(p.heute) ? p.heute : p.montag;
    let datum = basis < jetzt.datum ? jetzt.datum : basis;
    let min = datum === jetzt.datum ? Math.ceil((minuten(jetzt.zeit) + 1) / 30) * 30 : 10 * 60;
    if (min > (ZEIT_BIS - 1) * 60) {
      datum = plusTage(datum, 1);
      min = 10 * 60;
    }
    return { start: zuerich(datum, hhmm(Math.max(min, ZEIT_VON * 60)))!.toISOString() };
  };
  const [bearbeiten, setBearbeiten] = useState<KalItem | null>(null);
  const [info, setInfo] = useState<{ item: KalItem; start: string } | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const [jetzt, setJetzt] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setJetzt(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const zeigeToast = useCallback((t: Omit<Toast, 'id'>) => {
    window.clearTimeout(toastTimer.current);
    const id = Date.now();
    setToast({ ...t, id });
    toastTimer.current = window.setTimeout(() => setToast((x) => (x?.id === id ? null : x)), 5200);
  }, []);

  const woche = (d: number, t?: string) => {
    const w = plusTage(p.montag, d * 7);
    router.push(`/admin/termine/woche/?w=${w}${t ? `&t=${t}` : ''}`, { scroll: false });
  };
  const heute = () => {
    setTag(p.heute);
    router.push('/admin/termine/woche/', { scroll: false });
  };
  const tagWechsel = (d: number) => {
    const neuTag = plusTage(tag, d);
    if (tage.includes(neuTag)) setTag(neuTag);
    else woche(d, neuTag);
  };

  const oeffnen = useCallback(
    (it: KalItem) => {
      if (it.quelle === 'termin') router.push(`/admin/termine/${it.id}/`);
      else setBearbeiten(it);
    },
    [router],
  );

  async function api(url: string, methode: string, body: unknown) {
    const r = await fetch(url, { method: methode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.fehler || 'Das hat nicht geklappt.');
    return j;
  }

  /** Neue Zeit/Dauer speichern (optimistisch). Serien verschieben sich als Ganzes. */
  async function speichereZeit(it: KalItem, start: Date, dauerMin: number, o: { rueck?: boolean } = {}) {
    const alt = { start: it.start, ende: it.ende };
    const neuStart = start.toISOString();
    const neuEnde = new Date(start.getTime() + dauerMin * 60_000).toISOString();
    const zeitNeu = neuStart !== it.start;
    // Serie: erstes Vorkommen um dieselbe Differenz verschieben
    const bs = new Date(new Date(it.basisStart ?? it.start).getTime() + start.getTime() - new Date(it.start).getTime());
    const be = new Date(bs.getTime() + dauerMin * 60_000);
    const geaendert: KalItem = { ...it, start: neuStart, ende: neuEnde, ...(it.basisStart ? { basisStart: bs.toISOString(), basisEnde: be.toISOString() } : {}) };
    setItems((liste) => liste.map((x) => (x.key === it.key ? geaendert : x)));
    try {
      if (it.quelle === 'termin') {
        await api(`/api/admin/termine/${it.id}/`, 'POST', { aktion: 'verschieben', start: neuStart, dauerMin });
      } else {
        await api(`/api/admin/kalender/${it.id}/`, 'PATCH', { start: bs.toISOString(), ende: be.toISOString() });
      }
      router.refresh();
      if (o.rueck) {
        setInfo(null);
        zeigeToast({ text: 'Rückgängig gemacht' });
        return;
      }
      const was = it.quelle === 'termin' ? 'Termin' : it.wiederholung ? 'Serie' : 'Eintrag';
      zeigeToast({
        text: zeitNeu ? `${was} verschoben · ${zuerichTeile(start).zeit}` : `Dauer · ${dauerText(dauerMin)}`,
        rueck: () => speichereZeit(geaendert, new Date(alt.start), Math.round((new Date(alt.ende).getTime() - new Date(alt.start).getTime()) / 60_000), { rueck: true }),
      });
      // Kundentermin auf neue Zeit: fragen, ob der Kunde informiert werden soll (nichts automatisch)
      if (it.quelle === 'termin' && zeitNeu && it.kontakt) setInfo({ item: geaendert, start: neuStart });
    } catch (e) {
      setItems((liste) => liste.map((x) => (x.key === it.key ? it : x)));
      zeigeToast({ text: (e as Error).message, rot: true });
    }
  }

  async function loeschen(it: KalItem) {
    if (it.quelle !== 'privat') return;
    setItems((l) => l.filter((x) => x.id !== it.id));
    setAuswahl(null);
    try {
      const j = await api(`/api/admin/kalender/${it.id}/`, 'DELETE', {});
      router.refresh();
      zeigeToast({
        text: `«${it.titel}» gelöscht`,
        rueck: async () => {
          try {
            await api('/api/admin/kalender/', 'POST', j.eintrag);
            router.refresh();
            zeigeToast({ text: 'Wiederhergestellt' });
          } catch (e) {
            zeigeToast({ text: (e as Error).message, rot: true });
          }
        },
      });
    } catch (e) {
      router.refresh();
      zeigeToast({ text: (e as Error).message, rot: true });
    }
  }

  // Tastatur (Desktop): ← → Woche, T Heute, N Neu, Entf löschen (privat), Enter öffnen, Esc abwählen
  const dialogOffen = Boolean(neu || bearbeiten || info);
  const tastenRef = useRef<(e: KeyboardEvent) => void>(() => {});
  tastenRef.current = (e: KeyboardEvent) => {
    if (dialogOffen || e.metaKey || e.ctrlKey || e.altKey) return;
    const el = e.target as HTMLElement;
    if (el.closest('input, textarea, [contenteditable="true"]')) return;
    const gewaehlt = items.find((x) => x.key === auswahl);
    if (e.key === 'ArrowLeft') woche(-1);
    else if (e.key === 'ArrowRight') woche(1);
    else if (e.key === 't' || e.key === 'T') heute();
    else if (e.key === 'n' || e.key === 'N') setNeu(standardStart());
    else if ((e.key === 'Delete' || e.key === 'Backspace') && gewaehlt?.quelle === 'privat') loeschen(gewaehlt);
    else if (e.key === 'Enter' && gewaehlt) oeffnen(gewaehlt);
    else if (e.key === 'Escape') setAuswahl(null);
    else return;
    e.preventDefault();
  };
  useEffect(() => {
    const f = (e: KeyboardEvent) => tastenRef.current(e);
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);

  const kw = kalenderwoche(p.montag);
  const monatTitel = (() => {
    const a = new Date(`${tage[0]}T12:00:00Z`);
    const b = new Date(`${tage[6]}T12:00:00Z`);
    const f = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('de-CH', { ...o, timeZone: 'UTC' });
    return a.getUTCMonth() === b.getUTCMonth() ? f(a, { month: 'long', year: 'numeric' }) : `${f(a, { month: 'short' })} – ${f(b, { month: 'short', year: 'numeric' })}`;
  })();
  const spanne = `${tagZahl(tage[0])}.–${new Date(`${tage[6]}T12:00:00Z`).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', timeZone: 'UTC' })}`;
  const anzahlTag = (t: string) => items.filter((x) => zuerichTeile(new Date(x.start)).datum === t).length;
  const tagLang = new Date(`${tag}T12:00:00Z`).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

  const rasterProps = {
    items,
    jetzt,
    heute: p.heute,
    auswahl,
    onWaehle: setAuswahl,
    onOeffne: oeffnen,
    onNeu: (n: NeuStart) => setNeu(n),
    onZeit: speichereZeit,
  };

  return (
    <div className="wp">
      <div className="wp-kopf">
        <div className="wp-titel">
          <span className="a-kicker">
            Kalender · KW <span className="zahl">{kw}</span>
          </span>
          <h1>{monatTitel}</h1>
          <p className="a-sub zahl">
            Wochenplanung · {spanne}
          </p>
        </div>
        <div className="wp-steuer">
          <div className="a-segment wp-ansicht" role="navigation" aria-label="Ansicht">
            <Link href="/admin/termine/">Liste</Link>
            <Link href="/admin/termine/woche/" aria-current="page">
              Woche
            </Link>
          </div>
          <div className="wp-nav" role="group" aria-label="Woche wechseln">
            <button type="button" onClick={() => woche(-1)} aria-label="Vorherige Woche" title="Vorherige Woche (←)">
              <Icon name="pfeilLinks" />
            </button>
            <button type="button" className="wp-heute" onClick={heute} title="Heute (T)">
              Heute
            </button>
            <button type="button" onClick={() => woche(1)} aria-label="Nächste Woche" title="Nächste Woche (→)">
              <Icon name="pfeilRechts" />
            </button>
          </div>
          <button type="button" className="a-knopf gold wp-neu" onClick={() => setNeu(standardStart())} title="Neuer Eintrag (N)">
            <Icon name="plus" /> <span>Neuer Eintrag</span>
          </button>
        </div>
      </div>

      <div className="wp-legende" aria-label="Legende">
        {(['beratung', 'massnehmen', 'anprobe', 'abholung', 'telefon', 'privat'] as const).map((t) => (
          <span key={t} className={`wp-leg t-${t}`}>
            <i /> {TYP_LABEL[t]}
          </span>
        ))}
        <span className="wp-leg offen">
          <i /> Angefragt
        </span>
      </div>

      {/* Mobil: Wochentag-Leiste + Tag-Ansicht */}
      <div className="wp-mobil">
        <WochenLeiste tage={tage} tag={tag} heute={p.heute} anzahl={anzahlTag} onTag={setTag} onWoche={(d) => woche(d, plusTage(tag, d * 7))} />
        <div className="wp-tagkopf">
          <b>{tagLang}</b>
          {tag !== p.heute && (
            <button type="button" className="wp-link" onClick={heute}>
              Heute
            </button>
          )}
        </div>
        <Raster {...rasterProps} tage={[tag]} mobil onWisch={tagWechsel} />
      </div>

      {/* Desktop: 7 Tage */}
      <div className="wp-desktop">
        <Raster {...rasterProps} tage={tage} />
        <p className="wp-tipp">
          Ziehen zum Verschieben · unteren Rand ziehen zum Verlängern · im freien Raster aufziehen oder doppelklicken für einen neuen Eintrag · Tasten: ← → Woche, T Heute, N Neu, Entf Löschen
        </p>
      </div>

      {neu && (
        <NeuerEintrag
          start={neu}
          mailBereit={p.mailBereit}
          onClose={() => setNeu(null)}
          onFertig={(t) => {
            setNeu(null);
            router.refresh();
            zeigeToast(t);
          }}
        />
      )}
      {bearbeiten && (
        <NeuerEintrag
          start={{}}
          privat={bearbeiten}
          mailBereit={p.mailBereit}
          onClose={() => setBearbeiten(null)}
          onLoeschen={() => {
            const it = bearbeiten;
            setBearbeiten(null);
            loeschen(it);
          }}
          onFertig={(t) => {
            setBearbeiten(null);
            router.refresh();
            zeigeToast(t);
          }}
        />
      )}
      {info && info.item.kontakt && <Informieren item={info.item} start={info.start} mailBereit={p.mailBereit} onClose={() => setInfo(null)} onMeldung={(text, rot) => zeigeToast({ text, rot })} />}

      {toast && (
        <div className={`wp-toast${toast.rot ? ' rot' : ''}`} role="status" key={toast.id}>
          <span>{toast.text}</span>
          {toast.link && (
            <Link href={toast.link.href} className="wp-toast-k">
              {toast.link.text}
            </Link>
          )}
          {toast.rueck && (
            <button
              type="button"
              className="wp-toast-k"
              onClick={() => {
                const r = toast.rueck!;
                setToast(null);
                r();
              }}
            >
              Rückgängig
            </button>
          )}
          <i className="wp-toast-zeit" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

function WochenLeiste({ tage, tag, heute, anzahl, onTag, onWoche }: { tage: string[]; tag: string; heute: string; anzahl: (t: string) => number; onTag: (t: string) => void; onWoche: (d: number) => void }) {
  const x0 = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      className="wp-leiste"
      onTouchStart={(e) => (x0.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const s = x0.current;
        x0.current = null;
        if (!s) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) onWoche(dx < 0 ? 1 : -1);
      }}
    >
      <button type="button" className="wp-leiste-pfeil" onClick={() => onWoche(-1)} aria-label="Vorherige Woche">
        <Icon name="pfeilLinks" />
      </button>
      {tage.map((t, i) => {
        const n = anzahl(t);
        return (
          <button key={t} type="button" className={`wp-leiste-tag${t === heute ? ' heute' : ''}`} aria-pressed={t === tag} onClick={() => onTag(t)}>
            <small>{WT_KURZ[i]}</small>
            <b className="zahl">{tagZahl(t)}</b>
            <i aria-hidden="true">{Array.from({ length: Math.min(3, n) }).map((_, k) => <span key={k} />)}</i>
          </button>
        );
      })}
      <button type="button" className="wp-leiste-pfeil" onClick={() => onWoche(1)} aria-label="Nächste Woche">
        <Icon name="pfeilRechts" />
      </button>
    </div>
  );
}

type Zug = {
  modus: 'verschieben' | 'dauer' | 'neu';
  item?: KalItem;
  pointerId: number;
  touch: boolean;
  x0: number;
  y0: number;
  aktiv: boolean;
  timer?: number;
  versatz: number;
  col0: number;
  start0: number;
  dauer0: number;
  anker: number;
  ziel?: { col: number; start: number; dauer: number };
};

function Raster(p: {
  tage: string[];
  items: KalItem[];
  jetzt: number;
  heute: string;
  auswahl: string | null;
  mobil?: boolean;
  onWaehle: (k: string | null) => void;
  onOeffne: (it: KalItem) => void;
  onNeu: (n: NeuStart) => void;
  onZeit: (it: KalItem, start: Date, dauer: number) => void;
  onWisch?: (d: number) => void;
}) {
  const n = p.tage.length;
  const { segs, ganz } = useMemo(() => segmente(p.items, p.tage), [p.items, p.tage]);
  const spaltenRef = useRef<HTMLDivElement>(null);
  const zug = useRef<Zug | null>(null);
  const [vorschau, setVorschau] = useState<Vorschau | null>(null);
  const stunden = ZEIT_BIS - ZEIT_VON;
  const pRef = useRef(p);
  pRef.current = p;

  // Während eines aktiven Touch-Zugs nicht scrollen
  useEffect(() => {
    const sperre = (e: TouchEvent) => {
      if (zug.current?.aktiv) e.preventDefault();
    };
    document.addEventListener('touchmove', sperre, { passive: false });
    return () => document.removeEventListener('touchmove', sperre);
  }, []);

  const geo = useCallback(
    (x: number, y: number) => {
      const r = spaltenRef.current!.getBoundingClientRect();
      const h = r.height / stunden;
      return { col: clamp(Math.floor(((x - r.left) / r.width) * n), 0, n - 1), min: ((y - r.top) / h) * 60 + ZEIT_VON * 60 };
    },
    [n, stunden],
  );

  const berechne = useCallback(
    (z: Zug, x: number, y: number) => {
      const g = geo(x, y);
      const unten = ZEIT_VON * 60;
      const oben = ZEIT_BIS * 60;
      if (z.modus === 'verschieben') {
        const start = clamp(snap(g.min - z.versatz), unten, oben - Math.min(z.dauer0, oben - unten));
        return { col: g.col, start, dauer: z.dauer0 };
      }
      if (z.modus === 'dauer') {
        const ende = clamp(snap(g.min), z.start0 + SNAP, Math.max(oben, z.start0 + SNAP));
        return { col: z.col0, start: z.start0, dauer: ende - z.start0 };
      }
      const a = clamp(snap(z.anker), unten, oben - SNAP);
      const b = clamp(snap(g.min), unten, oben);
      const s = Math.min(a, b);
      return { col: z.col0, start: s, dauer: Math.max(SNAP, Math.max(a, b) - s) };
    },
    [geo],
  );

  const aktivieren = useCallback((z: Zug) => {
    z.aktiv = true;
    document.documentElement.classList.add('wp-zieht');
    if (z.touch) navigator.vibrate?.(8);
    z.ziel = { col: z.col0, start: z.start0, dauer: z.dauer0 };
    if (z.modus !== 'neu') setVorschau({ key: z.item!.key, col: z.col0, start: z.start0, dauer: z.dauer0, modus: z.modus });
  }, []);

  const ende = useCallback(() => {
    const z = zug.current;
    if (z?.timer) window.clearTimeout(z.timer);
    zug.current = null;
    document.documentElement.classList.remove('wp-zieht');
    window.removeEventListener('pointermove', bewegen);
    window.removeEventListener('pointerup', loslassen);
    window.removeEventListener('pointercancel', abbrechen);
    setVorschau(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function bewegen(e: PointerEvent) {
    const z = zug.current;
    if (!z || e.pointerId !== z.pointerId) return;
    const dx = e.clientX - z.x0;
    const dy = e.clientY - z.y0;
    if (!z.aktiv) {
      if (z.touch) {
        // Vor dem Long-Press bewegt → Scrollen/Wischen, kein Zug (Wischen wird beim Loslassen ausgewertet)
        if (Math.hypot(dx, dy) > 8 && z.timer) {
          window.clearTimeout(z.timer);
          z.timer = undefined;
        }
        return;
      }
      if (Math.hypot(dx, dy) < 4) return;
      aktivieren(z);
    }
    e.preventDefault();
    const ziel = berechne(z, e.clientX, e.clientY);
    z.ziel = ziel;
    setVorschau({ key: z.item?.key ?? null, ...ziel, modus: z.modus });
    // Automatisch scrollen am Rand
    if (e.clientY < 80) window.scrollBy(0, -14);
    else if (e.clientY > window.innerHeight - 80) window.scrollBy(0, 14);
  }

  function loslassen(e: PointerEvent) {
    const z = zug.current;
    if (!z || e.pointerId !== z.pointerId) return;
    const pp = pRef.current;
    if (z.aktiv && z.ziel) {
      const { col, start, dauer } = z.ziel;
      if (z.modus === 'neu') {
        const s = zuerich(pp.tage[col], hhmm(start))!;
        pp.onNeu({ start: s.toISOString(), ende: new Date(s.getTime() + dauer * 60_000).toISOString() });
      } else if (z.item && (col !== z.col0 || start !== z.start0 || dauer !== z.dauer0)) {
        pp.onZeit(z.item, zuerich(pp.tage[col], hhmm(start))!, dauer);
      }
    } else {
      const dx = e.clientX - z.x0;
      const dy = e.clientY - z.y0;
      const bewegt = Math.hypot(dx, dy) > 8;
      if (z.touch && bewegt && pp.onWisch && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) pp.onWisch(dx < 0 ? 1 : -1);
      else if (!bewegt) {
        if (z.item) {
          if (z.touch) pp.onOeffne(z.item);
          else pp.onWaehle(z.item.key);
        } else {
          if (!z.touch) pp.onWaehle(null);
          else {
            // Antippen eines freien Slots → Neuer Eintrag (halbe Stunde, eine Stunde lang)
            const s = zuerich(pp.tage[z.col0], hhmm(Math.floor(z.anker / 30) * 30))!;
            pp.onNeu({ start: s.toISOString() });
          }
        }
      }
    }
    ende();
  }

  function abbrechen(e: PointerEvent) {
    if (zug.current && e.pointerId === zug.current.pointerId) ende();
  }

  function start(e: React.PointerEvent, it: KalItem | null, modus: Zug['modus']) {
    if (e.button !== 0 || zug.current) return;
    const g = geo(e.clientX, e.clientY);
    const seg = it ? segs.find((s) => s.item.key === it.key) : null;
    const z: Zug = {
      modus,
      item: it ?? undefined,
      pointerId: e.pointerId,
      touch: e.pointerType !== 'mouse',
      x0: e.clientX,
      y0: e.clientY,
      aktiv: false,
      versatz: seg ? g.min - seg.von : 0,
      col0: seg ? seg.col : g.col,
      start0: seg ? seg.von : 0,
      dauer0: seg ? seg.bis - seg.von : 0,
      anker: g.min,
    };
    zug.current = z;
    // Touch: Termin erst nach Long-Press ziehen (sonst scrollt die Seite); Griff sofort. Leeres Raster: nur Tippen/Wischen.
    if (z.touch && it) z.timer = window.setTimeout(() => zug.current === z && aktivieren(z), modus === 'dauer' ? 0 : 350);
    window.addEventListener('pointermove', bewegen, { passive: false });
    window.addEventListener('pointerup', loslassen);
    window.addEventListener('pointercancel', abbrechen);
  }

  // Nicht verschiebbare Einträge (Anfragen, Vorschläge, erledigt): nur Klick (Maus: wählen) bzw. Tippen (öffnen)
  function startItem(e: React.PointerEvent, it: KalItem, griff: boolean) {
    e.stopPropagation();
    if (!it.beweglich) {
      if (e.button !== 0) return;
      const x0 = e.clientX;
      const y0 = e.clientY;
      const touch = e.pointerType !== 'mouse';
      const hoch = (u: PointerEvent) => {
        window.removeEventListener('pointerup', hoch);
        if (Math.hypot(u.clientX - x0, u.clientY - y0) > 8) return;
        if (touch) p.onOeffne(it);
        else p.onWaehle(it.key);
      };
      window.addEventListener('pointerup', hoch);
      return;
    }
    start(e, it, griff ? 'dauer' : 'verschieben');
  }

  const H = 'var(--wp-h)';
  const pos = (min: number) => `calc(${(min - ZEIT_VON * 60) / 60} * ${H})`;
  const jetztZ = zuerichTeile(new Date(p.jetzt));
  const jetztMin = minuten(jetztZ.zeit);
  const heuteCol = p.tage.indexOf(jetztZ.datum);

  return (
    <div className={`wp-raster${p.mobil ? ' mobil' : ''}`} style={{ ['--wp-n' as string]: n }}>
      {!p.mobil && (
        <div className="wp-kopfzeile" aria-hidden="true">
          <span />
          {p.tage.map((t, i) => (
            <span key={t} className={`wp-tagname${t === p.heute ? ' heute' : ''}${wochentag(t) === 0 ? ' zu' : ''}`}>
              <small>{WT_KURZ[i]}</small>
              <b className="zahl">{tagZahl(t)}</b>
            </span>
          ))}
        </div>
      )}
      {ganz.length > 0 && (
        <div className="wp-ganztags">
          <span className="wp-ganztags-label">ganztags</span>
          <div className="wp-ganztags-spalten">
            {p.tage.map((t, col) => (
              <div key={t}>
                {ganz
                  .filter((g) => g.col === col)
                  .map((g) => (
                    <button
                      key={g.item.key}
                      type="button"
                      className={`wp-ganz t-${g.item.typ}`}
                      aria-pressed={p.auswahl === g.item.key}
                      onClick={() => p.onWaehle(g.item.key)}
                      onDoubleClick={() => p.onOeffne(g.item)}
                      onPointerUp={(e) => e.pointerType !== 'mouse' && p.onOeffne(g.item)}
                    >
                      {g.item.titel}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="wp-koerper">
        <div className="wp-zeiten" aria-hidden="true">
          {Array.from({ length: stunden }).map((_, i) => (
            <span key={i} style={{ top: `calc(${i} * ${H})` }}>
              {i === 0 ? '' : `${String(ZEIT_VON + i).padStart(2, '0')}:00`}
            </span>
          ))}
        </div>
        <div
          className="wp-spalten"
          ref={spaltenRef}
          onPointerDown={(e) => start(e, null, 'neu')}
          onDoubleClick={(e) => {
            if ((e.target as HTMLElement).closest('.wp-e')) return;
            const g = geo(e.clientX, e.clientY);
            const s = zuerich(p.tage[g.col], hhmm(clamp(Math.floor(g.min / 30) * 30, ZEIT_VON * 60, ZEIT_BIS * 60 - 30)))!;
            p.onNeu({ start: s.toISOString() });
          }}
        >
          {p.tage.map((t) => {
            const h = SITE.hours[wochentag(t)];
            return (
              <div key={t} className={`wp-tag${t === p.heute ? ' heute' : ''}`}>
                {h && <div className="wp-offen" style={{ top: pos(minuten(h[0])), height: `calc(${(minuten(h[1]) - minuten(h[0])) / 60} * ${H})` }} aria-hidden="true" />}
              </div>
            );
          })}

          {heuteCol >= 0 && jetztMin >= ZEIT_VON * 60 && jetztMin <= ZEIT_BIS * 60 && (
            <div className="wp-jetzt" style={{ top: pos(jetztMin), left: `calc(${heuteCol} * 100% / ${n})`, width: `calc(100% / ${n})` }} aria-hidden="true">
              <i />
            </div>
          )}

          {segs.map((s) => {
            const it = s.item;
            const von = clamp(s.von, ZEIT_VON * 60, ZEIT_BIS * 60 - 15);
            const bis = clamp(s.bis, von + 15, ZEIT_BIS * 60);
            const kurz = bis - von <= 35;
            const breite = 100 / n / s.spalten;
            const zieht = vorschau?.key === it.key;
            return (
              <div
                key={it.key}
                role="button"
                tabIndex={0}
                aria-pressed={p.auswahl === it.key}
                aria-label={`${TYP_LABEL[it.typ]}: ${it.titel}, ${hhmm(s.von)} bis ${hhmm(s.bis)}`}
                className={`wp-e t-${it.typ}${it.offen ? ' offen' : ''}${it.erledigt ? ' erledigt' : ''}${it.beweglich ? ' beweglich' : ''}${kurz ? ' kurz' : ''}${zieht ? ' zieht' : ''}`}
                style={{
                  top: pos(von),
                  height: `calc(${(bis - von) / 60} * ${H} - 2px)`,
                  left: `calc(${s.col} * 100% / ${n} + ${s.spalte * breite}%)`,
                  width: `calc(${breite}% - 3px)`,
                }}
                title={it.notiz ? `${it.titel}\n${it.notiz}` : undefined}
                onPointerDown={(e) => startItem(e, it, false)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  p.onOeffne(it);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    p.onOeffne(it);
                  }
                }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className="wp-e-zeit zahl">
                  {hhmm(s.von)}
                  {!kurz && `–${hhmm(s.bis)}`}
                </span>
                <b className="wp-e-titel">
                  {it.typ === 'telefon' && <Icon name="telefon" />}
                  {it.wiederholung && <Icon name="zeitstrahl" />}
                  {it.titel}
                </b>
                {!kurz && <span className="wp-e-sub">{it.offen ? (it.status === 'vorgeschlagen' ? 'Vorschlag' : 'Angefragt') : it.quelle === 'termin' ? TYP_LABEL[it.typ] : it.notiz || 'Privat'}</span>}
                {it.beweglich && <span className="wp-e-griff" onPointerDown={(e) => startItem(e, it, true)} aria-hidden="true" />}
              </div>
            );
          })}

          {vorschau && (
            <div
              className={`wp-geist${vorschau.modus === 'neu' ? ' neu' : ''} t-${p.items.find((x) => x.key === vorschau.key)?.typ ?? 'neu'}`}
              style={{
                width: `calc(100% / ${n} - 3px)`,
                height: `calc(${vorschau.dauer / 60} * ${H} - 2px)`,
                transform: `translate(calc(${vorschau.col} * (100% + 3px)), calc(${(vorschau.start - ZEIT_VON * 60) / 60} * ${H}))`,
              }}
              aria-hidden="true"
            >
              <span className="wp-geist-zeit zahl">
                {hhmm(vorschau.start)} – {hhmm(vorschau.start + vorschau.dauer)}
              </span>
              <small>{vorschau.modus === 'neu' ? `Neu · ${dauerText(vorschau.dauer)}` : `${p.items.find((x) => x.key === vorschau.key)?.titel ?? ''} · ${dauerText(vorschau.dauer)}`}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
