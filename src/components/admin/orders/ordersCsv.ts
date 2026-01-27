type CsvRow = Record<string, string | number | null | undefined>;

function escapeCsv(value: string) {
  if (/[\n\r",]/.test(value)) return `"${value.split('"').join('""')}"`;
  return value;
}


export function downloadCsv(filename: string, rows: CsvRow[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map((h) => escapeCsv(h)).join(","),
    ...rows.map((r) => headers.map((h) => escapeCsv(String(r[h] ?? ""))).join(",")),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
