import { firmenDomain, markeIconPfad, type Marke } from "@/lib/formular/firmen-domain";
import { anfrageIp, bremse, marke } from "@/lib/formular/marke-server";

// GET /api/marke/?d=firma.ch – Name und Logo-Adresse einer Firma für die Lead-Formulare (Firmenerkennung).
// Antwortet immer 200 mit {marke: null}, wenn nichts erkannt wird (Freemailer, keine Website, Fehler): Das Formular
// funktioniert ohne Erkennung genauso. Bremse: 30 Abfragen pro IP in 10 Minuten.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const domain = firmenDomain(new URL(request.url).searchParams.get("d"));
  if (!domain) return Response.json({ marke: null });
  if (!bremse(`marke:${anfrageIp(request.headers)}`, 30, 10 * 60_000)) return Response.json({ marke: null }, { status: 429 });
  let antwort: Marke | null = null;
  try {
    const m = await marke(domain);
    if (m.name || m.icon) antwort = { domain, name: m.name, icon: m.icon ? markeIconPfad(domain) : null };
  } catch { /* still: keine Erkennung */ }
  return Response.json({ marke: antwort }, { headers: { "cache-control": "private, max-age=3600" } });
}
