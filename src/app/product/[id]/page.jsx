'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import styles from './page.module.css';
import Reviews from '@/components/Reviews';
import { useCart } from '../../components/CartContext';
import { useFavourites } from '../../../contexts/FavouritesContext';
import ProductSkeleton from './ProductSkeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';


export default function ProductPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [showMaterialInfo, setShowMaterialInfo] = useState(true);
  const [showProductInfo, setShowProductInfo] = useState(true);
  const [isChangingOptions, setIsChangingOptions] = useState(false);
  const { addToCart, cartItems } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();



  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetails();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (thumbsSwiper) {
      const thumbnails = document.querySelectorAll(`.${styles.product__thumbnail}`);
      thumbnails.forEach((thumb, index) => {
        if (index === 0) {
          thumb.classList.add('active');
        } else {
          thumb.classList.remove('active');
        }
      });
    }
  }, [thumbsSwiper, styles.product__thumbnail]);

  useEffect(() => {
    if (product && mainSwiper && thumbsSwiper) {
      setTimeout(() => {
        mainSwiper.slideTo(0);
        thumbsSwiper.slideTo(0);
        setActiveThumbIndex(0);
        
        const thumbnails = document.querySelectorAll(`.${styles.product__thumbnail}`);
        thumbnails.forEach((thumb, index) => {
          if (index === 0) {
            thumb.classList.add('active');
          } else {
            thumb.classList.remove('active');
          }
        });
      }, 50);
    }
  }, [product?.id, mainSwiper, thumbsSwiper]);

  const fetchProductDetails = async (productId = null, sizeId = null, colorId = null) => {
    try {
      setLoading(true);
      
      // Если это первая загрузка, получаем товар по product_id
      if (!modelId && !sizeId && !colorId) {
        const response = await fetch('/api/products/product-page/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('accessToken') && {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }),
          },
          credentials: 'include',
          body: JSON.stringify({
            product_id: parseInt(productId || resolvedParams.id),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setProduct(data);
        
        // Сохраняем model_id из ответа для дальнейших запросов
        const actualModelId = data.model_id || data.model?.id || data.id;
        setModelId(actualModelId);
        
        // Устанавливаем начальные опции
        if (data.color) {
          setSelectedColor(data.color);
        } else if (data.available_colors?.length > 0) {
          setSelectedColor(data.available_colors[0]);
        }
        
        if (data.sizes && data.available_sizes) {
          const matchingSize = data.available_sizes.find(s => s.id === data.sizes.id);
          setSelectedSize(matchingSize || data.available_sizes[0]);
        } else if (data.available_sizes?.length > 0) {
          setSelectedSize(data.available_sizes[0]);
        }
        
        if (data.material) {
          setSelectedMaterial(data.material);
        } else if (data.available_materials?.length > 0) {
          setSelectedMaterial(data.available_materials[0]);
        }
        
        return;
      }
      
      // Для изменения опций используем product-detail с сохраненным modelId
      const requestBody = {
        model_id: modelId,
        ...(sizeId && { size_id: sizeId }),
        ...(colorId && { color_id: colorId }),
      };
      
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('accessToken') && {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }),
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      // console.log('Response status:', response.status);
      // console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        // console.log('ОШИБКА 400 - Полный ответ сервера:', errorText);
        // console.log('ОШИБКА 400 - Статус:', response.status);
        // console.log('ОШИБКА 400 - Отправленные данные:', requestBody);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const responseText = await response.text();
      // console.log('Сырой ответ от сервера:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        // console.log('Распарсенные данные:', data);
      } catch (parseError) {
        // console.log('ОШИБКА парсинга JSON:', parseError);
        // console.log('Сырой текст который не удалось распарсить:', responseText);
        throw new Error('Invalid JSON response');
      }

      if (data.error) {
        // console.log('Ошибка в данных:', data.error);
        throw new Error(data.error);
      }

      setProduct(data);
        
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetailsByOptions = async (sizeId, colorId) => {
    try {
      setLoading(true);
      const requestBody = {
        model_id: modelId,
        ...(sizeId && { size_id: sizeId }),
        ...(colorId && { color_id: colorId }),
      };
      // console.log('Отправляем запрос на прямой API:', requestBody);
      
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('accessToken') && {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }),
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      // console.log('Response status:', response.status);
      // console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        // console.log('Ошибка ответа:', response.status, errorText);
        // console.log('Full error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      // console.log('Response data:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      // Добавляем базовый URL к фотографиям только если они относительные
      if (data.photos && Array.isArray(data.photos)) {
        data.photos = data.photos.map(photo => ({
          ...photo,
          photo: photo.photo.startsWith('http') ? photo.photo : `https://aldalinde.ru${photo.photo}`
        }));
      }
      
      // Добавляем title к размерам
      if (data.available_sizes && Array.isArray(data.available_sizes)) {
        data.available_sizes = data.available_sizes.map(size => ({
          ...size,
          title: size.value
        }));
      }
      

      
      setProduct(data);
      setLoading(false);

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSizeChange = async (size) => {
    setIsChangingOptions(true);
    setSelectedSize(size);
    const requestData = {
      model_id: modelId,
      size_id: size.id,
      color_id: selectedColor?.id,
    };
    
    try {
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(prevProduct => ({
          ...prevProduct,
          ...data
        }));
        
      }
    } catch (error) {
      console.error('Ошибка при получении товара:', error);
    } finally {
      setIsChangingOptions(false);
    }
  };

  const handleColorChange = async (color) => {
    setIsChangingOptions(true);
    setSelectedColor(color);
    const requestData = {
      model_id: modelId,
      size_id: selectedSize?.id,
      color_id: color.id,
    };
    
    try {
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(prevProduct => ({
          ...prevProduct,
          ...data
        }));
      }
    } catch (error) {
      console.error('Ошибка при получении товара:', error);
    } finally {
      setIsChangingOptions(false);
    }
  };

  const handleMaterialChange = async (material) => {
    setIsChangingOptions(true);
    setSelectedMaterial(material);
    const requestData = {
      model_id: modelId,
      size_id: selectedSize?.id,
      color_id: selectedColor?.id,
    };
    
    try {
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(prevProduct => ({
          ...prevProduct,
          ...data
        }));
        
      }
    } catch (error) {
      console.error('Ошибка при получении товара:', error);
    } finally {
      setIsChangingOptions(false);
    }
  };

  // Функция для проверки доступности комбинации опций
  const checkOptionsAvailability = async (sizeId, colorId) => {
    try {
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('accessToken') && {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }),
        },
        credentials: 'include',
        body: JSON.stringify({
          model_id: modelId,
          size_id: sizeId,
          color_id: colorId,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      // Проверяем, совпадают ли запрошенные и полученные опции
      const sizeMatch = !sizeId || data.sizes?.id === sizeId;
      const colorMatch = !colorId || data.color?.id === colorId;
      
      return sizeMatch && colorMatch;
    } catch (error) {
      return false;
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }
    
    const price = product.discounted_price || product.price;
    const mainPhoto = product.photos?.find(photo => photo.main_photo) || product.photos?.[0];
    
    const productToAdd = {
      id: product.id,
      name: product.title,
      price: price,
      image: mainPhoto?.photo || '/sofa.png',
      color: selectedColor?.title || 'Стандартный',
      material: selectedMaterial?.title || 'Не указан',
      dimensions: selectedSize?.title || 'Стандарт',
      rating: 4,
      reviews: 0,
      quantity: 1
    };
    
    try {
      await addToCart(productToAdd);
      
      setProduct(prevProduct => ({
        ...prevProduct,
        in_cart: true
      }));
      
      setIsAdded(true);
      
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
    }
  };

  const handleToggleFavourite = async () => {
    if (!product) return;
    
    const mainPhoto = product.photos?.find(photo => photo.main_photo) || product.photos?.[0];
    const price = product.discounted_price || product.price;
    
    const productToToggle = {
      id: product.id,
      name: product.title,
      price: price,
      image: mainPhoto?.photo || '/sofa.png',
      color: selectedColor?.title || 'Стандартный',
      material: selectedMaterial?.title || 'Не указан',
      dimensions: selectedSize?.title || 'Стандарт',
      inStock: product.in_stock,
      isBestseller: product.bestseller,
    };
    
    try {
      await toggleFavourite(productToToggle);
      
      setProduct(prevProduct => ({
        ...prevProduct,
        in_wishlist: !prevProduct.in_wishlist
      }));
    } catch (error) {
      console.error('Ошибка при изменении избранного:', error);
    }
  };


  if (loading) {
    return <ProductSkeleton />;
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.error}>Ошибка загрузки товара: {error}</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className={styles.page}>
        <div className={styles.error}>Товар не найден</div>
      </main>
    );
  }

  const breadcrumbs = [
    { text: 'Главная', href: '/' }
  ];

  if (product.category) {
    breadcrumbs.push({
      text: product.category.title,
      href: `/categories/${product.category.slug}`
    });
  }

  if (product.subcategory) {
    breadcrumbs.push({
      text: product.subcategory.title,
      href: `/categories/${product.category?.slug}/${product.subcategory.slug}`
    });
  }

  breadcrumbs.push({ text: product.title, href: `/product/${resolvedParams.id}` });


  const hasDiscount = product.discounted_price && product.discounted_price !== null;
  const originalPrice = product.price?.toLocaleString('ru-RU');
  const discountedPrice = product.discounted_price?.toLocaleString('ru-RU');

  return (
    <main className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />
      
      <div className={styles.product}>
        <div className={styles.product__infos}>
          <h1 className={styles.product__title}>
            {product.title} 
            {product.bestseller && (
              <div className={styles.product__bestseller}>Bestseller</div>
            )}
            {hasDiscount && (
              <div className={styles.product__sale}>Sale</div>
            )}

<button 
              className={`${styles.product__favorite_button} ${(isFavourite(product?.id) || product?.in_wishlist) ? styles.product__favorite_button_active : ''}`}
              onClick={handleToggleFavourite}
              aria-label={(isFavourite(product?.id) || product?.in_wishlist) ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.80638 6.20641C4.70651 5.30655 5.92719 4.80104 7.19998 4.80104C8.47276 4.80104 9.69344 5.30655 10.5936 6.20641L12 7.61161L13.4064 6.20641C13.8492 5.74796 14.3788 5.38229 14.9644 5.13072C15.5501 4.87916 16.1799 4.74675 16.8172 4.74121C17.4546 4.73567 18.0866 4.85712 18.6766 5.09847C19.2665 5.33982 19.8024 5.69623 20.2531 6.14691C20.7038 6.5976 21.0602 7.13353 21.3015 7.72343C21.5429 8.31333 21.6643 8.9454 21.6588 9.58274C21.6532 10.2201 21.5208 10.8499 21.2693 11.4356C21.0177 12.0212 20.652 12.5508 20.1936 12.9936L12 21.1884L3.80638 12.9936C2.90651 12.0935 2.401 10.8728 2.401 9.60001C2.401 8.32722 2.90651 7.10654 3.80638 6.20641V6.20641Z" stroke="#323433" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </button>
          </h1>
          
          <div id="rating-gallery" className={styles.product__rating}>
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
                    fill={index < (parseFloat(product.avg_rating) || 0) ? "#A45B38" : "#E5E5E5"} 
                  />
                </svg>
              ))}
            </div>
            <span 
              className={styles.product__reviews}
              onClick={() => document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer' }}
            >
              {product.avg_rating ? `${product.avg_rating.toFixed(1)}` : '0'} ({product.reviews_count || 0} отзывов)
            </span>
          </div>
          
          <div className={styles.product__price}>
            {hasDiscount ? (
              <>
                              <span className={styles.product__price_new}>{discountedPrice} ₽</span>

                <span className={styles.product__price_old}>{originalPrice} ₽</span>
              </>
            ) : (
              <span>{originalPrice} ₽</span>
            )}
          </div>
        </div>

        <div className={styles.product__gallery}>
          {product.photos && product.photos.length > 0 && (
            <>
              <Swiper
                onSwiper={setThumbsSwiper}
                direction={isMobile ? "horizontal" : "vertical"}
                spaceBetween={10}
                slidesPerView="auto"
                freeMode={true}
                watchSlidesProgress={true}
                loop={false}
                modules={[FreeMode, Thumbs]}
                className={styles.product__thumbs_swiper}
              >
                {product.photos.map((photo, index) => (
                  <SwiperSlide key={index}>
                    <div className={styles.product__thumbnail}>
                      <Image
                        src={photo.photo}
                        alt={`${product.title} - фото ${index + 1}`}
                        width={80}
                        height={80}
                        unoptimized={true}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              <Swiper
                onSwiper={setMainSwiper}
                spaceBetween={10}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper }}
                loop={true}
                modules={[Navigation, Thumbs]}
                className={styles.product__main_swiper}
              >
                {product.photos.map((photo, index) => (
                  <SwiperSlide key={index}>
                    <div className={styles.product__main_image}>
                      <Image
                        src={photo.photo}
                        alt={`${product.title} - фото ${index + 1}`}
                        width={600}
                        height={600}
                        unoptimized={true}
                        priority
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </>
          )}
        </div>
        
        <div className={styles.product__info}>
          {isChangingOptions && (
            <div className={styles.product__loader}>
              <div className={styles.product__spinner}></div>
              <span>Обновление товара...</span>
            </div>
          )}
          <div className={styles.product__header}>
            <h1 className={styles.product__title}>
              {product.title} 
             
              {product.bestseller && (
                <div className={styles.product__bestseller}>Bestseller</div>
              )}
              {hasDiscount && (
                <div className={styles.product__bestseller}>Sale</div>
              )}
               <button 
              className={`${styles.product__favorite_button} ${(isFavourite(product?.id) || product?.in_wishlist) ? styles.product__favorite_button_active : ''}`}
              onClick={handleToggleFavourite}
              aria-label={(isFavourite(product?.id) || product?.in_wishlist) ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.80638 6.20641C4.70651 5.30655 5.92719 4.80104 7.19998 4.80104C8.47276 4.80104 9.69344 5.30655 10.5936 6.20641L12 7.61161L13.4064 6.20641C13.8492 5.74796 14.3788 5.38229 14.9644 5.13072C15.5501 4.87916 16.1799 4.74675 16.8172 4.74121C17.4546 4.73567 18.0866 4.85712 18.6766 5.09847C19.2665 5.33982 19.8024 5.69623 20.2531 6.14691C20.7038 6.5976 21.0602 7.13353 21.3015 7.72343C21.5429 8.31333 21.6643 8.9454 21.6588 9.58274C21.6532 10.2201 21.5208 10.8499 21.2693 11.4356C21.0177 12.0212 20.652 12.5508 20.1936 12.9936L12 21.1884L3.80638 12.9936C2.90651 12.0935 2.401 10.8728 2.401 9.60001C2.401 8.32722 2.90651 7.10654 3.80638 6.20641V6.20641Z" stroke="#323433" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </button>
            </h1>
          </div>
          
          <div id="rating" className={styles.product__rating}>
            <div className={styles.product__stars}>
              {[...Array(5)].map((_, index) => (
                <svg 
                  key={index}
                  width="20" 
                  height="20" 
                  viewBox="0 0 15 14" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M7.5 0L9.18386 5.18237H14.6329L10.2245 8.38525L11.9084 13.5676L7.5 10.3647L3.09161 13.5676L4.77547 8.38525L0.367076 5.18237H5.81614L7.5 0Z" 
                    fill={index < (parseFloat(product.avg_rating) || 0) ? "#A45B38" : "#E5E5E5"} 
                  />
                </svg>
              ))}
            </div>
            <span 
              className={styles.product__reviews}
              onClick={() => document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer' }}
            >
              {product.avg_rating ? `${product.avg_rating.toFixed(1)}` : '0'} ({product.reviews_count || 0} отзывов)
            </span>
          </div>
          
          <p className={styles.product__article}>Артикул: {product.generated_article}</p>
          
          <div className={styles.product__price}>
            {hasDiscount ? (
              <>
                              <span className={styles.product__price_new}>{discountedPrice} ₽</span>

                <span className={styles.product__price_old}>{originalPrice} ₽</span>
              </>
            ) : (
              <span>{originalPrice} ₽</span>
            )}
          </div>
          
          {product.available_colors && product.available_colors.length > 0 && (
            <div className={styles.product__colors}>
              <h3 className={styles.product__section_title}>
                Цвет: <span className={styles.product__color_name}>{selectedColor?.title}</span>
              </h3>
              <div className={styles.product__colors_list}>
                                 {product.available_colors.map((color) => (
                   <button
                     key={color.id}
                     className={`${styles.product__color} ${selectedColor?.id === color.id ? styles.product__color_active : ''}`}
                     style={{ backgroundColor: `#${color.code_hex}` }}
                     onClick={() => handleColorChange(color)}
                     title={color.title}
                     disabled={loading || isChangingOptions}
                   />
                 ))}
              </div>
            </div>
          )}
          
          {product.available_sizes && product.available_sizes.length > 0 && (
            <div className={styles.product__sizes}>
              <h3 className={styles.product__section_title}>
                Размер (ШхВхГ): <span className={styles.product__size_name}>{selectedSize?.title}</span>
              </h3>
              <div className={styles.product__sizes_list}>
                                 {product.available_sizes.map((size) => (
                   <button
                     key={size.id}
                     className={`${styles.product__size} ${selectedSize?.id === size.id ? styles.product__size_active : ''}`}
                     onClick={() => handleSizeChange(size)}
                     disabled={loading || isChangingOptions}
                   >
                     {size.title}
                   </button>
                 ))}
              </div>
            </div>
          )}

          {product.available_materials && product.available_materials.length > 0 && (
            <div className={styles.product__materials}>
              <h3 className={styles.product__section_title}>
                Материалы: <span className={styles.product__material_name}>{selectedMaterial?.title}</span>
              </h3>
              <div className={styles.product__materials_list}>
                                 {product.available_materials.map((material) => (
                   <button
                     key={material.id}
                     className={`${styles.product__material} ${selectedMaterial?.id === material.id ? styles.product__material_active : ''}`}
                     onClick={() => handleMaterialChange(material)}
                     disabled={loading || isChangingOptions}
                   >
                     {material.title}
                   </button>
                 ))}
              </div>
            </div>
          )}
          
          <div className={styles.product__details}>
            {product.production_time && (
              <div className={styles.product__detail}>
                <span className={styles.product__detail_label}>Сроки изготовления:</span>
                <span className={styles.product__detail_value}>{product.production_time} дней</span>
              </div>
            )}
            
            {product.weight && (
              <div className={styles.product__detail}>
                <span className={styles.product__detail_label}>Вес: </span>
                <span className={styles.product__detail_value}>{product.weight} кг</span>
              </div>
            )}
            
            {product.material?.title && (
              <div className={styles.product__detail}>
                <span className={styles.product__detail_label}>Материал: </span>
                <span className={styles.product__detail_value}>{product.material.title}</span>
              </div>
            )}
            
            {product.country && (
              <div className={styles.product__detail}>
                <span className={styles.product__detail_label}>Страна производства: </span>
                <span className={styles.product__detail_value}>{product.country}</span>
              </div>
            )}
            
            {product.delivery && (
              <div className={styles.product__detail}>
                <span className={styles.product__detail_label}>Доставка: </span>
                <span className={styles.product__detail_value}>{product.delivery} дней</span>
              </div>
            )}
          </div>
          
          <div className={styles.product__actions}>
            <button 
              className={`${styles.product__cart_button} ${(isAdded || product?.in_cart) ? styles.added : ''}`} 
              onClick={handleAddToCart}
              disabled={loading}
            >
              {isAdded || product?.in_cart ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
                </svg>
              ) : (
                <>
                  <span>{loading ? 'Загрузка...' : 'В корзину'}</span>
                  <svg width="31" height="12" viewBox="0 0 31 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30.5303 6.53033C30.8232 6.23744 30.8232 5.76256 30.5303 5.46967L25.7574 0.696699C25.4645 0.403806 24.9896 0.403806 24.6967 0.696699C24.4038 0.989593 24.4038 1.46447 24.6967 1.75736L28.9393 6L24.6967 10.2426C24.4038 10.5355 24.4038 11.0104 24.6967 11.3033C24.9896 11.5962 25.4645 11.5962 25.7574 11.3033L30.5303 6.53033ZM0 6.75H30V5.25H0V6.75Z" fill="#C1A286"/>
                  </svg>
                </>
              )}
            </button>
           
          </div>
          
          {product.param && product.param.length > 0 && (
            <div className={styles.product__params}>
              <div 
                className={styles.product__section_header}
                onClick={() => setShowMaterialInfo(!showMaterialInfo)}
              >
                <h2 className={styles.product__params_title}>Материал изделия и уход</h2>
                <div className={styles.product__toggle_button}>
                  {showMaterialInfo ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 8H12" stroke="#323433" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 4V12M4 8H12" stroke="#323433" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div className={`${styles.product__params_list} ${showMaterialInfo ? styles.product__content_visible : styles.product__content_hidden}`}>
                {product.param.map((param, index) => (
                  <div key={index} className={styles.product__param}>
                    <span className={styles.product__param_key}>{param.key_param}</span>
                    <span className={styles.product__param_value}>{param.value_param}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {product.description && (
            <div className={styles.product__description}>
              <div 
                className={styles.product__section_header}
                onClick={() => setShowProductInfo(!showProductInfo)}
              >
                <h2 className={styles.product__description_title}>Информация о товаре</h2>
                <div className={styles.product__toggle_button}>
                  {showProductInfo ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 8H12" stroke="#323433" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 4V12M4 8H12" stroke="#323433" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div className={`${styles.product__description_content} ${showProductInfo ? styles.product__content_visible : styles.product__content_hidden}`}>
                <p className={styles.product__description_paragraph}>
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div id="reviews">
        <Reviews 
          hasReviews={true}
          avgRating={product.avg_rating || 0}
          reviewsCount={product.reviews_count || 0}
          productId={product.id}
        />
      </div>
    </main>
  );
} 