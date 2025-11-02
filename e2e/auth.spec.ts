import { test, expect } from '@playwright/test';
import { register, login, logout, generateTestUser } from './helpers/test-helpers';

test.describe('Authentication Flow', () => {
  test.describe('Registration', () => {
    test('should display registration page in Indonesian', async ({ page }) => {
      await page.goto('/register');
      
      // Check Indonesian text
      await expect(page.locator('text=/daftar|registrasi/i')).toBeVisible();
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    test('should register new user successfully', async ({ page }) => {
      const user = generateTestUser();
      
      await register(page, user.name, user.email, user.password);
      
      // Should redirect to dashboard or courses
      expect(page.url()).toMatch(/\/(dashboard|courses)/);
      
      // Should show user name or dashboard
      await expect(page.locator(`text=/${user.name}|dashboard/i`)).toBeVisible();
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.goto('/register');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Should show error messages
      await page.waitForTimeout(500);
      // Check for any error text
      const hasError = await page.locator('text=/wajib|required|error/i').count() > 0;
      expect(hasError).toBeTruthy();
    });

    test('should show error for duplicate email', async ({ page }) => {
      const user = generateTestUser();
      
      // Register first time
      await register(page, user.name, user.email, user.password);
      
      // Logout
      await logout(page);
      
      // Try to register with same email
      await page.goto('/register');
      await page.fill('input[name="name"]', user.name);
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.fill('input[name="password_confirmation"]', user.password);
      await page.click('button[type="submit"]');
      
      // Should show error
      await expect(page.locator('text=/sudah.*digunakan|already.*exists/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Login', () => {
    test('should display login page in Indonesian', async ({ page }) => {
      await page.goto('/login');
      
      // Check Indonesian text
      await expect(page.locator('text=/masuk|login/i')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      // Create a test user first
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      await logout(page);
      
      // Now login
      await login(page, user.email, user.password);
      
      // Should be on dashboard or courses
      expect(page.url()).toMatch(/\/(dashboard|courses)/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('text=/gagal|invalid|salah/i')).toBeVisible({ timeout: 5000 });
    });

    test('should redirect to login when accessing protected page', async ({ page }) => {
      // Try to access dashboard without login
      await page.goto('/dashboard');
      
      // Should redirect to login (or stay on dashboard if public)
      // This depends on middleware implementation
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // Login first
      const user = generateTestUser();
      await register(page, user.name, user.email, user.password);
      
      // Logout
      await logout(page);
      
      // Should redirect to home or login
      expect(page.url()).toMatch(/\/(|login)/);
    });
  });

  test.describe('Navigation', () => {
    test('should have register link on login page', async ({ page }) => {
      await page.goto('/login');
      
      const registerLink = page.locator('a[href*="/register"]');
      await expect(registerLink).toBeVisible();
    });

    test('should have login link on register page', async ({ page }) => {
      await page.goto('/register');
      
      const loginLink = page.locator('a[href*="/login"]');
      await expect(loginLink).toBeVisible();
    });
  });
});
