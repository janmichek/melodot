/* eslint-disable react-hooks/rules-of-hooks */
import {test as base} from '@playwright/test'
import {WalletPage} from '../page-objects/WalletPage'
import {AudioRecorderPage} from '../page-objects/AudioRecorderPage'
import {DonationPage} from '../page-objects/DonationPage'
import {ClaimPage} from '../page-objects/ClaimPage'

type PageFixtures = {
  walletPage: WalletPage;
  audioRecorderPage: AudioRecorderPage;
  donationPage: DonationPage;
  claimPage: ClaimPage;
};

// Throttle the browser only while recording/measuring e2e. 85 means "run at
// 85% CPU", which maps to CDP rate 100/85 ≈ 1.176 (higher = slower).
base.beforeEach(async ({page}) => {
  const percent = Number(process.env.PLAYWRIGHT_CPU_THROTTLE ?? 0)
  if (percent > 0 && percent < 100) {
    const session = await page.context().newCDPSession(page)
    await session.send('Emulation.setCPUThrottlingRate', {rate: 100 / percent})
  }
})

export const test = base.extend<PageFixtures>({
  walletPage: async ({page}, use) => {
    const walletPage = new WalletPage(page)
    await walletPage.goto()
    await use(walletPage)
  },

  audioRecorderPage: async ({page, context}, use) => {
    await context.grantPermissions(['microphone'])
    const audioRecorderPage = new AudioRecorderPage(page)
    await audioRecorderPage.goto()
    await use(audioRecorderPage)
  },

  donationPage: async ({page}, use) => {
    const donationPage = new DonationPage(page)
    await donationPage.goto()
    await use(donationPage)
  },

  claimPage: async ({page}, use) => {
    const claimPage = new ClaimPage(page)
    await claimPage.goto()
    await use(claimPage)
  },
})

export {expect} from '@playwright/test'
