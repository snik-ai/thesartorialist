// Termin-Erinnerung: X Stunden (Standard 2) vor dem Termin eine gebrandete Mail in der Sprache des Kunden —
// bestätigte Termine und (auf Wunsch des Ateliers) auch noch nicht bestätigte Wunschtermine.
// Idempotent: Termin wird vor dem Versand mit erinnerung_gesendet_am «reserviert»; ein Advisory-Lock verhindert,
// dass zwei Server-Instanzen gleichzeitig laufen. Schlägt der Versand fehl, wird die Reservierung zurückgenommen.
import { and, eq, inArray, isNull, ne, sql } from 'drizzle-orm';
import { db, schema, sqlClient } from '@/lib/db';
import { mailBereit, empfaenger, sendeMail } from '@/lib/mail';
import { mailTerminErinnerung, type ErinnerungZweck } from '@/lib/mail-vorlagen';
import { kundenTexte, terminTextFuer } from '@/lib/i18n/kundenmail';
import { zuerichTeile } from '@/lib/zeit';
import { aktivitaetLoggen } from './kontakte';
import { firma } from './firma';

const LOCK = 727301;

type Ergebnis = { geprueft: number; gesendet: number; fehler: number; uebersprungen?: string; vorschau?: { an: string; betreff: string; text: string }[] };

/** Fällige Termine: Start in (jetzt, jetzt + Vorlauf], noch nicht erinnert, Kontakt mit E-Mail und nicht abgemeldet. */
async function faellige(stunden: number) {
  const t = schema.termin;
  const k = schema.kontakt;
  const start = sql`coalesce(${t.bestaetigtStart}, ${t.wunschStart})`;
  return db()
    .select({ termin: t, kontakt: k })
    .from(t)
    .innerJoin(k, eq(k.id, t.kontaktId))
    .where(
      and(
        eq(t.art, 'termin'),
        // Telefontermine: Alex ruft an — keine Atelier-Erinnerung mit Adresse
        ne(t.zweck, 'telefon'),
        inArray(t.status, ['angefragt', 'bestaetigt']),
        isNull(t.erinnerungGesendetAm),
        sql`(${t.status} = 'bestaetigt' and ${t.bestaetigtStart} is not null or ${t.status} = 'angefragt' and ${t.wunschStart} is not null)`,
        sql`${start} > now()`,
        sql`${start} <= now() + make_interval(mins => ${Math.round(stunden * 60)})`,
        sql`${k.email} is not null`,
        isNull(k.abgemeldet),
      ),
    )
    .limit(50);
}

/** Ein Durchlauf. `trocken`: nur rendern und zurückgeben (Test), nichts senden, nichts markieren. */
export async function erinnerungenSenden(o: { trocken?: boolean } = {}): Promise<Ergebnis> {
  const f = await firma();
  if (!f.erinnerungAktiv) return { geprueft: 0, gesendet: 0, fehler: 0, uebersprungen: 'ausgeschaltet' };
  if (!o.trocken && !mailBereit()) return { geprueft: 0, gesendet: 0, fehler: 0, uebersprungen: 'kein Mailversand' };

  const sqlc = sqlClient();
  const reserviert = await sqlc.reserve();
  try {
    const [{ ok }] = await reserviert<{ ok: boolean }[]>`select pg_try_advisory_lock(${LOCK}) as ok`;
    if (!ok) return { geprueft: 0, gesendet: 0, fehler: 0, uebersprungen: 'läuft bereits' };
    try {
      const liste = await faellige(f.erinnerungStunden || 2);
      const erg: Ergebnis = { geprueft: liste.length, gesendet: 0, fehler: 0, vorschau: o.trocken ? [] : undefined };
      for (const { termin: t, kontakt: k } of liste) {
        const bestaetigt = t.status === 'bestaetigt';
        const start = (bestaetigt ? t.bestaetigtStart : t.wunschStart)!;
        const kunde = kundenTexte(t.sprache || k.sprache);
        const z = zuerichTeile(start);
        const m = mailTerminErinnerung(
          { name: k.name || '', email: k.email ?? undefined, datum: z.datum, zeit: z.zeit, wunschText: terminTextFuer(t.sprache || k.sprache, start), stil: [], stoffe: [], bestaetigt, zweck: t.zweck as ErinnerungZweck },
          kunde.t,
        );
        if (o.trocken) {
          erg.vorschau!.push({ an: k.email!, betreff: m.subject, text: m.text });
          continue;
        }
        // Reservieren (nur einmal), dann senden
        const [res] = await db()
          .update(schema.termin)
          .set({ erinnerungGesendetAm: new Date() })
          .where(and(eq(schema.termin.id, t.id), isNull(schema.termin.erinnerungGesendetAm)))
          .returning({ id: schema.termin.id });
        if (!res) continue;
        try {
          await sendeMail({ to: k.email!, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger() });
          await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: t.id, kanal: 'mail', richtung: 'aus', titel: bestaetigt ? 'Termin-Erinnerung per E-Mail' : 'Erinnerung an den Wunschtermin (unbestätigt) per E-Mail', text: m.text });
          erg.gesendet++;
        } catch (err) {
          console.error('[erinnerung] Versand fehlgeschlagen', t.id, (err as Error).message);
          await db().update(schema.termin).set({ erinnerungGesendetAm: null }).where(eq(schema.termin.id, t.id));
          erg.fehler++;
        }
      }
      return erg;
    } finally {
      await reserviert`select pg_advisory_unlock(${LOCK})`;
    }
  } finally {
    reserviert.release();
  }
}
