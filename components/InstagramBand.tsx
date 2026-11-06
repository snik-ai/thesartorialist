import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import type { Sprache } from '@/lib/i18n/sprachen';

// Instagram-Profil als Bildband (ohne Einbettung von Drittanbieter-Skripten).
const BILDER = [
  '/images/DSC_7187-scaled.webp',
  '/images/dreiteiler-anzug.webp',
  '/images/Foto-mit-Schere.webp',
  '/images/hochzeitsanzug-zuerich.webp',
  '/images/8.webp',
  '/images/navy-blauer-anzug.webp',
];
const HANDLE = '@' + SITE.socials.instagram.replace(/\/$/, '').split('/').pop();

export default function InstagramBand({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).allgemein.insta;
  return (
    <section className="section insta" aria-labelledby="insta-t">
      <div className="container insta-head">
        <div>
          <span className="eyebrow">Instagram</span>
          <h2 className="h2" id="insta-t">
            {t.titel}
          </h2>
        </div>
        <a className="btn btn--ghost" href={SITE.socials.instagram} target="_blank" rel="noopener">
          {fmt(t.folgen, { handle: HANDLE })}
        </a>
      </div>
      <a className="insta-grid" href={SITE.socials.instagram} target="_blank" rel="noopener" aria-label={fmt(t.aria, { handle: HANDLE })}>
        {BILDER.map((src, i) => (
          <span key={src} className="insta-tile">
            <img src={src} alt={t.bilder[i] ?? ''} width={480} height={480} loading="lazy" decoding="async" />
          </span>
        ))}
      </a>
    </section>
  );
}
