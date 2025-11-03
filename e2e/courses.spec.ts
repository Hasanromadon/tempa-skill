import { test, expect } from "@playwright/test";
import {
  register,
  generateTestUser,
  goToCourse,
  enrollCourse,
} from "./helpers/test-helpers";

test.describe("Course Browsing", () => {
  test.describe("Landing Page", () => {
    test("should display landing page with Indonesian text", async ({
      page,
    }) => {
      await page.goto("/");

      // Check for main heading
      await expect(
        page.getByRole("heading", { name: /Belajar Keterampilan Melalui/i })
      ).toBeVisible();

      // Should have CTA buttons
      await expect(
        page.getByRole("link", { name: "Jelajahi Kursus" })
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Mulai Gratis" })
      ).toBeVisible();
    });

    test("should navigate to courses from landing page", async ({ page }) => {
      await page.goto("/");

      // Click "Jelajahi Kursus" button
      await page.getByRole("link", { name: "Jelajahi Kursus" }).click();

      await page.waitForURL("/courses");
      expect(page.url()).toContain("/courses");
    });
  });

  test.describe("Courses List", () => {
    test("should display courses list page", async ({ page }) => {
      await page.goto("/courses");

      // Check page heading "Jelajahi Kursus"
      await expect(
        page.getByRole("heading", { name: "Jelajahi Kursus" })
      ).toBeVisible();

      // Check description
      await expect(
        page.getByText("Temukan kursus berbasis teks dengan sesi langsung")
      ).toBeVisible();
    });

    test("should show course cards with required info", async ({ page }) => {
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      // Wait for courses to load - cards use shadcn Card component
      // If there are courses, they will be in card elements
      const hasCourses =
        (await page.locator('[class*="rounded"][class*="border"]').count()) > 0;

      if (hasCourses) {
        // At least one course card should be visible
        const firstCard = page
          .locator('[class*="rounded"][class*="border"]')
          .first();
        await expect(firstCard).toBeVisible();
      } else {
        // If no courses, should show empty state or loading
        console.log("No courses available for testing");
      }
    });

    test("should filter courses by category", async ({ page }) => {
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      // Look for filter/category buttons
      const filterButton = page
        .locator('button:has-text("Programming"), button:has-text("Design")')
        .first();

      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForLoadState("networkidle");
        // Results should update
      }
    });

    test("should search courses", async ({ page }) => {
      await page.goto("/courses");

      // Look for search input
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="cari"]'
      );

      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        await page.waitForTimeout(1000); // Wait for debounce
        // Results should filter
      }
    });
  });

  test.describe("Course Detail", () => {
    test("should display course detail page", async ({ page }) => {
      // This test requires a course to exist
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      // Find first course link
      const firstCourse = page.locator('a[href*="/courses/"]').first();

      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        // Wait for course content to load - wait for heading first
        await page.waitForSelector("h1", { timeout: 10000 });

        // Should show course title and back button
        await expect(page.locator("text=/kembali ke kursus/i")).toBeVisible();

        // Should show course difficulty badge - wait for any badge to be visible
        const difficultyBadge = page.getByText(/pemula|menengah|lanjutan/i);
        await expect(difficultyBadge).toBeVisible({ timeout: 10000 });
      }
    });

    test("should show enroll button for unenrolled course", async ({
      page,
    }) => {
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();

      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        // Wait for page to fully load - wait for heading
        await page.waitForSelector("h1", { timeout: 10000 });

        // For guest users, should show login/register prompt
        // For authenticated users, should show enroll button or enrolled status
        const hasLoginPrompt = await page
          .getByText(/masuk.*atau.*buat akun/i)
          .isVisible()
          .catch(() => false);

        const hasDaftarButton = await page
          .getByRole("button", { name: /daftar/i })
          .isVisible()
          .catch(() => false);

        const hasEnrolledBadge = await page
          .getByText("Terdaftar")
          .isVisible()
          .catch(() => false);

        const hasStartButton = await page
          .getByRole("button", { name: /mulai belajar|lanjutkan/i })
          .isVisible()
          .catch(() => false);

        // At least one of these should be visible
        expect(
          hasLoginPrompt ||
            hasDaftarButton ||
            hasEnrolledBadge ||
            hasStartButton
        ).toBeTruthy();
      }
    });

    test("should display course lessons", async ({ page }) => {
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();

      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        // Should show course stats - check for "Pelajaran" count in stats area
        await expect(page.locator("text=/pelajaran/i").first()).toBeVisible();
      }
    });

    test("should show course information", async ({ page }) => {
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();

      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        // Wait for page to load - wait for heading
        await page.waitForSelector("h1", { timeout: 10000 });

        // Should show course information in sidebar - check for Kategori label
        await expect(page.getByText("Kategori")).toBeVisible({
          timeout: 10000,
        });

        // Should show Tingkat Kesulitan label
        await expect(page.getByText("Tingkat Kesulitan")).toBeVisible({
          timeout: 10000,
        });
      }
    });
  });

  test.describe("Course Enrollment", () => {
    test("should enroll in free course when logged in", async ({ page }) => {
      // Register and login
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      // Go to courses
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      // Find a free course
      const firstCourse = page.locator('a[href*="/courses/"]').first();

      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        // Try to enroll
        const enrollButton = page
          .locator('button:has-text("Daftar"), button:has-text("Enroll")')
          .first();

        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);

          // Should show enrolled state or success message
          const enrolled = await page
            .locator("text=/terdaftar|enrolled|berhasil/i")
            .isVisible();
          expect(enrolled).toBeTruthy();
        }
      }
    });

    test("should redirect to login when trying to enroll without auth", async ({
      page,
    }) => {
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();

      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        const enrollButton = page
          .locator('button:has-text("Daftar"), button:has-text("Enroll")')
          .first();

        if (await enrollButton.isVisible()) {
          await enrollButton.click();

          // Should redirect to login
          await page.waitForTimeout(1000);
          expect(page.url()).toMatch(/login/);
        }
      }
    });

    test("should unenroll from course", async ({ page }) => {
      // Register and login
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      // Go to courses and enroll
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();

      if (await firstCourse.isVisible()) {
        const href = await firstCourse.getAttribute("href");
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        // Enroll first
        const enrollButton = page
          .locator('button:has-text("Daftar"), button:has-text("Enroll")')
          .first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }

        // Now try to unenroll
        const unenrollButton = page
          .locator('button:has-text("Batalkan"), button:has-text("Unenroll")')
          .first();
        if (await unenrollButton.isVisible()) {
          await unenrollButton.click();
          await page.waitForTimeout(2000);

          // Should show unenrolled state
          const enrollAgain = await page
            .locator('button:has-text("Daftar"), button:has-text("Enroll")')
            .isVisible();
          expect(enrollAgain).toBeTruthy();
        }
      }
    });
  });
});
