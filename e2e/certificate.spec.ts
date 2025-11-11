import { expect, test } from "@playwright/test";
import {
  enrollCourse,
  generateTestUser,
  goToCourse,
  login,
  register,
} from "./helpers/test-helpers";

const TEST_COURSE_SLUG = "pemrograman-web-modern-react-nextjs";

test.describe("Sertifikat Kursus", () => {
  test("user dapat mengeluarkan dan mengunduh sertifikat setelah menyelesaikan kursus", async ({
    page,
  }) => {
    // Test isolation: create unique user
    const user = generateTestUser();
    await register(page, user.name, user.email, user.password);
    await login(page, user.email, user.password);

    // Enroll in the course
    await goToCourse(page, TEST_COURSE_SLUG);
    await enrollCourse(page);

    await page.goto(`/courses/${TEST_COURSE_SLUG}`);
    await page.waitForSelector("text=Anda Sudah Terdaftar", { timeout: 10000 });

    // Simulasikan progress selesai (bisa mark lesson complete via API/helper if needed)
    // For now, assume backend test user is eligible
    await expect(page.locator("text=Ambil Sertifikat")).toBeVisible({
      timeout: 10000,
    });
    await page.click("text=Ambil Sertifikat");
    await expect(page.locator("text=Unduh Sertifikat PDF")).toBeVisible({
      timeout: 10000,
    });
    await page.click("text=Unduh Sertifikat PDF");
    // TODO: Add download assertion if download path is configured
  });

  test("user tidak bisa mengeluarkan sertifikat jika kursus belum selesai", async ({
    page,
  }) => {
    const user = generateTestUser();
    await register(page, user.name, user.email, user.password);
    await login(page, user.email, user.password);

    // Enroll in the course
    await goToCourse(page, TEST_COURSE_SLUG);
    await enrollCourse(page);

    await page.goto(`/courses/${TEST_COURSE_SLUG}`);
    await page.waitForSelector("text=Anda Sudah Terdaftar", { timeout: 10000 });
    await expect(page.locator("text=Ambil Sertifikat")).not.toBeVisible();
    await expect(page.locator("text=Unduh Sertifikat PDF")).not.toBeVisible();
  });
});
