import React from 'react';
import styles from './Footer.module.css';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.logoSection}>
            <Image src="/footer_logo.svg" alt="ALDA Logo" width={120} height={40} />
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
            <Link href="/delivery">Доставка</Link>
            <Link href="/payment">Варианты оплаты</Link>
          </nav>
        </div>

        <div className={styles.footerSection}>
          <h3>Контакты</h3>
          <div className={styles.contactInfo}>
            <p>9 87353 3435</p>
            <p>welccovd.gmail.com</p>
            <p>Отдел продаж с 9.00 до 20.00</p>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>Подпишитесь на нас</h3>
          <p>Мы в социальных сетях</p>
          <div className={styles.socialLinks}>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Image src="/icon_footer_1.svg" alt="YouTube" width={24} height={24} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Image src="/icon_footer_2.svg" alt="Instagram" width={24} height={24} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Image src="/icon_footer_3.svg" alt="VK" width={24} height={24} />
            </a>
          </div>
          <p>Платежные системы</p>
          <div className={styles.paymentSystems}>
            <Image src="/mir.png" alt="МИР" width={40} height={24} />
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          ©2025 ALDA. Все права защищены
        </div>
        <nav className={styles.bottomNav}>
          <Link href="/terms">Правила пользования</Link>
          <Link href="/privacy">Политика конфиденциальности</Link>
          <Link href="/cookies">Настройки файлов cookie</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer; 