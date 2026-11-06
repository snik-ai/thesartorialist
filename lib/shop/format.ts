// Preise im Schweizer Format: CHF 1'234.50 bzw. CHF 730.–
export function chf(n: number): string {
  const [int, dec] = n.toFixed(2).split('.');
  const s = int.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return dec === '00' ? `CHF ${s}.–` : `CHF ${s}.${dec}`;
}

/** Auf ganze Wörter kürzen (Meta-Description ≤ 155 Zeichen). */
export function clip(s: string, max = 155): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s–-]+$/, '') + '…';
}
