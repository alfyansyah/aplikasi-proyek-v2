import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Siapkan response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Hubungkan ke Supabase (Khusus Middleware)
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
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 3. Cek apakah User ada (Sudah Login?)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ATURAN KEAMANAN:

  // A. Kalau belum login, tapi mau buka halaman dalam -> Tendang ke /login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // B. Kalau sudah login, tapi mau buka halaman login -> Lempar ke Dashboard (/)
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Konfigurasi: Middleware ini jalan di semua halaman KECUALI file gambar/sistem
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
