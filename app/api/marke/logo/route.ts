import { firmenDomain } from "@/lib/formular/firmen-domain";
import { anfrageIp, bremse, markeLogo } from "@/lib/formular/marke-server";

// GET /api/marke/logo/?d=firma.ch – Logo (Favicon) der Firma, über unseren Server geladen (nie direkt aus dem Browser
// bei einem Drittdienst). SVG wird mit Sandbox-CSP ausgeliefert, damit es auch beim direkten Aufruf kein Skript ausführt.
// Bremse: 120 Abrufe pro IP in 10 Minuten.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const domain = firmenDomain(new URL(request.url).searchParams.get("d"));
  const erlaubt = bremse(`marke-logo:${anfrageIp(request.headers)}`, 120, 10 * 60_000);
  const logo = domain && erlaubt ? await markeLogo(domain).catch(() => null) : null;
  if (!logo) return new Response(null, { status: 404, headers: { "cache-control": "public, max-age=3600" } });
  return new Response(new Uint8Array(logo.daten), {
    headers: {
      "content-type": logo.typ,
      "cache-control": "public, max-age=604800, stale-while-revalidate=86400",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "cross-origin-resource-policy": "same-origin",
    },
  });
}
