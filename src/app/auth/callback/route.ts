import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSafeNextPath, DEFAULT_AUTHENTICATED_LANDING } from '@/lib/validation/login';
import { materializeActivation } from '@/lib/activation/materialize';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next');
  const next = nextParam && isSafeNextPath(nextParam) ? nextParam : DEFAULT_AUTHENTICATED_LANDING;

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }

  await materializeActivation(data.user.id);
  return NextResponse.redirect(new URL(next, request.url));
}
