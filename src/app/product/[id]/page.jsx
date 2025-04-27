'use client';

import { useState } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import styles from './page.module.css';
import Reviews from '@/components/Reviews';

// Временные данные для демонстрации
const mockProduct = {
  id: 1,
  name: 'Диван-кровать Скаген бежевого цвета',
  article: 'IMR-1798647',
  price: '25 000',
  isBestseller: true,
  rating: 4,
  reviewsCount: 420,
  images: [
    '/prod.png',
    '/prod.png',
    '/prod.png',
    '/prod.png',
    '/prod.png'
  ],
  colors: [
    { name: 'Бежевый', hex: '#E8D0B3' },
    { name: 'Серый', hex: '#A0A0A0' },
    { name: 'Коричневый', hex: '#8B4513' },
    { name: 'Синий', hex: '#4169E1' }
  ],
  sizes: [
    '235х90х155 см',
    '235х90х152 см',

    '235х90х154 см'
  ],
  manufacturingTime: 'от 60-ти дней',
  weight: '80 кг',
  material: 'Велюр',
  country: 'Новосибирск',
  delivery: 'Доставка в город, по России и в СНГ',
  description: `Мягкая кровать-тахта Milena (Милена) с ортопедическим основанием, выкатными ящиками и спальным местом 120*200 – уникальный предмет мебели, который совмещает в себе полноценную кровать и диван. 

Тахта с двумя мягкими спинками выполнена из модной мебельной ткани – велюр Фортуна 11, серого цвета. Ткань износостойкая, легко чистится от загрязнений (влажной тряпочкой, любыми средствами, кроме средств с растворителями), практичная, эластичная, устойчивая к ультрафиолету. 

• Угол сборки универсальный – может собираться как на правую, так и на левую сторону. 
• Укомплектована основанием - ортопедическими ламелями на металлической рамке.
• Спальное место – 120*200 см. 
• Кровать укомплектована двумя выкатными ящиками (полного выдвижения) 
• Высокие стенки обшиты сзади спанбондом. 

Рекомендуем размещать кровать к стене. Эксплуатация кровати без матраса – ЗАПРЕЩАЕТСЯ (т.к. ортопедические ламели и/или подъемный механизм предназначены для равномерного распределения веса только с матрасом) · Нагрузка на одно спальное место 125 кг. · Рекомендуемый вес матраса - не более 27 кг. · Рекомендуемая высота матраса – не более 20 см. · ВАЖНО! В случае, если матрас подобран неправильно (более тяжелый или высокий), он может повредить механизм кровати. Это не является гарантийным случаем для замены кровати. 

Кровать Milena поставляется в разобранном виде. Требует дополнительное сборки. Паспорт сборки в комплекте. 

Цена кровати Milena указана без стоимости матраса. Декоративные подушки в стоимость не входят и являются только украшением при визуализации кровати. Экран мобильных устройств и монитора компьютера не всегда могут корректно на 100% передать цвет окончательного изделия. 

Мебельная ткань "велюр" очень часто играет при свете – меняя оттенок от темного до более светлого. Поэтому возможны незначительные цветовые отличия при получении модели.

Гарантия 24 месяца.`
};

