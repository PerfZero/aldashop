export default async function sitemap() {
  const baseUrl = 'https://aldalinde.ru';

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  let categoryPages = [];
  let productPages = [];

  try {
    const categoriesRes = await fetch('https://aldalinde.ru/api/products/category-list/', {
      cache: 'no-store',
    });
    const categories = await categoriesRes.json();

    if (Array.isArray(categories)) {
      categories.forEach((category) => {
        categoryPages.push({
          url: `${baseUrl}/categories/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });

        if (category.subcategories && Array.isArray(category.subcategories)) {
          category.subcategories.forEach((sub) => {
            categoryPages.push({
              url: `${baseUrl}/categories/${category.slug}/${sub.slug}`,
              lastModified: new Date(),
              changeFrequency: 'daily',
              priority: 0.7,
            });
          });
        }
      });
    }
  } catch (error) {
    console.error('Sitemap: ошибка загрузки категорий:', error);
  }

  try {
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    const limit = 100;

    while (hasMore) {
      const res = await fetch('https://aldalinde.ru/api/products/models-list/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, limit }),
        cache: 'no-store',
      });

      const data = await res.json();

      if (data.results && Array.isArray(data.results)) {
        allProducts = [...allProducts, ...data.results];
        hasMore = data.results.length === limit;
        page++;
      } else {
        hasMore = false;
      }

      if (page > 50) break;
    }

    productPages = allProducts.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Sitemap: ошибка загрузки товаров:', error);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
