import styles from './page.module.css';

async function getSearchResults(query) {
  // Здесь будет ваш API запрос для поиска товаров
  // const response = await fetch(`${process.env.API_URL}/api/search?q=${query}`, { next: { revalidate: 3600 } });
  // return response.json();
  return []; // Временный возврат пустого массива
}

export const metadata = {
  title: 'Поиск товаров',
  description: 'Поиск товаров в нашем магазине',
};

export default async function SearchPage({ searchParams }) {
  const query = searchParams.q || '';
  const products = await getSearchResults(query);

  return (
    <div className={styles.container}>
      <h1>Поиск товаров</h1>
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            {/* Здесь будет карточка товара */}
          </div>
        ))}
      </div>
    </div>
  );
} 