/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@heroui/react", "@heroui/styles", "tailwind-variants"],
  images: {
    // Allow local brand SVG marks (OpenAI / AWS) to render via next/image,
    // sandboxed so they can't execute scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
