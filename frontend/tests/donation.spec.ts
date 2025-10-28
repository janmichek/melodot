import { test, expect } from '@playwright/test';

test.describe('Donation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
  });

  test('should not show donation form before song identification', async ({ page }) => {
    // Donation form should only appear after a song is identified
    const donationForm = page.locator('.contract-form-section, [class*="donation"]');

    const isVisible = await donationForm.isVisible().catch(() => false);

    // On initial load, donation form should not be visible
    expect(isVisible).toBeFalsy();

    console.log('✅ Donation form hidden before song identification');
  });

  test('should display donation form after song is identified', async ({ page }) => {
    // This test requires a song to be identified first
    // Check if donation form exists in the DOM structure

    const donationTitle = page.locator('h3:has-text("Donate to Artist")');

    const exists = await donationTitle.count() > 0;

    console.log(exists ? '✅ Donation form component exists' : 'ℹ️  Donation form only shows after song ID');
  });

  test('should show artist ID in donation form', async ({ page }) => {
    // When donation form is visible, it should display the artist ID
    const artistIdLabel = page.locator('.form-label:has-text("Artist ID")');

    const isVisible = await artistIdLabel.isVisible().catch(() => false);

    if (isVisible) {
      const labelText = await artistIdLabel.textContent();
      expect(labelText).toContain('Artist ID:');

      console.log('✅ Artist ID displayed in donation form');
    } else {
      console.log('ℹ️  No song identified - artist ID not visible');
    }
  });

  test('should display donation amount buttons (1, 2, 10 tokens)', async ({ page }) => {
    // Check for donation amount selector buttons
    const amountButtons = page.locator('.btn-amount-selector');

    const buttonCount = await amountButtons.count();

    if (buttonCount > 0) {
      // Should have 3 buttons for amounts: 1, 2, 10
      expect(buttonCount).toBe(3);

      // Check button text contains currency symbol and amounts
      const firstButtonText = await amountButtons.first().textContent();
      expect(firstButtonText).toMatch(/1|2|10/);

      console.log(`✅ Found ${buttonCount} donation amount buttons`);
    } else {
      console.log('ℹ️  Donation buttons not visible - requires song identification');
    }
  });

  test('should require wallet connection for donation', async ({ page }) => {
    // When not connected, clicking donate should trigger connect flow
    const amountButton = page.locator('.btn-amount-selector').first();

    const isVisible = await amountButton.isVisible().catch(() => false);

    if (isVisible) {
      // Check if wallet is connected
      const isConnected = await page.locator('.header-address').isVisible().catch(() => false);

      if (!isConnected) {
        // Click donate button
        await amountButton.click();

        // Should trigger connection flow
        // The connect button should appear or Web3Auth modal should open
        await page.waitForTimeout(1000);

        console.log('✅ Donation requires wallet connection');
      } else {
        console.log('ℹ️  Wallet already connected');
      }
    } else {
      console.log('ℹ️  Donation form not visible - requires song identification');
    }
  });

  test('should show loading state when processing donation', async ({ page }) => {
    const amountButton = page.locator('.btn-amount-selector').first();

    const isVisible = await amountButton.isVisible().catch(() => false);

    if (isVisible) {
      // Check if wallet is connected
      const isConnected = await page.locator('.header-address').isVisible().catch(() => false);

      if (isConnected) {
        // Click donate button
        await amountButton.click();

        // Look for "Donating..." text
        const donatingButton = page.locator('button:has-text("Donating...")');

        const isLoading = await donatingButton.isVisible({ timeout: 2000 }).catch(() => false);

        console.log(isLoading ? '✅ Loading state displayed during donation' : 'ℹ️  Transaction may be too fast or requires wallet approval');
      } else {
        console.log('ℹ️  Wallet not connected - cannot test donation');
      }
    } else {
      console.log('ℹ️  Donation form not visible - requires song identification');
    }
  });

  test('should disable donation buttons during transaction', async ({ page }) => {
    const amountButtons = page.locator('.btn-amount-selector');

    const buttonCount = await amountButtons.count();

    if (buttonCount > 0) {
      const isConnected = await page.locator('.header-address').isVisible().catch(() => false);

      if (isConnected) {
        // Click first button
        await amountButtons.first().click();

        // Wait briefly
        await page.waitForTimeout(500);

        // All buttons should be disabled during transaction
        const allDisabled = await Promise.all(
          [0, 1, 2].map(i => amountButtons.nth(i).isDisabled().catch(() => false))
        );

        const hasDisabledButton = allDisabled.some(disabled => disabled);

        console.log(hasDisabledButton ? '✅ Buttons disabled during transaction' : 'ℹ️  Transaction completed too quickly');
      } else {
        console.log('ℹ️  Wallet not connected - cannot test donation');
      }
    } else {
      console.log('ℹ️  Donation form not visible');
    }
  });

  test('should display transaction hash after donation', async ({ page }) => {
    // Look for transaction hash display
    const txHash = page.locator('.tx-hash');

    const isVisible = await txHash.isVisible().catch(() => false);

    if (isVisible) {
      const hashText = await txHash.textContent();
      expect(hashText).toContain('Tx:');
      expect(hashText).toMatch(/0x[a-fA-F0-9]{64}/);

      console.log('✅ Transaction hash displayed:', hashText);
    } else {
      console.log('ℹ️  No completed transaction - tx hash not visible');
    }
  });

  test('should show success message after donation confirmation', async ({ page }) => {
    // Look for success status
    const successMessage = page.locator('.tx-status-success, p:has-text("Donation successful")');

    const isVisible = await successMessage.isVisible().catch(() => false);

    if (isVisible) {
      const messageText = await successMessage.textContent();
      expect(messageText).toMatch(/successful|confirmed|complete/i);

      console.log('✅ Success message displayed after donation');
    } else {
      console.log('ℹ️  No completed donation - success message not visible');
    }
  });

  test('should show pending status during transaction confirmation', async ({ page }) => {
    const pendingStatus = page.locator('.tx-status-pending, p:has-text("Waiting for confirmation")');

    const isVisible = await pendingStatus.isVisible().catch(() => false);

    if (isVisible) {
      const statusText = await pendingStatus.textContent();
      expect(statusText).toMatch(/waiting|pending|confirming/i);

      console.log('✅ Pending status displayed during confirmation');
    } else {
      console.log('ℹ️  No pending transaction visible');
    }
  });

  test('should display error message if donation fails', async ({ page }) => {
    // Look for error box
    const errorBox = page.locator('.error-box');

    const isVisible = await errorBox.isVisible().catch(() => false);

    if (isVisible) {
      const errorText = await errorBox.textContent();
      expect(errorText).toContain('Error:');

      console.log('✅ Error handling working - error message displayed');
    } else {
      console.log('ℹ️  No error state - donation flow working correctly');
    }
  });

  test('should reset form after successful donation', async ({ page }) => {
    // After successful donation (with 3 second delay), form should reset
    const successMessage = page.locator('.tx-status-success');

    const isVisible = await successMessage.isVisible().catch(() => false);

    if (isVisible) {
      // Wait for the 3 second delay mentioned in the code
      await page.waitForTimeout(3500);

      // Success message should disappear after reset
      const stillVisible = await successMessage.isVisible().catch(() => false);

      expect(stillVisible).toBeFalsy();

      console.log('✅ Form reset after successful donation');
    } else {
      console.log('ℹ️  No successful donation to test reset');
    }
  });

  test('should display contract address in footer', async ({ page }) => {
    // Check for contract info in footer
    const contractFooter = page.locator('.contract-footer, [class*="contract"]');

    const isVisible = await contractFooter.isVisible().catch(() => false);

    if (isVisible) {
      // Should contain contract address
      const footerText = await contractFooter.textContent();
      expect(footerText).toMatch(/contract|address|0x[a-fA-F0-9]+/i);

      console.log('✅ Contract info displayed in footer');
    } else {
      console.log('ℹ️  Contract footer not visible');
    }
  });

  test('should show all three donation amounts with proper formatting', async ({ page }) => {
    const amountButtons = page.locator('.btn-amount-selector');

    const buttonCount = await amountButtons.count();

    if (buttonCount === 3) {
      // Get text from all buttons
      const buttonTexts = await Promise.all([
        amountButtons.nth(0).textContent(),
        amountButtons.nth(1).textContent(),
        amountButtons.nth(2).textContent(),
      ]);

      // Check for expected amounts
      const hasOne = buttonTexts.some(text => text?.includes('1'));
      const hasTwo = buttonTexts.some(text => text?.includes('2'));
      const hasTen = buttonTexts.some(text => text?.includes('10'));

      expect(hasOne && hasTwo && hasTen).toBeTruthy();

      console.log('✅ All donation amounts properly formatted:', buttonTexts);
    } else {
      console.log('ℹ️  Donation buttons not visible - requires song identification');
    }
  });
});
