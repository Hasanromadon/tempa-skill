import { test, expect } from "@playwright/test";

test.describe("Search Input Focus Debug", () => {
  test("typing should NOT blur search input", async ({ page }) => {
    // Navigate directly to admin courses (assuming already authenticated via cookies)
    await page.goto("/admin/courses");

    // Wait for page load
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
});
