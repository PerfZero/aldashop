'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import styles from './page.module.css';
import Reviews from '@/components/Reviews';
import { useCart } from '../../components/CartContext';
import { useFavourites } from '../../../contexts/FavouritesContext';


export default function ProductPage({ params }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleFavourite, isFavourite } = useFavourites();

  useEffect(() => {
    fetchProductDetails();
  }, [resolvedParams.id]);

  const fetchProductDetails = async (productId = null, sizeId = null, colorId = null, materialId = null) => {
    try {
      setLoading(true);
      
      // Если это первая загрузка, получаем товар по product_id
      if (!modelId && !sizeId && !colorId && !materialId) {
        const response = await fetch('/api/products/product-page/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
        size_id: sizeId,
        color_id: colorId,
        material_id: materialId,
      };
      
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('ОШИБКА 400 - Полный ответ сервера:', errorText);
        console.log('ОШИБКА 400 - Статус:', response.status);
        console.log('ОШИБКА 400 - Отправленные данные:', requestBody);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Сырой ответ от сервера:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Распарсенные данные:', data);
      } catch (parseError) {
        console.log('ОШИБКА парсинга JSON:', parseError);
        console.log('Сырой текст который не удалось распарсить:', responseText);
        throw new Error('Invalid JSON response');
      }

      if (data.error) {
        console.log('Ошибка в данных:', data.error);
        throw new Error(data.error);
      }

      setProduct(data);
        
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetailsByOptions = async (sizeId, colorId, materialId) => {
    try {
      setLoading(true);
      const requestBody = {
        model_id: modelId,
        size_id: sizeId,
        color_id: colorId,
        material_id: materialId,
      };
      console.log('Отправляем запрос на прямой API:', requestBody);
      
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Ошибка ответа:', response.status, errorText);
        console.log('Full error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

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
      if (data.id && data.id !== parseInt(resolvedParams.id)) {
        window.history.replaceState({}, '', `/product/${data.id}`);
      }
      setLoading(false);

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const colorObj = selectedColor;
    const materialObj = selectedMaterial;
    
    if (colorObj && materialObj) {
      fetchProductDetailsByOptions(size.id, colorObj.id, materialObj.id);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const sizeObj = selectedSize;
    const materialObj = selectedMaterial;
    
    if (sizeObj && materialObj) {
      fetchProductDetailsByOptions(sizeObj.id, color.id, materialObj.id);
    }
  };

  const handleMaterialChange = (material) => {
    setSelectedMaterial(material);
    const sizeObj = selectedSize;
    const colorObj = selectedColor;
    
    if (sizeObj && colorObj) {
      fetchProductDetailsByOptions(sizeObj.id, colorObj.id, material.id);
    }
  };

  // Функция для проверки доступности комбинации опций
  const checkOptionsAvailability = async (sizeId, colorId, materialId) => {
    try {
      const response = await fetch('/api/products/product-detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: modelId,
          size_id: sizeId,
          color_id: colorId,
          material_id: materialId,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      // Проверяем, совпадают ли запрошенные и полученные опции
      const sizeMatch = !sizeId || data.sizes?.id === sizeId;
      const colorMatch = !colorId || data.color?.id === colorId;
      const materialMatch = !materialId || data.material?.id === materialId;
      
      return sizeMatch && colorMatch && materialMatch;
    } catch (error) {
      return false;
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
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
    
    await addToCart(productToAdd);
    setIsAdded(true);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
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
    
    await toggleFavourite(productToToggle);
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.product__skeleton}>
          <div className={`${styles.skeleton} ${styles.product__skeleton_title}`}></div>
          
          <div className={styles.product__skeleton_content}>
            <div className={styles.product__skeleton_gallery}>
              <div className={styles.product__skeleton_thumbnails}>
                <div className={`${styles.skeleton} ${styles.product__skeleton_thumbnail}`}></div>
                <div className={`${styles.skeleton} ${styles.product__skeleton_thumbnail}`}></div>
                <div className={`${styles.skeleton} ${styles.product__skeleton_thumbnail}`}></div>
              </div>
              <div className={`${styles.skeleton} ${styles.product__skeleton_main_image}`}></div>
            </div>
            
            <div className={styles.product__skeleton_info}>
              <div className={`${styles.skeleton} ${styles.product__skeleton_price}`}></div>
              
              <div className={styles.product__skeleton_options}>
                <div>
                  <div className={`${styles.skeleton} ${styles.product__skeleton_option_title}`}></div>
                  <div className={styles.product__skeleton_option_list}>
                    <div className={`${styles.skeleton} ${styles.product__skeleton_size}`}></div>
                    <div className={`${styles.skeleton} ${styles.product__skeleton_size}`}></div>
                    <div className={`${styles.skeleton} ${styles.product__skeleton_size}`}></div>
                  </div>
                </div>
                
                <div>
                  <div className={`${styles.skeleton} ${styles.product__skeleton_option_title}`}></div>
                  <div className={styles.product__skeleton_option_list}>
                    <div className={`${styles.skeleton} ${styles.product__skeleton_color}`}></div>
                    <div className={`${styles.skeleton} ${styles.product__skeleton_color}`}></div>
                    <div className={`${styles.skeleton} ${styles.product__skeleton_color}`}></div>
                  </div>
                </div>
                
                <div>
                  <div className={`${styles.skeleton} ${styles.product__skeleton_option_title}`}></div>
                  <div className={styles.product__skeleton_option_list}>
                    <div className={`${styles.skeleton} ${styles.product__skeleton_material}`}></div>
                    <div className={`${styles.skeleton} ${styles.product__skeleton_material}`}></div>
                  </div>
                </div>
              </div>
              
              <div className={styles.product__skeleton_details}>
                <div className={`${styles.skeleton} ${styles.product__skeleton_detail}`}></div>
                <div className={`${styles.skeleton} ${styles.product__skeleton_detail}`}></div>
                <div className={`${styles.skeleton} ${styles.product__skeleton_detail}`}></div>
                <div className={`${styles.skeleton} ${styles.product__skeleton_detail}`}></div>
              </div>
              
              <div className={styles.product__skeleton_buttons}>
                <div className={`${styles.skeleton} ${styles.product__skeleton_cart_button}`}></div>
                <div className={`${styles.skeleton} ${styles.product__skeleton_favorite_button}`}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
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


  const hasDiscount = product.discounted_price && product.price > product.discounted_price;
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
              <div className={styles.product__bestseller}>Бестселлер</div>
            )}
          </h1>
          
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
                    fill={index < 4 ? "#A45B38" : "#E5E5E5"} 
                  />
                </svg>
              ))}
            </div>
            <span className={styles.product__reviews}>0 Отзывов</span>
          </div>
          
          <p className={styles.product__article}>Артикул: {product.generated_article}</p>
          
          <div className={styles.product__price}>
            {hasDiscount ? (
              <>
                <span className={styles.product__price_old}>{originalPrice} ₽</span>
                <span className={styles.product__price_new}>{discountedPrice} ₽</span>
              </>
            ) : (
              <span>{originalPrice} ₽</span>
            )}
          </div>
        </div>

        <div className={styles.product__gallery}>
          {product.photos && product.photos.length > 0 && (
            <>
              <div className={styles.product__thumbnails}>
                {product.photos.map((photo, index) => (
                  <button
                    key={index}
                    className={`${styles.product__thumbnail} ${selectedImage === index ? styles.product__thumbnail_active : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={photo.photo}
                      alt={`${product.title} - фото ${index + 1}`}
                      width={80}
                      height={80}
                    />
                  </button>
                ))}
              </div>
              
              <div className={styles.product__main_image}>
                <Image
                  src={product.photos[selectedImage]?.photo}
                  alt={product.title}
                  width={600}
                  height={600}
                  priority
                />
              </div>
            </>
          )}
        </div>
        
        <div className={styles.product__info}>
          <div className={styles.product__header}>
            <h1 className={styles.product__title}>
              {product.title} 
              {product.bestseller && (
                <div className={styles.product__bestseller}>Бестселлер</div>
              )}
            </h1>
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
                    fill={index < 4 ? "#A45B38" : "#E5E5E5"} 
                  />
                </svg>
              ))}
            </div>
            <span className={styles.product__reviews}>0 Отзывов</span>
          </div>
          
          <p className={styles.product__article}>Артикул: {product.generated_article}</p>
          
          <div className={styles.product__price}>
            {hasDiscount ? (
              <>
                <span className={styles.product__price_old}>{originalPrice} ₽</span>
                <span className={styles.product__price_new}>{discountedPrice} ₽</span>
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
                     disabled={loading}
                   />
                 ))}
              </div>
            </div>
          )}
          
          {product.available_sizes && product.available_sizes.length > 0 && (
            <div className={styles.product__sizes}>
              <h3 className={styles.product__section_title}>
                Размеры: <span className={styles.product__size_name}>{selectedSize?.title}</span>
              </h3>
              <div className={styles.product__sizes_list}>
                                 {product.available_sizes.map((size) => (
                   <button
                     key={size.id}
                     className={`${styles.product__size} ${selectedSize?.id === size.id ? styles.product__size_active : ''}`}
                     onClick={() => handleSizeChange(size)}
                     disabled={loading}
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
                     disabled={loading}
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
            
            {product.city && (
              <div className={styles.product__detail}>
                <span className={styles.product__detail_label}>Город: </span>
                <span className={styles.product__detail_value}>{product.city}</span>
              </div>
            )}

            {product.country && (
              <div className={styles.product__detail}>
                <span className={styles.product__detail_label}>Страна: </span>
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
              className={`${styles.product__cart_button} ${isAdded ? styles.added : ''}`} 
              onClick={handleAddToCart}
              disabled={loading}
            >
              {isAdded ? (
                <>
                  <span>Добавлено</span>
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5.5L5 9.5L13 1.5" stroke="#C1A286" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </>
              ) : (
                <>
                  <span>{loading ? 'Загрузка...' : 'В корзину'}</span>
                  <svg width="31" height="12" viewBox="0 0 31 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30.5303 6.53033C30.8232 6.23744 30.8232 5.76256 30.5303 5.46967L25.7574 0.696699C25.4645 0.403806 24.9896 0.403806 24.6967 0.696699C24.4038 0.989593 24.4038 1.46447 24.6967 1.75736L28.9393 6L24.6967 10.2426C24.4038 10.5355 24.4038 11.0104 24.6967 11.3033C24.9896 11.5962 25.4645 11.5962 25.7574 11.3033L30.5303 6.53033ZM0 6.75H30V5.25H0V6.75Z" fill="#C1A286"/>
                  </svg>
                </>
              )}
            </button>
            <button 
              className={`${styles.product__favorite_button} ${isFavourite(product?.id) ? styles.product__favorite_button_active : ''}`}
              onClick={handleToggleFavourite}
              aria-label={isFavourite(product?.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M32.1408 21.075C33.3193 19.878 33.9739 18.2619 33.9608 16.5822C33.9477 14.9025 33.2678 13.2968 32.0708 12.1184C31.4781 11.5348 30.7763 11.0738 30.0054 10.7615C29.2345 10.4492 28.4097 10.2919 27.578 10.2984C25.8983 10.3115 24.2926 10.9913 23.1142 12.1884C22.7942 12.5084 22.3875 12.9011 21.8942 13.3667L20.5225 14.6584L19.1508 13.3667C18.6564 12.9 18.2492 12.5072 17.9292 12.1884C16.7414 11.0006 15.1305 10.3334 13.4508 10.3334C11.7711 10.3334 10.1602 11.0006 8.97249 12.1884C6.52582 14.6367 6.49749 18.595 8.88249 21.055L20.5225 32.695L32.1408 21.075ZM7.55749 10.775C8.33134 10.001 9.2501 9.38694 10.2613 8.96801C11.2725 8.54908 12.3563 8.33346 13.4508 8.33346C14.5454 8.33346 15.6292 8.54908 16.6404 8.96801C17.6515 9.38694 18.5703 10.001 19.3442 10.775C19.6475 11.0795 20.0403 11.4583 20.5225 11.9117C21.0025 11.4583 21.3953 11.0789 21.7008 10.7734C23.2517 9.19863 25.3646 8.30448 27.5747 8.2876C29.7848 8.27072 31.9111 9.1325 33.4858 10.6834C35.0605 12.2342 35.9547 14.3471 35.9716 16.5572C35.9885 18.7673 35.1267 20.8936 33.5758 22.4684L21.7008 34.345C21.3883 34.6575 20.9644 34.833 20.5225 34.833C20.0805 34.833 19.6567 34.6575 19.3442 34.345L7.46582 22.4667C5.94256 20.8957 5.09834 18.7886 5.11549 16.6004C5.13264 14.4122 6.00978 12.3186 7.55749 10.7717V10.775Z" fill={isFavourite(product?.id) ? "#C1AF86" : "#323433"}/>
              </svg>
            </button>
          </div>
          
          {product.param && product.param.length > 0 && (
            <div className={styles.product__params}>
              <h2 className={styles.product__params_title}>Материал изделия и уход</h2>
              <div className={styles.product__params_list}>
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
              <h2 className={styles.product__description_title}>Информация о товаре</h2>
              <div className={styles.product__description_content}>
                <p className={styles.product__description_paragraph}>
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Reviews hasReviews={false} />
    </main>
  );
} 