/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export para Render Static Site (gratis, sin sleep)
  output: 'export',
  images: { unoptimized: true },
  // trailingSlash genera /ruta/index.html — más amigable para hosts estáticos
  trailingSlash: true,
};
module.exports = nextConfig;
