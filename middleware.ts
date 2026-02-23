import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_AUTH } from './enums/app.enum';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(APP_AUTH.COOKIE_AUTH_KEY)?.value;
  const userString = request.cookies.get(APP_AUTH.COOKIE_AUTH_USER)?.value;

  const isLogged = token && userString;

  // Parse user data to check location (ward_id)
  let userData = null;
  let hasLocation = false;
  if (userString) {
    try {
      userData = JSON.parse(userString);
      hasLocation = userData?.ward_id != null;
    } catch {
      console.error('ERROR PARSING COOKIE');
      // Invalid JSON, treat as no location
      hasLocation = false;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const publicPaths = ['/login', '/reset-password', '/register', '/location'];

  // Nếu đã login và đã có location, không cho vào login hoặc location page
  if (isLogged && hasLocation && ['/login', '/location'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Nếu đã login nhưng chưa có location, chỉ cho vào /location
  if (isLogged && !hasLocation && request.nextUrl.pathname !== '/location') {
    return NextResponse.redirect(new URL('/location', request.url));
  }

  // Nếu chưa login và không phải trang public, redirect về login
  if (!publicPaths.includes(request.nextUrl.pathname) && !isLogged) {
    const response = NextResponse.redirect(new URL('/login', request.url));

    const fullUrl = request.nextUrl.pathname + request.nextUrl.search;

    response.cookies.set('target_url', fullUrl, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NEXT_PUBLIC_ENVIROMENT === 'production',
    });

    return response;
  }

  return response;
}

export const config = {
  // Apply to all pages except static assets and Next internals
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ],
};
