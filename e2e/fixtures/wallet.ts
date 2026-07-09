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
    async ({ page, unmockedCalls, overrides }, use) => {
      const log = (message: string, detail?: Record<string, unknown>) => {
        unmockedCalls.push(`[E2E] ${message}${detail ? ' ' + JSON.stringify(detail) : ''}`)
      }
      await installTestWallet(page, {
        address: TEST_ADDRESS,
        chainId: CHAINS.base.chainId,
        log,
        overrides,
      })
      await use()
    },
    { auto: true },
  ],
})

// Ensure the Test Wallet is connected. The injected provider is exposed as
// window.ethereum, so wagmi auto-connects it on mount in most runs; if that
// already happened we're done. Otherwise drive the RainbowKit modal (which
// lists the wallet via its EIP-6963 announcement). Either path exercises the
// wallet fixture and lands on the connected header state.
export async function connectWallet(page: Page) {
  const wallet = page.getByTestId('header-wallet')
  try {
    await expect(wallet).toBeVisible({ timeout: 6_000 })
    return
  } catch {
    // not auto-connected — fall through to the explicit modal flow.
  }
  await page.getByTestId('header-connect-btn').click()
  await page.getByRole('button', { name: 'Test Wallet' }).click()
  await expect(wallet).toBeVisible()
}

export { expect }
