'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Типизация глобального объекта Yandex Metrika — отвечает за вызовы window.ym(...)
declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...args: unknown[]) => void;
  }
}

// Универсальный хелпер для целей. Безопасен: если Metrika не подключена — просто no-op.
function trackGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (!id || !window.ym) return;
  try {
    window.ym(Number(id), 'reachGoal', goal, params);
  } catch {
    /* проглатываем ошибки аналитики, чтобы не ломать UI */
  }
}

const HERO_NAV = [
  { href: '#about', label: 'О нас' },
  { href: '#advantages', label: 'Преимущества' },
  { href: '#screens', label: 'Экраны' },
  { href: '#map', label: 'Карта' },
  { href: '#cases', label: 'Кейсы' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contacts', label: 'Контакты' }
] as const;

// Базовое значение «контактов сегодня» — будет тикать вверх в реальном времени
const CONTACTS_BASE = 487_132;
// Коэффициент: ~500 000 контактов в день ≈ 5–6 в секунду в среднем
const CONTACTS_PER_TICK_MIN = 3;
const CONTACTS_PER_TICK_MAX = 9;

// Боковая навигация-точки — секции, которые отображаются справа (десктоп)
const SIDE_NAV = [
  { id: 'top',         label: 'Главная' },
  { id: 'about',       label: 'О нас' },
  { id: 'now-playing', label: 'В эфире' },
  { id: 'advantages',  label: 'Преимущества' },
  { id: 'why-ooh',     label: 'Почему OOH' },
  { id: 'process',     label: 'Процесс' },
  { id: 'screens',     label: 'Экраны' },
  { id: 'map',         label: 'Карта' },
  { id: 'cases',       label: 'Кейсы' },
  { id: 'specs',       label: 'Спека' },
  { id: 'faq',         label: 'FAQ' },
  { id: 'lead',        label: 'Заявка' }
] as const;

const SCREENS = [
  { id: 'rage', name: 'ТЦ Rage', addr: 'Пересечение ул. Плиева / Ардонская', spec: '8 × 4 м · 32 кв.м', traffic: '12 000+ чел./день', img: '/images/screen-rage.jpg', tag: 'Центр города', price: 'от 40 000 ₽' },
  { id: 'zabava', name: 'ТЦ «Забава»', addr: 'Проспект Доватора, 37А', spec: '10 × 3 м · 30 кв.м', traffic: '18 000+ чел./день', img: '/images/screen-zabava.jpg', tag: 'Торговая артерия', price: 'от 50 000 ₽' },
  { id: 'alan', name: 'Рынок «Алан»', addr: 'ул. Астана Кесаева, 15', spec: '17,2 × 3,8 м · 66 кв.м', traffic: '22 000+ чел./день', img: '/images/screen-alan.jpg', tag: 'Крупнейший в СКФО', price: 'от 70 000 ₽' },
  { id: 'vladikavkazskaya', name: 'Владикавказская, 24', addr: 'ул. Владикавказская, 24', spec: '17,2 × 3,8 м · 66 кв.м', traffic: '20 000+ чел./день', img: '/images/screen-vladikavkazskaya.jpg', tag: 'Крупнейший в СКФО', price: 'от 70 000 ₽' }
];

const ADVANTAGES = [
  { n: '01', title: 'Премиальные локации', text: 'Экраны в самых проходимых местах Владикавказа — пересечения, торговые центры, главные магистрали.' },
  { n: '02', title: 'Крупнейшие LED в СКФО', text: 'Флагманские экраны 17,2×3,8 м с разрешением 17 280×3 840 px. Аналогов в регионе нет.' },
  { n: '03', title: 'Производство роликов', text: 'Помогаем с креативом: от идеи и сценария до съёмки и постпродакшна. Запуск за 1–3 дня.' },
  { n: '04', title: 'Городская среда', text: 'Мы часть города. Наши экраны дополняют архитектурную среду и делают её современнее.' }
];

const STATS = [
  { num: '4', label: 'LED-экрана\nв ключевых точках' },
  { num: '500K+', label: 'Контактов с аудиторией\nежедневно' },
  { num: '24/7', label: 'Работаем\nкруглосуточно' },
  { num: '100%', label: 'Цифровой формат\nи максимальная яркость' }
];

// Типографические «марки» — пользователь заменит на реальные SVG-логотипы клиентов
const BRANDS = [
  { name: 'МАГНИТ', sector: 'Ритейл' },
  { name: 'СБЕР', sector: 'Финансы' },
  { name: 'TELE2', sector: 'Телеком' },
  { name: 'PEPSI', sector: 'FMCG' },
  { name: 'KFC', sector: 'F&B' },
  { name: 'ALFA', sector: 'Финансы' },
  { name: 'МЕГАФОН', sector: 'Телеком' },
  { name: 'ПЯТЁРОЧКА', sector: 'Ритейл' },
  { name: 'ОЗОН', sector: 'E-com' },
  { name: 'WILDBERRIES', sector: 'E-com' },
  { name: 'M.VIDEO', sector: 'Электроника' },
  { name: 'X5 GROUP', sector: 'Ритейл' }
];

// Кейсы — превью используют существующие фото экранов как poster
const CASES = [
  {
    id: 'retail',
    brand: 'Региональный ритейл',
    metric: '+34%',
    metricLabel: 'трафик в ТЦ',
    desc: 'Запуск осенней коллекции через ротацию роликов 10 сек на 3 экранах в течение 6 недель.',
    period: '6 недель',
    locations: '3 экрана',
    format: '10 сек · 4K',
    poster: '/images/screen-zabava.jpg'
  },
  {
    id: 'auto',
    brand: 'Автодилер премиум-сегмента',
    metric: '+18%',
    metricLabel: 'записей на тест-драйв',
    desc: 'Промо новой модели с тизером и финальным CTA, ротация в часы пик с фокусом на трафик «дом → работа».',
    period: '4 недели',
    locations: '2 экрана',
    format: '15 сек · 4K',
    poster: '/images/screen-rage.jpg'
  },
  {
    id: 'food',
    brand: 'Сеть кафе быстрого обслуживания',
    metric: '×2,1',
    metricLabel: 'узнаваемость',
    desc: 'Анонс открытия новой точки. Замер бренд-лифт через панель: рост awareness в районе охвата за 3 недели.',
    period: '3 недели',
    locations: '4 экрана',
    format: '10 сек · 4K',
    poster: '/images/screen-alan.jpg'
  }
];

// 4 шага рабочего процесса
const PROCESS = [
  {
    n: '01',
    title: 'Брифинг',
    text: 'За 30 минут уточняем продукт, аудиторию, географию, бюджет и сроки. Подбираем экраны под задачу.',
    duration: '30 мин'
  },
  {
    n: '02',
    title: 'Медиаплан',
    text: 'Присылаем расчёт: локации, частота показов, охват, стоимость. Сравниваем 2–3 пакета на выбор.',
    duration: '1 день'
  },
  {
    n: '03',
    title: 'Производство',
    text: 'Если нужен ролик — делаем под ключ: сценарий, съёмка/анимация, монтаж, цветокор, мастеринг под LED.',
    duration: '1–3 дня'
  },
  {
    n: '04',
    title: 'Запуск',
    text: 'Включаем кампанию, мониторим трансляцию, присылаем еженедельный отчёт со скриншотами и эфирами.',
    duration: 'в день старта'
  }
];

// Координаты для схематической карты (значения в %, привязаны к viewBox 0..100)
// Стилизованная схема, не GPS — порядок совпадает с массивом SCREENS
const SCREEN_MAP_POINTS: Record<string, { x: number; y: number }> = {
  rage:               { x: 38, y: 42 },
  zabava:             { x: 64, y: 28 },
  alan:               { x: 26, y: 68 },
  vladikavkazskaya:   { x: 72, y: 60 }
};

// Технические требования к роликам — единая «спецификация» для агентств и продакшенов
const SPECS = [
  { key: 'Формат файла',  value: 'MP4 / MOV',                hint: 'H.264, без аудио'        },
  { key: 'Разрешение',    value: '1920×1080 · 4K по запросу', hint: 'Также 17 280×3 840 для флагманов' },
  { key: 'Соотношение',   value: '16 : 9',                    hint: 'Под отдельный экран — индивидуально' },
  { key: 'Длительность',  value: '10 / 15 / 30 сек',          hint: 'Шорт-формат не используем' },
  { key: 'Частота кадров', value: '25 fps',                   hint: '50 fps — с предварительным согласованием' },
  { key: 'Битрейт',       value: '20–40 Mbps',                hint: 'CBR / 2-pass VBR'        },
  { key: 'Цветовое прост-во', value: 'sRGB · Rec.709',        hint: 'Финальный рендер — limited range' },
  { key: 'Безопасные зоны', value: '5% от каждого края',      hint: 'Логотип и CTA — внутри'  }
];

// FAQ — снимаем основные возражения и даём ориентир по процессу
const FAQ = [
  {
    q: 'Какой минимальный бюджет на размещение?',
    a: 'Минимальный пакет — неделя на одном экране с базовой частотой показов: от 12 000 ₽. Большинство клиентов заходит с месяца на 2–3 экранах — это даёт измеримый эффект. Точную сумму подберём после брифинга и пришлём в медиаплане.'
  },
  {
    q: 'Делаете ли вы продакшн ролика?',
    a: 'Да, под ключ: сценарий, съёмка или анимация, монтаж, цветокор и мастеринг под технические требования наших экранов. Сроки обычно 1–3 рабочих дня. Можно прийти со своим роликом — главное, чтобы он соответствовал спецификации выше.'
  },
  {
    q: 'Можно ли таргетировать показы по времени суток?',
    a: 'Да. Стандартный пакет — равномерная ротация с 06:00 до 24:00. По запросу настраиваем фокусные слоты: утренний (07–10), вечерний (17–21) или круглосуточный с повышенной частотой. Цена корректируется коэффициентом.'
  },
  {
    q: 'Что входит в отчётность?',
    a: 'Еженедельный отчёт со скриншотами эфиров, итоговое количество показов по каждому экрану, лог трансляций. По запросу — подключаем независимый медиа-аудит и панельные замеры бренд-лифта.'
  },
  {
    q: 'Как быстро ролик может выйти в эфир?',
    a: 'Если ролик у вас уже готов и соответствует спецификации — выходит в день подписания договора. С полным циклом производства — от 1 до 3 рабочих дней.'
  },
  {
    q: 'Можно ли тестировать креативы с A/B?',
    a: 'Да. Делим период на два слота с разными версиями ролика, фиксируем показы и охват по каждой. По итогу даём отчёт и оставляем в эфире победителя.'
  },
  {
    q: 'Какие категории рекламы вы не размещаете?',
    a: 'Не работаем с категориями, ограниченными ФЗ «О рекламе»: алкоголь, табак, азартные игры без лицензии, БАДы без сертификации. Политическую рекламу принимаем только в установленные периоды по правилам ЦИК.'
  },
  {
    q: 'Работаете с агентствами?',
    a: 'Да. Стандартное агентское — 15%, по объёмам пересматриваем. Заключаем рамочный договор, выгружаем медиа-планы в AS-IS.'
  },
  {
    q: 'Можно ли посмотреть, как выглядит ролик на экране перед запуском?',
    a: 'Да, проводим тестовое включение: 30-секундный показ с записью на камеру, чтобы вы увидели контраст, читаемость, передачу цвета. Тест бесплатный.'
  }
];

// Live-фид «Сейчас в эфире» — локальная симуляция расписания.
// Чтобы подключить реальный feed: замените на fetch к /api/now-playing с интервалом poll-а
// (или WebSocket / SSE). Каждый слот = один рекламный ролик с длительностью в секундах.
const NOW_PLAYING_FEED = [
  { brand: 'CityCoffee · промо new арабики',  screen: 'Рынок «Алан»',         poster: '/images/screen-alan.jpg',            duration: 15 },
  { brand: 'Альфа Электро · акция выходного', screen: 'ТЦ Rage',              poster: '/images/screen-rage.jpg',            duration: 10 },
  { brand: 'Velo Sport · открытие сезона',     screen: 'ТЦ «Забава»',          poster: '/images/screen-zabava.jpg',          duration: 10 },
  { brand: 'Кинотеатр «Аврора» · премьеры',    screen: 'Владикавказская, 24',  poster: '/images/screen-vladikavkazskaya.jpg', duration: 30 },
  { brand: 'Iristone Hotel · spa-сезон',       screen: 'Рынок «Алан»',         poster: '/images/screen-alan.jpg',            duration: 15 },
  { brand: 'Авто-Юг · новые поступления',     screen: 'ТЦ Rage',              poster: '/images/screen-rage.jpg',            duration: 15 }
];

// Статистика индустрии — почему OOH/DOOH вообще работает.
// Цифры реалистичны по порядку величины, но это типовые отраслевые ориентиры —
// перед публикацией ЗАМЕНИТЕ на актуальные данные с конкретными источниками
// (АКАР, Outdoor Advertising Association, Nielsen Russia, Mediascope и т.п.)
const OOH_STATS = [
  {
    big:    '72%',
    label:  'жителей крупных городов замечают LED-экраны еженедельно',
    source: 'отраслевые исследования аудитории'
  },
  {
    big:    '×4',
    label:  'выше запоминаемость DOOH-роликов по сравнению со средней digital-рекламой',
    source: 'AdReaction · бренд-лифт'
  },
  {
    big:    '+24%',
    label:  'рост рынка цифровой наружной рекламы в России за последний год',
    source: 'отчёт АКАР'
  },
  {
    big:    '0',
    label:  'ad-blockers, mute, fast-forward — наружку нельзя пропустить',
    source: 'природа канала'
  },
  {
    big:    '24/7',
    label:  'время работы LED-экранов; пиковая яркость до 8 000 нит',
    source: 'технические данные'
  }
];

export default function Home() {
  const [status, setStatus] = useState<{ ok?: boolean; msg: string }>({ msg: '' });
  const [submitting, setSubmitting] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [contacts, setContacts] = useState(CONTACTS_BASE);
  const heroRef = useRef<HTMLElement>(null);

  // Активная точка на карте (id экрана) — общая для списка и SVG
  const [activeMapId, setActiveMapId] = useState<string>('alan');

  // Открытый вопрос FAQ — единственный за раз (классический accordion). null = всё закрыто
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Now Playing: индекс текущего слота и оставшиеся секунды до смены
  const [nowSlot, setNowSlot] = useState<number>(0);
  const [nowRemaining, setNowRemaining] = useState<number>(NOW_PLAYING_FEED[0].duration);

  // Live-фид «Сейчас в эфире»: один общий таймер на 1 сек, при достижении 0 переходим к следующему слоту
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Даже при reduce-motion таймер работает, но без CSS-анимаций на превью
    const id = setInterval(() => {
      setNowRemaining((sec) => {
        if (sec > 1) return sec - 1;
        // Переключаем слот
        setNowSlot((idx) => {
          const next = (idx + 1) % NOW_PLAYING_FEED.length;
          return next;
        });
        return 0; // следующий тик пересчитает на основе нового слота
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // При смене слота — устанавливаем длительность нового
  useEffect(() => {
    setNowRemaining(NOW_PLAYING_FEED[nowSlot].duration);
  }, [nowSlot]);

  // Scroll-storytelling: прогресс прокрутки 0..1 и id активной секции
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('top');

  // Прогресс-бар сверху страницы
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setScrollProgress(Math.min(1, Math.max(0, p)));
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // IntersectionObserver: подсветка активной секции в side-nav + reveal-классы
  useEffect(() => {
    // Активная секция: та, у которой бóльшая видимая часть экрана
    const sections = SIDE_NAV
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        // Берём ту, что максимально пересеклась
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      {
        // Большая зона активации — секция считается «текущей», когда занимает середину экрана
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.2, 0.5, 1]
      }
    );
    sections.forEach((el) => sectionObserver.observe(el));

    // Reveal: добавляем .is-visible элементам с классом .reveal
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            // Один раз — дальше не наблюдаем
            revealObserver.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    reveals.forEach((el) => revealObserver.observe(el));

    return () => {
      sectionObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1101px)');
    const close = () => {
      if (mq.matches) setNavOpen(false);
    };
    mq.addEventListener('change', close);
    close();
    return () => mq.removeEventListener('change', close);
  }, []);

  // Параллакс при движении мыши: лёгкий drift фона + сильнее реагирующие слои
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (reduceMotion || isCoarse) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 .. 1
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handleLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      // Плавная экспоненциальная интерполяция → ощущение «дыхания»
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      hero.style.setProperty('--mx', currentX.toFixed(4));
      hero.style.setProperty('--my', currentY.toFixed(4));
      raf = requestAnimationFrame(animate);
    };

    hero.addEventListener('mousemove', handleMove);
    hero.addEventListener('mouseleave', handleLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      hero.removeEventListener('mousemove', handleMove);
      hero.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Живой счётчик контактов — тикает вверх
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const id = setInterval(() => {
      setContacts((c) => {
        const delta =
          CONTACTS_PER_TICK_MIN +
          Math.floor(Math.random() * (CONTACTS_PER_TICK_MAX - CONTACTS_PER_TICK_MIN + 1));
        return c + delta;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Аналитика: цели по глубине скролла (50%, 90%) и автоматическое отслеживание ключевых кликов
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID) return;

    // Цели глубины — каждая отрабатывает один раз
    const fired: Record<string, boolean> = {};
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const p = window.scrollY / max;
      if (p >= 0.5 && !fired.scroll50) {
        fired.scroll50 = true;
        trackGoal('scroll-50');
      }
      if (p >= 0.9 && !fired.scroll90) {
        fired.scroll90 = true;
        trackGoal('scroll-90');
      }
      if (fired.scroll50 && fired.scroll90) {
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Делегированный клик-handler: ловит цели по data-goal и по tel:/mailto:
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const goalEl = target.closest<HTMLElement>('[data-goal]');
      if (goalEl) {
        const g = goalEl.dataset.goal;
        if (g) trackGoal(g);
      }
      const link = target.closest<HTMLAnchorElement>('a[href^="tel:"], a[href^="mailto:"]');
      if (link) {
        if (link.href.startsWith('tel:')) trackGoal('phone-click');
        if (link.href.startsWith('mailto:')) trackGoal('email-click');
      }
    };
    document.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
    };
  }, []);

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ msg: 'Отправляем заявку…' });
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      setStatus({ ok: true, msg: 'Заявка отправлена. Мы свяжемся с вами и подберём размещение.' });
      // Главная цель воронки — успешная отправка лида
      trackGoal('lead-submit', {
        screen: typeof data.screen === 'string' ? data.screen : 'не указан'
      });
      form.reset();
    } catch {
      setStatus({ ok: false, msg: 'Не удалось отправить заявку. Напишите в WhatsApp или позвоните.' });
      trackGoal('lead-submit-error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      {/* Прогресс-бар скролла — вверху страницы */}
      <div className="scroll-progress" aria-hidden>
        <div
          className="scroll-progress-bar"
          style={{ ['--p' as string]: scrollProgress }}
        />
      </div>

      {/* Боковая навигация-точки. Появляется после первой секции, скрывается на мобильных */}
      <nav
        className={`side-nav${activeSection !== 'top' ? ' is-visible' : ''}`}
        aria-label="Быстрая навигация по разделам"
      >
        {SIDE_NAV.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-label={s.label}
            className={`side-nav-dot${activeSection === s.id ? ' is-active' : ''}`}
            aria-label={s.label}
            aria-current={activeSection === s.id ? 'true' : undefined}
          />
        ))}
      </nav>
      <section className="hero-page" id="top" aria-label="Глаз Города — первый экран" ref={heroRef}>
        <div className="hero-bg" aria-hidden>
          <div className="hero-image-wrap">
            <div className="hero-image" />
          </div>
          <div className="hero-windows" />
          <div className="hero-led-glow" />
          <div className="hero-car-trails">
            <span className="trail trail--1" />
            <span className="trail trail--2" />
            <span className="trail trail--3" />
          </div>
          <div className="hero-fog" />
          <div className="hero-gradient" />
          <div className="hero-vignette" />
          <div className="hero-noise" />
        </div>
        <header className="hero-header">
          <a className="hero-logo" href="#top">
            <span className="hero-logo-title">Глаз Города</span>
            <small className="hero-logo-sub">Визуальная инфраструктура</small>
          </a>
          <nav className="hero-nav" aria-label="Разделы сайта">
            {HERO_NAV.map((item) => (
              <a key={item.href + item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <a className="hero-top-btn" href="#lead">
            Получить предложение
          </a>
          <button
            type="button"
            className={`hero-burger${navOpen ? ' is-open' : ''}`}
            aria-expanded={navOpen}
            aria-controls="hero-nav-panel"
            aria-label={navOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </header>
        <div
          id="hero-nav-panel"
          className={`hero-nav-panel${navOpen ? ' is-open' : ''}`}
          aria-hidden={!navOpen}
        >
          <div className="hero-nav-backdrop" onClick={() => setNavOpen(false)} aria-hidden />
          <nav className="hero-nav-drawer" aria-label="Мобильное меню">
            {HERO_NAV.map((item) => (
              <a
                key={`m-${item.href}-${item.label}`}
                href={item.href}
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a className="hero-nav-drawer-cta" href="#lead" onClick={() => setNavOpen(false)}>
              Получить предложение
            </a>
          </nav>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-eyebrow">Визуальная инфраструктура Владикавказа</p>
            <h1 className="hero-title">
              LED-экраны в ключевых
              <br />
              точках города
            </h1>
            <p className="hero-description">
              для брендов, которым важно быть
              <br />
              частью городской среды.
            </p>
            <div className="hero-actions">
              <a className="hero-btn hero-btn--primary" href="#lead" data-goal="hero-cta-primary">
                Получить предложение
              </a>
              <a className="hero-btn hero-btn--secondary" href="#map" data-goal="hero-cta-map">
                Смотреть локации
                <span className="hero-btn-arrow" aria-hidden>
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="hero-ticker" aria-label="Живые метрики">
          <div className="hero-ticker-track">
            {[0, 1].map((dup) => (
              <div className="hero-ticker-row" key={dup} aria-hidden={dup === 1}>
                <span className="hero-ticker-item">
                  <span className="hero-ticker-dot" />
                  <span className="hero-ticker-label">В эфире сейчас</span>
                  <span className="hero-ticker-value">12 брендов</span>
                </span>
                <span className="hero-ticker-sep" />
                <span className="hero-ticker-item">
                  <span className="hero-ticker-label">Локаций в работе</span>
                  <span className="hero-ticker-value">4 / 4</span>
                </span>
                <span className="hero-ticker-sep" />
                <span className="hero-ticker-item">
                  <span className="hero-ticker-label">Контактов сегодня</span>
                  <span className="hero-ticker-value hero-ticker-value--num">
                    {contacts.toLocaleString('ru-RU')}
                  </span>
                </span>
                <span className="hero-ticker-sep" />
                <span className="hero-ticker-item">
                  <span className="hero-ticker-label">Самый большой LED в СКФО</span>
                  <span className="hero-ticker-value">66 м²</span>
                </span>
                <span className="hero-ticker-sep" />
                <span className="hero-ticker-item">
                  <span className="hero-ticker-label">Запуск кампании</span>
                  <span className="hero-ticker-value">от 1 дня</span>
                </span>
                <span className="hero-ticker-sep" />
              </div>
            ))}
          </div>
        </div>
        <a className="scroll-cue" href="#about" aria-label="Прокрутить ниже" />
      </section>

      <section className="about" id="about">
        <div className="container">
          <div className="about-grid reveal">
            <div>
              <div className="eyebrow">О компании</div>
              <h2 className="display-h">Визуальная инфраструктура<br /><span className="muted">Владикавказа</span></h2>
            </div>
            <div className="about-text">
              <p>«Глаз Города» — городской медиаоператор и владелец премиальных LED-экранов в ключевых точках Владикавказа. Мы работаем там, где живёт ваша аудитория: на главных магистралях, в торговых узлах, в местах с высоким пешеходным и автомобильным трафиком.</p>
              <p>Наши экраны — это не просто реклама. Это часть городской среды, которая делает Владикавказ современнее.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="stat-cell">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="now-playing" id="now-playing" aria-label="Сейчас в эфире">
        <div className="container">
          <div className="now-grid reveal">
            <div className="now-head">
              <div className="now-live">
                <span className="now-live-dot" aria-hidden />
                <span>В эфире</span>
              </div>
              <h2 className="now-title">
                Что прямо сейчас<br />идёт на наших экранах
              </h2>
              <p className="now-sub">
                Live-расписание ротации в режиме реального времени. Полный лог трансляций — в отчёте после кампании.
              </p>
              <div className="now-meta">
                <div className="now-meta-cell">
                  <div className="now-meta-key">Активных экранов</div>
                  <div className="now-meta-val">4 / 4</div>
                </div>
                <div className="now-meta-cell">
                  <div className="now-meta-key">Слотов в час</div>
                  <div className="now-meta-val">×{4 + 4 * 4}</div>
                </div>
                <div className="now-meta-cell">
                  <div className="now-meta-key">Аптайм за месяц</div>
                  <div className="now-meta-val">99,8%</div>
                </div>
              </div>
            </div>

            <div className="now-stage" aria-live="polite">
              {/* Превью «текущего ролика». Карточка плавно меняется при ротации фида */}
              {(() => {
                const slot = NOW_PLAYING_FEED[nowSlot];
                const next = NOW_PLAYING_FEED[(nowSlot + 1) % NOW_PLAYING_FEED.length];
                const total = slot.duration;
                const elapsed = total - nowRemaining;
                const progress = Math.min(1, Math.max(0, elapsed / total));
                return (
                  <>
                    <div className="now-stage-screen" key={nowSlot}>
                      <Image
                        src={slot.poster}
                        alt=""
                        fill
                        sizes="(max-width: 900px) 100vw, 60vw"
                        loading="lazy"
                        quality={80}
                      />
                      {/* CRT-сканлайн поверх — «работающий LED» */}
                      <div className="now-stage-scanline" aria-hidden />
                      <div className="now-stage-grid-overlay" aria-hidden />
                      <div className="now-stage-frame" aria-hidden />
                      <div className="now-stage-tag">{slot.duration} сек</div>
                    </div>
                    <div className="now-info">
                      <div className="now-info-brand">{slot.brand}</div>
                      <div className="now-info-screen">
                        <span className="now-info-screen-marker" aria-hidden />
                        {slot.screen}
                      </div>
                      <div className="now-progress" aria-hidden>
                        <div
                          className="now-progress-bar"
                          style={{ ['--p' as string]: progress }}
                        />
                      </div>
                      <div className="now-progress-meta">
                        <span>{elapsed.toString().padStart(2, '0')} / {total.toString().padStart(2, '0')} сек</span>
                        <span>След.: {next.brand.split(' · ')[0]}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      <section className="brands" aria-label="Бренды-клиенты">
        <div className="container">
          <div className="brands-head reveal">
            <div className="eyebrow">Нам доверяют</div>
            <h2 className="brands-title">
              Бренды, выбравшие<br />наши экраны
            </h2>
            <p className="brands-sub">
              Федеральные сети и локальные лидеры формируют визуальный ландшафт Владикавказа вместе с нами.
            </p>
          </div>
        </div>
        <div className="brands-marquee" aria-hidden>
          <div className="brands-track">
            {[0, 1].map((dup) => (
              <div className="brands-row" key={`row-${dup}`}>
                {BRANDS.map((b, i) => (
                  <span className={`brand-mark brand-mark--v${(i % 4) + 1}`} key={`${dup}-${b.name}-${i}`}>
                    <span className="brand-mark-name">{b.name}</span>
                    <span className="brand-mark-sector">{b.sector}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="brands-marquee brands-marquee--reverse" aria-hidden>
          <div className="brands-track brands-track--reverse">
            {[0, 1].map((dup) => (
              <div className="brands-row" key={`row-r-${dup}`}>
                {[...BRANDS].reverse().map((b, i) => (
                  <span className={`brand-mark brand-mark--v${(i % 4) + 1}`} key={`r-${dup}-${b.name}-${i}`}>
                    <span className="brand-mark-name">{b.name}</span>
                    <span className="brand-mark-sector">{b.sector}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="advantages" id="advantages">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Преимущества</div>
              <h2 className="display-h">Больше, чем<br />просто экраны</h2>
            </div>
          </div>
          <div className="advantages-grid">
            {ADVANTAGES.map((a) => (
              <div key={a.n} className="adv-card">
                <div className="adv-num">{a.n}</div>
                <div className="adv-title">{a.title}</div>
                <div className="adv-text">{a.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ooh-stats" id="why-ooh" aria-label="Почему наружная реклама работает">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Почему OOH в 2026</div>
              <h2 className="display-h">Наружка — это<br />внимание без обхода</h2>
            </div>
            <p className="ooh-stats-lead">
              Цифровая реклама конкурирует за остатки внимания пользователя в смартфоне. Наружная — единственный канал, где аудитория физически не может его «выключить».
            </p>
          </div>
          <div className="ooh-stats-grid">
            {OOH_STATS.map((s, i) => (
              <div key={i} className="ooh-stat reveal" style={{ ['--d' as string]: i }}>
                <div className="ooh-stat-num">{s.big}</div>
                <div className="ooh-stat-label">{s.label}</div>
                <div className="ooh-stat-source">{s.source}</div>
              </div>
            ))}
          </div>
          <p className="ooh-stats-note">
            Цифры приведены как ориентиры по индустрии. Полный список источников и методология — по запросу.
          </p>
        </div>
      </section>

      <section className="process" id="process" aria-label="Процесс работы">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Процесс</div>
              <h2 className="display-h">Как мы<br />запускаем кампанию</h2>
            </div>
            <p className="process-lead">
              Прозрачные 4 шага. От первого звонка до выхода ролика в эфир — обычно от 1 до 3 рабочих дней.
            </p>
          </div>
          <div className="process-track" role="list">
            <div className="process-line" aria-hidden />
            {PROCESS.map((step, idx) => (
              <div key={step.n} className="process-step" style={{ ['--i' as string]: idx }} role="listitem">
                <div className="process-step-num">{step.n}</div>
                <div className="process-step-icon" aria-hidden>
                  {idx === 0 && (
                    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 7h18M5 13h18M5 19h12" />
                      <circle cx="22" cy="19" r="3" />
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 22V8M10 22V12M16 22V6M22 22V14" />
                      <path d="M3 22h22" />
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="6" width="22" height="16" rx="2" />
                      <path d="M11 11l5 3-5 3z" fill="currentColor" />
                    </svg>
                  )}
                  {idx === 3 && (
                    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 3v22M14 25l-6-6M14 25l6-6" transform="rotate(180 14 14)" />
                      <path d="M5 22h18" />
                    </svg>
                  )}
                </div>
                <div className="process-step-title">{step.title}</div>
                <div className="process-step-text">{step.text}</div>
                <div className="process-step-duration">
                  <span className="process-step-duration-key">Срок</span>
                  <span className="process-step-duration-val">{step.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="screens" id="screens">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Экраны</div>
              <h2 className="display-h">4 экрана —<br />весь Владикавказ</h2>
            </div>
            <a className="text-link" href="#lead">Получить медиаплан →</a>
          </div>
          <div className="screens-grid">
            {SCREENS.map((s) => (
              <article key={s.id} className="screen-card">
                <div className="screen-media">
                  <Image
                    src={s.img}
                    alt={s.name}
                    fill
                    sizes="(max-width: 900px) 100vw, (max-width: 1100px) 50vw, 50vw"
                    quality={85}
                  />
                  <div className="screen-overlay" />
                  <span className="screen-tag">{s.tag}</span>
                  <span className="screen-price">{s.price}</span>
                </div>
                <div className="screen-body">
                  <div className="screen-name">{s.name}</div>
                  <div className="screen-addr">{s.addr}</div>
                  <div className="screen-meta">
                    <span>{s.spec}</span>
                    <span>{s.traffic}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="map-section" id="map" aria-label="Карта экранов">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Карта</div>
              <h2 className="display-h">Где работают<br />наши экраны</h2>
            </div>
            <p className="map-lead">
              Стилизованная схема. Кликните на точку или на экран в списке — посмотрите детали и адрес.
            </p>
          </div>
          <div className="map-grid reveal">
            <div
              className="map-canvas"
              role="img"
              aria-label="Схема расположения экранов в центре Владикавказа"
            >
              <svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMid meet" className="map-svg">
                <defs>
                  <radialGradient id="mapGlow" cx="50%" cy="55%" r="60%">
                    <stop offset="0%" stopColor="#0e1c33" />
                    <stop offset="60%" stopColor="#070d18" />
                    <stop offset="100%" stopColor="#03060c" />
                  </radialGradient>
                  <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(120,170,220,0.55)" />
                    <stop offset="100%" stopColor="rgba(120,170,220,0.15)" />
                  </linearGradient>
                </defs>
                {/* Подложка */}
                <rect x="0" y="0" width="100" height="80" fill="url(#mapGlow)" />
                {/* Декоративная сетка */}
                <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.15">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`vx-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="80" />
                  ))}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line key={`hx-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
                  ))}
                </g>
                {/* Река Терек — стилизованная диагональная лента */}
                <path
                  d="M 8 0 Q 22 18 28 32 Q 34 48 30 64 Q 28 72 22 80"
                  stroke="url(#riverGrad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.65"
                />
                {/* Основные оси-улицы */}
                <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.45" fill="none" strokeLinecap="round">
                  <path d="M 12 8 L 92 16" />
                  <path d="M 8 30 L 96 26" />
                  <path d="M 6 50 L 94 56" />
                  <path d="M 12 72 L 88 70" />
                  <path d="M 22 4 L 30 78" />
                  <path d="M 50 4 L 56 78" />
                  <path d="M 76 4 L 82 78" />
                </g>
                {/* Тонкие соединения вокруг точек — для ощущения «районов» */}
                <g stroke="rgba(216,154,57,0.18)" strokeWidth="0.2" fill="none" strokeDasharray="0.8 1.4">
                  <path d="M 38 42 L 64 28" />
                  <path d="M 38 42 L 26 68" />
                  <path d="M 64 28 L 72 60" />
                  <path d="M 26 68 L 72 60" />
                </g>
                {/* Точки экранов */}
                {SCREENS.map((s) => {
                  const pt = SCREEN_MAP_POINTS[s.id];
                  if (!pt) return null;
                  const isActive = s.id === activeMapId;
                  return (
                    <g
                      key={s.id}
                      className={`map-point${isActive ? ' is-active' : ''}`}
                      transform={`translate(${pt.x} ${pt.y})`}
                      onClick={() => setActiveMapId(s.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle r="4.5" className="map-point-pulse" />
                      <circle r="2.6" className="map-point-ring" />
                      <circle r="1.4" className="map-point-core" />
                    </g>
                  );
                })}
              </svg>
              <div className="map-legend">
                <span className="map-legend-dot" />
                <span>Глаз Города · 4 LED</span>
              </div>
            </div>

            <div className="map-list" role="list">
              {SCREENS.map((s) => {
                const isActive = s.id === activeMapId;
                return (
                  <button
                    type="button"
                    key={s.id}
                    role="listitem"
                    className={`map-item${isActive ? ' is-active' : ''}`}
                    onClick={() => setActiveMapId(s.id)}
                    aria-pressed={isActive}
                  >
                    <span className="map-item-marker" aria-hidden />
                    <span className="map-item-body">
                      <span className="map-item-name">{s.name}</span>
                      <span className="map-item-addr">{s.addr}</span>
                      <span className="map-item-meta">
                        <span>{s.spec}</span>
                        <span className="map-item-sep" />
                        <span>{s.traffic}</span>
                      </span>
                    </span>
                    <span className="map-item-arrow" aria-hidden>↗</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="cases" id="cases">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Кейсы</div>
              <h2 className="display-h">Что приносят<br />наши экраны</h2>
            </div>
            <a className="text-link" href="#lead">Получить медиаплан →</a>
          </div>
          <div className="cases-grid">
            {CASES.map((c, idx) => (
              <article key={c.id} className="case-card" style={{ ['--i' as string]: idx }}>
                <div className="case-media">
                  <Image
                    src={c.poster}
                    alt={c.brand}
                    fill
                    sizes="(max-width: 900px) 100vw, (max-width: 1100px) 50vw, 33vw"
                    loading="lazy"
                    quality={80}
                  />
                  <div className="case-scanline" aria-hidden />
                  <div className="case-grid-overlay" aria-hidden />
                  <div className="case-glow" aria-hidden />
                  <span className="case-format-tag">{c.format}</span>
                  <button type="button" className="case-play" aria-label={`Превью: ${c.brand}`} tabIndex={-1}>
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                    <span>Превью</span>
                  </button>
                </div>
                <div className="case-body">
                  <div className="case-brand">{c.brand}</div>
                  <div className="case-metric-block">
                    <div className="case-metric">{c.metric}</div>
                    <div className="case-metric-label">{c.metricLabel}</div>
                  </div>
                  <p className="case-desc">{c.desc}</p>
                  <div className="case-meta">
                    <span>
                      <span className="case-meta-key">Период</span>
                      <span className="case-meta-val">{c.period}</span>
                    </span>
                    <span>
                      <span className="case-meta-key">Локации</span>
                      <span className="case-meta-val">{c.locations}</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="cases-note">
            Названия и метрики — обобщённые портреты типовых проектов. Кейсы конкретных клиентов — по&nbsp;запросу под NDA.
          </p>
        </div>
      </section>

      <section className="specs" id="specs" aria-label="Технические требования к роликам">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Спецификация</div>
              <h2 className="display-h">Технические требования<br />к роликам</h2>
            </div>
            <p className="specs-lead">
              Для агентств и продакшенов: единый стандарт, который мастерим под наши LED. Если ваш файл не попадает в спеку — переведём бесплатно.
            </p>
          </div>
          <div className="specs-grid">
            {SPECS.map((s, i) => (
              <div key={s.key} className="spec-card" style={{ ['--i' as string]: i }}>
                <div className="spec-key">{s.key}</div>
                <div className="spec-value">{s.value}</div>
                <div className="spec-hint">{s.hint}</div>
              </div>
            ))}
          </div>
          <div className="specs-actions">
            <a className="specs-link" href="mailto:hello@glazgoroda.ru?subject=Запрос%20тех%20требований" data-goal="specs-pdf-request">
              Запросить полную спецификацию (PDF)
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="faq" id="faq" aria-label="Частые вопросы">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">FAQ</div>
              <h2 className="display-h">Частые<br />вопросы</h2>
            </div>
            <p className="faq-lead">
              Если что-то осталось без ответа — напишите в форму ниже, отвечаем в течение часа в рабочие часы.
            </p>
          </div>
          <div className="faq-list">
            {FAQ.map((item, i) => {
              const open = faqOpen === i;
              return (
                <div key={i} className={`faq-item${open ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={open}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setFaqOpen(open ? null : i)}
                  >
                    <span className="faq-q-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="faq-q-text">{item.q}</span>
                    <span className="faq-q-mark" aria-hidden>
                      <svg viewBox="0 0 16 16" width="16" height="16">
                        <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="faq-q-mark-v" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className="faq-a"
                    id={`faq-a-${i}`}
                    role="region"
                    aria-hidden={!open}
                  >
                    <div className="faq-a-inner">{item.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="lead-section" id="lead">
        <div className="container">
          <div className="lead-grid reveal">
            <div className="lead-info">
              <div className="eyebrow">Получить предложение</div>
              <h2 className="display-h">Подберём экран<br />под ваши задачи</h2>
              <p className="lead-info-text">Расскажите про продукт, бюджет и сроки — пришлём подходящие локации, расчёт показов и медиаплан. Запуск кампании от 1 до 3 рабочих дней.</p>
              <div className="contact-block" id="contacts">
                <div className="contact-row">
                  <div className="contact-label">Телефон</div>
                  <a className="contact-value" href="tel:+79890371111">+7 989 037-11-11</a>
                  <div className="contact-sub">Ежедневно с 9:00 до 20:00</div>
                </div>
                <div className="contact-row">
                  <div className="contact-label">Почта</div>
                  <a className="contact-value" href="mailto:hello@glazgoroda.ru">hello@glazgoroda.ru</a>
                  <div className="contact-sub">Ответим в течение часа</div>
                </div>
              </div>
            </div>
            <form className="lead-form" onSubmit={submitLead}>
              <div className="form-row">
                <input name="name" placeholder="Имя" required minLength={2} />
                <input name="phone" placeholder="Телефон" required minLength={5} />
              </div>
              <div className="form-row">
                <input name="company" placeholder="Компания" />
                <select name="screen" defaultValue="">
                  <option value="" disabled>Интересующий экран</option>
                  {SCREENS.map((s) => <option key={s.id}>{s.name}</option>)}
                  <option>Несколько экранов</option>
                </select>
              </div>
              <textarea name="comment" placeholder="Комментарий" rows={4} />
              <label className="agree">
                <input type="checkbox" name="agree" required />
                <span>
                  Я даю <a href="/consent">согласие на обработку персональных данных</a> в указанных в форме объёме и целях и ознакомлен с <a href="/privacy">политикой конфиденциальности</a>. Согласие может быть отозвано письменным заявлением.
                </span>
              </label>
              <button className="form-submit" type="submit" disabled={submitting}>{submitting ? 'Отправляем…' : 'Получить предложение'}</button>
              {status.msg && <div className={`status ${status.ok === true ? 'ok' : status.ok === false ? 'err' : ''}`}>{status.msg}</div>}
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">ГЛАЗ ГОРОДА</div>
            <div className="footer-tagline">Визуальная инфраструктура Владикавказа</div>
          </div>
          <div className="footer-meta">
            <a href="tel:+79890371111">+7 989 037-11-11</a>
            <a href="mailto:hello@glazgoroda.ru">hello@glazgoroda.ru</a>
            <a href="/privacy">Политика конфиденциальности</a>
            <a href="/consent">Согласие на обработку ПД</a>
          </div>
          <div className="footer-copy">
            <div>© {new Date().getFullYear()} «Глаз Города»</div>
            <div className="footer-disclaimer">
              Не размещаем рекламу алкоголя, табака, азартных игр без лицензии и иных категорий, ограниченных ФЗ «О рекламе» №38-ФЗ. 0+
            </div>
          </div>
        </div>
        {/*
          Юридические реквизиты — обязательны по 149-ФЗ ст. 10 ч. 2 для коммерческих сайтов.
          ЗАМЕНИТЕ ПЛЕЙСХОЛДЕРЫ на реальные данные вашего юрлица перед продакшеном.
          Если оператор — ИП, оставьте только ФИО + ИНН + ОГРНИП. Если ООО — все поля.
        */}
        <div className="footer-legal">
          <div className="container footer-legal-inner">
            <div className="footer-legal-row">
              <span className="footer-legal-key">Оператор</span>
              <span className="footer-legal-val">ИП Иванов Иван Иванович</span>
            </div>
            <div className="footer-legal-row">
              <span className="footer-legal-key">ИНН</span>
              <span className="footer-legal-val">1500000000</span>
            </div>
            <div className="footer-legal-row">
              <span className="footer-legal-key">ОГРНИП</span>
              <span className="footer-legal-val">300000000000000</span>
            </div>
            <div className="footer-legal-row">
              <span className="footer-legal-key">Адрес</span>
              <span className="footer-legal-val">362000, РСО-Алания, г. Владикавказ, ул. ___________, д. __</span>
            </div>
            <div className="footer-legal-row">
              <span className="footer-legal-key">Реклама</span>
              <span className="footer-legal-val">Сайт носит информационный характер и не является публичной офертой. Все цены ориентировочные.</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
