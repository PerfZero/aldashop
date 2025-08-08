/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aldalinde.ru',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
