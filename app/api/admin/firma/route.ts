// Firmeneinstellungen (DB): Firma/Dokumente, Preisliste, Logo für PDFs. GET ?logo liefert das Logo (Vorschau).
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt } from '@/lib/admin/zugang';
import { FIRMA_STANDARD, firma, logoDaten, speichern, type Firma, type KatalogEintrag } from '@/lib/crm/firma';
import { KATEGORIE_LABEL } from '@/lib/crm/belege';
import { neueId } from '@/lib/crm/geld';
import { ibanGruppen, ibanPruefen, ibanRoh, bankPruefen } from '@/lib/beleg/bank';
import { planStandardAus } from '@/lib/crm/zahlungsplan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const l = await logoDaten();
  if (!l) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(Buffer.from(l.base64, 'base64')), { headers: { 'Content-Type': l.typ, 'Cache-Control': 'private, no-store' } });
}

const zahl = (v: unknown, min: number, max: number, std: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : std;
};

export async function PUT(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');

  if (b.schluessel === 'firma') {
    const w = (b.wert ?? {}) as Record<string, unknown>;
    const alt = await firma();
    const s = (k: keyof Firma, max = 160) => (k in w ? txt(w[k], max) : (alt[k] as string));
    const iban = ibanRoh(s('iban', 40));
    const qrIban = ibanRoh(s('qrIban', 40));
    const ibP = ibanPruefen(iban, 'iban');
    if (ibP.fehler) return fehler(`IBAN: ${ibP.fehler}`);
    const qrP = ibanPruefen(qrIban, 'qr');
    if (qrP.fehler) return fehler(`QR-IBAN: ${qrP.fehler}`);
    const texte = (w.texte ?? {}) as Record<string, unknown>;
    const neu: Firma = {
      ...alt,
      name: s('name') || FIRMA_STANDARD.name,
      rechtsname: s('rechtsname'),
      strasse: s('strasse'),
      plz: s('plz', 10),
      ort: s('ort', 60),
      land: (s('land', 2) || 'CH').toUpperCase(),
      telefon: s('telefon', 40),
      email: s('email', 120),
      web: s('web', 120),
      mwstNr: s('mwstNr', 40),
      mwstPflichtig: typeof w.mwstPflichtig === 'boolean' ? w.mwstPflichtig : alt.mwstPflichtig,
      mwstSatz: zahl(w.mwstSatz ?? alt.mwstSatz, 0, 30, alt.mwstSatz),
      iban: ibanGruppen(iban),
      qrIban: ibanGruppen(qrIban),
      bank: s('bank', 80),
      zahlungsfristTage: Math.round(zahl(w.zahlungsfristTage ?? alt.zahlungsfristTage, 0, 120, 30)),
      angebotGueltigTage: Math.round(zahl(w.angebotGueltigTage ?? alt.angebotGueltigTage, 1, 365, 30)),
      anzahlungProzent: Math.round(zahl(w.anzahlungProzent ?? alt.anzahlungProzent, 0, 100, 50)),
      zahlungsplanStandard: 'zahlungsplanStandard' in w ? planStandardAus(w.zahlungsplanStandard) : planStandardAus(alt.zahlungsplanStandard),
      produktionTage: Math.round(zahl(w.produktionTage ?? alt.produktionTage, 1, 120, 20)),
      erinnerungAktiv: typeof w.erinnerungAktiv === 'boolean' ? w.erinnerungAktiv : alt.erinnerungAktiv,
      erinnerungStunden: zahl(w.erinnerungStunden ?? alt.erinnerungStunden, 0.5, 48, 2),
      mahnVorschlagAktiv: typeof w.mahnVorschlagAktiv === 'boolean' ? w.mahnVorschlagAktiv : alt.mahnVorschlagAktiv,
      mahnTage1: Math.round(zahl(w.mahnTage1 ?? alt.mahnTage1, 0, 120, 7)),
      mahnTage2: Math.round(zahl(w.mahnTage2 ?? alt.mahnTage2, 1, 180, 21)),
      mahnTage3: Math.round(zahl(w.mahnTage3 ?? alt.mahnTage3, 1, 240, 35)),
      mahnFristTage: Math.round(zahl(w.mahnFristTage ?? alt.mahnFristTage, 3, 60, 10)),
      mahnGebuehr2Rp: Math.round(zahl(w.mahnGebuehr2Rp ?? alt.mahnGebuehr2Rp, 0, 50_000, 2000)),
      mahnGebuehr3Rp: Math.round(zahl(w.mahnGebuehr3Rp ?? alt.mahnGebuehr3Rp, 0, 50_000, 4000)),
      texte: Object.fromEntries(Object.entries(alt.texte).map(([k, v]) => [k, k in texte ? txt(texte[k], 2000) : v])) as Firma['texte'],
    };
    await speichern('firma', neu);
    // Gläubiger-Adresse und Konto zusammen prüfen: speichern geht immer (die Bankdaten kommen evtl. später), die Antwort sagt,
    // ob der QR-Zahlteil bereit ist und was noch fehlt
    return NextResponse.json({ ok: true, firma: neu, bank: bankPruefen(neu) });
  }

  if (b.schluessel === 'katalog') {
    if (!Array.isArray(b.wert) || b.wert.length > 80) return fehler('Preisliste ungültig');
    const liste: KatalogEintrag[] = [];
    for (const x of b.wert as Record<string, unknown>[]) {
      const bezeichnung = txt(x?.bezeichnung, 160);
      const preis = Math.round(Number(x?.preisRp));
      if (!bezeichnung || !Number.isFinite(preis) || preis < 0 || preis > 100_000_000) return fehler('Eintrag ungültig: Bezeichnung und Preis ≥ 0');
      const kategorie = txt(x?.kategorie, 40);
      liste.push({ id: txt(x?.id, 60) || neueId(), kategorie: KATEGORIE_LABEL[kategorie] ? kategorie : 'sonstiges', bezeichnung, beschreibung: txt(x?.beschreibung, 600) || undefined, preisRp: preis });
    }
    await speichern('katalog', liste);
    return NextResponse.json({ ok: true });
  }

  if (b.schluessel === 'logo') {
    if (b.wert === null) {
      await db().delete(schema.firmaEinstellung).where(eq(schema.firmaEinstellung.schluessel, 'logo'));
      return NextResponse.json({ ok: true });
    }
    const w = (b.wert ?? {}) as Record<string, unknown>;
    const base64 = typeof w.base64 === 'string' ? w.base64.replace(/^data:[^,]+,/, '') : '';
    const buf = Buffer.from(base64, 'base64');
    if (!buf.length || buf.length > 1_000_000) return fehler('Logo bitte als PNG oder JPEG bis 1 MB.');
    // Bildtyp aus den Bytes prüfen (nicht aus der Angabe)
    const png = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const jpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    if (!png && !jpg) return fehler('Nur PNG oder JPEG.');
    await speichern('logo', { typ: png ? 'image/png' : 'image/jpeg', base64: buf.toString('base64') });
    return NextResponse.json({ ok: true });
  }

  return fehler('Unbekannte Einstellung');
}
