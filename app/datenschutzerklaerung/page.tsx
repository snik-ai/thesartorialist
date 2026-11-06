import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description:
    'Datenschutzerklärung von The Sartorialist Zürich — Informationen zur Erhebung und Verarbeitung personenbezogener Daten.',
  alternates: { canonical: '/datenschutzerklaerung/' },
};

export default function DatenschutzPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ name: 'Datenschutzerklärung', href: '/datenschutzerklaerung/' }]}
      />
      <section className="page-hero">
        <div className="container">
          <h1 className="display">Datenschutzerklärung</h1>
        </div>
      </section>
      <section className="container prose" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <h2>1. Datenschutz auf einen Blick</h2>
        <h3>Allgemeine Hinweise</h3>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
          personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
          Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert
          werden können.
        </p>
        <h3>Datenerfassung auf dieser Website</h3>
        <p>
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber.
          Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen. Auf den
          Seiten ausserhalb des Shops werden keine Cookies gesetzt und keine Inhalte von
          Drittanbietern (z.&nbsp;B. Videos oder externe Schriften) nachgeladen. Ausnahmen
          sind die anonyme Reichweitenmessung durch unsere Webagentur (siehe Abschnitt 4,
          «Reichweitenmessung»), der Film auf der Startseite (Vimeo, siehe Abschnitt 4,
          «Film auf der Startseite») und der Online-Shop unter /shop, der mit Shopify
          betrieben wird (siehe Abschnitt 4, «Online-Shop»).
        </p>
        <p>
          Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen — z.&nbsp;B.
          wenn Sie uns per E-Mail oder Telefon eine Terminanfrage senden. Andere Daten
          werden automatisch beim Besuch der Website durch die IT-Systeme des Hosters
          erfasst (v.&nbsp;a. technische Daten wie Internetbrowser, Betriebssystem oder
          Uhrzeit des Seitenaufrufs).
        </p>

        <h2>2. Hosting</h2>
        <p>
          Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die beim
          Besuch der Website erfassten Daten werden auf den Servern des Hosters
          gespeichert. Hierbei handelt es sich v.&nbsp;a. um IP-Adressen, Meta- und
          Kommunikationsdaten sowie Websitezugriffe. Der Einsatz des Hosters erfolgt im
          Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres
          Online-Angebots. Unser Hoster verarbeitet Ihre Daten nur, soweit dies zur
          Erfüllung seiner Leistungspflichten erforderlich ist.
        </p>

        <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
        <h3>Datenschutz</h3>
        <p>
          Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr
          ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend
          den gesetzlichen Datenschutzvorschriften (insbesondere dem schweizerischen
          Datenschutzgesetz, DSG, sowie — soweit anwendbar — der DSGVO) und dieser
          Datenschutzerklärung.
        </p>
        <p>
          Wir weisen darauf hin, dass die Datenübertragung im Internet (z.&nbsp;B. bei der
          Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser
          Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
        </p>
        <h3>Hinweis zur verantwortlichen Stelle</h3>
        <p>
          Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
        </p>
        <p>
          {SITE.founder}
          <br />
          {SITE.legalName}
          <br />
          {SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}, Schweiz
          <br />
          Telefon: {SITE.phone}
          <br />
          E-Mail: {SITE.email}
        </p>
        <h3>Ihre Rechte</h3>
        <p>
          Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger
          und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben
          ausserdem ein Recht auf Berichtigung oder Löschung dieser Daten, auf
          Einschränkung der Verarbeitung sowie auf Datenübertragbarkeit. Eine erteilte
          Einwilligung zur Datenverarbeitung können Sie jederzeit für die Zukunft
          widerrufen. Zudem steht Ihnen ein Beschwerderecht bei der zuständigen
          Aufsichtsbehörde zu (in der Schweiz: Eidgenössischer Datenschutz- und
          Öffentlichkeitsbeauftragter, EDÖB).
        </p>
        <h3>SSL- bzw. TLS-Verschlüsselung</h3>
        <p>
          Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung
          vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte
          Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von «http://»
          auf «https://» wechselt, sowie am Schloss-Symbol in Ihrer Browserzeile.
        </p>

        <h2>4. Datenerfassung auf dieser Website</h2>
        <h3>Server-Log-Dateien</h3>
        <p>
          Der Provider der Seiten erhebt und speichert automatisch Informationen in
          sogenannten Server-Log-Dateien, die Ihr Browser automatisch übermittelt:
        </p>
        <ul>
          <li>Browsertyp und Browserversion</li>
          <li>verwendetes Betriebssystem</li>
          <li>Referrer-URL</li>
          <li>Hostname des zugreifenden Rechners</li>
          <li>Uhrzeit der Serveranfrage</li>
          <li>IP-Adresse</li>
        </ul>
        <p>
          Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht
          vorgenommen. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch
          fehlerfreien Darstellung und der Optimierung seiner Website — hierzu müssen die
          Server-Log-Files erfasst werden.
        </p>
        <h3>Reichweitenmessung</h3>
        <p>
          Zur Verbesserung dieser Website misst unsere Webagentur DLM Digital (Zürich,
          Schweiz) in unserem Auftrag anonym, welche Seiten aufgerufen und welche
          Kontaktwege (Telefon, WhatsApp, E-Mail, Formular) genutzt werden. Dafür werden
          keine Cookies gesetzt und keine IP-Adressen gespeichert; eine Wiedererkennung über
          den Tag hinaus ist nicht möglich. Inhalte von Formularen (z.&nbsp;B. Name, E-Mail,
          Nachricht) werden nicht an DLM Digital übermittelt. Die Daten werden in der
          Schweiz bzw. EU verarbeitet.
        </p>
        <h3>Film auf der Startseite (Vimeo)</h3>
        <p>
          Auf der Startseite zeigen wir unseren Film über den Videodienst Vimeo (Vimeo.com
          Inc., New York, USA). Wir binden ihn mit der Einstellung «Do Not Track» ein: Vimeo
          setzt dabei keine Cookies und erstellt keine Nutzungsprofile. Beim Laden des Films
          erhält Vimeo technisch bedingt Ihre IP-Adresse und Angaben zu Ihrem Browser.
        </p>
        <h3>Massanzug-Konfigurator</h3>
        <p>
          Ihre Auswahl im Massanzug-Konfigurator («Styles & Options») wird ausschliesslich in
          Ihrem Browser gespeichert (localStorage) und nicht an uns übertragen. Sie erhalten
          wir erst, wenn Sie sie mit einer Terminanfrage mitschicken oder uns das PDF senden.
          Sie können die Auswahl jederzeit über «Alles zurücksetzen» löschen.
        </p>
        <h3>Online-Shop (Shopify)</h3>
        <p>
          Unser Online-Shop unter thesartorialist.ch/shop wird mit Shopify betrieben
          (Shopify International Limited, Dublin, Irland, und Shopify Inc., Ottawa, Kanada).
          Produktdaten, Bilder und Preise werden von Shopify geladen; Produktbilder kommen
          dabei direkt vom Shopify-Server (cdn.shopify.com), der Ihre IP-Adresse technisch
          bedingt erhält.
        </p>
        <p>
          Sobald Sie einen Artikel in den Warenkorb legen, setzen wir ein technisch
          notwendiges Cookie mit der Kennung Ihres Warenkorbs (gültig 14 Tage) sowie die
          Sitzungs-Cookies von Shopify, damit Warenkorb und Bestellung zusammenpassen. Die
          Bestellung selbst — Adresse, Versand und Zahlung — schliessen Sie im Checkout von
          Shopify unter shop.thesartorialist.ch ab; dort gelten zusätzlich die
          Datenschutzhinweise von Shopify. Die Datenverarbeitung erfolgt zur Erfüllung des
          Kaufvertrags. Shopify kann Daten auch in Ländern ausserhalb der Schweiz und der EU
          bearbeiten; dafür bestehen Standardvertragsklauseln.
        </p>
        <h3>Terminanfrage und Rückruf über die Website</h3>
        <p>
          Wenn Sie über die Website einen Termin anfragen oder um einen Rückruf bitten, übermitteln
          wir Ihre Angaben (Name, Telefon, E-Mail, Wunschtermin und — falls gewählt — Ihre
          Stil-Auswahl) per E-Mail an unser Atelier und senden Ihnen eine Bestätigung. Für den
          Versand nutzen wir den Dienst Resend (Resend Inc., San Francisco, USA) mit
          Datenverarbeitung in der EU. Die Daten verwenden wir ausschliesslich zur Bearbeitung
          Ihrer Anfrage.
        </p>
        <h3>Anfragen per E-Mail oder Telefon</h3>
        <p>
          Wenn Sie uns per E-Mail oder Telefon kontaktieren (z.&nbsp;B. für eine
          Terminanfrage), werden Ihre Angaben inklusive der von Ihnen angegebenen
          Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen
          bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
          Die Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern oder der Zweck
          für die Datenspeicherung entfällt. Zwingende gesetzliche Bestimmungen —
          insbesondere Aufbewahrungsfristen — bleiben unberührt.
        </p>
      </section>
    </>
  );
}
