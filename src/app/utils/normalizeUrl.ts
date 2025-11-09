export function normalizeUrl(url: string): string {
  if (!url) return ''; // пустое поле трогаем
  if (/^https?:\/\//i.test(url)) {
    return url; // уже начинается с http:// или https://
  }
  return `https://${url}`;
}
