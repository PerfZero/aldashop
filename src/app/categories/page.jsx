'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryParam, NumberParam, StringParam, withDefault } from 'use-query-params';
import Breadcrumbs from '@/components/Breadcrumbs';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';
import styles from './[...slug]/page.module.css';

function CategoriesPageContent() {
  const searchParams = useSearchParams();
  const flagType = searchParams.get('flag_type');
  const categoryId = searchParams.get('category_id');
  
  const [sortBy, setSortBy] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 12,
    count: 0
  });
  const [currentCategory, setCurrentCategory] = useState(null);

  const [priceMin, setPriceMin] = useQueryParam('price_min', NumberParam);
  const [priceMax, setPriceMax] = useQueryParam('price_max', NumberParam);
  const [inStock, setInStock] = useQueryParam('in_stock', withDefault(StringParam, ''));
  const [sort, setSort] = useQueryParam('sort', NumberParam);
  const [material, setMaterial] = useQueryParam('material', StringParam);
  const [colors, setColors] = useQueryParam('colors', StringParam);
  const [bestseller, setBestseller] = useQueryParam('bestseller', withDefault(StringParam, ''));
  
  const [dynamicFilters, setDynamicFilters] = useState({});

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
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getFlagTitle = (flagType) => {
    switch (flagType) {
      case 'new_products_flag_category':
        return 'Новинки';
      case 'bestseller_flag_category':
        return 'Бестселлеры';
      case 'sale_flag_category':
        return 'Распродажа';
      default:
        return 'Товары';
    }
  };

  const updateUrlWithDynamicFilters = (filters) => {
    const url = new URL(window.location.href);
    
    Object.keys(url.searchParams).forEach(key => {
      if (!['price_min', 'price_max', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'flag_type', 'category_id'].includes(key)) {
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
  };

  const parseDynamicFiltersFromUrl = () => {
    const url = new URL(window.location.href);
    const dynamicFilters = {};
    
    Object.keys(url.searchParams).forEach(key => {
      if (!['price_min', 'price_max', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'flag_type', 'category_id'].includes(key)) {
        const value = url.searchParams.get(key);
        if (value && value.includes(',')) {
          dynamicFilters[key] = value.split(',').map(v => parseInt(v));
        } else if (value) {
          dynamicFilters[key] = [parseInt(value)];
        }
      }
    });
    
    return dynamicFilters;
  };

  const fetchFilters = async () => {
    try {
      setLoading(true);
      
      const requestBody = {};
      if (categoryId) {
        requestBody.category_id = parseInt(categoryId);
      } else {
        requestBody.subcategory_id = null;
      }
      
      const response = await fetch('/api/products/subcategory-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[fetchFilters] API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch filters');
      }
      const data = await response.json();
      setFilters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[fetchFilters] Error:', error);
      setError(`Ошибка загрузки фильтров: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (appliedFilters = {}, page = 1) => {
    try {
      setProductsLoading(true);
      
      const priceFilter = filters.find(f => f.slug === 'price');
      const defaultMinPrice = priceFilter?.min || 0;
      const defaultMaxPrice = priceFilter?.max || 100000;
      
      const requestBody = {
        page: page - 1,
        limit: pagination.page_size,
        flag_type: flagType
      };

      if (categoryId) {
        requestBody.category_id = parseInt(categoryId);
      }

      if (typeof sortBy === 'number') {
        requestBody.sort = sortBy;
      }

      requestBody.in_stock = appliedFilters.in_stock === true;

      if (Array.isArray(appliedFilters.material) && appliedFilters.material.length > 0) {
        requestBody.material = appliedFilters.material;
      }

      if (appliedFilters.bestseller === true) {
        requestBody.bestseller = true;
      }

      if (Array.isArray(appliedFilters.colors) && appliedFilters.colors.length > 0) {
        requestBody.colors = appliedFilters.colors.map(color => parseInt(color));
      }

      if (
        appliedFilters.sizes &&
        (
          (Number(appliedFilters.sizes.width) || 0) > 0 ||
          (Number(appliedFilters.sizes.height) || 0) > 0 ||
          (Number(appliedFilters.sizes.depth) || 0) > 0
        )
      ) {
        requestBody.sizes = {
          width: Number(appliedFilters.sizes.width) || 0,
          height: Number(appliedFilters.sizes.height) || 0,
          depth: Number(appliedFilters.sizes.depth) || 0
        };
      }

      const selectedMinPrice = appliedFilters.price?.min;
      const selectedMaxPrice = appliedFilters.price?.max;
      if (
        (typeof selectedMinPrice === 'number' && selectedMinPrice !== defaultMinPrice) ||
        (typeof selectedMaxPrice === 'number' && selectedMaxPrice !== defaultMaxPrice)
      ) {
        requestBody.price = {
          min: typeof selectedMinPrice === 'number' ? selectedMinPrice : defaultMinPrice,
          max: typeof selectedMaxPrice === 'number' ? selectedMaxPrice : defaultMaxPrice
        };
      }

      if (appliedFilters.search && appliedFilters.search.trim() !== "") {
        requestBody.search = appliedFilters.search.trim();
      }

      const selectFilters = (filters || []).filter(f => f && f.type === 'select');
      for (const f of selectFilters) {
        if (!f.slug || f.slug === 'colors' || f.slug === 'sort') continue;
        const value = appliedFilters?.[f.slug];
        if (Array.isArray(value) && value.length > 0) {
          requestBody[f.slug] = value;
        }
      }

      console.log('[fetchProducts] request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/products/models-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[fetchProducts] API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch products');
      }

      const data = await response.json();
      
      if (page === 1) {
        setProducts(data.results || []);
      } else {
        setProducts(prev => [...prev, ...(data.results || [])]);
      }
      
      setPagination(prev => ({
        ...prev,
        page: page,
        count: data.count || 0
      }));
    } catch (error) {
      console.error('[fetchProducts] Error:', error);
      setError(`Ошибка загрузки товаров: ${error.message}`);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleFiltersApply = (newFilters) => {
    console.log('Применяем фильтры:', newFilters);
    setAppliedFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    setPriceMin(newFilters.price?.min);
    setPriceMax(newFilters.price?.max);
    setInStock(newFilters.in_stock ? 'true' : '');
    setSort(newFilters.sort);
    setMaterial(newFilters.material?.[0]);
    setColors(newFilters.colors?.join(','));
    setBestseller(newFilters.bestseller ? 'true' : '');
    
    const dynamicFilterData = {};
    Object.keys(newFilters).forEach(key => {
      if (!['price', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'sizes', 'search'].includes(key)) {
        dynamicFilterData[key] = newFilters[key];
      }
    });
    setDynamicFilters(dynamicFilterData);
    updateUrlWithDynamicFilters(dynamicFilterData);
    
    fetchProducts(newFilters, 1);
  };

  const handleLoadMore = () => {
    if (products.length < pagination.count) {
      fetchProducts(appliedFilters, pagination.page + 1);
    }
  };

  useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (!categoryId) return;
      
      try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        const category = categories.find(c => c.id === parseInt(categoryId));
        if (category) {
          setCurrentCategory(category);
        }
      } catch (error) {
        console.error('Ошибка загрузки информации о категории:', error);
      }
    };

    fetchCategoryInfo();
  }, [categoryId]);

  useEffect(() => {
    fetchFilters();
  }, [categoryId]);

  useEffect(() => {
    if (!flagType) return;
    setProducts([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts(appliedFilters, 1);
  }, [sortBy, categoryId, flagType]);

  useEffect(() => {
    const urlDynamicFilters = parseDynamicFiltersFromUrl();
    console.log('Динамические фильтры из URL:', urlDynamicFilters);
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
    console.log('URL параметры изменились:', { priceMin, priceMax, inStock, sort, material, colors, bestseller, dynamicFilters });
    
    if (filters.length > 0) {
      const urlFilters = {
        price: priceMin || priceMax ? { min: priceMin, max: priceMax } : undefined,
        in_stock: inStock === 'true',
        sort: sort,
        material: material ? [material] : undefined,
        colors: colors ? colors.split(',').map(c => parseInt(c)) : undefined,
        bestseller: bestseller === 'true',
        ...dynamicFilters
      };
      
      const hasFilters = Object.values(urlFilters).some(value => 
        value !== undefined && value !== false && (!Array.isArray(value) || value.length > 0)
      );
      
      console.log('Собранные фильтры из URL:', urlFilters);
      console.log('Есть ли фильтры:', hasFilters);
      
      if (hasFilters) {
        setAppliedFilters(urlFilters);
        fetchProducts(urlFilters, 1);
      } else if (Object.keys(dynamicFilters).length === 0 && !priceMin && !priceMax && !inStock && !sort && !material && !colors && !bestseller) {
        setAppliedFilters({});
      }
    }
  }, [filters, priceMin, priceMax, inStock, sort, material, colors, bestseller, dynamicFilters]);

  const breadcrumbs = [
    { text: 'Главная', href: '/' },
    ...(currentCategory ? [{ text: currentCategory.title, href: `/categories/${currentCategory.slug}` }] : []),
    { text: getFlagTitle(flagType), href: '#' },
  ];

  const transformProduct = (product) => {
    return product;
  };

  if (!flagType) {
    return (
      <main className={styles.page}>
        <div className={styles.noProducts}>
          Неверные параметры запроса
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />
      
      <div className={styles.hero}>
        <div className={styles.hero__content}>
          <h1 className={styles.hero__title}>
            {getFlagTitle(flagType)}
            {currentCategory && ` - ${currentCategory.title}`}
          </h1>
          <p className={styles.hero__description}>
            {(() => {
              if (!currentCategory) return 'Описание категории';
              
              switch (flagType) {
                case 'new_products_flag_category':
                  return `Новинки в категории "${currentCategory.title}"`;
                case 'bestseller_flag_category':
                  return `Бестселлеры в категории "${currentCategory.title}"`;
                case 'sale_flag_category':
                  return `Распродажа в категории "${currentCategory.title}"`;
                default:
                  return currentCategory.description || 'Описание категории';
              }
            })()} 
          </p>
          <img 
            className={styles.hero__img} 
            src={(() => {
              if (!currentCategory) return "/category.png";
              
              switch (flagType) {
                case 'new_products_flag_category':
                  return currentCategory.photo_new_products ? `https://aldalinde.ru${currentCategory.photo_new_products}` : "/Images/новинки.png";
                case 'bestseller_flag_category':
                  return currentCategory.photo_bestsellers ? `https://aldalinde.ru${currentCategory.photo_bestsellers}` : "/Images/бестселлеры.png";
                case 'sale_flag_category':
                  return currentCategory.photo_sale ? `https://aldalinde.ru${currentCategory.photo_sale}` : "/Images/распродажа.png";
                default:
                  return "/category.png";
              }
            })()} 
            alt={getFlagTitle(flagType)} 
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
        <div className={styles.products}>
          {productsLoading && products.length === 0 ? (
            <div className={styles.loading}>Загрузка товаров...</div>
          ) : products.length > 0 ? (
            <>
              {products.map(product => (
                <ProductCard key={product.id} product={transformProduct(product)} />
              ))}
              {products.length < pagination.count && (
                <div className={styles.loadMore}>
                  <button 
                    onClick={handleLoadMore}
                    disabled={productsLoading}
                    className={styles.loadMoreButton}
                  >
                    {productsLoading ? 'Загрузка...' : 'Показать еще'}
                  </button>
                </div>
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

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoriesPageContent />
    </Suspense>
  );
}
