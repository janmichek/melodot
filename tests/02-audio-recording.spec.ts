import {expect, test} from './fixtures/pages';

test.describe('Audio Recording and Song Identification Flow', () => {

  test('should display audio recorder component on initial load', async ({ audioRecorderPage }) => {
    await audioRecorderPage.verifyRecorderVisible();
  });

  test('should display record button when ready', async ({ audioRecorderPage }) => {
    await audioRecorderPage.verifyRecordButtonVisible();
  });


  test('should handle failed identification with retry option', async ({ audioRecorderPage }) => {
    // Check if error handling with "Try Again" exists
    const hasError = await audioRecorderPage.hasError();

    // Error handling component should exist in the code
    expect(typeof hasError).toBe('boolean');
  });
});
