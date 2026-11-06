import type { Woerterbuch } from '../de';

// Обзор брендов, а также тексты интерфейса страниц брендов и страниц цветов костюмов
export const brands: Woerterbuch['brands'] = {
  meta: {
    titel: 'Бренды — наши портновские дома и ткацкие фабрики',
    beschreibung:
      'Бренды The Sartorialist в Цюрихе: Orazio Luciano, Maria Santangelo, Loro Piana, Holland & Sherry, Gran Sasso и Woolrich — семейные дома, выбранные лично.',
    ogTitel: 'Бренды — The Sartorialist Цюрих',
    ogBeschreibung: 'Семейные дома, выбранные лично.',
  },
  breadcrumb: 'Бренды',
  hero: {
    eyebrow: 'Наши бренды',
    h1: 'Настоящие лица за марками',
    lead: 'Мы работаем исключительно с семейными предприятиями, которые знаем лично. Каждым домом руководят мастера своего дела, за плечами которых десятилетия традиций.',
  },
  farben: {
    eyebrow: 'Пошив на заказ',
    titel: 'Костюмы по цветам',
    bildAlt: '{name} — пошив на заказ в Цюрихе',
  },
  marke: {
    metaTitel: '{name} — {claim}',
    ogTitel: '{name} в The Sartorialist, Цюрих',
    bildAlt: '{name} в The Sartorialist, Цюрих',
    termin: 'Записаться на встречу',
    shopEyebrow: 'В магазине',
    shopTitel: '{name} в The Sartorialist',
    shopBildAlt: '{titel} — {name}',
    alleImShop: 'Весь {name} в магазине',
    impressionenEyebrow: 'Впечатления',
    impressionAlt: '{name} — впечатление {n}, The Sartorialist Цюрих',
    weitereEyebrow: 'Другие бренды',
    weitereTitel: 'Откройте для себя наши дома',
    ctaTitel: 'Познакомьтесь с {name} лично — в нашем шоуруме на Kuttelgasse.',
    ctaText: 'Спокойная консультация без обязательств за чашкой эспрессо — и новое вдохновение.',
    schemaName: '{name} в Цюрихе',
  },
  farbe: {
    breadcrumbMassanzug: 'Костюм на заказ',
    eyebrow: 'Пошив на заказ',
    bildAlt: '{name} — пошив на заказ от The Sartorialist, Цюрих',
    termin: 'Записаться на встречу',
    weitereFarben: 'Другие цвета',
    ctaTitel: '{name} на заказ — от CHF 1’690.',
    ctaText: 'Выбор ткани, снятие мерок и консультация в нашем шоуруме: Kuttelgasse 7, Цюрих.',
    schemaName: '{name} на заказ в Цюрихе',
  },
};
