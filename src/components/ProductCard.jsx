'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import { useCart } from '../app/components/CartContext';
import { useFavourites } from '../contexts/FavouritesContext';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(() => {
    if (product.product?.color) {
      return {
        name: product.product.color.title,
        hex: `#${product.product.color.code_hex}`
      };
    }
    if (product.available_colors?.[0]) {
      return {
        name: product.available_colors[0].title,
        hex: `#${product.available_colors[0].code_hex}`
      };
    }
    return {};
  });
  const [currentProduct, setCurrentProduct] = useState(() => {
    const productData = product.product || {};
    const mainPhoto = productData.photos?.find(p => p.main_photo) || productData.photos?.[0];
    const hoverPhoto = productData.photos?.find(p => !p.main_photo) || productData.photos?.[1];
    
    return {
      id: productData.id || product.id,
      modelId: product.id,
      name: product.title,
      description: productData.short_description || product.description || 'Съемные чехлы, можно стирать в стиральной машине',
      price: productData.price || 0,
      discountedPrice: productData.discounted_price,
      image: mainPhoto?.photo ? (mainPhoto.photo.startsWith('http') ? mainPhoto.photo : `https://aldalinde.ru${mainPhoto.photo}`) : '/placeholder.jpg',
      hoverImage: hoverPhoto?.photo ? (hoverPhoto.photo.startsWith('http') ? hoverPhoto.photo : `https://aldalinde.ru${hoverPhoto.photo}`) : null,
      inStock: productData.in_stock !== undefined ? productData.in_stock : true,
      isBestseller: productData.bestseller || false,
      available_colors: product.available_colors || []
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();

  const handleColorChange = (color) => {
    setSelectedColor({ name: color.title || 'Цвет', hex: `#${color.code_hex}` });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const price = currentProduct.discountedPrice || currentProduct.price;
    
    const productToAdd = {
      id: currentProduct.id,
      name: currentProduct.name,
      price: price,
      image: currentProduct.image,
      color: selectedColor.name || 'Стандартный',
      quantity: 1
    };
    
    await addToCart(productToAdd);
    setIsAdded(true);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleToggleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productToToggle = {
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.discountedPrice || currentProduct.price,
      image: currentProduct.image,
      color: selectedColor.name || 'Стандартный',
      inStock: currentProduct.inStock,
      isBestseller: currentProduct.isBestseller,
    };
    
    await toggleFavourite(productToToggle);
  };

  const hasDiscount = currentProduct.discountedPrice && currentProduct.discountedPrice !== null && currentProduct.price > currentProduct.discountedPrice;

  return (
    <div className={styles.card}>
      {currentProduct.isBestseller && (
        <div className={styles.card__bestseller}>Бестселлер</div>
      )}
      
      <Link href={`/product/${currentProduct.id}`} className={styles.card__link}>
        <div 
          className={styles.card__image}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`${styles.card__image_container} ${isHovered ? styles.card__image_container_hover : ''}`}>
            <Image
              src={currentProduct.image}
              alt={currentProduct.name || product.title || 'Товар'}
              width={398}
              height={320}
              priority
              className={styles.card__image_main}
            />
            {currentProduct.hoverImage && (
              <Image
                src={currentProduct.hoverImage}
                alt={`${currentProduct.name || product.title || 'Товар'} - вид 2`}
                width={398}
                height={320}
                priority
                className={styles.card__image_hover}
              />
            )}
          </div>
          <button 
            className={`${styles.card__favorite} ${isFavourite(currentProduct.id) ? styles.card__favorite_active : ''}`}
            onClick={handleToggleFavourite}
            aria-label={isFavourite(currentProduct.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" 
                fill={isFavourite(currentProduct.id) ? "#C1AF86" : "white"} 
                stroke="#C1AF86"
              />
            </svg>
          </button>
          
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
        <Link href={`/product/${currentProduct.id}`} className={styles.card__title_link}>
          <h3 className={styles.card__title}>{currentProduct.name || product.title || product.name}</h3>
        </Link>
        
        <p className={styles.card__description}>{currentProduct.description}</p>
        
        <div className={styles.card__price_container}>
          {hasDiscount ? (
            <>
              <p className={styles.card__price_original}>{currentProduct.discountedPrice?.toLocaleString('ru-RU')} ₽</p>
              <p className={styles.card__price_discounted}>{currentProduct.price?.toLocaleString('ru-RU')} ₽</p>
            </>
          ) : (
            <p className={styles.card__price}>{currentProduct.price?.toLocaleString('ru-RU')} ₽</p>
          )}
        </div>
        
        {currentProduct.available_colors && currentProduct.available_colors.length > 0 && (
          <div className={styles.card__colors}>
            <div className={styles.card__colors_preview}>
              {currentProduct.available_colors.slice(0, 6).map((color) => (
                <button
                  key={color.id}
                  className={`${styles.card__color} ${selectedColor.hex === `#${color.code_hex}` ? styles.card__color_selected : ''}`}
                  style={{ backgroundColor: `#${color.code_hex}` }}
                  onClick={() => handleColorChange(color)}
                  disabled={isLoading}
                  title={color.title || 'Цвет'}
                />
              ))}
              {currentProduct.available_colors.length > 6 && (
                <div className={styles.card__color_more}>+{currentProduct.available_colors.length - 6}</div>
              )}
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
} 