// Minimal RFC 4180 parser: quoted fields, escaped quotes, newlines inside
// quotes, CRLF and a UTF-8 BOM. Excel in many locales exports with ";", so
// the delimiter is detected from the header line.
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^﻿/, '');
  const headerLine = input.split(/\r?\n/, 1)[0] ?? '';
  const delimiter =
    (headerLine.match(/;/g)?.length ?? 0) > (headerLine.match(/,/g)?.length ?? 0) ? ';' : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  // Drop fully empty lines (trailing newline, blank rows from spreadsheets)
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

export function toCsv(rows: string[][]) {
  return rows
    .map((cells) =>
      cells.map((cell) => (/[",;\n\r]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(',')
    )
    .join('\r\n');
}
