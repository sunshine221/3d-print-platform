/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@3d-print/types', '@3d-print/utils', '@3d-print/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
      {
        source: '/storage/:path*',
        destination: 'http://localhost:9000/3dprint/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
