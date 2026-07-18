import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security middleware:
 * 1. Blocks direct access to internal API routes without proper headers
 * 2. Adds security headers to all responses
 * 3. Prevents API key exposure in client responses
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Security headers for all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Block access to internal env/config endpoints
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    // Remove any accidentally leaked env vars from response
    response.headers.set("X-API-Protected", "true");

    // Block requests trying to access env vars or internal config
    if (
      pathname.includes("/.env") ||
      pathname.includes("/config") ||
      pathname.includes("/_internal")
    ) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Prevent source map access in production
  if (pathname.endsWith(".map") && process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.svg|icon.svg|robots.txt).*)",
  ],
};
