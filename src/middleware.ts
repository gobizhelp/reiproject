import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === 'your-supabase-url-here') {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = ['/dashboard', '/properties', '/buyers', '/marketplace', '/my-buy-boxes', '/settings', '/saved-listings', '/matched-listings', '/deal-pipeline', '/messages', '/admin'];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check if user is suspended
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, is_suspended')
      .eq('id', user.id)
      .single();

    if (profile?.is_suspended && !request.nextUrl.pathname.startsWith('/suspended')) {
      const url = request.nextUrl.clone();
      url.pathname = '/suspended';
      return NextResponse.redirect(url);
    }

    // Admin route protection
    if (request.nextUrl.pathname.startsWith('/admin') && !profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ['/login', '/signup'];
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/properties/:path*', '/buyers/:path*', '/marketplace/:path*', '/my-buy-boxes/:path*', '/settings/:path*', '/saved-listings/:path*', '/matched-listings/:path*', '/deal-pipeline/:path*', '/messages/:path*', '/admin/:path*', '/login', '/signup', '/auth/callback'],
};
