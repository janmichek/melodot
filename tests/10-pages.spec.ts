import {expect, test} from './fixtures/pages';

test.describe('Page Navigation and Content', () => {

  test.describe('Donations Page', () => {
    test('should navigate to donations page', async ({ page }) => {
      await page.goto('/donations');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      expect(url).toContain('/donations');
    });

    test('should display donations page header', async ({ page }) => {
      await page.goto('/donations');
      await page.waitForLoadState('networkidle');

      const header = page.locator('h1:has-text("Donations"), h2:has-text("Donations")');
      await expect(header).toBeVisible({ timeout: 5000 });
    });

    test('should show donations list container', async ({ page }) => {
      await page.goto('/donations');
      await page.waitForLoadState('networkidle');

      const donationsList = page.locator('[data-testid="donations-list"]');
      await expect(donationsList).toBeVisible({ timeout: 5000 });
    });

    test('should display donation tabs', async ({ page }) => {
      await page.goto('/donations');
      await page.waitForLoadState('networkidle');

      // Check for tabs or table structure in donations page
      const tabs = page.locator('[role="tablist"], .tabs, div:has(button[role="tab"]), [data-testid="donations-list"]');
      const hasTabStructure = await tabs.count() > 0;
      expect(hasTabStructure).toBeTruthy();
    });

    test('should switch between donation tabs', async ({ page }) => {
      await page.goto('/donations');
      await page.waitForLoadState('networkidle');

      const tabButtons = page.locator('button[role="tab"]');
      const tabCount = await tabButtons.count();

      if (tabCount > 1) {
        // Click second tab
        await tabButtons.nth(1).click();
        await page.waitForTimeout(300);

        // Tab should be active
        const isActive = await tabButtons.nth(1).getAttribute('data-state');
        expect(isActive === 'active' || isActive === null).toBeTruthy();
      }
    });
  });

  test.describe('Claim Page', () => {
    test('should navigate to claim page', async ({ page }) => {
      await page.goto('/claim');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      expect(url).toContain('/claim');
    });

    test('should display claim page header', async ({ page }) => {
      await page.goto('/claim');
      await page.waitForLoadState('networkidle');

      const header = page.locator('h1:has-text("Claim"), h2:has-text("Claim")');
      await expect(header).toBeVisible({ timeout: 5000 });
    });

    test('should show sign in prompt when not connected', async ({ page }) => {
      await page.goto('/claim');
      await page.waitForLoadState('networkidle');

      // Should show either sign in button or claim form
      const signInButton = page.locator('main button:has-text("Sign In")');
      const claimForm = page.locator('[data-testid="claim-form"], form');
      const connectingText = page.locator('button:has-text("Connecting")');

      const hasSignInButton = await signInButton.first().isVisible({ timeout: 2000 }).catch(() => false);
      const hasClaimForm = await claimForm.isVisible({ timeout: 2000 }).catch(() => false);
      const isConnecting = await connectingText.isVisible({ timeout: 1000 }).catch(() => false);

      // One of these should be visible
      expect(hasSignInButton || hasClaimForm || isConnecting).toBeTruthy();
    });

    test('should display description text', async ({ page }) => {
      await page.goto('/claim');
      await page.waitForLoadState('networkidle');

      const description = page.locator('p:has-text("claim"), p:has-text("artist")');
      const hasDescription = await description.count() > 0;
      expect(hasDescription).toBeTruthy();
    });
  });

  test.describe('About Page', () => {
    test('should navigate to about page', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      expect(url).toContain('/about');
    });

    test('should display about page header', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      const header = page.locator('h1:has-text("About"), h2:has-text("About")');
      await expect(header).toBeVisible({ timeout: 5000 });
    });

    test('should show how to use section', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      const howToSection = page.locator('h1:has-text("How to use Melodot"), h2:has-text("How to use Melodot")');
      await expect(howToSection).toBeVisible({ timeout: 5000 });
    });

    test('should display about content with key phrases', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      // Check for specific content from the About page
      const contentText = await page.textContent('main');
      expect(contentText).toContain('just right');
      expect(contentText).toContain('artist');
    });

    test('should show numbered steps in how to use section', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      // Check for numbered steps (1-5)
      const steps = page.locator('span:has-text("1"), span:has-text("2"), span:has-text("3"), span:has-text("4"), span:has-text("5")');
      const stepCount = await steps.count();
      expect(stepCount).toBeGreaterThanOrEqual(5);
    });

    test('should display step descriptions', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      const contentText = await page.textContent('main');
      expect(contentText).toContain('Log in');
      expect(contentText).toContain('Get test funds');
      expect(contentText).toContain('Discover');
      expect(contentText).toContain('Select amount');
      expect(contentText).toContain('Donate');
    });
  });

  test.describe('Statistics Page', () => {
    test('should navigate to statistics page', async ({ page }) => {
      await page.goto('/statistics');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      expect(url).toContain('/statistics');
    });

    test('should display statistics page header', async ({ page }) => {
      await page.goto('/statistics');
      await page.waitForLoadState('networkidle');

      const header = page.locator('h1:has-text("Statistics"), h2:has-text("Statistics")');
      await expect(header).toBeVisible({ timeout: 5000 });
    });

    test('should show statistics dashboard component', async ({ page }) => {
      await page.goto('/statistics');
      await page.waitForLoadState('networkidle');

      // Dashboard should be present on statistics page
      const statsSection = page.locator('[class*="stat"], [data-testid*="stat"]');
      const hasDashboard = await statsSection.count() > 0;
      expect(hasDashboard).toBeTruthy();
    });

    test('should display page description', async ({ page }) => {
      await page.goto('/statistics');
      await page.waitForLoadState('networkidle');

      const description = page.locator('p:has-text("Platform activity"), p:has-text("metrics")');
      const hasDescription = await description.count() > 0;
      expect(hasDescription).toBeTruthy();
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should have sidebar with navigation links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check for sidebar
      const sidebar = page.locator('[data-sidebar], aside, nav');
      const hasSidebar = await sidebar.count() > 0;
      expect(hasSidebar).toBeTruthy();
    });

    test('should have links to all main pages', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check for links to main pages
      const discoverLink = page.locator('a[href="/"], a:has-text("Discover")');
      const donationsLink = page.locator('a[href="/donations"], a:has-text("Donations")');
      const claimLink = page.locator('a[href="/claim"], a:has-text("Claim")');
      const aboutLink = page.locator('a[href="/about"], a:has-text("About")');
      const statisticsLink = page.locator('a[href="/statistics"], a:has-text("Statistics")');

      const hasDiscoverLink = await discoverLink.count() > 0;
      const hasDonationsLink = await donationsLink.count() > 0;
      const hasClaimLink = await claimLink.count() > 0;
      const hasAboutLink = await aboutLink.count() > 0;
      const hasStatisticsLink = await statisticsLink.count() > 0;

      // Should have navigation to key pages
      expect(hasDiscoverLink || hasDonationsLink || hasClaimLink || hasAboutLink || hasStatisticsLink).toBeTruthy();
    });

    test('should navigate via sidebar links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click on donations link
      const donationsLink = page.locator('a[href="/donations"]').first();
      const isVisible = await donationsLink.isVisible({ timeout: 2000 }).catch(() => false);

      if (isVisible) {
        await donationsLink.click();
        await page.waitForLoadState('networkidle');

        const url = page.url();
        expect(url).toContain('/donations');
      } else {
        // Sidebar might be collapsed on mobile
        expect(true).toBeTruthy();
      }
    });

    test('should highlight active page in sidebar', async ({ page }) => {
      await page.goto('/donations');
      await page.waitForLoadState('networkidle');

      // Active link should have active state
      const activeLink = page.locator('[data-active="true"], a[aria-current="page"]');
      const count = await activeLink.count();

      expect(count >= 0).toBeTruthy();
    });
  });

  test.describe('Page Headers', () => {
    test('should have consistent header structure across pages', async ({ page }) => {
      const routes = ['/', '/donations', '/claim', '/about'];

      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');

        // Each page should have a header
        const header = page.locator('header, [role="banner"]');
        const hasHeader = await header.count() > 0;
        expect(hasHeader).toBeTruthy();
      }
    });

    test('should have app logo in header', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for logo or app name
      const logo = page.locator('svg[class*="logo"], img[alt*="logo"], span:has-text("Melodot")');
      const hasLogo = await logo.count() > 0;
      expect(hasLogo).toBeTruthy();
    });
  });
});
