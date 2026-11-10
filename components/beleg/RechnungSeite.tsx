'use client';
// Rechnung als Live-Dokument (VoxCRM RechnungSeite.tsx): A4-Blatt mit Positionen, Totalen, Abzügen und dem Swiss
// QR-Zahlteil als zweites Blatt – genau wie im PDF. Entwürfe werden direkt im Blatt bearbeitet und automatisch
// gespeichert; festgeschriebene Rechnungen sind schreibgeschützt. Rechts: Status, Kunde, Sprache, Zahlungen
// (auch sofort bar/Karte/TWINT im Store), Mahnwesen, Versand, Versionen, Verlauf.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Abzug, BelegSprache, Position, RechnungArt } from '@/lib/db/schema';
import { rechnungDokument, type FirmaKurz } from '@/lib/beleg/dokument';
import { blattHtml, dokumentHtml } from '@/lib/beleg/vorlage';
import { DOK } from '@/lib/beleg/texte';
import { bankPruefen } from '@/lib/beleg/bank';
import { Feld, Fehlermeldung, Icon, Knopf, Panel, Pill, ToastBereich, api, geld, heuteIso, plusTage, useToast, type PillArt } from '@/components/vx/ui';
import MahnPanel from '@/components/admin/MahnPanel';
import { DokumentRahmen, Abschnitt, PdfVorschau, SpeicherAnzeige, type Aktion, type Modus } from './Rahmen';
import { Absenderblock, EmpfaengerFeld, Fliesstext, MetaDatum, PapierFuss, PapierStil, PapierSummen, TitelBlock, ZusatzBlatt, Angabe } from './Papier';
import { AutoText, Positionen, mitSchluessel, zumSpeichern, type EPosition } from './Positionen';
import { Ablauf, SendenPanel, SprachWahl, Versionen, WieWeiter, Zeitleiste, pdfHerunterladen, type VerlaufZeile, type VersionZeile } from './Gemeinsam';
import type { KundeDaten, Texte } from './AngebotSeite';
import { useAutosave, useEditorTasten, useVerlauf } from './zustand';
import '@/components/vx/vx.css';
import './editor.css';
import './verkauf.css';
import './marke.css';

export type RechnungDaten = {
  id: string;
  nummer: string | null;
  art: RechnungArt;
  status: 'entwurf' | 'offen' | 'teilbezahlt' | 'bezahlt' | 'storniert';
  anzeigeStatus: string;
  kontaktId: string;
  titel: string;
  rechnungsdatum: string;
  faelligAm: string;
  einleitung: string;
  schluss: string;
  positionen: Position[];
  rabattProzent: number;
  rabattRp: number;
  mwstSatz: number;
  abzug: Abzug[];
  betragRp: number;
  bezahltRp: number;
  mahngebuehrenRp: number;
  mahnstufe: number;
  referenz: string | null;
  sprache: BelegSprache;
  version: number;
  gesendetAm: string | null;
  bezahltAm: string | null;
};
type Zahlung = { id: string; betragRp: number; datum: string; art: string; notiz: string | null };

interface Stand {
  kontaktId: string;
  titel: string;
  rechnungsdatum: string;
  faelligAm: string;
  einleitung: string;
  schluss: string;
  positionen: EPosition[];
  rabattProzent: number;
  sprache: BelegSprache;
}
const ausDaten = (r: RechnungDaten): Stand => ({ kontaktId: r.kontaktId, titel: r.titel, rechnungsdatum: r.rechnungsdatum, faelligAm: r.faelligAm, einleitung: r.einleitung, schluss: r.schluss, positionen: mitSchluessel(r.positionen), rabattProzent: r.rabattProzent, sprache: r.sprache });
const nutzlast = (s: Stand) => ({ ...s, positionen: zumSpeichern(s.positionen) });

