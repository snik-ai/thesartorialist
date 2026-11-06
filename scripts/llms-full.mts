// Erzeugt public/llms-full.txt: Firmenprofil (llms.txt) plus alle 100 Glossar-Begriffe im Volltext.
// Aufruf: npx -y tsx scripts/llms-full.mts  (nach Änderungen am Glossar erneut ausführen)
import fs from 'node:fs';
import { GLOSSAR, GRUPPEN } from '../lib/glossar';
import { SITE } from '../lib/site';

const basis = fs.readFileSync('public/llms.txt', 'utf8').trim();
const teile: string[] = [basis, '', '---', '', `# Glossar der Massschneiderei — ${GLOSSAR.length} Begriffe (vollständig)`, '',
  `> Alle Begriffe erklärt vom Atelier ${SITE.name}, ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}. Übersicht: ${SITE.url}/glossar/`, ''];
for (const g of GRUPPEN) {
  const liste = GLOSSAR.filter((b) => b.gruppe === g);
  if (!liste.length) continue;
  teile.push(`## ${g}`, '');
  for (const b of liste) {
    teile.push(`### ${b.begriff}`, '', `URL: ${SITE.url}/glossar/${b.slug}/`);
    if (b.auchGenannt?.length) teile.push(`Auch: ${b.auchGenannt.join(', ')}`);
    teile.push('', b.kurz, '');
    for (const a of b.abschnitte) teile.push(`#### ${a.titel}`, '', a.text, '');
    teile.push(`#### Beispiel: ${b.beispiel.titel}`, '', b.beispiel.text, '');
    teile.push('#### Häufige Fragen', '');
    for (const f of b.faq) teile.push(`- **${f.frage}** ${f.antwort}`);
    teile.push('');
  }
}
fs.writeFileSync('public/llms-full.txt', teile.join('\n'));
console.log(`llms-full.txt: ${GLOSSAR.length} Begriffe, ${(fs.statSync('public/llms-full.txt').size / 1024).toFixed(0)} KB`);
