import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // --- ATURAN KEAMANAN BARU ---

  // 1. JIKA BELUM LOGIN (GUEST)
  if (!user) {
    // Halaman yang BOLEH diakses tanpa login:
    // - Landing Page ("/")
    // - Login Page ("/login")
    
    // Jika dia mencoba masuk ke tempat lain (misal /dashboard, /admin), TENDANG KE LOGIN
    if (path !== "/" && !path.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. JIKA SUDAH LOGIN (MEMBER)
  if (user) {
    // Jika dia mencoba buka Landing Page atau Login lagi, LEMPAR KE DASHBOARD
    // Supaya dia tidak perlu login ulang
    if (path === "/" || path.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};