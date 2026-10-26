// Post-processes rendered signature HTML so it survives real email clients:
//
// - Outlook desktop (Word engine) ignores CSS width/height on <img> and shows
//   images at their natural size, so every image gets width/height attributes.
// - Outlook does not inherit font-family/color from an outer table into nested
//   tables (falls back to Times New Roman), so every <td> gets them inline.
//   Explicit text colors also keep Apple Mail dark mode from recoloring text.
// - Gmail rejects signatures over 10,000 characters, so the markup is minified.
// - bgcolor="#fff !important" is invalid and gets dropped by clients.
//
// Pure string processing so it runs in the browser (preview, copy) and on the
// server (save). It is idempotent, so old saved signatures can be re-run.

export const GMAIL_SIGNATURE_CHAR_LIMIT = 10000;

export const EMAIL_FONT_FAMILY = 'Arial,sans-serif';
// What browsers and Outlook use when a template sets no color
const DEFAULT_TEXT_COLOR = '#000000';

export type ImageSizes = Record<string, { width: number; height: number }>;

function getAttr(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i'));
  return match ? match[1] : null;
}

function hasAttr(tag: string, name: string) {
  return new RegExp(`\\s${name}\\s*=`, 'i').test(tag);
}

function setAttr(tag: string, name: string, value: string) {
  if (hasAttr(tag, name)) {
    return tag.replace(
      new RegExp(`(\\s${name}\\s*=\\s*)"[^"]*"`, 'i'),
      (_, prefix: string) => `${prefix}"${value}"`
    );
  }
  return tag.replace(/^<(\w+)/, (_, tagName: string) => `<${tagName} ${name}="${value}"`);
}

function getStyleProp(style: string, prop: string) {
  // (^|;) so "color" does not match inside "background-color"
  const match = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'i'));
  return match ? match[1].trim() : null;
}

function cleanStyle(style: string) {
  return style
    .split(';')
    .map((declaration) => declaration.trim().replace(/\s*:\s*/, ':'))
    .filter(Boolean)
    .join(';');
}

function cleanColor(color: string) {
  return color.replace(/!important/gi, '').trim();
}

function pxValue(value: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d+(?:\.\d+)?)px/i);
  return match ? Math.round(Number(match[1])) : null;
}

function attrNumber(tag: string, name: string) {
  const value = Number(getAttr(tag, name));
  return value > 0 ? Math.round(value) : null;
}

function optimizeImg(tag: string, imageSizes: ImageSizes) {
  const style = getAttr(tag, 'style') ?? '';
  const src = getAttr(tag, 'src') ?? '';
  let width = pxValue(getStyleProp(style, 'width')) ?? attrNumber(tag, 'width');
  let height = pxValue(getStyleProp(style, 'height')) ?? attrNumber(tag, 'height');

  // "width:auto" images (logo, handwritten signature) need the real aspect ratio
  const natural = imageSizes[src.replace(/&amp;/g, '&')];
  if (natural && natural.width > 0 && natural.height > 0) {
    if (height && !width) width = Math.round((height * natural.width) / natural.height);
    if (width && !height) height = Math.round((width * natural.height) / natural.width);
  }

  let result = tag;
  if (width) {
    result = setAttr(result, 'width', String(width));
    // Replace width:auto so every client uses the same computed width
    result = setAttr(
      result,
      'style',
      cleanStyle(
        getStyleProp(style, 'width')
          ? style.replace(/(^|;)\s*width\s*:\s*auto\s*/i, `$1width:${width}px`)
          : style
      )
    );
  }
  if (height) result = setAttr(result, 'height', String(height));
  if (!hasAttr(result, 'border')) result = setAttr(result, 'border', '0');

  return result;
}

function optimizeTd(tag: string, textColor: string) {
  let style = getAttr(tag, 'style') ?? '';
  if (!getStyleProp(style, 'font-family')) style += `;font-family:${EMAIL_FONT_FAMILY}`;
  if (!getStyleProp(style, 'color')) style += `;color:${textColor}`;
  return setAttr(tag, 'style', cleanStyle(style));
}

function minify(html: string) {
  return (
    html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      // Whitespace between table structure tags never renders
      .replace(/>\s+(?=<\/?(?:table|tbody|tr|td|th)\b)/gi, '>')
      .replace(/(<\/?(?:table|tbody|tr|td|th)\b[^>]*>)\s+/gi, '$1')
      // Leading/trailing spaces inside links would be underlined/clickable
      .replace(/(<a\b[^>]*>)\s+/gi, '$1')
      .replace(/\s+<\/a>/gi, '</a>')
      .trim()
  );
}

export function optimizeSignatureHtml(html: string, imageSizes: ImageSizes = {}) {
  let output = minify(html);

  const firstTable = output.match(/<table\b[^>]*>/i)?.[0] ?? '';
  const textColor =
    cleanColor(getStyleProp(getAttr(firstTable, 'style') ?? '', 'color') ?? '') ||
    DEFAULT_TEXT_COLOR;

  output = output.replace(/<img\b[^>]*>/gi, (tag) => optimizeImg(tag, imageSizes));
  // Only cells with their own text need font/color; cells that just wrap
  // tables or images would only add characters toward Gmail's limit.
  output = output.replace(
    /(<td\b[^>]*>)([\s\S]*?)(?=<\/?(?:td|table)\b|$)/gi,
    (_, tag: string, content: string) => {
      const text = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      return (text ? optimizeTd(tag, textColor) : tag) + content;
    }
  );

  output = output.replace(/<(table|td)\b[^>]*>/gi, (tag) => {
    let result = tag;
    const bgcolor = getAttr(result, 'bgcolor');
    if (bgcolor !== null) result = setAttr(result, 'bgcolor', cleanColor(bgcolor));
    const style = getAttr(result, 'style');
    if (style !== null) result = setAttr(result, 'style', cleanStyle(style));
    return result;
  });

  // Ids are only used to label tracked links when saving; clients strip them
  output = output.replace(/(<a\b[^>]*?)\s+id\s*=\s*"[^"]*"/gi, '$1');

  return output;
}

// Problems that would make the signature render incorrectly once installed.
export function getSignatureHtmlWarnings(html: string) {
  const warnings: string[] = [];
  if (/\ssrc\s*=\s*"data:/i.test(html)) {
    warnings.push('Embedded (base64) images are blocked by Gmail and Outlook.');
  }
  if (/\shref\s*=\s*"(?!https?:|mailto:|tel:)/i.test(html)) {
    warnings.push('Some links are not absolute URLs and will not work in emails.');
  }
  if (html.length > GMAIL_SIGNATURE_CHAR_LIMIT) {
    warnings.push(
      `Signature is ${html.length} characters; Gmail accepts up to ${GMAIL_SIGNATURE_CHAR_LIMIT}.`
    );
  }
  return warnings;
}
