import {Page} from '@playwright/test';

export async function interceptWeb3Auth(page: Page) {
  // Intercept Web3Auth SDK requests
  await page.route('**/api.web3auth.io/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'mock-session-id',
          success: true,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Intercept authentication endpoints
  await page.route('**/auth/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-token',
        success: true,
      }),
    });
  });
}

export async function setupMockWallet(page: Page, address: string = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb') {
  // Set up wallet before navigation
  await page.addInitScript((mockAddress) => {
    // Mock EIP-1193 provider
    const mockProvider = {
      isMetaMask: false,
      isWeb3Auth: true,
      request: async ({ method, params }: any) => {
        console.log('[Mock Provider]', method, params);

        switch (method) {
          case 'eth_requestAccounts':
          case 'eth_accounts':
            return [mockAddress];

          case 'eth_chainId':
            return '0x1911f0a6'; // 420420422 in hex (Passet Hub)

          case 'eth_getBalance':
            return '0xde0b6b3a7640000'; // 1 ETH in wei

          case 'personal_sign':
            return '0x' + 'a'.repeat(130);

          case 'eth_sendTransaction':
            // Return a mock transaction hash
            return '0x' + 'b'.repeat(64);

          case 'eth_getTransactionReceipt':
            return {
              status: '0x1',
              transactionHash: params[0],
              blockNumber: '0x1',
            };

          case 'eth_estimateGas':
            return '0x5208'; // 21000 gas

          case 'eth_gasPrice':
            return '0x3b9aca00'; // 1 gwei

          default:
            return null;
        }
      },
      on: (event: string, handler: Function) => {
        console.log('[Mock Provider] on', event);
      },
      removeListener: (event: string, handler: Function) => {
        console.log('[Mock Provider] removeListener', event);
      },
      selectedAddress: mockAddress,
      chainId: '0x1911f0a6',
      networkVersion: '420420422',
      isConnected: () => true,
    };

    // @ts-ignore
    window.ethereum = mockProvider;

    // Store in localStorage to simulate connected state
    localStorage.setItem('wagmi.connected', 'true');
    localStorage.setItem('wagmi.wallet', 'web3auth');
    localStorage.setItem('wagmi.recentConnectorId', 'web3auth');
  }, address);
}
