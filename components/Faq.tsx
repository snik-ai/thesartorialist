import { JsonLd, faqSchema } from './JsonLd';

export type FaqItem = { q: string; a: string[] };

// FAQ als natives <details> — kein Client-JS, voll indexierbar, plus FAQPage-Schema.
export default function Faq({ items, title = 'Häufige Fragen' }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2 className="h2">{title}</h2>
        </div>
        <div className="faq">
          {items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <div className="faq-body">
                {item.a.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
      <JsonLd data={faqSchema(items.map((i) => ({ q: i.q, a: i.a.join(' ') })))} />
    </section>
  );
}
