import { renderSignature } from '../utils/renderSignature';
import { ImageSizes } from '../utils/optimizeSignatureHtml';
import { FormUserDataInterface } from '../types';

export type SignatureImageKind = 'photo' | 'logo' | 'banner' | 'signature';

export interface UploadedImage {
  url: string;
  width: number;
  height: number;
}

export interface SignatureToSave {
  html: string;
  photoUrl: string;
  signatureImageUrl: string;
  bannerUrl: string;
  companyLogoUrl: string;
  imageSizes: ImageSizes;
}

// Images picked in the builder are data: URLs, demo images are local files;
// both must be hosted before they can be used in an email.
function needsUpload(src: string) {
  return src.startsWith('data:') || src.startsWith('/');
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function uploadSignatureImage(
  kind: SignatureImageKind,
  source: { image?: string | Blob; name?: string },
  options: { photoSize?: string; photoBorderRadius?: string } = {}
): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('kind', kind);

  if (source.image) {
    const blob =
      typeof source.image === 'string'
        ? await (await fetch(source.image)).blob()
        : source.image;
    formData.append('file', blob);
  } else if (source.name) {
    formData.append('name', source.name);
  }

  if (options.photoSize) formData.append('photoSize', options.photoSize);
  if (options.photoBorderRadius) formData.append('photoBorderRadius', options.photoBorderRadius);

  const response = await fetch('/api/upload-signature-image', {
    method: 'POST',
    body: formData,
  });
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed');
  }

  return data as UploadedImage;
}

// Hosts an image if needed. Already hosted URLs (badges, social icons, photo
// URLs from a CSV) are kept as they are.
async function hostImage(
  src: string,
  kind: SignatureImageKind,
  userData: FormUserDataInterface,
  imageSizes: ImageSizes
) {
  if (!src || !needsUpload(src)) return src;

  const uploaded = await uploadSignatureImage(kind, { image: src }, {
    photoSize: userData.photoSize,
    photoBorderRadius: userData.photoBorderRadius,
  });
  imageSizes[uploaded.url] = { width: uploaded.width, height: uploaded.height };
  return uploaded.url;
}

// Images shared by every signature of a bulk run are uploaded only once.
export async function uploadSharedImages(userData: FormUserDataInterface) {
  const imageSizes: ImageSizes = {};
  const [bannerUrl, companyLogoUrl] = await Promise.all([
    hostImage(userData.bannerUrl, 'banner', userData, imageSizes),
    hostImage(userData.companyLogoUrl, 'logo', userData, imageSizes),
  ]);
  return { bannerUrl, companyLogoUrl, imageSizes };
}

export async function buildSignatureToSave(
  htmlTemplate: string,
  userData: FormUserDataInterface,
  shared: Awaited<ReturnType<typeof uploadSharedImages>>,
  options: { photo?: Blob; generateSignatureFromName?: boolean } = {}
): Promise<SignatureToSave> {
  const imageSizes: ImageSizes = { ...shared.imageSizes };
  const fullName = `${userData.firstName} ${userData.lastName}`.trim();

  const [photoUrl, signatureImageUrl] = await Promise.all([
    options.photo
      ? uploadSignatureImage('photo', { image: options.photo }, {
          photoSize: userData.photoSize,
          photoBorderRadius: userData.photoBorderRadius,
        }).then((uploaded) => {
          imageSizes[uploaded.url] = { width: uploaded.width, height: uploaded.height };
          return uploaded.url;
        })
      : hostImage(userData.photoUrl, 'photo', userData, imageSizes),
    !userData.signatureImageUrl
      ? ''
      : options.generateSignatureFromName
        ? uploadSignatureImage('signature', { name: fullName }).then((uploaded) => {
            imageSizes[uploaded.url] = { width: uploaded.width, height: uploaded.height };
            return uploaded.url;
          })
        : hostImage(userData.signatureImageUrl, 'signature', userData, imageSizes),
  ]);

  const urls = {
    photoUrl,
    signatureImageUrl,
    bannerUrl: shared.bannerUrl,
    companyLogoUrl: shared.companyLogoUrl,
  };

  return {
    html: renderSignature(htmlTemplate, { ...userData, ...urls }),
    ...urls,
    imageSizes,
  };
}

export async function saveSignatures(signatures: SignatureToSave[]) {
  const response = await fetch('/api/save-signature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ signatures }),
  });
  const data = await readJson(response);

  return { ok: response.ok, status: response.status, ...data } as {
    ok: boolean;
    status: number;
    message: string;
    ids?: number[];
    htmls?: string[];
    warnings?: string[];
  };
}

export async function saveSignature(userData: FormUserDataInterface, htmlTemplate: string) {
  const shared = await uploadSharedImages(userData);
  const signature = await buildSignatureToSave(htmlTemplate, userData, shared);
  return saveSignatures([signature]);
}

export async function fetchSignatureQuota(): Promise<{ limit: number; used: number; remaining: number }> {
  const response = await fetch('/api/signature-quota');
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.message || 'Could not load your plan limits');
  }

  return data;
}

export async function generateSignatureImage(fullName: string) {
  try {
    const response = await fetch('/api/generate-signature-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName,
      }),
    });

    const responseData = await response.json();
    const url = responseData.url;

    return url;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw error;
    }
  }
}

export async function deleteSignature(id: number) {
  const response = await fetch(`/api/delete-signature?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await readJson(response);
    throw new Error(data.message || 'Could not delete signature');
  }

  return true;
}
