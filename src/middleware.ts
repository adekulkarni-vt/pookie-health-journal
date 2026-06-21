import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

const PUBLIC_ROUTES = ['/login', '/auth/callback', '/waitlist'];
const WHITELIST_EXEMPT = ['/login', '/auth/callback', '/waitlist'];

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = await createSupabaseMiddlewareClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  }

  if (user.email && !WHITELIST_EXEMPT.includes(pathname)) {
    const { data: allowed } = await supabase
      .from('allowed_users')
      .select('email')
      .eq('email', user.email.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (!allowed) {
      console.log({ email: user.email, whitelistAllowed: false });

      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Access not enabled for this account.' },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL('/waitlist', requestUrl.origin));
    }

    console.log({ email: user.email, whitelistAllowed: true });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
