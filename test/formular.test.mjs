// Lead-Formulare: Firmenerkennung (Domain, Freemailer, SSRF-Sperren, Name/Icon/Bildtyp), E-Mail-Tippfehler, Telefon-Format.
// Ausführen (Node 22): npm run test:formular   (node --experimental-strip-types --test test/formular.test.mjs)   (ohne Netz ausser DNS für «localhost»)
import { test } from "node:test";
import assert from "node:assert/strict";
import { firmenDomain } from "../lib/formular/firmen-domain.ts";
import { emailBereinigen, emailGueltig, emailVorschlag } from "../lib/formular/email.ts";
import { telefonFormatieren, telefonGueltig, telefonLand, telefonLive, telefonMitLand, LAENDER } from "../lib/formular/telefon.ts";
import { bildTyp, holen, iconsAus, istPrivateIp, nameAus, sichererLookup, zielErlaubt } from "../lib/formular/marke-server.ts";

test("Domain aus Firmen-E-Mail und Website", () => {
  assert.equal(firmenDomain("info@dlm-digital.ch"), "dlm-digital.ch");
  assert.equal(firmenDomain("hans@thesartorialist.ch"), "thesartorialist.ch");
  assert.equal(firmenDomain("Anna@Karo-Kanaltechnik.CH "), "karo-kanaltechnik.ch");
  assert.equal(firmenDomain("www.swissconstructions.ch"), "swissconstructions.ch");
  assert.equal(firmenDomain("https://www.firma.ch/kontakt?x=1#a"), "firma.ch");
  assert.equal(firmenDomain("http://shop.firma.ch:443/"), "shop.firma.ch");
  assert.equal(firmenDomain("anna@"), null);
  assert.equal(firmenDomain("firma"), null);
  assert.equal(firmenDomain(""), null);
  assert.equal(firmenDomain(null), null);
});

test("Freemailer ergeben keine Firma", () => {
  for (const d of ["gmail.com", "bluewin.ch", "gmx.ch", "gmx.net", "outlook.com", "hotmail.com", "hotmail.ch", "icloud.com", "sunrise.ch",
    "yahoo.com", "protonmail.com", "proton.me", "hispeed.ch", "swissonline.ch", "web.de", "t-online.de", "googlemail.com", "live.com", "me.com"]) {
    assert.equal(firmenDomain(`max@${d}`), null, d);
  }
});

test("Lokale, interne und IP-Ziele werden nicht abgeleitet", () => {
  for (const v of ["http://127.0.0.1", "10.0.0.1", "localhost:3000", "http://localhost/", "anna@intranet.local", "server.internal",
    "http://[::1]/", "http://user:pw@firma.ch/", "firma.test", "a@b@firma.ch"]) {
    assert.equal(firmenDomain(v), null, v);
  }
});

test("SSRF: private Adressen werden erkannt (IPv4, IPv6, IPv4-in-IPv6)", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0",
    "224.0.0.1", "::1", "::", "fc00::1", "fd12::1", "fe80::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "2001:db8::1", "64:ff9b::7f00:1"]) {
    assert.equal(istPrivateIp(ip), true, ip);
  }
  for (const ip of ["8.8.8.8", "185.199.108.153", "172.32.0.1", "2a00:1450:4001:80b::200e"]) assert.equal(istPrivateIp(ip), false, ip);
});

test("SSRF: nur http/https, Port 80/443, kein IP-Literal, keine Zugangsdaten", () => {
  assert.equal(zielErlaubt(new URL("https://firma.ch/")), true);
  assert.equal(zielErlaubt(new URL("http://firma.ch:80/")), true);
  for (const u of ["ftp://firma.ch/", "file:///etc/passwd", "https://firma.ch:8443/", "http://127.0.0.1/", "http://[::1]/", "http://169.254.169.254/latest/",
    "http://localhost/", "https://a:b@firma.ch/", "http://intranet.local/", "http://2130706433/"]) {
    assert.equal(zielErlaubt(new URL(u)), false, u);
  }
});

test("SSRF: Abruf auf lokale Ziele scheitert vor jeder Verbindung (auch per DNS-Namen)", async () => {
  await assert.rejects(holen(new URL("http://127.0.0.1/"), 2000, 1000));
  await assert.rejects(holen(new URL("http://localhost/"), 2000, 1000));
  await assert.rejects(holen(new URL("https://firma.ch:8080/"), 2000, 1000));
  // DNS-Ebene (greift bei jeder Verbindung, auch nach Weiterleitungen und gegen DNS-Rebinding): «localhost» löst lokal auf
  const fehler = await new Promise((r) => sichererLookup("localhost", {}, (e) => r(e)));
  assert.ok(fehler instanceof Error, "localhost muss im Lookup abgelehnt werden");
});

test("Name: og:site_name zuerst, sonst passender Titel-Teil, allgemeine Titel nie", () => {
  assert.equal(nameAus('<meta property="og:site_name" content="DLM Digital">', "dlm-digital.ch"), "DLM Digital");
  assert.equal(nameAus("<title>Kanalreinigung Zürich | Karo Kanaltechnik</title>", "karo-kanaltechnik.ch"), "Karo Kanaltechnik");
  assert.equal(nameAus("<title>Startseite – Bodin Bau AG</title>", "bodin.ch"), "Bodin Bau AG");
  assert.equal(nameAus("<title>Home</title>", "x.ch"), null);
  assert.equal(nameAus("<title>Müller &amp; Söhne</title>", "mueller.ch"), "Müller & Söhne");
  assert.equal(nameAus("<html></html>", "x.ch"), null);
});

