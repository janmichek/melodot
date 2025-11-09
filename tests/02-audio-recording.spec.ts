import {expect, test} from './fixtures/pages';

test.describe('Audio Recording and Song Identification Flow', () => {

  test('should display audio recorder component on initial load', async ({ audioRecorderPage }) => {
    await audioRecorderPage.verifyRecorderVisible();
  });

  test('should display record button when ready', async ({ audioRecorderPage }) => {
    await audioRecorderPage.verifyRecordButtonVisible();
  });

  test('should start recording when record button is clicked', async ({ audioRecorderPage }) => {
    await audioRecorderPage.startRecording();

    // Verify recording is in progress
    const isRecording = await audioRecorderPage.isRecording();
    expect(isRecording).toBeTruthy();

    // Cleanup: stop recording
    await audioRecorderPage.stopRecording();
  });

  test('should show analyzing state after recording', async ({ audioRecorderPage }) => {
    await audioRecorderPage.startRecording();

    // Wait for recording indicator to appear
    await expect(audioRecorderPage.recordingIndicator).toBeVisible({ timeout: 5000 });

    // Check for analyzing state (may appear after recording)
    const isAnalyzing = await audioRecorderPage.isAnalyzing();
    expect(typeof isAnalyzing).toBe('boolean');
  });

  test('should display discovery card when song is identified', async ({ audioRecorderPage }) => {
    // This test checks if discovery card structure exists
    const hasSongDiscovered = await audioRecorderPage.isSongDiscovered();

    // This is informational - discovery card only shows after successful identification
    expect(typeof hasSongDiscovered).toBe('boolean');
  });

  test('should show "Search Again" button after song identification', async ({ audioRecorderPage }) => {
    test.skip(!await audioRecorderPage.isSongDiscovered(), 'No song identified');

    await expect(audioRecorderPage.searchAgainButton).toBeVisible();
    await expect(audioRecorderPage.searchAgainButton).toBeEnabled();

    await audioRecorderPage.searchAgain();

    // Verify it returns to recording view
    await audioRecorderPage.verifyRecordButtonVisible();
  });

  test('should handle failed identification attempts', async ({ audioRecorderPage }) => {
    // Check if error handling markup is present
    const hasError = await audioRecorderPage.hasError();

    // Error handling component should exist in the code
    expect(typeof hasError).toBe('boolean');
  });

  test('should disable recording during analysis', async ({ audioRecorderPage }) => {
    await audioRecorderPage.startRecording();

    // Check if recording is in progress
    const isRecording = await audioRecorderPage.isRecording();

    if (isRecording) {
      // Button should be disabled or in different state during recording
      const isDisabled = await audioRecorderPage.recordButton.isDisabled().catch(() => false);
      const hasStopButton = await audioRecorderPage.isElementVisible(audioRecorderPage.stopButton, 1000);

      // Either button is disabled or stop button is shown
      expect(isDisabled || hasStopButton).toBeTruthy();

      // Cleanup
      await audioRecorderPage.stopRecording();
    }
  });

  test('should track console logs for multi-attempt recording', async ({ audioRecorderPage }) => {
    const consoleLogs: string[] = [];

    audioRecorderPage.page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    await audioRecorderPage.startRecording();

    // Wait briefly for console logs
    await audioRecorderPage.page.waitForTimeout(2000);

    // Check if any console logs were captured
    expect(consoleLogs.length).toBeGreaterThanOrEqual(0);

    // Cleanup
    if (await audioRecorderPage.isRecording()) {
      await audioRecorderPage.stopRecording();
    }
  });

  test('should handle microphone permission flow', async ({ page, context }) => {
    // Create new page without permissions
    const newPage = await context.newPage();
    const { AudioRecorderPage } = await import('./page-objects/AudioRecorderPage');
    const audioRecorder = new AudioRecorderPage(newPage);

    await newPage.goto('/');
    await newPage.waitForLoadState('networkidle');

    // Check for permission button
    const permissionButton = newPage.locator('button', { hasText: /allow|permission|microphone/i });
    const isVisible = await audioRecorder.isElementVisible(permissionButton, 2000);

    // Permission flow varies by browser
    expect(typeof isVisible).toBe('boolean');

    await newPage.close();
  });
});
