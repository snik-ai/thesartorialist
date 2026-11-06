'use client';
// Produkt anlegen / bearbeiten als eigene Seite (wie VoxCRM components/produkte/ProduktEditor.tsx): Grunddaten, Preis & MWST,
// Varianten (z. B. Stoffqualität Super 110–180), Bild. Fehler stehen direkt am Feld, Enter speichert.
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import { chf, rpAusText, rpZuText } from '@/lib/crm/geld';
import type { ProduktKategorie } from '@/lib/db/schema';
import { BILD_MAX, EINHEITEN, KATEGORIEN, MWST_SAETZE, type ProduktDaten } from './typen';

type Zeile = { key: string; id?: string; name: string; preis: string; aktiv: boolean };
type Werte = { name: string; kategorie: ProduktKategorie; beschreibung: string; preis: string; mwstSatz: number; einheit: string; aktiv: boolean; zeilen: Zeile[] };

const schluessel = () => Math.random().toString(36).slice(2, 10);
const LEER = (): Werte => ({ name: '', kategorie: 'massanzug', beschreibung: '', preis: '', mwstSatz: 8.1, einheit: 'Stk.', aktiv: true, zeilen: [] });
const ausProdukt = (p: ProduktDaten): Werte => ({
  name: p.name,
  kategorie: p.kategorie,
  beschreibung: p.beschreibung ?? '',
  preis: p.preisRp ? rpZuText(p.preisRp) : '',
  mwstSatz: p.mwstSatz,
  einheit: p.einheit,
  aktiv: p.aktiv,
  zeilen: p.varianten.map((v) => ({ key: v.id, id: v.id, name: v.name, preis: v.preisRp ? rpZuText(v.preisRp) : '', aktiv: v.aktiv })),
});
const STOFF_VORSCHLAG = ['Super 110', 'Super 130', 'Super 150', 'Super 180'];

