'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import { useCart } from '../app/components/CartContext';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  
  // Рассчитываем цену со скидкой, если она есть
  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice = product.price;
  const discountedPrice = hasDiscount 
    ? Math.round(parseInt(product.price.replace(/\s/g, '')) * (1 - product.discount / 100)).toLocaleString('ru-RU')
    : null;

  // Функция для добавления товара в корзину
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Преобразуем цену из строки в число (удаляем пробелы и знаки валюты)
    const price = hasDiscount 
      ? parseInt(discountedPrice.replace(/\s/g, ''))
      : parseInt(originalPrice.replace(/\s/g, ''));
      
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: price,
      image: product.image,
      color: product.colors[0]?.name || 'Стандартный',
      material: product.materials[0] || 'Не указан',
      dimensions: product.sizes[0] || 'Стандарт',
      rating: 4,  // Значение по умолчанию, если отсутствует
      reviews: 0, // Значение по умолчанию, если отсутствует
      quantity: 1 // Начальное количество
    };
    
    addToCart(productToAdd);
    setIsAdded(true);
    
    // Сбрасываем состояние через 2 секунды
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className={styles.card}>
      {product.isBestseller && (
        <div className={styles.card__bestseller}>Бестселлер</div>
      )}
      
      <Link href={`/product/${product.id}`} className={styles.card__link}>
        <div 
          className={styles.card__image}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`${styles.card__image_container} ${isHovered ? styles.card__image_container_hover : ''}`}>
            <Image
              src={product.image}
              alt={product.name}
              width={398}
              height={320}
              priority
              className={styles.card__image_main}
            />
            {product.hoverImage && (
              <Image
                src={product.hoverImage}
                alt={`${product.name} - вид 2`}
                width={398}
                height={320}
                priority
                className={styles.card__image_hover}
              />
            )}
          </div>
          <button className={styles.card__favorite}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="white" stroke="#1A1A1A"/>
            </svg>
          </button>
          
          {/* Иконка корзины для мобильной версии */}
          <button 
            className={`${styles.card__cart_icon} ${isAdded ? styles.added : ''}`} 
            onClick={handleAddToCart}
            aria-label="Добавить в корзину"
          >
            {isAdded ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="white"/>
              </svg>
            )}
          </button>
        </div>
      </Link>
      
      <div className={styles.card__content}>
        <Link href={`/product/${product.id}`} className={styles.card__title_link}>
          <h3 className={styles.card__title}>{product.name}</h3>
        </Link>
        
        <p className={styles.card__article}>Артикул: {product.article}</p>
        
        <div className={styles.card__price_container}>
          {hasDiscount ? (
            <>
              <p className={styles.card__price_original}>{originalPrice} ₽</p>
              <p className={styles.card__price_discounted}>{discountedPrice} ₽</p>
            </>
          ) : (
            <p className={styles.card__price}>{originalPrice} ₽</p>
          )}
        </div>
        
        <div className={styles.card__sizes}>
          <h4 className={styles.card__section_title}>Размеры:   {product.sizes.map((size, index) => (
              <span key={index} className={styles.card__size}>{size}</span>
            ))}
          </h4>
        </div>
        
        <div className={styles.card__materials}>
          <h4 className={styles.card__section_title}>Материал:    {product.materials.map((material, index) => (
              <span key={index} className={styles.card__material}>{material}</span>
            ))}</h4>
        </div>
        
        <div className={styles.card__colors}>
          <div className={styles.card__colors_preview}>
            {product.colors.slice(0, 4).map((color, index) => (
              <div 
                key={index} 
                className={styles.card__color}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <div className={styles.card__color_more}>+{product.colors.length - 4}</div>
            )}
          </div>
        </div>
        
        <button className={`${styles.card__button} ${isAdded ? styles.added : ''}`} onClick={handleAddToCart}>
          <span className={styles.card__button_text}>В корзину</span>
          <span className={styles.card__button_arrow}>
            <svg width="31" height="13" viewBox="0 0 31 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30.5303 7.03033C30.8232 6.73744 30.8232 6.26256 30.5303 5.96967L25.7574 1.1967C25.4645 0.903806 24.9896 0.903806 24.6967 1.1967C24.4038 1.48959 24.4038 1.96447 24.6967 2.25736L28.9393 6.5L24.6967 10.7426C24.4038 11.0355 24.4038 11.5104 24.6967 11.8033C24.9896 12.0962 25.4645 12.0962 25.7574 11.8033L30.5303 7.03033ZM0 7.25H30V5.75H0V7.25Z" fill="#C1A286" />
            </svg>
          </span>
          {!isAdded ? (
            <img className={styles.card__button_icon} src="/cards.svg" alt="Добавить в корзину" />
          ) : (
            <svg className={styles.card__button_check} width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5.5L5 9.5L13 1.5" stroke="#C1A286" strokeWidth="1" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
} 