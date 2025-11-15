import {Page} from '@playwright/test';

export async function mockWeb3AuthConnection(page: Page, address?: string) {
  const mockAddress = address || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const mockPrivateKey = '0x' + '1'.repeat(64); // Mock private key

  // Inject mock Web3Auth before the app loads
  await page.addInitScript(() => {
    // Mock localStorage for Web3Auth session
    localStorage.setItem('Web3Auth-cachedAdapter', 'openlogin');
    localStorage.setItem('openlogin_store', JSON.stringify({
      sessionId: 'mock-session-id',
      privKey: '0x' + '1'.repeat(64),
    }));
  });

  // Mock the Web3Auth provider
  await page.addInitScript((mockAddr) => {
    // @ts-ignore
    window.mockWalletAddress = mockAddr;

    // Mock ethereum provider
    const mockProvider = {
      request: async ({ method, params }: any) => {
        if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
          return [window.mockWalletAddress];
        }
        if (method === 'eth_chainId') {
          return '0x1911f0a6'; // Passet Hub chain ID
        }
        if (method === 'personal_sign') {
          return '0x' + 'a'.repeat(130); // Mock signature
        }
        if (method === 'eth_sendTransaction') {
          return '0x' + 'b'.repeat(64); // Mock transaction hash
        }
        if (method === 'eth_getBalance') {
          return '0x' + (1e18).toString(16); // 1 token
        }
        return null;
      },
      on: () => {},
      removeListener: () => {},
      selectedAddress: window.mockWalletAddress,
      isConnected: () => true,
    };

    // @ts-ignore
    window.ethereum = mockProvider;
  }, mockAddress);
}

export async function mockWeb3AuthLogin(page: Page) {
  // Wait for Sign In button
  await page.waitForSelector('button:has-text("Sign In")', { timeout: 10000 });

  // Click Sign In
  await page.click('button:has-text("Sign In")');

  // Wait for Web3Auth modal and simulate successful login
  await page.waitForTimeout(1000);

  // Trigger the success callback by evaluating the mock
  await page.evaluate(() => {
    // Simulate Web3Auth login success
    const event = new CustomEvent('web3auth-login', {
      detail: { address: window.mockWalletAddress }
    });
    window.dispatchEvent(event);
  });
}