const STATUS: Record<string, { label: string; pill: PillArt }> = {
  entwurf: { label: 'Entwurf', pill: 'warn' },
  offen: { label: 'Offen', pill: 'neutral' },
  teilbezahlt: { label: 'Teilbezahlt', pill: 'warn' },
  bezahlt: { label: 'Bezahlt', pill: 'ok' },
  storniert: { label: 'Storniert', pill: 'neutral' },
  ueberfaellig: { label: 'Überfällig', pill: 'bad' },
};
const ZAHLARTEN: [string, string, string][] = [
  ['bar', 'Bar', 'Banknote'],
  ['karte', 'Karte', 'CreditCard'],
  ['twint', 'TWINT', 'Smartphone'],
  ['bank', 'Überweisung', 'Landmark'],
];
const tagText = (s: string | null) => (s ? new Date(s).toLocaleDateString('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—');

export type RechnungSeiteProps = {
  r: RechnungDaten;
  kunde: KundeDaten;
  firma: FirmaKurz;
  logo: string | null;
  texte: Texte;
  auftrag: { id: string; nummer: string | null } | null;
  zahlungen: Zahlung[];
  verlauf: VerlaufZeile[];
  versionen: VersionZeile[];
  mailBereit: boolean;
};

export default function RechnungSeite(p: RechnungSeiteProps) {
  return (
    <ToastBereich>
      <RechnungEditor {...p} />
    </ToastBereich>
  );
}

function RechnungEditor({ r, kunde: kundeStart, firma, logo, texte, auftrag, zahlungen, verlauf, versionen, mailBereit }: RechnungSeiteProps) {
  const router = useRouter();
  const toast = useToast();
  const v = useVerlauf<Stand>(ausDaten(r));
  const erstes = useRef(true);
  const [kunde, setKunde] = useState(kundeStart);
  const [modus, setModus] = useState<Modus>('bearbeiten');
  const [panel, setPanel] = useState<null | 'senden' | 'zahlung'>(null);
  const [beschaeftigt, setBeschaeftigt] = useState<string | null>(null);
  useEffect(() => {
    if (erstes.current) {
      erstes.current = false;
      return;
    }
    v.start(ausDaten(r));
  }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setKunde(kundeStart), [kundeStart]);
  const stand = v.wert;
  const editierbar = r.status === 'entwurf';
  const schluessel = stand && editierbar ? JSON.stringify(nutzlast(stand)) : null;
  const speichere = useCallback(async () => {
    if (!stand) return;
    const x = await api<{ kontakt?: KundeDaten }>(`/api/admin/rechnungen/${r.id}/`, nutzlast(stand), 'PATCH');
    if (x.kontakt) setKunde(x.kontakt);
  }, [stand, r.id]);
  const auto = useAutosave(schluessel, speichere, { aktiv: editierbar, start: editierbar ? JSON.stringify(nutzlast(ausDaten(r))) : null });
  useEffect(() => {
    auto.basis(JSON.stringify(nutzlast(ausDaten(r))));
  }, [r]); // eslint-disable-line react-hooks/exhaustive-deps
  useEditorTasten({ zurueck: v.zurueck, vor: v.vor, speichern: () => auto.jetztSpeichern().catch(() => {}), aktiv: editierbar && modus === 'bearbeiten' });
  const zuerstSpeichern = () => auto.jetztSpeichern().catch(() => {});

  const dok = useMemo(
    () => (stand ? rechnungDokument({ nummer: r.nummer, art: r.art, status: r.status, titel: stand.titel, rechnungsdatum: stand.rechnungsdatum, faelligAm: stand.faelligAm, einleitung: stand.einleitung, schluss: stand.schluss, positionen: zumSpeichern(stand.positionen), rabattProzent: stand.rabattProzent, rabattRp: r.rabattRp, mwstSatz: r.mwstSatz, abzug: r.abzug, bezahltRp: r.bezahltRp, referenz: r.referenz, sprache: stand.sprache, auftragNummer: auftrag?.nummer ?? null }, kunde, firma, logo) : null),
    [stand, r, kunde, firma, logo, auftrag],
  );

  const aktion = async (body: Record<string, unknown>, name: string, neuLaden = true) => {
    setBeschaeftigt(name);
    try {
      await zuerstSpeichern();
      const x = await api<{ meldung?: string }>(`/api/admin/rechnungen/${r.id}/`, body);
      if (x.meldung) toast(x.meldung);
      if (neuLaden) router.refresh();
      return x;
    } catch (e) {
      toast((e as Error).message, 'fehler');
      return null;
    } finally {
      setBeschaeftigt(null);
    }
  };

  if (!stand || !dok) return null;
  const set = (f: (s: Stand) => Stand, gruppe?: string) => v.setze(f, gruppe);
  const D = DOK[stand.sprache];
  const st = STATUS[r.anzeigeStatus] ?? STATUS.offen;
  const offenRp = Math.max(0, r.betragRp + r.mahngebuehrenRp - r.bezahltRp);
  const textKey = r.art === 'anzahlung' ? 'anzahlungEinleitung' : 'rechnungEinleitung';
  const sprachWechsel = (neu: BelegSprache) =>
    set((s) => {
      const alt = texte[s.sprache];
      return { ...s, sprache: neu, einleitung: s.einleitung.trim() === alt[textKey].trim() || !s.einleitung.trim() ? texte[neu][textKey] : s.einleitung, schluss: s.schluss.trim() === alt.rechnungSchluss.trim() || !s.schluss.trim() ? texte[neu].rechnungSchluss : s.schluss };
    });

  const pdf: Aktion = {
    label: 'PDF',
    icon: 'FileDown',
    text: 'PDF mit QR-Zahlteil herunterladen',
    laedt: beschaeftigt === 'pdf',
    onClick: async () => {
      setBeschaeftigt('pdf');
      try {
        await pdfHerunterladen(`/api/admin/rechnungen/${r.id}/pdf/`, zuerstSpeichern);
      } catch (e) {
        toast((e as Error).message, 'fehler');
      } finally {
        setBeschaeftigt(null);
      }
    },
  };
  // Ohne gültige Bankverbindung kein QR-Zahlteil: Festschreiben/Senden gesperrt, Entwurf und Barverkauf gehen weiter
  const bank = bankPruefen(firma);
  const bankFehlt = editierbar && !bank.ok;
  const zurBank: Aktion = { label: 'IBAN eintragen', icon: 'Landmark', text: 'Einstellungen › Bankverbindung & QR-Rechnung', onClick: () => router.push('/admin/einstellungen/#bank') };
  const festschreiben: Aktion | null = editierbar && !bankFehlt ? { label: 'Festschreiben', icon: 'Lock', text: 'Als offen verbuchen, ohne E-Mail', laedt: beschaeftigt === 'fest', onClick: () => aktion({ aktion: 'festschreiben' }, 'fest') } : null;
  const senden: Aktion | null = r.status !== 'storniert' && r.status !== 'bezahlt' && !bankFehlt ? { label: editierbar ? 'Festschreiben & senden' : 'Erneut senden', icon: 'Send', text: 'Per E-Mail mit PDF und QR-Zahlteil', onClick: async () => { await zuerstSpeichern(); setPanel('senden'); } } : null;
  const zahlung: Aktion | null = ['offen', 'teilbezahlt'].includes(r.status) ? { label: 'Zahlung erfassen', icon: 'Banknote', text: 'Bank, TWINT, Karte oder bar', onClick: () => setPanel('zahlung') } : null;
  const primaer = editierbar ? (bankFehlt ? zurBank : senden) : zahlung;
  const mehr: Aktion[] = [
    editierbar ? festschreiben : null,
    !editierbar ? senden : null,
    auftrag ? { label: `Auftrag ${auftrag.nummer}`, icon: 'ClipboardList', text: 'Planung und Zahlungsplan', onClick: () => router.push(`/admin/auftraege/${auftrag.id}/`) } : null,
    { label: 'Kundenakte', icon: 'User', text: kunde.name, onClick: () => router.push(`/admin/kontakte/${kunde.id}/`) },
    editierbar ? { label: 'Entwurf löschen', icon: 'Trash2', gefahr: true, onClick: async () => { if (!confirm('Entwurf endgültig löschen?')) return; try { await api(`/api/admin/rechnungen/${r.id}/`, undefined, 'DELETE'); router.push('/admin/rechnungen/'); } catch (e) { toast((e as Error).message, 'fehler'); } } } : null,
    r.status !== 'storniert' && r.bezahltRp === 0 ? { label: 'Stornieren', icon: 'Ban', gefahr: true, onClick: () => confirm('Rechnung stornieren?') && aktion({ aktion: 'stornieren' }, 'storno') } : null,
  ].filter((x): x is Aktion => Boolean(x));

  const sofort = (
    <div className="dk-zeile-k">
      {ZAHLARTEN.slice(0, 3).map(([k, l, i]) => (
        <Knopf key={k} klein icon={i} laedt={beschaeftigt === `sofort-${k}`} onClick={() => aktion({ aktion: 'sofort-bezahlt', art: k }, `sofort-${k}`)}>
          {l}
        </Knopf>
      ))}
    </div>
  );
  const weiter =
    bankFehlt ? (
      <WieWeiter
        ton="warn"
        icon="Landmark"
        titel={bank.kontoArt ? 'QR-Zahlteil noch nicht möglich' : 'Bankverbindung fehlt – der QR-Zahlteil erscheint, sobald die IBAN in den Einstellungen steht'}
        text={bank.kontoArt ? `${bank.fehler.join(' ')} Der Entwurf bleibt gespeichert.` : 'Den Entwurf können Sie fertig vorbereiten; festschreiben und versenden geht, sobald die Bankverbindung eingetragen ist. Barverkauf im Store geht auch so.'}
        haupt={zurBank}
        optionen={ZAHLARTEN.slice(0, 3).map(([k, l, i]) => ({ label: `${l} bezahlt`, icon: i, laedt: beschaeftigt === `sofort-${k}`, onClick: () => aktion({ aktion: 'sofort-bezahlt', art: k }, `sofort-${k}`) }))}
      />
    ) : r.status === 'entwurf' ? (
      <WieWeiter ton="neutral" icon="PencilLine" titel="Entwurf – direkt im Blatt bearbeiten" text="Senden schreibt die Rechnung fest. Direktverkauf im Store: gleich hier als bezahlt verbuchen." haupt={senden} optionen={ZAHLARTEN.slice(0, 3).map(([k, l, i]) => ({ label: `${l} bezahlt`, icon: i, laedt: beschaeftigt === `sofort-${k}`, onClick: () => aktion({ aktion: 'sofort-bezahlt', art: k }, `sofort-${k}`) }))} />
    ) : r.status === 'bezahlt' ? (
      <WieWeiter ton="ok" icon="CircleCheck" titel={`Bezahlt${r.bezahltAm ? ` am ${tagText(r.bezahltAm)}` : ''}`} text={auftrag ? `Gehört zu Auftrag ${auftrag.nummer}.` : undefined} optionen={[pdf]} />
    ) : r.status === 'storniert' ? (
      <WieWeiter ton="bad" icon="Ban" titel="Storniert" />
    ) : (
      <WieWeiter ton={r.anzeigeStatus === 'ueberfaellig' ? 'bad' : 'info'} icon={r.anzeigeStatus === 'ueberfaellig' ? 'BellRing' : 'Clock'} titel={r.anzeigeStatus === 'ueberfaellig' ? `Überfällig seit ${tagText(r.faelligAm)} – ${geld(offenRp, true)} offen${r.mahnstufe ? ` · ${['', 'Zahlungserinnerung', '1. Mahnung', '2. Mahnung'][r.mahnstufe]} versendet` : ''}` : `${geld(offenRp, true)} offen, zahlbar bis ${tagText(r.faelligAm)}`} text="Zahlungen erfassen Sie rechts; überfällige Rechnungen mahnen Sie im Abschnitt Mahnwesen." haupt={zahlung} optionen={[senden && { ...senden, label: 'Erneut senden' }, pdf]} />
    );

  const papier = (
    <>
      <PapierStil />
      <div className="dk-papier">
        <Absenderblock absender={dok.absender}>
          <EmpfaengerFeld absender={dok.absender} empfaenger={dok.empfaenger} kontaktId={stand.kontaktId} gesperrt={!editierbar} onWahl={(id) => set((s) => ({ ...s, kontaktId: id }))} hinweis={!kunde.strasse && editierbar ? 'Ohne Adresse bleibt «Zahlbar durch» im QR-Zahlteil leer.' : null} />
        </Absenderblock>
        <TitelBlock art={dok.dokTitel} nummer={r.nummer ?? ''} stempel={dok.stempel} held={dok.held} titel={editierbar ? <AutoText einzeilig className="dk-titel-in" wert={stand.titel} placeholder="Betreff" aria-label="Betreff" onWert={(t) => set((s) => ({ ...s, titel: t.slice(0, 160) }), 'titel')} /> : <div className="dk-titel-lesen">{stand.titel}</div>}>
          <MetaDatum label={D.datum} wert={stand.rechnungsdatum} gesperrt={!editierbar} onWahl={(w) => set((s) => ({ ...s, rechnungsdatum: w }))} />
          <MetaDatum label={D.zahlbarBis} wert={stand.faelligAm} gesperrt={!editierbar} onWahl={(w) => set((s) => ({ ...s, faelligAm: w }))} schnell={[0, 10, 30].map((t) => ({ label: t ? `${t} Tage` : 'Sofort', wert: plusTage(stand.rechnungsdatum || heuteIso(), t) }))} />
          {auftrag?.nummer && <Angabe label={D.auftragNr}>{auftrag.nummer}</Angabe>}
        </TitelBlock>
        <Fliesstext label="Einleitung" wert={stand.einleitung} gesperrt={!editierbar} platzhalter="Einleitung – Klick zum Schreiben" onWert={(t) => set((s) => ({ ...s, einleitung: t }), 'einl')} />
        <Positionen positionen={stand.positionen} setze={(f, g) => set((s) => ({ ...s, positionen: f(s.positionen) }), g)} gesperrt={!editierbar} satz={r.mwstSatz} sprache={stand.sprache} hinweisGesperrt={!editierbar ? 'Festgeschrieben – für Änderungen stornieren und neu erstellen.' : null} />
        <PapierSummen dok={dok} />
        <Fliesstext label="Schlusstext" wert={stand.schluss} gesperrt={!editierbar} platzhalter="Schlusstext – Klick zum Schreiben" onWert={(t) => set((s) => ({ ...s, schluss: t }), 'schluss')} />
        <PapierFuss absender={dok.absender} bezug={dok.fussBezug} />
      </div>
      {dok.qr && <ZusatzBlatt dok={dok} art="qr" />}
    </>
  );
  const vorschau =
    modus === 'pdf' ? (
      <PdfVorschau html={dokumentHtml(dok)} />
    ) : (
      <div className="dk-kunde">
        <PapierStil />
        <div className="dk-papier bl" style={{ display: 'block' }} dangerouslySetInnerHTML={{ __html: blattHtml(dok, { fussFest: true, mitQr: false }) }} />
        {dok.qr && <ZusatzBlatt dok={dok} art="qr" />}
      </div>
    );

  const seitenleiste = (
    <>
      <Abschnitt titel="Status">
        <div className="dk-status-z">
          <Pill art={st.pill}>{st.label}</Pill>
          <b className="num">{geld(r.status === 'bezahlt' ? dok.summen.totalRp : offenRp || dok.summen.totalRp, true)}</b>
        </div>
        <Ablauf erledigt={[...(auftrag ? (['angebot', 'auftrag'] as const) : []), ...(r.status === 'bezahlt' ? (['rechnung', 'bezahlt'] as const) : [])]} aktuell={r.status === 'bezahlt' ? null : 'rechnung'} links={{ auftrag: auftrag ? `/admin/auftraege/${auftrag.id}/` : null }} />
        <div className="dk-zeilen">
          <div>
            <span>Total</span>
            <b className="num">{geld(dok.summen.totalRp, true)}</b>
          </div>
          {r.abzug.length > 0 && (
            <div>
              <span>Abzüglich Anzahlungen</span>
              <b className="num">−{geld(r.abzug.reduce((x, a) => x + a.betragRp, 0))}</b>
            </div>
          )}
          {r.bezahltRp > 0 && (
            <div>
              <span>Bezahlt</span>
              <b className="num">{geld(r.bezahltRp, true)}</b>
            </div>
          )}
          {r.mahngebuehrenRp > 0 && (
            <div>
              <span>Mahngebühren</span>
              <b className="num">{geld(r.mahngebuehrenRp, true)}</b>
            </div>
          )}
          {r.gesendetAm && (
            <div>
              <span>Gesendet</span>
              <b className="num">{tagText(r.gesendetAm)}</b>
            </div>
          )}
        </div>
      </Abschnitt>
      <Abschnitt titel="Kunde">
        <a className="dk-akt" href={`/admin/kontakte/${kunde.id}/`}>
          <Icon name="User" size={16} />
          <span>
            <b>{kunde.name || kunde.email}</b>
            <small>{[kunde.email, kunde.telefon].filter(Boolean).join(' · ') || 'Keine Kontaktdaten'}</small>
          </span>
        </a>
      </Abschnitt>
      <Abschnitt titel="Sprache des Dokuments">
        <SprachWahl wert={stand.sprache} gesperrt={!editierbar} onWahl={sprachWechsel} />
        <p className="dk-klein">Rechnung, QR-Zahlteil, Mahnungen und E-Mails in dieser Sprache.</p>
      </Abschnitt>
      {r.status !== 'storniert' && (
        <Abschnitt titel="Zahlungen">
          {zahlungen.length === 0 && <p className="dk-klein" style={{ marginTop: 0 }}>Noch keine Zahlung.</p>}
          <div className="dk-zahlungen">
            {zahlungen.map((z) => (
              <div key={z.id} className="dk-zahlung">
                <Icon name={ZAHLARTEN.find((x) => x[0] === z.art)?.[2] ?? 'Banknote'} size={16} />
                <span>
                  <b className="num">{geld(z.betragRp, true)}</b>
                  <small>
                    {ZAHLARTEN.find((x) => x[0] === z.art)?.[1] ?? z.art} · {tagText(z.datum)}
                  </small>
                </span>
                <button type="button" aria-label="Zahlung entfernen" title="Zahlung entfernen" onClick={() => confirm('Zahlung entfernen?') && aktion({ aktion: 'zahlung-loeschen', zahlungId: z.id }, 'zl')}>
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
          {r.status !== 'bezahlt' && (
            <>
              <div className="dk-aktionen" style={{ marginTop: 8 }}>
                {zahlung && (
                  <Knopf art="dunkel" icon="Banknote" onClick={zahlung.onClick}>
                    Zahlung erfassen
                  </Knopf>
                )}
              </div>
              <p className="dk-klein">Im Store sofort bezahlt:</p>
              {sofort}
            </>
          )}
        </Abschnitt>
      )}
      {['offen', 'teilbezahlt'].includes(r.status) && (
        <Abschnitt titel="Mahnwesen">
          <MahnPanel rechnungId={r.id} emailDa={Boolean(kunde.email)} mailBereit={mailBereit} />
        </Abschnitt>
      )}
      <Abschnitt titel="Versand">
        {bankFehlt && (
          <p className="dk-klein" style={{ marginTop: 0 }}>
            Bankverbindung fehlt – <a href="/admin/einstellungen/#bank">IBAN in den Einstellungen eintragen</a>, dann lässt sich die Rechnung festschreiben und mit QR-Zahlteil senden.
          </p>
        )}
        <div className="dk-aktionen">
          {senden && (
            <Knopf art={editierbar ? 'dunkel' : 'hell'} icon="Send" onClick={senden.onClick}>
              {senden.label}
            </Knopf>
          )}
          <div className="dk-aktionen-reihe">
            <button type="button" onClick={pdf.onClick} disabled={pdf.laedt}>
              <Icon name="FileDown" size={15} />
              PDF
            </button>
            <button type="button" onClick={() => festschreiben?.onClick()} disabled={!festschreiben}>
              <Icon name="Lock" size={15} />
              Festschreiben
            </button>
          </div>
        </div>
      </Abschnitt>
      <Abschnitt titel="Versionen">
        <Versionen liste={versionen} aktuell={r.version} gesperrt={!editierbar} onSichern={() => aktion({ aktion: 'version' }, 'version')} onWiederherstellen={(id) => aktion({ aktion: 'wiederherstellen', versionId: id }, 'wh')} />
      </Abschnitt>
      <Abschnitt titel="Verlauf">
        <Zeitleiste eintraege={verlauf} />
      </Abschnitt>
    </>
  );

  return (
    <>
      <DokumentRahmen
        zurueck={{ href: '/admin/rechnungen/', label: 'Rechnungen' }}
        titel={
          <>
            <span>
              {dok.dokTitel} {r.nummer}
            </span>
            {stand.titel && <small>{stand.titel}</small>}
          </>
        }
        status={<Pill art={st.pill}>{st.label}</Pill>}
        speicher={<SpeicherAnzeige status={auto.status} onErneut={() => auto.jetztSpeichern().catch(() => {})} />}
        modus={modus}
        onModus={(m) => {
          if (m !== 'bearbeiten') zuerstSpeichern();
          setModus(m);
        }}
        modi={[
          { wert: 'bearbeiten', label: editierbar ? 'Bearbeiten' : 'Dokument' },
          { wert: 'kunde', label: 'Kundenansicht' },
          { wert: 'pdf', label: 'PDF' },
        ]}
        rueck={editierbar ? { zurueck: v.zurueck, vor: v.vor, kannZurueck: v.kannZurueck, kannVor: v.kannVor } : null}
        primaer={primaer ? { ...primaer, kbd: '⌘↵' } : null}
        sekundaer={[pdf]}
        mehr={mehr}
        hinweis={weiter}
        papier={papier}
        vorschau={vorschau}
        seitenleiste={seitenleiste}
        seitenTitel="Rechnung – Details"
      />
      <SendenPanel
        offen={panel === 'senden'}
        onZu={() => setPanel(null)}
        an={kunde.email}
        art={dok.dokTitel}
        mailBereit={mailBereit}
        onSenden={async (nachricht) => {
          const x = await api<{ meldung?: string }>(`/api/admin/rechnungen/${r.id}/`, { aktion: 'senden', nachricht });
          toast(x.meldung ?? 'Gesendet');
          setPanel(null);
          router.refresh();
        }}
      />
      <ZahlungPanel
        offen={panel === 'zahlung'}
        onZu={() => setPanel(null)}
        offenRp={offenRp}
        onOk={async (betragRp, art, datum) => {
          const x = await api<{ meldung?: string }>(`/api/admin/rechnungen/${r.id}/`, { aktion: 'zahlung', betragRp, art, datum });
          toast(x.meldung ?? 'Zahlung erfasst');
          setPanel(null);
          router.refresh();
        }}
      />
    </>
  );
}

function ZahlungPanel({ offen, onZu, offenRp, onOk }: { offen: boolean; onZu: () => void; offenRp: number; onOk: (betragRp: number, art: string, datum: string) => Promise<void> }) {
  const [betrag, setBetrag] = useState((offenRp / 100).toFixed(2));
  const [art, setArt] = useState('bank');
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  useEffect(() => {
    if (offen) {
      setBetrag((offenRp / 100).toFixed(2));
      setFehler(null);
    }
  }, [offen, offenRp]);
  const rp = Math.round(parseFloat(betrag.replace(/[’'\s]/g, '').replace(',', '.')) * 100);
  return (
    <Panel
      offen={offen}
      onZu={onZu}
      titel="Zahlung erfassen"
      fuss={
        <>
          <Knopf art="geist" onClick={onZu}>
            Abbrechen
          </Knopf>
          <Knopf
            art="dunkel"
            icon="Check"
            laedt={laedt}
            disabled={!Number.isFinite(rp) || rp === 0}
            onClick={async () => {
              setLaedt(true);
              setFehler(null);
              try {
                await onOk(rp, art, heuteIso());
              } catch (e) {
                setFehler((e as Error).message);
              } finally {
                setLaedt(false);
              }
            }}
          >
            Zahlung verbuchen
          </Knopf>
        </>
      }
    >
      <div className="formular">
        <div className="chips-reihe">
          {ZAHLARTEN.map(([k, l, i]) => (
            <button key={k} type="button" className={`chip-w ${art === k ? 'an' : ''}`} onClick={() => setArt(k)}>
              <Icon name={i} size={14} />
              {l}
            </button>
          ))}
        </div>
        <Feld label="Betrag CHF" inputMode="decimal" value={betrag} onChange={(e) => setBetrag(e.target.value)} hinweis={`Offen: ${geld(offenRp, true)}`} />
        {fehler && <Fehlermeldung text={fehler} />}
      </div>
    </Panel>
  );
}
