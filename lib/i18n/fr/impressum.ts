// TODO übersetzen (Französisch) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// Imprint
export const impressum: Woerterbuch['impressum'] = {
  meta: {
    titel: 'Imprint',
    beschreibung: 'Imprint of The Sartorialist Zurich — Swiss Art Partner AG.',
  },
  h1: 'Imprint',
  hinweisMassgeblich:
    'This English translation is provided for convenience only. The German version is legally binding: [read the German version](/impressum/).',
  unternehmen: {
    titel: 'Company details',
    land: 'Switzerland',
    vertreten: 'Represented by: ',
  },
  kontakt: {
    titel: 'Contact',
    telefon: 'Telephone: ',
    email: 'Email: ',
  },
  abschnitte: [
    {
      titel: 'Consumer dispute resolution / universal arbitration board',
      absaetze: [
        'We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.',
      ],
    },
    {
      titel: 'Liability for content',
      absaetze: [
        'As a service provider, we are responsible for our own content on these pages in accordance with general law. However, we are not obliged to monitor third-party information that is transmitted or stored, or to investigate circumstances that indicate unlawful activity.',
        'Obligations to remove or block the use of information under general law remain unaffected. Liability in this respect is, however, only possible from the moment we become aware of a specific infringement. As soon as we become aware of any such infringement, we will remove the content concerned without delay.',
      ],
    },
    {
      titel: 'Liability for links',
      absaetze: [
        'Our website contains links to external third-party websites over whose content we have no control. We therefore cannot accept any liability for such third-party content. The respective provider or operator of the linked pages is always responsible for their content. The linked pages were checked for possible legal infringements at the time the links were created.',
        'Permanent monitoring of the content of linked pages is not reasonable without concrete evidence of an infringement. As soon as we become aware of any infringements, we will remove such links without delay.',
      ],
    },
    {
      titel: 'Copyright',
      absaetze: [
        'The content and works created by the site operators on these pages are subject to copyright. Reproduction, editing, distribution and any form of exploitation beyond the limits of copyright law require the written consent of the respective author or creator. Downloads and copies of this site are permitted for private, non-commercial use only.',
        'Insofar as the content on this site was not created by the operator, the copyrights of third parties are respected. Should you nevertheless become aware of a copyright infringement, please notify us accordingly. As soon as we become aware of any infringements, we will remove such content without delay.',
      ],
    },
  ],
};
