import { SITE } from '@/lib/site';

// Instagram-Profil als Bildband (ohne Einbettung von Drittanbieter-Skripten).
const BILDER = [
  { src: '/images/DSC_7187-scaled.webp', alt: 'Massanzug im Atelier The Sartorialist Zürich' },
  { src: '/images/dreiteiler-anzug.webp', alt: 'Dreiteiler nach Mass mit Fensterkaro' },
  { src: '/images/Foto-mit-Schere.webp', alt: 'Schneiderschere und Stoff im Atelier' },
  { src: '/images/hochzeitsanzug-zuerich.webp', alt: 'Hochzeitsanzug nach Mass aus Zürich' },
  { src: '/images/8.webp', alt: 'Manschette mit Seidenknoten' },
  { src: '/images/navy-blauer-anzug.webp', alt: 'Navyblauer Massanzug' },
];
const HANDLE = '@' + SITE.socials.instagram.replace(/\/$/, '').split('/').pop();

export default function InstagramBand() {
  return (
    <section className="section insta" aria-labelledby="insta-t">
      <div className="container insta-head">
        <div>
          <span className="eyebrow">Instagram</span>
          <h2 className="h2" id="insta-t">
            Neues aus dem Atelier
          </h2>
        </div>
        <a className="btn btn--ghost" href={SITE.socials.instagram} target="_blank" rel="noopener">
          {HANDLE} folgen
        </a>
      </div>
      <a className="insta-grid" href={SITE.socials.instagram} target="_blank" rel="noopener" aria-label={`The Sartorialist auf Instagram (${HANDLE})`}>
        {BILDER.map((b) => (
          <span key={b.src} className="insta-tile">
            <img src={b.src} alt={b.alt} width={480} height={480} loading="lazy" decoding="async" />
          </span>
        ))}
      </a>
    </section>
  );
}