export default function ProduktEditor({ produkt }: { produkt?: ProduktDaten | null }) {
  const router = useRouter();
  const neu = !produkt;
  const [w, setW] = useState<Werte>(() => (produkt ? ausProdukt(produkt) : LEER()));
  const [ff, setFf] = useState<Record<string, string>>({});
  const [fehler, setFehler] = useState<string | null>(null);
  const [laedt, setLaedt] = useState<'' | 'speichern' | 'weiter'>('');
  const [bild, setBild] = useState<string | null>(produkt?.bild ?? null);
  const [datei, setDatei] = useState<File | null>(null);
  const [bildFehler, setBildFehler] = useState<string | null>(null);
  const eingabe = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (neu) nameRef.current?.focus();
  }, [neu]);
  useEffect(() => {
    if (!datei) return;
    const u = URL.createObjectURL(datei);
    setBild(u);
    return () => URL.revokeObjectURL(u);
  }, [datei]);

  const setze = <K extends keyof Werte>(k: K, v: Werte[K]) => {
    setW((x) => ({ ...x, [k]: v }));
    setFf((f) => ({ ...f, [k]: '' }));
  };
  const setZ = (key: string, teil: Partial<Zeile>) => {
    setW((x) => ({ ...x, zeilen: x.zeilen.map((z) => (z.key === key ? { ...z, ...teil } : z)) }));
    setFf((f) => ({ ...f, [`${key}.preis`]: '', [`${key}.name`]: '' }));
  };

  const waehleBild = (f: File | undefined) => {
    setBildFehler(null);
    if (!f) return;
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return setBildFehler('Bitte ein PNG-, JPEG- oder WebP-Bild wählen.');
    if (f.size > BILD_MAX) return setBildFehler('Das Bild ist grösser als 3 MB.');
    setDatei(f);
  };

  async function speichern(weiter = false) {
    setFehler(null);
    const f: Record<string, string> = {};
    if (w.name.trim().length < 2) f.name = 'Bitte einen Namen eingeben (mindestens 2 Zeichen).';
    const preis = rpAusText(w.preis || '0');
    if (preis === null || preis < 0) f.preis = 'Betrag wie 1690 oder 1’690.50 eingeben.';
    for (const z of w.zeilen) {
      if (!z.name.trim()) f[`${z.key}.name`] = 'Name der Variante fehlt.';
      const p = rpAusText(z.preis || '0');
      if (p === null || p < 0) f[`${z.key}.preis`] = 'Betrag ungültig.';
    }
    setFf(f);
    if (Object.values(f).some(Boolean)) return;
    const daten = {
      name: w.name.trim(),
      kategorie: w.kategorie,
      beschreibung: w.beschreibung.trim() || null,
      preisRp: preis ?? 0,
      mwstSatz: w.mwstSatz,
      einheit: w.einheit,
      aktiv: w.aktiv,
      varianten: w.zeilen.map((z) => ({ id: z.id, name: z.name.trim(), preisRp: rpAusText(z.preis || '0') ?? 0, aktiv: z.aktiv })),
    };
    setLaedt(weiter ? 'weiter' : 'speichern');
    try {
      const r = await fetch(neu ? '/api/admin/produkte/' : `/api/admin/produkte/${produkt!.id}/`, { method: neu ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.fehler || 'Speichern fehlgeschlagen.');
      const id: string = j.produkt.id;
      if (datei) {
        const b = await fetch(`/api/admin/produkte/${id}/bild/`, { method: 'PUT', headers: { 'Content-Type': datei.type }, body: datei });
        if (!b.ok) throw new Error((await b.json().catch(() => ({}))).fehler || 'Bild konnte nicht gespeichert werden.');
      }
      if (weiter) {
        setW({ ...LEER(), kategorie: w.kategorie, einheit: w.einheit, mwstSatz: w.mwstSatz });
        setDatei(null);
        setBild(null);
        window.scrollTo({ top: 0 });
        nameRef.current?.focus();
        router.refresh();
      } else {
        router.push(`/admin/produkte/${id}/`);
        router.refresh();
      }
    } catch (e) {
      setFehler((e as Error).message);
    } finally {
      setLaedt('');
    }
  }

  const bildEntfernen = async () => {
    setDatei(null);
    setBild(null);
    if (produkt?.bild) await fetch(`/api/admin/produkte/${produkt.id}/bild/`, { method: 'DELETE' });
  };

  const aktive = w.zeilen.filter((z) => z.aktiv);
  const spanne = aktive.length ? aktive.map((z) => rpAusText(z.preis || '0') ?? 0) : [rpAusText(w.preis || '0') ?? 0];

  return (
    <form
      className="pd-editor"
      onSubmit={(e) => {
        e.preventDefault();
        speichern(false);
      }}
      noValidate
    >
      {fehler && (
        <div className="a-hinweis rot" role="alert" style={{ marginBottom: 18 }}>
          {fehler}
        </div>
      )}
      <div className="pd-editor-raster">
        <div className="pd-editor-haupt">
          <section className="a-karte pd-ab">
            <div className="a-karte-kopf">
              <h2>Grunddaten</h2>
            </div>
            <div className="a-karte-inhalt">
              <label className="a-feld">
                <span>Name</span>
                <input ref={nameRef} className={`a-input gross${ff.name ? ' fehler' : ''}`} value={w.name} onChange={(e) => setze('name', e.target.value)} placeholder="z. B. Massanzug zweiteilig" maxLength={160} />
                {ff.name && <em className="pd-fehler">{ff.name}</em>}
              </label>
              <div className="a-feld">
                <span>Kategorie</span>
                <div className="a-chips" role="radiogroup" aria-label="Kategorie">
                  {KATEGORIEN.map((k) => (
                    <button key={k.key} type="button" role="radio" aria-checked={w.kategorie === k.key} aria-pressed={w.kategorie === k.key} className="a-chip" onClick={() => setze('kategorie', k.key)}>
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="a-feld">
                <span>Beschreibung (erscheint auf Angebot und Rechnung)</span>
                <textarea className="a-input" value={w.beschreibung} onChange={(e) => setze('beschreibung', e.target.value)} rows={3} maxLength={2000} placeholder="z. B. Sakko und Hose, Full-Canvas, Made in Italy" />
              </label>
            </div>
          </section>

          <section className="a-karte pd-ab">
            <div className="a-karte-kopf">
              <h2>Preis &amp; MWST</h2>
            </div>
            <div className="a-karte-inhalt">
              <label className="a-feld">
                <span>{w.zeilen.length ? 'Grundpreis inkl. MWST (ohne Variante)' : 'Preis inkl. MWST'}</span>
                <div className="pd-geld">
                  <i>CHF</i>
                  <input className={`a-input zahl${ff.preis ? ' fehler' : ''}`} inputMode="decimal" value={w.preis} onChange={(e) => setze('preis', e.target.value)} placeholder="0.00" />
                </div>
                {ff.preis && <em className="pd-fehler">{ff.preis}</em>}
              </label>
              <div className="a-feld">
                <span>MWST-Satz</span>
                <div className="a-chips" role="radiogroup" aria-label="MWST-Satz">
                  {MWST_SAETZE.map((m) => (
                    <button key={m.satz} type="button" role="radio" aria-checked={w.mwstSatz === m.satz} aria-pressed={w.mwstSatz === m.satz} className="a-chip" onClick={() => setze('mwstSatz', m.satz)}>
                      <b className="zahl">{m.satz} %</b> {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="a-feld">
                <span>Einheit</span>
                <div className="a-chips" role="radiogroup" aria-label="Einheit">
                  {EINHEITEN.map((e) => (
                    <button key={e} type="button" role="radio" aria-checked={w.einheit === e} aria-pressed={w.einheit === e} className="a-chip" onClick={() => setze('einheit', e)}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="a-karte pd-ab">
            <div className="a-karte-kopf">
              <h2>Varianten</h2>
              <span className="a-sub" style={{ margin: 0 }}>
                z. B. Stoffqualität — jede Variante mit eigenem Preis
              </span>
            </div>
            <div className="a-karte-inhalt">
              {w.zeilen.length === 0 && <p className="pd-hinweis">Keine Varianten: In der Positionssuche erscheint das Produkt mit dem Preis oben.</p>}
              <div className="pd-varianten">
                {w.zeilen.map((z, i) => (
                  <div className="pd-var" key={z.key}>
                    <span className="pd-var-nr zahl">{i + 1}</span>
                    <label className="pd-var-feld">
                      <span>Variante</span>
                      <input className={`a-input klein${ff[`${z.key}.name`] ? ' fehler' : ''}`} value={z.name} onChange={(e) => setZ(z.key, { name: e.target.value })} placeholder="Super 150" maxLength={80} />
                    </label>
                    <label className="pd-var-feld">
                      <span>Preis CHF</span>
                      <input className={`a-input klein zahl${ff[`${z.key}.preis`] ? ' fehler' : ''}`} inputMode="decimal" value={z.preis} onChange={(e) => setZ(z.key, { preis: e.target.value })} placeholder="0.00" />
                    </label>
                    <button type="button" className={`pd-var-aktiv${z.aktiv ? ' an' : ''}`} aria-pressed={z.aktiv} onClick={() => setZ(z.key, { aktiv: !z.aktiv })} title={z.aktiv ? 'In der Suche sichtbar' : 'Ausgeblendet'}>
                      {z.aktiv ? 'Aktiv' : 'Aus'}
                    </button>
                    <button type="button" className="pd-entf" aria-label={`Variante ${i + 1} entfernen`} onClick={() => setze('zeilen', w.zeilen.filter((x) => x.key !== z.key))}>
                      <Icon name="papierkorb" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="a-knopfreihe" style={{ marginTop: 12 }}>
                <button type="button" className="a-knopf linie klein" onClick={() => setW((x) => ({ ...x, zeilen: [...x.zeilen, { key: schluessel(), name: '', preis: x.preis, aktiv: true }] }))}>
                  <Icon name="plus" /> Variante
                </button>
                {w.zeilen.length === 0 && (
                  <button
                    type="button"
                    className="a-knopf leise klein"
                    onClick={() => setW((x) => ({ ...x, zeilen: STOFF_VORSCHLAG.map((n) => ({ key: schluessel(), name: n, preis: x.preis, aktiv: true })) }))}
                  >
                    Stoffqualitäten Super 110–180
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="pd-editor-seite">
          <section className="a-karte pd-ab">
            <div className="a-karte-kopf">
              <h2>Bild</h2>
            </div>
            <div className="a-karte-inhalt">
              <button type="button" className={`pd-bild-feld${bild ? ' mit' : ''}`} onClick={() => eingabe.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); waehleBild(e.dataTransfer.files[0]); }}>
                {bild ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bild} alt="" />
                ) : (
                  <span>
                    <Icon name="plusquadrat" />
                    <b>Bild hinzufügen</b>
                    <small>PNG, JPEG oder WebP · max. 3 MB</small>
                  </span>
                )}
              </button>
              <input ref={eingabe} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => waehleBild(e.target.files?.[0])} />
              {bildFehler && <em className="pd-fehler">{bildFehler}</em>}
              {bild && (
                <div className="a-knopfreihe" style={{ marginTop: 10 }}>
                  <button type="button" className="a-knopf linie klein" onClick={() => eingabe.current?.click()}>
                    Ersetzen
                  </button>
                  <button type="button" className="a-knopf leise klein" onClick={bildEntfernen}>
                    Entfernen
                  </button>
                </div>
              )}
            </div>
          </section>
          <section className="a-karte pd-ab">
            <div className="a-karte-kopf">
              <h2>Status</h2>
            </div>
            <div className="a-karte-inhalt">
              <button type="button" className="a-toggle" aria-pressed={w.aktiv} onClick={() => setze('aktiv', !w.aktiv)}>
                <i />
                {w.aktiv ? 'Aktiv — erscheint in der Positionssuche' : 'Inaktiv — ausgeblendet'}
              </button>
            </div>
          </section>
          <section className="a-karte pd-ab pd-vorschau-karte">
            <div className="a-karte-kopf">
              <h2>So erscheint es im Angebot</h2>
            </div>
            <div className="a-karte-inhalt">
              <div className="pd-pos-vorschau">
                <div>
                  <b>{w.name.trim() || 'Produktname'}</b>
                  {w.beschreibung.trim() && <span>{w.beschreibung.trim()}</span>}
                </div>
                <span className="zahl">
                  1 {w.einheit} · {Math.min(...spanne) === Math.max(...spanne) ? chf(spanne[0]) : `${chf(Math.min(...spanne))} – ${chf(Math.max(...spanne), false)}`}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="pd-fuss">
        <button type="button" className="a-knopf leise" onClick={() => router.back()}>
          Abbrechen
        </button>
        <span className="pd-fuss-platz" />
        {neu && (
          <button type="button" className="a-knopf linie" disabled={Boolean(laedt)} onClick={() => speichern(true)}>
            {laedt === 'weiter' ? 'Speichert …' : 'Speichern & weiteres'}
          </button>
        )}
        <button type="submit" className="a-knopf gold" disabled={Boolean(laedt)}>
          <Icon name="check" /> {laedt === 'speichern' ? 'Speichert …' : neu ? 'Produkt anlegen' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}
