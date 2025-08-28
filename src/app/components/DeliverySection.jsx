'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import styles from '../page.module.css';

// Компонент секции доставки с свайпер-слайдером
export default function DeliverySection({ mainPageData }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef(null);
  
  // Данные для слайдера из API или fallback
  const slides = [
    {
      icon: "/delivery_1.svg",
      title: mainPageData?.delivery_image_block_title1 || "Самовывоз:",
      text: mainPageData?.delivery_image_block_text1 || "Вы можете забрать заказ самостоятельно из нашего склада или розничного магазина. Это бесплатно!"
    },
    {
        icon: "/delivery_2.svg",
      title: mainPageData?.delivery_image_block_title2 || "Курьерская доставка:",
      text: mainPageData?.delivery_image_block_text2 || "Мы доставляем заказы по всей России. Стоимость и сроки зависят от региона и выбранного способа доставки."
    },
    {
        icon: "/delivery_3.svg",
      title: mainPageData?.delivery_image_block_title3 || "Сборка мебели:",
      text: mainPageData?.delivery_image_block_text3 || "Предоставляем услугу сборки мебели опытными мастерами — быстро и качественно."
    },
    {
      icon: "/icons/express.png",
      title: "Экспресс-доставка:",
      text: "Срочная доставка в день заказа или на следующий день для жителей крупных городов."
    },
    {
      icon: "/icons/appointment.png",
      title: "Доставка по записи:",
      text: "Выберите удобное время для доставки в интервале 2 часов."
    },
    {
      icon: "/icons/warranty.png",
      title: "Гарантия доставки:",
      text: "Если мы не уложимся в обещанные сроки, доставка будет бесплатной."
    }
  ];
  
  // Переход к предыдущему слайду
  const prevSlide = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = (activeSlide - 1) * (sliderRef.current.offsetWidth / 3);
      }
    }
  };
  
  // Переход к следующему слайду
  const nextSlide = () => {
    if (activeSlide < slides.length - 3) {
      setActiveSlide(activeSlide + 1);
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = (activeSlide + 1) * (sliderRef.current.offsetWidth / 3);
      }
    }
  };
  
  // Расчет прогресса для прогресс-бара
  const progressWidth = `${(activeSlide / (slides.length - 3)) * 100}%`;

  return (
    <section className={styles.delivery}>
      <div className={styles.delivery__container}>
        <div className={styles.delivery__header}>
          <h2 className={styles.delivery__title}>{mainPageData?.delivery_title || "Доставка"}</h2>
          <p className={styles.delivery__text}>
            {mainPageData?.delivery_text1 || "Мы сделаем всё возможное, чтобы доставка вашей мебели прошла гладко и без стресса."}
            {mainPageData?.delivery_text2 && ` ${mainPageData.delivery_text2}`}
            {mainPageData?.delivery_text3 && ` ${mainPageData.delivery_text3}`}
          </p>
        </div>

        <div className={styles.delivery__slider_controls}>
          <button className={styles.delivery__arrow} onClick={prevSlide} disabled={activeSlide === 0}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="-1" y="1" width="48" height="48" rx="24" transform="matrix(-1 0 0 1 48 0)" stroke="#A45B38" strokeWidth="2" />
  <path d="M15 24C14.4477 24 14 24.4477 14 25C14 25.5523 14.4477 26 15 26V24ZM35.7071 25.7071C36.0976 25.3166 36.0976 24.6834 35.7071 24.2929L29.3431 17.9289C28.9526 17.5384 28.3195 17.5384 27.9289 17.9289C27.5384 18.3195 27.5384 18.9526 27.9289 19.3431L33.5858 25L27.9289 30.6569C27.5384 31.0474 27.5384 31.6805 27.9289 32.0711C28.3195 32.4616 28.9526 32.4616 29.3431 32.0711L35.7071 25.7071ZM15 26H35V24H15V26Z" fill="#A45B38" />
</svg>
          </button>
          
          <div className={styles.delivery__progress}>
            <div className={styles.delivery__progress_bar} style={{width: progressWidth}}></div>
          </div>
          
          <button className={styles.delivery__arrow} onClick={nextSlide} disabled={activeSlide >= slides.length - 3}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="-1" y="1" width="48" height="48" rx="24" transform="matrix(-1 0 0 1 48 0)" stroke="#A45B38" strokeWidth="2" />
  <path d="M15 24C14.4477 24 14 24.4477 14 25C14 25.5523 14.4477 26 15 26V24ZM35.7071 25.7071C36.0976 25.3166 36.0976 24.6834 35.7071 24.2929L29.3431 17.9289C28.9526 17.5384 28.3195 17.5384 27.9289 17.9289C27.5384 18.3195 27.5384 18.9526 27.9289 19.3431L33.5858 25L27.9289 30.6569C27.5384 31.0474 27.5384 31.6805 27.9289 32.0711C28.3195 32.4616 28.9526 32.4616 29.3431 32.0711L35.7071 25.7071ZM15 26H35V24H15V26Z" fill="#A45B38" />
</svg>
          </button>
        </div>
        
        {/* Свайпер-слайдер с элементами доставки */}
        <div className={styles.delivery__slider_container}>
          <div className={styles.delivery__slider} ref={sliderRef}>
            {slides.map((slide, index) => (
              <div 
                key={index} 
                className={`${styles.delivery__slide} ${activeSlide <= index && index < activeSlide + 3 ? styles.delivery__slide_active : ''}`}
              >
                <div className={styles.delivery__slide_icon}>
                  <Image
                    src={slide.icon}
                    alt={slide.title}
                    width={64}
                    height={64}
                  />
                </div>
                <h3 className={styles.delivery__slide_title}>{slide.title}</h3>
                <p className={styles.delivery__slide_text}>{slide.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}