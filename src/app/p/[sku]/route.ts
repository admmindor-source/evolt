import { NextRequest, NextResponse } from 'next/server';
import { parseToken } from '@/lib/qr/parse';
import { setPendingActivation } from '@/lib/qr/pending';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> },
) {
  const { sku } = await params;
  const c = request.nextUrl.searchParams.get('c') ?? undefined;

  const token = parseToken({ sku, c });
  if (!token) {
    return NextResponse.redirect(new URL('/ativar?error=invalid', request.url));
  }

  // Validate sku exists in products (active=true). RLS allows anon select on active products.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('sku')
    .eq('sku', token.sku)
    .eq('active', true)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(new URL('/ativar?error=not-found', request.url));
  }

  // Set cookie and redirect to signup
  const response = NextResponse.redirect(new URL('/signup', request.url));
  response.cookies.set('evolt_pending_activation', JSON.stringify(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return response;
}
