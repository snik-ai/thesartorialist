'use client';
// Passkey im Browser: Plattform erkennen (Face ID, Touch ID, Windows Hello), einrichten, anmelden.
import { browserSupportsWebAuthn, platformAuthenticatorIsAvailable, startAuthentication, startRegistration } from '@simplewebauthn/browser';

export function plattform(): { methode: string; geraet: string } {
  if (typeof navigator === 'undefined') return { methode: 'Face ID / Passkey', geraet: 'Gerät' };
  const ua = navigator.userAgent;
  const ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (/iPhone|iPod/.test(ua)) return { methode: 'Face ID', geraet: 'iPhone' };
  if (ipad) return { methode: 'Face ID', geraet: 'iPad' };
  if (/Android/.test(ua)) return { methode: 'Fingerabdruck', geraet: 'Android' };
  if (/Macintosh|Mac OS X/.test(ua)) return { methode: 'Touch ID', geraet: 'Mac' };
  if (/Windows/.test(ua)) return { methode: 'Windows Hello', geraet: 'Windows-PC' };
  return { methode: 'Face ID / Passkey', geraet: 'Gerät' };
}

export async function geraetKann(): Promise<boolean> {
  if (typeof window === 'undefined' || !browserSupportsWebAuthn()) return false;
  try {
    return await platformAuthenticatorIsAvailable();
  } catch {
    return false;
  }
}

async function post<T>(url: string, daten: unknown): Promise<T> {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.fehler || 'Fehler');
  return j as T;
}

export async function passkeyEinrichten(name: string) {
  const v = await post<{ vorgangId: string; optionen: Parameters<typeof startRegistration>[0]['optionsJSON'] }>('/api/admin/passkey/optionen/', {});
  let antwort;
  try {
    antwort = await startRegistration({ optionsJSON: v.optionen });
  } catch (e) {
    const n = (e as { name?: string }).name;
    if (n === 'InvalidStateError') throw new Error('Auf diesem Gerät ist schon ein Passkey eingerichtet.');
    if (n === 'NotAllowedError' || n === 'AbortError') throw new Error('Abgebrochen.');
    throw new Error('Das Gerät konnte keinen Passkey erstellen.');
  }
  await post('/api/admin/passkey/pruefen/', { vorgangId: v.vorgangId, antwort, name });
  try {
    localStorage.setItem('ts.passkey', '1');
  } catch {}
}

export async function passkeyAnmelden(autofill = false) {
  const v = await post<{ vorgangId: string; optionen: Parameters<typeof startAuthentication>[0]['optionsJSON'] }>('/api/login/passkey/optionen/', {});
  const antwort = await startAuthentication({ optionsJSON: v.optionen, useBrowserAutofill: autofill });
  await post('/api/login/passkey/pruefen/', { vorgangId: v.vorgangId, antwort });
  try {
    localStorage.setItem('ts.passkey', '1');
  } catch {}
}

export function passkeyBekannt() {
  try {
    return localStorage.getItem('ts.passkey') === '1';
  } catch {
    return false;
  }
}
