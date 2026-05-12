/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Low-bandwidth optimizations (Requirements 7.1, 7.2, 7.3)
  compress: true,
  swcMinify: true,

  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    optimizePackageImports: ['react-leaflet', 'leaflet'],
  },

  ...(process.env.NODE_ENV === 'production' && {
    productionBrowserSourceMaps: false,
  }),

  transpilePackages: ['leaflet', 'react-leaflet'],
}

module.exports = nextConfig
