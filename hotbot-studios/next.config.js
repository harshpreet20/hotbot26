/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  images: {
    domains: ['hotbotstudios.com'],
  },
};

module.exports = nextConfig;
