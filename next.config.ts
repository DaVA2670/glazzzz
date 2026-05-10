import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Оптимизация изображений: Next.js на лету конвертирует исходные PNG/JPG в AVIF и WebP,
  // отдаёт правильный формат под Accept-заголовок браузера и нужный размер из srcSet.
  // Это даёт −60..80% веса картинок и значимый рост Lighthouse Performance.
  images: {
    formats: ['image/avif', 'image/webp'],
    // Размеры под наши контейнеры — Next.js сгенерирует srcset под эти ширины.
    // Покрывает мобильник (640) → планшет (1080) → десктоп до 4K.
    deviceSizes: [640, 750, 828, 1080, 1200, 1536, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 31 день — кеш на CDN-уровне. Картинки иммутабельные, бюджета хватит.
    minimumCacheTTL: 2_678_400
  },

  // Удаляем X-Powered-By в проде — снимает лишний вектор fingerprinting.
  poweredByHeader: false,

  // Реактивная компрессия gzip/brotli включена по умолчанию в Next.js, но явное лучше неявного.
  compress: true,

  // Trailing slash — выключен, как было. Чтобы canonical и sitemap не расходились.
  trailingSlash: false
};

export default nextConfig;
