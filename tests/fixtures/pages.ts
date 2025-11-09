import {test as base} from '@playwright/test';
import {WalletPage} from '../page-objects/WalletPage';
import {AudioRecorderPage} from '../page-objects/AudioRecorderPage';
import {DonationPage} from '../page-objects/DonationPage';

type PageFixtures = {
  walletPage: WalletPage;
  audioRecorderPage: AudioRecorderPage;
  donationPage: DonationPage;
};

export const test = base.extend<PageFixtures>({
  walletPage: async ({ page }, use) => {
    const walletPage = new WalletPage(page);
    await walletPage.goto();
    await use(walletPage);
  },

  audioRecorderPage: async ({ page, context }, use) => {
    await context.grantPermissions(['microphone']);
    const audioRecorderPage = new AudioRecorderPage(page);
    await audioRecorderPage.goto();
    await use(audioRecorderPage);
  },

  donationPage: async ({ page }, use) => {
    const donationPage = new DonationPage(page);
    await donationPage.goto();
    await use(donationPage);
  },
});

export { expect } from '@playwright/test';
