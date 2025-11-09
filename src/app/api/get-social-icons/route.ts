import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: folders, error: foldersError } = await supabase.storage
      .from('social-icons')
      .list('', { limit: 100, offset: 0 });

    if (foldersError) {
      console.error(foldersError.message);
      return NextResponse.json(
        { message: foldersError.message },
        { status: 500 }
      );
    }

    let publicUrls: { name: string; png: string; gif: string }[] = [];

    for (let folder of folders) {
      const { data: pngData } = await supabase.storage
        .from('social-icons')
        .getPublicUrl(`${folder.name}/${folder.name}.png`);

      const pngUrl = pngData.publicUrl;

      const { data: gifData } = await supabase.storage
        .from('social-icons')
        .getPublicUrl(`${folder.name}/${folder.name}.gif`);

      const gifUrl = gifData.publicUrl;

      publicUrls.push({
        name: folder.name,
        png: pngUrl,
        gif: gifUrl,
      });
    }

    return NextResponse.json({ socialIcons: publicUrls }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
