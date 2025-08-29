import { Suspense } from 'react';
import styles from './page.module.css';

async function getSearchResults(query) {
  return [];
}

export const metadata = {
  title: 'Поиск товаров',
  description: 'Поиск товаров в нашем магазине',
};

function SearchContent({ searchParams }) {
  const query = searchParams.q || '';
  const products = getSearchResults(query);

  return (
    <div className={styles.container}>
      <h1>Поиск товаров</h1>
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
} 