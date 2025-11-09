import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/app/utils/supabase/admin';

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const token = pathname.split('/').pop(); // извлекаем последний сегмент

  const { data: link, error: linkError } = await supabaseAdmin
    .from('signature_links')
    .select('id, signature_id, target_url')
    .eq('token', token)
    .single();

  if (linkError || !link) {
    console.error('Link not found: ', linkError.message);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/not-found`
    );
  }

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
