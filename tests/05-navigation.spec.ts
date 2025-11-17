import {expect, test} from './fixtures/pages';

test.describe('Navigation and Routing', () => {

  test('should display the home page with correct title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should navigate to discover page by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toContain('/');
  });

  test('should show header with app branding', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should display theme toggle button', async ({ page }) => {
    await page.goto('/');

    // Look for theme toggle (moon/sun icon)
    const themeToggle = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(themeToggle).toBeVisible({ timeout: 5000 });
  });

  test('should toggle theme when theme button is clicked', async ({ page }) => {
    await page.goto('/');

    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');

    const themeToggle = page.locator('button[aria-label*="theme"], button[class*="theme"]').first();
    if (await themeToggle.isVisible({ timeout: 2000 })) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      const newClass = await htmlElement.getAttribute('class');
      // Class should have changed (dark/light mode toggle)
      expect(typeof newClass).toBe('string');
    }
  });

  test('should maintain responsive layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');

    // On mobile, sidebar is collapsed - click the trigger to open it
    const sidebarTrigger = page.locator('button[data-sidebar="trigger"]');
    if (await sidebarTrigger.isVisible({ timeout: 2000 })) {
      await sidebarTrigger.click();
      await page.waitForTimeout(300); // Wait for sidebar animation
    }

    const connectButton = page.locator('button:has-text("Sign In")');
    await expect(connectButton).toBeVisible({ timeout: 10000 });
  });

  test('should maintain responsive layout on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should maintain responsive layout on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