test("Icons: apple-touch-icon vor SVG vor ICO, Fallbacks am Ende, mask-icon nie", () => {
  const html = `<link rel="icon" href="/favicon.ico"><link rel="icon" type="image/svg+xml" href="/icon.svg">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="mask-icon" href="/m.svg"><link rel="icon" href="javascript:alert(1)">`;
  const liste = iconsAus(html, new URL("https://firma.ch/"));
  assert.deepEqual(liste.slice(0, 3), ["https://firma.ch/apple-touch-icon.png", "https://firma.ch/icon.svg", "https://firma.ch/favicon.ico"]);
  assert.ok(!liste.some((u) => u.endsWith("/m.svg") || u.startsWith("javascript")));
});

test("Bildtyp aus den Bytes, HTML ist kein Bild", () => {
  assert.equal(bildTyp(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
  assert.equal(bildTyp(Buffer.from([0, 0, 1, 0, 1, 0, 16, 16])), "image/x-icon");
  assert.equal(bildTyp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), "image/svg+xml");
  assert.equal(bildTyp(Buffer.from("<!doctype html><html><body>404</body></html>")), null);
});

test("E-Mail: Leerzeichen weg, Prüfung", () => {
  assert.equal(emailBereinigen(" anna @firma.ch "), "anna@firma.ch");
  assert.equal(emailGueltig("anna@firma.ch"), true);
  assert.equal(emailGueltig("anna@firma"), false);
  assert.equal(emailGueltig("anna@@firma.ch"), false);
  assert.equal(emailGueltig("anna..x@firma.ch"), false);
});

test("E-Mail: Tippfehler-Vorschlag für häufige Domains", () => {
  const faelle = {
    "anna@gmial.com": "anna@gmail.com", "anna@gmal.com": "anna@gmail.com", "anna@gamil.com": "anna@gmail.com", "anna@gmail.con": "anna@gmail.com",
    "anna@gmail.cm": "anna@gmail.com", "anna@gmial.con": "anna@gmail.com", "anna@bluwin.ch": "anna@bluewin.ch", "anna@blewin.ch": "anna@bluewin.ch",
    "anna@hotmial.com": "anna@hotmail.com", "anna@hotmail.co": "anna@hotmail.com", "anna@outlok.com": "anna@outlook.com",
    "anna@icloud.co": "anna@icloud.com", "anna@firma.con": "anna@firma.com", "anna@swisonline.ch": "anna@swissonline.ch",
  };
  for (const [ein, aus] of Object.entries(faelle)) assert.equal(emailVorschlag(ein), aus, ein);
  for (const ok of ["anna@gmail.com", "anna@bluewin.ch", "info@dlm-digital.ch", "anna@gmx.ch", "anna@web.de", "anna@firma.co.uk", "anna", "anna@"]) {
    assert.equal(emailVorschlag(ok), null, ok);
  }
});

test("Telefon: Schweizer Nummern live gliedern und international speichern", () => {
  assert.equal(telefonLive("0791234567"), "079 123 45 67");
  assert.equal(telefonLive("079 12"), "079 12");
  assert.equal(telefonLive("+41791234567"), "+41 79 123 45 67");
  assert.equal(telefonLive("0041 79 123"), "+41 79 123");
  assert.equal(telefonFormatieren("079 123 45 67"), "+41 79 123 45 67");
  assert.equal(telefonFormatieren("0041791234567"), "+41 79 123 45 67");
  assert.equal(telefonFormatieren("+41 (0)44 668 18 00"), "+41 44 668 18 00");
  assert.equal(telefonFormatieren("+49 30 1234567"), "+49 30 1234567");
  assert.equal(telefonFormatieren("0049 (0)30 123 45 67"), "+49 30 123 45 67");
  assert.equal(telefonFormatieren("+43 1 234 56 78"), "+43 1 234 56 78");
  assert.equal(telefonFormatieren(""), "");
});

test("Telefon: Prüfung, optional bleibt optional, Land erkennen und wechseln", () => {
  for (const ok of ["", "079 123 45 67", "+41 79 123 45 67", "0041791234567", "+49 30 1234567", "+43 1 234 56 78", "+423 234 56 78"]) assert.equal(telefonGueltig(ok), true, ok);
  for (const falsch of ["079 123", "12345", "+41 79 123 45 678", "abc", "079 123 45 6x"]) assert.equal(telefonGueltig(falsch), false, falsch);
  assert.equal(telefonLand("079 1")?.code, "CH");
  assert.equal(telefonLand("+49 30")?.code, "DE");
  assert.equal(telefonLand("+423 23")?.code, "LI");
  assert.equal(telefonLand(""), null);
  const de = LAENDER.find((l) => l.code === "DE");
  assert.equal(telefonMitLand("079 123 45 67", de), "+49 79 123 45 67");
  assert.equal(telefonMitLand("", de), "+49 ");
  assert.equal(telefonMitLand("+49 30 123", LAENDER[0]), "+41 30 123");
});
