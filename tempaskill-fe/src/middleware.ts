import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/profile"];

// Admin routes that require admin or instructor role
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Get token from cookie
  const token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Redirect to login if accessing protected route without token
  if ((isProtectedRoute || isAdminRoute) && !token) {
    const loginUrl = new URL("/login", request.url);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Note: Role-based authorization is handled client-side in AdminLayout
  // Server-side role check would require decoding JWT here

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
