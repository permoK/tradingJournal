import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/strategies',
    '/journal',
    '/trading',
    '/community',
    '/settings',
  ];

  // Auth routes that should redirect if already authenticated
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ];

  // Special auth routes that don't redirect authenticated users
  const specialAuthRoutes = [
    '/auth/setup-username',
    '/auth/callback',
    '/auth/verify-email',
    '/auth/reset-password',
  ];

  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some(route =>
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
  );

  const isSpecialAuthRoute = specialAuthRoutes.some(route =>
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
  );

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth routes (but not special auth routes), redirect to dashboard
  if (isAuthRoute && session && !isSpecialAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
