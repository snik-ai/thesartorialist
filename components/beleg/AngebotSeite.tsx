'use client';
// Angebot als Live-Dokument (VoxCRM OfferteSeite.tsx): Das A4-Papier ist die Oberfläche (Briefkopf, Empfänger, Titel,
// Texte, Positionen, Summen) und wird direkt bearbeitet; gespeichert wird automatisch. Rechts nur, was nicht aufs Papier
// gehört: Status, Kunde, Sprache, Bedingungen, Versand, Stil-Auswahl, Versionen, Notiz, Verlauf.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BelegSprache, Position, StilZeileDb } from '@/lib/db/schema';
import { angebotDokument, type FirmaKurz, type KontaktKurz } from '@/lib/beleg/dokument';
import { blattHtml, dokumentHtml } from '@/lib/beleg/vorlage';
import { DOK } from '@/lib/beleg/texte';
import { stilGruppen } from '@/lib/crm/status';
import { Datum, Fehlermeldung, Feld, Icon, Knopf, Panel, Pill, ToastBereich, api, geld, heuteIso, plusTage, useToast, type PillArt } from '@/components/vx/ui';
import { DokumentRahmen, Abschnitt, PdfVorschau, SpeicherAnzeige, type Aktion, type Modus } from './Rahmen';
import { Absenderblock, Angabe, EmpfaengerFeld, Fliesstext, MetaDatum, PapierFuss, PapierStil, PapierSummen, TitelBlock, Unterschrift, ZusatzBlatt } from './Papier';
import { AutoText, Positionen, mitSchluessel, zumSpeichern, leerePosition, type EPosition } from './Positionen';
import { Ablauf, SendenPanel, SprachWahl, Versionen, WieWeiter, Zeitleiste, pdfHerunterladen, type VerlaufZeile, type VersionZeile } from './Gemeinsam';
import { useAutosave, useEditorTasten, useVerlauf } from './zustand';
import '@/components/vx/vx.css';
import './editor.css';
import './verkauf.css';
import './marke.css';

export type AngebotDaten = {
  id: string;
  nummer: string | null;
  status: 'entwurf' | 'gesendet' | 'angenommen' | 'abgelehnt' | 'storniert';
  anzeigeStatus: string;
  kontaktId: string;
  titel: string;
  datum: string;
  gueltigBis: string;
  einleitung: string;
  schluss: string;
  positionen: Position[];
  rabattProzent: number;
  rabattRp: number;
  mwstSatz: number;
  sprache: BelegSprache;
  stil: StilZeileDb[];
  stoffe: string[];
  stilAnhang: boolean;
  notiz: string;
  version: number;
  gesendetAm: string | null;
  angesehenAm: string | null;
  angesehenAnzahl: number;
  angenommenAm: string | null;
  angenommenName: string | null;
  abgelehntAm: string | null;
  abgelehntGrund: string | null;
};
export type KundeDaten = KontaktKurz & { id: string; email: string | null; telefon: string | null; whatsappOk: boolean };
export type Texte = Record<BelegSprache, { angebotEinleitung: string; angebotSchluss: string; rechnungEinleitung: string; rechnungSchluss: string; anzahlungEinleitung: string }>;

interface Stand {
  kontaktId: string;
  titel: string;
  datum: string;
  gueltigBis: string;
  einleitung: string;
  schluss: string;
  positionen: EPosition[];
  rabattProzent: number;
  sprache: BelegSprache;
  notiz: string;
  stilAnhang: boolean;
  stil: StilZeileDb[];
  stoffe: string[];
}
const ausDaten = (a: AngebotDaten): Stand => ({
  kontaktId: a.kontaktId,
  titel: a.titel,
  datum: a.datum,
  gueltigBis: a.gueltigBis,
  einleitung: a.einleitung,
  schluss: a.schluss,
  positionen: mitSchluessel(a.positionen),
  rabattProzent: a.rabattProzent,
  sprache: a.sprache,
  notiz: a.notiz,
  stilAnhang: a.stilAnhang,
  stil: a.stil,
  stoffe: a.stoffe,
});
const nutzlast = (s: Stand) => ({
  kontaktId: s.kontaktId,
  titel: s.titel,
  datum: s.datum,
  gueltigBis: s.gueltigBis,
  einleitung: s.einleitung,
  schluss: s.schluss,
  positionen: zumSpeichern(s.positionen),
  rabattProzent: s.rabattProzent,
  sprache: s.sprache,
  notiz: s.notiz,
  stilAnhang: s.stilAnhang,
  stil: s.stil,
  stoffe: s.stoffe,
});

