// Service-Worker des Backends (Scope /admin/). Bewusst ohne Daten-Cache: Kundendaten bleiben nie offline
// im Gerät liegen. Nur eine Offline-Seite, damit die installierte App ohne Netz nicht leer bleibt.
// Dazu Web-Push: neue Terminanfragen und Rückrufe als Mitteilung, Antippen öffnet den Termin.
const OFFLINE = '/admin/offline.html';
const CACHE = 'ts-admin-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
});

/* ---------- Web-Push ---------- */

// Nur Ziele innerhalb der Admin-App öffnen
const zielUrl = (u) => {
  try {
    const url = new URL(u || '/admin/termine/', self.location.origin);
    return url.origin === self.location.origin && url.pathname.startsWith('/admin/') ? url.href : new URL('/admin/termine/', self.location.origin).href;
  } catch {
    return new URL('/admin/termine/', self.location.origin).href;
  }
};

self.addEventListener('push', (e) => {
  let d = {};
  try {
    d = e.data ? e.data.json() : {};
  } catch {
    d = { text: e.data ? e.data.text() : '' };
  }
  const titel = d.titel || 'The Sartorialist';
  e.waitUntil(
    self.registration.showNotification(titel, {
      body: d.text || 'Neue Anfrage im Backend',
      icon: '/icon-192.png',
      badge: '/admin/badge-96.png',
      tag: d.tag || undefined,
      renotify: Boolean(d.tag),
      lang: 'de-CH',
      timestamp: Date.now(),
      data: { url: zielUrl(d.url) },
    }),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = zielUrl(e.notification.data && e.notification.data.url);
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (fenster) => {
      const admin = fenster.find((f) => new URL(f.url).pathname.startsWith('/admin/'));
      if (admin) {
        await admin.focus();
        if ('navigate' in admin) return admin.navigate(url).catch(() => self.clients.openWindow(url));
        return;
      }
      return self.clients.openWindow(url);
    }),
  );
});

// Push-Dienst hat das Abo erneuert → dem Server melden (Sitzungs-Cookie geht mit, gleiche Herkunft)
self.addEventListener('pushsubscriptionchange', (e) => {
  const alt = e.oldSubscription;
  const opts = alt && alt.options ? alt.options : null;
  e.waitUntil(
    (e.newSubscription ? Promise.resolve(e.newSubscription) : opts ? self.registration.pushManager.subscribe(opts) : Promise.resolve(null)).then((neu) => {
      if (!neu) return;
      return fetch('/api/admin/push/', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: neu.toJSON(), alt: alt ? alt.endpoint : undefined }),
      }).catch(() => {});
    }),
  );
});
