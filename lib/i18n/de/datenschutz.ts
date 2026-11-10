// Datenschutzerklärung

/** Ein Baustein eines Abschnitts: Zwischentitel, Absatz (mit Rich-Auszeichnung), Aufzählung
 * oder der Adressblock der verantwortlichen Stelle (aus lib/site.ts). */
type Block = { h3?: string; p?: string; liste?: string[]; adresse?: boolean };

const abschnitte: { titel: string; bloecke: Block[] }[] = [
  {
    titel: '1. Datenschutz auf einen Blick',
    bloecke: [
      { h3: 'Allgemeine Hinweise' },
      {
        p: 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.',
      },
      { h3: 'Datenerfassung auf dieser Website' },
      {
        p: 'Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen. Auf den Seiten ausserhalb des Shops werden keine Cookies gesetzt und keine Inhalte von Drittanbietern (z. B. Videos oder externe Schriften) nachgeladen. Ausnahmen sind die anonyme Reichweitenmessung durch unsere Webagentur (siehe Abschnitt 4, «Reichweitenmessung»), der Film auf der Startseite (Vimeo, siehe Abschnitt 4, «Film auf der Startseite») und der Online-Shop unter /shop, der mit Shopify betrieben wird (siehe Abschnitt 4, «Online-Shop»).',
      },
      {
        p: 'Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen — z. B. wenn Sie uns per E-Mail oder Telefon eine Terminanfrage senden. Andere Daten werden automatisch beim Besuch der Website durch die IT-Systeme des Hosters erfasst (v. a. technische Daten wie Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).',
      },
    ],
  },
  {
    titel: '2. Hosting',
    bloecke: [
      {
        p: 'Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die beim Besuch der Website erfassten Daten werden auf den Servern des Hosters gespeichert. Hierbei handelt es sich v. a. um IP-Adressen, Meta- und Kommunikationsdaten sowie Websitezugriffe. Der Einsatz des Hosters erfolgt im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots. Unser Hoster verarbeitet Ihre Daten nur, soweit dies zur Erfüllung seiner Leistungspflichten erforderlich ist.',
      },
    ],
  },
  {
    titel: '3. Allgemeine Hinweise und Pflichtinformationen',
    bloecke: [
      { h3: 'Datenschutz' },
      {
        p: 'Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften (insbesondere dem schweizerischen Datenschutzgesetz, DSG, sowie — soweit anwendbar — der DSGVO) und dieser Datenschutzerklärung.',
      },
      {
        p: 'Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.',
      },
      { h3: 'Hinweis zur verantwortlichen Stelle' },
      { p: 'Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:' },
      { adresse: true },
      { h3: 'Ihre Rechte' },
      {
        p: 'Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben ausserdem ein Recht auf Berichtigung oder Löschung dieser Daten, auf Einschränkung der Verarbeitung sowie auf Datenübertragbarkeit. Eine erteilte Einwilligung zur Datenverarbeitung können Sie jederzeit für die Zukunft widerrufen. Zudem steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu (in der Schweiz: Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter, EDÖB).',
      },
      { h3: 'SSL- bzw. TLS-Verschlüsselung' },
      {
        p: 'Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von «http://» auf «https://» wechselt, sowie am Schloss-Symbol in Ihrer Browserzeile.',
      },
    ],
  },
  {
    titel: '4. Datenerfassung auf dieser Website',
    bloecke: [
      { h3: 'Server-Log-Dateien' },
      {
        p: 'Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch übermittelt:',
      },
      {
        liste: [
          'Browsertyp und Browserversion',
          'verwendetes Betriebssystem',
          'Referrer-URL',
          'Hostname des zugreifenden Rechners',
          'Uhrzeit der Serveranfrage',
          'IP-Adresse',
        ],
      },
      {
        p: 'Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website — hierzu müssen die Server-Log-Files erfasst werden.',
      },
      { h3: 'Reichweitenmessung' },
      {
        p: 'Zur Verbesserung dieser Website misst unsere Webagentur DLM Digital (Zürich, Schweiz) in unserem Auftrag anonym, welche Seiten aufgerufen und welche Kontaktwege (Telefon, WhatsApp, E-Mail, Formular) genutzt werden. Dafür werden keine Cookies gesetzt und keine IP-Adressen gespeichert; eine Wiedererkennung über den Tag hinaus ist nicht möglich. Inhalte von Formularen (z. B. Name, E-Mail, Nachricht) werden nicht an DLM Digital übermittelt. Die Daten werden in der Schweiz bzw. EU verarbeitet.',
      },
      { h3: 'Eigene Besucherstatistik' },
      {
        p: 'Zusätzlich führen wir eine eigene, cookielose Besucherstatistik auf unserem Server. Erfasst werden die aufgerufene Seite und ihr Titel, die Sprachversion der Website, die verweisende Website (nur deren Domain), allfällige Kampagnen-Parameter (utm_source, utm_medium, utm_campaign, utm_term, utm_content) und ob ein Werbeklick von Google vorlag (nur ja/nein), der Gerätetyp, Browser und Betriebssystem (aus der Browserkennung), eine grobe Bildschirmgrösse, die Browsersprache, ein ungefähres Land (aus der Region Ihrer Spracheinstellung oder einer Länderangabe unseres Hosting-Anbieters, nie aus der IP-Adresse), die sichtbare Verweildauer auf der Seite sowie Klicks auf Kontaktwege (Telefon, WhatsApp, E-Mail, Route), Aktionen im Konfigurator und im Shop und das Absenden von Formularen (nur die Art, nie deren Inhalt). Um Besuche zählen zu können, bilden wir aus IP-Adresse, Browserkennung und Tagesdatum zusammen mit einem geheimen Schlüssel einen gekürzten Prüfwert (Hash); aufeinanderfolgende Seitenaufrufe fassen wir auf dem Server zu einem Besuch zusammen. Die IP-Adresse selbst wird nicht gespeichert, der Prüfwert wechselt täglich und lässt keinen Rückschluss auf Ihre Person zu; es werden weder Cookies noch andere Speicher in Ihrem Browser verwendet. Sendet Ihr Browser das Signal «Do Not Track» oder «Global Privacy Control», erfassen wir nichts. Die Daten werden ausschliesslich für die eigene Auswertung genutzt, nicht an Dritte weitergegeben und in der Schweiz bzw. EU gespeichert. Rechtsgrundlage ist unser berechtigtes Interesse an einer bedarfsgerechten Gestaltung der Website.',
      },
      { h3: 'Film auf der Startseite (Vimeo)' },
      {
        p: 'Auf der Startseite zeigen wir unseren Film über den Videodienst Vimeo (Vimeo.com Inc., New York, USA). Wir binden ihn mit der Einstellung «Do Not Track» ein: Vimeo setzt dabei keine Cookies und erstellt keine Nutzungsprofile. Beim Laden des Films erhält Vimeo technisch bedingt Ihre IP-Adresse und Angaben zu Ihrem Browser.',
      },
      { h3: 'Massanzug-Konfigurator' },
      {
        p: 'Ihre Auswahl im Massanzug-Konfigurator («Styles & Options») wird ausschliesslich in Ihrem Browser gespeichert (localStorage) und nicht an uns übertragen. Sie erhalten wir erst, wenn Sie sie mit einer Terminanfrage mitschicken oder uns das PDF senden. Sie können die Auswahl jederzeit über «Alles zurücksetzen» löschen.',
      },
      { h3: 'Online-Shop (Shopify)' },
      {
        p: 'Unser Online-Shop unter thesartorialist.ch/shop wird mit Shopify betrieben (Shopify International Limited, Dublin, Irland, und Shopify Inc., Ottawa, Kanada). Produktdaten, Bilder und Preise werden von Shopify geladen; Produktbilder kommen dabei direkt vom Shopify-Server (cdn.shopify.com), der Ihre IP-Adresse technisch bedingt erhält.',
      },
      {
        p: 'Sobald Sie einen Artikel in den Warenkorb legen, setzen wir ein technisch notwendiges Cookie mit der Kennung Ihres Warenkorbs (gültig 14 Tage) sowie die Sitzungs-Cookies von Shopify, damit Warenkorb und Bestellung zusammenpassen. Die Bestellung selbst — Adresse, Versand und Zahlung — schliessen Sie im Checkout von Shopify unter shop.thesartorialist.ch ab; dort gelten zusätzlich die Datenschutzhinweise von Shopify. Die Datenverarbeitung erfolgt zur Erfüllung des Kaufvertrags. Shopify kann Daten auch in Ländern ausserhalb der Schweiz und der EU bearbeiten; dafür bestehen Standardvertragsklauseln.',
      },
      { h3: 'Terminanfrage und Rückruf über die Website' },
      {
        p: 'Wenn Sie über die Website einen Termin anfragen oder um einen Rückruf bitten, übermitteln wir Ihre Angaben (Name, Telefon, E-Mail, Wunschtermin und — falls gewählt — Ihre Stil-Auswahl) per E-Mail an unser Atelier und senden Ihnen eine Bestätigung. Für den Versand nutzen wir den Dienst Resend (Resend Inc., San Francisco, USA) mit Datenverarbeitung in der EU. Ihre Angaben speichern wir zudem in unserer Kundendatenbank, damit wir Termin und Beratung vorbereiten und Ihre Anfrage nachverfolgen können. Die Daten verwenden wir ausschliesslich zur Bearbeitung Ihrer Anfrage und zur Betreuung als Kundin oder Kunde. Per WhatsApp oder SMS kontaktieren wir Sie nur, wenn Sie dem ausdrücklich zugestimmt haben; diese Einwilligung können Sie jederzeit widerrufen.',
      },
      { h3: 'Anfragen per E-Mail oder Telefon' },
      {
        p: 'Wenn Sie uns per E-Mail oder Telefon kontaktieren (z. B. für eine Terminanfrage), werden Ihre Angaben inklusive der von Ihnen angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern oder der Zweck für die Datenspeicherung entfällt. Zwingende gesetzliche Bestimmungen — insbesondere Aufbewahrungsfristen — bleiben unberührt.',
      },
    ],
  },
];

export const datenschutz = {
  meta: {
    titel: 'Datenschutzerklärung',
    beschreibung:
      'Datenschutzerklärung von The Sartorialist Zürich — Informationen zur Erhebung und Verarbeitung personenbezogener Daten.',
  },
  h1: 'Datenschutzerklärung',
  /** Nur in Fremdsprachen angezeigt (unter dem H1), mit Link auf die deutsche Fassung. */
  hinweisMassgeblich: 'Massgeblich ist die deutsche Fassung.',
  /** Beschriftungen im Adressblock der verantwortlichen Stelle */
  adresse: { land: 'Schweiz', telefon: 'Telefon: ', email: 'E-Mail: ' },
  abschnitte,
};
