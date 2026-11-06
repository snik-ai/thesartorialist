'use client';

// Gemeinsamer Zustand der Stil-Auswahl für alle Ansichten (Konfigurator-Seite,
// schwebender Knopf, Terminbuchung).
// Quelle ist localStorage; Änderungen gehen per Ereignis an alle Ansichten.
import { useCallback, useSyncExternalStore } from 'react';
import { CHANGE_EVENT, STOFF_KEY, STORAGE_KEY, type Auswahl } from './konst';
import type { KonfigOption, KonfigUntergruppe } from './daten';
import { mitRegeln } from './regeln';

const EMPTY = '{}';
let cacheRaw = EMPTY;
let cacheVal: Auswahl = {};

function read(): Auswahl {
  let raw = EMPTY;
  try {
    raw = localStorage.getItem(STORAGE_KEY) || EMPTY;
  } catch {}
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const v = JSON.parse(raw);
      cacheVal = v && typeof v === 'object' ? v : {};
    } catch {
      cacheVal = {};
    }
  }
  return cacheVal;
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

const SERVER: Auswahl = {};

export function setAuswahl(next: Auswahl | ((a: Auswahl) => Auswahl)) {
  const v = typeof next === 'function' ? next(read()) : next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useAuswahl() {
  const auswahl = useSyncExternalStore(subscribe, read, () => SERVER);
  const waehle = useCallback((u: KonfigUntergruppe, o: KonfigOption) => {
    setAuswahl((a) => {
      const cur = a[u.id] ?? [];
      const on = cur.includes(o.id);
      const next = on ? cur.filter((x) => x !== o.id) : u.multiSelect ? [...cur, o.id] : [o.id];
      const copy = on ? { ...a } : mitRegeln(a, u.id);
      if (next.length) copy[u.id] = next;
      else delete copy[u.id];
      return copy;
    });
  }, []);
  const entferne = useCallback((untergruppeId: string, optionId: string) => {
    setAuswahl((a) => {
      const next = (a[untergruppeId] ?? []).filter((x) => x !== optionId);
      const copy = { ...a };
      if (next.length) copy[untergruppeId] = next;
      else delete copy[untergruppeId];
      return copy;
    });
  }, []);
  const reset = useCallback(() => setAuswahl({}), []);
  return { auswahl, waehle, entferne, reset };
}

// Stoffnummern: gleiche Mechanik (localStorage + Ereignis), eigener Schlüssel
let stoffRaw = '[]';
let stoffVal: string[] = [];
function readStoffe(): string[] {
  let raw = '[]';
  try {
    raw = localStorage.getItem(STOFF_KEY) || '[]';
  } catch {}
  if (raw !== stoffRaw) {
    stoffRaw = raw;
    try {
      const v = JSON.parse(raw);
      stoffVal = Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    } catch {
      stoffVal = [];
    }
  }
  return stoffVal;
}
const NO_STOFF: string[] = [];
export function setStoffe(next: string[]) {
  try {
    localStorage.setItem(STOFF_KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function useStoffe() {
  return useSyncExternalStore(subscribe, readStoffe, () => NO_STOFF);
}
