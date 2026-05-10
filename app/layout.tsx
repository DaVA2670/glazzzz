import type { Metadata, Viewport } from 'next';
import './globals.css';
import CookieConsent from './CookieConsent';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://glazgoroda.ru';
const siteName = 'Глаз Города';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020915'
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Глаз Города — LED-экраны во Владикавказе · DOOH-реклама',
    template: '%s · Глаз Города'
  },
  description:
    'Городской медиаоператор: 4 премиальных LED-экрана в ключевых точках Владикавказа. 500 000+ контактов с аудиторией ежедневно. Производство роликов и запуск кампании от 1 дня.',
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  generator: 'Next.js',
  keywords: [
    'наружная реклама Владикавказ',
    'LED-экраны Владикавказ',
    'DOOH реклама',
    'цифровая наружная реклама',
    'медиаоператор Владикавказ',
    'реклама на экранах СКФО',
    'Глаз Города',
    'медиаплан наружной рекламы',
    'видеоэкраны Владикавказ',
    'рекламные экраны',
    'OOH СКФО',
    'реклама на щитах Владикавказ'
  ],
  referrer: 'origin-when-cross-origin',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName,
    title: 'Глаз Города — визуальная инфраструктура Владикавказа',
    description:
      'Городской медиаоператор и владелец премиальных LED-экранов во Владикавказе. 500 000+ контактов в день, запуск кампании от 1 рабочего дня.',
    images: [
      {
        url: '/images/hero-exact1.png',
        width: 1920,
        height: 1280,
        alt: 'LED-экран «Глаз Города» на ТЦ Rage во Владикавказе'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Глаз Города — LED-экраны во Владикавказе',
    description: '4 LED-экрана в ключевых точках города. 500K+ контактов с аудиторией ежедневно.',
    images: ['/images/hero-exact1.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  formatDetection: { telephone: true, address: false, email: false },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png' }]
  },
  category: 'business'
};

