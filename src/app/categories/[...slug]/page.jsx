'use client';

import { useState } from 'react';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';
import styles from './page.module.css';

// Временные данные для демонстрации
const mockProducts = [
  {
    id: 1,
    name: 'Диван-кровать Скаген бежевого цвета',
    article: 'IMR-1798647',
    price: '25 000',
    image: '/sofa.png',
    hoverImage: '/sofa1-hover.jpg',
    isBestseller: true,
    discount: 15,
    sizes: ['80x200 см', '90x300 см', '90x300 см'],
    materials: ['шенилл', 'гобелен', 'рогожка'],
    colors: [
      { name: 'Бежевый', hex: '#E8D0B3' },
      { name: 'Серый', hex: '#A0A0A0' },
      { name: 'Коричневый', hex: '#8B4513' },
      { name: 'Синий', hex: '#4169E1' },
      { name: 'Зеленый', hex: '#228B22' },
      { name: 'Красный', hex: '#B22222' }
    ]
  },
  {
    id: 2,
    name: 'Диван-кровать Модерн',
    article: 'IMR-1798648',
    price: '32 000',
    image: '/sofa.png',
    hoverImage: '/sofa2-hover.jpg',
    isBestseller: false,
    sizes: ['90x200 см', '100x300 см'],
    materials: ['экокожа', 'велюр'],
    colors: [
      { name: 'Черный', hex: '#000000' },
      { name: 'Белый', hex: '#FFFFFF' },
      { name: 'Серый', hex: '#808080' }
    ]
  },
  {
    id: 3,
    name: 'Диван-кровать Классик',
    article: 'IMR-1798649',
    price: '28 500',
    image: '/sofa.png',
    hoverImage: '/sofa3-hover.jpg',
    isBestseller: true,
    discount: 10,
    sizes: ['85x200 см', '95x300 см'],
    materials: ['шенилл', 'гобелен'],
    colors: [
      { name: 'Бежевый', hex: '#E8D0B3' },
      { name: 'Коричневый', hex: '#8B4513' },
      { name: 'Серый', hex: '#A0A0A0' }
    ]
  },
  {
    id: 4,
    name: 'Диван-кровать Минималист',
    article: 'IMR-1798650',
    price: '22 000',
    image: '/sofa.png',
    hoverImage: '/sofa4-hover.jpg',
    isBestseller: false,
    sizes: ['80x200 см', '90x300 см'],
    materials: ['экокожа', 'велюр', 'шенилл'],
    colors: [
      { name: 'Черный', hex: '#000000' },
      { name: 'Белый', hex: '#FFFFFF' },
      { name: 'Серый', hex: '#808080' },
      { name: 'Бежевый', hex: '#E8D0B3' },
      { name: 'Коричневый', hex: '#8B4513' }
    ]
  },
  {
    id: 5,
    name: 'Диван-кровать Комфорт',
    article: 'IMR-1798651',
    price: '35 000',
    image: '/sofa.png',
    hoverImage: '/sofa5-hover.jpg',
    isBestseller: true,
    discount: 20,
    sizes: ['90x200 см', '100x300 см', '110x300 см'],
    materials: ['шенилл', 'гобелен', 'рогожка', 'велюр'],
    colors: [
      { name: 'Бежевый', hex: '#E8D0B3' },
      { name: 'Серый', hex: '#A0A0A0' },
      { name: 'Коричневый', hex: '#8B4513' }
    ]
  },
  {
    id: 6,
    name: 'Диван-кровать Эконом',
    article: 'IMR-1798652',
    price: '18 500',
    image: '/sofa6.jpg',
    hoverImage: '/sofa6-hover.jpg',
    isBestseller: false,
    discount: 5,
    sizes: ['80x200 см', '90x300 см'],
    materials: ['шенилл', 'гобелен'],
    colors: [
      { name: 'Бежевый', hex: '#E8D0B3' },
      { name: 'Серый', hex: '#A0A0A0' },
      { name: 'Коричневый', hex: '#8B4513' },
      { name: 'Синий', hex: '#4169E1' }
    ]
  },
  {
    id: 7,
    name: 'Диван-кровать Премиум',
    article: 'IMR-1798653',
    price: '42 000',
    image: '/sofa.png',
    hoverImage: '/sofa7-hover.jpg',
    isBestseller: true,
    sizes: ['90x200 см', '100x300 см', '110x300 см', '120x300 см'],
    materials: ['экокожа', 'велюр', 'шенилл', 'гобелен', 'рогожка'],
    colors: [
      { name: 'Бежевый', hex: '#E8D0B3' },
      { name: 'Серый', hex: '#A0A0A0' },
      { name: 'Коричневый', hex: '#8B4513' },
      { name: 'Черный', hex: '#000000' },
      { name: 'Белый', hex: '#FFFFFF' },
      { name: 'Синий', hex: '#4169E1' },
      { name: 'Зеленый', hex: '#228B22' },
      { name: 'Красный', hex: '#B22222' }
    ]
  },
  {
    id: 8,
    name: 'Диван-кровать Компакт',
    article: 'IMR-1798654',
    price: '19 500',
    image: '/sofa.png',
    hoverImage: '/sofa8-hover.jpg',
    isBestseller: false,
    discount: 8,
    sizes: ['70x200 см', '80x200 см'],
    materials: ['шенилл', 'гобелен'],
    colors: [
      { name: 'Бежевый', hex: '#E8D0B3' },
      { name: 'Серый', hex: '#A0A0A0' },
      { name: 'Коричневый', hex: '#8B4513' }
    ]
  },
  {
    id: 9,
    name: 'Диван-кровать Семейный',
    article: 'IMR-1798655',
    price: '38 000',
    image: '/sofa.png',
    hoverImage: '/sofa9-hover.jpg',
    isBestseller: true,
    discount: 12,
    sizes: ['100x200 см', '110x300 см', '120x300 см'],
    materials: ['шенилл', 'гобелен', 'рогожка', 'велюр'],
    colors: [
      { name: 'Бежевый', hex: '#E8D0B3' },
      { name: 'Серый', hex: '#A0A0A0' },
      { name: 'Коричневый', hex: '#8B4513' },
      { name: 'Черный', hex: '#000000' },
      { name: 'Белый', hex: '#FFFFFF' }
    ]
  }
];

export default function CategoryPage({ params }) {
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);

  const breadcrumbs = [
    { text: 'Главная', href: '/' },
    { text: 'Диваны', href: '/categories/sofas' },
    { text: 'Все диваны', href: '/categories/sofas/all' }
  ];

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
        <Filters isVisible={showFilters} onClose={() => setShowFilters(false)} />
        <div className={styles.products}>
          {mockProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
