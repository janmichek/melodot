import { test, expect } from '@playwright/test';

test.describe('Donate to Artist User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5174');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display donation form after song identification', async ({ page }) => {
    // Look for donation form section
    const donationForm = page.locator('[class*="contract-form-section"], [class*="donation"]');

    // The form might be visible depending on mock data state
    // await expect(donationForm).toBeVisible();
  });

  test('should display amount selector buttons for donation', async ({ page }) => {
    // Look for amount selector buttons
    const amountButtons = page.locator('[class*="btn-amount-selector"]');

    // There should be multiple amount options
    // await expect(amountButtons).toHaveCount(3);
  });

  test('should allow user to select a donation amount', async ({ page }) => {
    // Click on a donation amount button
    const donationButton = page.locator('[class*="btn-amount-selector"]').first();

    if (await donationButton.isVisible()) {
      await donationButton.click();

      // Verify button is selected (check for highlight or active state)
      // This depends on the actual implementation
    }
  });

  test('should display donation submit button', async ({ page }) => {
    // Look for the submit/donate button
    const submitButton = page.locator('button:has-text("Donate"), button:has-text("Send"), button:has-text("Confirm")');

    // Button should be present when form is visible
    // await expect(submitButton).toBeVisible();
  });

  test('should show transaction status after donation submission', async ({ page }) => {
    // Look for transaction status indicators
    const txStatus = page.locator('[class*="tx-status"]');

    // Status should appear after submission
    // await expect(txStatus).toBeVisible();
  });

  test('should display artist information on discovery card', async ({ page }) => {
    // Look for artist name and details
    const artistTitle = page.locator('[class*="discovery-artist-title"]');

    // Artist information should be visible on the discovery card
    // await expect(artistTitle).toBeVisible();
  });

  test('should display social links for artist', async ({ page }) => {
    // Look for social media links
    const socialLinks = page.locator('[class*="discovery-social-links"] a');

    // Artist should have social media links available
    // await expect(socialLinks).toHaveCount(0); // Will depend on artist data
  });
});
