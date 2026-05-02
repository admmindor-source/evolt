import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/validation/env';

const PROTECTED_PATHS = ['/onboarding', '/home', '/perfil', '/evolucao', '/loja'];
const AUTH_PATHS = ['/login', '/signup'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // CRITICAL: getUser() (NOT getSession) — validates with Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // Phase 2: onboarding_completed check
  // Only runs for authenticated users on onboarding-relevant routes.
  if (user) {
    const needsOnboardingCheck =
      pathname.startsWith('/home') ||
      pathname.startsWith('/perfil') ||
      pathname.startsWith('/onboarding');

    if (needsOnboardingCheck) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      const completed = profile?.onboarding_completed ?? false;

      // auth+no-onboarding trying to access /home or /perfil → redirect to onboarding
      if (!completed && !pathname.startsWith('/onboarding')) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding/1';
        return NextResponse.redirect(url);
      }

      // auth+completed trying to access /onboarding/* (except conclusao) → redirect to /home
      if (completed && pathname.startsWith('/onboarding') && !pathname.startsWith('/onboarding/conclusao')) {
        const url = request.nextUrl.clone();
        url.pathname = '/home';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
