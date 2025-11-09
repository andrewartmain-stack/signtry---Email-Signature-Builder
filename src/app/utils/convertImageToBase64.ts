export async function convertImageToBase64(formData: FormData) {
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return;
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const base64String = buffer.toString('base64');

  const mimeType = file.type;

  return `data:${mimeType};base64,${base64String}`;
}
