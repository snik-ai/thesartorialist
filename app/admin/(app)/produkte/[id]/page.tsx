// Produkt-Detail (wie VoxCRM /produkte/[id]): Bild, Preis, Varianten, Vorschau als Position, Verwendung in Belegen.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import ProduktAktionen from '@/components/produkte/ProduktAktionen';
import { KATEGORIE_LABEL, MWST_SAETZE, preisSpanne } from '@/components/produkte/typen';
import { produktLaden, produktVerwendet } from '@/components/produkte/server';
import { chf, chfKurz } from '@/lib/crm/geld';
import { UUID } from '@/lib/admin/zugang';
import '../produkte.css';

export const metadata: Metadata = { title: 'Produkt' };
export const dynamic = 'force-dynamic';

export default async function ProduktSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = UUID.test(id) ? await produktLaden(id) : null;
  if (!p) notFound();
  const verwendet = await produktVerwendet(id);
  const sp = preisSpanne(p);
  const varianten = p.varianten;
  const satz = MWST_SAETZE.find((m) => m.satz === p.mwstSatz);

  return (
    <>
      <Link href="/admin/produkte/" className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> Alle Produkte
      </Link>
      <div className="a-kopf">
        <div style={{ minWidth: 0 }}>
          <span className="a-kicker">{KATEGORIE_LABEL[p.kategorie]}</span>
          <h1>{p.name}</h1>
          <p className="a-sub">
            {!p.aktiv && <span className="a-pill erledigt">Inaktiv</span>} {verwendet ? `In ${verwendet} Beleg${verwendet === 1 ? '' : 'en'} verwendet` : 'Noch in keinem Beleg verwendet'}
          </p>
        </div>
        <div className="a-knopfreihe">
          <Link href={`/admin/produkte/${p.id}/bearbeiten/`} className="a-knopf gold">
            <Icon name="stift" /> Bearbeiten
          </Link>
        </div>
      </div>

      <div className="pd-detail">
        <div className="pd-detail-haupt">
          <section className="a-karte">
            <div className="pd-detail-kopf">
              <span className="pd-detail-bild">
                {p.bild ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.bild} alt="" />
                ) : (
                  <i>{p.name.slice(0, 1)}</i>
                )}
              </span>
              <div className="pd-detail-zahlen">
                <span className="a-kicker">Preis inkl. MWST</span>
                <b className="zahl">{sp.von === 0 && sp.bis === 0 ? 'Preis offen' : sp.von === sp.bis ? chf(sp.von) : `${chfKurz(sp.von)} – ${chf(sp.bis, false)}`}</b>
                <dl className="a-daten">
                  <dt>Kategorie</dt>
                  <dd>{KATEGORIE_LABEL[p.kategorie]}</dd>
                  <dt>Einheit</dt>
                  <dd>{p.einheit}</dd>
                  <dt>MWST</dt>
                  <dd className="zahl">
                    {p.mwstSatz} %{satz ? ` · ${satz.label}` : ''}
                  </dd>
                </dl>
              </div>
            </div>
            {p.beschreibung && <p className="pd-detail-besch">{p.beschreibung}</p>}
          </section>

          <section className="a-karte" style={{ marginTop: 18 }}>
            <div className="a-karte-kopf">
              <h2>Varianten</h2>
              <span className="a-sub zahl" style={{ margin: 0 }}>
                {varianten.length || 'keine'}
              </span>
            </div>
            {varianten.length === 0 ? (
              <div className="a-karte-inhalt">
                <p className="pd-hinweis">Ohne Varianten — in der Positionssuche mit {p.preisRp ? chf(p.preisRp) : 'offenem Preis'}.</p>
              </div>
            ) : (
              <div className="pd-var-liste">
                {varianten.map((v) => (
                  <div key={v.id} className={`pd-var-zeile${v.aktiv ? '' : ' aus'}`}>
                    <span>
                      <b>{v.name}</b>
                      {!v.aktiv && <small>ausgeblendet</small>}
                    </span>
                    <span className="zahl">{chf(v.preisRp)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="pd-detail-seite">
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>So erscheint es im Angebot</h2>
            </div>
            <div className="a-karte-inhalt">
              {(varianten.filter((v) => v.aktiv).length ? varianten.filter((v) => v.aktiv) : [{ id: 'x', name: '', preisRp: p.preisRp, aktiv: true }]).slice(0, 4).map((v) => (
                <div key={v.id} className="pd-pos-vorschau">
                  <div>
                    <b>{v.name ? `${p.name} · ${v.name}` : p.name}</b>
                    {p.beschreibung && <span>{p.beschreibung}</span>}
                  </div>
                  <span className="zahl">
                    1 {p.einheit} · {chf(v.preisRp)}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="a-karte" style={{ marginTop: 18 }}>
            <div className="a-karte-kopf">
              <h2>Status</h2>
            </div>
            <div className="a-karte-inhalt">
              <ProduktAktionen id={p.id} aktiv={p.aktiv} verwendet={verwendet} />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
