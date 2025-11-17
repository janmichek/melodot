import {Page} from '@playwright/test'

export async function mockWeb3AuthConnection(page: Page, address?: string) {
  const mockAddress = address || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'

  // Inject mock Web3Auth before the app loads
  await page.addInitScript(() => {
    // Mock localStorage for Web3Auth session
    localStorage.setItem('Web3Auth-cachedAdapter', 'openlogin')
    localStorage.setItem('openlogin_store', JSON.stringify({
      sessionId: 'mock-session-id',
      privKey: '0x' + '1'.repeat(64),
    }))
  })

  // Mock the Web3Auth provider
  await page.addInitScript((mockAddr) => {
    // Mocking window property for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).mockWalletAddress = mockAddr

    // Mock ethereum provider
    const mockProvider = {
      request: async ({method, _params}: {method: string, _params?: unknown}) => {
        if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return [(window as any).mockWalletAddress]
        }
        if (method === 'eth_chainId') {
          return '0x1911f0a6' // Passet Hub chain ID
        }
        if (method === 'personal_sign') {
          return '0x' + 'a'.repeat(130) // Mock signature
        }
        if (method === 'eth_sendTransaction') {
          return '0x' + 'b'.repeat(64) // Mock transaction hash
        }
        if (method === 'eth_getBalance') {
          return '0x' + (1e18).toString(16) // 1 token
        }
        return null
      },
      on: () => {},
      removeListener: () => {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedAddress: (window as any).mockWalletAddress,
      isConnected: () => true,
    }

    // Mocking window.ethereum for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).ethereum = mockProvider
  }, mockAddress)
}

export async function mockWeb3AuthLogin(page: Page) {
  // Wait for Sign In button
  await page.waitForSelector('button:has-text("Sign In")', {timeout: 10000})

  // Click Sign In
  await page.click('button:has-text("Sign In")')

  // Wait for Web3Auth modal and simulate successful login
  await page.waitForTimeout(1000)

  // Trigger the success callback by evaluating the mock
  await page.evaluate(() => {
    // Simulate Web3Auth login success
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockAddress = (window as any).mockWalletAddress
    const event = new CustomEvent('web3auth-login', {
      detail: {address: mockAddress}
    })
    window.dispatchEvent(event)
  })
}
