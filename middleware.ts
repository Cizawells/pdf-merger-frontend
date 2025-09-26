import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add your middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // If user is authenticated, allow access to all routes
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/signin', // Custom sign-in page
      error: '/auth/error', // Error page for auth errors
    },
  }
);

// Configure which routes require authentication
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|auth/).*)',
  ],
};
