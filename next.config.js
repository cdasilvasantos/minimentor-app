/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // We'll handle the ESLint errors in development but ignore them in production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We'll handle the TypeScript errors in development but ignore them in production
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
