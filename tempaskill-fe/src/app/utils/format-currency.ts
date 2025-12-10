/**
 * Format currency to Indonesian Rupiah
 * @param amount - Amount in IDR
 * @returns Formatted currency (e.g., "Rp 499.000")
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
