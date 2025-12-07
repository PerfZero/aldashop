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
    const categoriesRes = await fetch('https://aldalinde.ru/api/categories', {
      next: { revalidate: 3600 },
    });
    const categoriesData = await categoriesRes.json();
    
    if (categoriesData.success && categoriesData.data) {
      categoriesData.data.forEach((category) => {
        categoryPages.push({
          url: `${baseUrl}/categories/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });

        if (category.subcategories) {
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
    console.error('Ошибка загрузки категорий для sitemap:', error);
  }

  try {
    const productsRes = await fetch('https://aldalinde.ru/api/products/models-list', {
      next: { revalidate: 3600 },
    });
    const productsData = await productsRes.json();
    
    if (productsData.success && productsData.data) {
      productPages = productsData.data.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Ошибка загрузки товаров для sitemap:', error);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
