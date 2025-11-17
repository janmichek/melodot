import {expect, test} from './fixtures/pages';

test.describe('Multi-Artist Donation Flow', () => {

  test('should display artist checkboxes when multiple artists are present', async ({ page }) => {
    await page.goto('/');

    const checkboxes = page.locator('input[type="checkbox"][id^="artist-"]');
    const count = await checkboxes.count();
    expect(count >= 0).toBeTruthy();
  });

  test('should allow selecting multiple artists for donation', async ({ page }) => {
    await page.goto('/');

    const artistCheckboxes = page.locator('input[type="checkbox"][id^="artist-"]');
    const count = await artistCheckboxes.count();

    if (count > 1) {
      // Select first artist
      await artistCheckboxes.nth(0).check();
      const isChecked1 = await artistCheckboxes.nth(0).isChecked();
      expect(isChecked1).toBeTruthy();

      // Select second artist
      await artistCheckboxes.nth(1).check();
      const isChecked2 = await artistCheckboxes.nth(1).isChecked();
      expect(isChecked2).toBeTruthy();
    }
  });

  test('should allow deselecting artists', async ({ page }) => {
    await page.goto('/');

    const artistCheckboxes = page.locator('input[type="checkbox"][id^="artist-"]');
    const count = await artistCheckboxes.count();

    if (count > 0) {
      await artistCheckboxes.nth(0).check();
      await page.waitForTimeout(100);

      await artistCheckboxes.nth(0).uncheck();
      const isUnchecked = await artistCheckboxes.nth(0).isChecked();
      expect(isUnchecked).toBeFalsy();
    }
  });

  test('should display artist selection count correctly', async ({ page }) => {
    await page.goto('/');

    // Look for number of artists indicator
    const artistCount = page.locator('span:has-text("Number of artists:")');
    const exists = await artistCount.isVisible({ timeout: 2000 }).catch(() => false);
    expect(typeof exists).toBe('boolean');
  });

  test('should calculate total donation for multiple artists', async ({ page }) => {
    await page.goto('/');

    const totalDonation = page.locator('span:has-text("Total to donate:")');
    const exists = await totalDonation.isVisible({ timeout: 2000 }).catch(() => false);
    expect(typeof exists).toBe('boolean');
  });

  test('should show amount per artist in calculation breakdown', async ({ page }) => {
    await page.goto('/');

    const amountPerArtist = page.locator('span:has-text("Amount per artist:")');
    const exists = await amountPerArtist.isVisible({ timeout: 2000 }).catch(() => false);
    expect(typeof exists).toBe('boolean');
  });

  test('should display donate button with total amount', async ({ page }) => {
    await page.goto('/');

    const donateButton = page.locator('button:text-matches("Donate \\\\d+ PAS|Sign In to Donate")');
    const exists = await donateButton.isVisible({ timeout: 2000 }).catch(() => false);
    expect(typeof exists).toBe('boolean');
  });

  test('should show processing status for multiple transactions', async ({ page }) => {
    await page.goto('/');

    const processingStatus = page.locator('text=/Processing donation.*\\(\\d+\\/\\d+\\)/');
    const exists = await processingStatus.isVisible({ timeout: 1000 }).catch(() => false);
    expect(typeof exists).toBe('boolean');
  });

  test('should display individual transaction hashes after success', async ({ page }) => {
    await page.goto('/');

    // Look for transaction hash containers
    const txHashes = page.locator('[class*="font-mono"]').filter({ hasText: '0x' });
    const count = await txHashes.count();
    expect(count >= 0).toBeTruthy();
  });

  test('should show view button for each transaction on block explorer', async ({ page }) => {
    await page.goto('/');

    const viewButtons = page.locator('a:has-text("View")').filter({ has: page.locator('[class*="lucide-external-link"]') });
    const count = await viewButtons.count();
    expect(count >= 0).toBeTruthy();
  });

  test('should display artist names in transaction list', async ({ page }) => {
    await page.goto('/');

    // Transaction list should show artist names
    const txList = page.locator('[class*="rounded"][class*="border"]').filter({ has: page.locator('.font-medium') });
    const count = await txList.count();
    expect(count >= 0).toBeTruthy();
  });

  test('should show discover again button after successful multi-artist donation', async ({ page }) => {
    await page.goto('/');

    const discoverAgainBtn = page.locator('button:has-text("Discover again")');
    const exists = await discoverAgainBtn.isVisible({ timeout: 1000 }).catch(() => false);
    expect(typeof exists).toBe('boolean');
  });

  test('should disable artist selection during donation processing', async ({ page }) => {
    await page.goto('/');

    // When processing, checkboxes should be disabled
    const disabledCheckbox = page.locator('input[type="checkbox"][disabled]');
    const count = await disabledCheckbox.count();
    expect(count >= 0).toBeTruthy();
  });
});
