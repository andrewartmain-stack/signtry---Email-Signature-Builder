export function renderSignature(
  template: string,
  data: Record<string, string>
) {
  let output = template;

  // Сначала удаляем блоки с пустыми значениями
  Object.keys(data).forEach((key) => {
    if (!data[key]) {
      const startRegex = new RegExp(`<!-- {{${key}_start}} -->`, 'g');
      const endRegex = new RegExp(`<!-- {{${key}_end}} -->`, 'g');

      // Находим содержимое между начальным и конечным комментариями
      const blockRegex = new RegExp(
        `<!-- {{${key}_start}} -->[\\s\\S]*?<!-- {{${key}_end}} -->`,
        'g'
      );
      output = output.replace(blockRegex, '');
    }
  });

  // Затем заменяем оставшиеся плейсхолдеры
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    output = output.replace(regex, data[key] || '');
  });

  // Удаляем оставшиеся условные комментарии (для непустых полей)
  Object.keys(data).forEach((key) => {
    const startRegex = new RegExp(`<!-- {{${key}_start}} -->`, 'g');
    const endRegex = new RegExp(`<!-- {{${key}_end}} -->`, 'g');
    output = output.replace(startRegex, '');
    output = output.replace(endRegex, '');
  });

  return output;
}
