import {expect, test} from './fixtures/pages';

test.describe('Donation Flow', () => {

  test('should not show donation form on initial load', async ({ donationPage }) => {
    const isVisible = await donationPage.isDonationFormVisible();
    expect(isVisible).toBeFalsy();
  });
});
