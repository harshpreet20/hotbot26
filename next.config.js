/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin", "pdfkit"],
    outputFileTracingIncludes: {
      "/api/blog/auth": ["./data/admin.defaults.json"],
      "/api/blog/users": ["./data/admin.defaults.json"],
      "/api/dashboard/invoices/send": [
        "./node_modules/pdfkit/js/**/*",
      ],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "hotbotstudios.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/marketing-services", destination: "/digital-marketing", permanent: true },
      { source: "/marketing-services/:path*", destination: "/digital-marketing/:path*", permanent: true },
      { source: "/consultancy", destination: "/marketing-consulting", permanent: true },
      { source: "/consultancy/:path*", destination: "/marketing-consulting/:path*", permanent: true },
      { source: "/team/gopalsharma", destination: "/vcard/gopal/", permanent: false },
      { source: "/digital-marketing/analytics", destination: "/digital-marketing/marketing-analytics", permanent: true },
      { source: "/digital-marketing/cro", destination: "/digital-marketing/conversion-rate-optimization", permanent: true },
      { source: "/digital-marketing/ppc", destination: "/digital-marketing/ppc-management", permanent: true },
      { source: "/digital-marketing/seo", destination: "/digital-marketing/seo-services", permanent: true },
      { source: "/digital-marketing/social-media", destination: "/digital-marketing/social-media-marketing", permanent: true },
    ];
  },
};

module.exports = nextConfig;
