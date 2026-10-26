import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only return analytics for the user's own signatures
    const { data: signature } = await supabase
      .from('saved_signatures')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!signature) {
      return NextResponse.json({ message: 'Signature not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('signature_clicks')
      .select('*')
      .eq('signature_id', id);

    if (error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Could not load analytics' }, { status: 500 });
  }
}
