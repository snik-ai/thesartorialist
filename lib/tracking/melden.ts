// Aktionen an das cookielose Tracking melden (Browser). Ohne Tracking-Skript (Admin, DNT/GPC) passiert nichts.
// Typen: konfig_offen, konfig_kategorie, konfig_wahl, konfig_abwahl, konfig_detail, konfig_fertig, konfig_reset, konfig_stoff, konfig_start, konfig_pdf, konfig_termin, shop_warenkorb, shop_checkout, anfrage_termin, anfrage_rueckruf, anfrage_konfig, anfrage_ratgeber
export function melde(typ: string, ziel?: string) {
  try {
    const w = window as Window & { tsT?: (t: string, z?: string) => void; __tsQ?: [string, string?][] };
    if (w.tsT) w.tsT(typ, ziel);
    // Skript noch nicht geladen (z. B. «Seite geöffnet» direkt beim Hydrieren): vormerken, das Skript holt nach
    else if ((w.__tsQ ??= []).length < 50) w.__tsQ.push([typ, ziel]);
  } catch {
    /* Messung darf nie stören */
  }
}
