import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductClient from './ProductClient';
import styles from './page.module.css';

async function getProduct(id) {
  try {
    const response = await fetch('https://aldalinde.ru/api/products/product-page/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({ product_id: parseInt(id) }),
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error) return null;

    if (data.photos && Array.isArray(data.photos)) {
      data.photos = data.photos.map(photo => ({
        ...photo,
        photo: photo.photo.startsWith('http') ? photo.photo : `https://aldalinde.ru${photo.photo}`
      }));
    }

    if (data.available_sizes && Array.isArray(data.available_sizes)) {
      data.available_sizes = data.available_sizes.map(size => ({
        ...size,
        title: size.value || size.title || size.name || size.dimensions || `${size.width}x${size.height}x${size.depth}` || 'Размер'
      }));
    }

    try {
      const reviewsResponse = await fetch(`https://aldalinde.ru/api/products/reviews/${parseInt(id)}/?limit=1&page=1`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        data.reviews_count = reviewsData.count || 0;
      }
    } catch {
      data.reviews_count = 0;
    }

    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Товар не найден',
    };
  }

  const mainPhoto = product.photos?.find(photo => photo.main_photo) || product.photos?.[0];
  const colorTitle = product.color?.title || product.available_colors?.[0]?.title || '';
  const titleWithColor = colorTitle ? `${product.title} (${colorTitle})` : product.title;
  const descriptionText = product.description || `${product.title}${colorTitle ? ` цвет ${colorTitle}` : ''} - купить в интернет-магазине ALDA`;

  return {
    title: titleWithColor,
    description: descriptionText,
    openGraph: {
      title: titleWithColor,
      description: descriptionText,
      images: mainPhoto?.photo ? [mainPhoto.photo] : [],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const mainPhoto = product.photos?.find(photo => photo.main_photo) || product.photos?.[0];
  
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || '',
    image: mainPhoto?.photo || '',
    sku: product.generated_article || '',
    brand: {
      '@type': 'Brand',
      name: 'ALDA',
    },
    offers: {
      '@type': 'Offer',
      url: `https://aldalinde.ru/product/${product.id}`,
      priceCurrency: 'RUB',
      price: product.discounted_price || product.price,
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'ALDA',
      },
    },
    ...(product.avg_rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.avg_rating,
        reviewCount: product.reviews_count || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const breadcrumbs = [{ text: 'Главная', href: '/' }];

  if (product.category) {
    breadcrumbs.push({
      text: product.category.title,
      href: `/categories/${product.category.slug}`
    });
  }

  if (product.subcategory) {
    breadcrumbs.push({
      text: product.subcategory.title,
      href: `/categories/${product.category?.slug}/${product.subcategory.slug}`
    });
  }

  breadcrumbs.push({ text: product.title, href: `/product/${id}` });

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Breadcrumbs items={breadcrumbs} />
      <ProductClient initialProduct={product} productId={id} />
    </main>
  );
}
