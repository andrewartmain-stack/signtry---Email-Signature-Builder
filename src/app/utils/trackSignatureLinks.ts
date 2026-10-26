import { v4 as uuidv4 } from 'uuid';

export interface TrackedLink {
  link_key: string;
  target_url: string;
  token: string;
}

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// Rewrites every <a id="..." href="..."> to an absolute /api/r/<token> URL.
// The URL must be absolute: a relative href has no host once the signature is
// pasted into Gmail/Outlook, so every click would go nowhere.
export function trackSignatureLinks(html: string, baseUrl: string) {
  const links: TrackedLink[] = [];
  const origin = baseUrl.replace(/\/+$/, '');

  const trackedHtml = html.replace(/<a\b[^>]*>/gi, (tag) => {
    const id = tag.match(/\sid\s*=\s*"([^"]+)"/i)?.[1];
    const href = tag.match(/\shref\s*=\s*"([^"]+)"/i)?.[1];

    if (!id || !href) return tag;

    const token = uuidv4();
    links.push({ link_key: id, target_url: decodeHtmlAttribute(href), token });

    return tag.replace(/(\shref\s*=\s*)"[^"]+"/i, (_, prefix: string) => `${prefix}"${origin}/api/r/${token}"`);
  });

  return { html: trackedHtml, links };
}

// Signatures saved before tracked links were absolute contain href="api/r/...".
export function absolutizeTrackedLinks(html: string, baseUrl: string) {
  const origin = baseUrl.replace(/\/+$/, '');
  return html.replace(/(\shref\s*=\s*")\/?api\/r\//gi, `$1${origin}/api/r/`);
}
