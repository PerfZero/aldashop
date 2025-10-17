'use client';

import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQueryParam, NumberParam, StringParam, withDefault } from 'use-query-params';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import SortSelect from '@/components/SortSelect';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useCategories } from '@/hooks/useCategories';
import { useFilters } from '@/hooks/useFilters';
import styles from './page.module.css';

function CategoryPageContent() {
  const params = useParams();
  const slugDep = Array.isArray(params?.slug) ? params.slug.join('/') : (params?.slug || '');
  const [sortBy, setSortBy] = useState(null);
  const [showFilters, setShowFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('showFilters');
      return saved === 'true';
    }
    return false;
  });
  const [error, setError] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [categoryId, setCategoryId] = useState(null);
  const [subcategoryId, setSubcategoryId] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);

  const [priceMin, setPriceMin] = useQueryParam('price_min', NumberParam);
  const [priceMax, setPriceMax] = useQueryParam('price_max', NumberParam);
  const [inStock, setInStock] = useQueryParam('in_stock', withDefault(StringParam, ''));
  const [sort, setSort] = useQueryParam('sort', NumberParam);
  const [material, setMaterial] = useQueryParam('material', StringParam);
  const [colors, setColors] = useQueryParam('colors', StringParam);
  const [bestseller, setBestseller] = useQueryParam('bestseller', withDefault(StringParam, ''));
  
  const [dynamicFilters, setDynamicFilters] = useState({});
  const loadMoreRef = useRef(null);

  // Сохраняем состояние showFilters в sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('showFilters', showFilters.toString());
    }
  }, [showFilters]);

  // Загружаем категории и фильтры через TanStack Query
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: filters = [], isLoading: filtersLoading } = useFilters(categoryId, subcategoryId, dynamicFilters);

  // Используем TanStack Query для загрузки товаров
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError
  } = useInfiniteProducts(appliedFilters, categoryId, subcategoryId, sortBy);
  
  // Объединяем все страницы товаров в один массив
  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.products);
  }, [data]);
  
  const totalCount = data?.pages?.[0]?.totalCount || 0;
  const loading = categoriesLoading || filtersLoading || isProductsLoading;
  
  // Intersection Observer для бесконечного скролла
  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0.1,
    rootMargin: '100px',
    enabled: hasNextPage && !isFetchingNextPage
  });

  // Сохраняем позицию скролла при уходе со страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('catalogScrollPosition', window.scrollY.toString());
    };

    const handleRouteChange = () => {
      sessionStorage.setItem('catalogScrollPosition', window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Сохраняем позицию при клике на ссылку продукта
    const productLinks = document.querySelectorAll('a[href*="/product/"]');
    productLinks.forEach(link => {
      link.addEventListener('click', handleRouteChange);
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      productLinks.forEach(link => {
        link.removeEventListener('click', handleRouteChange);
      });
    };
  }, []);

  // Восстанавливаем позицию скролла при загрузке страницы
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('catalogScrollPosition');
    if (savedPosition) {
      // Небольшая задержка для корректного восстановления
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('catalogScrollPosition');
      }, 100);
    }
  }, []);
  





  const updateUrlWithDynamicFilters = (filters, isReset = false) => {
    try {
      if (typeof window === 'undefined') return;
      
      const url = new URL(window.location.href);
      console.log('🔧 updateUrlWithDynamicFilters called with:', { filters, isReset });
    
    // Удаляем все динамические параметры
    const keysToDelete = [];
    for (const key of url.searchParams.keys()) {
      if (!['price_min', 'price_max', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'category_id', 'subcategory_id', 'flag_type'].includes(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      console.log('🗑️ Deleting dynamic param:', key);
      url.searchParams.delete(key);
    });

    // Если это не сброс, добавляем новые динамические фильтры
    if (!isReset) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (Array.isArray(value) && value.length > 0) {
          url.searchParams.set(key, value.join(','));
        } else if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value.toString());
        }
      });
    }

      console.log('🔧 Final URL:', url.toString());
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Error in updateUrlWithDynamicFilters:', error);
    }
  };

  const parseDynamicFiltersFromUrl = () => {
    try {
      if (typeof window === 'undefined') return {};
      
      const url = new URL(window.location.href);
      console.log('🔍 Parsing URL:', url.href);
      const dynamicFilters = {};
    
    for (const [key, value] of url.searchParams.entries()) {
      console.log('🔍 Processing param:', key, '=', value);
      if (!['price_min', 'price_max', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'category_id', 'subcategory_id'].includes(key)) {
        if (value && value.includes(',')) {
          dynamicFilters[key] = value.split(',').map(v => {
            const num = parseInt(v);
            return isNaN(num) ? v : num;
          });
        } else if (value) {
          const num = parseInt(value);
          dynamicFilters[key] = isNaN(num) ? value : [num];
        }
      }
    }
      
      console.log('🔍 Parsed dynamic filters:', dynamicFilters);
      return dynamicFilters;
    } catch (error) {
      console.error('Ошибка при парсинге URL параметров:', error);
      return {};
    }
  };



  const handleFiltersApply = (newFilters) => {
    setAppliedFilters(newFilters);
    
    // Проверяем, является ли это сбросом фильтров
    const hasActiveFilters = Object.values(newFilters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value === true;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined && v !== null && v !== '' && v !== false);
      }
      return value !== undefined && value !== null && value !== '' && value !== false;
    });
    
    const isReset = !hasActiveFilters;
    
    const dynamicFilterData = {};
    Object.keys(newFilters).forEach(key => {
      if (!['price', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'sizes', 'search', 'category_id', 'subcategory_id'].includes(key)) {
        dynamicFilterData[key] = newFilters[key];
      }
    });
    setDynamicFilters(dynamicFilterData);
    
    // Обновляем URL с новыми фильтрами
    updateUrlWithDynamicFilters(dynamicFilterData, isReset);
    
    // Обновляем URL параметры для обычных фильтров
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        
        if (isReset) {
          // Очищаем все параметры фильтров
          url.searchParams.delete('material');
          url.searchParams.delete('colors');
          url.searchParams.delete('bestseller');
          url.searchParams.delete('in_stock');
          url.searchParams.delete('price_min');
          url.searchParams.delete('price_max');
        } else {
          // Обновляем параметры фильтров
          if (newFilters.material && Array.isArray(newFilters.material) && newFilters.material.length > 0) {
            url.searchParams.set('material', newFilters.material.join(','));
          } else {
            url.searchParams.delete('material');
          }
          
          if (newFilters.colors && Array.isArray(newFilters.colors) && newFilters.colors.length > 0) {
            url.searchParams.set('colors', newFilters.colors.join(','));
          } else {
            url.searchParams.delete('colors');
          }
          
          if (newFilters.bestseller === true) {
            url.searchParams.set('bestseller', 'true');
          } else {
            url.searchParams.delete('bestseller');
          }
          
          if (newFilters.in_stock === true) {
            url.searchParams.set('in_stock', 'true');
          } else {
            url.searchParams.delete('in_stock');
          }
          
          if (newFilters.price && (newFilters.price.min || newFilters.price.max)) {
            if (newFilters.price.min) url.searchParams.set('price_min', newFilters.price.min.toString());
            if (newFilters.price.max) url.searchParams.set('price_max', newFilters.price.max.toString());
          } else {
            url.searchParams.delete('price_min');
            url.searchParams.delete('price_max');
          }
        }
        
        window.history.replaceState({}, '', url.toString());
      }
    } catch (error) {
      console.error('Ошибка при обновлении URL:', error);
    }
  };

  useEffect(() => {
    if (!categories.length) return;
    
    const sortedData = categories.sort((a, b) => {
      const aDisplayId = a.display_id || 999;
      const bDisplayId = b.display_id || 999;
      return aDisplayId - bDisplayId;
    }).map(category => ({
      ...category,
      subcategories: category.subcategories?.sort((a, b) => {
        const aDisplayId = a.display_id || 999;
        const bDisplayId = b.display_id || 999;
        return aDisplayId - bDisplayId;
      }) || []
    }));
    
    const slugArr = Array.isArray(params?.slug) ? params.slug : params?.slug ? [params.slug] : [];
    if (!slugArr || slugArr.length === 0) return;

    if (slugArr.length >= 2) {
      const [catSlug, subSlug] = slugArr;
      const cat = sortedData.find(c => c.slug === catSlug);
      if (cat) {
        const sub = (cat.subcategories || []).find(s => s.slug === subSlug && subSlug !== 'all');
        setCategoryId(cat.id);
        setSubcategoryId(sub ? sub.id : null);
        setCurrentCategory({ id: cat.id, slug: cat.slug, title: cat.title, description: cat.description, photo_cover: cat.photo_cover });
        setCurrentSubcategory(sub ? { id: sub.id, slug: sub.slug, title: sub.title, description: sub.description, photo_cover: sub.photo_cover } : null);
        return;
      }
    }

    const currentSlug = slugArr[0];
    
    const cat = sortedData.find(c => c.slug === currentSlug);
    if (cat) {
      setCategoryId(cat.id);
      setSubcategoryId(null);
      setCurrentCategory({ id: cat.id, slug: cat.slug, title: cat.title, description: cat.description, photo_cover: cat.photo_cover });
      setCurrentSubcategory(null);
      return;
    } else {
    }

    for (const c of sortedData) {
      const sub = (c.subcategories || []).find(s => s.slug === currentSlug);
      if (sub) {
        setCategoryId(c.id);
        setSubcategoryId(sub.id);
        setCurrentCategory({ id: c.id, slug: c.slug, title: c.title, description: c.description, photo_cover: c.photo_cover });
        setCurrentSubcategory({ id: sub.id, slug: sub.slug, title: sub.title, description: sub.description, photo_cover: sub.photo_cover });
        return;
      }
    }
  }, [categories, slugDep]);



  useEffect(() => {
    const urlDynamicFilters = parseDynamicFiltersFromUrl();
    setDynamicFilters(urlDynamicFilters);
  }, []);

  useEffect(() => {
    const handleUrlChange = () => {
      const urlDynamicFilters = parseDynamicFiltersFromUrl();
      setDynamicFilters(urlDynamicFilters);
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  useEffect(() => {
    if (filters.length > 0) {
      const urlFilters = {
        price: priceMin || priceMax ? { min: priceMin, max: priceMax } : undefined,
        in_stock: inStock === 'true',
        sort: sort,
        material: material && material.trim() !== '' ? [material] : undefined,
        colors: colors && colors.trim() !== '' ? colors.split(',').map(c => parseInt(c)).filter(c => !isNaN(c)) : undefined,
        bestseller: bestseller === 'true',
        ...dynamicFilters
      };
      
      console.log('🔍 Setting applied filters:', urlFilters);
      setAppliedFilters(urlFilters);
    }
  }, [filters, priceMin, priceMax, inStock, sort, material, colors, bestseller, dynamicFilters]);

  const breadcrumbs = [
    { text: 'Главная', href: '/' },
    ...(currentCategory ? [{ text: currentCategory.title, href: `/categories/${currentCategory.slug}` }] : []),
    ...(currentSubcategory
      ? [{ text: currentSubcategory.title, href: `/categories/${currentCategory?.slug}/${currentSubcategory.slug}` }]
      : currentCategory ? [{ text: 'Все товары', href: `/categories/${currentCategory.slug}/all` }] : []),
  ];

  const transformProduct = (product) => {
    return product;
  };

  return (
    <main className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />
      
      <div className={styles.hero}>
        <div className={styles.hero__content}>
          <h1 className={styles.hero__title}>{currentSubcategory?.title || currentCategory?.title || 'Категория'}</h1>
          <p className={styles.hero__description}>
            {currentSubcategory?.description || currentCategory?.description || 'Описание категории'}
          </p>
          <img 
            className={`${styles.hero__img} ${((currentSubcategory?.photo_cover && currentSubcategory.photo_cover !== null) || (currentCategory?.photo_cover && currentCategory.photo_cover !== null)) ? styles.photo_cover : ''}`} 
            src={(currentSubcategory?.photo_cover && currentSubcategory.photo_cover !== null) || (currentCategory?.photo_cover && currentCategory.photo_cover !== null) ? (currentSubcategory?.photo_cover?.startsWith('http') ? (currentSubcategory?.photo_cover || currentCategory?.photo_cover) : `https://aldalinde.ru${currentSubcategory?.photo_cover || currentCategory?.photo_cover}`) : "/category.png"} 
            alt={currentSubcategory?.title || currentCategory?.title || 'Категория'} 
            onError={(e) => {
              e.target.src = "/category.png";
            }}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <button 
          className={styles.filters__button}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
        </button>
        
        <SortSelect 
          value={sortBy} 
          onChange={setSortBy} 
          options={(filters.find(f => f.slug === 'sort')?.options?.map(option => ({
            value: option.id,
            label: option.title
          }))) || [
            { value: 1, label: 'Популярные' },
            { value: 2, label: 'Высокий рейтинг' },
            { value: 3, label: 'По возрастанию цены' },
            { value: 4, label: 'По убыванию цены' }
          ]} 
        />
      </div>

      <div className={styles.content}>
        <Filters 
          isVisible={showFilters} 
          onClose={() => setShowFilters(false)}
          filters={filters}
          loading={loading}
          error={error}
          onApply={handleFiltersApply}
          appliedFilters={appliedFilters}
        />
        <div className={`${styles.products} ${showFilters ? styles.filtersOpen : ''}`}>
          {isProductsLoading && products.length === 0 ? (
            <ProductSkeleton count={8} />
          ) : isProductsError ? (
            <div className={styles.noProducts}>
              Ошибка загрузки товаров: {productsError?.message}
            </div>
          ) : products.length > 0 ? (
            <>
              {products.map((product, index) => (
                <ProductCard 
                  key={`${product.id}-${index}`} 
                  product={transformProduct(product)} 
                  filtersOpen={showFilters}
                />
              ))}
              {isFetchingNextPage && (
                <ProductSkeleton count={4} />
              )}
              {hasNextPage && (
                <div ref={loadMoreRef} className={styles.loadMore}></div>
              )}
            </>
          ) : (
            <div className={styles.noProducts}>
              Товары не найдены
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryPageContent />
    </Suspense>
  );
}