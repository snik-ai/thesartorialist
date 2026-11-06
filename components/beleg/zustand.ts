"use client";
// Aus VoxCRM apps/web/components/verkauf/editor/zustand.ts übernommen (Texte deutsch statt i18n).
// Zustand des Dokument-Editors: Verlauf (Rückgängig/Wiederherstellen) und automatisches Speichern.
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

interface Verlauf<T> { vorher: T[]; jetzt: T | null; nachher: T[] }

/**
 * Wert mit Verlauf. `setze(f, gruppe)` fasst schnelle Änderungen derselben Gruppe (z. B. Tippen im selben Feld)
 * zu einem Schritt zusammen, damit Ctrl/Cmd+Z ganze Wörter statt einzelner Buchstaben zurücknimmt.
 */
export function useVerlauf<T>(anfang: T | null = null) {
  const s = useRef<Verlauf<T>>({ vorher: [], jetzt: anfang, nachher: [] });
  const letzte = useRef<{ gruppe: string | null; zeit: number }>({ gruppe: null, zeit: 0 });
  const [, neuZeichnen] = useReducer((x: number) => x + 1, 0);

  const setze = useCallback((f: (alt: T) => T, gruppe?: string) => {
    const alt = s.current.jetzt;
    if (alt === null) return;
    const neu = f(alt);
    if (neu === alt) return;
    const zeit = Date.now();
    const zusammen = !!gruppe && letzte.current.gruppe === gruppe && zeit - letzte.current.zeit < 1500;
    letzte.current = { gruppe: gruppe ?? null, zeit };
    s.current = { vorher: zusammen ? s.current.vorher : [...s.current.vorher.slice(-149), alt], jetzt: neu, nachher: [] };
    neuZeichnen();
  }, []);
  /** Ersetzt den Wert ohne Verlaufseintrag (z. B. Werte vom Server nach dem ersten Speichern). */
  const still = useCallback((f: (alt: T) => T) => {
    if (s.current.jetzt === null) return;
    s.current = { ...s.current, jetzt: f(s.current.jetzt) };
    neuZeichnen();
  }, []);
  const start = useCallback((w: T) => { s.current = { vorher: [], jetzt: w, nachher: [] }; letzte.current = { gruppe: null, zeit: 0 }; neuZeichnen(); }, []);
  const zurueck = useCallback(() => {
    const v = s.current;
    if (!v.vorher.length || v.jetzt === null) return false;
    s.current = { vorher: v.vorher.slice(0, -1), jetzt: v.vorher[v.vorher.length - 1]!, nachher: [v.jetzt, ...v.nachher] };
    letzte.current = { gruppe: null, zeit: 0 };
    neuZeichnen();
    return true;
  }, []);
  const vor = useCallback(() => {
    const v = s.current;
    if (!v.nachher.length || v.jetzt === null) return false;
    s.current = { vorher: [...v.vorher, v.jetzt], jetzt: v.nachher[0]!, nachher: v.nachher.slice(1) };
    letzte.current = { gruppe: null, zeit: 0 };
    neuZeichnen();
    return true;
  }, []);
  return { wert: s.current.jetzt, setze, still, start, zurueck, vor, kannZurueck: s.current.vorher.length > 0, kannVor: s.current.nachher.length > 0 };
}

export type SpeicherArt = "aus" | "wartet" | "ungespeichert" | "speichert" | "gespeichert" | "fehler";
export interface SpeicherStatus { art: SpeicherArt; zeit: number | null; fehler: string | null }

/**
 * Speichert automatisch, sobald sich `schluessel` (serialisierter Inhalt) ändert – entprellt, nie zwei Anfragen gleichzeitig.
 * `schluessel = null` heisst «noch nicht speicherbar» (z. B. kein Kunde gewählt). `jetztSpeichern()` speichert sofort
 * (vor Senden, Vorschau, PDF) und wartet, bis alles gespeichert ist.
 */
