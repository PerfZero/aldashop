'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';
import styles from './page.module.css';

export default function CategoryPage() {
  const params = useParams();
  const slugDep = Array.isArray(params?.slug) ? params.slug.join('/') : (params?.slug || '');
  const [sortBy, setSortBy] = useState('recommended');
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
  const [categoryId, setCategoryId] = useState(null);
  const [subcategoryId, setSubcategoryId] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      if (!categoryId && !subcategoryId) return;
      const requestBody = {};
      if (subcategoryId) {
        requestBody.subcategory_id = subcategoryId;
      } else if (categoryId) {
        requestBody.category_id = categoryId;
      }
      const response = await fetch('/api/products/subcategory-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch filters');
      }
      const data = await response.json();
      setFilters(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Ошибка загрузки фильтров');
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
        sort: getSortValue(sortBy),
        in_stock: appliedFilters.in_stock !== undefined ? appliedFilters.in_stock : true,
        page: page - 1,
        limit: pagination.page_size,
        material: appliedFilters.material || 0,
        bestseller: appliedFilters.bestseller || false,
        price: {
          min: appliedFilters.price?.min || defaultMinPrice,
          max: appliedFilters.price?.max || defaultMaxPrice
        },
        colors: appliedFilters.colors && appliedFilters.colors.length > 0 ? appliedFilters.colors.map(color => parseInt(color)) : [],
        sizes: {
          width: appliedFilters.sizes?.width || 0,
          height: appliedFilters.sizes?.height || 0,
          depth: appliedFilters.sizes?.depth || 0
        },
        search: appliedFilters.search || ""
      };
      if (subcategoryId) {
        requestBody.subcategory_id = subcategoryId;
      } else if (categoryId) {
        requestBody.category_id = categoryId;
      }

      

      const response = await fetch('/api/products/models-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
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
      setError('Ошибка загрузки товаров');
    } finally {
      setProductsLoading(false);
    }
  };

  const getSortValue = (sortBy) => {
    switch (sortBy) {
      case 'price_asc': return 1;
      case 'price_desc': return 2;
      case 'name_asc': return 3;
      case 'name_desc': return 4;
      case 'popular': return 5;
      default: return 0;
    }
  };

  const handleFiltersApply = (newFilters) => {
    
    setAppliedFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
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
        const slugArr = Array.isArray(params?.slug) ? params.slug : params?.slug ? [params.slug] : [];
        if (!slugArr || slugArr.length === 0) return;

        if (slugArr.length >= 2) {
          const [catSlug, subSlug] = slugArr;
          const cat = data.find(c => c.slug === catSlug);
          if (cat) {
            const sub = (cat.subcategories || []).find(s => s.slug === subSlug && subSlug !== 'all');
            setCategoryId(cat.id);
            setSubcategoryId(sub ? sub.id : null);
            setCurrentCategory({ id: cat.id, slug: cat.slug, title: cat.title });
            setCurrentSubcategory(sub ? { id: sub.id, slug: sub.slug, title: sub.title } : null);
            return;
          }
        }

        const currentSlug = slugArr[0];
        const cat = data.find(c => c.slug === currentSlug);
        if (cat) {
          setCategoryId(cat.id);
          setSubcategoryId(null);
          setCurrentCategory({ id: cat.id, slug: cat.slug, title: cat.title });
          setCurrentSubcategory(null);
          return;
        }

        for (const c of data) {
          const sub = (c.subcategories || []).find(s => s.slug === currentSlug);
          if (sub) {
            setCategoryId(c.id);
            setSubcategoryId(sub.id);
            setCurrentCategory({ id: c.id, slug: c.slug, title: c.title });
            setCurrentSubcategory({ id: sub.id, slug: sub.slug, title: sub.title });
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

  const breadcrumbs = [
    { text: 'Главная', href: '/' },
    ...(currentCategory ? [{ text: currentCategory.title, href: `/categories/${currentCategory.slug}` }] : []),
    ...(currentSubcategory
      ? [{ text: currentSubcategory.title, href: `/categories/${currentCategory?.slug}/${currentSubcategory.slug}` }]
      : currentCategory ? [{ text: 'Все товары', href: `/categories/${currentCategory.slug}/all` }] : []),
  ];

  const transformProduct = (product) => {
    const mainPhoto = product.product?.photos?.find(photo => photo.main_photo) || product.product?.photos?.[0];
    const secondaryPhoto = product.product?.photos?.find(photo => !photo.main_photo) || product.product?.photos?.[1];
    
    return {
      id: product.id,
      name: product.title,
      article: product.article,
      price: product.product?.price || '0',
              image: mainPhoto?.photo ? `https://aldalinde.ru${mainPhoto.photo}` : '/sofa.png',
        hoverImage: secondaryPhoto?.photo ? `https://aldalinde.ru${secondaryPhoto.photo}` : '/sofa.png',
      isBestseller: product.is_bestseller,
      discount: 0,
      sizes: product.available_sizes?.map(size => size.value) || [],
      materials: product.available_materials?.map(material => material.title) || [],
      colors: product.available_colors?.map(color => ({
        name: color.title || 'Цвет',
        hex: color.code_hex ? `#${color.code_hex}` : '#000000'
      })) || [],
      description: product.description,
      inStock: product.product?.in_stock || false,
      available_sizes: product.available_sizes || [],
      available_colors: product.available_colors || [],
      available_materials: product.available_materials || []
    };
  };

  return (
    <main className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />
      
      <div className={styles.hero}>
        <div className={styles.hero__content}>
          <h1 className={styles.hero__title}>Диваны</h1>
          <p className={styles.hero__description}>
            У нас вы найдете идеальные диваны для любого интерьера: от компактных 2-местных моделей до просторных угловых вариантов. Мягкие, как облако, или умеренно жесткие — выбирайте комфорт на каждый день!
          </p>
          <img className={styles.hero__img} src="/category.png" alt="" />
        </div>
      </div>

      <div className={styles.controls}>
        <button 
          className={styles.filters__button}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
        </button>
        
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      <div className={styles.content}>
        <Filters 
          isVisible={showFilters} 
          onClose={() => setShowFilters(false)}
          filters={filters}
          loading={loading}
          error={error}
          onApply={handleFiltersApply}
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
