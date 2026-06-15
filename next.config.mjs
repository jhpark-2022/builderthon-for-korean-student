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
  // Long-cache immutable static brand assets (logos / fonts in /public).
  async headers() {
    return [
      {
        source: "/:all*(png|woff2|svg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
