// Runs in the browser (builder preview), so use FileReader rather than
// Node's Buffer, which is not available client-side.
export async function convertImageToBase64(formData: FormData) {
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return;
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
