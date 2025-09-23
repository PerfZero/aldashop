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
  const [showFilters, setShowFilters] = useState(true);
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

  // Загружаем категории и фильтры через TanStack Query
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: filters = [], isLoading: filtersLoading } = useFilters(categoryId, subcategoryId);

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
  

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const updateUrlWithDynamicFilters = (filters) => {
    try {
      if (typeof window === 'undefined') return;
      
      const url = new URL(window.location.href);
    
    Object.keys(url.searchParams).forEach(key => {
      if (!['price_min', 'price_max', 'in_stock', 'sort', 'material', 'colors', 'bestseller'].includes(key)) {
        url.searchParams.delete(key);
      }
    });

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (Array.isArray(value) && value.length > 0) {
        url.searchParams.set(key, value.join(','));
      } else if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value.toString());
      }
    });

      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Ошибка при обновлении URL:', error);
    }
  };

  const parseDynamicFiltersFromUrl = () => {
    try {
      if (typeof window === 'undefined') return {};
      
      const url = new URL(window.location.href);
      const dynamicFilters = {};
    
    Object.keys(url.searchParams).forEach(key => {
      if (!['price_min', 'price_max', 'in_stock', 'sort', 'material', 'colors', 'bestseller'].includes(key)) {
        const value = url.searchParams.get(key);
        if (value && value.includes(',')) {
          dynamicFilters[key] = value.split(',').map(v => parseInt(v));
        } else if (value) {
          dynamicFilters[key] = [parseInt(value)];
        }
      }
      });
      
      return dynamicFilters;
    } catch (error) {
      console.error('Ошибка при парсинге URL параметров:', error);
      return {};
    }
  };



  const handleFiltersApply = (newFilters) => {
    setAppliedFilters(newFilters);
    window.scrollTo(0, 0);
    
    const dynamicFilterData = {};
    Object.keys(newFilters).forEach(key => {
      if (!['price', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'sizes', 'search'].includes(key)) {
        dynamicFilterData[key] = newFilters[key];
      }
    });
    setDynamicFilters(dynamicFilterData);
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
    if (filters.length > 0 && !appliedFilters.colors) {
      const urlFilters = {
        price: priceMin || priceMax ? { min: priceMin, max: priceMax } : undefined,
        in_stock: inStock === 'true',
        sort: sort,
        material: material && material.trim() !== '' ? [material] : undefined,
        colors: colors && colors.trim() !== '' ? colors.split(',').map(c => parseInt(c)).filter(c => !isNaN(c)) : undefined,
        bestseller: bestseller === 'true',
        ...dynamicFilters
      };
      
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
              console.log('Ошибка загрузки изображения:', e.target.src);
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