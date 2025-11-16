import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await req.json();
    const email = body.email;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://app.signtry.com//reset',
    });

    if (error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Confirmation link was sent' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }

    return NextResponse.json({ message: 'Unknown error' }, { status: 500 });
  }
}
