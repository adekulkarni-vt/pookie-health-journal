import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error(`OAuth error: ${error} - ${errorDescription}`);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const response = NextResponse.redirect(new URL('/', requestUrl.origin));
    const supabase = await createSupabaseMiddlewareClient(request, response);

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Failed to exchange code for session:', exchangeError);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent('Failed to sign in')}`,
          requestUrl.origin
        )
      );
    }

    return response;
  }

  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
