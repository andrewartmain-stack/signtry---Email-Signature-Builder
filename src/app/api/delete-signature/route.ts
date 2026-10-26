import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../utils/supabase/server';

const BUCKET_NAME = 'images';
const IMAGE_COLUMNS = ['photoUrl', 'signatureImageUrl', 'bannerUrl', 'companyLogoUrl'] as const;

// ".../storage/v1/object/public/images/public/<uid>/<file>" -> "public/<uid>/<file>"
function getStoragePath(url: string | null, userId: string) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
  // Only ever delete files from the user's own folder
  return path.startsWith(`public/${userId}/`) ? path : null;
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'ID parameter is required' },
        { status: 400 }
      );
    }

    const { data: signatures, error: selectError } = await supabase
      .from('saved_signatures')
      .select('id, photoUrl, signatureImageUrl, bannerUrl, companyLogoUrl')
      .eq('user_id', user.id);

    if (selectError) {
      return NextResponse.json(
        { message: selectError.message },
        { status: 500 }
      );
    }

    const signatureData = signatures.find((signature) => String(signature.id) === id);

    if (!signatureData) {
      return NextResponse.json({ message: 'Signature not found' }, { status: 404 });
    }

    // Bulk-generated signatures share the logo/banner/etc. Only delete files
    // that no other signature of this user still points at.
    const stillUsed = new Set(
      signatures
        .filter((signature) => signature.id !== signatureData.id)
        .flatMap((signature) => IMAGE_COLUMNS.map((column) => signature[column]))
    );

    const filesToDelete = IMAGE_COLUMNS.map((column) => signatureData[column])
      .filter((url) => url && !stillUsed.has(url))
      .map((url) => getStoragePath(url, user.id))
      .filter((path): path is string => Boolean(path));

    const { error: deleteSignatureError } = await supabase
      .from('saved_signatures')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteSignatureError) {
      return NextResponse.json(
        { message: deleteSignatureError.message },
        { status: 500 }
      );
    }

    // Delete files after the row so a failure never leaves a signature
    // pointing at missing images; orphaned files are only a storage cost.
    if (filesToDelete.length > 0) {
      const { error: deleteFilesError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filesToDelete);

      if (deleteFilesError) {
        console.error(deleteFilesError.message);
      }
    }

    revalidatePath('/signatures');
    revalidatePath('/analytics');

    return NextResponse.json(
      { message: 'Signature was deleted' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Could not delete signature' }, { status: 500 });
  }
}
