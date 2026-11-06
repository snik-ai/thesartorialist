// Serverseitige Prüfung für /admin (Seiten) und /api/admin (Route Handlers).
// Die Middleware prüft nur, ob ein Cookie da ist — die echte Prüfung passiert hier, gegen die DB.
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { dbBereit } from '@/lib/db';
import { aktuelleSitzung, type AdminSitzung } from './sitzung';
import { herkunftOk } from './sicherheit';

/** Für Server Components unter /admin: ohne gültige Sitzung → Login. */
export async function brauchtAdmin(): Promise<AdminSitzung> {
  if (!dbBereit()) redirect('/admin/login/?fehler=db');
  const s = await aktuelleSitzung();
  if (!s) redirect('/admin/login/');
  return s;
}

type Ergebnis = { ok: true; s: AdminSitzung } | { ok: false; antwort: NextResponse };

/** Für Route Handlers unter /api/admin: Sitzung + CSRF (Origin) prüfen. */
export async function apiAdmin(req: Request): Promise<Ergebnis> {
  if (!dbBereit()) return { ok: false, antwort: NextResponse.json({ fehler: 'Datenbank nicht konfiguriert' }, { status: 503 }) };
  if (!herkunftOk(req)) return { ok: false, antwort: NextResponse.json({ fehler: 'Ungültige Herkunft' }, { status: 403 }) };
  const s = await aktuelleSitzung();
  if (!s) return { ok: false, antwort: NextResponse.json({ fehler: 'Nicht angemeldet' }, { status: 401 }) };
  return { ok: true, s };
}

export const fehler = (text: string, status = 400) => NextResponse.json({ fehler: text }, { status });

export async function jsonBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json();
    return b && typeof b === 'object' && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const txt = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
