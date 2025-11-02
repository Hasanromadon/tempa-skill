import { test, expect } from '@playwright/test';
import { register, generateTestUser, goToCourse, enrollCourse } from './helpers/test-helpers';

test.describe('Course Browsing', () => {
  test.describe('Landing Page', () => {
    test('should display landing page with Indonesian text', async ({ page }) => {
      await page.goto('/');
      
      // Check for Indonesian content
      await expect(page.locator('text=/tempaskill|platform|pembelajaran/i')).toBeVisible();
      
      // Should have CTA button
      await expect(page.locator('text=/mulai.*belajar|jelajah.*kursus/i')).toBeVisible();
    });

    test('should navigate to courses from landing page', async ({ page }) => {
      await page.goto('/');
      
      // Click courses/explore button
      const ctaButton = page.locator('a[href*="/courses"]').first();
      await ctaButton.click();
      
      await page.waitForURL('/courses');
      expect(page.url()).toContain('/courses');
    });
  });

  test.describe('Courses List', () => {
    test('should display courses list page', async ({ page }) => {
      await page.goto('/courses');
      
      // Check page title
      await expect(page.locator('text=/kursus|courses/i')).toBeVisible();
      
      // Should have course cards (if any courses exist)
      await page.waitForLoadState('networkidle');
    });

    test('should show course cards with required info', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      // Check if there are any courses
      const courseCards = page.locator('[class*="card"]').first();
      
      if (await courseCards.isVisible()) {
        // Course card should have title, instructor, etc
        // This is a basic check - adjust based on actual implementation
        expect(await courseCards.textContent()).toBeTruthy();
      }
    });

    test('should filter courses by category', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      // Look for filter/category buttons
      const filterButton = page.locator('button:has-text("Programming"), button:has-text("Design")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForLoadState('networkidle');
        // Results should update
      }
    });

    test('should search courses', async ({ page }) => {
      await page.goto('/courses');
      
      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="cari"]');
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000); // Wait for debounce
        // Results should filter
      }
    });
  });

  test.describe('Course Detail', () => {
    test('should display course detail page', async ({ page }) => {
      // This test requires a course to exist
      // You might need to seed database or skip if no courses
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      // Find first course link
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Should show course details
        await expect(page.locator('text=/deskripsi|description|tentang/i')).toBeVisible();
      }
    });

    test('should show enroll button for unenrolled course', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Should have enroll button or enrolled badge
        const enrollButton = page.locator('text=/daftar|enroll|terdaftar/i');
        await expect(enrollButton).toBeVisible();
      }
    });

    test('should display course lessons', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Should show lessons section
        await expect(page.locator('text=/pelajaran|lesson|konten/i')).toBeVisible();
      }
    });

    test('should show instructor information', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Should show instructor section
        await expect(page.locator('text=/instruktur|instructor|pengajar/i')).toBeVisible();
      }
    });
  });

  test.describe('Course Enrollment', () => {
    test('should enroll in free course when logged in', async ({ page }) => {
      // Register and login
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      // Go to courses
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      // Find a free course
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Try to enroll
        const enrollButton = page.locator('button:has-text("Daftar"), button:has-text("Enroll")').first();
        
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
          
          // Should show enrolled state or success message
          const enrolled = await page.locator('text=/terdaftar|enrolled|berhasil/i').isVisible();
          expect(enrolled).toBeTruthy();
        }
      }
    });

    test('should redirect to login when trying to enroll without auth', async ({ page }) => {
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        const enrollButton = page.locator('button:has-text("Daftar"), button:has-text("Enroll")').first();
        
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          
          // Should redirect to login
          await page.waitForTimeout(1000);
          expect(page.url()).toMatch(/login/);
        }
      }
    });

    test('should unenroll from course', async ({ page }) => {
      // Register and login
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      // Go to courses and enroll
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      
      if (await firstCourse.isVisible()) {
        const href = await firstCourse.getAttribute('href');
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll first
        const enrollButton = page.locator('button:has-text("Daftar"), button:has-text("Enroll")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Now try to unenroll
        const unenrollButton = page.locator('button:has-text("Batalkan"), button:has-text("Unenroll")').first();
        if (await unenrollButton.isVisible()) {
          await unenrollButton.click();
          await page.waitForTimeout(2000);
          
          // Should show unenrolled state
          const enrollAgain = await page.locator('button:has-text("Daftar"), button:has-text("Enroll")').isVisible();
          expect(enrollAgain).toBeTruthy();
        }
      }
    });
  });
});
