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
  const [sortBy, setSortBy] = useState(3);
  const [showFilters, setShowFilters] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({ in_stock: true });
  const [categoryId, setCategoryId] = useState(null);
  const [subcategoryId, setSubcategoryId] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);

  const [sort, setSort] = useQueryParam('sort', NumberParam);
  
  const [dynamicFilters, setDynamicFilters] = useState({});
  const loadMoreRef = useRef(null);
  const scrollRestoredRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      sessionStorage.setItem('showFilters', showFilters.toString());
    }
  }, [showFilters, isClient]);

  // Загружаем категории и фильтры через TanStack Query
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  
  useEffect(() => {
    console.log('[categories/[...slug]] Изменение параметров для фильтров:', { categoryId, subcategoryId, dynamicFilters });
  }, [categoryId, subcategoryId, dynamicFilters]);
  
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

  useEffect(() => {
    const savedPosition = sessionStorage.getItem('catalogScrollPosition');
    if (savedPosition && !isProductsLoading && products.length > 0 && !scrollRestoredRef.current) {
      const scrollPosition = parseInt(savedPosition, 10);
      scrollRestoredRef.current = true;
      
      const restoreScroll = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: 'instant'
            });
            sessionStorage.removeItem('catalogScrollPosition');
          });
        });
      };
      
      setTimeout(restoreScroll, 200);
    }
  }, [isProductsLoading, products.length]);

  





  useEffect(() => {
    if (sort !== undefined && sort !== null) {
      setSortBy(sort);
    }
  }, [sort]);

  const handleSortChange = (value) => {
    setSortBy(value);
    setSort(value);
  };

  const updateUrlWithDynamicFilters = (filters, isReset = false) => {
    try {
      if (typeof window === 'undefined') return;
      
      const url = new URL(window.location.href);
    
    // Удаляем все динамические параметры
    const keysToDelete = [];
    for (const key of url.searchParams.keys()) {
      if (!['price_min', 'price_max', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'category_id', 'subcategory_id', 'flag_type'].includes(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
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

      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Error in updateUrlWithDynamicFilters:', error);
    }
  };

  const parseDynamicFiltersFromUrl = () => {
    try {
      if (typeof window === 'undefined') return {};
      
      const url = new URL(window.location.href);
      const dynamicFilters = {};
    
    for (const [key, value] of url.searchParams.entries()) {
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
      
      return dynamicFilters;
    } catch (error) {
      console.error('Ошибка при парсинге URL параметров:', error);
      return {};
    }
  };

  const parseAllFiltersFromUrl = () => {
    try {
      if (typeof window === 'undefined') return {};
      
      const url = new URL(window.location.href);
      const filters = {};
      
      if (url.searchParams.get('in_stock') === 'true') {
        filters.in_stock = true;
      }
      
      if (url.searchParams.get('bestseller') === 'true') {
        filters.bestseller = true;
      }
      
      const priceMin = url.searchParams.get('price_min');
      const priceMax = url.searchParams.get('price_max');
      if (priceMin || priceMax) {
        filters.price = {};
        if (priceMin) filters.price.min = parseInt(priceMin);
        if (priceMax) filters.price.max = parseInt(priceMax);
      }
      
      const colors = url.searchParams.get('colors');
      if (colors) {
        filters.colors = colors.split(',').map(c => parseInt(c)).filter(c => !isNaN(c));
      }
      
      const material = url.searchParams.get('material');
      if (material) {
        filters.material = material.split(',').map(m => parseInt(m)).filter(m => !isNaN(m));
      }
      
      const widthMin = url.searchParams.get('width_min');
      const widthMax = url.searchParams.get('width_max');
      const heightMin = url.searchParams.get('height_min');
      const heightMax = url.searchParams.get('height_max');
      const depthMin = url.searchParams.get('depth_min');
      const depthMax = url.searchParams.get('depth_max');
      
      if (widthMin || widthMax || heightMin || heightMax || depthMin || depthMax) {
        filters.sizes = {};
        if (widthMin || widthMax) {
          filters.sizes.width = {};
          if (widthMin) filters.sizes.width.min = parseInt(widthMin);
          if (widthMax) filters.sizes.width.max = parseInt(widthMax);
        }
        if (heightMin || heightMax) {
          filters.sizes.height = {};
          if (heightMin) filters.sizes.height.min = parseInt(heightMin);
          if (heightMax) filters.sizes.height.max = parseInt(heightMax);
        }
        if (depthMin || depthMax) {
          filters.sizes.depth = {};
          if (depthMin) filters.sizes.depth.min = parseInt(depthMin);
          if (depthMax) filters.sizes.depth.max = parseInt(depthMax);
        }
      }
      
      for (const [key, value] of url.searchParams.entries()) {
        if (!['price_min', 'price_max', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'category_id', 'subcategory_id', 'width_min', 'width_max', 'height_min', 'height_max', 'depth_min', 'depth_max'].includes(key)) {
          if (value && value.includes(',')) {
            filters[key] = value.split(',').map(v => {
              const num = parseInt(v);
              return isNaN(num) ? v : num;
            });
          } else if (value) {
            const num = parseInt(value);
            filters[key] = isNaN(num) ? [value] : [num];
          }
        }
      }
      
      return filters;
    } catch (error) {
      console.error('Ошибка при парсинге всех фильтров из URL:', error);
      return {};
    }
  };



  const handleFiltersApply = (newFilters) => {
    setAppliedFilters(newFilters);
    
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      
      const isReset = Object.keys(newFilters).length === 0;
      
      if (isReset) {
        url.searchParams.delete('in_stock');
        url.searchParams.delete('bestseller');
        url.searchParams.delete('price_min');
        url.searchParams.delete('price_max');
        url.searchParams.delete('colors');
        url.searchParams.delete('material');
        url.searchParams.delete('width_min');
        url.searchParams.delete('width_max');
        url.searchParams.delete('height_min');
        url.searchParams.delete('height_max');
        url.searchParams.delete('depth_min');
        url.searchParams.delete('depth_max');
        url.searchParams.delete('sort');
        
        const paramsToDelete = [];
        for (const [key] of url.searchParams.entries()) {
          paramsToDelete.push(key);
        }
        paramsToDelete.forEach(key => url.searchParams.delete(key));
        
        setSortBy(null);
        setSort(undefined);
      } else {
        if (newFilters.in_stock === true) {
          url.searchParams.set('in_stock', 'true');
        } else {
          url.searchParams.delete('in_stock');
        }
        
        if (newFilters.bestseller === true) {
          url.searchParams.set('bestseller', 'true');
        } else {
          url.searchParams.delete('bestseller');
        }
        
        if (newFilters.price) {
          if (newFilters.price.min) url.searchParams.set('price_min', newFilters.price.min.toString());
          if (newFilters.price.max) url.searchParams.set('price_max', newFilters.price.max.toString());
        } else {
          url.searchParams.delete('price_min');
          url.searchParams.delete('price_max');
        }
        
        if (newFilters.colors && Array.isArray(newFilters.colors) && newFilters.colors.length > 0) {
          url.searchParams.set('colors', newFilters.colors.join(','));
        } else {
          url.searchParams.delete('colors');
        }
        
        if (newFilters.material && Array.isArray(newFilters.material) && newFilters.material.length > 0) {
          url.searchParams.set('material', newFilters.material.join(','));
        } else {
          url.searchParams.delete('material');
        }
        
        if (newFilters.sizes) {
          if (newFilters.sizes.width) {
            if (newFilters.sizes.width.min) url.searchParams.set('width_min', newFilters.sizes.width.min.toString());
            if (newFilters.sizes.width.max) url.searchParams.set('width_max', newFilters.sizes.width.max.toString());
          }
          if (newFilters.sizes.height) {
            if (newFilters.sizes.height.min) url.searchParams.set('height_min', newFilters.sizes.height.min.toString());
            if (newFilters.sizes.height.max) url.searchParams.set('height_max', newFilters.sizes.height.max.toString());
          }
          if (newFilters.sizes.depth) {
            if (newFilters.sizes.depth.min) url.searchParams.set('depth_min', newFilters.sizes.depth.min.toString());
            if (newFilters.sizes.depth.max) url.searchParams.set('depth_max', newFilters.sizes.depth.max.toString());
          }
        } else {
          url.searchParams.delete('width_min');
          url.searchParams.delete('width_max');
          url.searchParams.delete('height_min');
          url.searchParams.delete('height_max');
          url.searchParams.delete('depth_min');
          url.searchParams.delete('depth_max');
        }
        
        Object.keys(newFilters).forEach(key => {
          if (!['in_stock', 'bestseller', 'price', 'colors', 'material', 'sizes', 'sort'].includes(key)) {
            const value = newFilters[key];
            if (Array.isArray(value) && value.length > 0) {
              url.searchParams.set(key, value.join(','));
            } else if (value) {
              url.searchParams.set(key, value.toString());
            }
          }
        });
      }
      
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    scrollRestoredRef.current = false;
  }, [slugDep]);

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
        console.log('[categories/[...slug]] Смена категории (подкатегория):', { categoryId: cat.id, subcategoryId: sub?.id, slug: catSlug, subSlug });
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
      console.log('[categories/[...slug]] Смена категории:', { categoryId: cat.id, subcategoryId: null, slug: currentSlug });
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
        console.log('[categories/[...slug]] Смена категории (подкатегория найдена):', { categoryId: c.id, subcategoryId: sub.id, slug: currentSlug });
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
    
    const urlFilters = parseAllFiltersFromUrl();
    if (Object.keys(urlFilters).length > 0) {
      setAppliedFilters(urlFilters);
    }
  }, []);

  useEffect(() => {
    const handleUrlChange = () => {
      const urlDynamicFilters = parseDynamicFiltersFromUrl();
      setDynamicFilters(urlDynamicFilters);
      
      const urlFilters = parseAllFiltersFromUrl();
      setAppliedFilters(urlFilters);
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  useEffect(() => {
    const handlePageShow = (e) => {
      if (typeof window === 'undefined') return;
      if (e.persisted) {
        const urlDynamicFilters = parseDynamicFiltersFromUrl();
        setDynamicFilters(urlDynamicFilters);
        
        const urlFilters = parseAllFiltersFromUrl();
        setAppliedFilters(urlFilters);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);


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
          onClick={() => {
            const next = !showFilters;
            setShowFilters(next);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('showFilters', next.toString());
            }
          }}
        >
          <span suppressHydrationWarning>{showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}</span>
        </button>
        
        <SortSelect 
          value={sortBy} 
          onChange={handleSortChange} 
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
          onClose={() => {
            setShowFilters(false);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('showFilters', 'false');
            }
          }}
          filters={filters}
          loading={loading}
          error={error}
          onApply={handleFiltersApply}
          appliedFilters={appliedFilters}
          categories={categories}
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