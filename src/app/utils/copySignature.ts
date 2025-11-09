export async function copySignature(html: string) {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([clipboardItem]);
  } catch (error) {
    console.error('Failed to copy signature: ', error);
    throw error;
  }
}
