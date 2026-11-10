'use client';
// Web-Push im Browser der Admin-App: Umgebung erkennen, Abo anlegen/entfernen, Test auslösen.
// Wichtig für iOS: Notification.requestPermission() muss direkt in einem Klick-Handler laufen
// (Nutzer-Geste) — deshalb ist der Schlüssel vorher geladen und `aktivieren` fragt als Erstes.

export type Umgebung = {
  /** Browser kann Web-Push (Service-Worker + PushManager + Notification) */
  kann: boolean;
  /** Als App installiert (Home-Bildschirm / PWA) */
  standalone: boolean;
  ios: boolean;
  /** iOS im Safari-Tab: Push erst nach «Zum Home-Bildschirm» möglich */
  iosBrowser: boolean;
  erlaubnis: NotificationPermission | 'nicht-verfuegbar';
};

export function umgebung(): Umgebung {
  if (typeof window === 'undefined') return { kann: false, standalone: false, ios: false, iosBrowser: false, erlaubnis: 'nicht-verfuegbar' };
  const ua = navigator.userAgent;
  const ios = /iPhone|iPod|iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  // Mac-App (desktop/, WKWebView): kein Web-Push, Mitteilungen kommen dort über lib/admin/mac-app.ts
  const kann = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !('__TAURI__' in window);
  return {
    kann,
    standalone,
    ios,
    iosBrowser: ios && !standalone,
    erlaubnis: 'Notification' in window ? Notification.permission : 'nicht-verfuegbar',
  };
}

async function registrierung(): Promise<ServiceWorkerRegistration> {
  const vorhanden = await navigator.serviceWorker.getRegistration('/admin/');
  if (!vorhanden) await navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' });
  // pushManager.subscribe braucht einen aktiven Worker
  return navigator.serviceWorker.ready;
}

export async function aktuellesAbo(): Promise<PushSubscription | null> {
  if (!umgebung().kann) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration('/admin/');
    return (await reg?.pushManager.getSubscription()) ?? null;
  } catch {
    return null;
  }
}

/** sha256(endpoint) gekürzt — gleich wie serverseitig `kennung()` */
export async function kennungVon(endpoint: string) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(h))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24);
}

function schluesselBytes(b64: string) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const roh = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(roh.length);
  for (let i = 0; i < roh.length; i++) out[i] = roh.charCodeAt(i);
  return out;
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { fehler?: string }).fehler || 'Fehler');
  return j as T;
}

export type GeraetInfo = { id: string; kennung: string; geraet: string | null; erstellt: string; zuletztOk: string | null; fehler: string | null };
export const pushStatus = () => json<{ publicKey: string; geraete: GeraetInfo[] }>('/api/admin/push/');

/** Abo dem Server melden (z. B. wenn es lokal besteht, aber dem Server fehlt). */
export async function aboMelden(sub: PushSubscription) {
  return json<{ ok: true; kennung: string }>('/api/admin/push/', {
    method: 'POST',
    body: JSON.stringify({ subscription: sub.toJSON(), standalone: umgebung().standalone }),
  });
}

/**
 * Im Klick-Handler aufrufen. `publicKey` muss schon geladen sein (keine Wartezeit vor der Abfrage).
 * Fragt die Erlaubnis, abonniert, meldet dem Server und schickt sofort eine Test-Benachrichtigung.
 */
export async function aktivieren(publicKey: string): Promise<PushSubscription> {
  if (!umgebung().kann) throw new Error('Dieser Browser unterstützt keine Benachrichtigungen.');
  const erlaubnis = await Notification.requestPermission();
  if (erlaubnis !== 'granted') {
    throw new Error(
      erlaubnis === 'denied'
        ? 'Benachrichtigungen sind blockiert. Bitte in den Einstellungen des Geräts für diese App erlauben.'
        : 'Nicht erlaubt — Sie können es jederzeit erneut versuchen.',
    );
  }
  const reg = await registrierung();
  let sub = await reg.pushManager.getSubscription();
  // Abo mit anderem Schlüssel (z. B. neue DB) → neu anlegen
  if (sub && sub.options?.applicationServerKey) {
    const alt = new Uint8Array(sub.options.applicationServerKey);
    const neu = schluesselBytes(publicKey);
    if (alt.length !== neu.length || alt.some((b, i) => b !== neu[i])) {
      await sub.unsubscribe().catch(() => {});
      sub = null;
    }
  }
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: schluesselBytes(publicKey) });
  await aboMelden(sub);
  await testSenden(sub.endpoint).catch(() => {});
  return sub;
}

export async function deaktivieren() {
  const sub = await aktuellesAbo();
  if (!sub) return;
  await json('/api/admin/push/', { method: 'DELETE', body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}

export const testSenden = (endpoint?: string) =>
  json<{ ok: true }>('/api/admin/push/test/', { method: 'POST', body: JSON.stringify(endpoint ? { endpoint } : {}) });
