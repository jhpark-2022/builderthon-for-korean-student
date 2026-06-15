/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Prefer modern formats for the partner logos.
    formats: ["image/avif", "image/webp"],
    // Allow local brand SVG marks (OpenAI / AWS) to render via next/image,
    // sandboxed so they can't execute scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Tighter tree-shaking for framer-motion's barrel imports.
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  async headers() {
    return [
      // Long-cache immutable static brand assets (logos / fonts in /public).
      {
        source: "/:all*(png|woff2|svg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Baseline security headers. Intentionally NO Content-Security-Policy here:
      // the WebGL/three.js path + framer-motion inline styles + next/og need a
      // carefully-tested policy, so CSP is tracked separately. HSTS omits
      // `preload` to avoid an irreversible preload-list commitment.
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
