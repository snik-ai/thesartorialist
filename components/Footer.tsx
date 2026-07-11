import Link from 'next/link';
import { SITE, FOOTER_NAV } from '@/lib/site';
import Wordmark from './Wordmark';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brandcol">
            <Wordmark light />
            <p>
              Massanzüge, Hochzeitsanzüge und exklusive italienische Herrenmode — Full
              Canvas, 100&nbsp;% Made in Italy, ab CHF&nbsp;1’690.
            </p>
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
          </div>
          {FOOTER_NAV.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul className="footer-nav">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {SITE.legalName} — {SITE.name}
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
