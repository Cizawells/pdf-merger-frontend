export { auth as middleware } from "@/auth";

// Configure which routes require authentication
export const config = {
  matcher: [
    // Protect dashboard and related routes. Add more patterns as needed.
    "/dashboard/:path*",
  ],
};
