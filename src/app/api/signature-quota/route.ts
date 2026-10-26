import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';
import { getSignatureQuota } from '../../utils/signatureLimits';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(await getSignatureQuota(supabase, user.id), { status: 200 });
}
