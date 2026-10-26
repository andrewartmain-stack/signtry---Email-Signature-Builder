import sharp from 'sharp';

// Images are rendered at 2x their display size: sharp on retina screens while
// staying a few KB, instead of shipping multi-MB originals in every email.
const SCALE = 2;

export type SignatureImageKind = 'photo' | 'logo' | 'banner' | 'signature';

export const SIGNATURE_IMAGE_KINDS: SignatureImageKind[] = ['photo', 'logo', 'banner', 'signature'];

export interface ProcessedImage {
  buffer: Buffer;
  contentType: 'image/png' | 'image/jpeg';
  extension: 'png' | 'jpg';
  width: number;
  height: number;
}

// "border-radius: 10px !important;" / "border-radius: 50% !important;" -> px
function parseRadius(photoBorderRadius: string, size: number) {
  const match = photoBorderRadius.match(/border-radius:\s*(\d+(?:\.\d+)?)(px|%)/i);
  if (!match) return 0;
  const value = Number(match[1]);
  return match[2] === '%' ? (size * Math.min(value, 50)) / 100 : value;
}

async function encode(image: sharp.Sharp, keepAlpha: boolean): Promise<ProcessedImage> {
  const output = keepAlpha
    ? // Quantized PNG keeps transparency at roughly a quarter of the size
      await image
        .png({ palette: true, quality: 90, effort: 10, dither: 1, compressionLevel: 9 })
        .toBuffer({ resolveWithObject: true })
    : await image
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    contentType: keepAlpha ? 'image/png' : 'image/jpeg',
    extension: keepAlpha ? 'png' : 'jpg',
    width: output.info.width,
    height: output.info.height,
  };
}

export async function processSignatureImage(
  input: Buffer,
  kind: SignatureImageKind,
  options: { photoSize?: number; photoBorderRadius?: string } = {}
): Promise<ProcessedImage> {
  // rotate() applies EXIF orientation so phone photos are not sideways
  const source = sharp(input, { animated: false }).rotate();
  const { hasAlpha } = await source.metadata();

  switch (kind) {
    case 'photo': {
      const displaySize = Math.min(Math.max(options.photoSize || 80, 20), 200);
      const size = displaySize * SCALE;
      const radius = parseRadius(options.photoBorderRadius ?? '', displaySize) * SCALE;
      const square = source.resize(size, size, { fit: 'cover', position: 'attention' });

      if (radius <= 0) return encode(square, Boolean(hasAlpha));

      // Bake the rounded corners into the image: Outlook desktop ignores
      // CSS border-radius, so this is the only way it shows rounded too.
      const mask = Buffer.from(
        `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`
      );
      const rounded = sharp(await square.png().toBuffer()).composite([{ input: mask, blend: 'dest-in' }]);
      return encode(rounded, true);
    }

    case 'logo':
      // Templates show the logo 28px tall with auto width
      return encode(
        source.resize({ height: 28 * SCALE, width: 200 * SCALE, fit: 'inside', withoutEnlargement: true }),
        true
      );

    case 'banner':
      // Templates show the banner at 250x80
      return encode(source.resize(250 * SCALE, 80 * SCALE, { fit: 'cover' }), Boolean(hasAlpha));

    case 'signature':
      // Templates show the handwritten signature 35px tall with auto width
      return encode(
        source.resize({ height: 35 * SCALE, withoutEnlargement: true }),
        true
      );
  }
}
