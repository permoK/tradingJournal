import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(requestUrl.origin + '/auth/login?error=callback_error');
      }

      // Check if user needs to set up username (for OAuth users)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if user has a username in their profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        // If profile doesn't exist or username is null/empty, redirect to username setup
        if (profileError || !profile?.username || profile.username.trim() === '') {
          return NextResponse.redirect(requestUrl.origin + '/auth/setup-username');
        }
      }
    } catch (err) {
      console.error('Auth callback exception:', err);
      return NextResponse.redirect(requestUrl.origin + '/auth/login?error=callback_error');
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + next);
}
