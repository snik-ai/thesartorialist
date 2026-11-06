// Zeitzone Europe/Zurich — für Termine (Server und Browser gleich).
export const TZ = 'Europe/Zurich';

function teile(d: Date) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return { y: +g('year'), m: +g('month'), d: +g('day'), h: +g('hour'), min: +g('minute'), wd: g('weekday') };
}

/** Lokale Zürcher Zeit (YYYY-MM-DD, HH:MM) → Date (UTC-Zeitpunkt). */
export function zuerich(datum: string, zeit: string): Date | null {
  const md = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datum);
  const mz = /^(\d{1,2}):(\d{2})$/.exec(zeit);
  if (!md || !mz) return null;
  const soll = Date.UTC(+md[1], +md[2] - 1, +md[3], +mz[1], +mz[2]);
  let t = soll;
  for (let i = 0; i < 2; i++) {
    const p = teile(new Date(t));
    const ist = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
    t += soll - ist;
  }
  return new Date(t);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Date → { datum: YYYY-MM-DD, zeit: HH:MM, wochentag 0–6 } in Zürcher Zeit. */
export function zuerichTeile(d: Date) {
  const p = teile(d);
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.wd);
  return { datum: `${p.y}-${pad(p.m)}-${pad(p.d)}`, zeit: `${pad(p.h)}:${pad(p.min)}`, wochentag: wd };
}

/** «Montag, 10. November 2026, 14:30 Uhr» */
export function terminLang(d: Date) {
  const tag = d.toLocaleDateString('de-CH', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `${tag}, ${zuerichTeile(d).zeit} Uhr`;
}

/** Wie terminLang, aber in einer anderen Sprache: «Monday, 10 November 2026, 14:30» (en-GB). */
export function terminLangIn(d: Date, locale: string, uhrVorlage = '{zeit} Uhr') {
  const tag = d.toLocaleDateString(locale, { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `${tag}, ${uhrVorlage.replace('{zeit}', zuerichTeile(d).zeit)}`;
}

/** «Mo, 10. Nov., 14:30» */
export function terminKurz(d: Date) {
  const tag = d.toLocaleDateString('de-CH', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' });
  return `${tag}, ${zuerichTeile(d).zeit}`;
}

/** «vor 5 Min.», «gestern», «12.10.2026» */
export function relativ(d: Date, jetzt = new Date()) {
  const s = Math.round((jetzt.getTime() - d.getTime()) / 1000);
  if (s < 60) return 'gerade eben';
  if (s < 3600) return `vor ${Math.floor(s / 60)} Min.`;
  if (s < 86400) return `vor ${Math.floor(s / 3600)} Std.`;
  if (s < 2 * 86400) return 'gestern';
  if (s < 7 * 86400) return `vor ${Math.floor(s / 86400)} Tagen`;
  return d.toLocaleDateString('de-CH', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
}
