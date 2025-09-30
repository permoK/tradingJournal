export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/strategies/:path*',
    '/journal/:path*',
    '/trading/:path*',
    '/news/:path*',
    '/settings/:path*',
  ],
};
