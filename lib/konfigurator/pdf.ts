// Stil-Auswahl als PDF (A4), im Browser erzeugt mit jsPDF. Keine Schatten, nur
// feine Linien und Flächen (Schatten erscheinen in der macOS-Vorschau als Blöcke).
import { SITE } from '@/lib/site';
import { optionText, type Gewaehlt } from './auswahl';

/** Bild über ein Canvas in JPEG auf Weiss umwandeln (jsPDF liest WebP nicht zuverlässig). */
async function jpeg(src: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const scale = Math.min(1, 360 / img.naturalHeight);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    const g = c.getContext('2d')!;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return { data: c.toDataURL('image/jpeg', 0.86), w: c.width, h: c.height };
  } catch {
    return null;
  }
}

export async function stilPdf(items: Gewaehlt[], name?: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 18;
  const ink: [number, number, number] = [16, 16, 16];
  const muted: [number, number, number] = [111, 108, 102];
  const line: [number, number, number] = [229, 227, 222];
  const datum = new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });

  const kopf = () => {
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...ink);
    doc.text('THE SARTORIALIST', W / 2, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setCharSpace(2.2);
    doc.text('ZÜRICH', W / 2, 25.5, { align: 'center' });
    doc.setCharSpace(0);
    doc.setDrawColor(...ink);
    doc.setLineWidth(0.4);
    doc.line(M, 31, W - M, 31);
  };

  kopf();
  let y = 42;
  doc.setFont('times', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...ink);
  doc.text('Meine Stil-Auswahl für den Massanzug', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);
  doc.text(`${name ? `${name} · ` : ''}${datum} · ${items.length} Details gewählt`, M, y);
  y += 10;

  let kat = '';
  for (const g of items) {
    if (g.kategorie !== kat) {
      if (y > 255) {
        doc.addPage();
        kopf();
        y = 42;
      }
      kat = g.kategorie;
      doc.setFillColor(246, 245, 242);
      doc.rect(M, y - 4.5, W - 2 * M, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setCharSpace(1.2);
      doc.setTextColor(...ink);
      doc.text(kat.toUpperCase(), M + 3, y + 0.8);
      doc.setCharSpace(0);
      y += 10;
    }
    if (y > 262) {
      doc.addPage();
      kopf();
      y = 42;
    }
    const h = 20;
    doc.setDrawColor(...line);
    doc.setLineWidth(0.25);
    doc.rect(M, y - 3, W - 2 * M, h);
    const im = await jpeg(g.option.image);
    if (im) {
      const ih = h - 4;
      const iw = Math.min(16, (im.w / im.h) * ih);
      doc.addImage(im.data, 'JPEG', M + 2 + (16 - iw) / 2, y - 1, iw, ih);
    }
    const tx = M + 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(g.untergruppe.toUpperCase(), tx, y + 3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ink);
    doc.text(optionText(g), tx, y + 8.5);
    if (g.option.subLabel) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(g.option.subLabel, tx, y + 13.5);
    }
    y += h + 2.5;
  }

  // Fusszeile mit Atelier-Angaben
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...line);
    doc.line(M, 280, W - M, 280);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);
    doc.text(
      `${SITE.name} · ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city} · ${SITE.phone} · ${SITE.email}`,
      W / 2,
      285,
      { align: 'center' },
    );
    doc.text('Bringen Sie diese Auswahl zum Termin mit — Stoffe und Masse wählen wir gemeinsam im Atelier.', W / 2, 289.5, { align: 'center' });
  }

  doc.save('The-Sartorialist-Stil-Auswahl.pdf');
}
