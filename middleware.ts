import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_AUTH } from './enums/app.enum';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(APP_AUTH.COOKIE_AUTH_KEY)?.value;
  const user = request.cookies.get(APP_AUTH.COOKIE_AUTH_USER)?.value;

  const isLogged = token && user;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (request.nextUrl.pathname === '/login' && isLogged) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!['/login', '/reset-password', '/register'].includes(request.nextUrl.pathname) && !isLogged) {
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
