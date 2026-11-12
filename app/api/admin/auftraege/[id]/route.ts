// Auftrag: Planung bearbeiten (PATCH) und Aktionen (POST): Status, Tasks, Termine, Notiz, Mail «abholbereit», Storno.
import { NextResponse } from 'next/server';
import { and, eq, max } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { AblaufFehler, auftragAbschliessenWennBezahlt, auftragStatusSetzen } from '@/lib/crm/ablauf';
import { AUFTRAG_SCHRITTE } from '@/lib/crm/belege';
import { tagAus } from '@/lib/admin/belege';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';
import { mailAbholbereit } from '@/lib/mail-vorlagen';
import { terminLang } from '@/lib/zeit';
import { planAus, planPruefen } from '@/lib/crm/zahlungsplan';
import { rateRechnung, zahlungsplanSetzen } from '@/lib/crm/zahlungsplan-server';
import type { AuftragStatus, TerminZweck } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ id: string }> };
const STATUS = new Set<string>([...AUFTRAG_SCHRITTE.map((s) => s.key), 'storniert']);
const ZWECK: Record<string, string> = { massnehmen: 'Massnehmen', anprobe: 'Anprobe', abholung: 'Abholung', beratung: 'Beratung', telefon: 'Telefontermin' };

async function laden(id: string) {
  if (!UUID.test(id)) return null;
  const [au] = await db().select().from(schema.auftrag).where(eq(schema.auftrag.id, id)).limit(1);
  return au ?? null;
}

async function adminOk(id: unknown) {
  if (id === null || id === '') return null;
  if (typeof id !== 'string' || !UUID.test(id)) return undefined;
  const [u] = await db().select({ id: schema.adminUser.id }).from(schema.adminUser).where(eq(schema.adminUser.id, id)).limit(1);
  return u ? u.id : undefined;
}

/** Kurzdaten inkl. Zahlungsplan (für Tests und künftige Clients) */
export async function GET(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const au = await laden((await params).id);
  if (!au) return fehler('Auftrag nicht gefunden', 404);
  return NextResponse.json({ ok: true, auftrag: { id: au.id, nummer: au.nummer, status: au.status, totalRp: au.totalRp, zahlungsplan: au.zahlungsplan, pruefung: au.zahlungsplan ? planPruefen(au.zahlungsplan, au.totalRp) : null } });
}

