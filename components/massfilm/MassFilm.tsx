'use client';

// Scroll-Film «Vom Mass zum Anzug» auf der Startseite.
// Sticky-Bühne über ~5 Bildschirmhöhen; der Scroll-Fortschritt steuert die Szene
// (Massnehmen → Papierschnitt mit Holland-&-Sherry-Stoff → Drehung → Foto im Massanzug).
// Live gezeichnet auf Canvas (szene.ts), also gestochen scharf und ohne Videodatei.
// Bilder laden erst bei Annäherung, gezeichnet wird nur in Sichtweite.
// Alle Texte stehen als echtes HTML im Dokument (Screenreader, SEO).
// «Bewegung reduzieren» → ruhige Fassung: drei Standbilder mit denselben Texten.
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { zeichne, type SzeneTexte } from './szene';

export type MassFilmTexte = SzeneTexte & {
  eyebrow: string;
  titel: string;
  schritte: { kicker: string; titel: string; text: string }[];
  schluss: { titel: string; text: string; knopf: string };
  bildAlt: string;
};

const FOTO = '/images/massanzug-zuerich.webp';
const STOFF = '/images/massfilm/stoff-grau.webp';

// Einblend-Fenster der Texte im Fortschritt p: [rein ab, voll, raus ab, weg]
const FENSTER: [number, number, number, number][] = [
  [-0.4, -0.3, 0.025, 0.065], // Kopf
  [0.065, 0.1, 0.33, 0.365],
  [0.385, 0.42, 0.575, 0.61],
  [0.635, 0.67, 0.8, 0.84],
  [0.915, 0.955, 9, 9], // Schluss
];

function sichtbar(p: number, [a, b, c, d]: [number, number, number, number]) {
  if (p <= a || p >= d) return { o: 0, y: p <= a ? 1 : -1 };
  if (p < b) {
    const t = (p - a) / (b - a);
    return { o: t, y: 1 - (1 - Math.pow(1 - t, 3)) };
  }
  if (p > c) {
    const t = (p - c) / (d - c);
    return { o: 1 - t, y: -(t * t * t) };
  }
  return { o: 1, y: 0 };
}

