/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/calendario', destination: '/calendario/index.html' },
        { source: '/calendario/:path*', destination: '/calendario/index.html' },
        { source: '/admin-calendario', destination: '/admin-calendario/index.html' },
        { source: '/admin-calendario/:path*', destination: '/admin-calendario/index.html' },
        { source: '/Gastos', destination: '/Gastos/index.html' },
        { source: '/Gastos/:path*', destination: '/Gastos/index.html' },
        { source: '/gastos', destination: '/Gastos/index.html' },
        { source: '/gastos/:path*', destination: '/Gastos/index.html' },
        { source: '/aniversario', destination: '/aniversario/index.html' },
        { source: '/aniversario/:path*', destination: '/aniversario/index.html' },
      ],
    };
  },
};

export default nextConfig;
