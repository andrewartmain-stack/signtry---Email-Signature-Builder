import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/app/utils/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { data: link, error: linkError } = await supabaseAdmin
    .from('signature_links')
    .select('id, signature_id, target_url')
    .eq('token', token)
    .maybeSingle();

  if (linkError || !link) {
    console.error('Link not found: ', linkError?.message ?? token);
    return NextResponse.redirect(
      new URL('/not-found', process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin)
    );
  }

  // Recording the click must never block or break the redirect
  const { error: clickError } = await supabaseAdmin
    .from('signature_clicks')
    .insert({
      signature_id: link.signature_id,
      signature_link_id: link.id,
    });

  if (clickError) {
    console.error(clickError.message);
  }

  return NextResponse.redirect(link.target_url);
}
