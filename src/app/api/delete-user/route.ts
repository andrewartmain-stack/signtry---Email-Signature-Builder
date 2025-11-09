import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../utils/supabase/admin';

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }

  try {
    const { data: user, error: getUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (getUserError) {
      console.error('User not found:', getUserError.message);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deleteProfiles = supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    const deleteSignatures = supabaseAdmin
      .from('saved_signatures')
      .delete()
      .eq('user_id', userId);

    await Promise.all([deleteProfiles, deleteSignatures]);

    const buckets = ['images', 'avatars'];
    const userFolder = `public/${userId}`;

    for (const bucket of buckets) {
      // Получаем все файлы внутри "папки"
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from(bucket)
        .list(userFolder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (listError) {
        console.error(listError.message);
        continue;
      }

      if (!files || files.length === 0) {
        continue;
      }

      const filePaths = files.map((file) => `${userFolder}/${file.name}`);

      const { error: deleteError } = await supabaseAdmin.storage
        .from(bucket)
        .remove(filePaths);

      if (deleteError) {
        console.error(deleteError.message);
      }
    }

    // 1. Delete user from auth
    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (userError) {
      console.error('Failed to delete user from auth:', userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'User and data deleted' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
