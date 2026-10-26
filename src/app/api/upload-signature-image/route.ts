import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '../../utils/supabase/server';
import { generateSignatureImage } from '../../utils/generateSignatureImage';
import {
  processSignatureImage,
  SIGNATURE_IMAGE_KINDS,
  SignatureImageKind,
} from '../../utils/processSignatureImage';

const BUCKET_NAME = 'images';
const MAX_FILE_BYTES = 8 * 1024 * 1024;

// Resizes/compresses an image for email use and stores it in the user's
// folder. Accepts either an uploaded `file`, or `name` for kind=signature to
// generate the handwritten signature server-side (used by bulk generation).
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const kind = formData.get('kind') as SignatureImageKind;
    const file = formData.get('file');
    const name = formData.get('name');

    if (!SIGNATURE_IMAGE_KINDS.includes(kind)) {
      return NextResponse.json({ message: 'Invalid image kind' }, { status: 400 });
    }

    let input: Buffer;

    if (file instanceof File) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ message: 'Image is too large (max 8MB)' }, { status: 413 });
      }
      input = Buffer.from(await file.arrayBuffer());
    } else if (kind === 'signature' && typeof name === 'string' && name.trim()) {
      input = Buffer.from(generateSignatureImage(name.trim().slice(0, 60)).split(',')[1], 'base64');
    } else {
      return NextResponse.json({ message: 'No image provided' }, { status: 400 });
    }

    let processed;
    try {
      processed = await processSignatureImage(input, kind, {
        photoSize: Number(formData.get('photoSize')) || undefined,
        photoBorderRadius: (formData.get('photoBorderRadius') as string) ?? '',
      });
    } catch {
      return NextResponse.json({ message: 'Unsupported or corrupted image' }, { status: 400 });
    }

    const fileName = `public/${user.id}/${uuidv4()}.${processed.extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, processed.buffer, {
        contentType: processed.contentType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError.message);
      return NextResponse.json({ message: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return NextResponse.json(
      { url: publicUrl, width: processed.width, height: processed.height },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error uploading image' }, { status: 500 });
  }
}
