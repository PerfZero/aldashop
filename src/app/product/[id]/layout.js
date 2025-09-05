export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products/product-page/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: parseInt(resolvedParams.id),
      }),
    });

    if (response.ok) {
      const product = await response.json();
      
      if (product && !product.error && product.title) {
        const price = product.discounted_price || product.price;
        const description = product.description 
          ? `${product.description.substring(0, 150)}...` 
          : `Купить ${product.title} в интернет-магазине ALDA. Цена: ${price?.toLocaleString('ru-RU')} ₽. Доставка по Сочи и Краснодарскому краю.`;

        return {
          title: product.title,
          description: description,
          keywords: `${product.title}, мебель, ${product.category?.title || ''}, ${product.subcategory?.title || ''}, купить, ALDA`,
          openGraph: {
            title: product.title,
            description: description,
            type: 'website',
            images: product.photos?.length > 0 ? [product.photos[0].photo] : [],
          },
        };
      }
    }
  } catch (error) {
    console.error('Ошибка при получении метаданных товара:', error);
  }

  return {
    title: 'Товар',
    description: 'Товар в интернет-магазине ALDA',
  };
}

export default function ProductLayout({ children }) {
  return children;
}
