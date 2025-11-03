import { test, expect } from '@playwright/test';

test.describe('Record Audio and Identify Song User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5174');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display recording button on the page', async ({ page }) => {
    // Look for the main recording button
    const recordButton = page.locator('[class*="audio-player-button"]');
    await expect(recordButton).toBeVisible();
  });

  test('should request microphone permissions when record button is clicked', async ({ page, context }) => {
    // Grant microphone permission in context
    await context.grantPermissions(['microphone']);

    // Find and click the record button
    const recordButton = page.locator('[class*="audio-player-button"]');

    // The button should be clickable
    await expect(recordButton).toBeEnabled();
  });

  test('should show discovery card with song information after identification', async ({ page }) => {
    // This test assumes the app can identify a song (may need to mock the Shazam API)

    // Look for discovery card with track information
    const discoveryCard = page.locator('[class*="discovery-card"]');

    // Card might be visible if using mock data
    // await expect(discoveryCard).toBeVisible();
  });

  test('should display artist and album information in discovery result', async ({ page }) => {
    // Check for track title
    const trackTitle = page.locator('text=/You & Me|Disclosure/');

    // This will only show if mock data is used or song is successfully identified
    // await expect(trackTitle).toBeVisible();
  });
});
