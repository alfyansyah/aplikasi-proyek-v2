/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public', // Menyimpan file service worker di folder public
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // PWA mati saat coding, nyala saat deploy
});

const nextConfig = {
  experimental: {
    serverActions: true,
  },
  // Izinkan gambar dari Supabase
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);