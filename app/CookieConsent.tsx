'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const STORAGE_KEY = 'cookie-consent-v1';
const VALUES = { ACCEPTED: 'accepted', REJECTED: 'rejected' } as const;

const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

/**
 * Cookie consent + условный запуск Yandex Metrika.
 *
 * Почему это нужно:
 *   • 152-ФЗ «О персональных данных»: cookies, анализирующие поведение пользователя
 *     (Webvisor, clickmap), относятся к ПД. Их сбор требует предварительного согласия.
 *   • Постановление Правительства РФ № 1119: оператор обязан получить активное
 *     согласие до начала обработки.
 *   • С точки зрения UX: cookie-баннер также сигнализирует пользователю, что
 *     сайт уважает его приватность — это поднимает доверие.
 *
 * Логика:
 *   • При первом посещении показываем баннер.
 *   • Пользователь выбирает «Принять» или «Отказаться».
 *   • Решение сохраняется в localStorage. Metrika подключается ТОЛЬКО при «Принять».
 *   • Решение можно изменить через ссылку в политике конфиденциальности
 *     (мы экспортируем функцию resetCookieConsent — её можно вызвать из политики).
 */
export default function CookieConsent() {
  // null = решение ещё не принято / читаем localStorage
  const [consent, setConsent] = useState<'accepted' | 'rejected' | null | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === VALUES.ACCEPTED || stored === VALUES.REJECTED) {
        setConsent(stored);
      } else {
        setConsent(null);
      }
    } catch {
      setConsent(null);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, VALUES.ACCEPTED);
    } catch {}
    setConsent(VALUES.ACCEPTED);
  }

  function reject() {
    try {
      localStorage.setItem(STORAGE_KEY, VALUES.REJECTED);
    } catch {}
    setConsent(VALUES.REJECTED);
  }

  // Пока не определились — ничего не рендерим (избегаем мигания)
  if (consent === undefined) return null;

  return (
    <>
      {/* Yandex Metrika — подключается ТОЛЬКО при явном accept И наличии env-переменной */}
      {consent === 'accepted' && metrikaId && (
        <>
          <Script
            id="yandex-metrika"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                ym(${metrikaId}, "init", {
                  clickmap: true,
                  trackLinks: true,
                  accurateTrackBounce: true,
                  webvisor: true,
                  ecommerce: "dataLayer"
                });
              `
            }}
          />
          <noscript>
            <div>
              <img
                src={`https://mc.yandex.ru/watch/${metrikaId}`}
                style={{ position: 'absolute', left: '-9999px' }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}

      {/* Сам баннер — показывается только если решение ещё не принято */}
      {consent === null && (
        <div
          className="cookie-banner"
          role="dialog"
          aria-live="polite"
          aria-label="Согласие на обработку cookie"
        >
          <div className="cookie-banner-inner">
            <div className="cookie-banner-text">
              Сайт использует cookie-файлы и сервис Яндекс.Метрика для аналитики. По 152-ФЗ это
              требует вашего согласия. Подробнее — в{' '}
              <a href="/privacy">политике конфиденциальности</a>.
            </div>
            <div className="cookie-banner-actions">
              <button
                type="button"
                className="cookie-banner-btn cookie-banner-btn--reject"
                onClick={reject}
              >
                Только необходимые
              </button>
              <button
                type="button"
                className="cookie-banner-btn cookie-banner-btn--accept"
                onClick={accept}
              >
                Принять все
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Утилита для отзыва согласия — вызывать из политики конфиденциальности
export function resetCookieConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  } catch {}
}
