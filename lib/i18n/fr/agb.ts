import type { Woerterbuch } from '../de';

// Conditions générales / paiement échelonné
export const agb: Woerterbuch['agb'] = {
  meta: {
    titel: 'Conditions générales / paiement échelonné',
    beschreibung:
      'Conditions générales de The Sartorialist Zurich — y compris le paiement échelonné à 0 % d’intérêt via HeidiPay.',
  },
  breadcrumb: 'Conditions générales',
  h1: 'Conditions générales / paiement échelonné',
  hinweisMassgeblich:
    'Cette traduction française est fournie à titre informatif uniquement. Seule la version allemande fait foi : [lire la version allemande](/allgemeine-geschaeftsbedingungen/).',
  einleitung:
    'Les présentes conditions générales (ci-après « CG ») régissent la conclusion, le contenu et l’exécution des contrats entre thesartorialist.ch et ses clients (ci-après « le Client ») dans le cadre de la vente de marchandises. Toutes les commandes et livraisons reposent sans exception sur les présentes conditions, que le Client accepte au moment de passer commande.',
  abschnitte: [
    {
      titel: 'Conclusion du contrat',
      bloecke: [
        {
          p: 'La présentation des produits ne constitue pas une offre juridiquement contraignante, mais un catalogue sans engagement. En passant une commande ferme, vous commandez les marchandises sélectionnées. La réception de votre commande vous est confirmée, avec son acceptation, par un e-mail automatique immédiatement après l’envoi de la commande. Le contrat de vente est conclu au moment de cette confirmation par e-mail.',
        },
      ],
    },
    {
      titel: 'Réclamations (en cas de défauts) / droit de retour',
      bloecke: [
        {
          p: 'À la réception du colis, le Client doit vérifier sans délai le contenu de la livraison. Pour les articles endommagés ou non conformes à la commande, le Client a le droit de déposer une réclamation dans un délai de 7 (sept) jours à compter de la réception de la marchandise. Les frais d’envoi du retour sont à la charge du Client. Après réception et contrôle de la marchandise retournée (uniquement des articles non utilisés), thesartorialist.ch procède à un échange gratuit ou, sur demande, au remboursement du montant payé. Pour les produits déjà payés, le remboursement est effectué sur le compte bancaire du Client ; aucun remboursement n’est effectué en espèces.',
        },
        {
          p: 'Les accessoires et les maillots de bain ne peuvent pas être échangés — pour des raisons d’hygiène, ces produits sont exclus de l’échange. Les articles commandés sont livrés dans un délai de 1 à 4 jours ouvrables après réception du paiement. Le choix du transporteur relève de thesartorialist.ch.',
        },
        {
          p: 'thesartorialist.ch ne peut livrer certaines marchandises que dans la limite des stocks disponibles et est en droit d’effectuer des livraisons partielles. En cas de perturbations de livraison dues à des circonstances telles que grèves, pénuries de matériaux ou problèmes de transport, thesartorialist.ch est en droit d’annuler des commandes confirmées ; dans ce cas, le Client a droit au remboursement du prix d’achat déjà payé. Si une nouvelle livraison est nécessaire en raison d’une adresse erronée ou d’un défaut de retrait, les frais d’envoi supplémentaires sont à la charge du destinataire.',
        },
      ],
    },
    {
      titel: 'Livraison hors de Suisse',
      bloecke: [{ p: 'Nous prions les clients d’Allemagne ou d’Autriche de nous contacter par e-mail à l’adresse [{email}](mailto:{email}).' }],
    },
    {
      titel: 'Prix et offres spéciales',
      bloecke: [
        {
          p: 'Tous les prix sont indiqués en CHF (francs suisses). Les frais supplémentaires tels que l’emballage et l’envoi ne sont pas compris dans les prix. thesartorialist.ch se réserve le droit de modifier les prix à tout moment. Les prix publiés au moment de la commande s’appliquent au Client.',
        },
      ],
    },
    {
      titel: 'Paiement, garantie et responsabilité',
      bloecke: [
        {
          p: 'Les commandes sont payables par virement bancaire ou d’avance par carte de crédit ou PostFinance Card. La responsabilité du choix, de l’utilisation et de l’emploi des produits incombe au Client. Le Client ne peut se prévaloir que d’une éventuelle garantie du fabricant, à faire valoir directement auprès de ce dernier. Les produits livrés restent la propriété de thesartorialist.ch jusqu’à leur paiement intégral.',
        },
      ],
    },
    {
      titel: 'Protection des données',
      bloecke: [
        {
          p: 'thesartorialist.ch ne transmet aucune donnée personnelle de ses clients à des tiers et est responsable de la protection des données. Les données indispensables au traitement de la commande (p. ex. leur communication au transporteur) peuvent être transmises. Toutes les données des clients sont traitées de manière strictement confidentielle.',
        },
      ],
    },
    {
      titel: 'Droits sur les images',
      bloecke: [
        {
          p: 'Les images des produits présentés sont la propriété de thesartorialist.ch et ne peuvent être utilisées ni pour des blogs de tiers, ni pour les réseaux sociaux, la presse ou tout autre média.',
        },
      ],
    },
    {
      titel: 'Dispositions finales',
      bloecke: [
        {
          p: 'thesartorialist.ch peut modifier les présentes CG à tout moment. Si une ou plusieurs de ces dispositions devaient être nulles ou invalides, la validité des autres dispositions n’en serait pas affectée. Les présentes CG sont rédigées en allemand ; en cas de divergence, la version allemande prévaut. Le for juridique est Zurich ; le droit suisse est applicable.',
        },
      ],
    },
    {
      titel: 'Paiement échelonné — achetez maintenant, payez plus tard — 0 % d’intérêt',
      bloecke: [
        {
          schritte: [
            'Ajoutez les articles souhaités à votre panier',
            'Choisissez HeidiPay comme mode de paiement lors de la commande',
            'Saisissez les données de votre carte',
            'Payez en mensualités sans intérêts',
          ],
        },
        {
          p: 'La première mensualité est payée au moment de l’achat. Les mensualités suivantes sont débitées automatiquement de votre carte tous les 30 jours.',
        },
        { h3: 'Conditions' },
        {
          liste: [
            'Vous avez entre 18 et 70 ans',
            'Vous êtes domicilié en Suisse',
            'Vous êtes de nationalité suisse ou titulaire d’un permis de séjour C ou B depuis au moins 1 an',
          ],
        },
        {
          p: 'Nous vérifions auprès de l’agence de renseignements de crédit CRIF AG que vous êtes enregistré à l’adresse de domicile indiquée. Si votre adresse est introuvable, veuillez contacter CRIF AG par téléphone au +41 44 913 50 58 ou envoyer un justificatif de domicile par e-mail à support.ch@crif.com. Voir les conditions générales et la politique de confidentialité sur www.heidipay.com.',
        },
      ],
    },
  ],
};
