import {expect, test} from './fixtures/pages';
import {isValidWalletAddress} from './helpers/test-helpers';

test.describe('Wallet Connection Flow', () => {

  test('should display Sign In button when wallet is not connected', async ({ walletPage }) => {
    await expect(walletPage.connectButton).toBeVisible({ timeout: 10000 });
    await walletPage.verifyWalletDisconnected();
  });

  test('should show Web3Auth modal when Sign In is clicked', async ({ walletPage }) => {
    await walletPage.connect();

    // Check for Web3Auth modal elements
    const modalVisible = await walletPage.page.locator('[class*="w3a"], [id*="web3auth"]').count() > 0;
    expect(modalVisible).toBeTruthy();
  });

  test('should display wallet address and balance when connected', async ({ walletPage }) => {
    test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected - requires Web3Auth flow');

    await walletPage.verifyWalletConnected();

    const addressText = await walletPage.getWalletAddress();
    expect(isValidWalletAddress(addressText)).toBeTruthy();
  });

  test('should show chain name in user menu when connected', async ({ walletPage }) => {
    test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected');

    const chainText = await walletPage.getChainName();
    expect(['Passet Hub', 'Ethereum', 'Unknown']).toContain(chainText);
  });

  test('should disconnect wallet when sign out is clicked', async ({ walletPage }) => {
    test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected');

    await walletPage.disconnect();
    await walletPage.verifyWalletDisconnected();
  });
});
