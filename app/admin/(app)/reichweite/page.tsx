// Webseitenanalyse (Informationsumfang wie Karo, Design der Marke): Echtzeit, Bilanz Besucher → Kontakte →
// Conversion-Rate, Verlauf mit allen Kontaktarten, Trichter, Fluss Kanal → Kontaktart, Kanäle, Wochenraster und
// Detailtabellen. Zeitraum in der URL (?zeitraum=heute|gestern|7|30|90|frei&von=&bis=), damit ein Blick teilbar ist.
import type { Metadata } from 'next';
import '@/components/admin/webanalyse/webanalyse.css';
import { echtzeit, heuteZuerich, uebersicht, zeitraumAus, type Aufteilung, type Echtzeit as EchtzeitDaten } from '@/lib/crm/webanalyse';
import Zeitraumwahl from '@/components/admin/webanalyse/Zeitraumwahl';
import Echtzeit from '@/components/admin/webanalyse/Echtzeit';
import Verlauf from '@/components/admin/webanalyse/Verlauf';
import Trichter from '@/components/admin/webanalyse/Trichter';
import KanalFluss from '@/components/admin/webanalyse/KanalFluss';
import Wochenraster from '@/components/admin/webanalyse/Wochenraster';
import { Bilanz, KanalListe, Karte, Pfad, Tabelle, type Spalte } from '@/components/admin/webanalyse/Bausteine';
import { bereichText, dauer, quote, zahl } from '@/components/admin/webanalyse/format';

export const metadata: Metadata = { title: 'Webseitenanalyse' };
export const dynamic = 'force-dynamic';

const aufteilungSpalten = (kopf: string): Spalte<Aufteilung>[] => [
  { kopf, wert: (z) => z.label },
  { kopf: 'Sitzungen', zahl: true, wert: (z) => zahl(z.sitzungen) },
  { kopf: 'Conv.-Rate', zahl: true, wert: (z) => quote(z.conversionRate) },
];

