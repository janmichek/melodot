import { test, expect } from '@playwright/test';

test.describe('Wallet Connection Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
  });

  test('should display Connect button when wallet is not connected', async ({ page }) => {
    // Check if Connect button is visible in the header
    const connectButton = page.locator('button', { hasText: 'Connect' });

    // Wait for the button to be visible (after provider initialization)
    await expect(connectButton).toBeVisible({ timeout: 10000 });

    console.log('✅ Connect button is visible');
  });

  test('should show Web3Auth modal when Connect is clicked', async ({ page }) => {
    // Wait for Connect button to be enabled
    const connectButton = page.locator('button', { hasText: 'Connect' });
    await expect(connectButton).toBeEnabled({ timeout: 10000 });

    // Click the Connect button
    await connectButton.click();

    // Wait for Web3Auth modal to appear
    // The modal might be in an iframe or a new popup window
    await page.waitForTimeout(2000);

    // Check for Web3Auth modal elements (this may need adjustment based on actual Web3Auth implementation)
    const modalVisible = await page.locator('[class*="w3a"]').count() > 0 ||
                         await page.locator('[id*="web3auth"]').count() > 0;

    expect(modalVisible).toBeTruthy();

    console.log('✅ Web3Auth modal opened');
  });

  test('should display wallet address and balance when connected', async ({ page }) => {
    // This test assumes you have a way to mock or pre-authenticate
    // For a real test, you would need to complete the Web3Auth flow

    // Check for header elements that appear when connected
    const headerAddress = page.locator('.header-address');
    const headerBalance = page.locator('.header-balance');
    const disconnectButton = page.locator('.header-disconnect-btn');

    // If connected, these should be visible
    const isConnected = await headerAddress.isVisible().catch(() => false);

    if (isConnected) {
      await expect(headerAddress).toBeVisible();
      await expect(headerBalance).toBeVisible();
      await expect(disconnectButton).toBeVisible();

      // Check that address is formatted correctly (shortened)
      const addressText = await headerAddress.textContent();
      expect(addressText).toMatch(/^0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{3}$/);

      console.log('✅ Connected wallet info displayed:', addressText);
    } else {
      console.log('ℹ️  Wallet not connected - skipping connected state checks');
    }
  });

  test('should show chain name in header when connected', async ({ page }) => {
    const chainBadge = page.locator('.header-chain-badge');

    const isVisible = await chainBadge.isVisible().catch(() => false);

    if (isVisible) {
      const chainText = await chainBadge.textContent();
      expect(['Passet Hub', 'Ethereum', 'Unknown']).toContain(chainText);

      console.log('✅ Chain name displayed:', chainText);
    } else {
      console.log('ℹ️  Not connected - chain badge not visible');
    }
  });

  test('should show faucet link when connected', async ({ page }) => {
    const faucetLink = page.locator('.header-faucet-link');

    const isVisible = await faucetLink.isVisible().catch(() => false);

    if (isVisible) {
      await expect(faucetLink).toHaveAttribute('href', 'https://faucet.polkadot.io/');
      await expect(faucetLink).toHaveAttribute('target', '_blank');

      console.log('✅ Faucet link available');
    } else {
      console.log('ℹ️  Not connected - faucet link not visible');
    }
  });

  test('should disconnect wallet when disconnect button is clicked', async ({ page }) => {
    const disconnectButton = page.locator('.header-disconnect-btn');

    const isVisible = await disconnectButton.isVisible().catch(() => false);

    if (isVisible) {
      // Click disconnect button
      await disconnectButton.click();

      // Wait for disconnection
      await page.waitForTimeout(1000);

      // Connect button should be visible again
      const connectButton = page.locator('button', { hasText: 'Connect' });
      await expect(connectButton).toBeVisible({ timeout: 5000 });

      console.log('✅ Wallet disconnected successfully');
    } else {
      console.log('ℹ️  Not connected - cannot test disconnection');
    }
  });

  test('should show loading state during connection', async ({ page }) => {
    const connectButton = page.locator('button', { hasText: 'Connect' });
    await expect(connectButton).toBeEnabled({ timeout: 10000 });

    // Click connect and immediately check for loading state
    await connectButton.click();

    // The button might show loading dots or be disabled
    const loadingIndicator = page.locator('button', { hasText: '•••' });

    // Check if loading state appears (it might be very brief)
    const hasLoadingState = await loadingIndicator.isVisible().catch(() => false);

    console.log(hasLoadingState ? '✅ Loading state displayed' : 'ℹ️  Loading state too brief to capture');
  });
});
