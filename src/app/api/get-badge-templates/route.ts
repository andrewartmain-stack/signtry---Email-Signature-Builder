import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

// import { badgeTemplates } from '../../templates/badge';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: files, error: filesError } = await supabase.storage
      .from('badges')
      .list('', { limit: 100, offset: 0 });

    if (filesError) {
      console.error(filesError.message);
      return NextResponse.json(
        { message: filesError.message },
        { status: 500 }
      );
    }

    let publicUrls: string[] = [];

    for (let file of files) {
      const { data } = await supabase.storage
        .from('badges')
        .getPublicUrl(file.name);
      publicUrls.push(data.publicUrl);
    }

    return NextResponse.json({ badgeTemplates: publicUrls }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
