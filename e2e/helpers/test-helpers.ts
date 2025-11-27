import { Page, expect } from "@playwright/test";

/**
 * Test helper untuk login user
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('input[id="email"]', { timeout: 10000 });
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL(/\/(dashboard|courses)/, { timeout: 10000 });
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

  // Take screenshot for debugging
  await page.screenshot({ path: "debug-login-page.png" });

  // Fill login form
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);

  // Click login button and wait for response
  const [response] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/auth/login") &&
        response.request().method() === "POST"
    ),
    page.click('button[type="submit"]'),
  ]);

  // Check if login was successful
  const status = response.status();
  if (status !== 200) {
    console.error(`Login failed with status ${status}`);
    console.error(`Response URL: ${response.url()}`);
    throw new Error(
      `Admin login failed with status ${status}. Check if admin user exists and backend is running.`
    );
  }

  // Wait for redirect to admin area
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

/**
 * Test helper untuk register user baru
 */
export async function register(
  page: Page,
  name: string,
  email: string,
  password: string
) {
  await page.goto("/daftar");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('input[name="name"]', { timeout: 10000 });
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);

  // Click submit button
  await page.click('button[type="submit"]');

  // Wait for navigation or error
  await page.waitForURL(/\/(dashboard|courses)/, { timeout: 60000 });
}

/**
 * Test helper untuk logout
 */
export async function logout(page: Page) {
  // Find and click logout button (opens AlertDialog)
  const logoutButton = page.locator("text=/keluar|logout/i").first();
  if (await logoutButton.isVisible()) {
    await logoutButton.click();

    // Wait for confirmation dialog and click "Ya, Keluar"
    await page.waitForTimeout(500); // Wait for dialog animation
    const confirmButton = page.locator("text=/Ya,?\\s*Keluar/i");
    await confirmButton.click();

    // Wait for navigation to complete
    await page.waitForURL(/\/(|login)/, { timeout: 30000 });
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
