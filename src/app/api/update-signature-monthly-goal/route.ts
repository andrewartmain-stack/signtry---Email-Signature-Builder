import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    const { goal } = await req.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!id || !Number.isFinite(Number(goal)) || Number(goal) <= 0) {
      return NextResponse.json({ message: 'Invalid goal' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('saved_signatures')
      .update({ monthly_goal: Math.round(Number(goal)) })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('monthly_goal');

    if (error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!data.length) {
      return NextResponse.json({ message: 'Signature not found' }, { status: 404 });
    }

    return NextResponse.json({ data: data[0].monthly_goal }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Could not update goal' }, { status: 500 });
  }
}
