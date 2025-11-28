'use client';

import React, { useState, useEffect } from 'react';
import styles from './Footer.module.css';
import Link from 'next/link';
import Image from 'next/image';
import LegalModal from './LegalModal';

const Footer = () => {
  const [footerInfo, setFooterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState({ isOpen: false, title: '', content: '', type: '', pdfUrl: null });

  useEffect(() => {
    const fetchFooterInfo = async () => {
      try {
        const response = await fetch('https://aldalinde.ru/api/footer-info/');
        if (response.ok) {
          const data = await response.json();
          setFooterInfo(data);
        } else {
          console.error('Ошибка загрузки информации футера');
        }
      } catch (error) {
        console.error('Ошибка при загрузке информации футера:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterInfo();
  }, []);

  const openModal = async (type) => {
    const typeMap = {
      terms: 'consent_personal_data',
      privacy: 'privacy_policy',
      offer: 'public_offer',
      cookies: 'cookie_policy'
    };

    const titles = {
      terms: 'Согласие на обработку персональных данных',
      privacy: 'Политика конфиденциальности',
      offer: 'Публичная оферта',
      cookies: 'Политика использования cookies'
    };

    const apiType = typeMap[type];

    try {
      const response = await fetch(`https://aldalinde.ru/api/documents?type=${apiType}`);
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          const fullUrl = data.url.startsWith('http') ? data.url : `https://aldalinde.ru${data.url}`;
          if (fullUrl.endsWith('.pdf')) {
            setModalData({
              isOpen: true,
              title: titles[type] || 'Документ',
              content: '',
              type: type,
              pdfUrl: fullUrl
            });
            return;
          }
          const contentResponse = await fetch(fullUrl);
          if (contentResponse.ok) {
            const content = await contentResponse.text();
            setModalData({
              isOpen: true,
              title: titles[type] || 'Документ',
              content: content,
              type: type,
              pdfUrl: null
            });
          } else {
            setModalData({
              isOpen: true,
              title: titles[type] || 'Документ',
              content: '<p>Не удалось загрузить документ</p>',
              type: type,
              pdfUrl: null
            });
          }
        } else {
          setModalData({
            isOpen: true,
            title: titles[type] || 'Документ',
            content: '<p>Документ не найден</p>',
            type: type,
            pdfUrl: null
          });
        }
      } else {
        setModalData({
          isOpen: true,
          title: titles[type] || 'Документ',
          content: '<p>Ошибка загрузки документа</p>',
          type: type,
          pdfUrl: null
        });
      }
    } catch (error) {
      setModalData({
        isOpen: true,
        title: titles[type] || 'Документ',
        content: '<p>Ошибка загрузки документа</p>',
        type: type,
        pdfUrl: null
      });
    }
  };

  const closeModal = () => {
    setModalData({ isOpen: false, title: '', content: '', type: '', pdfUrl: null });
  };

  if (loading) {
    return (
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div>Загрузка...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.logoSection}>
          <svg width="100" height="26" viewBox="0 0 100 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.324 18.584H4.904L1.736 26H0.08L10.736 0.799998H12.536L24.272 26H20.78L17.324 18.584ZM16.568 16.964L10.916 4.832H10.772L5.588 16.964H16.568ZM29.6872 26V0.799998H32.9632V24.02H45.9592V26H29.6872ZM51.7034 26V0.799998H59.9834C61.9754 0.799998 63.7994 1.124 65.4554 1.772C67.1114 2.396 68.5274 3.272 69.7034 4.4C70.9034 5.504 71.8274 6.824 72.4754 8.36C73.1474 9.896 73.4834 11.552 73.4834 13.328C73.4834 15.176 73.1354 16.88 72.4394 18.44C71.7674 19.976 70.8314 21.308 69.6314 22.436C68.4554 23.564 67.0754 24.44 65.4914 25.064C63.9074 25.688 62.2154 26 60.4154 26H51.7034ZM54.9794 24.416H58.9394C60.9074 24.416 62.5754 24.092 63.9434 23.444C65.3354 22.772 66.4754 21.908 67.3634 20.852C68.2514 19.796 68.8994 18.62 69.3074 17.324C69.7154 16.004 69.9194 14.696 69.9194 13.4C69.9194 11.96 69.6794 10.58 69.1994 9.26C68.7194 7.916 68.0114 6.74 67.0754 5.732C66.1634 4.7 65.0234 3.884 63.6554 3.284C62.2874 2.684 60.7154 2.384 58.9394 2.384H54.9794V24.416ZM92.8748 18.584H80.4548L77.2868 26H75.6308L86.2868 0.799998H88.0868L99.8228 26H96.3308L92.8748 18.584ZM92.1188 16.964L86.4668 4.832H86.3228L81.1388 16.964H92.1188Z" fill="white"/>
</svg>

          </div>
          <nav className={styles.footerNav}>
            <Link href="/trending">В тренде</Link>
            <Link href="/sofas">Диваны</Link>
            <Link href="/tables">Столы</Link>
            <Link href="/chairs">Стулья</Link>
            <Link href="/beds">Кровати</Link>
            <Link href="/storage">Хранение</Link>
          </nav>
        </div>

        <div className={styles.footerSection}>
          <h3>Доставка и оплата</h3>
          <nav className={styles.footerNav}>
            <Link href="/#delivery">Доставка</Link>
            <Link href="/#payment">Варианты оплаты</Link>
          </nav>
        </div>

        <div className={styles.footerSection}>
          <h3>Контакты</h3>
          <div className={styles.contactInfo}>
            <div>
              <p>{footerInfo?.phone || '9 87353 3435'}</p>
              <div className={styles.messengerIcons}>
                {footerInfo?.whatsapp_link && (
                  <a href={footerInfo.whatsapp_link} target="_blank" rel="noopener noreferrer">
                    <Image src="/Images/footer/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
                  </a>
                )}
                {footerInfo?.telegram_link && (
                  <a href={footerInfo.telegram_link} target="_blank" rel="noopener noreferrer">
                    <Image src="/Images/footer/telegram.svg" alt="Telegram" width={24} height={24} />
                  </a>
                )}
                {footerInfo?.viber_link && (
                  <a href={footerInfo.viber_link} target="_blank" rel="noopener noreferrer">
                    <Image src="/Images/footer/vk-messenger.svg" alt="Viber" width={24} height={24} />
                  </a>
                )}
              </div>
            </div>
            <p>{footerInfo?.email || 'welccovd.gmail.com'}</p>
            <p>Отдел продаж с {footerInfo?.sales_department_time_from?.substring(0, 5) || '9:00'} до {footerInfo?.sales_department_time_to?.substring(0, 5) || '20:00'}</p>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>Подпишитесь на нас</h3>
          <p>Мы в социальных сетях</p>
          <div className={styles.socialLinks}>
            {footerInfo?.youtube_link && (
              <a href={footerInfo.youtube_link} target="_blank" rel="noopener noreferrer">
                <Image src="/icon_footer_1.svg" alt="YouTube" width={24} height={24} />
              </a>
            )}
            {footerInfo?.instagram_link && (
              <a href={footerInfo.instagram_link} target="_blank" rel="noopener noreferrer">
                <Image src="/icon_footer_2.svg" alt="Instagram" width={24} height={24} style={{ width: 'auto', height: 'auto' }} />
              </a>
            )}
            {footerInfo?.telegram_channel_link && (
              <a href={footerInfo.telegram_channel_link} target="_blank" rel="noopener noreferrer">
                <Image src="/icon_footer_3.svg" alt="Telegram Channel" width={24} height={24} />
              </a>
            )}
          </div>
          <p>Платежные системы</p>
          <div className={styles.paymentSystems}>
            <Image src="/mir.png" alt="МИР" width={40} height={24} style={{ width: 'auto', height: 'auto' }} />
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          ©2025 ALDA. Все права защищены
        </div>
        <nav className={styles.bottomNav}>
          <button onClick={() => openModal('offer')} className={styles.legalLink}>
            Публичная оферта
          </button>
          <button onClick={() => openModal('privacy')} className={styles.legalLink}>
            Политика конфиденциальности
          </button>
          <button onClick={() => openModal('cookies')} className={styles.legalLink}>
            Политика использования cookies
          </button>
        </nav>
      </div>

      <LegalModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        title={modalData.title}
        content={modalData.content}
        type={modalData.type}
        pdfUrl={modalData.pdfUrl}
      />
    </footer>
  );
};

export default Footer; 