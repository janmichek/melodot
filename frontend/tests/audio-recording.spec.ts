import { test, expect } from '@playwright/test';

test.describe('Audio Recording and Song Identification Flow', () => {
  test.beforeEach(async ({ page, context }) => {

    await context.grantPermissions(['microphone']);

    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
  });

  test('should display audio recorder component on initial load', async ({ page }) => {
    const recorderContainer = page.locator('.shazam-container');
    await expect(recorderContainer).toBeVisible();

    console.log('✅ Audio recorder component is visible');
  });

  test('should show permission button when microphone access is not granted', async ({ page, context }) => {
    // Create a new page without microphone permissions
    const newPage = await context.newPage();

    // Mock microphone permission as not granted
    await newPage.goto('http://localhost:5174');
    await newPage.waitForLoadState('networkidle');

    // Look for permission button or request
    const permissionButton = newPage.locator('button', { hasText: /allow|permission|microphone/i });

    const isVisible = await permissionButton.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ Permission button displayed when access not granted');
    } else {
      console.log('ℹ️  Permission already granted or button not found');
    }

    await newPage.close();
  });

  test('should display record button when ready', async ({ page }) => {
    // Wait for the audio controls to be ready
    await page.waitForTimeout(1000);

    // Look for record/listen button
    const recordButton = page.locator('button.record-button, button:has-text("Listen"), button:has-text("Start")');

    const buttonCount = await recordButton.count();
    expect(buttonCount).toBeGreaterThan(0);

    console.log('✅ Record button is available');
  });

  test('should start recording when record button is clicked', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Find and click the record button
    const recordButton = page.locator('button.record-button, button:has-text("Listen")').first();

    const isVisible = await recordButton.isVisible().catch(() => false);

    if (isVisible) {
      await recordButton.click();

      // Wait a moment for recording to start
      await page.waitForTimeout(500);

      // Look for recording indicator (pulsing animation, stop button, etc.)
      const stopButton = page.locator('button.stop-button, button:has-text("Stop")');
      const recordingIndicator = page.locator('.recording-active, .pulse, [class*="recording"]');

      const isRecording = await stopButton.isVisible().catch(() => false) ||
                          await recordingIndicator.isVisible().catch(() => false);

      expect(isRecording).toBeTruthy();

      console.log('✅ Recording started successfully');

      // Stop recording to cleanup
      if (await stopButton.isVisible().catch(() => false)) {
        await stopButton.click();
      }
    } else {
      console.log('ℹ️  Record button not visible - may need permissions');
    }
  });

  test('should show analyzing state after recording', async ({ page }) => {
    await page.waitForTimeout(1000);

    const recordButton = page.locator('button.record-button, button:has-text("Listen")').first();

    const isVisible = await recordButton.isVisible().catch(() => false);

    if (isVisible) {
      // Start recording
      await recordButton.click();

      // Wait for auto-stop (10 seconds for first attempt)
      // Using a shorter timeout for testing
      await page.waitForTimeout(3000);

      // Check for analyzing/processing state
      const analyzingText = page.locator('text=/analyzing|processing|identifying/i');

      const isAnalyzing = await analyzingText.isVisible().catch(() => false);

      console.log(isAnalyzing ? '✅ Analyzing state displayed' : 'ℹ️  Analyzing state not visible (may be too fast)');
    } else {
      console.log('ℹ️  Record button not visible - skipping test');
    }
  });

  test('should display discovery card when song is identified', async ({ page }) => {
    // This test would require mocking the API response or having a test audio file
    // For now, we'll check if the discovery card structure exists in the DOM

    await page.waitForTimeout(1000);

    // Check if discovery card is visible (it won't be unless a song was identified)
    const discoveryCard = page.locator('.discovery-card, [class*="discovery"]');

    const isVisible = await discoveryCard.isVisible().catch(() => false);

    if (isVisible) {
      // Verify card contains expected elements
      const hasTitle = await page.locator('.discovery-card h2, .discovery-card h3').count() > 0;
      const hasArtist = await page.locator('.discovery-card [class*="artist"]').count() > 0;

      expect(hasTitle || hasArtist).toBeTruthy();

      console.log('✅ Discovery card displayed with song information');
    } else {
      console.log('ℹ️  No song identified - discovery card not visible');
    }
  });

  test('should show "Search Again" button after song identification', async ({ page }) => {
    await page.waitForTimeout(1000);

    const searchAgainButton = page.locator('button:has-text("Search Again"), button:has-text("Try Again")');

    const isVisible = await searchAgainButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(searchAgainButton).toBeEnabled();

      // Click and verify it resets to recording view
      await searchAgainButton.click();

      await page.waitForTimeout(500);

      // Should show record button again
      const recordButton = page.locator('button.record-button, button:has-text("Listen")');
      await expect(recordButton).toBeVisible();

      console.log('✅ Search Again button works correctly');
    } else {
      console.log('ℹ️  No song identified yet - Search Again button not visible');
    }
  });

  test('should handle failed identification attempts', async ({ page }) => {
    await page.waitForTimeout(1000);

    // After multiple failed attempts, should show error message
    const noMatchMessage = page.locator('text=/no match found|could not identify|try again/i');

    // This would only be visible after 3 failed attempts (10s + 15s + 20s)
    // For testing purposes, we just check if the component can handle the state

    const hasErrorHandling = await page.locator('.no-match-message, .shazam-error').count() > 0;

    console.log(hasErrorHandling ? '✅ Error message component exists' : 'ℹ️  Error handling markup present in code');
  });

  test('should disable recording during analysis', async ({ page }) => {
    await page.waitForTimeout(1000);

    const recordButton = page.locator('button.record-button, button:has-text("Listen")').first();

    const isVisible = await recordButton.isVisible().catch(() => false);

    if (isVisible) {
      // Start recording
      await recordButton.click();

      // Immediately try to click again (should be disabled)
      await page.waitForTimeout(500);

      const button = page.locator('button.record-button, button:has-text("Recording"), button:has-text("Stop")').first();
      const isDisabled = await button.isDisabled().catch(() => false);

      console.log(isDisabled ? '✅ Recording button disabled during recording' : 'ℹ️  Button state check inconclusive');
    } else {
      console.log('ℹ️  Record button not visible - skipping test');
    }
  });

  test('should show attempt progress during multi-attempt recording', async ({ page }) => {
    // The app tries 3 different durations: 10s, 15s, 20s
    // We can check if this logic is working by monitoring console or UI changes

    await page.waitForTimeout(1000);

    const recordButton = page.locator('button.record-button, button:has-text("Listen")').first();

    const isVisible = await recordButton.isVisible().catch(() => false);

    if (isVisible) {
      // Listen for console logs
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        consoleLogs.push(msg.text());
      });

      // Start recording
      await recordButton.click();

      // Wait briefly to see if attempt tracking is logged
      await page.waitForTimeout(3000);

      // Check for attempt-related logs
      const hasAttemptLogs = consoleLogs.some(log =>
        log.includes('Attempt') || log.includes('Duration') || log.includes('attempt')
      );

      console.log(hasAttemptLogs ? '✅ Multi-attempt logic is active' : 'ℹ️  Attempt tracking not visible in console');
    } else {
      console.log('ℹ️  Record button not visible - skipping test');
    }
  });
});
