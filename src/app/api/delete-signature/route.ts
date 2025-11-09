import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

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

    const { data: signatureData, error: selectError } = await supabase
      .from('saved_signatures')
      .select('photoUrl, signatureImageUrl, bannerUrl, companyLogoUrl')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (selectError) {
      return NextResponse.json(
        { message: selectError.message },
        { status: 500 }
      );
    }

    const filesToDelete: string[] = [];
    const baseUrl = `https://cemhabfosehkygdncxfg.supabase.co/storage/v1/object/public/images/public/${user.id}/`;

    if (signatureData.photoUrl) {
      filesToDelete.push(signatureData.photoUrl.replace(baseUrl, ''));
    }
    if (signatureData.signatureImageUrl) {
      filesToDelete.push(signatureData.signatureImageUrl.replace(baseUrl, ''));
    }
    if (signatureData.bannerUrl) {
      filesToDelete.push(signatureData.bannerUrl.replace(baseUrl, ''));
    }
    if (signatureData.companyLogoUrl) {
      filesToDelete.push(signatureData.companyLogoUrl.replace(baseUrl, ''));
    }

    const { error: deleteFilesError } = await supabase.storage
      .from('images')
      .remove(filesToDelete.map((fileName) => `public/${user.id}/${fileName}`));

    if (deleteFilesError) {
      return NextResponse.json(
        { message: deleteFilesError.message },
        { status: 500 }
      );
    }

    const { error: deleteSignatureError } = await supabase
      .from('saved_signatures')
      .delete()
      .eq('id', id);

    if (deleteSignatureError) {
      return NextResponse.json(
        { message: deleteSignatureError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Signature was deleted' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