export default function ProductPage({ params }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(mockProduct.colors[0]);
  const [selectedSize, setSelectedSize] = useState(mockProduct.sizes[0]);

  const breadcrumbs = [
    { text: 'Главная', href: '/' },
    { text: 'Диваны', href: '/categories/sofas' },
    { text: 'Все диваны', href: '/categories/sofas/all' },
    { text: mockProduct.name, href: `/product/${mockProduct.id}` }
  ];

  return (
    <main className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />
      
      <div className={styles.product}>
      <div className={styles.product__header}>
        <div className={styles.product__infos}>
            <h1 className={styles.product__title}>{mockProduct.name} {mockProduct.isBestseller && (
              <div className={styles.product__bestseller}>Бестселлер</div>
            )}</h1>
          
          <div className={styles.product__rating}>
            <div className={styles.product__stars}>
              {[...Array(5)].map((_, index) => (
                <svg 
                  key={index}
                  width="15" 
                  height="14" 
                  viewBox="0 0 15 14" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M7.5 0L9.18386 5.18237H14.6329L10.2245 8.38525L11.9084 13.5676L7.5 10.3647L3.09161 13.5676L4.77547 8.38525L0.367076 5.18237H5.81614L7.5 0Z" 
                    fill={index < mockProduct.rating ? "#A45B38" : "#E5E5E5"} 
                  />
                </svg>
              ))}
            </div>
            <span className={styles.product__reviews}>{mockProduct.reviewsCount} Отзывов</span>
          </div>
          
          <p className={styles.product__article}>Артикул: {mockProduct.article}</p>
          
          <div className={styles.product__price}>{mockProduct.price} ₽</div>
          </div>
          </div>
        <div className={styles.product__gallery}>
          <div className={styles.product__thumbnails}>
            {mockProduct.images.map((image, index) => (
              <button
                key={index}
                className={`${styles.product__thumbnail} ${selectedImage === index ? styles.product__thumbnail_active : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`${mockProduct.name} - фото ${index + 1}`}
                  width={80}
                  height={80}
                />
              </button>
            ))}
          </div>
          
          <div className={styles.product__main_image}>
            <Image
              src={mockProduct.images[selectedImage]}
              alt={mockProduct.name}
              width={600}
              height={600}
              priority
            />
          </div>
        </div>
        
        <div className={styles.product__info}>
          <div className={styles.product__header}>
            <h1 className={styles.product__title}>{mockProduct.name} {mockProduct.isBestseller && (
              <div className={styles.product__bestseller}>Бестселлер</div>
            )}</h1>
          </div>
          
          <div className={styles.product__rating}>
            <div className={styles.product__stars}>
              {[...Array(5)].map((_, index) => (
                <svg 
                  key={index}
                  width="15" 
                  height="14" 
                  viewBox="0 0 15 14" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M7.5 0L9.18386 5.18237H14.6329L10.2245 8.38525L11.9084 13.5676L7.5 10.3647L3.09161 13.5676L4.77547 8.38525L0.367076 5.18237H5.81614L7.5 0Z" 
                    fill={index < mockProduct.rating ? "#A45B38" : "#E5E5E5"} 
                  />
                </svg>
              ))}
            </div>
            <span className={styles.product__reviews}>{mockProduct.reviewsCount} Отзывов</span>
          </div>
          
          <p className={styles.product__article}>Артикул: {mockProduct.article}</p>
          
          <div className={styles.product__price}>{mockProduct.price} ₽</div>
          
          <div className={styles.product__colors}>
            <h3 className={styles.product__section_title}>Цвет: <span className={styles.product__color_name}>{selectedColor.name}</span></h3>
            <div className={styles.product__colors_list}>
              {mockProduct.colors.map((color, index) => (
                <button
                  key={index}
                  className={`${styles.product__color} ${selectedColor.name === color.name ? styles.product__color_active : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                />
              ))}
            </div>
            
          </div>
          
          <div className={styles.product__sizes}>
            <h3 className={styles.product__section_title}>Размеры(ШхВхГ): <span className={styles.product__size_name}>{selectedSize}</span></h3>
            <div className={styles.product__sizes_list}>
              {mockProduct.sizes.map((size, index) => (
                <button
                  key={index}
                  className={`${styles.product__size} ${selectedSize === size ? styles.product__size_active : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.product__details}>
            <div className={styles.product__detail}>
              <span className={styles.product__detail_label}>Сроки изготовления:</span>
              <span className={styles.product__detail_value}>{mockProduct.manufacturingTime}</span>
            </div>
            
            <div className={styles.product__detail}>
              <span className={styles.product__detail_label}>Вес: </span>
              <span className={styles.product__detail_value}>{mockProduct.weight}</span>
            </div>
            
            <div className={styles.product__detail}>
              <span className={styles.product__detail_label}>Материал: </span>
              <span className={styles.product__detail_value}>{mockProduct.material}</span>
            </div>
            
            <div className={styles.product__detail}>
              <span className={styles.product__detail_label}>Страна: </span>
              <span className={styles.product__detail_value}>{mockProduct.country}</span>
            </div>
            
            <div className={styles.product__detail}>
              <span className={styles.product__detail_label}>Доставка: </span>
              <span className={styles.product__detail_value}>{mockProduct.delivery}</span>
            </div>
          </div>
          
          <div className={styles.product__actions}>
            <button className={styles.product__cart_button}>
              В корзину
              <svg width="31" height="12" viewBox="0 0 31 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30.5303 6.53033C30.8232 6.23744 30.8232 5.76256 30.5303 5.46967L25.7574 0.696699C25.4645 0.403806 24.9896 0.403806 24.6967 0.696699C24.4038 0.989593 24.4038 1.46447 24.6967 1.75736L28.9393 6L24.6967 10.2426C24.4038 10.5355 24.4038 11.0104 24.6967 11.3033C24.9896 11.5962 25.4645 11.5962 25.7574 11.3033L30.5303 6.53033ZM0 6.75H30V5.25H0V6.75Z" fill="#C1A286"/>
              </svg>
            </button>
            <button className={styles.product__favorite_button}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M32.1408 21.075C33.3193 19.878 33.9739 18.2619 33.9608 16.5822C33.9477 14.9025 33.2678 13.2968 32.0708 12.1184C31.4781 11.5348 30.7763 11.0738 30.0054 10.7615C29.2345 10.4492 28.4097 10.2919 27.578 10.2984C25.8983 10.3115 24.2926 10.9913 23.1142 12.1884C22.7942 12.5084 22.3875 12.9011 21.8942 13.3667L20.5225 14.6584L19.1508 13.3667C18.6564 12.9 18.2492 12.5072 17.9292 12.1884C16.7414 11.0006 15.1305 10.3334 13.4508 10.3334C11.7711 10.3334 10.1602 11.0006 8.97249 12.1884C6.52582 14.6367 6.49749 18.595 8.88249 21.055L20.5225 32.695L32.1408 21.075ZM7.55749 10.775C8.33134 10.001 9.2501 9.38694 10.2613 8.96801C11.2725 8.54908 12.3563 8.33346 13.4508 8.33346C14.5454 8.33346 15.6292 8.54908 16.6404 8.96801C17.6515 9.38694 18.5703 10.001 19.3442 10.775C19.6475 11.0795 20.0403 11.4583 20.5225 11.9117C21.0025 11.4583 21.3953 11.0789 21.7008 10.7734C23.2517 9.19863 25.3646 8.30448 27.5747 8.2876C29.7848 8.27072 31.9111 9.1325 33.4858 10.6834C35.0605 12.2342 35.9547 14.3471 35.9716 16.5572C35.9885 18.7673 35.1267 20.8936 33.5758 22.4684L21.7008 34.345C21.3883 34.6575 20.9644 34.833 20.5225 34.833C20.0805 34.833 19.6567 34.6575 19.3442 34.345L7.46582 22.4667C5.94256 20.8957 5.09834 18.7886 5.11549 16.6004C5.13264 14.4122 6.00978 12.3186 7.55749 10.7717V10.775Z" fill="#323433"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.product__description}>
        <h2 className={styles.product__description_title}>Информация о товаре</h2>
        <div className={styles.product__description_content}>
          {mockProduct.description.split('\n\n').map((paragraph, index) => (
            <p key={index} className={styles.product__description_paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <Reviews hasReviews={true } />
    </main>
  );
} 