import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // For development purposes, we'll skip authentication checks
  // In a production environment, you would use Supabase authentication

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/learning',
    '/journal',
    '/trading',
    '/community',
    '/settings',
  ];

  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
  );

  // For demo purposes, we'll allow access to all routes
  // In a real application, you would implement proper authentication checks

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
