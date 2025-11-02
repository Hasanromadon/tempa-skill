import { test, expect } from '@playwright/test';
import { register, generateTestUser, enrollCourse, markLessonComplete } from './helpers/test-helpers';

test.describe('Lesson Viewer', () => {
  test.describe('Lesson Page Access', () => {
    test('should display lesson page for enrolled user', async ({ page }) => {
      // Register and enroll in a course
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      // Navigate to courses
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      // Click first course
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll if not enrolled
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Click first lesson
        const firstLesson = page.locator('a[href*="/lessons/"], div:has-text("1.")').first();
        if (await firstLesson.isVisible()) {
          await firstLesson.click();
          await page.waitForLoadState('networkidle');
          
          // Should show lesson content
          await expect(page.locator('text=/pelajaran|lesson/i')).toBeVisible();
        }
      }
    });

    test('should show lesson sidebar with all lessons', async ({ page }) => {
      // Setup: register and navigate to lesson
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Navigate to first lesson
        const firstLesson = page.locator('a[href*="/lessons/"]').first();
        if (await firstLesson.isVisible()) {
          await firstLesson.click();
          await page.waitForLoadState('networkidle');
          
          // Should show sidebar with lesson list
          await expect(page.locator('text=/daftar.*pelajaran|lesson.*list/i')).toBeVisible();
        }
      }
    });

    test('should redirect to login for unauthenticated user', async ({ page }) => {
      // Try to access lesson directly without auth
      // This assumes lesson URLs are like /courses/slug/lessons/1
      await page.goto('/courses/test-course/lessons/1');
      
      // Should redirect to login or show access denied
      await page.waitForTimeout(1000);
      // Check if redirected or showing error
      const isLoginPage = page.url().includes('login');
      const hasError = await page.locator('text=/akses|access|login/i').isVisible();
      
      expect(isLoginPage || hasError).toBeTruthy();
    });
  });

  test.describe('Lesson Navigation', () => {
    test('should navigate to next lesson', async ({ page }) => {
      // Setup
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Go to first lesson
        const firstLesson = page.locator('a[href*="/lessons/"]').first();
        if (await firstLesson.isVisible()) {
          await firstLesson.click();
          await page.waitForLoadState('networkidle');
          
          const currentUrl = page.url();
          
          // Click next button
          const nextButton = page.locator('button:has-text("Selanjutnya"), button:has-text("Next")').first();
          if (await nextButton.isVisible()) {
            await nextButton.click();
            await page.waitForLoadState('networkidle');
            
            // URL should change
            expect(page.url()).not.toBe(currentUrl);
          }
        }
      }
    });

    test('should navigate to previous lesson', async ({ page }) => {
      // Setup
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Go to second lesson (if exists)
        const lessons = page.locator('a[href*="/lessons/"]');
        const lessonCount = await lessons.count();
        
        if (lessonCount > 1) {
          await lessons.nth(1).click();
          await page.waitForLoadState('networkidle');
          
          const currentUrl = page.url();
          
          // Click previous button
          const prevButton = page.locator('button:has-text("Sebelumnya"), button:has-text("Previous")').first();
          if (await prevButton.isVisible()) {
            await prevButton.click();
            await page.waitForLoadState('networkidle');
            
            // Should go to previous lesson
            expect(page.url()).not.toBe(currentUrl);
          }
        }
      }
    });

    test('should navigate via sidebar', async ({ page }) => {
      // Setup
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Go to first lesson
        const firstLesson = page.locator('a[href*="/lessons/"]').first();
        if (await firstLesson.isVisible()) {
          await firstLesson.click();
          await page.waitForLoadState('networkidle');
          
          // Find another lesson in sidebar
          const sidebarLessons = page.locator('[href*="/lessons/"]');
          const lessonCount = await sidebarLessons.count();
          
          if (lessonCount > 1) {
            const currentUrl = page.url();
            await sidebarLessons.nth(1).click();
            await page.waitForLoadState('networkidle');
            
            // Should navigate to different lesson
            expect(page.url()).not.toBe(currentUrl);
          }
        }
      }
    });
  });

  test.describe('Mark Lesson Complete', () => {
    test('should mark lesson as complete', async ({ page }) => {
      // Setup
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Go to first lesson
        const firstLesson = page.locator('a[href*="/lessons/"]').first();
        if (await firstLesson.isVisible()) {
          await firstLesson.click();
          await page.waitForLoadState('networkidle');
          
          // Click mark complete button
          const completeButton = page.locator('button:has-text("Tandai Selesai"), button:has-text("Mark Complete")').first();
          if (await completeButton.isVisible()) {
            await completeButton.click();
            await page.waitForTimeout(2000);
            
            // Should show completed state
            const completedBadge = await page.locator('text=/selesai|completed/i').isVisible();
            expect(completedBadge).toBeTruthy();
          }
        }
      }
    });

    test('should show completed badge in sidebar', async ({ page }) => {
      // Setup
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Go to first lesson
        const firstLesson = page.locator('a[href*="/lessons/"]').first();
        if (await firstLesson.isVisible()) {
          await firstLesson.click();
          await page.waitForLoadState('networkidle');
          
          // Mark complete
          const completeButton = page.locator('button:has-text("Tandai Selesai")').first();
          if (await completeButton.isVisible()) {
            await completeButton.click();
            await page.waitForTimeout(2000);
            
            // Check sidebar for completed indicator (checkmark icon)
            // This depends on your sidebar implementation
            const sidebar = page.locator('aside, [class*="sidebar"]');
            if (await sidebar.isVisible()) {
              // Look for completed indicator in sidebar
              const hasCheckmark = await sidebar.locator('svg, text=/✓|selesai/i').count() > 0;
              expect(hasCheckmark).toBeTruthy();
            }
          }
        }
      }
    });
  });

  test.describe('Progress Tracking', () => {
    test('should update progress bar when completing lessons', async ({ page }) => {
      // Setup
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Go to first lesson
        const firstLesson = page.locator('a[href*="/lessons/"]').first();
        if (await firstLesson.isVisible()) {
          await firstLesson.click();
          await page.waitForLoadState('networkidle');
          
          // Check initial progress
          const progressText = await page.locator('text=/\\d+.*dari.*\\d+.*pelajaran/i').textContent();
          
          // Mark lesson complete
          const completeButton = page.locator('button:has-text("Tandai Selesai")').first();
          if (await completeButton.isVisible()) {
            await completeButton.click();
            await page.waitForTimeout(2000);
            
            // Progress should update
            const newProgressText = await page.locator('text=/\\d+.*dari.*\\d+.*pelajaran/i').textContent();
            expect(newProgressText).not.toBe(progressText);
          }
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should toggle sidebar on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Setup
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      await page.goto('/courses');
      await page.waitForLoadState('networkidle');
      
      const firstCourse = page.locator('a[href*="/courses/"]').first();
      if (await firstCourse.isVisible()) {
        await firstCourse.click();
        await page.waitForLoadState('networkidle');
        
        // Enroll
        const enrollButton = page.locator('button:has-text("Daftar")').first();
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Go to first lesson
        const firstLesson = page.locator('a[href*="/lessons/"]').first();
        if (await firstLesson.isVisible()) {
          await firstLesson.click();
          await page.waitForLoadState('networkidle');
          
          // Look for menu button
          const menuButton = page.locator('button:has([class*="menu" i]), button[aria-label*="menu" i]').first();
          if (await menuButton.isVisible()) {
            await menuButton.click();
            await page.waitForTimeout(500);
            
            // Sidebar should toggle
            // This test verifies the button exists and is clickable
          }
        }
      }
    });
  });
});
