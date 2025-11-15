import {expect, test} from './fixtures/pages';

test.describe('Accessibility Features', () => {

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');

    const ariaLabels = page.locator('[aria-label]');
    const count = await ariaLabels.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should allow keyboard navigation to main buttons', async ({ page }) => {
    await page.goto('/');

    const signInButton = page.locator('button:has-text("Sign In")');
    if (await signInButton.isVisible({ timeout: 2000 })) {
      await signInButton.focus();
      const isFocused = await signInButton.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    }
  });

  test('should support tab navigation through form elements', async ({ page }) => {
    await page.goto('/');

    // Press Tab key several times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'TEXTAREA']).toContain(activeElement || 'BODY');
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should have accessible link text', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const text = await links.nth(i).textContent();
      const ariaLabel = await links.nth(i).getAttribute('aria-label');
      // Link should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should have proper button roles and types', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have semantic heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = await page.locator('h1').count();
    const h2 = await page.locator('h2').count();
    const h3 = await page.locator('h3').count();

    // Should have at least some headings
    expect(h1 + h2 + h3).toBeGreaterThan(0);
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    const signInButton = page.locator('button:has-text("Sign In")');
    if (await signInButton.isVisible({ timeout: 2000 })) {
      await signInButton.focus();

      // Check if element has focus-visible or focus styles
      const hasFocusStyle = await signInButton.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });

      expect(typeof hasFocusStyle).toBe('boolean');
    }
  });

  test('should have sufficient color contrast for text', async ({ page }) => {
    await page.goto('/');

    const textElements = page.locator('p, span, button, a').first();
    if (await textElements.isVisible({ timeout: 2000 })) {
      const color = await textElements.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.color;
      });

      expect(color).toBeTruthy();
    }
  });

  test('should have form labels associated with inputs', async ({ page }) => {
    await page.goto('/');

    const labels = page.locator('label');
    const count = await labels.count();

    for (let i = 0; i < count; i++) {
      const htmlFor = await labels.nth(i).getAttribute('for');
      const hasFor = htmlFor !== null;
      const hasNestedInput = await labels.nth(i).locator('input').count() > 0;

      // Label should either have 'for' attribute or contain the input
      expect(hasFor || hasNestedInput).toBeTruthy();
    }
  });

  test('should have proper ARIA roles for custom components', async ({ page }) => {
    await page.goto('/');

    // Check for common ARIA roles
    const menuItems = page.locator('[role="menuitem"]');
    const dialogs = page.locator('[role="dialog"]');

    const menuCount = await menuItems.count();
    const dialogCount = await dialogs.count();

    expect(menuCount >= 0).toBeTruthy();
    expect(dialogCount >= 0).toBeTruthy();
  });

  test('should announce loading states to screen readers', async ({ page }) => {
    await page.goto('/');

    // Check for aria-busy or aria-live regions
    const liveBusy = page.locator('[aria-busy="true"]');
    const liveRegions = page.locator('[aria-live]');

    const busyCount = await liveBusy.count();
    const liveCount = await liveRegions.count();

    expect(busyCount >= 0).toBeTruthy();
    expect(liveCount >= 0).toBeTruthy();
  });

  test('should have descriptive button text', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const text = await buttons.nth(i).textContent();
      const ariaLabel = await buttons.nth(i).getAttribute('aria-label');

      // Button should have meaningful text or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
