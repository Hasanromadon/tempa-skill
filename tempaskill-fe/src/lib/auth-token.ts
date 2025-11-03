/**
 * Auth Token Management Utilities
 * Manages authentication tokens in both localStorage (client-side) and cookies (SSR)
 */

const TOKEN_KEY = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

/**
 * Set authentication token in both localStorage and cookie
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;

  // Set in localStorage for client-side access
  localStorage.setItem(TOKEN_KEY, token);

  // Set in cookie for server-side access (middleware)
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove authentication token from both localStorage and cookie
 */
export function removeAuthToken(): void {
  if (typeof window === "undefined") return;

  // Remove from localStorage
  localStorage.removeItem(TOKEN_KEY);

  // Remove from cookie by setting max-age to 0
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
