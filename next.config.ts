import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security",  value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options",      value: "nosniff" },
          { key: "X-Frame-Options",             value: "DENY" },
          { key: "X-XSS-Protection",            value: "1; mode=block" },
          { key: "Referrer-Policy",             value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sandbox.web.squarecdn.com https://web.squarecdn.com",
              "style-src 'self' 'unsafe-inline' https://sandbox.web.squarecdn.com https://web.squarecdn.com",
              "font-src 'self' https://sandbox.web.squarecdn.com https://web.squarecdn.com",
              "img-src 'self' data: blob: https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co https://connect.squareupsandbox.com https://connect.squareup.com https://pci-connect.squareupsandbox.com https://pci-connect.squareup.com",
              "frame-src https://sandbox.web.squarecdn.com https://web.squarecdn.com",
            ].join("; "),
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
