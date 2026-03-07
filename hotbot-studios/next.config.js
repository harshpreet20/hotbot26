/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  images: {
    domains: ['hotbotstudios.com'],
  },
  async redirects() {
    return [
      // Legacy service URL redirects (301 permanent for SEO juice preservation)
      { source: '/marketing-services', destination: '/digital-marketing', permanent: true },
      { source: '/marketing-services/:path*', destination: '/digital-marketing/:path*', permanent: true },
      { source: '/consultancy', destination: '/marketing-consulting', permanent: true },
      { source: '/consultancy/:path*', destination: '/marketing-consulting/:path*', permanent: true },
      // Team member vCard pages
      { source: '/team/gopalsharma', destination: '/vcard/gopal/', permanent: false },
      // Sub-page slug renames within digital-marketing
      { source: '/digital-marketing/analytics', destination: '/digital-marketing/marketing-analytics', permanent: true },
      { source: '/digital-marketing/cro', destination: '/digital-marketing/conversion-rate-optimization', permanent: true },
      { source: '/digital-marketing/ppc', destination: '/digital-marketing/ppc-management', permanent: true },
      { source: '/digital-marketing/seo', destination: '/digital-marketing/seo-services', permanent: true },
      { source: '/digital-marketing/social-media', destination: '/digital-marketing/social-media-marketing', permanent: true },
    ];
  },
};

module.exports = nextConfig;
