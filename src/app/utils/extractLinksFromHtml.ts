export function extractLinksFromHtml(html: string) {
  const regex = /<a\s+([^>]+)>/gi; // ищем все <a ...> теги
  const idRegex = /id\s*=\s*["']([^"']+)["']/i;
  const hrefRegex = /href\s*=\s*["']([^"']+)["']/i;

  const links: { id: string; href: string }[] = [];

  let match;
  while ((match = regex.exec(html)) !== null) {
    const aTag = match[1];

    const idMatch = aTag.match(idRegex);
    const hrefMatch = aTag.match(hrefRegex);

    if (idMatch && hrefMatch) {
      links.push({ id: idMatch[1], href: hrefMatch[1] });
    }
  }

  return links;
}
