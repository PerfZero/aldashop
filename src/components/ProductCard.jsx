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
  const [selectedSize, setSelectedSize] = useState(product.available_sizes?.[0]?.value || '');
  const [selectedColor, setSelectedColor] = useState(product.available_colors?.[0] ? {
    name: product.available_colors[0].title,
    hex: `#${product.available_colors[0].code_hex}`
  } : {});
  const [selectedMaterial, setSelectedMaterial] = useState(product.available_materials?.[0]?.title || '');
  const [currentProduct, setCurrentProduct] = useState(product);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();
  
  const fetchProductDetails = async (sizeId, colorId, materialId) => {
    setIsLoading(true);
    try {
      const requestBody = {
        model_id: product.id,
        size_id: sizeId,
        color_id: colorId,
        material_id: materialId,
      };
      
      console.log('🔍 [ProductCard] Fetching details for:', requestBody);
      
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ProductCard] API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ [ProductCard] Received data:', data);
      
      if (data.error) {
        console.error('❌ [ProductCard] API error:', data.error);
        return;
      }
      
      if (data) {
        const productData = data;
        const mainPhoto = productData.photos?.find(p => p.main_photo) || productData.photos?.[0];
        const secondaryPhoto = productData.photos?.find(p => !p.main_photo) || productData.photos?.[1];
        
        setCurrentProduct({
          ...product,
          id: productData.id || product.id, // Обновляем ID товара
          name: productData.title || product.name,
          price: productData.price || product.price,
          discountedPrice: productData.discounted_price,
          image: mainPhoto?.photo || product.image,
          hoverImage: secondaryPhoto?.photo || product.hoverImage,
          inStock: productData.in_stock,
          available_sizes: productData.available_sizes || product.available_sizes,
          available_colors: productData.available_colors || product.available_colors,
          available_materials: productData.available_materials || product.available_materials,
        });
      }
    } catch (error) {
      console.error('❌ [ProductCard] Error fetching product details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size.value);
    const colorObj = currentProduct.available_colors?.find(c => c.code_hex === selectedColor.hex?.replace('#', ''));
    const materialObj = currentProduct.available_materials?.find(m => m.title === selectedMaterial);
    
    if (colorObj && materialObj) {
      fetchProductDetails(size.id, colorObj.id, materialObj.id);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor({ name: color.title || 'Цвет', hex: `#${color.code_hex}` });
    const sizeObj = currentProduct.available_sizes?.find(s => s.value === selectedSize);
    const materialObj = currentProduct.available_materials?.find(m => m.title === selectedMaterial);
    
    if (sizeObj && materialObj) {
      fetchProductDetails(sizeObj.id, color.id, materialObj.id);
    }
  };

  const handleMaterialChange = (material) => {
    setSelectedMaterial(material.title);
    const sizeObj = currentProduct.available_sizes?.find(s => s.value === selectedSize);
    const colorObj = currentProduct.available_colors?.find(c => c.code_hex === selectedColor.hex?.replace('#', ''));
    
    if (sizeObj && colorObj) {
      fetchProductDetails(sizeObj.id, colorObj.id, material.id);
    }
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
      material: selectedMaterial || 'Не указан',
      dimensions: selectedSize || 'Стандарт',
      rating: 4,
      reviews: 0,
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
      material: selectedMaterial || 'Не указан',
      dimensions: selectedSize || 'Стандарт',
      inStock: currentProduct.inStock,
      isBestseller: currentProduct.isBestseller,
    };
    
    await toggleFavourite(productToToggle);
  };

  const hasDiscount = currentProduct.discountedPrice && currentProduct.price > currentProduct.discountedPrice;
  const originalPrice = currentProduct.price?.toLocaleString('ru-RU');
  const discountedPrice = currentProduct.discountedPrice?.toLocaleString('ru-RU');

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
              alt={currentProduct.name}
              width={398}
              height={320}
              priority
              className={styles.card__image_main}
            />
            {currentProduct.hoverImage && (
              <Image
                src={currentProduct.hoverImage}
                alt={`${currentProduct.name} - вид 2`}
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
          <h3 className={styles.card__title}>{currentProduct.name}</h3>
        </Link>
        
        <p className={styles.card__article}>Артикул: {currentProduct.article}</p>
        
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
        
        {currentProduct.available_sizes && currentProduct.available_sizes.length > 0 && (
          <div className={styles.card__sizes}>
            <h4 className={styles.card__section_title}>Размеры:</h4>
            <div className={styles.card__options}>
              {currentProduct.available_sizes.map((size) => (
                <button
                  key={size.id}
                  className={`${styles.card__option} ${selectedSize === size.value ? styles.card__option_selected : ''}`}
                  onClick={() => handleSizeChange(size)}
                  disabled={isLoading}
                >
                  {size.value}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {currentProduct.available_materials && currentProduct.available_materials.length > 0 && (
          <div className={styles.card__materials}>
            <h4 className={styles.card__section_title}>Материалы:</h4>
            <div className={styles.card__options}>
              {currentProduct.available_materials.map((material) => (
                <button
                  key={material.id}
                  className={`${styles.card__option} ${selectedMaterial === material.title ? styles.card__option_selected : ''}`}
                  onClick={() => handleMaterialChange(material)}
                  disabled={isLoading}
                >
                  {material.title}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {currentProduct.available_colors && currentProduct.available_colors.length > 0 && (
          <div className={styles.card__colors}>
            <h4 className={styles.card__section_title}>Цвета:</h4>
            <div className={styles.card__colors_preview}>
              {currentProduct.available_colors.slice(0, 4).map((color) => (
                <button
                  key={color.id}
                  className={`${styles.card__color} ${selectedColor.hex === `#${color.code_hex}` ? styles.card__color_selected : ''}`}
                  style={{ backgroundColor: `#${color.code_hex}` }}
                  onClick={() => handleColorChange(color)}
                  disabled={isLoading}
                  title={color.title || 'Цвет'}
                />
              ))}
              {currentProduct.available_colors.length > 4 && (
                <div className={styles.card__color_more}>+{currentProduct.available_colors.length - 4}</div>
              )}
            </div>
          </div>
        )}
        
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