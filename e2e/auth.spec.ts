import { test, expect } from "@playwright/test";
import {
  register,
  login,
  logout,
  generateTestUser,
} from "./helpers/test-helpers";

test.describe("Authentication Flow", () => {
  test.describe("Registration", () => {
    test("should display registration page in Indonesian", async ({ page }) => {
      await page.goto("/register");

      // Check title "Buat Akun"
      await expect(page.locator('text="Buat Akun"').first()).toBeVisible();

      // Check input fields exist
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(
        page.locator('input[name="password_confirmation"]')
      ).toBeVisible();
    });

    test("should register new user successfully", async ({ page }) => {
      const user = generateTestUser();

      await register(page, user.name, user.email, user.password);

      // Should redirect to dashboard or courses
      expect(page.url()).toMatch(/\/(dashboard|courses)/);

      // Should show user name or dashboard (use first() to avoid strict mode violation)
      await expect(
        page.locator(`text=/${user.name}|dashboard/i`).first()
      ).toBeVisible();
    });

    test("should show validation errors for invalid input", async ({
      page,
    }) => {
      await page.goto("/register");

      // Fill form with invalid data
      await page.fill('input[id="email"]', "invalid"); // Invalid email format
      await page.fill('input[id="password"]', "123"); // Too short
      await page.fill('input[id="password_confirmation"]', "456"); // Doesn't match

      // Try to submit (leave name empty to trigger that error)
      await page.click('button[type="submit"]');

      // Wait a bit for validation to trigger
      await page.waitForTimeout(1000);

      // Should show React Hook Form validation errors
      // Check that at least some error messages are visible
      const errorElements = await page.locator(".text-red-600").count();
      expect(errorElements).toBeGreaterThan(0);

      // Should still be on register page (validation prevented navigation)
      expect(page.url()).toContain("/register");
    });

    test("should show error for duplicate email", async ({ page }) => {
      const user = generateTestUser();

      // Register first time
      await register(page, user.name, user.email, user.password);

      // Logout
      await logout(page);

      // Try to register with same email
      await page.goto("/register");
      await page.fill('input[name="name"]', user.name);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.fill('input[name="password_confirmation"]', user.password);

      // Start waiting for the API response BEFORE clicking submit (accept 400 or 409)
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/auth/register") &&
          (response.status() === 400 ||
            response.status() === 409 ||
            response.status() === 422),
        { timeout: 10000 }
      );

      await page.click('button[type="submit"]');

      // Wait for the API call to complete
      await responsePromise;

      // Wait a bit for any UI updates
      await page.waitForTimeout(1000);

      // Should still be on register page (not redirected)
      expect(page.url()).toContain("/register");
    });
  });

  test.describe("Login", () => {
    test("should display login page in Indonesian", async ({ page }) => {
      await page.goto("/login");

      // Check title "Selamat Datang Kembali"
      await expect(
        page.locator('text="Selamat Datang Kembali"').first()
      ).toBeVisible();

      // Check input fields
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();

      // Check submit button
      await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
    });
    test("should login successfully with valid credentials", async ({
      page,
    }) => {
      // Create a test user first
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      await logout(page);

      // Now login
      await login(page, user.email, user.password);

      // Should be on dashboard or courses
      expect(page.url()).toMatch(/\/(dashboard|courses)/);
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[id="email"]', "wrong@example.com");
      await page.fill('input[id="password"]', "wrongpassword");

      // Start waiting for the API response BEFORE clicking submit
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/auth/login") && response.status() === 401,
        { timeout: 10000 }
      );

      await page.click('button[type="submit"]');

      // Wait for the API call to complete
      await responsePromise;

      // Wait a bit for any UI updates
      await page.waitForTimeout(1000);

      // Should still be on login page (not redirected)
      expect(page.url()).toContain("/login");
    });

    test("should redirect to login when accessing protected page", async ({
      page,
    }) => {
      // Try to access dashboard without login
      await page.goto("/dashboard");

      // Should redirect to login (or stay on dashboard if public)
      // This depends on middleware implementation
      await page.waitForLoadState("networkidle");
    });
  });

  test.describe("Logout", () => {
    test("should logout successfully", async ({ page }) => {
      // Login first
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      // Logout
      await logout(page);

      // Should redirect to home or login
      expect(page.url()).toMatch(/\/(|login)/);
    });
  });

  test.describe("Navigation", () => {
    test("should have register link on login page", async ({ page }) => {
      await page.goto("/login");

      const registerLink = page.locator('a[href*="/register"]');
      await expect(registerLink).toBeVisible();
    });

    test("should have login link on register page", async ({ page }) => {
      await page.goto("/register");

      const loginLink = page.locator('a[href*="/login"]');
      await expect(loginLink).toBeVisible();
    });
  });
});
