import { Page, expect } from '@playwright/test';

/**
 * Waits for an element to be visible with a custom timeout
 */
export async function waitForVisible(page: Page, selector: string, timeout: number = 10000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Waits for an element to be hidden
 */
export async function waitForHidden(page: Page, selector: string, timeout: number = 10000) {
  await page.waitForSelector(selector, { state: 'hidden', timeout });
}

/**
 * Checks if element exists in the DOM (visible or not)
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return (await page.locator(selector).count()) > 0;
}

/**
 * Waits for network to be idle
 */
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Retries an action until it succeeds or times out
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Action failed after retries');
}

/**
 * Validates wallet address format
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{3}$/.test(address);
}

/**
 * Validates transaction hash format
 */
export function isValidTxHash(hash: string): boolean {
  return /0x[a-fA-F0-9]{64}/.test(hash);
}

/**
 * Takes a screenshot with a custom name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Waits for console message matching pattern
 */
export async function waitForConsoleMessage(
  page: Page,
  pattern: string | RegExp,
  timeout: number = 5000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      page.off('console', handler);
      reject(new Error(`Console message matching ${pattern} not found within ${timeout}ms`));
    }, timeout);

    const handler = (msg: any) => {
      const text = msg.text();
      const matches = typeof pattern === 'string'
        ? text.includes(pattern)
        : pattern.test(text);

      if (matches) {
        clearTimeout(timer);
        page.off('console', handler);
        resolve(text);
      }
    };

    page.on('console', handler);
  });
}

/**
 * Polls for a condition to be true
 */
export async function pollUntil(
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  interval: number = 500
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}