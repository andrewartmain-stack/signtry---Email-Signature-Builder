import { optimizeSignatureHtml } from './optimizeSignatureHtml';
import { absolutizeTrackedLinks } from './trackSignatureLinks';

function toPlainText(html: string) {
  const container = document.createElement('div');
  container.innerHTML = html;
  return (container.innerText || container.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

// Older saved signatures have relative tracked links and unoptimized markup;
// fixing them here means every copy is email-ready, old or new.
export function prepareSignatureForEmail(html: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
  return optimizeSignatureHtml(absolutizeTrackedLinks(html, baseUrl));
}

export async function copySignature(html: string) {
  const emailHtml = prepareSignatureForEmail(html);

  try {
    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([emailHtml], { type: 'text/html' }),
      'text/plain': new Blob([toPlainText(emailHtml)], { type: 'text/plain' }),
    });
    await navigator.clipboard.write([clipboardItem]);
  } catch (error) {
    console.error('Failed to copy signature: ', error);
    throw error;
  }
}

// Raw HTML source, for clients that take code instead of pasted formatting
// (Thunderbird, some CRMs and helpdesks).
export async function copySignatureHtmlCode(html: string) {
  await navigator.clipboard.writeText(prepareSignatureForEmail(html));
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

// First visible text lines of a signature (usually name and job title);
// works on the server too, so cards render the same on first paint.
export function getSignatureTextLines(html: string) {
  return html
    .split(/<[^>]*>/)
    .map((chunk) => chunk.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity]).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}