export async function PATCH(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const au = await laden((await params).id);
  if (!au) return fehler('Auftrag nicht gefunden', 404);
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const set: Partial<typeof schema.auftrag.$inferInsert> = { aktualisiertAm: new Date() };
  const log: string[] = [];
  if ('titel' in b) set.titel = txt(b.titel, 160);
  if ('anlass' in b) set.anlass = txt(b.anlass, 120) || null;
  if ('bestellnotiz' in b) set.bestellnotiz = txt(b.bestellnotiz, 2000) || null;
  if ('notiz' in b) set.notiz = txt(b.notiz, 4000) || null;
  for (const feld of ['liefertermin', 'anlassDatum', 'abholungGeplant'] as const) {
    if (!(feld in b)) continue;
    const d = tagAus(b[feld]);
    if (d === undefined) return fehler('Datum ungültig');
    set[feld] = d;
    const label = { liefertermin: 'Liefertermin', anlassDatum: 'Anlass', abholungGeplant: 'Abholung geplant' }[feld];
    log.push(d ? `${label}: ${d.toLocaleDateString('de-CH', { timeZone: 'Europe/Zurich' })}` : `${label} entfernt`);
  }
  if ('zustaendigId' in b) {
    const z = await adminOk(b.zustaendigId);
    if (z === undefined) return fehler('Person ungültig');
    set.zustaendigId = z;
  }
  if ('massblattId' in b) {
    if (b.massblattId === null) set.massblattId = null;
    else {
      const id = txt(b.massblattId, 40);
      const [m] = UUID.test(id) ? await db().select().from(schema.massblatt).where(and(eq(schema.massblatt.id, id), eq(schema.massblatt.kontaktId, au.kontaktId!))).limit(1) : [];
      if (!m) return fehler('Massblatt gehört nicht zu diesem Kunden');
      set.massblattId = m.id;
      log.push(`Massblatt V${m.version} zugeordnet`);
    }
  }
  await db().update(schema.auftrag).set(set).where(eq(schema.auftrag.id, au.id));
  for (const titel of log) await aktivitaetLoggen(db(), { kontaktId: au.kontaktId!, kanal: 'system', titel: `${au.nummer}: ${titel}`, auftragId: au.id, adminUserId: a.s.user.id });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const au = await laden((await params).id);
  if (!au || !au.kontaktId) return fehler('Auftrag nicht gefunden', 404);
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const wer = a.s.user.id;
  const T = schema.auftragTask;

  try {
    switch (b.aktion) {
      case 'status': {
        const status = txt(b.status, 20) as AuftragStatus;
        if (!STATUS.has(status)) return fehler('Status ungültig');
        let liefertermin: Date | null | undefined;
        if ('liefertermin' in b) {
          liefertermin = tagAus(b.liefertermin);
          if (liefertermin === undefined) return fehler('Liefertermin ungültig');
        }
        await auftragStatusSetzen(au.id, status, wer, { liefertermin });
        // Offene Tasks dieses Schritts erledigen, wenn gewünscht (Standard: ja beim Vorwärtsgehen)
        let meldung = `Status: ${AUFTRAG_SCHRITTE.find((s) => s.key === status)?.label ?? 'Storniert'}.`;
        if (status === 'fertig' && b.mail === true) {
          const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, au.kontaktId)).limit(1);
          if (k.email && mailBereit()) {
            const m = mailAbholbereit({ name: k.name, anrede: k.anrede, titel: au.titel || 'Massanfertigung', auftragNummer: au.nummer ?? '' });
            try {
              await sendeMail({ to: k.email, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger() });
              await aktivitaetLoggen(db(), { kontaktId: k.id, kanal: 'mail', richtung: 'aus', titel: 'Abholbereit per E-Mail gemeldet', text: m.text, auftragId: au.id, adminUserId: wer });
              meldung += ' Kunde per E-Mail informiert.';
            } catch (err) {
              console.error('[auftrag] Abholbereit-Mail', (err as Error).message);
              meldung += ' Die E-Mail konnte nicht gesendet werden.';
            }
          } else meldung += ' Keine E-Mail gesendet (keine Adresse oder Versand nicht konfiguriert).';
        }
        if (status === 'abgeholt' && (await auftragAbschliessenWennBezahlt(au.id, wer))) meldung = 'Abgeholt und vollständig bezahlt — Auftrag abgeschlossen.';
        return NextResponse.json({ ok: true, meldung });
      }

      case 'task-neu': {
        const titel = txt(b.titel, 200);
        if (!titel) return fehler('Titel fehlt');
        const faellig = tagAus(b.faelligAm ?? null);
        if (faellig === undefined) return fehler('Datum ungültig');
        const z = await adminOk(b.zustaendigId ?? null);
        if (z === undefined) return fehler('Person ungültig');
        const [{ n }] = await db().select({ n: max(T.reihenfolge) }).from(T).where(eq(T.auftragId, au.id));
        await db().insert(T).values({ auftragId: au.id, titel, faelligAm: faellig, zustaendigId: z, schritt: STATUS.has(txt(b.schritt, 20)) ? (txt(b.schritt, 20) as AuftragStatus) : au.status, reihenfolge: (n ?? 0) + 1 });
        return NextResponse.json({ ok: true, meldung: 'Aufgabe hinzugefügt.' });
      }

      case 'task': {
        const taskId = txt(b.taskId, 40);
        if (!UUID.test(taskId)) return fehler('Ungültig');
        const [t] = await db().select().from(T).where(and(eq(T.id, taskId), eq(T.auftragId, au.id))).limit(1);
        if (!t) return fehler('Aufgabe nicht gefunden', 404);
        const set: Partial<typeof T.$inferInsert> = {};
        if (typeof b.erledigt === 'boolean') {
          set.erledigtAm = b.erledigt ? new Date() : null;
          set.erledigtVon = b.erledigt ? wer : null;
        }
        if ('titel' in b) {
          const titel = txt(b.titel, 200);
          if (!titel) return fehler('Titel fehlt');
          set.titel = titel;
        }
        if ('faelligAm' in b) {
          const d = tagAus(b.faelligAm);
          if (d === undefined) return fehler('Datum ungültig');
          set.faelligAm = d;
        }
        if ('zustaendigId' in b) {
          const z = await adminOk(b.zustaendigId);
          if (z === undefined) return fehler('Person ungültig');
          set.zustaendigId = z;
        }
        await db().update(T).set(set).where(eq(T.id, t.id));
        if (typeof b.erledigt === 'boolean' && b.erledigt) await aktivitaetLoggen(db(), { kontaktId: au.kontaktId, kanal: 'system', titel: `${au.nummer}: ✓ ${t.titel}`, auftragId: au.id, adminUserId: wer });
        return NextResponse.json({ ok: true });
      }

      case 'task-loeschen': {
        const taskId = txt(b.taskId, 40);
        if (!UUID.test(taskId)) return fehler('Ungültig');
        await db().delete(T).where(and(eq(T.id, taskId), eq(T.auftragId, au.id)));
        return NextResponse.json({ ok: true });
      }

      case 'termin': {
        const zweck = txt(b.zweck, 20) as TerminZweck;
        if (!ZWECK[zweck]) return fehler('Zweck ungültig');
        const start = typeof b.start === 'string' ? new Date(b.start) : null;
        if (!start || Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 3600_000) return fehler('Bitte einen Termin in der Zukunft wählen.');
        const [k] = await db().select({ sprache: schema.kontakt.sprache }).from(schema.kontakt).where(eq(schema.kontakt.id, au.kontaktId)).limit(1);
        await db().insert(schema.termin).values({
          kontaktId: au.kontaktId,
          auftragId: au.id,
          art: 'termin',
          zweck,
          status: 'bestaetigt',
          bestaetigtStart: start,
          wunschStart: start,
          wunschText: `${ZWECK[zweck]} · ${au.nummer}`,
          dauerMin: zweck === 'abholung' ? 30 : 60,
          quelle: 'atelier',
          sprache: k?.sprache ?? 'de',
          gelesenAm: new Date(),
        });
        await aktivitaetLoggen(db(), { kontaktId: au.kontaktId, kanal: 'system', titel: `${ZWECK[zweck]} geplant: ${terminLang(start)}`, auftragId: au.id, adminUserId: wer });
        if (zweck === 'anprobe' && au.status !== 'anprobe' && ['eingang', 'produktion', 'bestellt', 'mass'].includes(au.status)) {
          // Termin steht — Task «Anprobe-Termin vereinbaren» abhaken
          await db().update(T).set({ erledigtAm: new Date(), erledigtVon: wer }).where(and(eq(T.auftragId, au.id), eq(T.schritt, 'anprobe')));
        }
        if (zweck === 'abholung') await db().update(schema.auftrag).set({ abholungGeplant: start, aktualisiertAm: new Date() }).where(eq(schema.auftrag.id, au.id));
        return NextResponse.json({ ok: true, meldung: `${ZWECK[zweck]} eingetragen — der Kunde erhält 2 Stunden vorher eine Erinnerung per E-Mail.` });
      }

      case 'zahlungsplan': {
        // { plan: Zahlungsplan, nurPruefen?: boolean } → { ok, plan, pruefung: { ok, fehler, summeRp, summeProzent, betraege } }
        const plan = planAus(b.plan);
        if (!plan) return fehler('Zahlungsplan ungültig (1–6 Raten, Betrag > 0, Prozent ≤ 100, Datum YYYY-MM-DD).');
        if (b.nurPruefen === true) return NextResponse.json({ ok: true, plan, pruefung: planPruefen(plan, au.totalRp) });
        const r = await zahlungsplanSetzen(au.id, plan, wer);
        return NextResponse.json({ ok: true, plan: r.plan, pruefung: r.pruefung, meldung: `Zahlungsplan gespeichert${r.verworfen ? ` – ${r.verworfen} Rechnungsentwurf verworfen` : ''}.` });
      }

      case 'rate-rechnung': {
        // { rateId } → { ok, id, nummer } (bestehende Rechnung der Rate oder neu als Entwurf)
        const r = await rateRechnung(au.id, txt(b.rateId, 60), wer);
        return NextResponse.json({ ok: true, id: r.id, nummer: r.nummer, meldung: r.schon ? `Rechnung ${r.nummer} besteht bereits.` : `Rechnung ${r.nummer} erstellt (Entwurf).` });
      }

      case 'notiz': {
        const text = txt(b.text, 4000);
        if (!text) return fehler('Notiz ist leer.');
        await aktivitaetLoggen(db(), { kontaktId: au.kontaktId, kanal: 'notiz', titel: `Notiz zu ${au.nummer}`, text, auftragId: au.id, adminUserId: wer });
        return NextResponse.json({ ok: true, meldung: 'Notiz gespeichert.' });
      }

      default:
        return fehler('Unbekannte Aktion');
    }
  } catch (err) {
    if (err instanceof AblaufFehler) return fehler(err.message, err.status);
    throw err;
  }
}
