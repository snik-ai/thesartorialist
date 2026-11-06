'use client';
// Angebot bearbeiten und versenden: Positionen, Stil-Auswahl aus dem Konfigurator, Rabatt, Gültigkeit, Texte,
// Versand per Mail mit PDF und Online-Annahme-Link, Link kopieren (WhatsApp/SMS), Annahme im Atelier erfassen.
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import DatumPicker from './DatumPicker';
import PositionenEditor from './PositionenEditor';
import { MeldungZeile, useAktion } from './useAktion';
import { chf, rpAusText, rpZuText, summen } from '@/lib/crm/geld';
import { stilGruppen } from '@/lib/crm/status';
import { waLink } from '@/lib/crm/telefon';
import type { Position, StilZeileDb } from '@/lib/db/schema';
import type { KatalogEintrag } from '@/lib/crm/firma';

export type AngebotDaten = {
  id: string;
  nummer: string;
  status: string;
  anzeigeStatus: string;
  titel: string;
  einleitung: string;
  schluss: string;
  positionen: Position[];
  stil: StilZeileDb[];
  stoffe: string[];
  rabattProzent: number;
  rabattRp: number;
  mwstSatz: number;
  gueltigBis: string | null;
  notiz: string;
};

type StilQuelle = { terminId: string; datum: string; stil: StilZeileDb[]; stoffe: string[] };

