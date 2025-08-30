'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import styles from '../page.module.css';

export default function DeliverySection({ mainPageData }) {
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  
  const deliveryTexts = [
    mainPageData?.delivery_text1 || "Мы сделаем всё возможное, чтобы доставка вашей мебели прошла гладко и без стресса.",
    mainPageData?.delivery_text2 || "Дополнительный текст доставки 1:",
    mainPageData?.delivery_text3 || "Дополнительный текст доставки 2:"
  ];
  
  const prevText = () => {
    setActiveTextIndex(prev => prev > 0 ? prev - 1 : deliveryTexts.length - 1);
  };
  
  const nextText = () => {
    setActiveTextIndex(prev => prev < deliveryTexts.length - 1 ? prev + 1 : 0);
  };

  return (
    <section id="delivery" className={styles.delivery}>
      <div className={styles.delivery__container}>
        <div className={styles.delivery__header}>
          <h2 className={styles.delivery__title}>{mainPageData?.delivery_title || "Доставка"}</h2>
          <p className={styles.delivery__text}>
            {deliveryTexts[activeTextIndex]}
          </p>
        </div>

        <div className={styles.delivery__slider_controls}>
          <button className={styles.delivery__arrow} onClick={prevText}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="-1" y="1" width="48" height="48" rx="24" transform="matrix(-1 0 0 1 48 0)" stroke="#A45B38" strokeWidth="2" />
  <path d="M15 24C14.4477 24 14 24.4477 14 25C14 25.5523 14.4477 26 15 26V24ZM35.7071 25.7071C36.0976 25.3166 36.0976 24.6834 35.7071 24.2929L29.3431 17.9289C28.9526 17.5384 28.3195 17.5384 27.9289 17.9289C27.5384 18.3195 27.5384 18.9526 27.9289 19.3431L33.5858 25L27.9289 30.6569C27.5384 31.0474 27.5384 31.6805 27.9289 32.0711C28.3195 32.4616 28.9526 32.4616 29.3431 32.0711L35.7071 25.7071ZM15 26H35V24H15V26Z" fill="#A45B38" />
</svg>
          </button>
          
          <div className={styles.delivery__progress}>
            <div className={styles.delivery__progress_indicator} style={{left: `${(activeTextIndex / (deliveryTexts.length - 1)) * 80}%`}}></div>
          </div>
          
          <button className={styles.delivery__arrow} onClick={nextText}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="-1" y="1" width="48" height="48" rx="24" transform="matrix(-1 0 0 1 48 0)" stroke="#A45B38" strokeWidth="2" />
  <path d="M15 24C14.4477 24 14 24.4477 14 25C14 25.5523 14.4477 26 15 26V24ZM35.7071 25.7071C36.0976 25.3166 36.0976 24.6834 35.7071 24.2929L29.3431 17.9289C28.9526 17.5384 28.3195 17.5384 27.9289 17.9289C27.5384 18.3195 27.5384 18.9526 27.9289 19.3431L33.5858 25L27.9289 30.6569C27.5384 31.0474 27.5384 31.6805 27.9289 32.0711C28.3195 32.4616 28.9526 32.4616 29.3431 32.0711L35.7071 25.7071ZM15 26H35V24H15V26Z" fill="#A45B38" />
</svg>
          </button>
        </div>
        
        <div className={styles.delivery__blocks}>
          <div className={styles.delivery__block}>
            <div className={styles.delivery__block_icon}>
              <Image
                src="/Images/delivery/delivery_1.svg"
                alt="Самовывоз"
                width={75}
                height={75}
              />
            </div>
            <h3 className={styles.delivery__block_title}>
              {mainPageData?.delivery_image_block_title1 || "Самовывоз"}
            </h3>
            <p className={styles.delivery__block_text}>
              {mainPageData?.delivery_image_block_text1 || "Самовывоз со склада или магазина — бесплатно!"}
            </p>
          </div>
          
          <div className={styles.delivery__block}>
            <div className={styles.delivery__block_icon}>
              <Image
                src="/Images/delivery/delivery_2.svg"
                alt="Курьерская доставка"
                width={102}
                height={75}
              />
            </div>
            <h3 className={styles.delivery__block_title}>
              {mainPageData?.delivery_image_block_title2 || "Курьерская доставка"}
            </h3>
            <p className={styles.delivery__block_text}>
              {mainPageData?.delivery_image_block_text2 || "Доставка по всей России — срок и стоимость зависят от региона"}
            </p>
          </div>
          
          <div className={styles.delivery__block}>
            <div className={styles.delivery__block_icon}>
              <Image
                src="/Images/delivery/delivery_3.svg"
                alt="Сборка мебели"
                width={75}
                height={75}
              />
            </div>
            <h3 className={styles.delivery__block_title}>
              {mainPageData?.delivery_image_block_title3 || "Сборка мебели"}
            </h3>
            <p className={styles.delivery__block_text}>
              {mainPageData?.delivery_image_block_text3 || "Предлагаем сборку мебели — быстро и качественно"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}