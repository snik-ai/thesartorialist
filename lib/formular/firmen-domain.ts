// Firmenerkennung in den Lead-Formularen (Hausstandard seit 29.10.2026, portiert aus VoxCRM apps/website):
// Aus einer Firmen-E-Mail oder einer Website wird die Domain abgeleitet; der Server liest dort Logo und Namen
// (lib/formular/marke-server.ts, /api/marke/). Diese Datei ist im Browser nutzbar und bewusst ohne Importe
// (Tests laufen mit node --experimental-strip-types ohne Pfad-Aliase).

/** Freemailer und Anbieter-Postfächer: daraus lässt sich keine Firma ableiten. */
export const FREEMAILER = new Set([
  "gmail.com", "googlemail.com", "gmail.ch", "icloud.com", "me.com", "mac.com", "outlook.com", "outlook.de", "outlook.fr", "outlook.it",
  "hotmail.com", "hotmail.ch", "hotmail.de", "hotmail.fr", "hotmail.it", "live.com", "live.ch", "live.de", "live.fr", "live.it", "msn.com",
  "yahoo.com", "yahoo.de", "yahoo.fr", "yahoo.it", "yahoo.co.uk", "ymail.com", "aol.com", "aol.de",
  "proton.me", "protonmail.com", "protonmail.ch", "pm.me", "tutanota.com", "tuta.io",
  "gmx.ch", "gmx.net", "gmx.de", "gmx.at", "gmx.com", "web.de", "t-online.de", "freenet.de", "posteo.de", "posteo.ch", "mailbox.org",
  "bluewin.ch", "bluemail.ch", "sunrise.ch", "hispeed.ch", "swissonline.ch", "quickline.ch", "green.ch", "vtxmail.ch", "netplus.ch",
  "tele2.ch", "datacomm.ch", "mail.ch", "swissmail.ch", "bluewin.com", "salt.ch", "upcmail.ch", "cablecom.ch", "teleport.ch",
  "libero.it", "virgilio.it", "tiscali.it", "orange.fr", "wanadoo.fr", "free.fr", "laposte.net", "sfr.fr", "aon.at", "chello.at",
  "yandex.com", "yandex.ru", "mail.com", "mail.ru", "qq.com", "163.com",
]);

const HOST = /^(?=.{4,120}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

/**
 * Domain aus einer Website («www.firma.ch/kontakt», «https://firma.ch») oder einer E-Mail («anna@firma.ch»), ohne «www.».
 * null bei Freemailern, IP-Adressen, localhost, Test-Domains oder unvollständiger Eingabe.
 */
export function firmenDomain(eingabe: string | null | undefined): string | null {
  let v = (eingabe ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v.includes("@") && !v.includes("/")) {
    const teile = v.split("@");
    if (teile.length !== 2 || !teile[0]) return null;
    v = teile[1] ?? "";
  } else {
    v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").split(/[/?#]/)[0]!.split(":")[0]!;
    if (v.includes("@")) return null; // Benutzer:Passwort@host
  }
  v = v.replace(/^www\./, "").replace(/\.$/, "");
  if (!HOST.test(v) || FREEMAILER.has(v)) return null;
  if (/\.(local|localhost|test|example|invalid|internal|lan|home|corp)$/.test(v)) return null;
  return v;
}

export interface Marke {
  domain: string;
  /** Wie sich die Firma auf ihrer Website nennt; null, wenn unklar. */
  name: string | null;
  /** Pfad zum eigenen Logo-Abruf (/api/marke/logo/?d=…) oder null, wenn die Site kein brauchbares Icon hat. */
  icon: string | null;
}

export const markeIconPfad = (domain: string) => `/api/marke/logo/?d=${encodeURIComponent(domain)}`;
