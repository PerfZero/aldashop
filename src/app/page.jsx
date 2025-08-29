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
  const [mainPageData, setMainPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchMainPageData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/main-page-info');
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();
        setMainPageData(data);
      } catch (error) {
        console.error('Ошибка загрузки данных главной страницы:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMainPageData();
  }, []);

  if (isLoading) {
    return <div className={styles.loadingScreen}></div>;
  }

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
        <section 
          className={styles.promo}
          style={{
            backgroundImage: mainPageData?.main_image ? `url(${mainPageData.main_image})` : 'url("/main.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className={styles.promo_container}>
            <h1 className={styles.promo__title}>
              {mainPageData?.title || "ALDA — мебель, которую выбирают сердцем"}
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
          <Link href={mainPageData?.main_page_items?.[0]?.link || "/products"} className={styles.section__link}>
            <div className={styles.section__container}>
              <div className={styles.section__image}>
                <div className={styles.image_container}>
                  <Image
                    src={mainPageData?.main_page_items?.[0]?.photo ? `https://aldalinde.ru${mainPageData.main_page_items[0].photo}` : "/pic_1.png"}
                    alt={mainPageData?.main_page_items?.[0]?.title || "Комфортная мебель"}
                    width={600}
                    height={400}
                    priority
                    className={styles.base_image}
                  />
                  {mainPageData?.main_page_items?.[0]?.photo_interior && (
                    <Image
                      src={`https://aldalinde.ru${mainPageData.main_page_items[0].photo_interior}`}
                      alt={mainPageData?.main_page_items?.[0]?.title || "Комфортная мебель"}
                      width={600}
                      height={400}
                      className={styles.hover_image}
                    />
                  )}
                </div>
              </div>
              <div className={styles.section__content}>
                <h2 className={styles.section__title}>
                  {mainPageData?.main_page_items?.[0]?.title || "Максимум комфорта в минимуме места"}
                </h2>
                <div className={styles.section__button}>
                  {mainPageData?.main_page_items?.[0]?.product_id ? "Подробнее" : "Выбрать компактный комфорт"}<svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#C1A286" />
                </svg>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Second section - Two rows with images and text */}
        <section className={styles.section}>
          <div className={styles.section__container}>
            <Link href={mainPageData?.main_page_items?.[1]?.link || "/products"} className={styles.section__links}>
              <div className={styles.section__row}>
                <div className={styles.section__image}>
                  <div className={styles.image_container}>
                    <Image
                      src={mainPageData?.main_page_items?.[1]?.photo ? `https://aldalinde.ru${mainPageData.main_page_items[1].photo}` : "/pic_2.png"}
                      alt={mainPageData?.main_page_items?.[1]?.title || "Комфортная мебель"}
                      width={600}
                      height={400}
                      className={styles.base_image}
                    />
                    {mainPageData?.main_page_items?.[1]?.photo_interior && (
                      <Image
                        src={`https://aldalinde.ru${mainPageData.main_page_items[1].photo_interior}`}
                        alt={mainPageData?.main_page_items?.[1]?.title || "Комфортная мебель"}
                        width={600}
                        height={400}
                        className={styles.hover_image}
                      />
                    )}
                  </div>
                  <h2 className={styles.section__title}>
                    {mainPageData?.main_page_items?.[1]?.title || "Максимум комфорта в минимуме"}
                  </h2>
                </div>
                <div className={styles.section__button}>
                  {mainPageData?.main_page_items?.[1]?.product_id ? "Подробнее" : "Выбрать компактный комфорт"}<svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#C1A286" />
                </svg>
                </div>
              </div>
            </Link>
            <Link href={mainPageData?.main_page_items?.[2]?.link || "/products"} className={styles.section__links}>
              <div className={styles.section__row}>
                <div className={styles.section__image}>
                  <div className={styles.image_container}>
                    <Image
                      src={mainPageData?.main_page_items?.[2]?.photo ? `https://aldalinde.ru${mainPageData.main_page_items[2].photo}` : "/pic_2.png"}
                      alt={mainPageData?.main_page_items?.[2]?.title || "Комфортная мебель"}
                      width={600}
                      height={400}
                      className={styles.base_image}
                    />
                    {mainPageData?.main_page_items?.[2]?.photo_interior && (
                      <Image
                        src={`https://aldalinde.ru${mainPageData.main_page_items[2].photo_interior}`}
                        alt={mainPageData?.main_page_items?.[2]?.title || "Комфортная мебель"}
                        width={600}
                        height={400}
                        className={styles.hover_image}
                      />
                    )}
                  </div>
                  <h2 className={styles.section__title}>
                    {mainPageData?.main_page_items?.[2]?.title || "Максимум комфорта в минимуме"}
                  </h2>
                </div>
                <div className={styles.section__button}>
                  {mainPageData?.main_page_items?.[2]?.product_id ? "Подробнее" : "Выбрать компактный комфорт"}<svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#C1A286" />
                </svg>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Third section - Text on left, image on right */}
        <section className={styles.section}>
          <Link href={mainPageData?.main_page_items?.[3]?.link || "/products"} className={styles.section__link}>
            <div className={styles.section__container}>
              <div className={styles.section__image}>
                <div className={styles.image_container}>
                  <Image
                    src={mainPageData?.main_page_items?.[3]?.photo ? `https://aldalinde.ru${mainPageData.main_page_items[3].photo}` : "/pic_1.png"}
                    alt={mainPageData?.main_page_items?.[3]?.title || "Комфортная мебель"}
                    width={600}
                    height={400}
                    priority
                    className={styles.base_image}
                  />
                  {mainPageData?.main_page_items?.[3]?.photo_interior && (
                    <Image
                      src={`https://aldalinde.ru${mainPageData.main_page_items[3].photo_interior}`}
                      alt={mainPageData?.main_page_items?.[3]?.title || "Комфортная мебель"}
                      width={600}
                      height={400}
                      className={styles.hover_image}
                    />
                  )}
                </div>
              </div>
              <div className={styles.section__content}>
                <h2 className={styles.section__title}>
                  {mainPageData?.main_page_items?.[3]?.title || "Максимум комфорта в минимуме места"}
                </h2>
                <div className={styles.section__button}>
                  {mainPageData?.main_page_items?.[3]?.product_id ? "Подробнее" : "Выбрать компактный комфорт"}<svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V5.25ZM32.0303 6.53033C32.3232 6.23744 32.3232 5.76256 32.0303 5.46967L27.2574 0.696699C26.9645 0.403806 26.4896 0.403806 26.1967 0.696699C25.9038 0.989593 25.9038 1.46447 26.1967 1.75736L30.4393 6L26.1967 10.2426C25.9038 10.5355 25.9038 11.0104 26.1967 11.3033C26.4896 11.5962 26.9645 11.5962 27.2574 11.3033L32.0303 6.53033ZM1.5 6.75H31.5V5.25H1.5V6.75Z" fill="#C1A286" />
                </svg>
                </div>
              </div>
            </div>
          </Link>
        </section>

        <section className={styles.about}>
          <div className={styles.about__container}>
            <h2 className={styles.about__title}>{mainPageData?.about_us_title || 'О нас'}</h2>
            
            {/* Первый ряд */}
            <div className={styles.about__row}>
              <div className={styles.about__content}>
                <p className={styles.about__text}>
                  {mainPageData?.about_us_description1 || 'Мы — профессионалы, вдохновленные созданием идеальной мебели для вашего дома. Сочетая стиль, функциональность и качество, мы стремимся сделать каждый интерьер уникальным и комфортным.'}
                </p>
                <div className={styles.about__features}>
                  <h3>{mainPageData?.about_us_param_title || 'Мы предлагаем:'}</h3>
                  <div className={styles.about__feature}>
                    <span className={styles.about__feature_number}>1</span>
                    <div className={styles.about__feature_content}>
                      <h3 className={styles.about__feature_title}>{mainPageData?.about_us_param_title_p1 || 'Мягкую мебель'}</h3>
                      <p className={styles.about__feature_text}>{mainPageData?.about_us_param_text_p1 || 'Кресла, пуфы, диваны, стулья с мягкой обшивкой'}</p>
                    </div>
                  </div>
                  <div className={styles.about__feature}>
                    <span className={styles.about__feature_number}>2</span>
                    <div className={styles.about__feature_content}>
                      <h3 className={styles.about__feature_title}>{mainPageData?.about_us_param_title_p2 || 'Функциональность и стиль'}</h3>
                      <p className={styles.about__feature_text}>{mainPageData?.about_us_param_text_p2 || 'Стильные и практичные решения для вашего дома.'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.about__image}>
                <Image
                  src={mainPageData?.about_us_image1 || "/about_1.png"}
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
                  src={mainPageData?.about_us_image2 || "/about_2.png"}
                  alt="Наше производство"
                  width={544}
                  height={317}
                />
              </div>
              <div className={styles.about__content}>
                <p className={styles.about__text}>
                  {mainPageData?.about_us_description2 || 'Мы сотрудничаем с проверенными фабриками, которые гарантируют высокое качество материалов и мастерство исполнения. Благодаря этому сотрудничеству, мы можем предложить нашим клиентам широкий ассортимент продукции, соответствующую мировым стандартам.'}
                </p>
                <div className={styles.about__stats}>
                  <div className={styles.about__stat}>
                    <span className={styles.about__stat_number}>{mainPageData?.numbers_block_val1 || '10+'}</span>
                    <span className={styles.about__stat_text}>{mainPageData?.numbers_block_title1 || 'лет работы'}</span>
                  </div>
                  <div className={styles.about__stat}>
                    <span className={styles.about__stat_number}>{mainPageData?.numbers_block_val2 || '45 000+'}</span>
                    <span className={styles.about__stat_text}>{mainPageData?.numbers_block_title2 || 'довольных покупателей'}</span>
                  </div>
                  <div className={styles.about__stat}>
                    <span className={styles.about__stat_number}>{mainPageData?.numbers_block_val3 || '300+'}</span>
                    <span className={styles.about__stat_text}>{mainPageData?.numbers_block_title3 || 'товаров'}</span>
                  </div>
                  {/* Отладка */}
                  <div style={{fontSize: '12px', color: 'red', marginTop: '10px'}}>
                    Debug: {JSON.stringify({
                      val1: mainPageData?.numbers_block_val1,
                      title1: mainPageData?.numbers_block_title1,
                      val2: mainPageData?.numbers_block_val2,
                      title2: mainPageData?.numbers_block_title2,
                      val3: mainPageData?.numbers_block_val3,
                      title3: mainPageData?.numbers_block_title3
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DeliverySection mainPageData={mainPageData} />

        <section className={styles.payment}>
          <div className={styles.payment__container}>
            <h2 className={styles.payment__title}>{mainPageData?.payment_title || 'Как оплатить заказ?'}</h2>
            <div className={styles.payment__row}>
              <div className={styles.payment__option}>
                <div className={styles.payment__icon}>
                  <Image
                    src="/pay_1.svg"
                    alt="Банковская карта"
                    width={75}
                    height={75}
                  />
                </div>
                <div className={styles.payment__option_content}>
                <h3 className={styles.payment__option_title}>{mainPageData?.payment_block_title1 || 'Банковская карта'}</h3>
                <p className={styles.payment__option_text}>
                  {mainPageData?.payment_block_text1 || 'Оплата товаров, которые уже в наличии, либо будут изготавливаться от 60 дней через сайт с подписанием договора клиентом.'}
                </p>
                </div>
              </div>
              <div className={styles.payment__option}>
                <div className={styles.payment__icon}>
                  <Image
                    src="/pay_2.svg"
                    alt="Безналичный расчет"
                    width={75}
                    height={75}
                  />
                </div>
                <div className={styles.payment__option_content}>
                <h3 className={styles.payment__option_title}>{mainPageData?.payment_block_title2 || 'Безналичный расчет'}</h3>
                <p className={styles.payment__option_text}>
                  {mainPageData?.payment_block_text2 || '(юрлица или физлица) Оставьте контактные данные (телефон, email, ФИО) — менеджер свяжется для подтверждения заказа.'}
                </p>
                </div>
              </div>
            </div>
            <p className={styles.payment__support}>
              {mainPageData?.payment_description || 'Если у вас возникли вопросы или проблемы с оплатой, пожалуйста, свяжитесь с нашей службой поддержки по телефону +7 (999) 999-99-99 или напишите нам на почту support@alda.ru. Мы всегда готовы вам помочь!'}
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