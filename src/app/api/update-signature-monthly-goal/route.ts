import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const { goal } = await req.json();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('saved_signatures')
      .update({ monthly_goal: goal })
      .eq('id', id)
      .select('monthly_goal');
    if (error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data[0].monthly_goal }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
