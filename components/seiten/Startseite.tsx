import type { Metadata } from 'next';
import Link from 'next/link';
import CtaBand from '@/components/CtaBand';
import InstagramBand from '@/components/InstagramBand';
import KonfiguratorFilm from '@/components/KonfiguratorFilm';
import Faq from '@/components/Faq';
import HeroVideo from '@/components/HeroVideo';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { konfigKategorienFuer, markenFuer, markenPfad } from '@/lib/i18n/inhalte';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';
import RatgeberBlock from '@/components/ratgeber/RatgeberBlock';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).start.meta;
  // Startseite: Titel ohne Vorlagen-Suffix (wie bisher auf Deutsch, das Root-Layout greift dort nicht)
  return seitenMeta(lang, 'start', {
    title: { absolute: t.titel },
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
  });
}

// Vorschau-Details für «Styles & Options» (aus den Konfigurator-Daten)
const TEASER_IDS = ['jacket-sb-2b', 'jacket-db-6x2', 'jacket-lapel-peak-r', 'jacket-pocket-patch-patch', 'jacket-shoulder-soft', 'trousers-front-double-pleat'];

const STOFFPARTNER = ['Loro Piana', 'Vitale Barberis Canonico', 'Drago', 'Reda', 'Cerruti', 'Scabal', 'Solbiati', 'Holland & Sherry', 'Zegna', 'Thomas Mason'];

const FILM_LABEL: Partial<Record<Sprache, string>> = {
  de: 'Konfigurator öffnen',
  en: 'Open the configurator',
  fr: 'Ouvrir le configurateur',
  it: 'Apri il configuratore',
  es: 'Abrir el configurador',
  'pt-pt': 'Abrir o configurador',
  ru: 'Открыть конфигуратор',
  sr: 'Otvorite konfigurator',
  sq: 'Hapni konfiguruesin',
};

export default function Startseite({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).start;
  const kats = konfigKategorienFuer(lang);
  const teaser = TEASER_IDS.flatMap((id) =>
    kats.flatMap((k) =>
      k.subCategories.flatMap((u) =>
        u.options.filter((o) => o.id === id).map((o) => ({ id, kat: k.id, gruppe: u.title.split(' — ')[0], label: o.label, image: o.image })),
      ),
    ),
  );
  const konfig = pfad(lang, 'konfigurator');
  return (
    <>
      {/* Hero */}
      <section className="hero hero--film">
        <HeroVideo t={t.film} />
        <div className="hero-content">
          <h1 className="eyebrow hero-h1">{t.hero.h1}</h1>
          <p className="display hero-quote">
            {t.hero.zitat}<span className="accent">{t.hero.zitatAkzent}</span>{t.hero.zitatEnde}
          </p>
          <p className="lead">{t.hero.lead}</p>
          <div className="hero-cta">
            <Link href={pfad(lang, 'termin')} className="btn btn--light">
              {t.hero.termin}
            </Link>
            <Link
              href={konfig}
              className="btn btn--ghost"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}
            >
              {t.hero.gestalten}
            </Link>
          </div>
        </div>
        <span className="hero-scrollcue" aria-hidden="true" />
      </section>

      {/* Stoffpartner-Marquee */}
      <div className="marquee" aria-label={t.stoffpartnerAria}>
        <div className="marquee-track">
          {[0, 1].map((i) => (
            <span aria-hidden={i === 1} key={i}>
              {STOFFPARTNER.join('  ·  ')}
            </span>
          ))}
        </div>
      </div>

      {/* USP-Leiste */}
      <div className="usp-bar">
        <div className="usp-grid">
          {t.usps.map((u) => (
            <div className="usp" key={u.titel}>
              <strong>{u.titel}</strong>
              <span className="muted">{u.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Styles & Options: Vorschau, führt zum Massanzug-Konfigurator */}
      <section className="section styles-teaser" id="styles-options">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">{t.styles.eyebrow}</span>
            <h2 className="h2">{t.styles.titel}</h2>
            <p className="lead">{t.styles.lead}</p>
          </div>
          <KonfiguratorFilm href={konfig} label={FILM_LABEL[lang] ?? FILM_LABEL.en} />
          <div className="styles-row">
            {teaser.map((x) => (
              <Link key={x.id} href={`${konfig}#${x.kat}`} className="styles-card">
                <span className="styles-card-img">
                  <img src={x.image} alt={`${x.gruppe}: ${x.label}`} width={240} height={300} loading="lazy" />
                </span>
                <span className="styles-card-g">{x.gruppe}</span>
                <span className="styles-card-l">{x.label}</span>
              </Link>
            ))}
          </div>
          <div className="styles-cta">
            <Link href={konfig} className="btn">
              {t.styles.knopf}
            </Link>
            <span className="muted">{t.styles.hinweis}</span>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section section--warm">
        <div className="container split">
          <div className="split-media">
            <img src="/images/Foto-mit-Schere.webp" alt={t.haus.bildAlt} width={800} height={1000} loading="lazy" />
          </div>
          <div className="split-body">
            <span className="eyebrow">{t.haus.eyebrow}</span>
            <h2 className="h2">{t.haus.titel}</h2>
            {t.haus.absaetze.map((a) => (
              <p key={a}>{fmt(a, { gruender: SITE.founder })}</p>
            ))}
            <ul className="checklist">
              {t.haus.liste.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <Link href={pfad(lang, 'ueberUns')} className="text-link">
              {t.haus.mehr}
            </Link>
          </div>
        </div>
      </section>

      {/* Hochzeit */}
      <section className="section">
        <div className="container split">
          <div className="split-body">
            <span className="eyebrow">{t.hochzeit.eyebrow}</span>
            <h2 className="h2">{t.hochzeit.titel}</h2>
            {t.hochzeit.absaetze.map((a) => (
              <p key={a}>{a}</p>
            ))}
            <Link href={pfad(lang, 'hochzeitsanzug')} className="btn btn--ghost">
              {t.hochzeit.knopf}
            </Link>
          </div>
          <div className="split-media">
            <img src="/images/Hochzeitsanzug-Zurich-scaled.webp" alt={t.hochzeit.bildAlt} width={800} height={1000} loading="lazy" />
          </div>
        </div>
      </section>

      {/* Gratis-Ratgeber (Lead-Magnet) — bewusst weit unten, nicht neben dem Hero */}
      <RatgeberBlock lang={lang} />

      {/* Brands */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.brands.eyebrow}</span>
            <h2 className="h2">{t.brands.titel}</h2>
          </div>
        </div>
        <div className="brand-index">
          {markenFuer(lang).map((brand) => (
            <Link key={brand.slug} href={markenPfad(lang, brand.slug)} className="brand-row">
              <span className="name">{brand.name}</span>
              <span className="claim">{brand.claim}</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Faq lang={lang} items={t.faq} title={t.faqTitel} />

      <InstagramBand lang={lang} />

      <CtaBand lang={lang} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: t.video.name,
          description: t.video.beschreibung,
          thumbnailUrl: `${SITE.url}/images/hero-film.webp`,
          uploadDate: '2020-09-17',
          duration: 'PT2M15S',
          embedUrl: 'https://player.vimeo.com/video/459093662',
          inLanguage: lang === 'de' ? 'de-CH' : undefined,
        }}
      />
    </>
  );
}
