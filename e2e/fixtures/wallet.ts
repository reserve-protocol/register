import type { Page } from '@playwright/test'
import { installTestWallet } from '../helpers/provider'
import { CHAINS, TEST_ADDRESS } from '../helpers/registry'
import { test as baseTest, expect } from './base'

// Extends the base fixture with the injected EIP-6963 wallet.
//
// RainbowKit's injectedWallet listens for `eip6963:announceProvider`, so the
// provider installed here shows up in the connect modal as "Test Wallet". wagmi
// does NOT auto-connect a fresh session, so connecting is an explicit click:
// call connectWallet(page) after navigation. Reads still flow through the HTTP
// RPC mock (see provider.ts) whether or not a wallet is connected.
export const test = baseTest.extend<{ walletProvider: void }>({
  walletProvider: [
    async ({ page, unmockedCalls }, use) => {
      const log = (message: string, detail?: Record<string, unknown>) => {
        unmockedCalls.push(`[E2E] ${message}${detail ? ' ' + JSON.stringify(detail) : ''}`)
      }
      await installTestWallet(page, {
        address: TEST_ADDRESS,
        chainId: CHAINS.base.chainId,
        log,
      })
      await use()
    },
    { auto: true },
  ],
})

// Open the RainbowKit modal and pick the injected Test Wallet.
export async function connectWallet(page: Page) {
  await page.getByTestId('header-connect-btn').click()
  await page.getByRole('button', { name: 'Test Wallet' }).click()
  await expect(page.getByTestId('header-wallet')).toBeVisible()
}

export { expect }
