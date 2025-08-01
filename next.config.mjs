/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '62.181.44.89',
        port: '',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
