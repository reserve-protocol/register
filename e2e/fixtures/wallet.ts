import { test as base, expect } from './base'
import { installTestWallet } from '../helpers/mock-provider'
import { TEST_ADDRESS, CHAINS } from '../helpers/test-data'

/**
 * Extended fixture with wallet mock installed.
 * Test Wallet appears in RainbowKit's connect modal via EIP-6963.
 */
export const test = base.extend<{ wallet: void }>({
  wallet: [
    async ({ page }, use) => {
      await installTestWallet(page, {
        address: TEST_ADDRESS,
        chainId: CHAINS.base.id,
      })
      await use()
    },
    { auto: true },
  ],
})

export { expect }
