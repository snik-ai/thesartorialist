import type { Woerterbuch } from '../de';

// Politique de confidentialité
export const datenschutz: Woerterbuch['datenschutz'] = {
  meta: {
    titel: 'Politique de confidentialité',
    beschreibung:
      'Politique de confidentialité de The Sartorialist Zurich — informations sur la collecte et le traitement des données personnelles.',
  },
  h1: 'Politique de confidentialité',
  hinweisMassgeblich:
    'Cette traduction française est fournie à titre informatif uniquement. Seule la version allemande fait foi : [lire la version allemande](/datenschutzerklaerung/).',
  adresse: { land: 'Suisse', telefon: 'Téléphone : ', email: 'E-mail : ' },
  abschnitte: [
    {
      titel: '1. La protection des données en bref',
      bloecke: [
        { h3: 'Remarques générales' },
        {
          p: 'Les informations suivantes donnent un aperçu simple de ce qu’il advient de vos données personnelles lorsque vous visitez ce site. Les données personnelles sont toutes les données permettant de vous identifier personnellement.',
        },
        { h3: 'Collecte de données sur ce site' },
        {
          p: 'Les données de ce site sont traitées par son exploitant, dont vous trouverez les coordonnées dans les [mentions légales](impressum) de ce site. Sur les pages en dehors de la boutique, aucun cookie n’est déposé et aucun contenu de tiers (p. ex. vidéos ou polices externes) n’est chargé. Font exception la mesure d’audience anonyme effectuée par notre agence web (voir section 4, « Mesure d’audience »), le film de la page d’accueil (Vimeo, voir section 4, « Film de la page d’accueil ») et la boutique en ligne sous /shop, exploitée avec Shopify (voir section 4, « Boutique en ligne »).',
        },
        {
          p: 'Certaines données sont collectées lorsque vous nous les communiquez — par exemple lorsque vous nous adressez une demande de rendez-vous par e-mail ou par téléphone. D’autres données sont collectées automatiquement par les systèmes informatiques de l’hébergeur lors de votre visite du site (surtout des données techniques telles que votre navigateur, votre système d’exploitation ou l’heure de consultation de la page).',
        },
      ],
    },
    {
      titel: '2. Hébergement',
      bloecke: [
        {
          p: 'Ce site est hébergé par un prestataire externe (hébergeur). Les données collectées lors de la visite du site sont enregistrées sur les serveurs de l’hébergeur. Il s’agit surtout d’adresses IP, de métadonnées et de données de communication, ainsi que de données d’accès au site. Nous recourons à l’hébergeur dans l’intérêt d’une mise à disposition sûre, rapide et efficace de notre site. Notre hébergeur ne traite vos données que dans la mesure nécessaire à l’exécution de ses obligations contractuelles.',
        },
      ],
    },
    {
      titel: '3. Remarques générales et informations obligatoires',
      bloecke: [
        { h3: 'Protection des données' },
        {
          p: 'Les exploitants de ces pages prennent très au sérieux la protection de vos données personnelles. Nous traitons vos données personnelles de manière confidentielle et conformément aux dispositions légales en matière de protection des données (en particulier la loi fédérale suisse sur la protection des données (LPD) et — dans la mesure où il est applicable — le règlement général de l’UE sur la protection des données (RGPD)) ainsi qu’à la présente politique de confidentialité.',
        },
        {
          p: 'Nous attirons votre attention sur le fait que la transmission de données sur Internet (p. ex. lors de la communication par e-mail) peut présenter des failles de sécurité. Une protection complète des données contre l’accès par des tiers n’est pas possible.',
        },
        { h3: 'Responsable du traitement' },
        { p: 'Le responsable du traitement des données sur ce site est :' },
        { adresse: true },
        { h3: 'Vos droits' },
        {
          p: 'Vous avez à tout moment le droit d’obtenir gratuitement des informations sur l’origine, les destinataires et la finalité de vos données personnelles enregistrées. Vous avez également le droit d’en demander la rectification ou l’effacement, la limitation du traitement ainsi que la portabilité des données. Vous pouvez révoquer à tout moment, avec effet pour l’avenir, un consentement donné au traitement des données. Vous avez en outre le droit de déposer une plainte auprès de l’autorité de surveillance compétente (en Suisse : le Préposé fédéral à la protection des données et à la transparence, PFPDT).',
        },
        { h3: 'Chiffrement SSL/TLS' },
        {
          p: 'Pour des raisons de sécurité et pour protéger la transmission de contenus confidentiels, ce site utilise un chiffrement SSL/TLS. Vous reconnaissez une connexion chiffrée au fait que la ligne d’adresse du navigateur passe de « http:// » à « https:// » et au symbole du cadenas dans la barre de votre navigateur.',
        },
      ],
    },
    {
      titel: '4. Collecte de données sur ce site',
      bloecke: [
        { h3: 'Fichiers journaux du serveur' },
        {
          p: 'Le fournisseur de ces pages collecte et enregistre automatiquement des informations dans des fichiers journaux du serveur (server log files), que votre navigateur nous transmet automatiquement :',
        },
        {
          liste: [
            'Type et version du navigateur',
            'Système d’exploitation utilisé',
            'URL de référence',
            'Nom d’hôte de l’ordinateur qui accède au site',
            'Heure de la requête au serveur',
            'Adresse IP',
          ],
        },
        {
          p: 'Ces données ne sont pas combinées avec d’autres sources de données. L’exploitant du site a un intérêt légitime à une présentation techniquement irréprochable et à l’optimisation de son site — à cette fin, les fichiers journaux du serveur doivent être enregistrés.',
        },
        { h3: 'Mesure d’audience' },
        {
          p: 'Afin d’améliorer ce site, notre agence web DLM Digital (Zurich, Suisse) mesure de manière anonyme, sur notre mandat, quelles pages sont consultées et quels canaux de contact (téléphone, WhatsApp, e-mail, formulaire) sont utilisés. À cette fin, aucun cookie n’est déposé et aucune adresse IP n’est enregistrée ; une reconnaissance au-delà de la même journée n’est pas possible. Le contenu des formulaires (p. ex. nom, e-mail, message) n’est pas transmis à DLM Digital. Les données sont traitées en Suisse ou dans l’UE.',
        },
        { h3: 'Nos propres statistiques de visite' },
        {
          p: 'En outre, nous tenons nos propres statistiques de visite, sans cookies, sur notre serveur. Nous enregistrons la page consultée et son titre, la version linguistique du site, le site de provenance (uniquement son domaine), d’éventuels paramètres de campagne (utm_source, utm_medium, utm_campaign, utm_term, utm_content) et si la visite provient d’un clic publicitaire Google (oui/non uniquement), le type d’appareil, le navigateur et le système d’exploitation (à partir de l’identifiant du navigateur), une taille d’écran approximative, la langue du navigateur, un pays approximatif (d’après la région de votre réglage de langue ou une indication de pays de notre hébergeur, jamais d’après l’adresse IP), le temps de consultation visible de la page, ainsi que les clics sur les moyens de contact (téléphone, WhatsApp, e-mail, itinéraire), les actions dans le configurateur et la boutique et l’envoi de formulaires (uniquement leur type, jamais leur contenu). Afin de pouvoir compter les visites, nous calculons à partir de l’adresse IP, de l’identifiant du navigateur et de la date, combinés à une clé secrète, une valeur de contrôle abrégée (hash) ; les pages consultées successivement sont regroupées en une visite sur notre serveur. L’adresse IP elle-même n’est pas enregistrée ; la valeur de contrôle change chaque jour et ne permet aucune conclusion sur votre personne. Aucun cookie ni aucune autre mémoire de votre navigateur n’est utilisé. Si votre navigateur envoie le signal « Do Not Track » ou « Global Privacy Control », nous n’enregistrons rien. Les données servent exclusivement à notre propre analyse, ne sont pas transmises à des tiers et sont stockées en Suisse ou dans l’UE. La base juridique est notre intérêt légitime à concevoir le site en fonction des besoins.',
        },
        { h3: 'Film de la page d’accueil (Vimeo)' },
        {
          p: 'Sur la page d’accueil, nous présentons notre film via le service vidéo Vimeo (Vimeo.com Inc., New York, États-Unis). Nous l’intégrons avec le paramètre « Do Not Track » : Vimeo ne dépose aucun cookie et ne crée aucun profil d’utilisation. Lors du chargement du film, Vimeo reçoit nécessairement, pour des raisons techniques, votre adresse IP et des informations sur votre navigateur.',
        },
        { h3: 'Configurateur de costume sur mesure' },
        {
          p: 'Votre sélection dans le configurateur de costume sur mesure (« Styles & options ») est enregistrée exclusivement dans votre navigateur (localStorage) et ne nous est pas transmise. Nous ne la recevons que si vous l’envoyez avec une demande de rendez-vous ou si vous nous transmettez le PDF. Vous pouvez supprimer votre sélection à tout moment via « Tout réinitialiser ».',
        },
        { h3: 'Boutique en ligne (Shopify)' },
        {
          p: 'Notre boutique en ligne sous thesartorialist.ch/shop est exploitée avec Shopify (Shopify International Limited, Dublin, Irlande, et Shopify Inc., Ottawa, Canada). Les données des produits, les images et les prix sont chargés depuis Shopify ; les images des produits sont fournies directement par le serveur de Shopify (cdn.shopify.com), qui reçoit nécessairement votre adresse IP pour des raisons techniques.',
        },
        {
          p: 'Dès que vous ajoutez un article à votre panier, nous déposons un cookie strictement nécessaire contenant l’identifiant de votre panier (valable 14 jours) ainsi que les cookies de session de Shopify, afin que votre panier et votre commande correspondent. Vous finalisez la commande elle-même — adresse, envoi et paiement — dans le processus de paiement de Shopify sous shop.thesartorialist.ch, où s’appliquent également les dispositions de Shopify en matière de protection des données. Les données sont traitées pour l’exécution du contrat de vente. Shopify peut également traiter des données dans des pays hors de Suisse et de l’UE ; des clauses contractuelles types sont prévues à cet effet.',
        },
        { h3: 'Demandes de rendez-vous et de rappel via le site' },
        {
          p: 'Si vous demandez un rendez-vous ou un rappel via le site, nous envoyons vos informations (nom, téléphone, e-mail, date souhaitée et — si vous l’avez choisie — votre sélection de style) par e-mail à notre atelier et vous envoyons une confirmation. Pour l’envoi de ces e-mails, nous utilisons le service Resend (Resend Inc., San Francisco, États-Unis), avec un traitement des données dans l’UE. Nous enregistrons également vos informations dans notre base de données clients, afin de préparer votre rendez-vous et votre conseil et de donner suite à votre demande. Nous utilisons ces données exclusivement pour traiter votre demande et vous accompagner en tant que client. Nous ne vous contactons par WhatsApp ou SMS que si vous y avez expressément consenti ; vous pouvez révoquer ce consentement à tout moment.',
        },
        { h3: 'Demandes par e-mail ou par téléphone' },
        {
          p: 'Si vous nous contactez par e-mail ou par téléphone (p. ex. pour une demande de rendez-vous), votre demande, y compris les coordonnées que vous nous communiquez, est enregistrée par nos soins aux fins du traitement de la demande et pour d’éventuelles questions complémentaires. Nous ne transmettons pas ces données sans votre consentement. Les données restent chez nous jusqu’à ce que vous nous demandiez de les effacer ou que la finalité de leur conservation disparaisse. Les dispositions légales impératives — en particulier les délais de conservation — demeurent réservées.',
        },
      ],
    },
  ],
};
