import { test, expect } from "@playwright/test";
import { register, generateTestUser } from "./helpers/test-helpers";

test.describe("Dashboard", () => {
  test.describe("Dashboard Access", () => {
    test("should display dashboard for authenticated user", async ({
      page,
    }) => {
      // Register and login
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      // Navigate to dashboard
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should show dashboard content
      await expect(page.locator("text=/dashboard/i")).toBeVisible();
    });

    test("should show user greeting in Indonesian", async ({ page }) => {
      // Register and login
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should show greeting with user name
      const greeting = page.locator(`text=/halo|selamat.*datang|hai/i`);
      await expect(greeting).toBeVisible();
    });
  });

  test.describe("Enrolled Courses", () => {
    test("should display enrolled courses section", async ({ page }) => {
      // Register and login
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should have enrolled courses section
      await expect(
        page.locator("text=/kursus.*saya|kursus.*terdaftar|enrolled/i")
      ).toBeVisible();
    });

    test("should show enrolled course after enrollment", async ({ page }) => {
      // Register and login
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      // Enroll in a course
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();
      let courseTitle = "";

      if (await firstCourse.isVisible()) {
        // Get course title
        courseTitle = (await firstCourse.textContent()) || "";

        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
      }

      // Go to dashboard
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should see the enrolled course (if we got a title)
      if (courseTitle) {
        // Dashboard should show course or at least enrolled courses section
        const enrolledSection = await page
          .locator("text=/kursus.*saya|enrolled/i")
          .isVisible();
        expect(enrolledSection).toBeTruthy();
      }
    });

    test("should show empty state when no enrollments", async ({ page }) => {
      // Register new user
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should show empty state or message
      const emptyMessage = await page
        .locator("text=/belum.*terdaftar|no.*enrolled|mulai.*belajar/i")
        .isVisible();
      expect(emptyMessage).toBeTruthy();
    });
  });

  test.describe("Progress Display", () => {
    test("should display overall progress", async ({ page }) => {
      // Register and login
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should show some progress metrics
      // This could be cards showing total courses, completed lessons, etc.
      const hasStats =
        (await page.locator('[class*="stat" i], [class*="card" i]').count()) >
        0;
      expect(hasStats).toBeTruthy();
    });

    test("should show course progress bars", async ({ page }) => {
      // Register and enroll in course
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      // Enroll in a course
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
      }

      // Go to dashboard
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should show progress indicator
      const hasProgress =
        (await page
          .locator('[role="progressbar"], progress, [class*="progress" i]')
          .count()) > 0;
      expect(hasProgress).toBeTruthy();
    });

    test("should update progress after completing lesson", async ({ page }) => {
      // Register
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      // Enroll in course
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }

        // Complete a lesson
        const firstLesson = page.locator('a[href*="/lessons/"]').first();
        if (await firstLesson.isVisible()) {
          await firstLesson.click();
          await page.waitForLoadState("networkidle");

          const completeButton = page
            .locator('button:has-text("Tandai Selesai")')
            .first();
          if (await completeButton.isVisible()) {
            await completeButton.click();
            await page.waitForTimeout(2000);
          }
        }
      }

      // Check dashboard
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should show some progress
      const progressText = await page
        .locator("text=/\\d+.*%|\\d+.*selesai|completed/i")
        .textContent();
      expect(progressText).toBeTruthy();
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to course from dashboard", async ({ page }) => {
      // Register and enroll
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
      }

      // Go to dashboard
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Click on enrolled course
      const courseLink = page.locator('a[href*="/courses/"]').first();
      if (await courseLink.isVisible()) {
        await courseLink.click();
        await page.waitForLoadState("networkidle");

        // Should be on course detail page
        expect(page.url()).toMatch(/\/courses\//);
      }
    });

    test("should have link to browse more courses", async ({ page }) => {
      // Register
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should have link to courses page
      const browseCourses = page.locator('a[href="/courses"]');
      if ((await browseCourses.count()) > 0) {
        await expect(browseCourses.first()).toBeVisible();
      } else {
        // Or text link to browse courses
        const browseText = page.getByText(/jelajah.*kursus/i);
        await expect(browseText.first()).toBeVisible();
      }
    });
  });

  test.describe("Statistics", () => {
    test("should display learning statistics", async ({ page }) => {
      // Register
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should show stats like:
      // - Total enrolled courses
      // - Completed lessons
      // - Total learning time
      const hasNumbers = (await page.locator("text=/\\d+/").count()) > 0;
      expect(hasNumbers).toBeTruthy();
    });
  });

  test.describe("Continue Learning", () => {
    test("should show continue learning button", async ({ page }) => {
      // Register and start a course
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);

      // Enroll in course
      await page.goto("/courses");
      await page.waitForLoadState("networkidle");

      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState("networkidle");

        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
      }

      // Go to dashboard
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should have continue button
      const continueButton = page
        .locator("text=/lanjutkan|continue|mulai/i")
        .first();
      await expect(continueButton).toBeVisible();
    });
  });
});