export default async function WebanalysePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const heute = heuteZuerich();
  const z = zeitraumAus(sp, heute);
  const [u, e] = await Promise.all([uebersicht(z), echtzeit().catch((): EchtzeitDaten | null => null)]);
  const k = u.kennzahlen;
  const lq = u.landQuelle;
  const lqTotal = lq.proxy + lq.sprache + lq.unbekannt;

  return (
    <div className="wa">
      <div className="a-kopf wa-kopf">
        <div>
          <span className="a-kicker">Website · cookielos gemessen</span>
          <h1>Webseitenanalyse</h1>
          <p className="a-sub">
            thesartorialist.ch · <span className="zahl">{bereichText(z.von, z.bis)}</span> · verglichen mit <span className="zahl">{bereichText(z.vorher.von, z.vorher.bis)}</span>
          </p>
        </div>
        <Zeitraumwahl art={z.art} von={z.von} bis={z.bis} heute={heute} />
      </div>

      <Echtzeit start={e} />

      <Bilanz k={k} v={u.vorperiode} verlauf={u.verlauf} backend={u.backend} />

      <Karte titel={`Besuche & Kontakte ${z.aufloesung === 'stunde' ? 'pro Stunde' : 'pro Tag'}`} unter="Fläche = Besuche, gestrichelt = Vorperiode; darunter jede Kontaktart als eigene Bahn auf derselben Zeitachse.">
        <Verlauf punkte={u.verlauf} aufloesung={z.aufloesung} />
      </Karte>

      <div className="wa-zwei">
        <Karte titel="Vom Besuch zum Kontakt" unter="Trichter — jede Stufe ist Teil der vorigen. Je Kanal über die Chips.">
          <Trichter trichter={u.trichter} vorher={u.trichterVorher} kanaele={u.trichterKanaele} />
        </Karte>
        <Karte titel="Woher die Kontakte kommen" unter="Kanal → erste Kontaktart der Sitzung">
          <KanalFluss fluss={u.fluss} kanaele={u.kanaele} />
        </Karte>
      </div>

      <Karte titel="Kanäle im Vergleich" unter={<>Sitzungen je Kanal, darin farbig die Sitzungen mit Kontakt · Ø Conversion-Rate {quote(k.conversionRate)}, gold = über dem Schnitt</>}>
        <KanalListe u={u} />
      </Karte>

      <Karte titel="Wochenraster" unter="Wochentag × Stunde, Zürcher Zeit">
        <Wochenraster heatmap={u.heatmap} />
      </Karte>

      <h2 className="wa-abschnitt">Details</h2>

      <div className="wa-zwei breit-links">
        <Karte titel="Meistbesuchte Seiten" unter="Aufrufe, Besucher, Ø sichtbare Zeit und wie oft der Besuch hier endete">
          <Tabelle
            zeilen={u.seiten.slice(0, 15)}
            balken={(z) => z.aufrufe}
            spalten={[
              { kopf: 'Seite', wert: (z) => <Pfad pfad={z.pfad} titel={z.titel} /> },
              { kopf: 'Aufrufe', zahl: true, wert: (z) => zahl(z.aufrufe) },
              { kopf: 'Besucher', zahl: true, breit: true, wert: (z) => zahl(z.besucher) },
              { kopf: 'Ø Zeit', zahl: true, wert: (z) => dauer(z.dauerS) },
              { kopf: 'Ausstiege', zahl: true, breit: true, wert: (z) => zahl(z.ausstiege) },
            ]}
          />
        </Karte>
        <Karte titel="Geräte" unter="Sitzungen je Gerätetyp">
          <Tabelle zeilen={u.geraete} balken={(z) => z.sitzungen} spalten={[...aufteilungSpalten('Gerät'), { kopf: 'Absprung', zahl: true, breit: true, wert: (z) => quote(z.absprungrate, 0) }]} />
          <h3 className="wa-zwischen">Verweildauer je Sitzung</h3>
          <Tabelle
            zeilen={u.verweildauer}
            balken={(z) => z.sitzungen}
            spalten={[
              { kopf: 'Dauer', wert: (z) => z.label },
              { kopf: 'Sitzungen', zahl: true, wert: (z) => zahl(z.sitzungen) },
              { kopf: 'Anteil', zahl: true, wert: (z) => quote(k.sitzungen ? z.sitzungen / k.sitzungen : null, 0) },
            ]}
          />
        </Karte>
      </div>

      <div className="wa-zwei">
        <Karte titel="Einstiegsseiten" unter="Wo Besuche beginnen">
          <Tabelle
            zeilen={u.einstiege.slice(0, 12)}
            balken={(z) => z.sitzungen}
            spalten={[
              { kopf: 'Seite', wert: (z) => <Pfad pfad={z.pfad} /> },
              { kopf: 'Sitzungen', zahl: true, wert: (z) => zahl(z.sitzungen) },
              { kopf: 'Absprung', zahl: true, breit: true, wert: (z) => quote(z.absprungrate, 0) },
              { kopf: 'Conv.-Rate', zahl: true, wert: (z) => quote(z.conversionRate) },
            ]}
          />
        </Karte>
        <Karte titel="Ausstiegsseiten" unter="Wo Besuche enden · Ausstiegsquote = Ausstiege ÷ Aufrufe der Seite">
          <Tabelle
            zeilen={u.ausstiege.slice(0, 12)}
            balken={(z) => z.sitzungen}
            spalten={[
              { kopf: 'Seite', wert: (z) => <Pfad pfad={z.pfad} /> },
              { kopf: 'Ausstiege', zahl: true, wert: (z) => zahl(z.sitzungen) },
              { kopf: 'Quote', zahl: true, wert: (z) => quote(z.quote, 0) },
            ]}
          />
        </Karte>
      </div>

      <div className="wa-zwei">
        <Karte titel="Herkunft" unter="Verweisende Websites (nur Domain)">
          <Tabelle
            zeilen={u.referrer.slice(0, 15)}
            balken={(z) => z.sitzungen}
            leer="Keine Besuche über andere Websites im Zeitraum."
            spalten={[
              { kopf: 'Domain', wert: (z) => <span className="wa-umbruch">{z.domain}</span> },
              { kopf: 'Kanal', breit: true, wert: (z) => z.kanalLabel },
              { kopf: 'Sitzungen', zahl: true, wert: (z) => zahl(z.sitzungen) },
              { kopf: 'Kontakte', zahl: true, wert: (z) => zahl(z.kontakte) },
            ]}
          />
        </Karte>
        <Karte
          titel="Kampagnen (UTM)"
          unter={
            u.googleAds.sitzungen > 0
              ? `utm-Parameter · ${zahl(u.googleAds.sitzungen)} Sitzungen mit Google-Klickkennung, Conversion-Rate ${quote(u.googleAds.conversionRate)}`
              : 'utm_source / utm_medium / utm_campaign in der Landeadresse'
          }
        >
          <Tabelle
            zeilen={u.kampagnen.slice(0, 15)}
            balken={(z) => z.sitzungen}
            leer="Keine Besuche mit Kampagnenangaben im Zeitraum."
            spalten={[
              {
                kopf: 'Kampagne',
                wert: (z) => (
                  <span className="wa-pfad">
                    <b>{z.kampagne ?? '(ohne Name)'}</b>
                    <small>{[z.quelle, z.medium, z.begriff, z.inhalt].filter(Boolean).join(' / ') || '–'}</small>
                  </span>
                ),
              },
              { kopf: 'Sitzungen', zahl: true, wert: (z) => zahl(z.sitzungen) },
              { kopf: 'Kontakte', zahl: true, breit: true, wert: (z) => zahl(z.kontakte) },
              { kopf: 'Rate', zahl: true, wert: (z) => quote(z.conversionRate) },
            ]}
          />
        </Karte>
      </div>

      <div className="wa-vier">
        <Karte titel="Browser">
          <Tabelle zeilen={u.browser.slice(0, 8)} balken={(z) => z.sitzungen} spalten={aufteilungSpalten('Browser')} />
        </Karte>
        <Karte titel="Betriebssysteme">
          <Tabelle zeilen={u.os.slice(0, 8)} balken={(z) => z.sitzungen} spalten={aufteilungSpalten('System')} />
        </Karte>
        <Karte
          titel="Länder"
          unter={
            lqTotal
              ? lq.proxy >= lq.sprache
                ? 'Aus dem Länder-Kopf des Proxys'
                : `Näherung aus der Region der Browsersprache (${Math.round((lq.sprache / lqTotal) * 100)} % der Sitzungen) — keine IP-Ortung`
              : 'Näherung, keine IP-Ortung'
          }
        >
          <Tabelle zeilen={u.laender.slice(0, 10)} balken={(z) => z.sitzungen} spalten={aufteilungSpalten('Land')} />
        </Karte>
        <Karte titel="Bildschirm">
          <Tabelle zeilen={u.bildschirme} balken={(z) => z.sitzungen} spalten={aufteilungSpalten('Breite')} />
        </Karte>
      </div>

      <div className="wa-zwei">
        <Karte titel="Sprachen der Website" unter="Sprachversion der Einstiegsseite (9 Sprachen)">
          <Tabelle
            zeilen={u.seitenSprachen}
            balken={(z) => z.sitzungen}
            spalten={[...aufteilungSpalten('Sprache'), { kopf: 'Aufrufe', zahl: true, breit: true, wert: (z) => zahl(z.aufrufe) }]}
          />
        </Karte>
        <Karte titel="Browsersprachen" unter="Eingestellte Sprache im Browser der Besucher">
          <Tabelle zeilen={u.browserSprachen.slice(0, 10)} balken={(z) => z.sitzungen} spalten={aufteilungSpalten('Sprache')} />
        </Karte>
      </div>

      <div className="wa-zwei">
        <Karte titel="Aktionen" unter="Kontaktwege, Konfigurator, Shop und Formulare — Anzahl und Sitzungen">
          <Tabelle
            zeilen={u.aktionen}
            balken={(z) => z.anzahl}
            leer="Noch keine Aktionen im Zeitraum."
            spalten={[
              { kopf: 'Aktion', wert: (z) => <span className={z.kontakt ? 'wa-kontakt-text' : ''}>{z.label}</span> },
              { kopf: 'Anzahl', zahl: true, wert: (z) => zahl(z.anzahl) },
              { kopf: 'Sitzungen', zahl: true, wert: (z) => zahl(z.sitzungen) },
            ]}
          />
        </Karte>
        <Karte titel="Kontaktziele" unter="Welche Nummer, Adresse, welcher Knopf oder welches Formular">
          <Tabelle
            zeilen={u.ziele}
            balken={(z) => z.anzahl}
            leer="Noch keine Klicks im Zeitraum."
            spalten={[
              { kopf: 'Art', wert: (z) => z.label },
              { kopf: 'Ziel', wert: (z) => <span className="wa-umbruch">{z.ziel}</span> },
              { kopf: 'Anzahl', zahl: true, wert: (z) => zahl(z.anzahl) },
            ]}
          />
        </Karte>
      </div>

      <p className="wa-fussnote wa-schluss">
        Eigene, cookielose Messung ohne IP-Adressen: Besucher werden je Tag über einen Prüfwert gezählt, der täglich wechselt — ein wiederkehrender Mensch zählt darum je Tag einmal.
        Eine Sitzung endet nach 30 Minuten Ruhe. Bots, angemeldete Admins sowie Besuche mit «Do Not Track» oder «Global Privacy Control» fehlen absichtlich.
        Verweildauer = sichtbare Zeit auf der Seite (sonst Abstand zum nächsten Aufruf). Absprung = Sitzung mit nur einer Seite, ohne Aktion und unter 10 s.
      </p>
    </div>
  );
}
