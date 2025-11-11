import { v4 as uuidv4 } from 'uuid';
import { createClient } from '../../app/utils/supabase/client';
import { NextResponse } from 'next/server';

export async function uploadImageToBucket(
  base64String: string,
  bucketName: string
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const matches = base64String.match(/^data:(.+);base64,(.+)$/);

    if (!matches || matches.length < 3) {
      return NextResponse.json(
        { error: 'Invalid base64 string format' },
        { status: 400 }
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const extension = mimeType.split('/')[1];
    const contentType = mimeType;

    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `public/${user.id}/${uuidv4()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: contentType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error uploading image' },
      { status: 500 }
    );
  }
}