const STATUS_PILL: Record<string, { label: string; pill: PillArt }> = {
  entwurf: { label: 'Entwurf', pill: 'warn' },
  gesendet: { label: 'Gesendet', pill: 'neutral' },
  angesehen: { label: 'Angesehen', pill: 'acc' },
  angenommen: { label: 'Angenommen', pill: 'ok' },
  abgelehnt: { label: 'Abgelehnt', pill: 'bad' },
  storniert: { label: 'Storniert', pill: 'neutral' },
  abgelaufen: { label: 'Abgelaufen', pill: 'bad' },
};
const zeitKurz = (s: string | null) => (s ? new Date(s).toLocaleString('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

export type AngebotSeiteProps = {
  a: AngebotDaten;
  kunde: KundeDaten;
  firma: FirmaKurz;
  logo: string | null;
  texte: Texte;
  auftrag: { id: string; nummer: string | null } | null;
  rechnung: { id: string; nummer: string | null } | null;
  verlauf: VerlaufZeile[];
  versionen: VersionZeile[];
  stilQuellen: { terminId: string; datum: string; stil: StilZeileDb[]; stoffe: string[] }[];
  mailBereit: boolean;
};

export default function AngebotSeite(p: AngebotSeiteProps) {
  return (
    <ToastBereich>
      <AngebotEditor {...p} />
    </ToastBereich>
  );
}

function AngebotEditor({ a, kunde: kundeStart, firma, logo, texte, auftrag, rechnung, verlauf, versionen, stilQuellen, mailBereit }: AngebotSeiteProps) {
  const router = useRouter();
  const toast = useToast();
  const v = useVerlauf<Stand>(ausDaten(a));
  const erstes = useRef(true);
  const [kunde, setKunde] = useState(kundeStart);
  const [modus, setModus] = useState<Modus>('bearbeiten');
  const [panel, setPanel] = useState<null | 'senden' | 'annehmen' | 'ablehnen'>(null);
  const [link, setLink] = useState<string | null>(null);
  const [beschaeftigt, setBeschaeftigt] = useState<string | null>(null);
  useEffect(() => {
    if (erstes.current) {
      erstes.current = false;
      return;
    }
    v.start(ausDaten(a));
  }, [a]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setKunde(kundeStart), [kundeStart]);

  const stand = v.wert;
  const editierbar = a.status === 'entwurf' || a.status === 'gesendet';
  const schluessel = stand && editierbar ? JSON.stringify(nutzlast(stand)) : null;
  const speichere = useCallback(async () => {
    if (!stand) return;
    const r = await api<{ kontakt?: KundeDaten }>(`/api/admin/angebote/${a.id}/`, nutzlast(stand), 'PATCH');
    if (r.kontakt) setKunde(r.kontakt);
  }, [stand, a.id]);
  const auto = useAutosave(schluessel, speichere, { aktiv: editierbar });
  useEffect(() => {
    auto.basis(JSON.stringify(nutzlast(ausDaten(a))));
  }, [a]); // eslint-disable-line react-hooks/exhaustive-deps
  useEditorTasten({ zurueck: v.zurueck, vor: v.vor, speichern: () => auto.jetztSpeichern().catch(() => {}), aktiv: editierbar && modus === 'bearbeiten' });
  const zuerstSpeichern = () => auto.jetztSpeichern().catch(() => {});

  const dok = useMemo(
    () =>
      stand
        ? angebotDokument({ nummer: a.nummer, status: a.status, titel: stand.titel, datum: stand.datum, gueltigBis: stand.gueltigBis, einleitung: stand.einleitung, schluss: stand.schluss, positionen: zumSpeichern(stand.positionen), rabattProzent: stand.rabattProzent, rabattRp: a.rabattRp, mwstSatz: a.mwstSatz, sprache: stand.sprache, stil: stand.stil, stoffe: stand.stoffe, stilAnhang: stand.stilAnhang, angenommenAm: a.angenommenAm, angenommenName: a.angenommenName }, kunde, firma, logo)
        : null,
    [stand, a, kunde, firma, logo],
  );

  const aktion = async (body: Record<string, unknown>, name: string) => {
    setBeschaeftigt(name);
    try {
      await zuerstSpeichern();
      const r = await api<{ meldung?: string; link?: string; id?: string; auftragId?: string; rechnungId?: string; mailFehler?: boolean }>(`/api/admin/angebote/${a.id}/`, body);
      if (r.link) setLink(r.link);
      if (r.meldung) toast(r.meldung, r.mailFehler ? 'fehler' : 'ok');
      return r;
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
  const st = STATUS_PILL[a.anzeigeStatus === 'gesendet' && a.angesehenAm ? 'angesehen' : a.anzeigeStatus] ?? STATUS_PILL.entwurf;
  const sendbar = editierbar && stand.positionen.length > 0;

  const sprachWechsel = (neu: BelegSprache) =>
    set((s) => {
      const alt = texte[s.sprache];
      return { ...s, sprache: neu, einleitung: s.einleitung.trim() === alt.angebotEinleitung.trim() || !s.einleitung.trim() ? texte[neu].angebotEinleitung : s.einleitung, schluss: s.schluss.trim() === alt.angebotSchluss.trim() || !s.schluss.trim() ? texte[neu].angebotSchluss : s.schluss };
    });

  const pdf: Aktion = {
    label: 'PDF',
    icon: 'FileDown',
    text: 'PDF herunterladen (genau wie die Ansicht)',
    laedt: beschaeftigt === 'pdf',
    onClick: async () => {
      setBeschaeftigt('pdf');
      try {
        await pdfHerunterladen(`/api/admin/angebote/${a.id}/pdf/`, zuerstSpeichern);
      } catch (e) {
        toast((e as Error).message, 'fehler');
      } finally {
        setBeschaeftigt(null);
      }
    },
  };
  const kundenlink: Aktion | null = editierbar
    ? {
        label: 'Kundenlink',
        icon: 'Link',
        text: 'Link zum Ansehen und Annehmen erstellen und kopieren',
        disabled: !sendbar,
        laedt: beschaeftigt === 'link',
        onClick: async () => {
          const r = await aktion({ aktion: 'link' }, 'link');
          if (r?.link) navigator.clipboard?.writeText(r.link).catch(() => {});
        },
      }
    : null;
  const senden: Aktion | null = sendbar ? { label: a.status === 'entwurf' ? 'Senden' : 'Erneut senden', icon: 'Send', text: 'Per E-Mail mit PDF und Annahme-Link', onClick: async () => { await zuerstSpeichern(); setPanel('senden'); } } : null;
  const annehmen: Aktion | null = ['entwurf', 'gesendet', 'abgelehnt'].includes(a.status) ? { label: 'Als angenommen erfassen', icon: 'CircleCheck', text: 'Zusage im Atelier – Auftrag mit Planung entsteht', onClick: async () => { await zuerstSpeichern(); setPanel('annehmen'); } } : null;
  const zurRechnung: Aktion | null =
    a.status !== 'storniert' && a.status !== 'abgelehnt'
      ? rechnung
        ? { label: `Rechnung ${rechnung.nummer}`, icon: 'Receipt', text: 'Rechnung öffnen', onClick: () => router.push(`/admin/rechnungen/${rechnung.id}/`) }
        : { label: 'Rechnung erstellen', icon: 'Receipt', text: auftrag ? `Aus Auftrag ${auftrag.nummer}` : 'Angebot annehmen, Auftrag eröffnen und Rechnung erstellen', laedt: beschaeftigt === 'rechnung', onClick: async () => { const r = await aktion({ aktion: 'rechnung' }, 'rechnung'); if (r?.rechnungId) router.push(`/admin/rechnungen/${r.rechnungId}/`); } }
      : null;
  const zumAuftrag: Aktion | null = auftrag ? { label: `Auftrag ${auftrag.nummer}`, icon: 'ClipboardList', text: 'Planung, Termine, Zahlungsplan', onClick: () => router.push(`/admin/auftraege/${auftrag.id}/`) } : null;
  const duplizieren: Aktion = { label: 'Duplizieren', icon: 'Copy', text: 'Als neues Angebot (Entwurf) kopieren', laedt: beschaeftigt === 'dupl', onClick: async () => { const r = await aktion({ aktion: 'duplizieren' }, 'dupl'); if (r?.id) router.push(`/admin/angebote/${r.id}/`); } };
  const primaer: Aktion | null = a.status === 'entwurf' ? senden : a.status === 'gesendet' ? annehmen : a.status === 'angenommen' ? (rechnung ? zumAuftrag : zurRechnung) : a.status === 'abgelehnt' || a.status === 'storniert' ? { label: 'Wieder öffnen', icon: 'PencilLine', onClick: async () => { await aktion({ aktion: 'oeffnen' }, 'oeffnen'); router.refresh(); } } : null;
  const mehr: Aktion[] = [
    senden !== primaer ? senden : null,
    annehmen !== primaer ? annehmen : null,
    editierbar && a.status !== 'entwurf' ? { label: 'Ablehnung erfassen', icon: 'CircleX', text: 'Kunde hat abgesagt', onClick: () => setPanel('ablehnen') } : null,
    zurRechnung !== primaer ? zurRechnung : null,
    zumAuftrag !== primaer ? zumAuftrag : null,
    duplizieren,
    { label: 'Kundenakte', icon: 'User', text: kunde.name, onClick: () => router.push(`/admin/kontakte/${kunde.id}/`) },
    a.status === 'entwurf' ? { label: 'Entwurf löschen', icon: 'Trash2', gefahr: true, text: 'Endgültig entfernen', onClick: async () => { if (!confirm('Entwurf endgültig löschen?')) return; try { await api(`/api/admin/angebote/${a.id}/`, undefined, 'DELETE'); router.push('/admin/angebote/'); } catch (e) { toast((e as Error).message, 'fehler'); } } } : null,
    a.status === 'gesendet' || a.status === 'entwurf' ? { label: 'Stornieren', icon: 'Ban', gefahr: true, text: 'Annahme-Link wird ungültig', onClick: async () => { await aktion({ aktion: 'stornieren' }, 'storno'); router.refresh(); } } : null,
  ].filter((x): x is Aktion => Boolean(x));

  const weiter =
    a.status === 'entwurf' ? null : a.status === 'gesendet' ? (
      <WieWeiter ton={a.angesehenAm ? 'info' : 'neutral'} icon={a.angesehenAm ? 'Eye' : 'Send'} titel={a.angesehenAm ? `Vom Kunden angesehen (${a.angesehenAnzahl}×, zuletzt ${zeitKurz(a.angesehenAm)})` : `Gesendet am ${zeitKurz(a.gesendetAm)} – wartet auf Antwort`} text="Sobald der Kunde online annimmt, entsteht der Auftrag automatisch. Zusagen im Atelier erfassen Sie hier." haupt={annehmen} optionen={[senden && { ...senden, label: 'Erinnern / erneut senden' }, kundenlink]} />
    ) : a.status === 'angenommen' ? (
      <WieWeiter ton="ok" icon="CircleCheck" titel={`Angenommen${a.angenommenName ? ` von ${a.angenommenName}` : ''} am ${zeitKurz(a.angenommenAm)}`} text={auftrag ? `Auftrag ${auftrag.nummer} ist eröffnet. Das Angebot ist schreibgeschützt.` : 'Das Angebot ist schreibgeschützt.'} haupt={rechnung ? zumAuftrag : zurRechnung} optionen={[rechnung ? zurRechnung : zumAuftrag, duplizieren]} />
    ) : (
      <WieWeiter ton="bad" icon="CircleX" titel={a.status === 'abgelehnt' ? `Abgelehnt${a.abgelehntGrund ? ` – «${a.abgelehntGrund}»` : ''}` : 'Storniert'} text="Als Entwurf wieder öffnen oder als neue Version duplizieren." haupt={primaer} optionen={[duplizieren]} />
    );

  const papier = (
    <>
      <PapierStil />
      <div className="dk-papier">
        <Absenderblock absender={dok.absender}>
          <EmpfaengerFeld absender={dok.absender} empfaenger={dok.empfaenger} kontaktId={stand.kontaktId} gesperrt={!editierbar} onWahl={(id) => set((s) => ({ ...s, kontaktId: id }))} />
        </Absenderblock>
        <TitelBlock
          art={D.angebot}
          nummer={a.nummer ?? ''}
          stempel={dok.stempel}
          held={dok.held}
          titel={editierbar ? <AutoText einzeilig className="dk-titel-in" wert={stand.titel} placeholder="Betreff, z. B. Massanzug für die Hochzeit" aria-label="Betreff" onWert={(t) => set((s) => ({ ...s, titel: t.slice(0, 160) }), 'titel')} /> : <div className="dk-titel-lesen">{stand.titel}</div>}
        >
          <MetaDatum label={D.datum} wert={stand.datum} gesperrt={!editierbar} onWahl={(w) => set((s) => ({ ...s, datum: w }))} />
          <MetaDatum
            label={D.gueltigBis}
            wert={stand.gueltigBis}
            gesperrt={!editierbar}
            onWahl={(w) => set((s) => ({ ...s, gueltigBis: w }))}
            schnell={[14, 30, 60].map((t) => ({ label: `${t} Tage`, wert: plusTage(stand.datum || heuteIso(), t) }))}
          />
        </TitelBlock>
        <Fliesstext label="Einleitung" wert={stand.einleitung} gesperrt={!editierbar} platzhalter="Einleitung – Klick zum Schreiben" onWert={(t) => set((s) => ({ ...s, einleitung: t }), 'einl')} />
        <Positionen positionen={stand.positionen} setze={(f, g) => set((s) => ({ ...s, positionen: f(s.positionen) }), g)} gesperrt={!editierbar} satz={a.mwstSatz} sprache={stand.sprache} hinweisGesperrt={a.status === 'angenommen' ? 'Angenommen – Änderungen im Auftrag bzw. mit einer neuen Version.' : null} />
        <PapierSummen dok={dok} />
        <Fliesstext label="Schlusstext" wert={stand.schluss} gesperrt={!editierbar} platzhalter="Schlusstext – Klick zum Schreiben" onWert={(t) => set((s) => ({ ...s, schluss: t }), 'schluss')} />
        {dok.angenommen ? <div className="dk-angenommen">{dok.angenommen}</div> : <Unterschrift sprache={stand.sprache} />}
        <PapierFuss absender={dok.absender} bezug={dok.fussBezug} />
      </div>
      {dok.stil && <ZusatzBlatt dok={dok} art="stil" />}
    </>
  );

  const vorschau =
    modus === 'pdf' ? (
      <PdfVorschau html={dokumentHtml(dok)} />
    ) : (
      <div className="dk-kunde">
        <PapierStil />
        <div className="dk-papier bl" style={{ display: 'block' }} dangerouslySetInnerHTML={{ __html: blattHtml(dok, { fussFest: true }) }} />
      </div>
    );

  const stilUebernehmen = (q: { stil: StilZeileDb[]; stoffe: string[] }, alsPosition: boolean) => {
    set((s) => {
      const neu = { ...s, stil: q.stil, stoffe: q.stoffe, stilAnhang: alsPosition ? s.stilAnhang : true };
      if (!alsPosition) return neu;
      const text = stilGruppen(q.stil)
        .map((g) => `${g.kategorie}: ${g.zeilen.map((z) => z.option).join(', ')}`)
        .join('\n');
      return { ...neu, positionen: [...s.positionen, leerePosition('text', { bezeichnung: D.stilTitel, beschreibung: [text, q.stoffe.length ? `${D.stoffe}: ${q.stoffe.join(', ')}` : ''].filter(Boolean).join('\n') }, a.mwstSatz)] };
    });
    toast(alsPosition ? 'Stil-Auswahl als Textblock im Blatt eingefügt' : 'Stil-Auswahl als Anhang übernommen');
  };

  const seitenleiste = (
    <>
      <Abschnitt titel="Status">
        <div className="dk-status-z">
          <Pill art={st.pill}>{st.label}</Pill>
          <b className="num">{geld(dok.summen.totalRp, true)}</b>
        </div>
        <Ablauf erledigt={a.status === 'angenommen' ? (rechnung ? ['angebot', 'auftrag'] : ['angebot']) : []} aktuell={a.status === 'angenommen' ? (rechnung ? 'rechnung' : 'auftrag') : 'angebot'} links={{ auftrag: auftrag ? `/admin/auftraege/${auftrag.id}/` : null, rechnung: rechnung ? `/admin/rechnungen/${rechnung.id}/` : null }} />
        <div className="dk-zeilen">
          <div>
            <span>Version</span>
            <b className="num">{a.version}</b>
          </div>
          {a.gesendetAm && (
            <div>
              <span>Gesendet</span>
              <b className="num">{zeitKurz(a.gesendetAm)}</b>
            </div>
          )}
          {a.angesehenAm && (
            <div>
              <span>Angesehen</span>
              <b className="num">
                {a.angesehenAnzahl}× · {zeitKurz(a.angesehenAm)}
              </b>
            </div>
          )}
          {a.angenommenAm && (
            <div>
              <span>Angenommen</span>
              <b className="num">{zeitKurz(a.angenommenAm)}</b>
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
        {editierbar && <p className="dk-klein">Anderen Empfänger: Adressfeld im Blatt anklicken.</p>}
      </Abschnitt>
      <Abschnitt titel="Sprache des Dokuments">
        <SprachWahl wert={stand.sprache} gesperrt={!editierbar} onWahl={sprachWechsel} />
        <p className="dk-klein">Blatt, PDF, Kundenseite und E-Mail erscheinen in dieser Sprache. Standardtexte wechseln mit.</p>
      </Abschnitt>
      <Abschnitt titel="Gültigkeit">
        <Datum feld wert={stand.gueltigBis || null} disabled={!editierbar} onWahl={(w) => set((s) => ({ ...s, gueltigBis: w }))} />
        {editierbar && (
          <div className="dk-chips chips-reihe">
            {[14, 30, 60, 90].map((t) => {
              const w = plusTage(stand.datum || heuteIso(), t);
              return (
                <button key={t} type="button" className={`chip-w ${stand.gueltigBis === w ? 'an' : ''}`} onClick={() => set((s) => ({ ...s, gueltigBis: w }))}>
                  {t} Tage
                </button>
              );
            })}
          </div>
        )}
      </Abschnitt>
      <Abschnitt titel="Rabatt und Bedingungen">
        {editierbar && (
          <div className="dk-chips chips-reihe">
            {[0, 5, 10].map((r) => (
              <button key={r} type="button" className={`chip-w ${stand.rabattProzent === r ? 'an' : ''}`} onClick={() => set((s) => ({ ...s, rabattProzent: r }))}>
                {r ? `${r} % Rabatt` : 'Kein Rabatt'}
              </button>
            ))}
          </div>
        )}
        {dok.info && <p className="dk-klein">{dok.info}</p>}
      </Abschnitt>
      <Abschnitt titel="Versand">
        <div className="dk-aktionen">
          {senden && <Knopf art="dunkel" icon="Send" onClick={senden.onClick}>{senden.label}</Knopf>}
          <div className="dk-aktionen-reihe">
            <button type="button" onClick={pdf.onClick} disabled={pdf.laedt}>
              <Icon name="FileDown" size={15} />
              PDF
            </button>
            <button type="button" disabled={!kundenlink || kundenlink.disabled} onClick={() => kundenlink?.onClick()}>
              <Icon name="Link" size={15} />
              Link
            </button>
          </div>
        </div>
        {link && (
          <>
            <div className="dk-link" style={{ marginTop: 8 }}>
              <span>{link}</span>
              <button type="button" onClick={() => navigator.clipboard?.writeText(link).then(() => toast('Link kopiert'))}>
                <Icon name="Copy" size={13} />
                Kopieren
              </button>
            </div>
            {kunde.telefon && kunde.whatsappOk && (
              <a className="dk-akt" target="_blank" rel="noopener" href={`https://wa.me/${kunde.telefon.replace(/[^\d]/g, '').replace(/^0/, '41')}?text=${encodeURIComponent(`${D.angebot} ${a.nummer}: ${link}`)}`}>
                <Icon name="MessageCircle" size={16} />
                <span>
                  <b>Per WhatsApp senden</b>
                  <small>Einwilligung liegt vor</small>
                </span>
              </a>
            )}
          </>
        )}
      </Abschnitt>
      {(stilQuellen.length > 0 || stand.stil.length > 0) && (
        <Abschnitt titel="Stil-Auswahl (Konfigurator)">
          {stand.stil.length > 0 && (
            <div className="dk-stil">
              {stand.stil.map((z, i) => (
                <div key={i}>
                  <span>
                    {z.kategorie} · {z.untergruppe}
                  </span>
                  <b>{z.option}</b>
                </div>
              ))}
            </div>
          )}
          {editierbar && (
            <button type="button" role="switch" aria-checked={stand.stilAnhang} className={`schalter ${stand.stilAnhang ? 'an' : ''}`} onClick={() => set((s) => ({ ...s, stilAnhang: !s.stilAnhang }))}>
              <span className="tg" aria-hidden="true" />
              <span>Als Anhang-Seite im PDF</span>
            </button>
          )}
          {editierbar &&
            stilQuellen.map((q) => (
              <div key={q.terminId} style={{ marginTop: 10 }}>
                <p className="dk-klein" style={{ marginTop: 0 }}>
                  Anfrage vom {q.datum} · {q.stil.length} Details{q.stoffe.length ? ` · Stoff ${q.stoffe.join(', ')}` : ''}
                </p>
                <div className="dk-zeile-k">
                  <Knopf klein icon="Pilcrow" onClick={() => stilUebernehmen(q, true)}>
                    Als Textblock
                  </Knopf>
                  <Knopf klein icon="Paperclip" onClick={() => stilUebernehmen(q, false)}>
                    Als Anhang
                  </Knopf>
                </div>
              </div>
            ))}
        </Abschnitt>
      )}
      <Abschnitt titel="Versionen">
        <Versionen
          liste={versionen}
          aktuell={a.version}
          gesperrt={!editierbar}
          onSichern={async () => {
            const r = await aktion({ aktion: 'version' }, 'version');
            if (r) router.refresh();
          }}
          onWiederherstellen={async (id) => {
            const r = await aktion({ aktion: 'wiederherstellen', versionId: id }, 'wh');
            if (r) router.refresh();
          }}
        />
      </Abschnitt>
      {(editierbar || stand.notiz) && (
        <Abschnitt
          titel="Notiz"
          mehr={
            <>
              <Icon name="EyeOff" size={12} />
              nur intern
            </>
          }
        >
          <textarea className="dk-notiz" value={stand.notiz} disabled={!editierbar} placeholder="Nur für das Atelier sichtbar" onChange={(e) => set((s) => ({ ...s, notiz: e.target.value.slice(0, 3000) }), 'notiz')} />
        </Abschnitt>
      )}
      <Abschnitt titel="Verlauf">
        <Zeitleiste eintraege={verlauf} />
      </Abschnitt>
    </>
  );

  return (
    <>
      <DokumentRahmen
        zurueck={{ href: '/admin/angebote/', label: 'Angebote' }}
        titel={
          <>
            <span>
              Angebot {a.nummer}{stand.sprache !== 'de' ? ` · ${stand.sprache.toUpperCase()}` : ''}
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
        sekundaer={[pdf, ...(kundenlink ? [kundenlink] : [])]}
        mehr={mehr}
        hinweis={weiter}
        papier={papier}
        vorschau={vorschau}
        seitenleiste={seitenleiste}
        seitenTitel="Angebot – Details"
      />
      <SendenPanel
        offen={panel === 'senden'}
        onZu={() => setPanel(null)}
        an={kunde.email}
        art="Angebot"
        mailBereit={mailBereit}
        onSenden={async (nachricht) => {
          const r = await api<{ meldung?: string; link?: string; mailFehler?: boolean }>(`/api/admin/angebote/${a.id}/`, { aktion: 'senden', nachricht });
          if (r.link) setLink(r.link);
          toast(r.meldung ?? 'Gesendet', r.mailFehler ? 'fehler' : 'ok');
          setPanel(null);
          router.refresh();
        }}
      />
      <AnnehmenPanel
        offen={panel === 'annehmen'}
        onZu={() => setPanel(null)}
        vorschlag={kunde.name}
        emailDa={Boolean(kunde.email) && mailBereit}
        onOk={async (name, mail) => {
          const r = await api<{ auftragId?: string; meldung?: string }>(`/api/admin/angebote/${a.id}/`, { aktion: 'annehmen', name, mail });
          toast(r.meldung ?? 'Angenommen');
          setPanel(null);
          if (r.auftragId) router.push(`/admin/auftraege/${r.auftragId}/`);
          else router.refresh();
        }}
      />
      <AblehnenPanel
        offen={panel === 'ablehnen'}
        onZu={() => setPanel(null)}
        onOk={async (grund, verloren) => {
          await api(`/api/admin/angebote/${a.id}/`, { aktion: 'ablehnen', grund, verloren });
          toast('Als abgelehnt erfasst');
          setPanel(null);
          router.refresh();
        }}
      />
    </>
  );
}

function AnnehmenPanel({ offen, onZu, vorschlag, emailDa, onOk }: { offen: boolean; onZu: () => void; vorschlag: string; emailDa: boolean; onOk: (name: string, mail: boolean) => Promise<void> }) {
  const [name, setName] = useState(vorschlag);
  const [mail, setMail] = useState(emailDa);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  useEffect(() => {
    if (offen) {
      setName(vorschlag);
      setFehler(null);
    }
  }, [offen, vorschlag]);
  return (
    <Panel
      offen={offen}
      onZu={onZu}
      titel="Als angenommen erfassen"
      fuss={
        <>
          <Knopf art="geist" onClick={onZu}>
            Abbrechen
          </Knopf>
          <Knopf
            art="dunkel"
            icon="ArrowRightLeft"
            laedt={laedt}
            onClick={async () => {
              setLaedt(true);
              setFehler(null);
              try {
                await onOk(name, mail);
              } catch (e) {
                setFehler((e as Error).message);
              } finally {
                setLaedt(false);
              }
            }}
          >
            Annehmen und Auftrag eröffnen
          </Knopf>
        </>
      }
    >
      <div className="formular">
        <p className="vk-hinweis">Der Kontakt wird Kunde, der Auftrag mit Planung (Stoff bestellen, Anprobe, Abholung) entsteht sofort.</p>
        <Feld label="Angenommen von" value={name} onChange={(e) => setName(e.target.value)} />
        {emailDa && (
          <button type="button" role="switch" aria-checked={mail} className={`schalter ${mail ? 'an' : ''}`} onClick={() => setMail(!mail)}>
            <span className="tg" aria-hidden="true" />
            <span>Auftragsbestätigung per E-Mail senden</span>
          </button>
        )}
        {fehler && <Fehlermeldung text={fehler} />}
      </div>
    </Panel>
  );
}

const GRUENDE = ['Zu teuer', 'Anderer Anbieter', 'Später', 'Keine Antwort'];
function AblehnenPanel({ offen, onZu, onOk }: { offen: boolean; onZu: () => void; onOk: (grund: string, verloren: boolean) => Promise<void> }) {
  const [grund, setGrund] = useState('');
  const [verloren, setVerloren] = useState(true);
  const [laedt, setLaedt] = useState(false);
  return (
    <Panel
      offen={offen}
      onZu={onZu}
      titel="Ablehnung erfassen"
      fuss={
        <>
          <Knopf art="geist" onClick={onZu}>
            Abbrechen
          </Knopf>
          <Knopf
            art="gefahr"
            icon="CircleX"
            laedt={laedt}
            onClick={async () => {
              setLaedt(true);
              try {
                await onOk(grund, verloren);
              } finally {
                setLaedt(false);
              }
            }}
          >
            Als abgelehnt markieren
          </Knopf>
        </>
      }
    >
      <div className="formular">
        <div className="chips-reihe">
          {GRUENDE.map((g) => (
            <button key={g} type="button" className={`chip-w ${grund === g ? 'an' : ''}`} onClick={() => setGrund(g)}>
              {g}
            </button>
          ))}
        </div>
        <Feld label="Grund (optional)" value={grund} onChange={(e) => setGrund(e.target.value)} />
        <button type="button" role="switch" aria-checked={verloren} className={`schalter ${verloren ? 'an' : ''}`} onClick={() => setVerloren(!verloren)}>
          <span className="tg" aria-hidden="true" />
          <span>Lead als verloren markieren</span>
        </button>
      </div>
    </Panel>
  );
}
