import Link from 'next/link';
import RueckrufButton from './RueckrufButton';
import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/routen';
import type { Sprache } from '@/lib/i18n/sprachen';

export default function CtaBand({
  lang,
  title,
  text,
  eyebrow,
}: {
  lang: Sprache;
  title?: string;
  text?: string;
  eyebrow?: string;
}) {
  const t = woerterbuch(lang).allgemein.cta;
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(t.waText)}`;
  const txt = text ?? t.text;
  return (
    <section className="section section--ink cta-band">
      <div className="container">
        <span className="eyebrow">{eyebrow ?? t.eyebrow}</span>
        <h2 className="h2">{title ?? t.titel}</h2>
        {txt && <p className="muted">{txt}</p>}
        <div className="hero-cta">
          <Link href={pfad(lang, 'termin')} className="btn btn--light">
            {t.termin}
          </Link>
          <RueckrufButton className="btn btn--ghost cta-band-ghost">{t.rueckruf}</RueckrufButton>
        </div>
        <p className="cta-band-alt">
          {t.direkt} <a href={SITE.phoneHref}>{SITE.phone}</a> · <a href={wa} target="_blank" rel="noopener">WhatsApp</a> ·{' '}
          <a href={SITE.socials.instagram} target="_blank" rel="noopener">Instagram</a>
        </p>
      </div>
    </section>
  );
}
