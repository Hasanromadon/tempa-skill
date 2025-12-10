/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length).trim() + "...";
}

/**
 * Calculate estimated reading time for content
 * @param content - Text content
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200
): number {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

/**
 * Format reading time to human-readable format
 * @param content - Text content
 * @returns Formatted reading time (e.g., "5 menit membaca")
 */
export function formatReadingTime(content: string): string {
  const minutes = calculateReadingTime(content);
  return `${minutes} menit membaca`;
}