export default function MassFilm({ t, terminHref }: { t: MassFilmTexte; terminHref: string }) {
  const sektion = useRef<HTMLElement>(null);
  const buehne = useRef<HTMLDivElement>(null);
  const leinwand = useRef<HTMLCanvasElement>(null);
  const texte = useRef<(HTMLElement | null)[]>([]);
  const standbilder = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    const sec = sektion.current;
    const stage = buehne.current;
    const cv = leinwand.current;
    if (!sec || !stage || !cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const css = getComputedStyle(sec.querySelector('h2') ?? sec);
    const mittel = {
      stoff: null as HTMLImageElement | null,
      foto: null as HTMLImageElement | null,
      serif: css.fontFamily || 'Georgia, serif',
      sans: getComputedStyle(document.body).fontFamily || 'Arial, sans-serif',
    };
    let geladen = false;
    const laden = (onload: () => void) => {
      if (geladen) return;
      geladen = true;
      for (const [k, src] of [['stoff', STOFF], ['foto', FOTO]] as const) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = onload;
        img.src = src;
        mittel[k] = img;
      }
    };

    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Ruhige Fassung: Standbilder einmalig zeichnen
    const zeichneStandbilder = () => {
      const ps = [0.352, 0.58];
      standbilder.current.forEach((c, i) => {
        if (!c) return;
        const r = c.getBoundingClientRect();
        if (!r.width) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        c.width = Math.round(r.width * dpr);
        c.height = Math.round(r.height * dpr);
        const x = c.getContext('2d');
        if (!x) return;
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        zeichne(x, r.width, r.height, ps[i], mittel, t, true);
      });
    };

    let W = 0;
    let H = 0;
    let dpr = 1;
    const groesse = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = stage.clientWidth;
      H = stage.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    };

    const ziel = () => {
      const r = sec.getBoundingClientRect();
      const weg = r.height - H;
      return weg > 0 ? -r.top / weg : 0;
    };

    let anzeige = -1;
    let gezeichnet = NaN;
    let raf = 0;
    let aktiv = false;
    let zuletzt = 0;

    const render = (p: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      zeichne(ctx, W, H, p, mittel, t);
      texte.current.forEach((el, i) => {
        if (!el) return;
        const v = sichtbar(p, FENSTER[i]);
        el.style.opacity = String(v.o);
        el.style.transform = `translate3d(0,${(v.y * 28).toFixed(1)}px,0)`;
        el.style.visibility = v.o > 0.001 ? 'visible' : 'hidden';
      });
      gezeichnet = p;
    };

    const tick = (now: number) => {
      raf = 0;
      if (!aktiv) return;
      const z = Math.max(-0.4, Math.min(1, ziel()));
      const dt = Math.min(0.05, (now - (zuletzt || now)) / 1000);
      zuletzt = now;
      if (anzeige < -0.9 || Math.abs(z - anzeige) > 0.25) anzeige = z;
      else anzeige += (z - anzeige) * (1 - Math.exp(-dt * 9));
      if (Math.abs(z - anzeige) < 0.0004) anzeige = z;
      if (anzeige !== gezeichnet) render(anzeige);
      if (anzeige !== z) raf = requestAnimationFrame(tick);
      else zuletzt = 0;
    };
    const anstossen = () => {
      if (!raf && aktiv) raf = requestAnimationFrame(tick);
    };

    const nachLaden = () => {
      if (ruhig.matches) zeichneStandbilder();
      else if (aktiv) render(anzeige);
    };

    // Bilder erst nach dem Seitenaufbau (LCP bleibt frei) und erst, wenn die Sektion naht.
    // Der Film beginnt rein vektoriell; Stoff (ab ~45 %) und Foto (ab ~86 %) werden
    // lange vor ihrem Auftritt fertig geladen.
    const vorab = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          laden(nachLaden);
          vorab.disconnect();
        }
      },
      { rootMargin: '50% 0px' },
    );
    const beobachten = () => vorab.observe(sec);
    if (document.readyState === 'complete') beobachten();
    else window.addEventListener('load', beobachten, { once: true });

    const sicht = new IntersectionObserver(
      ([e]) => {
        aktiv = e.isIntersecting && !ruhig.matches;
        if (aktiv) {
          if (!W) groesse();
          anstossen();
        }
      },
      { rootMargin: '10% 0px' },
    );
    sicht.observe(sec);

    const ro = new ResizeObserver(() => {
      if (ruhig.matches) {
        zeichneStandbilder();
        return;
      }
      groesse();
      if (!Number.isNaN(gezeichnet)) render(gezeichnet);
      anstossen();
    });
    ro.observe(stage);

    const onScroll = () => anstossen();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onRuhig = () => {
      aktiv = !ruhig.matches;
      if (ruhig.matches) zeichneStandbilder();
      else {
        groesse();
        anstossen();
      }
    };
    ruhig.addEventListener('change', onRuhig);
    if (ruhig.matches) zeichneStandbilder();

    return () => {
      window.removeEventListener('load', beobachten);
      vorab.disconnect();
      sicht.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      ruhig.removeEventListener('change', onRuhig);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [t]);

  // Tastatur: Fokus auf den Termin-Knopf springt an das Ende des Films
  const zumSchluss = () => {
    const sec = sektion.current;
    if (!sec || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = sec.getBoundingClientRect();
    const endeY = window.scrollY + r.top + r.height - window.innerHeight;
    if (Math.abs(window.scrollY - endeY) > 4) window.scrollTo({ top: endeY, behavior: 'auto' });
  };

  return (
    <section className="mf" ref={sektion} aria-labelledby="mf-titel">
      <div className="mf-buehne" ref={buehne}>
        <canvas className="mf-leinwand" ref={leinwand} aria-hidden="true" />
        <div className="mf-kopf" ref={(el) => void (texte.current[0] = el)}>
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 id="mf-titel" className="h2">
            {t.titel}
          </h2>
        </div>
        <ol className="mf-schritte">
          {t.schritte.map((s, i) => (
            <li key={s.kicker} className="mf-schritt" ref={(el) => void (texte.current[i + 1] = el)}>
              {i < 2 && <canvas className="mf-standbild" aria-hidden="true" ref={(el) => void (standbilder.current[i] = el)} />}
              {i === 2 && <img className="mf-standbild" src={FOTO} alt={t.bildAlt} width={1500} height={1000} loading="lazy" decoding="async" />}
              <span className="mf-kicker">{s.kicker}</span>
              <h3 className="mf-h3">{s.titel}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mf-schluss" ref={(el) => void (texte.current[4] = el)}>
          <p className="mf-schluss-titel">{t.schluss.titel}</p>
          <p className="mf-schluss-text">{t.schluss.text}</p>
          <Link href={terminHref} className="btn btn--light" onFocus={zumSchluss}>
            {t.schluss.knopf}
          </Link>
        </div>
      </div>
    </section>
  );
}
