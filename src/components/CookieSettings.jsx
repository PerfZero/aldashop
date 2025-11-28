'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './CookieSettings.module.css';

export default function CookieSettings({ preferences, onSave, onClose }) {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleToggle = (category) => {
    if (category === 'necessary') return;
    setLocalPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSave = () => {
    onSave(localPreferences);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Настройки cookies</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5 0.5L15.5 15.5M15.5 0.5L0.5 15.5" stroke="#C1AF86" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <p className={styles.description}>
            Выберите категории cookies, которые вы хотите разрешить. Необходимые cookies обязательны для работы сайта.
          </p>
          
          <div className={styles.categories}>
            <div className={styles.category}>
              <div className={styles.categoryHeader}>
                <div>
                  <h3 className={styles.categoryTitle}>Необходимые</h3>
                  <p className={styles.categoryDescription}>
                    Эти cookies необходимы для работы сайта и не могут быть отключены. Они обычно устанавливаются в ответ на ваши действия.
                  </p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={localPreferences.necessary}
                    disabled
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>

            <div className={styles.category}>
              <div className={styles.categoryHeader}>
                <div>
                  <h3 className={styles.categoryTitle}>Функциональные</h3>
                  <p className={styles.categoryDescription}>
                    Эти cookies позволяют сайту запоминать ваши предпочтения и настройки для улучшения пользовательского опыта.
                  </p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={localPreferences.functional}
                    onChange={() => handleToggle('functional')}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>

            <div className={styles.category}>
              <div className={styles.categoryHeader}>
                <div>
                  <h3 className={styles.categoryTitle}>Аналитические</h3>
                  <p className={styles.categoryDescription}>
                    Эти cookies собирают информацию о том, как вы используете наш сайт, для улучшения его работы.
                  </p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={localPreferences.analytical}
                    onChange={() => handleToggle('analytical')}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>

            <div className={styles.category}>
              <div className={styles.categoryHeader}>
                <div>
                  <h3 className={styles.categoryTitle}>Маркетинговые</h3>
                  <p className={styles.categoryDescription}>
                    Эти cookies используются для предоставления персонализированной рекламы и отслеживания эффективности рекламных кампаний.
                  </p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={localPreferences.marketing}
                    onChange={() => handleToggle('marketing')}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

