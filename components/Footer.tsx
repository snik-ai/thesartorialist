import Link from 'next/link';
import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import type { Sprache } from '@/lib/i18n/sprachen';
import { ziel } from './i18n/Rich';
import Sprachwahl from './i18n/Sprachwahl';
import Wordmark from './Wordmark';

export default function Footer({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).allgemein;
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brandcol">
            <Wordmark light alt={t.client.logoAlt} />
            <p>{t.footer.text}</p>
            <p>
              {SITE.address.street} · {SITE.address.postalCode} {SITE.address.city}
              <br />
              <a href={SITE.phoneHref}>{SITE.phone}</a>
              <br />
              <a href={SITE.mobileHref}>{SITE.mobile}</a>
              <br />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              <br />
              <a href={SITE.socials.instagram} target="_blank" rel="noopener">
                Instagram
              </a>
            </p>
            <Sprachwahl variante="footer" />
          </div>
          {t.footer.spalten.map((col) => (
            <div key={col.titel}>
              <p className="footer-h">{col.titel}</p>
              <ul className="footer-nav">
                {col.links.map((item) => {
                  const z = ziel(lang, item.ziel);
                  return (
                    <li key={item.ziel}>
                      {/* Glossar gibt es vorerst nur auf Deutsch: Link auf die deutsche Seite */}
                      <Link href={z.href} hrefLang={item.ziel === 'glossar' && lang !== 'de' ? 'de' : undefined}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {SITE.legalName} — {lang === 'de' ? SITE.name : t.client.logoAlt}
          </span>
          <span>
            Made with <span className="heart">♡</span> by{' '}
            <a href="https://dlm-digital.ch" target="_blank" rel="noopener">
              DLM Digital
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
