'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useQueryParam, NumberParam, StringParam, withDefault } from 'use-query-params';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';
import styles from './page.module.css';

function CategoryPageContent() {
  const params = useParams();
  const slugDep = Array.isArray(params?.slug) ? params.slug.join('/') : (params?.slug || '');
  const [sortBy, setSortBy] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
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

  const updateUrlWithDynamicFilters = (filters) => {
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
  };

  const parseDynamicFiltersFromUrl = () => {
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
  };



  const fetchFilters = async () => {
    try {
      setLoading(true);
      if (!categoryId && !subcategoryId) return;
      const requestBody = {};
      if (categoryId) {
        requestBody.category_id = categoryId;
      }
      
      if (subcategoryId) {
        requestBody.subcategory_id = subcategoryId;
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
      const sizesFilter = filters.find(f => f.slug === 'sizes');
      const defaultMinPrice = priceFilter?.min || 0;
      const defaultMaxPrice = priceFilter?.max || 100000;
      
      const requestBody = {
        page: page - 1,
        limit: pagination.page_size
      };

      if (categoryId) {
        requestBody.category_id = categoryId;
      }
      
      if (subcategoryId) {
        requestBody.subcategory_id = subcategoryId;
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
    
    console.log('URL параметры после обновления:');
    console.log('priceMin:', newFilters.price?.min);
    console.log('priceMax:', newFilters.price?.max);
    console.log('inStock:', newFilters.in_stock ? 'true' : '');
    console.log('material:', newFilters.material?.[0]);
    console.log('colors:', newFilters.colors?.join(','));
    console.log('dynamicFilters:', dynamicFilterData);
    
    fetchProducts(newFilters, 1);
  };

  const handleLoadMore = () => {
    if (products.length < pagination.count) {
      fetchProducts(appliedFilters, pagination.page + 1);
    }
  };

  useEffect(() => {
    const resolveIds = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        
        const sortedData = data.sort((a, b) => {
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
        console.log('Looking for category with slug:', currentSlug);
        console.log('Available categories:', sortedData.map(c => ({ id: c.id, slug: c.slug, title: c.title })));
        
        const cat = sortedData.find(c => c.slug === currentSlug);
        if (cat) {
          console.log('Found category:', cat);
          setCategoryId(cat.id);
          setSubcategoryId(null);
          setCurrentCategory({ id: cat.id, slug: cat.slug, title: cat.title, description: cat.description, photo_cover: cat.photo_cover });
          setCurrentSubcategory(null);
          return;
        } else {
          console.log('Category not found for slug:', currentSlug);
        }

        console.log('Searching for subcategory with slug:', currentSlug);
        for (const c of sortedData) {
          console.log('Checking category:', c.title, 'subcategories:', c.subcategories?.map(s => s.slug));
          const sub = (c.subcategories || []).find(s => s.slug === currentSlug);
          if (sub) {
            console.log('Found subcategory:', sub);
            setCategoryId(c.id);
            setSubcategoryId(sub.id);
            setCurrentCategory({ id: c.id, slug: c.slug, title: c.title, description: c.description, photo_cover: c.photo_cover });
            setCurrentSubcategory({ id: sub.id, slug: sub.slug, title: sub.title, description: sub.description, photo_cover: sub.photo_cover });
            return;
          }
        }
      } catch (e) {}
    };
    resolveIds();
  }, [slugDep]);

  useEffect(() => {
    if (categoryId === null && subcategoryId === null) return;
    fetchFilters();
  }, [categoryId, subcategoryId]);

  useEffect(() => {
    if (categoryId === null && subcategoryId === null) return;
    setProducts([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts(appliedFilters, 1);
  }, [sortBy, categoryId, subcategoryId]);

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
          options={(filters.find(f => f.slug === 'sort')?.options) || []} 
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

export default function CategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryPageContent />
    </Suspense>
  );
}
