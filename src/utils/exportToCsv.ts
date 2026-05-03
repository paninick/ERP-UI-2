export function exportToCsv(
  columns: { key: string; title: string }[],
  data: Record<string, any>[],
  filename: string,
): void {
  const BOM = '﻿';

  const headers = columns.map((c) => escapeCsvField(c.title)).join(',');
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        return escapeCsvField(val != null ? String(val) : '');
      })
      .join(','),
  );

  const csv = BOM + [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvField(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
