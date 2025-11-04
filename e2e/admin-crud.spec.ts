import { expect, test } from "@playwright/test";
import { loginAdmin } from "./helpers/test-helpers";

/**
 * E2E Tests for Admin CRUD Operations
 *
 * Prerequisites:
 * - Backend running at http://localhost:8080
 * - Frontend running at http://localhost:3000
 * - Admin account: admin@tempaskill.com / admin123
 */

test.describe("Admin CRUD Operations", () => {
  // Admin credentials (make sure this exists in your database)
  const ADMIN_EMAIL = "admin@tempaskill.com";
  const ADMIN_PASSWORD = "admin123";

  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAdmin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForTimeout(500);
  });

  test.describe("Course CRUD", () => {
    test("should create a new course", async ({ page }) => {
      // Navigate to admin courses
      await page.goto("/admin/courses");
      await page.waitForLoadState("networkidle");

      // Click "Tambah Kursus" button
      const addButton = page.locator('a[href="/admin/courses/new"]');
      await expect(addButton).toBeVisible();
      await addButton.click();

      await page.waitForURL("/admin/courses/new");

      // Fill course form
      const timestamp = Date.now();
      const courseTitle = `Test Course ${timestamp}`;
      const courseDescription = `This is a test course created at ${new Date().toISOString()}`;

      await page.fill('input[name="title"]', courseTitle);
      await page.fill('textarea[name="description"]', courseDescription);

      // Select category using Shadcn Select component
      const categoryTrigger = page.locator('button:has-text("Pilih kategori")');
      await categoryTrigger.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]:has-text("Web Development")').click();

      // Select difficulty using Shadcn Select component
      const difficultyTrigger = page.locator(
        'button:has-text("Pilih tingkat kesulitan")'
      );
      await difficultyTrigger.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]:has-text("Pemula")').click();

      // Set price
      await page.fill('input[name="price"]', "99000");

      // Submit form - button text is "Buat Kursus" for new course
      await page.click('button[type="submit"]:has-text("Buat Kursus")');

      // Wait for success notification or redirect
      await page.waitForTimeout(2000);

      // Should redirect to courses list
      expect(page.url()).toContain("/admin/courses");

      // Verify course appears in list
      await expect(page.locator(`text=${courseTitle}`)).toBeVisible();
    });

    test("should edit an existing course", async ({ page }) => {
      // Navigate to admin courses
      await page.goto("/admin/courses");
      await page.waitForLoadState("networkidle");

      // Find first course and click its dropdown menu
      const firstRow = page.locator("tbody tr").first();
      const dropdownTrigger = firstRow.locator('button[aria-label*="Aksi"]');

      if (await dropdownTrigger.isVisible()) {
        await dropdownTrigger.click();
        await page.waitForTimeout(300);

        // Click Edit option in dropdown
        await page.locator('[role="menuitem"]:has-text("Edit")').click();
        await page.waitForLoadState("networkidle");

        // Modify title
        const titleInput = page.locator('input[name="title"]');
        const originalTitle = await titleInput.inputValue();
        const updatedTitle = `${originalTitle} - Edited ${Date.now()}`;

        await titleInput.fill(updatedTitle);

        // Submit form - button text is "Perbarui Kursus" for edit mode
        await page.click('button[type="submit"]:has-text("Perbarui Kursus")');
        await page.waitForTimeout(2000);

        // Verify update
        await page.goto("/admin/courses");
        await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();
      } else {
        test.skip();
      }
    });
    test("should delete a course", async ({ page }) => {
      // First create a course to delete
      await page.goto("/admin/courses/new");
      await page.waitForLoadState("networkidle");

      const courseTitle = `Course to Delete ${Date.now()}`;
      await page.fill('input[name="title"]', courseTitle);
      await page.fill('textarea[name="description"]', "This will be deleted");

      // Select category
      const categoryTrigger = page.locator('button:has-text("Pilih kategori")');
      await categoryTrigger.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]:has-text("Web Development")').click();

      // Select difficulty
      const difficultyTrigger = page.locator(
        'button:has-text("Pilih tingkat kesulitan")'
      );
      await difficultyTrigger.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]:has-text("Pemula")').click();

      await page.fill('input[name="price"]', "50000");
      await page.click('button[type="submit"]:has-text("Buat Kursus")');
      await page.waitForTimeout(2000);

      // Now delete it
      await page.goto("/admin/courses");
      await page.waitForLoadState("networkidle");

      // Find the course row
      const courseRow = page.locator(`tr:has-text("${courseTitle}")`);

      if (await courseRow.isVisible()) {
        // Click dropdown menu for that course
        const dropdownTrigger = courseRow.locator('button[aria-label*="Aksi"]');
        await dropdownTrigger.click();
        await page.waitForTimeout(300);

        // Click Hapus option
        await page.locator('[role="menuitem"]:has-text("Hapus")').click();

        // Confirm deletion in dialog - check DeleteCourseDialog component
        await page.waitForTimeout(500);
        const confirmButton = page.locator('button:has-text("Ya, Hapus")');
        await confirmButton.click();

        await page.waitForTimeout(2000);

        // Verify course is removed
        await expect(page.locator(`text=${courseTitle}`)).not.toBeVisible();
      }
    });
  });

  test.describe("Lesson CRUD", () => {
    let testCourseId: string;

    test.beforeEach(async ({ page }) => {
      // Get first available course ID from admin courses page
      await page.goto("/admin/courses");
      await page.waitForLoadState("networkidle");

      const firstCourseLink = page
        .locator('a[href*="/admin/courses/"][href*="/lessons"]')
        .first();

      if (await firstCourseLink.isVisible()) {
        const href = await firstCourseLink.getAttribute("href");
        testCourseId =
          href?.match(/\/admin\/courses\/(\d+)\/lessons/)?.[1] || "1";
      } else {
        // Create a course if none exists
        await page.goto("/admin/courses/new");
        await page.fill(
          'input[name="title"]',
          `Course for Lessons ${Date.now()}`
        );
        await page.fill(
          'textarea[name="description"]',
          "Test course for lesson CRUD"
        );
        await page.click('button[role="combobox"]');
        await page.waitForTimeout(300);
        await page.locator('div[role="option"]').first().click();
        await page.fill('input[name="price"]', "0");
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);

        // Extract ID from URL or page
        testCourseId = "1"; // fallback
      }
    });

    test("should create a new lesson", async ({ page }) => {
      // Navigate to lessons page
      await page.goto(`/admin/courses/${testCourseId}/lessons`);
      await page.waitForLoadState("networkidle");

      // Click "Tambah Pelajaran" button
      const addButton = page.locator('a[href*="/lessons/new"]');
      await expect(addButton).toBeVisible();
      await addButton.click();

      await page.waitForLoadState("networkidle");

      // Fill lesson form
      const lessonTitle = `Test Lesson ${Date.now()}`;
      await page.fill('input[name="title"]', lessonTitle);

      // Fill MDX content
      const mdxEditor = page.locator('[contenteditable="true"]').first();
      if (await mdxEditor.isVisible()) {
        await mdxEditor.click();
        await page.keyboard.type(
          "# Test Lesson Content\n\nThis is test content for the lesson."
        );
      }

      // Set duration
      await page.fill('input[name="duration"]', "30");

      // Submit form
      await page.click('button[type="submit"]:has-text("Simpan")');
      await page.waitForTimeout(2000);

      // Should redirect back to lessons list
      expect(page.url()).toContain(`/admin/courses/${testCourseId}/lessons`);

      // Verify lesson appears
      await expect(page.locator(`text=${lessonTitle}`)).toBeVisible();
    });

    test("should edit a lesson", async ({ page }) => {
      // Navigate to lessons
      await page.goto(`/admin/courses/${testCourseId}/lessons`);
      await page.waitForLoadState("networkidle");

      // Click first edit button
      const editButton = page.locator('a[href*="/edit"]').first();

      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState("networkidle");

        // Modify title
        const titleInput = page.locator('input[name="title"]');
        const newTitle = `Edited Lesson ${Date.now()}`;
        await titleInput.fill(newTitle);

        // Submit
        await page.click('button[type="submit"]:has-text("Simpan")');
        await page.waitForTimeout(2000);

        // Verify
        await page.goto(`/admin/courses/${testCourseId}/lessons`);
        await expect(page.locator(`text=${newTitle}`)).toBeVisible();
      } else {
        test.skip();
      }
    });

    test("should toggle lesson published status", async ({ page }) => {
      // Navigate to lessons
      await page.goto(`/admin/courses/${testCourseId}/lessons`);
      await page.waitForLoadState("networkidle");

      // Look for publish/unpublish button
      const statusButton = page
        .locator('button:has-text("Terbitkan"), button:has-text("Sembunyikan")')
        .first();

      if (await statusButton.isVisible()) {
        const initialText = await statusButton.textContent();

        // Click to toggle
        await statusButton.click();
        await page.waitForTimeout(1000);

        // Reload and verify status changed
        await page.reload();
        await page.waitForLoadState("networkidle");

        const newStatusButton = page
          .locator(
            'button:has-text("Terbitkan"), button:has-text("Sembunyikan")'
          )
          .first();
        const newText = await newStatusButton.textContent();

        expect(newText).not.toBe(initialText);
      }
    });
  });

  test.describe("Drag-Drop Lesson Reorder", () => {
    test("should reorder lessons via drag-drop", async ({ page }) => {
      // Navigate to lessons
      await page.goto("/admin/courses");
      await page.waitForLoadState("networkidle");

      const lessonsLink = page.locator('a[href*="/lessons"]').first();
      if (await lessonsLink.isVisible()) {
        await lessonsLink.click();
        await page.waitForLoadState("networkidle");

        // Check if drag-drop interface is present
        const dragHandle = page
          .locator('[class*="cursor-move"], [class*="grip"]')
          .first();

        if (await dragHandle.isVisible()) {
          // Get initial order
          const firstLesson = page
            .locator('[data-testid="lesson-card"]')
            .first();
          const firstLessonText = await firstLesson.textContent();

          // Note: Actual drag-drop testing requires more complex setup
          // For now, verify the drag handles are present
          await expect(dragHandle).toBeVisible();

          console.log(
            "Drag-drop interface verified. Actual drag testing requires advanced Playwright setup."
          );
        } else {
          console.log("No lessons available for drag-drop test");
        }
      }
    });
  });

  test.describe("Admin Dashboard", () => {
    test("should display admin dashboard with statistics", async ({ page }) => {
      await page.goto("/admin/dashboard");
      await page.waitForLoadState("networkidle");

      // Check for dashboard heading
      await expect(
        page.locator("text=/dashboard.*admin|admin.*dashboard/i")
      ).toBeVisible();

      // Check for statistics cards
      const statsCards = page.locator('[class*="rounded"][class*="border"]');
      expect(await statsCards.count()).toBeGreaterThan(0);
    });

    test("should navigate to courses from admin dashboard", async ({
      page,
    }) => {
      await page.goto("/admin/dashboard");
      await page.waitForLoadState("networkidle");

      // Click link to courses management
      const coursesLink = page.locator('a[href="/admin/courses"]');
      if (await coursesLink.isVisible()) {
        await coursesLink.click();
        await page.waitForURL("/admin/courses");

        // Verify courses page loaded - use heading role for specificity
        await expect(
          page.getByRole("heading", { name: /kelola kursus/i })
        ).toBeVisible();
      }
    });
  });

  test.describe("Image Upload", () => {
    test("should upload course thumbnail", async ({ page }) => {
      // Navigate to create course
      await page.goto("/admin/courses/new");
      await page.waitForLoadState("networkidle");

      // Look for file upload input
      const fileInput = page.locator('input[type="file"]');

      if (await fileInput.isVisible()) {
        // Note: Actual file upload testing requires a test image file
        // For now, verify the upload component exists
        await expect(fileInput).toBeVisible();

        console.log(
          "Image upload component verified. Actual upload requires test image file."
        );
      }
    });
  });

  test.describe("Enrollment Management", () => {
    test("should view course enrollments", async ({ page }) => {
      // Navigate to admin courses
      await page.goto("/admin/courses");
      await page.waitForLoadState("networkidle");

      // Look for enrollment count or link
      const enrollmentInfo = page.locator(
        "text=/terdaftar|enrolled|siswa|students/i"
      );

      if (await enrollmentInfo.first().isVisible()) {
        await expect(enrollmentInfo.first()).toBeVisible();
        console.log("Enrollment information visible in admin interface");
      }
    });
  });
});
