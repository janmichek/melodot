# E2E Testing Guide

## Overview

This directory contains end-to-end tests for BeatChain using Playwright. The tests are organized to cover wallet connection, audio recording, donations, and complete user flows.

## Test Structure

```
tests/
├── fixtures/
│   └── pages.ts              # Test fixtures including connectedWalletPage
├── helpers/
│   ├── mockWeb3Auth.ts       # Mock Web3Auth for testing
│   ├── web3AuthInterceptor.ts # Mock wallet provider
│   └── test-helpers.ts       # Utility functions
├── page-objects/
│   ├── BasePage.ts           # Base page object
│   ├── WalletPage.ts         # Wallet connection actions
│   ├── AudioRecorderPage.ts  # Audio recording actions
│   └── DonationPage.ts       # Donation form actions
├── 01-wallet-connection.spec.ts
├── 02-audio-recording.spec.ts
├── 03-donation.spec.ts
├── 04-integration-flow.spec.ts
└── 05-wallet-connected.spec.ts
```

## Running Tests

```bash
# Run all e2e tests
bun run test:e2e

# Run specific test file
bunx playwright test tests/01-wallet-connection.spec.ts

# Run in UI mode (interactive)
bunx playwright test --ui

# Run in headed mode (see browser)
bunx playwright test --headed

# Debug mode
bunx playwright test --debug
```

## Testing with Mock Wallet

### Current Limitation

BeatChain uses Web3Auth Modal with React hooks which is tightly integrated with the Web3Auth SDK. Fully mocking this in e2e tests is complex because:

1. Web3Auth requires initialization and authentication flow
2. It manages wallet state through its own provider
3. The app uses wagmi hooks that depend on Web3Auth's provider

### Available Approaches

#### Approach 1: Test Without Wallet Connection (Current)

Most tests don't require actual wallet connection. They test:
- UI rendering
- Navigation
- Forms display
- Button clicks
- Non-wallet features

Tests skip wallet-dependent assertions:

```typescript
test('should require wallet connection for donation', async ({ donationPage, walletPage }) => {
  const isConnected = await walletPage.isWalletConnected();

  if (!isConnected) {
    // Test that the flow requires connection
    await donationPage.selectDonationAmount(0);
    await expect(walletPage.connectButton).toBeVisible({ timeout: 5000 });
  }
});
```

#### Approach 2: Manual Testing with Real Wallet

For wallet-dependent features, use manual testing:

1. Run the dev server: `bun dev`
2. Connect with Web3Auth using a test account
3. Manually test donation flows, withdrawals, etc.

#### Approach 3: Use Test Environment Variables (Future)

Set up a dedicated test wallet:

```bash
# .env.test
VITE_TEST_MODE=true
VITE_TEST_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
VITE_TEST_WALLET_PRIVATE_KEY=0x...
```

Then modify the app to use a mock provider in test mode.

#### Approach 4: Integration with Real Testnet

Run tests against deployed contracts on Paseo testnet:

```typescript
test('should complete donation on testnet', async ({ page }) => {
  // Use real Web3Auth login
  // Connect to Paseo testnet
  // Execute real transactions
  // Verify on-chain state
});
```

This requires:
- Test Web3Auth credentials
- Test wallet with PAS tokens
- Longer test execution time

## What Gets Tested

### Currently Tested (Automated)
- ✅ UI rendering and visibility
- ✅ Navigation and routing
- ✅ Form display and interaction
- ✅ Audio recording start/stop
- ✅ Web3Auth modal appearance
- ✅ Component state transitions
- ✅ Error handling display

### Requires Manual Testing
- ⏸️ Actual wallet connection via Web3Auth
- ⏸️ Real donations and transactions
- ⏸️ Contract interactions
- ⏸️ Balance updates
- ⏸️ Artist claims and withdrawals

## Test Organization

### 01-wallet-connection.spec.ts
Tests basic wallet connection flow without actual Web3Auth:
- Sign In button visibility
- Web3Auth modal trigger
- Skips tests requiring actual connection

### 02-audio-recording.spec.ts
Tests audio recording functionality:
- Recorder component display
- Recording start/stop
- Error handling

### 03-donation.spec.ts
Tests donation form:
- Form visibility states
- Amount button selection
- Requires wallet connection

### 04-integration-flow.spec.ts
End-to-end integration tests:
- Complete user flows
- State persistence
- Multiple recordings


## Writing New Tests

### Pattern 1: Simple Test (No Wallet)

```typescript
import {expect, test} from './fixtures/pages';

test.describe('My Feature', () => {
  test('should display correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.my-element')).toBeVisible();
  });
});
```

### Pattern 2: Test with Conditional Wallet State

```typescript
import {expect, test} from './fixtures/pages';

test.describe('Wallet-Dependent Feature', () => {
  test('should prompt connection when needed', async ({ donationPage, walletPage }) => {
    const isConnected = await walletPage.isWalletConnected();

    if (!isConnected) {
      // Test the connection requirement
      await donationPage.selectDonationAmount(0);
      await expect(walletPage.connectButton).toBeVisible();
    } else {
      // If somehow connected, test the full flow
      await donationPage.selectDonationAmount(0);
      // ... test donation flow
    }
  });
});
```

### Pattern 3: Skip Tests Requiring Wallet

```typescript
import {expect, test} from './fixtures/pages';

test('should complete donation', async ({ walletPage, donationPage }) => {
  test.skip(!await walletPage.isWalletConnected(), 'Requires wallet connection');

  // This test only runs if wallet is connected
  await donationPage.selectDonationAmount(0);
  // ... test the flow
});
```

## Skipping Tests

Tests that require actual wallet connection are skipped:

```typescript
test('should show feature when connected', async ({ walletPage }) => {
  test.skip(!await walletPage.isWalletConnected(), 'Wallet not connected');

  // Test only runs if wallet is actually connected
});
```

## Best Practices

1. **Use Fixtures**: Prefer `connectedWalletPage` over manual setup
2. **Keep Tests Simple**: Each test should verify one thing
3. **Use Page Objects**: Encapsulate page interactions in page objects
4. **Avoid Hard Timeouts**: Use `waitForSelector` instead of `waitForTimeout`
5. **Clean Up**: Always clean up after tests (stop recording, etc.)
6. **Test Isolation**: Each test should be independent

## Debugging

```bash
# Run with Playwright Inspector
bunx playwright test --debug

# Show test report
bunx playwright show-report

# Run specific test with headed browser
bunx playwright test tests/05-wallet-connected.spec.ts --headed

# Run with console output visible
bunx playwright test --headed --workers=1
```

## Common Issues

### Issue: Tests fail with "Wallet not connected"
**Solution**: Tests skip wallet-dependent features by default. This is expected behavior.

### Issue: Web3Auth modal doesn't appear
**Solution**: Check that the app is running and Web3Auth client ID is configured

### Issue: Tests are slow
**Solution**: Run with `--workers=1` for sequential execution, or increase workers for parallel runs

### Issue: Microphone permission errors
**Solution**: Tests automatically grant microphone permissions. Check browser settings if issues persist.

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits

To run tests in CI mode:
```bash
bunx playwright test --reporter=github
```

## Further Reading

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Web3 Testing Guide](https://ethereum.org/en/developers/docs/testing/)
