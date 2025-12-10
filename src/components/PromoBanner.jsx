"use client";

import { useState, useEffect } from 'react';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
  const [bannerData, setBannerData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch('https://aldalinde.ru/api/products/get_banner/');
        const data = await response.json();
        
        if (data.success && data.data) {
          setBannerData(data.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки баннера:', error);
      }
    };

    fetchBanner();
  }, []);

  useEffect(() => {
    if (!bannerData?.description) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(bannerData.description);
      const now = new Date();
      const difference = endDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        
        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [bannerData]);

  return (
    <div className={styles.promoBanner}>
      <div className={styles.promoBanner__container}>
        {bannerData?.text && (
          <span className={styles.promoBanner__text}>{bannerData.text}</span>
        )}
        {bannerData?.description && (
          <span className={styles.promoBanner__timer}>
            {timeLeft.days}Д {String(timeLeft.hours).padStart(2, '0')}Ч {String(timeLeft.minutes).padStart(2, '0')}М
          </span>
        )}
      </div>
    </div>
  );
}


