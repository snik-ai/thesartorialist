// Aktionen an das cookielose Tracking melden (Browser). Ohne Tracking-Skript (Admin, DNT/GPC) passiert nichts.
// Typen: konfig_start, konfig_pdf, konfig_termin, shop_warenkorb, shop_checkout, anfrage_termin, anfrage_rueckruf, anfrage_konfig
export function melde(typ: string, ziel?: string) {
  try {
    (window as Window & { tsT?: (t: string, z?: string) => void }).tsT?.(typ, ziel);
  } catch {
    /* Messung darf nie stören */
  }
}
