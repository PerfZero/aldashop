'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import { useCart } from '../app/components/CartContext';
import { useFavourites } from '../contexts/FavouritesContext';

export default function ProductCard({ product, filtersOpen = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
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
      id: productData.id,
      modelId: product.id,
      name: product.title,
      description: productData.short_description || product.description || 'Съемные чехлы, можно стирать в стиральной машине',
      price: productData.price || 0,
      discountedPrice: productData.discounted_price,
      image: mainPhoto?.photo ? (mainPhoto.photo.startsWith('http') ? mainPhoto.photo : `https://aldalinde.ru${mainPhoto.photo}`) : '/placeholder.jpg',
      hoverImage: hoverPhoto?.photo ? (hoverPhoto.photo.startsWith('http') ? hoverPhoto.photo : `https://aldalinde.ru${hoverPhoto.photo}`) : null,
      inStock: productData.in_stock !== undefined ? productData.in_stock : true,
      isBestseller: productData.bestseller || product.is_bestseller || false,
      available_colors: product.available_colors || [],
      photos: productData.photos || []
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    setTouchStart(touch.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    setTouchEnd(touch.clientX);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && currentImageIndex < currentProduct.photos.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleColorChange = async (color) => {
    setSelectedColor({ name: color.title || 'Цвет', hex: `#${color.code_hex}` });
    setCurrentImageIndex(0);
    
    const modelId = product.id;
    if (!modelId) {
      console.log('Нет model_id для запроса');
      return;
    }
    
    setIsLoading(true);
    try {
      const requestBody = {
        model_id: product.id,
        color_id: color.id,
      };
      
      console.log('Отправляем запрос на смену цвета:', requestBody, 'Model ID:', product.id);
      
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Ответ сервера:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Полученные данные:', data);
        
        if (data && data.id) {
          const mainPhoto = data.photos?.find(p => p.main_photo) || data.photos?.[0];
          const hoverPhoto = data.photos?.find(p => !p.main_photo) || data.photos?.[1];
          
          setCurrentProduct(prev => {
            const newImage = mainPhoto?.photo ? (mainPhoto.photo.startsWith('http') ? mainPhoto.photo : `https://aldalinde.ru${mainPhoto.photo}`) : prev.image;
            const newHoverImage = hoverPhoto?.photo ? (hoverPhoto.photo.startsWith('http') ? hoverPhoto.photo : `https://aldalinde.ru${hoverPhoto.photo}`) : prev.hoverImage;
            
            const newProduct = {
              ...prev,
              id: data.id,
              price: data.price || 0,
              discountedPrice: data.discounted_price,
              image: newImage,
              hoverImage: newHoverImage,
              inStock: data.in_stock !== undefined ? data.in_stock : prev.inStock,
              photos: data.photos || []
            };
            
            console.log('Товар обновлен:', data.id, data.price, 'Старый ID:', prev.id, 'Новый ID:', newProduct.id);
            console.log('Изображения:', { oldImage: prev.image, newImage, oldHover: prev.hoverImage, newHover: newHoverImage });
            
            if (prev.id === newProduct.id && prev.price === newProduct.price && prev.image === newImage) {
              console.log('Данные не изменились, пропускаем обновление');
              return prev;
            }
            
            return newProduct;
          });
        } else {
          console.log('Получены пустые данные или нет ID');
        }
      } else {
        const errorText = await response.text();
        console.error('Ошибка ответа сервера:', response.status, errorText);
      }
    } catch (error) {
      console.error('Ошибка при смене цвета:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const price = currentProduct.discountedPrice || currentProduct.price;
    const productId = currentProduct.id;
    
    const productToAdd = {
      id: productId,
      name: currentProduct.name,
      price: price,
      image: currentProduct.image,
      color: selectedColor.name || 'Стандартный',
      quantity: 1
    };
    
    console.log('Добавляем в корзину:', productToAdd);
    await addToCart(productToAdd);
    setIsAdded(true);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleToggleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = currentProduct.id;
    
    const productToToggle = {
      id: productId,
      name: currentProduct.name,
      price: currentProduct.discountedPrice || currentProduct.price,
      image: currentProduct.image,
      color: selectedColor.name || 'Стандартный',
      inStock: currentProduct.inStock,
      isBestseller: currentProduct.isBestseller,
    };
    
    console.log('Переключаем избранное:', productToToggle);
    await toggleFavourite(productToToggle);
  };

  const hasDiscount = currentProduct.discountedPrice && currentProduct.discountedPrice !== null && currentProduct.discountedPrice > currentProduct.price;

  return (
    <div className={styles.card}>
      {currentProduct.isBestseller && (
        <div className={styles.card__bestseller}>Bestseller</div>
      )}
      {hasDiscount && (
        <div className={styles.card__sale}>Sale</div>
      )}
      
      <Link href={`/product/${currentProduct.id}`} className={styles.card__link}>
        <div 
          className={`${styles.card__image} ${filtersOpen ? styles.card__image_filters_open : ''}`}
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={`${styles.card__image_container} ${isHovered && !isMobile ? styles.card__image_container_hover : ''}`}>
            {isMobile ? (
              <Image
                src={currentProduct.photos[currentImageIndex]?.photo ? 
                  (currentProduct.photos[currentImageIndex].photo.startsWith('http') ? 
                    currentProduct.photos[currentImageIndex].photo : 
                    `https://aldalinde.ru${currentProduct.photos[currentImageIndex].photo}`) : 
                  currentProduct.image}
                alt={currentProduct.name || product.title || 'Товар'}
                width={398}
                height={320}
                priority
                className={styles.card__image_main}
              />
            ) : (
              <>
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
              </>
            )}
          </div>
          
          {isMobile && currentProduct.photos.length > 1 && (
            <div className={styles.card__pagination}>
              {currentProduct.photos.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.card__pagination_dot} ${index === currentImageIndex ? styles.card__pagination_dot_active : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          )}
          <button 
            className={`${styles.card__favorite} ${isFavourite(currentProduct.id) ? styles.card__favorite_active : ''}`}
            onClick={handleToggleFavourite}
            aria-label={isFavourite(currentProduct.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M3.80638 6.20641C4.70651 5.30655 5.92719 4.80104 7.19998 4.80104C8.47276 4.80104 9.69344 5.30655 10.5936 6.20641L12 7.61161L13.4064 6.20641C13.8492 5.74796 14.3788 5.38229 14.9644 5.13072C15.5501 4.87916 16.1799 4.74675 16.8172 4.74121C17.4546 4.72567 18.0866 4.85712 18.6766 5.09847C19.2665 5.33982 19.8024 5.69623 20.2531 6.14691C20.7038 6.5976 21.0602 7.13253 21.3015 7.72343C21.5429 8.31333 21.6643 8.9454 21.6588 9.58274C21.6532 10.2201 21.5208 10.8499 21.2693 11.4256C21.0177 12.0212 20.652 12.5508 20.1936 12.9936L12 21.1884L3.80638 12.9936C2.90651 12.0925 2.401 10.8728 2.401 9.60001C2.401 8.32722 2.90651 7.10654 3.80638 6.20641V6.20641Z" stroke="#323433" stroke-width="1.5" stroke-linejoin="round"/>
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
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.25 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="white"/>
              </svg>
            )}
          </button>
        </div>
      </Link>
      
      <div className={styles.card__content}>
        <Link href={`/product/${currentProduct.id}`} className={styles.card__title_link}>
          <h3 className={styles.card__title}>
            {currentProduct.name || product.title || product.name}
            {selectedColor.name && (
              <span className={styles.card__title_color}>  {selectedColor.name}</span>
            )}
          </h3>
        </Link>
        
        <p className={styles.card__description}>{currentProduct.description}</p>
        
        <div className={styles.card__price_container}>
          {hasDiscount ? (
            <>
              <p className={styles.card__price_discounted}>{currentProduct.discountedPrice?.toLocaleString('ru-RU')} ₽</p>
              <p className={styles.card__price_original}>{currentProduct.price?.toLocaleString('ru-RU')} ₽</p>
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
                  className={`${styles.card__color} ${selectedColor.hex === `#${color.code_hex}` ? styles.card__color_selected : ''} ${isLoading ? styles.card__color_loading : ''}`}
                  style={{ backgroundColor: `#${color.code_hex}` }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Клик по цвету:', color);
                    handleColorChange(color);
                  }}
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