export function useAutosave(schluessel: string | null, speichere: () => Promise<void>, opts: { aktiv: boolean; verzoegerung?: number }) {
  const [status, setStatus] = useState<SpeicherStatus>({ art: "aus", zeit: null, fehler: null });
  const gespeichert = useRef<string | null>(null);
  const aktuell = useRef(schluessel);
  aktuell.current = schluessel;
  const fn = useRef(speichere);
  fn.current = speichere;
  const laeuft = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verzoegerung = opts.verzoegerung ?? 900;

  const lauf = useCallback(async (): Promise<void> => {
    if (laeuft.current) { await laeuft.current; if (aktuell.current !== gespeichert.current && aktuell.current !== null) return lauf(); return; }
    const k = aktuell.current;
    if (k === null || k === gespeichert.current) return;
    setStatus((s) => ({ ...s, art: "speichert", fehler: null }));
    const p = (async () => {
      try {
        await fn.current();
        gespeichert.current = k;
        setStatus({ art: aktuell.current === k ? "gespeichert" : "ungespeichert", zeit: Date.now(), fehler: null });
      } catch (e) {
        setStatus((s) => ({ ...s, art: "fehler", fehler: (e as Error).message }));
        throw e;
      }
    })();
    laeuft.current = p;
    try { await p; } finally { laeuft.current = null; }
    if (aktuell.current !== null && aktuell.current !== gespeichert.current) { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => { lauf().catch(() => {}); }, verzoegerung); }
  }, [verzoegerung]);

  useEffect(() => {
    if (!opts.aktiv) { setStatus((s) => (s.art === "aus" ? s : { art: "aus", zeit: s.zeit, fehler: null })); return; }
    if (schluessel === null) { setStatus((s) => ({ ...s, art: "wartet" })); return; }
    if (schluessel === gespeichert.current) { setStatus((s) => (s.art === "speichert" || s.art === "fehler" ? s : { ...s, art: "gespeichert" })); return; }
    setStatus((s) => (s.art === "speichert" ? s : { ...s, art: "ungespeichert" }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { lauf().catch(() => {}); }, verzoegerung);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [schluessel, opts.aktiv, lauf, verzoegerung]);

  // Nicht gespeicherte Änderungen beim Verlassen schützen
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (opts.aktiv && aktuell.current !== null && (aktuell.current !== gespeichert.current || laeuft.current)) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [opts.aktiv]);

  const jetztSpeichern = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    await lauf();
  }, [lauf]);
  /** Setzt den gespeicherten Stand: nach dem Laden eines Dokuments dessen Schlüssel, bei neuen Dokumenten "" (alles ungespeichert). */
  const basis = useCallback((k: string | null) => { gespeichert.current = k; }, []);
  const offen = schluessel !== null && schluessel !== gespeichert.current;
  return { status, jetztSpeichern, basis, offen };
}

/** Sekundentakt für «vor 2 s». */
export function useJetzt(ms = 1000) {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setT(Date.now()), ms); return () => clearInterval(i); }, [ms]);
  return t;
}

export function vorZeit(zeit: number, jetzt: number) {
  const s = Math.max(0, Math.round((jetzt - zeit) / 1000));
  if (s < 5) return "gerade eben";
  if (s < 60) return `vor ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `vor ${m} Min.`;
  const d = new Date(zeit);
  return `um ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Breite des Fensters als Modus: schmal (Karten), mittel (Seitenleiste als Schublade), breit. */
export function useBreite() {
  const [b, setB] = useState<"schmal" | "mittel" | "breit">("breit");
  useEffect(() => {
    const f = () => setB(window.innerWidth <= 900 ? "schmal" : window.innerWidth < 1320 ? "mittel" : "breit");
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return b;
}

/** Ctrl/⌘ Z, Ctrl/⌘ ⇧ Z (oder Ctrl Y) und Ctrl/⌘ S im Editor. Offene Panels behalten ihre eigene Tastatur. */
export function useEditorTasten(t: { zurueck: () => boolean; vor: () => boolean; speichern: () => void; aktiv: boolean }) {
  const r = useRef(t);
  r.current = t;
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!r.current.aktiv || !(e.metaKey || e.ctrlKey) || e.altKey) return;
      if (document.querySelector(".panel-hg")) return;
      const taste = e.key.toLowerCase();
      if (taste === "s") { e.preventDefault(); r.current.speichern(); return; }
      const el = e.target as HTMLElement | null;
      if (el?.closest(".dk-schublade, .dk-seite") && el.matches("input, textarea")) return; // Notizfeld: eigenes Rückgängig (Selektoren, i18n-ignorieren)
      if (taste === "z" && !e.shiftKey) { e.preventDefault(); r.current.zurueck(); }
      else if ((taste === "z" && e.shiftKey) || (taste === "y" && e.ctrlKey)) { e.preventDefault(); r.current.vor(); }
    };
    document.addEventListener("keydown", k, true);
    return () => document.removeEventListener("keydown", k, true);
  }, []);
}