export default function AngebotEditor({ a, kunde, katalog, stilQuellen, mailBereit, auftragId }: { a: AngebotDaten; kunde: { name: string; email: string | null; telefon: string | null; whatsappOk: boolean }; katalog: KatalogEintrag[]; stilQuellen: StilQuelle[]; mailBereit: boolean; auftragId: string | null }) {
  const router = useRouter();
  const [d, setD] = useState(a);
  const [rabattArt, setRabattArt] = useState<'kein' | 'prozent' | 'betrag'>(a.rabattProzent ? 'prozent' : a.rabattRp ? 'betrag' : 'kein');
  const [rabattText, setRabattText] = useState(a.rabattProzent ? String(a.rabattProzent) : a.rabattRp ? rpZuText(a.rabattRp) : '');
  const [geaendert, setGeaendert] = useState(false);
  const [panel, setPanel] = useState<null | 'senden' | 'annehmen' | 'ablehnen'>(null);
  const [nachricht, setNachricht] = useState('');
  const [name, setName] = useState(kunde.name);
  const [grund, setGrund] = useState('');
  const [link, setLink] = useState<string | null>(null);
  const { laedt, meldung, setMeldung, senden } = useAktion();
  const editierbar = d.status === 'entwurf' || d.status === 'gesendet';

  const set = (teil: Partial<AngebotDaten>) => {
    setD({ ...d, ...teil });
    setGeaendert(true);
  };
  const s = useMemo(() => summen(d.positionen, { rabattProzent: d.rabattProzent, rabattRp: d.rabattRp, mwstSatz: d.mwstSatz }), [d]);

  function rabatt(art: typeof rabattArt, text: string) {
    setRabattArt(art);
    setRabattText(text);
    if (art === 'kein') set({ rabattProzent: 0, rabattRp: 0 });
    else if (art === 'prozent') {
      const n = Number(text.replace(',', '.'));
      set({ rabattProzent: Number.isFinite(n) && n >= 0 && n <= 100 ? n : 0, rabattRp: 0 });
    } else set({ rabattRp: rpAusText(text) ?? 0, rabattProzent: 0 });
  }

  async function speichern(still = false) {
    const r = await senden(`/api/admin/angebote/${d.id}/`, { titel: d.titel, einleitung: d.einleitung, schluss: d.schluss, positionen: d.positionen, stil: d.stil, stoffe: d.stoffe, rabattProzent: d.rabattProzent, rabattRp: d.rabattRp, gueltigBis: d.gueltigBis, notiz: d.notiz }, 'PATCH', { still });
    if (r) {
      setGeaendert(false);
      if (!still) setMeldung({ art: 'gruen', text: 'Gespeichert.' });
    }
    return Boolean(r);
  }

  async function aktion(body: Record<string, unknown>) {
    if (geaendert && editierbar && !(await speichern(true))) return null;
    return senden<{ link?: string; id?: string; auftragId?: string }>(`/api/admin/angebote/${d.id}/`, body);
  }

  function stilUebernehmen(q: StilQuelle) {
    set({ stil: q.stil, stoffe: q.stoffe.length ? q.stoffe : d.stoffe });
  }
  function stilInBeschreibung() {
    const text = stilGruppen(d.stil)
      .map((g) => `${g.kategorie}: ${g.zeilen.map((z) => z.option).join(', ')}`)
      .join('\n');
    const i = Math.max(0, d.positionen.findIndex((p) => ['massanzug', 'smoking', 'sakko'].includes(p.kategorie)));
    if (!d.positionen.length) return;
    set({ positionen: d.positionen.map((p, j) => (j === i ? { ...p, beschreibung: [p.beschreibung, text].filter(Boolean).join('\n'), stoffnummer: p.stoffnummer || d.stoffe[0] } : p)) });
  }

  async function kopieren(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMeldung({ art: 'gruen', text: 'Link kopiert — jetzt in WhatsApp, SMS oder E-Mail einfügen.' });
    } catch {
      setMeldung({ art: 'gruen', text: `Link: ${text}` });
    }
  }

  return (
    <div className="a-beleg">
      <div className="a-beleg-haupt">
        {!editierbar && (
          <div className="a-hinweis" style={{ marginBottom: 14 }}>
            Dieses Angebot ist {d.anzeigeStatus === 'angenommen' ? 'angenommen' : d.anzeigeStatus === 'abgelehnt' ? 'abgelehnt' : 'storniert'} und kann nicht mehr bearbeitet werden.
            {auftragId && (
              <>
                {' '}
                <a href={`/admin/auftraege/${auftragId}/`} style={{ textDecoration: 'underline' }}>
                  Zum Auftrag
                </a>
              </>
            )}
          </div>
        )}
        <section className="a-karte">
          <div className="a-karte-inhalt">
            <label className="a-feld">
              <span>Titel</span>
              <input className="a-input gross" value={d.titel} onChange={(e) => set({ titel: e.target.value })} placeholder="z. B. Hochzeitsanzug dreiteilig" disabled={!editierbar} />
            </label>
            <label className="a-feld" style={{ marginBottom: 0 }}>
              <span>Einleitung</span>
              <textarea className="a-input" rows={3} value={d.einleitung} onChange={(e) => set({ einleitung: e.target.value })} disabled={!editierbar} />
            </label>
          </div>
        </section>

        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Positionen</h2>
            <span className="a-sub" style={{ margin: 0 }}>
              Preise inkl. MWST
            </span>
          </div>
          <div className="a-karte-inhalt">
            <PositionenEditor positionen={d.positionen} onChange={(p) => set({ positionen: p })} katalog={katalog} gesperrt={!editierbar} />
          </div>
        </section>

        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Stil-Auswahl</h2>
            <span className="a-sub zahl" style={{ margin: 0 }}>
              {d.stil.length} Details
            </span>
          </div>
          <div className="a-karte-inhalt a-aktionen">
            {stilQuellen.length > 0 && editierbar && (
              <div>
                <span className="a-kicker">Aus dem Konfigurator übernehmen</span>
                <div className="a-chips">
                  {stilQuellen.map((q) => (
                    <button key={q.terminId} type="button" className="a-chip" onClick={() => stilUebernehmen(q)}>
                      <Icon name="mass" /> Anfrage vom {q.datum} · {q.stil.length} Details
                    </button>
                  ))}
                </div>
              </div>
            )}
            {d.stoffe.length > 0 && (
              <div className="a-stoffe">
                {d.stoffe.map((x) => (
                  <span key={x} className="a-stoff">
                    <i />
                    {x}
                  </span>
                ))}
              </div>
            )}
            {d.stil.length === 0 ? (
              <p className="a-sub" style={{ margin: 0 }}>
                Keine Stil-Auswahl. Hat der Kunde den Konfigurator genutzt, lässt sie sich hier übernehmen — sie erscheint dann im Angebot und auf dem PDF.
              </p>
            ) : (
              <div className="a-stil">
                {stilGruppen(d.stil).map((g) => (
                  <section key={g.kategorie} className="a-stil-gruppe">
                    <h3>
                      {g.kategorie}
                      <span className="zahl">{g.zeilen.length}</span>
                    </h3>
                    <ul>
                      {g.zeilen.map((z, i) => (
                        <li key={i}>
                          <span>{z.untergruppe}</span>
                          <b>{z.option}</b>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
            {editierbar && d.stil.length > 0 && (
              <div className="a-knopfreihe">
                <button type="button" className="a-knopf linie klein" onClick={stilInBeschreibung} disabled={!d.positionen.length}>
                  In Positionsbeschreibung übernehmen
                </button>
                <button type="button" className="a-knopf leise klein" onClick={() => set({ stil: [], stoffe: [] })}>
                  Entfernen
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="a-karte">
          <div className="a-karte-inhalt">
            <label className="a-feld">
              <span>Schlusstext</span>
              <textarea className="a-input" rows={3} value={d.schluss} onChange={(e) => set({ schluss: e.target.value })} disabled={!editierbar} />
            </label>
            <label className="a-feld" style={{ marginBottom: 0 }}>
              <span>Interne Notiz (nicht auf dem Angebot)</span>
              <textarea className="a-input" rows={2} value={d.notiz} onChange={(e) => set({ notiz: e.target.value })} />
            </label>
          </div>
        </section>
      </div>

      <aside className="a-beleg-seite">
        <section className="a-karte a-summe">
          <div className="a-karte-inhalt">
            <div className="a-summe-zeile">
              <span>Zwischentotal</span>
              <b className="zahl">{chf(s.zwischenRp)}</b>
            </div>
            <div className="a-rabatt">
              <div className="a-segment klein" role="group" aria-label="Rabatt">
                {(
                  [
                    ['kein', 'Kein Rabatt'],
                    ['prozent', '%'],
                    ['betrag', 'CHF'],
                  ] as const
                ).map(([k, l]) => (
                  <button key={k} type="button" aria-pressed={rabattArt === k} disabled={!editierbar} onClick={() => rabatt(k, k === rabattArt ? rabattText : '')}>
                    {l}
                  </button>
                ))}
              </div>
              {rabattArt !== 'kein' && (
                <input className="a-input zahl" inputMode="decimal" value={rabattText} onChange={(e) => rabatt(rabattArt, e.target.value)} placeholder={rabattArt === 'prozent' ? 'z. B. 10' : 'z. B. 200'} aria-label="Rabatt" disabled={!editierbar} />
              )}
            </div>
            {s.rabattRp > 0 && (
              <div className="a-summe-zeile">
                <span>Rabatt{d.rabattProzent ? ` ${d.rabattProzent} %` : ''}</span>
                <b className="zahl">− {chf(s.rabattRp)}</b>
              </div>
            )}
            <div className="a-summe-total">
              <span>Total</span>
              <b className="zahl">{chf(s.totalRp)}</b>
            </div>
            {d.mwstSatz > 0 && (
              <div className="a-summe-zeile leise">
                <span>inkl. MWST {String(d.mwstSatz).replace('.', ',')} %</span>
                <span className="zahl">{chf(s.mwstRp)}</span>
              </div>
            )}
            <DatumPicker
              label="Gültig bis"
              wert={d.gueltigBis}
              onChange={(v) => set({ gueltigBis: v })}
              abHeute
              schnell={[
                ['14 Tage', 14],
                ['30 Tage', 30],
                ['60 Tage', 60],
              ]}
            />
            {editierbar && (
              <button type="button" className={`a-knopf voll${geaendert ? '' : ' linie'}`} style={{ marginTop: 16 }} disabled={laedt || !geaendert} onClick={() => speichern()}>
                {geaendert ? 'Änderungen speichern' : 'Gespeichert'}
              </button>
            )}
          </div>
        </section>

        <section className="a-karte">
          <div className="a-karte-kopf">
            <h2>Versand &amp; Annahme</h2>
          </div>
          <div className="a-karte-inhalt a-aktionen">
            <a href={`/api/admin/angebote/${d.id}/pdf/`} target="_blank" rel="noopener" className="a-knopf linie voll" onClick={async (e) => {
              if (geaendert && editierbar) {
                e.preventDefault();
                if (await speichern(true)) window.open(`/api/admin/angebote/${d.id}/pdf/`, '_blank', 'noopener');
              }
            }}>
              <Icon name="pdf" /> PDF ansehen
            </a>
            {editierbar && (
              <>
                <button type="button" className="a-knopf gold voll" onClick={() => setPanel(panel === 'senden' ? null : 'senden')} aria-expanded={panel === 'senden'}>
                  <Icon name="senden" /> {d.status === 'gesendet' ? 'Erneut senden' : 'An Kunden senden'}
                </button>
                {panel === 'senden' && (
                  <div className="a-unterpanel">
                    {kunde.email ? (
                      <p className="a-sub" style={{ margin: 0 }}>
                        An <b>{kunde.email}</b> — mit PDF und Link zur Online-Annahme.
                      </p>
                    ) : (
                      <p className="a-sub" style={{ margin: 0 }}>
                        Keine E-Mail-Adresse. Erstellen Sie den Link und senden Sie ihn per WhatsApp oder SMS.
                      </p>
                    )}
                    {kunde.email && (
                      <label className="a-feld" style={{ margin: 0 }}>
                        <span>Persönliche Nachricht (optional)</span>
                        <textarea className="a-input" rows={3} value={nachricht} onChange={(e) => setNachricht(e.target.value)} placeholder="Vielen Dank für den schönen Termin …" />
                      </label>
                    )}
                    {kunde.email && (
                      <button
                        type="button"
                        className="a-knopf voll"
                        disabled={laedt || !mailBereit || s.totalRp <= 0}
                        onClick={async () => {
                          const r = await aktion({ aktion: 'senden', nachricht });
                          if (r?.link) {
                            setLink(r.link);
                            setPanel(null);
                          }
                        }}
                      >
                        {mailBereit ? 'Per E-Mail senden' : 'E-Mail-Versand nicht konfiguriert'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="a-knopf linie voll"
                      disabled={laedt || s.totalRp <= 0}
                      onClick={async () => {
                        const r = await aktion({ aktion: 'link' });
                        if (r?.link) {
                          setLink(r.link);
                          kopieren(r.link);
                        }
                      }}
                    >
                      <Icon name="link" /> Nur Link erstellen &amp; kopieren
                    </button>
                    <p className="a-sub" style={{ fontSize: 12, margin: 0 }}>
                      Jeder neue Link ersetzt den vorherigen. Der Link zeigt das Angebot ohne Login, nicht indexiert.
                    </p>
                  </div>
                )}
                {link && (
                  <div className="a-link-box">
                    <input className="a-input" readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Annahme-Link" />
                    <button type="button" className="a-knopf klein" onClick={() => kopieren(link)}>
                      <Icon name="kopieren" /> Kopieren
                    </button>
                    {kunde.telefon && kunde.whatsappOk && (
                      <a className="a-knopf klein gruen" target="_blank" rel="noopener" href={waLink(kunde.telefon, `Grüezi ${kunde.name.split(' ')[0]}, hier ist Ihr Angebot von The Sartorialist Zürich: ${link}`)}>
                        <Icon name="whatsapp" /> WhatsApp
                      </a>
                    )}
                  </div>
                )}
                <button type="button" className="a-knopf linie voll" onClick={() => setPanel(panel === 'annehmen' ? null : 'annehmen')} aria-expanded={panel === 'annehmen'}>
                  <Icon name="check" /> Annahme im Atelier erfassen
                </button>
                {panel === 'annehmen' && (
                  <div className="a-unterpanel">
                    <p className="a-sub" style={{ margin: 0 }}>
                      Mündlich oder unterschrieben zugesagt? Der Kontakt wird Kunde, der Auftrag mit Planung entsteht.
                    </p>
                    <label className="a-feld" style={{ margin: 0 }}>
                      <span>Angenommen von</span>
                      <input className="a-input" value={name} onChange={(e) => setName(e.target.value)} />
                    </label>
                    <button
                      type="button"
                      className="a-knopf voll"
                      disabled={laedt || s.totalRp <= 0}
                      onClick={async () => {
                        const r = await aktion({ aktion: 'annehmen', name, mail: Boolean(kunde.email) && mailBereit });
                        if (r?.auftragId) router.push(`/admin/auftraege/${r.auftragId}/`);
                      }}
                    >
                      Angenommen — Auftrag eröffnen
                    </button>
                  </div>
                )}
                <div className="a-knopfreihe">
                  <button type="button" className="a-knopf leise klein" onClick={() => setPanel(panel === 'ablehnen' ? null : 'ablehnen')}>
                    Abgelehnt
                  </button>
                  <button
                    type="button"
                    className="a-knopf leise klein"
                    onClick={async () => {
                      const r = await aktion({ aktion: 'duplizieren' });
                      if (r?.id) router.push(`/admin/angebote/${r.id}/`);
                    }}
                  >
                    Duplizieren
                  </button>
                  {d.status === 'entwurf' ? (
                    <button
                      type="button"
                      className="a-knopf leise klein rot"
                      onClick={async () => {
                        if (!confirm('Entwurf löschen?')) return;
                        if (await senden(`/api/admin/angebote/${d.id}/`, undefined, 'DELETE', { ohneRefresh: true })) router.push('/admin/angebote/');
                      }}
                    >
                      Löschen
                    </button>
                  ) : (
                    <button type="button" className="a-knopf leise klein rot" onClick={() => confirm('Angebot stornieren? Der Link wird ungültig.') && aktion({ aktion: 'stornieren' })}>
                      Stornieren
                    </button>
                  )}
                </div>
                {panel === 'ablehnen' && (
                  <div className="a-unterpanel">
                    <label className="a-feld" style={{ margin: 0 }}>
                      <span>Grund (optional)</span>
                      <input className="a-input" value={grund} onChange={(e) => setGrund(e.target.value)} placeholder="z. B. Budget, Zeitpunkt" />
                    </label>
                    <button type="button" className="a-knopf linie voll" disabled={laedt} onClick={() => aktion({ aktion: 'ablehnen', grund, verloren: true })}>
                      Als abgelehnt markieren (Lead verloren)
                    </button>
                  </div>
                )}
              </>
            )}
            {!editierbar && d.status !== 'angenommen' && (
              <button type="button" className="a-knopf linie voll" onClick={() => aktion({ aktion: 'oeffnen' })}>
                Wieder als Entwurf öffnen
              </button>
            )}
            {!editierbar && (
              <button
                type="button"
                className="a-knopf leise klein"
                onClick={async () => {
                  const r = await aktion({ aktion: 'duplizieren' });
                  if (r?.id) router.push(`/admin/angebote/${r.id}/`);
                }}
              >
                Als neues Angebot kopieren
              </button>
            )}
            <MeldungZeile m={meldung} />
          </div>
        </section>
      </aside>
    </div>
  );
}
