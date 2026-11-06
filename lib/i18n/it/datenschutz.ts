// TODO übersetzen (Italienisch) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// Privacy policy
export const datenschutz: Woerterbuch['datenschutz'] = {
  meta: {
    titel: 'Privacy Policy',
    beschreibung:
      'Privacy policy of The Sartorialist Zurich — information on the collection and processing of personal data.',
  },
  h1: 'Privacy Policy',
  hinweisMassgeblich:
    'This English translation is provided for convenience only. The German version is legally binding: [read the German version](/datenschutzerklaerung/).',
  adresse: { land: 'Switzerland', telefon: 'Telephone: ', email: 'Email: ' },
  abschnitte: [
    {
      titel: '1. Data protection at a glance',
      bloecke: [
        { h3: 'General information' },
        {
          p: 'The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data by which you can be personally identified.',
        },
        { h3: 'Data collection on this website' },
        {
          p: 'Data on this website is processed by the website operator, whose contact details can be found in the [imprint](impressum) of this website. On the pages outside the shop, no cookies are set and no third-party content (e.g. videos or external fonts) is loaded. The exceptions are the anonymous audience measurement carried out by our web agency (see section 4, “Audience measurement”), the film on the home page (Vimeo, see section 4, “Film on the home page”) and the online shop at /shop, which is operated with Shopify (see section 4, “Online shop”).',
        },
        {
          p: 'Some data is collected when you provide it to us — for example, when you send us an appointment request by email or telephone. Other data is collected automatically by the hosting provider’s IT systems when you visit the website (above all technical data such as your web browser, operating system or the time the page was accessed).',
        },
      ],
    },
    {
      titel: '2. Hosting',
      bloecke: [
        {
          p: 'This website is hosted by an external service provider (host). The data collected when you visit the website is stored on the host’s servers. This consists above all of IP addresses, metadata and communication data, and website access data. We use the host in the interest of providing our website securely, quickly and efficiently. Our host processes your data only to the extent necessary to fulfil its contractual obligations.',
        },
      ],
    },
    {
      titel: '3. General information and mandatory disclosures',
      bloecke: [
        { h3: 'Data protection' },
        {
          p: 'The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations (in particular the Swiss Federal Act on Data Protection (FADP) and — where applicable — the EU General Data Protection Regulation (GDPR)) and this privacy policy.',
        },
        {
          p: 'Please note that data transmitted over the internet (e.g. when communicating by email) may be subject to security vulnerabilities. Complete protection of data against access by third parties is not possible.',
        },
        { h3: 'Controller' },
        { p: 'The controller responsible for data processing on this website is:' },
        { adresse: true },
        { h3: 'Your rights' },
        {
          p: 'You have the right at any time to obtain information, free of charge, about the origin, recipients and purpose of your stored personal data. You also have the right to have this data corrected or erased, to restrict its processing and to data portability. You may withdraw any consent you have given to data processing at any time with effect for the future. You also have the right to lodge a complaint with the competent supervisory authority (in Switzerland: the Federal Data Protection and Information Commissioner, FDPIC).',
        },
        { h3: 'SSL/TLS encryption' },
        {
          p: 'For security reasons and to protect the transmission of confidential content, this site uses SSL/TLS encryption. You can recognise an encrypted connection by the address bar of your browser changing from “http://” to “https://” and by the padlock symbol in your browser bar.',
        },
      ],
    },
    {
      titel: '4. Data collection on this website',
      bloecke: [
        { h3: 'Server log files' },
        {
          p: 'The provider of these pages automatically collects and stores information in so-called server log files, which your browser transmits automatically:',
        },
        {
          liste: [
            'Browser type and browser version',
            'Operating system used',
            'Referrer URL',
            'Host name of the accessing computer',
            'Time of the server request',
            'IP address',
          ],
        },
        {
          p: 'This data is not combined with other data sources. The website operator has a legitimate interest in the technically error-free presentation and optimisation of its website — for this purpose, the server log files must be recorded.',
        },
        { h3: 'Audience measurement' },
        {
          p: 'To improve this website, our web agency DLM Digital (Zurich, Switzerland) measures anonymously, on our behalf, which pages are viewed and which contact channels (telephone, WhatsApp, email, form) are used. No cookies are set and no IP addresses are stored for this purpose; recognition beyond the same day is not possible. The content of forms (e.g. name, email, message) is not transmitted to DLM Digital. The data is processed in Switzerland or the EU.',
        },
        { h3: 'Our own visitor statistics' },
        {
          p: 'In addition, we keep our own cookie-free visitor statistics on our server. We record the page viewed, the referring website (its domain only), any campaign parameters (utm_source, utm_medium, utm_campaign), the device type (smartphone, tablet, computer), the browser language, as well as clicks on contact channels (telephone, WhatsApp, email, directions) and form submissions. To be able to count visits, we create a truncated check value (hash) from the IP address, browser identifier and the date, combined with a secret key. The IP address itself is not stored; the check value changes daily and does not allow any conclusions to be drawn about you personally. Neither cookies nor any other storage in your browser are used. The data is used exclusively for our own analysis, is not passed on to third parties and is stored in Switzerland or the EU. The legal basis is our legitimate interest in designing the website to meet visitors’ needs.',
        },
        { h3: 'Film on the home page (Vimeo)' },
        {
          p: 'On the home page we show our film via the video service Vimeo (Vimeo.com Inc., New York, USA). We embed it with the “Do Not Track” setting: Vimeo does not set any cookies and does not create usage profiles. When the film is loaded, Vimeo necessarily receives your IP address and information about your browser for technical reasons.',
        },
        { h3: 'Made-to-measure suit configurator' },
        {
          p: 'Your selection in the made-to-measure suit configurator (“Styles & Options”) is stored exclusively in your browser (localStorage) and is not transmitted to us. We only receive it if you send it with an appointment request or send us the PDF. You can delete your selection at any time via “Reset all”.',
        },
        { h3: 'Online shop (Shopify)' },
        {
          p: 'Our online shop at thesartorialist.ch/shop is operated with Shopify (Shopify International Limited, Dublin, Ireland, and Shopify Inc., Ottawa, Canada). Product data, images and prices are loaded from Shopify; product images are delivered directly from the Shopify server (cdn.shopify.com), which necessarily receives your IP address for technical reasons.',
        },
        {
          p: 'As soon as you add an item to your basket, we set a strictly necessary cookie containing the identifier of your basket (valid for 14 days) as well as Shopify’s session cookies, so that your basket and order match. You complete the order itself — address, shipping and payment — in Shopify’s checkout at shop.thesartorialist.ch, where Shopify’s privacy notices also apply. The data is processed for the performance of the purchase contract. Shopify may also process data in countries outside Switzerland and the EU; standard contractual clauses are in place for this.',
        },
        { h3: 'Appointment and call-back requests via the website' },
        {
          p: 'If you request an appointment or a call-back via the website, we send your details (name, telephone, email, preferred date and — if selected — your style choices) by email to our atelier and send you a confirmation. To send these emails we use the service Resend (Resend Inc., San Francisco, USA), with data processing in the EU. We also store your details in our customer database so that we can prepare your appointment and consultation and follow up on your request. We use the data exclusively to handle your request and to look after you as a customer. We only contact you via WhatsApp or SMS if you have expressly consented to this; you may withdraw this consent at any time.',
        },
        { h3: 'Enquiries by email or telephone' },
        {
          p: 'If you contact us by email or telephone (e.g. for an appointment request), your enquiry, including the contact details you provide, is stored by us for the purpose of handling the request and in case of follow-up questions. We do not pass on this data without your consent. The data remains with us until you ask us to delete it or the purpose for storing it no longer applies. Mandatory statutory provisions — in particular retention periods — remain unaffected.',
        },
      ],
    },
  ],
};
