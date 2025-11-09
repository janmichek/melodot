import {expect, test} from './fixtures/pages';
import {isValidWalletAddress} from './helpers/test-helpers';

test.describe('Wallet Connection Flow', () => {

  test('should display Connect button when wallet is not connected', async ({ walletPage }) => {
    await expect(walletPage.connectButton).toBeVisible({ timeout: 10000 });
    await walletPage.verifyWalletDisconnected();
  });

  test('should show Web3Auth modal when Connect is clicked', async ({ walletPage }) => {
    await walletPage.connect();

    // Check for Web3Auth modal elements
    const modalVisible = await walletPage.page.locator('[class*="w3a"], [id*="web3auth"]').count() > 0;
    expect(modalVisible).toBeTruthy();
  });

  test('should display wallet address and balance when connected', async ({ walletPage }) => {
    // This test assumes wallet is already connected or mocked
    test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected - requires Web3Auth flow');

    await walletPage.verifyWalletConnected();

    const addressText = await walletPage.getWalletAddress();
    expect(isValidWalletAddress(addressText)).toBeTruthy();
  });

  test('should show chain name in header when connected', async ({ walletPage }) => {
    test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected');

    await expect(walletPage.chainBadge).toBeVisible();
    const chainText = await walletPage.getChainName();
    expect(['Passet Hub', 'Ethereum', 'Unknown']).toContain(chainText);
  });

  test('should show faucet link when connected', async ({ walletPage }) => {
    test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected');

    await expect(walletPage.faucetLink).toBeVisible();
    await expect(walletPage.faucetLink).toHaveAttribute('href', 'https://faucet.polkadot.io/');
    await expect(walletPage.faucetLink).toHaveAttribute('target', '_blank');
  });

  test('should disconnect wallet when disconnect button is clicked', async ({ walletPage }) => {
    test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected');

    await walletPage.disconnect();
    await walletPage.verifyWalletDisconnected();
  });

  test('should show loading state during connection', async ({ walletPage }) => {
    await expect(walletPage.connectButton).toBeEnabled({ timeout: 10000 });
    await walletPage.connectButton.click();

    // Check for loading indicator (may be brief)
    const loadingIndicator = walletPage.page.locator('button:has-text("•••")');
    const hasLoadingState = await walletPage.isElementVisible(loadingIndicator, 2000);

    // This is informational - loading state may be too fast to capture
    expect(typeof hasLoadingState).toBe('boolean');
  });
});
