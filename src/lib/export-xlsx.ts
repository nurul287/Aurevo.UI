import * as XLSX from "xlsx";

/** "2026-07-03_14-05-22" — safe for filenames, sortable, no duplicate collisions. */
function timestampForFilename(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

/**
 * Builds a single-sheet .xlsx file and triggers a browser download.
 * `filenamePrefix` and `sheetName` should reflect the active tab/dataset
 * being exported so files stay distinguishable across tabs.
 */
export function exportRowsToXlsx(
  filenamePrefix: string,
  sheetName: string,
  rows: Record<string, unknown>[],
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  // Sheet names are capped at 31 chars and can't contain \/*?[]:
  const safeSheetName = sheetName.replace(/[\\/*?[\]:]/g, "").slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName || "Sheet1");
  XLSX.writeFile(workbook, `${filenamePrefix}_${timestampForFilename()}.xlsx`);
}
