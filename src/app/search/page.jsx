'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';
import styles from '../categories/[...slug]/page.module.css';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [sortBy, setSortBy] = useState(1);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 12,
    count: 0
  });

  const sortOptions = [
    { value: 1, label: 'Популярные' },
    { value: 2, label: 'Высокий рейтинг' },
    { value: 3, label: 'По возрастанию цены' },
    { value: 4, label: 'По убыванию цены' }
  ];


  const fetchProducts = async (page = 1) => {
    try {
      setProductsLoading(true);
      
      const requestBody = {
        page: page - 1,
        limit: pagination.page_size,
        search: query,
        sort: sortBy
      };

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

  const handleLoadMore = () => {
    if (products.length < pagination.count) {
      fetchProducts(pagination.page + 1);
    }
  };
  

  useEffect(() => {
    if (!query) return;
    setProducts([]);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts(1);
  }, [sortBy, query]);

  const breadcrumbs = [
    { text: 'Главная', href: '/' },
    { text: `Поиск: "${query}"`, href: '#' },
  ];

  const transformProduct = (product) => {
    return product;
  };

  if (!query) {
    return (
      <main className={styles.page}>
        <div className={styles.noProducts}>
          Введите поисковый запрос
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
            Результаты поиска: "{query}"
          </h1>
          <p className={styles.hero__description}>
            Найдено товаров: {pagination.count}
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <SortSelect 
          value={sortBy} 
          onChange={setSortBy} 
          options={sortOptions} 
        />
      </div>

      <div className={styles.content}>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <SearchPageContent />
    </Suspense>
  );
} 