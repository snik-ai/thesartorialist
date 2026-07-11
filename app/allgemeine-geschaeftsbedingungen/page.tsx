import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'AGB / Zahlung auf Raten',
  description:
    'Allgemeine Geschäftsbedingungen von The Sartorialist Zürich — inkl. Zahlung auf Raten mit 0% Zinsen über HeidiPay.',
  alternates: { canonical: '/allgemeine-geschaeftsbedingungen/' },
};

export default function AgbPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ name: 'AGB', href: '/allgemeine-geschaeftsbedingungen/' }]}
      />
      <section className="page-hero">
        <div className="container">
          <h1 className="display">AGB / Zahlung auf Raten</h1>
        </div>
      </section>
      <section className="container prose" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <p>
          Die vorliegenden Allgemeinen Geschäftsbedingungen (nachfolgend AGB genannt)
          regeln Abschluss, Inhalt und Abwicklung von Verträgen zwischen thesartorialist.ch
          und dessen Kundinnen und Kunden (nachfolgend Kunde genannt) im Zusammenhang mit
          dem Verkauf von Waren. Alle Bestellungen und Lieferungen gründen sich ausnahmslos
          auf diesen Geschäftsbedingungen. Diese werden vom Kunden im Augenblick der
          Bestellung akzeptiert.
        </p>

        <h2>Vertragsabschluss</h2>
        <p>
          Die Darstellung der Produkte stellt kein rechtlich bindendes Angebot, sondern
          einen unverbindlichen Katalog dar. Durch eine verbindliche Bestellung geben Sie
          eine Bestellung der gewählten Waren ab. Die Bestätigung des Eingangs Ihrer
          Bestellung erfolgt zusammen mit der Annahme der Bestellung unmittelbar nach dem
          Absenden durch eine automatisierte E-Mail. Mit dieser E-Mail-Bestätigung ist der
          Kaufvertrag zustande gekommen.
        </p>

        <h2>Beanstandungen (bei Mängeln) / Rückgaberecht</h2>
        <p>
          Bei Erhalt des Paketes muss der Kunde unverzüglich den Inhalt der Lieferung
          überprüfen. Im Falle von beschädigten oder nicht der Bestellung entsprechenden
          Artikeln geniesst der Kunde das Recht auf Beanstandung innert 7 (sieben) Tagen ab
          Erhalt der Ware. Die Versandkosten der Rücksendung gehen zu Lasten des Kunden.
          thesartorialist.ch wird nach Erhalt und Prüfung des Rückversandes (nur bei
          nicht gebrauchten Artikeln) einen kostenlosen Austausch oder auf Wunsch die
          Rückerstattung des bezahlten Betrags vornehmen. Bei bereits bezahlten Produkten
          wird eine Rückerstattung auf das Bankkonto ausgelöst; es folgt keine
          Rückerstattung in Bargeld.
        </p>
        <p>
          Kein Umtausch von Accessoires und Bademode — diese Produkte können aus
          hygienischen Gründen nicht umgetauscht werden. Die Lieferung der bestellten
          Artikel erfolgt innert 1–4 Werktagen ab Zahlungseingang. Die Wahl des Spediteurs
          liegt in der Verantwortung von thesartorialist.ch.
        </p>
        <p>
          thesartorialist.ch kann die einzelnen Waren nur solange Vorrat liefern und ist zu
          Teillieferungen berechtigt. Bei Lieferstörungen infolge von Umständen wie Streik,
          Materialausfall oder Transportproblemen ist thesartorialist.ch berechtigt,
          bestätigte Bestellungen zu annullieren; der Kunde hat in diesem Fall Anspruch auf
          Rückerstattung einer geleisteten Kaufpreiszahlung. Bei erneuter Zustellung wegen
          falscher Adressangabe oder Nichtabholung trägt der Empfänger die zusätzlichen
          Versandkosten.
        </p>

        <h2>Lieferung ausserhalb der Schweiz</h2>
        <p>
          Kunden aus Deutschland oder Österreich wenden sich bitte per E-Mail an{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>

        <h2>Preise und Sonderangebote</h2>
        <p>
          Alle Preise werden in CHF (Schweizer Franken) ausgewiesen. Nebenkosten wie
          Verpackung und Versand sind in den Preisen nicht inbegriffen. thesartorialist.ch
          behält sich das Recht vor, die Preise jederzeit zu ändern. Für die Kunden gelten
          die zum Zeitpunkt der Bestellung veröffentlichten Preise.
        </p>

        <h2>Zahlung, Gewährleistung und Haftung</h2>
        <p>
          Die Bestellungen sind mittels Banküberweisung oder als Vorauskasse mit
          Kreditkarte oder Postcard zu zahlen. Die Verantwortung für Auswahl, Einsatz und
          Gebrauch der Produkte liegt beim Kunden. Dem Kunden steht ausschliesslich eine
          allfällige Werksgarantie des Herstellers zu, die direkt bei diesem geltend zu
          machen ist. Die gelieferten Produkte bleiben bis zur vollständigen Bezahlung
          Eigentum von thesartorialist.ch.
        </p>

        <h2>Datenschutz</h2>
        <p>
          thesartorialist.ch gibt keine persönlichen Kundendaten an Dritte weiter und ist
          für den Datenschutz verantwortlich. Daten, welche zur Abwicklung der Bestellung
          unumgänglich sind (z.&nbsp;B. die Weitergabe an den Spediteur), dürfen
          weitergegeben werden. Alle Kundendaten werden strikt vertraulich behandelt.
        </p>

        <h2>Bildrechte</h2>
        <p>
          Die Bilder der abgebildeten Produkte sind Eigentum von thesartorialist.ch und
          dürfen weder für fremde Blogs, Social Media noch für Presse oder andere Medien
          verwendet werden.
        </p>

        <h2>Schlussbestimmungen</h2>
        <p>
          thesartorialist.ch kann die vorliegenden AGB jederzeit ändern. Sollten eine oder
          mehrere dieser Bestimmungen nichtig oder unwirksam sein, bleibt die
          Verbindlichkeit der übrigen Bestimmungen unberührt. Die AGB sind in deutscher
          Sprache abgefasst; im Falle von Widersprüchen ist die deutsche Version
          massgebend. Gerichtsstand ist Zürich; anwendbar ist Schweizerisches Recht.
        </p>

        <h2>Zahlung auf Raten — Buy now, pay later — 0% Zinsen</h2>
        <ol>
          <li>Lege deine gewünschten Artikel in den Warenkorb</li>
          <li>Wähle HeidiPay als Zahlungsmittel am Checkout</li>
          <li>Gib deine Kartendetails ein</li>
          <li>Zahle in zinslosen monatlichen Raten</li>
        </ol>
        <p>
          Die erste Rate wird zum Zeitpunkt des Kaufs bezahlt. Die restlichen Raten werden
          alle 30 Tage automatisch von deiner Karte abgebucht.
        </p>
        <h3>Voraussetzungen</h3>
        <ul>
          <li>Du bist zwischen 18 und 70 Jahre alt</li>
          <li>Du bist in der Schweiz wohnhaft</li>
          <li>
            Du bist Schweizer Staatsbürger oder hast eine Aufenthaltsbewilligung C oder B
            seit mind. 1 Jahr
          </li>
        </ul>
        <p>
          Wir prüfen bei der Auskunftei CRIF AG, ob du an der angegebenen Wohnadresse
          gemeldet bist. Falls deine Adresse nicht gefunden werden kann, kontaktiere bitte
          die CRIF AG per Telefon +41&nbsp;44&nbsp;913&nbsp;50&nbsp;58 oder sende einen
          Adressnachweis per E-Mail an support.ch@crif.com. Siehe AGB und
          Datenschutzbestimmungen auf www.heidipay.com.
        </p>
      </section>
    </>
  );
}
