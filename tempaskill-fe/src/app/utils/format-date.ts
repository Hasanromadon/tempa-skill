/**
 * Format date to Indonesian locale
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "3 November 2025")
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format date to short Indonesian locale
 * @param date - Date string or Date object
 * @returns Short formatted date string (e.g., "3 Nov 2025")
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format duration in minutes to human-readable Indonesian format
 * @param minutes - Duration in minutes
 * @returns Formatted duration (e.g., "2 jam 30 menit" or "45 menit")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} jam`;
  }

  return `${hours} jam ${mins} menit`;
}

/**
 * Check if date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPast(date: string | Date): boolean {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isFuture(date: string | Date): boolean {
  return new Date(date) > new Date();
}

/**
 * Get relative time from now (e.g., "2 hari yang lalu")
 * @param date - Date to compare
 * @returns Relative time string in Indonesian
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Baru saja";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} minggu yang lalu`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} bulan yang lalu`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} tahun yang lalu`;
}
