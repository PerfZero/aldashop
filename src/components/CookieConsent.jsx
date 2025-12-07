'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './CookieConsent.module.css';
import CookieSettings from './CookieSettings';
import LegalModal from './LegalModal';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: false,
    analytical: false,
    marketing: false
  });
  const [modalData, setModalData] = useState({ isOpen: false, title: '', content: '', type: '', pdfUrl: null });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    } else {
      const preferences = JSON.parse(consent);
      setCookiePreferences(preferences);
    }
  }, []);

  const openCookiePolicy = async () => {
    try {
      const response = await fetch(`https://aldalinde.ru/api/documents?type=cookie_policy`);
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          const fullUrl = data.url.startsWith('http') ? data.url : `https://aldalinde.ru${data.url}`;
          if (fullUrl.endsWith('.pdf')) {
            setModalData({
              isOpen: true,
              title: 'Политика использования cookies',
              content: '',
              type: 'cookie_policy',
              pdfUrl: fullUrl
            });
            return;
          }
          const contentResponse = await fetch(fullUrl);
          if (contentResponse.ok) {
            const content = await contentResponse.text();
            setModalData({
              isOpen: true,
              title: 'Политика использования cookies',
              content: content,
              type: 'cookie_policy',
              pdfUrl: null
            });
          }
        }
      }
    } catch (error) {
      setModalData({
        isOpen: true,
        title: 'Политика использования cookies',
        content: '<p>Ошибка загрузки документа</p>',
        type: 'cookie_policy',
        pdfUrl: null
      });
    }
  };

  const closeModal = () => {
    setModalData({ isOpen: false, title: '', content: '', type: '', pdfUrl: null });
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytical: true,
      marketing: true
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleReject = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytical: false,
      marketing: false
    };
    setCookiePreferences(onlyNecessary);
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    setIsVisible(false);
  };

  const handleSavePreferences = (preferences) => {
    setCookiePreferences(preferences);
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return createPortal(
    <>
      <div className={styles.banner}>
        <div className={styles.content}>
          <p className={styles.text}>
            Мы используем файлы cookie для улучшения работы нашего сайта и предоставления персонализированного контента. 
            Нажимая «Принять все», вы соглашаетесь с использованием всех файлов cookie. 
            Вы можете настроить их использование или отказаться от ненужных файлов cookie в{' '}
            <button type="button" onClick={() => setShowSettings(true)} className={styles.link}>
              настройках
            </button>
            . Подробнее в{' '}
            <button type="button" onClick={openCookiePolicy} className={styles.link}>
              политике использования cookies
            </button>
            .
          </p>
          <div className={styles.buttons}>
            <button onClick={handleReject} className={styles.rejectButton}>
              Отклонить
            </button>
            <button onClick={() => setShowSettings(true)} className={styles.settingsButton}>
            Изменить
            </button>
            <button onClick={handleAcceptAll} className={styles.acceptButton}>
              Принять все
            </button>
          </div>
        </div>
      </div>
      {showSettings && (
        <CookieSettings
          preferences={cookiePreferences}
          onSave={handleSavePreferences}
          onClose={() => setShowSettings(false)}
        />
      )}
      <LegalModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        title={modalData.title}
        content={modalData.content}
        type={modalData.type}
        pdfUrl={modalData.pdfUrl}
      />
    </>,
    document.body
  );
}

