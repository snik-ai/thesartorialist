import Link from 'next/link';
import RueckrufButton from './RueckrufButton';
import { SITE } from '@/lib/site';

const WA = `${SITE.whatsapp}?text=${encodeURIComponent('Grüezi, ich hätte gerne eine Beratung für einen Massanzug.')}`;

export default function CtaBand({
  title = 'Erleben Sie den Unterschied — bei einem Espresso im Showroom.',
  text = 'Eine umfassende und kostenlose Beratung an der Kuttelgasse 7 in Zürich. Beratungen ausserhalb von Zürich nach Absprache.',
  eyebrow = 'Termin oder Rückruf',
}: {
  title?: string;
  text?: string;
  eyebrow?: string;
}) {
  return (
    <section className="section section--ink cta-band">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="h2">{title}</h2>
        {text && <p className="muted">{text}</p>}
        <div className="hero-cta">
          <Link href="/termin/" className="btn btn--light">
            Termin buchen
          </Link>
          <RueckrufButton className="btn btn--ghost cta-band-ghost">Rückruf anfordern</RueckrufButton>
        </div>
        <p className="cta-band-alt">
          Lieber direkt? <a href={SITE.phoneHref}>{SITE.phone}</a> · <a href={WA} target="_blank" rel="noopener">WhatsApp</a> ·{' '}
          <a href={SITE.socials.instagram} target="_blank" rel="noopener">Instagram</a>
        </p>
      </div>
    </section>
  );
}
