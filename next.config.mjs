/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    scrollRestoration: true, // Включаем встроенное восстановление скролла
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aldalinde.ru',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
