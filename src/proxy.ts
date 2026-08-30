import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/reset-password",
  "/update-password",
  "/scan",
  "/assessment",
  // Stage 18 — the public marketing site.
  "/what-we-do",
  "/the-assessment",
  "/builds",
  "/systems-and-support",
  "/case-studies",
  "/about",
  "/contact",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) return response;

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  // Stage 18 — Next's file-convention SEO routes (sitemap.xml, and the
  // generated opengraph-image, which Next serves with a cache-busting
  // hash suffix like /opengraph-image-pwu6ef) must stay reachable by
  // crawlers/unfurlers with no session, same as any other public path.
  const isMetadataPath = pathname === "/sitemap.xml" || pathname.startsWith("/opengraph-image");
  const isPublicPath = pathname === "/" || isMetadataPath || PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
