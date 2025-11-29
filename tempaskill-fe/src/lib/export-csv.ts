/**
 * Utility functions for exporting data to CSV
 */

export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (value: unknown, row: T) => string;
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV<T>(data: T[], columns: ExportColumn<T>[]): string {
  // Create header row
  const headers = columns.map((col) => col.label).join(",");

  // Create data rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const key = col.key as keyof T;
        const value = item[key];

        // Use custom formatter if provided
        const formatted = col.format ? col.format(value, item) : value;

        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(formatted ?? "");
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    // Create download link
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
  }
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
) {
  const csv = convertToCSV(data, columns);
  downloadCSV(csv, filename);
}
