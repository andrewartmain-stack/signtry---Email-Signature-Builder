// Values end up both in text and inside attributes (href, src, style), so
// escape everything that could break out of either.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderSignature(
  template: string,
  data: Record<string, string | undefined>
) {
  let output = template;

  // Сначала удаляем блоки с пустыми значениями. Keys missing from data count
  // as empty, so a "{{xLink}}" can never leak into a saved signature.
  const blockKeys = new Set([...template.matchAll(/<!-- {{(\w+)_start}} -->/g)].map((match) => match[1]));
  blockKeys.forEach((key) => {
    if (!data[key]) {
      const blockRegex = new RegExp(
        `<!-- {{${key}_start}} -->[\\s\\S]*?<!-- {{${key}_end}} -->`,
        'g'
      );
      output = output.replace(blockRegex, '');
    }
  });

  // Удаляем оставшиеся условные комментарии (для непустых полей)
  output = output.replace(/<!-- {{\w+_(start|end)}} -->/g, '');

  // Затем заменяем плейсхолдеры. A replacer function keeps "$" in values literal.
  output = output.replace(/{{(\w+)}}/g, (_, key: string) => escapeHtml(data[key] ?? ''));

  return output;
}
