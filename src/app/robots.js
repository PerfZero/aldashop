export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/account/', '/cart/', '/favorites/'],
      },
    ],
    sitemap: 'https://aldalinde.ru/sitemap.xml',
    host: 'https://aldalinde.ru',
  };
}
