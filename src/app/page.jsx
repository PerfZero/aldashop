"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import DeliverySection from './components/DeliverySection';
import EmailVerificationModal from '../components/EmailVerificationModal';
import ResetPasswordModal from '../components/ResetPasswordModal';



function HomeContent() {
  const searchParams = useSearchParams();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const key = searchParams.get('key');
    const uidb64 = searchParams.get('uidb64');
    const token = searchParams.get('token');

    if (key) {
      setShowEmailModal(true);
    } else if (uidb64 && token) {
      setShowResetModal(true);
    }
  }, [searchParams]);

  return (
    <div className={styles.page}>
      <EmailVerificationModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
      />
      <ResetPasswordModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
      />
      <main className={styles.main}>
        <section className={styles.promo}>
          <div className={styles.promo_container}>
            <h1 className={styles.promo__title}>
              ALDA — мебель, которую <br /> выбирают сердцем
            </h1>
            <Link href="/products" className={styles.promo__button}>
              Выбрать мебель <svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#A45B38" />
              </svg>
            </Link>
          </div>
        </section>

        {/* First section - Image on left, text on right */}
        <section className={styles.section}>
          <div className={styles.section__container}>
            <div className={styles.section__image}>
              <Image
                src="/pic_1.png"
                alt="Комфортная мебель"
                width={600}
                height={400}
                priority
              />
            </div>
            <div className={styles.section__content}>
              <h2 className={styles.section__title}>
                Максимум комфорта в минимуме места
              </h2>
              <Link href="/products" className={styles.section__button}>
                Выбрать компактный комфорт<svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#C1A286" />
              </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Second section - Two rows with images and text */}
        <section className={styles.section}>
          <div className={styles.section__container}>
            <div className={styles.section__row}>
              <div className={styles.section__image}>
                <Image
                  src="/pic_2.png"
                  alt="Комфортная мебель"
                  width={600}
                  height={400}
                />
                <h2 className={styles.section__title}>
                  Максимум комфорта в минимуме
                </h2>
              </div>
         
                
                <Link href="/products" className={styles.section__button}>
                Выбрать компактный комфорт<svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#C1A286" />
              </svg>
              </Link>
            
            </div>
            <div className={styles.section__row}>
              <div className={styles.section__image}>
                <Image
                 src="/pic_2.png"
                  alt="Комфортная мебель"
                  width={600}
                  height={400}
                />
                  <h2 className={styles.section__title}>
                  Максимум комфорта в минимуме
                </h2>
              </div>
              
              <Link href="/products" className={styles.section__button}>
                Выбрать компактный комфорт<svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#C1A286" />
              </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Third section - Text on left, image on right */}
        <section className={styles.section}>
          <div className={styles.section__container}>
            <div className={styles.section__image}>
              <Image
                src="/pic_1.png"
                alt="Комфортная мебель"
                width={600}
                height={400}
                priority
              />
            </div>
            <div className={styles.section__content}>
              <h2 className={styles.section__title}>
                Максимум комфорта в минимуме места
              </h2>
              <Link href="/products" className={styles.section__button}>
                Выбрать компактный комфорт<svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#C1A286" />
              </svg>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.about}>
          <div className={styles.about__container}>
            <h2 className={styles.about__title}>О нас</h2>
            
            {/* Первый ряд */}
            <div className={styles.about__row}>
              <div className={styles.about__content}>
                <p className={styles.about__text}>
                  Мы — профессионалы, вдохновленные созданием идеальной мебели для вашего дома. Сочетая стиль, функциональность и качество, мы стремимся сделать каждый интерьер уникальным и комфортным.
                </p>
                <div className={styles.about__features}>
                  <h3>Мы предлагаем:</h3>
                  <div className={styles.about__feature}>
                    <span className={styles.about__feature_number}>1</span>
                    <div className={styles.about__feature_content}>
                      <h3 className={styles.about__feature_title}>Мягкую мебель</h3>
                      <p className={styles.about__feature_text}>Кресла, пуфы, диваны, <br /> стулья с мягкой обшивкой</p>
                    </div>
                  </div>
                  <div className={styles.about__feature}>
                    <span className={styles.about__feature_number}>2</span>
                    <div className={styles.about__feature_content}>
                      <h3 className={styles.about__feature_title}>Функциональность и стиль</h3>
                      <p className={styles.about__feature_text}>Стильные и практичные <br /> решения для вашего дома.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.about__image}>
                <Image
                  src="/about_1.png"
                  alt="О нашей компании"
                  width={715}
                  height={323}
                  priority
                />
              </div>
            </div>

            {/* Второй ряд */}
            <div className={styles.about__row}>
              <div className={styles.about__image}>
                <Image
                  src="/about_2.png"
                  alt="Наше производство"
                  width={544}
                  height={317}
                />
              </div>
              <div className={styles.about__content}>
                <p className={styles.about__text}>
                  Мы сотрудничаем с проверенными фабриками, которые гарантируют высокое качество материалов и мастерство исполнения. Благодаря этому сотрудничеству, мы можем предложить нашим клиентам широкий ассортимент продукции, соответствующую мировым стандартам.
                </p>
                <div className={styles.about__stats}>
                  <div className={styles.about__stat}>
                    <span className={styles.about__stat_number}>10+</span>
                    <span className={styles.about__stat_text}>лет работы</span>
                  </div>
                  <div className={styles.about__stat}>
                    <span className={styles.about__stat_number}>45 000+</span>
                    <span className={styles.about__stat_text}>довольных покупателей</span>
                  </div>
                  <div className={styles.about__stat}>
                    <span className={styles.about__stat_number}>300+</span>
                    <span className={styles.about__stat_text}>товаров</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DeliverySection />

        <section className={styles.payment}>
          <div className={styles.payment__container}>
            <h2 className={styles.payment__title}>Как оплатить заказ?</h2>
            <div className={styles.payment__row}>
              <div className={styles.payment__option}>
                <div className={styles.payment__icon}>
                  <Image
                    src="/pay_1.svg" // Замените на путь к вашей иконке карты
                    alt="Банковская карта"
                    width={75}
                    height={75}
                  />
                </div>
                <div className={styles.payment__option_content}>
                <h3 className={styles.payment__option_title}>Банковская карта</h3>
                <p className={styles.payment__option_text}>
                  Оплата товаров, которые уже в наличии, либо будут изготавливаться от 60 дней через сайт с подписанием договора клиентом.
                </p>
                </div>
              </div>
              <div className={styles.payment__option}>
                <div className={styles.payment__icon}>
                  <Image
                    src="/pay_2.svg" // Замените на путь к вашей иконке безналичного расчета
                    alt="Безналичный расчет"
                    width={75}
                    height={75}
                  />
                </div>
                <div className={styles.payment__option_content}>
                <h3 className={styles.payment__option_title}>Безналичный расчет</h3>
                <p className={styles.payment__option_text}>
                  (юрлица или физлица)<br />
                  Оставьте контактные данные (телефон, email, ФИО) — менеджер свяжется для подтверждения заказа.
                </p>
                </div>
              </div>
            </div>
            <p className={styles.payment__support}>
              Если у вас возникли вопросы или проблемы с оплатой, пожалуйста, свяжитесь с нашей службой поддержки по телефону <a href="tel:+79999999999">+7 (999) 999-99-99</a> или напишите нам на почту <a href="mailto:support@alda.ru">support@alda.ru</a>. Мы всегда готовы вам помочь!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <HomeContent />
    </Suspense>
  );
}