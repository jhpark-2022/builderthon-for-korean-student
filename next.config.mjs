const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

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
      // DECIDED 2026-10-08 (사용자 승인, 성능 리뷰 10): 사진, 영상, PDF는 위 규칙 밖이라 방문마다 재검증했습니다
      // (max-age=0). 파일 이름에 해시가 없어 immutable은 쓰지 않고 30일만 둡니다. 같은 이름으로 파일을
      // 바꾸면 최대 30일 동안 옛 파일이 보일 수 있으니, 바꿀 때는 이름을 바꾸세요.
      {
        source: "/:all*(jpg|jpeg|webp|mp4|pdf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000" },
        ],
      },
      // Baseline security headers. HSTS omits `preload` to avoid an irreversible
      // preload-list commitment.
      // DECIDED 2026-10-08 (사용자 승인, 보안 감사 L5): CSP는 Report-Only로 먼저 둡니다. 막지 않고 위반만
      // 콘솔에 남기므로 아무것도 깨지지 않습니다. WebGL, framer-motion의 인라인 스타일, 레이아웃의 인라인
      // 부트스트랩 스크립트 때문에 script와 style에 'unsafe-inline'이 들어 있습니다. 콘솔이 조용한 것을
      // 확인한 뒤에 Content-Security-Policy로 올리세요. 허용 목록: Turnstile(challenges.cloudflare.com),
      // Vercel Analytics와 Speed Insights(va.vercel-scripts.com, vitals.vercel-insights.com).
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
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
