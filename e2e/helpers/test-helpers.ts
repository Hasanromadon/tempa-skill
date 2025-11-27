import { Page, expect } from "@playwright/test";

/**
 * Test helper untuk login user
 * Handles both regular users and admins
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Wait for email input to appear
  await page.waitForSelector('input[id="email"]', { timeout: 10000 });

  // Fill login form
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);

  // Click submit button
  await page.click('button[type="submit"]');

  // Wait for navigation to complete (can go to /dashboard, /courses, or /admin/*)
  await page.waitForURL(/\/(dashboard|courses|admin)/, { timeout: 10000 });
}

/**
 * Test helper untuk login admin
 * Admin redirects to /admin/dashboard after successful login
 */
export async function loginAdmin(page: Page, email: string, password: string) {
  // Clear any existing cookies to ensure clean login state
  await page.context().clearCookies();

  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Wait for email input to appear
  await page.waitForSelector('input[id="email"]', { timeout: 10000 });

  // Fill login form
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);

  // Click submit button and wait for navigation
  // Don't use waitForResponse as it's flaky - just wait for URL change
  await page.click('button[type="submit"]');

  // Wait for redirect to admin area
  // Could be /admin/dashboard or other admin routes
  try {
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  } catch (error) {
    // If navigation fails, check if we're still on login (login failed)
    if (page.url().includes("/login")) {
      throw new Error(
        `Admin login failed - still on login page. Check credentials and ensure backend is running.`
      );
    }
    // If neither redirect nor stay on login, something else happened
    throw error;
  }
}

/**
 * Test helper untuk register user baru
 * Using correct form field names and register page path
 */
export async function register(
  page: Page,
  name: string,
  email: string,
  password: string
) {
  // Navigate to register page (using /register route, not /daftar which is just a redirect)
  await page.goto("/register");
  await page.waitForLoadState("networkidle");

  // Wait for form fields to appear
  await page.waitForSelector('input[id="name"]', { timeout: 10000 });

  // Fill registration form with correct field IDs (not name attributes)
  await page.fill('input[id="name"]', name);
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  // Field name is "confirmPassword" (camelCase, not snake_case)
  await page.fill('input[id="confirmPassword"]', password);

  // Click submit button
  await page.click('button[type="submit"]');

  // Wait for navigation or API response
  // Can redirect to /dashboard or /courses depending on app flow
  await page.waitForURL(/\/(dashboard|courses)/, { timeout: 60000 });
}

/**
 * Test helper untuk logout
 * Handles logout dialog and navigation
 */
export async function logout(page: Page) {
  // Find logout button - could be in menu, navbar, or dropdown
  // Try multiple selectors to be flexible
  let logoutButton = page.locator("button:has-text(/keluar|logout/i)").first();

  if (!(await logoutButton.isVisible())) {
    // Try alternative selector - might be a menu item
    logoutButton = page
      .locator("a, button")
      .filter({ hasText: /keluar|logout/i })
      .first();
  }

  if (await logoutButton.isVisible()) {
    await logoutButton.click();

    // Some implementations show a confirmation dialog
    // Wait a bit for dialog to appear
    await page.waitForTimeout(500);

    // Try to click confirmation button
    // Different possible texts: "Ya, Keluar" / "Confirm" / "OK"
    const confirmButton = page
      .locator("button")
      .filter({ hasText: /ya|confirm|ok|keluar/i })
      .last();

    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Wait for navigation - can go to home, login, or just clear auth
    await page.waitForURL(/\/(|login|home)/, { timeout: 30000 }).catch(() => {
      // If URL doesn't match, just wait for page stability
      return page.waitForLoadState("networkidle");
    });
  }
}

/**
 * Generate random email untuk testing
 */
export function generateTestEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@tempaskill.test`;
}

/**
 * Generate random user data
 */
export function generateTestUser() {
  return {
    name: `Test User ${Date.now()}`,
    email: generateTestEmail(),
    password: "TestPassword123!",
  };
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET"
) {
  return page.waitForResponse(
    (response) =>
      response.url().match(urlPattern) !== null &&
      response.request().method() === method
  );
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for user menu or dashboard link
  const dashboardLink = page.locator("text=/dashboard/i");
  return dashboardLink.isVisible();
}

/**
 * Navigate to course detail
 */
export async function goToCourse(page: Page, slug: string) {
  await page.goto(`/courses/${slug}`);
  await page.waitForLoadState("networkidle");
}

/**
 * Navigate to lesson
 */
export async function goToLesson(
  page: Page,
  courseSlug: string,
  lessonId: number
) {
  await page.goto(`/courses/${courseSlug}/lessons/${lessonId}`);
  await page.waitForLoadState("networkidle");
}

/**
 * Enroll in course
 */
export async function enrollCourse(page: Page) {
  // Click enroll button
  const enrollButton = page.locator("text=/daftar sekarang|enroll/i").first();
  await enrollButton.click();

  // Wait for enrollment to complete
  await page.waitForTimeout(1000);
}

/**
 * Mark lesson as complete
 */
export async function markLessonComplete(page: Page) {
  const completeButton = page
    .locator("text=/tandai selesai|mark.*complete/i")
    .first();
  if (await completeButton.isVisible()) {
    await completeButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Assert element contains text (case insensitive)
 */
export async function assertTextVisible(page: Page, text: string | RegExp) {
  const element = page.locator(
    `text=${text instanceof RegExp ? text : new RegExp(text, "i")}`
  );
  await expect(element).toBeVisible();
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}
