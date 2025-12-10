/**
 * Generate a unique request ID for API tracing
 * @returns Unique request ID string
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
