import { NextResponse } from 'next/server';

// Временные данные для демонстрации
const categoryData = {
  "trending": {
    name: "В тренде",
    description: "Популярные товары и новинки",
    products: [
      { id: 101, name: "Диван 'Комфорт'", price: 29999, image: "/images/sofa1.jpg" },
      { id: 102, name: "Стол 'Модерн'", price: 15999, image: "/images/table1.jpg" },
      { id: 103, name: "Кресло 'Уют'", price: 8999, image: "/images/chair1.jpg" },
    ]
  },
  "trending/new-season": {
    name: "Новинки сезона",
    description: "Новые поступления в нашем магазине",
    products: [
      { id: 201, name: "Диван 'Новинка'", price: 35999, image: "/images/sofa2.jpg" },
      { id: 202, name: "Стол 'Современный'", price: 18999, image: "/images/table2.jpg" },
    ]
  },
  "trending/bestsellers": {
    name: "Бестселлеры",
    description: "Самые популярные товары",
    products: [
      { id: 301, name: "Диван 'Бестселлер'", price: 32999, image: "/images/sofa3.jpg" },
      { id: 302, name: "Кресло 'Популярное'", price: 9999, image: "/images/chair2.jpg" },
    ]
  },
  "trending/weekly-sales": {
    name: "Скидки недели",
    description: "Товары со скидками",
    products: [
      { id: 401, name: "Диван 'Скидка'", price: 24999, image: "/images/sofa4.jpg" },
      { id: 402, name: "Стол 'Акция'", price: 12999, image: "/images/table3.jpg" },
    ]
  },
  "sofas": {
    name: "Диваны",
    description: "Широкий выбор диванов для вашего дома",
    products: [
      { id: 1, name: "Диван 'Комфорт'", price: 29999, image: "/images/sofa1.jpg" },
      { id: 2, name: "Диван 'Уют'", price: 34999, image: "/images/sofa2.jpg" },
      // Добавьте больше товаров
    ]
  },
  "sofas/straight": {
    name: "Прямые диваны",
    description: "Классические прямые диваны",
    products: [
      { id: 3, name: "Прямой диван 'Классик'", price: 27999, image: "/images/sofa3.jpg" },
      { id: 4, name: "Прямой диван 'Модерн'", price: 32999, image: "/images/sofa4.jpg" },
      // Добавьте больше товаров
    ]
  },
  // Добавьте данные для других категорий
};

export async function GET(request, { params }) {
  const { slug } = params;
  const categoryPath = Array.isArray(slug) ? slug.join('/') : slug;
  
  const data = categoryData[categoryPath] || {
    name: categoryPath.split('/').pop(),
    description: "Категория товаров",
    products: []
  };

  return NextResponse.json(data);
} 