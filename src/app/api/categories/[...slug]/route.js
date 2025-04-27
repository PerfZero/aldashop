import { NextResponse } from 'next/server';

// Временные данные для демонстрации
const categories = {
  'sofas': {
    name: 'Диваны',
    description: 'Широкий выбор диванов для вашего дома',
    image: '/images/categories/sofas.jpg',
    products: [
      {
        id: 1,
        name: 'Диван "Комфорт"',
        price: 29999,
        image: '/images/products/sofa-1.jpg'
      },
      {
        id: 2,
        name: 'Диван "Уют"',
        price: 34999,
        image: '/images/products/sofa-2.jpg'
      }
    ]
  },
  'sofas/straight': {
    name: 'Прямые диваны',
    description: 'Классические прямые диваны',
    image: '/images/categories/straight-sofas.jpg',
    products: [
      {
        id: 3,
        name: 'Прямой диван "Классик"',
        price: 25999,
        image: '/images/products/straight-sofa-1.jpg'
      }
    ]
  },
  'trending': {
    name: 'В тренде',
    description: 'Популярные товары',
    image: '/images/categories/trending.jpg',
    products: [
      {
        id: 4,
        name: 'Диван "Модерн"',
        price: 39999,
        image: '/images/products/trending-sofa-1.jpg'
      }
    ]
  },
  'trending/new-season': {
    name: 'Новинки сезона',
    description: 'Новые поступления',
    image: '/images/categories/new-season.jpg',
    products: [
      {
        id: 5,
        name: 'Диван "Новинка"',
        price: 45999,
        image: '/images/products/new-sofa-1.jpg'
      }
    ]
  }
};

export async function GET(request, { params }) {
  const { slug } = params;
  const categoryPath = slug.join('/');
  
  const categoryData = categories[categoryPath];
  
  if (!categoryData) {
    return NextResponse.json(
      { error: 'Категория не найдена' },
      { status: 404 }
    );
  }

  return NextResponse.json(categoryData);
} 