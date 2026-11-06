// Schutz für /admin und /api/admin: ohne Sitzungs-Cookie → Login (Seiten) bzw. 401 (API).
// Die echte Prüfung (Token gegen DB, Leerlauf, Allowlist) passiert serverseitig in lib/admin/zugang.ts.
// Alles unter /admin bekommt «noindex».
import { NextResponse, type NextRequest } from 'next/server';

const COOKIES = ['__Host-ts_admin', 'ts_admin'];
const OFFEN = ['/admin/login/', '/admin/login', '/admin/sw.js', '/admin/offline.html', '/admin/manifest.webmanifest'];

export function middleware(req: NextRequest) {
  const pfad = req.nextUrl.pathname;
  const angemeldet = COOKIES.some((c) => req.cookies.get(c)?.value);
  let res: NextResponse;
  if (angemeldet || OFFEN.includes(pfad) || pfad.startsWith('/api/login/')) {
    res = NextResponse.next();
  } else if (pfad.startsWith('/api/')) {
    res = NextResponse.json({ fehler: 'Nicht angemeldet' }, { status: 401 });
  } else {
    const ziel = new URL('/admin/login/', req.url);
    if (pfad !== '/admin/' && pfad !== '/admin') ziel.searchParams.set('weiter', pfad);
    res = NextResponse.redirect(ziel);
  }
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*', '/api/login/:path*'],
};