function buildStructuredData() {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#org`,
    name: siteName,
    alternateName: 'Glaz Goroda',
    url: siteUrl,
    telephone: '+7-989-037-11-11',
    email: 'hello@glazgoroda.ru',
    description: 'Городской медиаоператор и владелец премиальных LED-экранов в ключевых точках Владикавказа.',
    image: `${siteUrl}/images/hero-exact1.png`,
    logo: `${siteUrl}/images/hero-exact1.png`,
    priceRange: '₽₽₽',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Владикавказ',
      addressRegion: 'Республика Северная Осетия — Алания',
      addressCountry: 'RU'
    },
    areaServed: [
      { '@type': 'City', name: 'Владикавказ' },
      { '@type': 'AdministrativeArea', name: 'Северо-Кавказский федеральный округ' }
    ],
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '20:00'
    }],
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: '+7-989-037-11-11',
      contactType: 'sales',
      areaServed: 'RU',
      availableLanguage: ['ru']
    }],
    sameAs: []
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Цифровая наружная реклама (DOOH)',
    provider: { '@id': `${siteUrl}#org` },
    areaServed: { '@type': 'City', name: 'Владикавказ' },
    description: 'Размещение видеорекламы на премиальных LED-экранах во Владикавказе. Производство роликов под ключ, медиапланирование, отчётность.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'RUB',
      lowPrice: '12000',
      highPrice: '300000',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/#lead`
    }
  };

  const screens = [
    { '@context': 'https://schema.org', '@type': 'Place', name: 'LED-экран «ТЦ Rage» — Глаз Города', address: { '@type': 'PostalAddress', streetAddress: 'Пересечение ул. Плиева / Ардонская', addressLocality: 'Владикавказ', addressCountry: 'RU' } },
    { '@context': 'https://schema.org', '@type': 'Place', name: 'LED-экран «ТЦ Забава» — Глаз Города', address: { '@type': 'PostalAddress', streetAddress: 'Проспект Доватора, 37А', addressLocality: 'Владикавказ', addressCountry: 'RU' } },
    { '@context': 'https://schema.org', '@type': 'Place', name: 'LED-экран «Рынок Алан» — Глаз Города', address: { '@type': 'PostalAddress', streetAddress: 'ул. Астана Кесаева, 15', addressLocality: 'Владикавказ', addressCountry: 'RU' } },
    { '@context': 'https://schema.org', '@type': 'Place', name: 'LED-экран «Владикавказская, 24» — Глаз Города', address: { '@type': 'PostalAddress', streetAddress: 'ул. Владикавказская, 24', addressLocality: 'Владикавказ', addressCountry: 'RU' } }
  ];

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Какой минимальный бюджет на размещение?', acceptedAnswer: { '@type': 'Answer', text: 'Минимальный пакет — неделя на одном экране с базовой частотой показов: от 12 000 ₽. Большинство клиентов заходит с месяца на 2–3 экранах — это даёт измеримый эффект.' } },
      { '@type': 'Question', name: 'Делаете ли вы продакшн ролика?', acceptedAnswer: { '@type': 'Answer', text: 'Да, под ключ: сценарий, съёмка или анимация, монтаж, цветокор и мастеринг под технические требования наших экранов. Сроки обычно 1–3 рабочих дня.' } },
      { '@type': 'Question', name: 'Можно ли таргетировать показы по времени суток?', acceptedAnswer: { '@type': 'Answer', text: 'Да. Стандартный пакет — равномерная ротация с 06:00 до 24:00. По запросу настраиваем фокусные слоты: утренний, вечерний или круглосуточный с повышенной частотой.' } },
      { '@type': 'Question', name: 'Что входит в отчётность?', acceptedAnswer: { '@type': 'Answer', text: 'Еженедельный отчёт со скриншотами эфиров, итоговое количество показов по каждому экрану, лог трансляций. По запросу — независимый медиа-аудит.' } },
      { '@type': 'Question', name: 'Как быстро ролик может выйти в эфир?', acceptedAnswer: { '@type': 'Answer', text: 'Если ролик готов и соответствует спецификации — выходит в день подписания договора. С полным циклом производства — от 1 до 3 рабочих дней.' } },
      { '@type': 'Question', name: 'Можно ли тестировать креативы с A/B?', acceptedAnswer: { '@type': 'Answer', text: 'Да. Делим период на два слота с разными версиями ролика, фиксируем показы и охват по каждой. По итогу даём отчёт и оставляем в эфире победителя.' } },
      { '@type': 'Question', name: 'Какие категории рекламы вы не размещаете?', acceptedAnswer: { '@type': 'Answer', text: 'Не работаем с категориями, ограниченными ФЗ «О рекламе»: алкоголь, табак, азартные игры без лицензии, БАДы без сертификации.' } },
      { '@type': 'Question', name: 'Работаете с агентствами?', acceptedAnswer: { '@type': 'Answer', text: 'Да. Стандартное агентское — 15%, по объёмам пересматриваем. Заключаем рамочный договор, выгружаем медиа-планы в AS-IS.' } },
      { '@type': 'Question', name: 'Можно ли посмотреть, как выглядит ролик на экране перед запуском?', acceptedAnswer: { '@type': 'Answer', text: 'Да, проводим тестовое включение: 30-секундный показ с записью на камеру, чтобы вы увидели контраст, читаемость, передачу цвета. Тест бесплатный.' } }
    ]
  };

  return [localBusiness, service, ...screens, faqPage];
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structured = buildStructuredData();
  return (
    <html lang="ru">
      <head>
        {/* Performance: преконнект к Google Fonts — TLS начинается заранее */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload hero — критичный для LCP. Браузер скачивает сразу, не дожидаясь CSS */}
        <link
          rel="preload"
          as="image"
          href="/images/hero-exact1.png"
          media="(min-width: 901px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/images/hero-exact2.png"
          media="(max-width: 900px)"
          fetchPriority="high"
        />
      </head>
      <body>
        {/* Skip-to-content для пользователей скрин-ридеров и клавиатурной навигации */}
        <a className="skip-link" href="#top">Перейти к основному содержимому</a>

        {children}

        {/* JSON-LD структурированные данные */}
        {structured.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        {/* Cookie consent + условный запуск Yandex Metrika.
            Metrika подключается только после opt-in согласия — соответствует 152-ФЗ. */}
        <CookieConsent />
      </body>
    </html>
  );
}
