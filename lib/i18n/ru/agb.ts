// TODO übersetzen (Russisch) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// Terms and conditions / payment in instalments
export const agb: Woerterbuch['agb'] = {
  meta: {
    titel: 'Terms & Conditions / Payment in Instalments',
    beschreibung:
      'General terms and conditions of The Sartorialist Zurich — including payment in instalments at 0% interest via HeidiPay.',
  },
  breadcrumb: 'Terms & Conditions',
  h1: 'Terms & Conditions / Payment in Instalments',
  hinweisMassgeblich:
    'This English translation is provided for convenience only. The German version is legally binding: [read the German version](/allgemeine-geschaeftsbedingungen/).',
  einleitung:
    'These General Terms and Conditions (hereinafter “GTC”) govern the conclusion, content and performance of contracts between thesartorialist.ch and its customers (hereinafter “Customer”) in connection with the sale of goods. All orders and deliveries are based without exception on these terms and conditions, which the Customer accepts at the time of placing an order.',
  abschnitte: [
    {
      titel: 'Conclusion of contract',
      bloecke: [
        {
          p: 'The presentation of the products does not constitute a legally binding offer but a non-binding catalogue. By placing a binding order, you submit an order for the selected goods. Receipt of your order is confirmed, together with its acceptance, by an automated email immediately after the order is submitted. The purchase contract is concluded upon this email confirmation.',
        },
      ],
    },
    {
      titel: 'Complaints (in the event of defects) / right of return',
      bloecke: [
        {
          p: 'On receipt of the parcel, the Customer must inspect the contents of the delivery without delay. In the case of items that are damaged or do not correspond to the order, the Customer has the right to lodge a complaint within 7 (seven) days of receipt of the goods. The shipping costs of the return are borne by the Customer. After receiving and inspecting the returned goods (unused items only), thesartorialist.ch will provide a free exchange or, on request, a refund of the amount paid. For products already paid for, a refund will be made to the Customer’s bank account; no cash refunds are made.',
        },
        {
          p: 'Accessories and swimwear cannot be exchanged — for reasons of hygiene, these products are excluded from exchange. Ordered items are delivered within 1–4 working days of receipt of payment. The choice of carrier is the responsibility of thesartorialist.ch.',
        },
        {
          p: 'thesartorialist.ch can only deliver individual goods while stocks last and is entitled to make partial deliveries. In the event of delivery disruptions due to circumstances such as strikes, shortages of materials or transport problems, thesartorialist.ch is entitled to cancel confirmed orders; in this case the Customer is entitled to a refund of any purchase price already paid. If redelivery is required because of an incorrect address or failure to collect, the recipient bears the additional shipping costs.',
        },
      ],
    },
    {
      titel: 'Delivery outside Switzerland',
      bloecke: [{ p: 'Customers from Germany or Austria are kindly asked to contact us by email at [{email}](mailto:{email}).' }],
    },
    {
      titel: 'Prices and special offers',
      bloecke: [
        {
          p: 'All prices are stated in CHF (Swiss francs). Additional costs such as packaging and shipping are not included in the prices. thesartorialist.ch reserves the right to change prices at any time. The prices published at the time of ordering apply to the Customer.',
        },
      ],
    },
    {
      titel: 'Payment, warranty and liability',
      bloecke: [
        {
          p: 'Orders are payable by bank transfer or in advance by credit card or PostFinance Card. Responsibility for the selection, use and application of the products lies with the Customer. The Customer is entitled solely to any manufacturer’s warranty, which must be claimed directly from the manufacturer. The products delivered remain the property of thesartorialist.ch until paid for in full.',
        },
      ],
    },
    {
      titel: 'Data protection',
      bloecke: [
        {
          p: 'thesartorialist.ch does not pass on any personal customer data to third parties and is responsible for data protection. Data that is essential for processing the order (e.g. disclosure to the carrier) may be passed on. All customer data is treated in strict confidence.',
        },
      ],
    },
    {
      titel: 'Image rights',
      bloecke: [
        {
          p: 'The images of the products shown are the property of thesartorialist.ch and may not be used for third-party blogs, social media, the press or any other media.',
        },
      ],
    },
    {
      titel: 'Final provisions',
      bloecke: [
        {
          p: 'thesartorialist.ch may amend these GTC at any time. Should one or more of these provisions be void or invalid, the validity of the remaining provisions shall remain unaffected. These GTC are drawn up in German; in the event of any discrepancy, the German version shall prevail. The place of jurisdiction is Zurich; Swiss law applies.',
        },
      ],
    },
    {
      titel: 'Payment in instalments — buy now, pay later — 0% interest',
      bloecke: [
        {
          schritte: [
            'Add the items you would like to your basket',
            'Choose HeidiPay as your payment method at checkout',
            'Enter your card details',
            'Pay in interest-free monthly instalments',
          ],
        },
        {
          p: 'The first instalment is paid at the time of purchase. The remaining instalments are debited automatically from your card every 30 days.',
        },
        { h3: 'Requirements' },
        {
          liste: [
            'You are between 18 and 70 years old',
            'You are resident in Switzerland',
            'You are a Swiss citizen or have held a C or B residence permit for at least 1 year',
          ],
        },
        {
          p: 'We check with the credit agency CRIF AG that you are registered at the residential address provided. If your address cannot be found, please contact CRIF AG by telephone on +41 44 913 50 58 or send proof of address by email to support.ch@crif.com. See the terms and conditions and privacy policy at www.heidipay.com.',
        },
      ],
    },
  ],
};
