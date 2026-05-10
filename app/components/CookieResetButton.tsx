'use client';

import { resetCookieConsent } from '../CookieConsent';

/**
 * Кнопка отзыва согласия на cookies.
 * По 152-ФЗ субъект ПД должен иметь возможность отозвать согласие в любой момент.
 * Размещается на странице политики конфиденциальности.
 */
export default function CookieResetButton() {
  return (
    <button
      type="button"
      className="legal-reset-btn"
      onClick={() => {
        if (confirm('Сбросить согласие на cookie? Страница перезагрузится, и вы сможете изменить выбор.')) {
          resetCookieConsent();
        }
      }}
    >
      Изменить или отозвать согласие на cookie →
    </button>
  );
}
