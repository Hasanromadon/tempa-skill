import { expect, test } from "@playwright/test";
import { loginAdmin } from "./helpers/test-helpers";

test.describe("Search Input Focus Debug", () => {
  // Admin credentials
  const ADMIN_EMAIL = "admin@tempaskill.com";
  const ADMIN_PASSWORD = "admin123";

  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAdmin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForTimeout(500);
  });

  test("typing should NOT blur search input", async ({ page }) => {
    // Navigate to admin courses
    await page.goto("/admin/courses");
    await page.waitForLoadState("networkidle");

    // Find search input
    const searchInput = page.locator(
      'input[placeholder="Cari berdasarkan judul kursus..."]'
    );

    // Verify input exists and visible
    await expect(searchInput).toBeVisible();

    // Click to focus
    await searchInput.click();

    // Type slowly to observe behavior
    await searchInput.type("test", { delay: 200 });

    // After typing, check if input still has focus
    const isFocused = await searchInput.evaluate(
      (el) => el === document.activeElement
    );

    console.log("Input has focus after typing:", isFocused);
    expect(isFocused).toBe(true);
  });

  test("search should work and data should update", async ({ page }) => {
    await page.goto("/admin/courses");
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator(
      'input[placeholder="Cari berdasarkan judul kursus..."]'
    );

    // Type search term
    await searchInput.type("pemrograman");

    // Wait for debounce (500ms) + API response
    await page.waitForTimeout(1500);

    // Check if search executed (look for data or message)
    // Data table should either show filtered results or "tidak ada kursus"
    const tableOrMessage = page.locator(
      "text=/tidak ada kursus|tbody tr|Tidak ada kursus/"
    );

    await expect(tableOrMessage).toBeVisible();
  });

  test("focus maintained while typing multiple characters", async ({ page }) => {
    await page.goto("/admin/courses");
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator(
      'input[placeholder="Cari berdasarkan judul kursus..."]'
    );

    await searchInput.click();

    // Type characters with delay between each
    const searchText = "react";
    for (let i = 0; i < searchText.length; i++) {
      await searchInput.type(searchText[i]);
      await page.waitForTimeout(100);

      // Check focus after each keystroke
      const isFocused = await searchInput.evaluate(
        (el) => el === document.activeElement
      );

      console.log(`Focus after char '${searchText[i]}':`, isFocused);
      expect(isFocused).toBe(true);
    }
  });

  test("focus maintained after debounce completes", async ({ page }) => {
    await page.goto("/admin/courses");
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator(
      'input[placeholder="Cari berdasarkan judul kursus..."]'
    );

    await searchInput.click();

    // Type something
    await searchInput.type("javascript", { delay: 50 });

    // Wait for debounce to complete (500ms) + extra buffer
    console.log("Waiting for debounce to complete...");
    await page.waitForTimeout(800);

    // Check focus after debounce
    const isFocused = await searchInput.evaluate(
      (el) => el === document.activeElement
    );

    console.log("Focus after debounce:", isFocused);
    expect(isFocused).toBe(true);

    // Wait for API response
    console.log("Waiting for API response...");
    await page.waitForTimeout(1000);

    // Final focus check
    const isFocusedAfterAPI = await searchInput.evaluate(
      (el) => el === document.activeElement
    );

    console.log("Focus after API response:", isFocusedAfterAPI);
    expect(isFocusedAfterAPI).toBe(true);
  });

  test("clear button should work without blur", async ({ page }) => {
    await page.goto("/admin/courses");
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator(
      'input[placeholder="Cari berdasarkan judul kursus..."]'
    );

    // Type something
    await searchInput.type("test");
    await page.waitForTimeout(100);

    // Find clear button (X icon)
    const clearButton = page
      .locator('button[aria-label="Clear search"]')
      .or(page.locator('button:has-text("×")'))
      .first();

    if (await clearButton.isVisible()) {
      // Click clear button
      await clearButton.click();

      // Check if input is cleared
      const value = await searchInput.inputValue();
      expect(value).toBe("");

      // Check if focus is maintained or moved to input
      const isFocused = await searchInput.evaluate(
        (el) => el === document.activeElement
      );

      console.log("Focus after clear button:", isFocused);
      // After clear, focus should ideally stay on input
      expect(isFocused).toBe(true);
    }
  });
});
