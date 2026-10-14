import { NextResponse, type NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// 언어별 공유 카드(DECIDED 2026-10-14, 사용자: "영어로 바꾼 뒤 공유하면 받는 사람에게도 영어로, 이미지와 설명도").
//
// ?lang=en으로 온 /, /naru, /2026-08 요청을 app/en/ 아래의 정적 사본으로 다시 씁니다(rewrite). 사본은 같은 화면에
// 영문 og:title, og:description, og:image를 답니다. 주소창의 주소는 바뀌지 않습니다.
// /en, /en/naru, /en/2026-08로 직접 오면 ?lang=en이 붙은 원래 주소로 보냅니다. 같은 화면의 주소를 둘로 만들지 않습니다.
// 카드 그림(/en/**/opengraph-image)은 matcher에 없어서 그대로 나갑니다.
// ─────────────────────────────────────────────────────────────────────────────
const PAGES = new Set(["/", "/naru", "/2026-08"]);

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    url.searchParams.set("lang", "en");
    return NextResponse.redirect(url, 308);
  }

  if (PAGES.has(pathname) && searchParams.get("lang") === "en") {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/naru", "/2026-08", "/en", "/en/naru", "/en/2026-08"],
};
