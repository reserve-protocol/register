import type { Page } from '@playwright/test'
import { installTestWallet } from '../helpers/provider'
import { CHAINS, TEST_ADDRESS } from '../helpers/registry'
import { test as baseTest, expect } from './base'

export interface WalletFixtures {
  // Install the injected EIP-6963 test wallet. Default true. Read-only /
  // lifecycle specs can opt out (`test.use({ wallet: false })`) to avoid the
  // extra wallet-gated query surface an auto-connected wallet triggers.
  wallet: boolean
  // The chain the injected wallet reports. Defaults to Base. Set it away from a
  // DTF's chain to exercise wrong-chain / switch-network paths
  // (`test.use({ walletChain: 56 })`).
  walletChain: number
}

// Extends the base fixture with the injected EIP-6963 wallet.
//
// RainbowKit's injectedWallet listens for `eip6963:announceProvider`, so the
// provider installed here shows up in the connect modal as "Test Wallet". The
// provider must be installed before navigation (addInitScript), so install is an
// auto fixture; connecting is still an explicit `connectWallet(page)` call.
export const test = baseTest.extend<WalletFixtures & { walletProvider: void }>({
  wallet: [true, { option: true }],
  walletChain: [CHAINS.base.chainId, { option: true }],
  walletProvider: [
    async ({ page, unmockedCalls, overrides, txLog, boundaryRequests, wallet, walletChain }, use) => {
      if (wallet) {
        const log = (message: string, detail?: Record<string, unknown>) => {
          unmockedCalls.push(`[E2E] ${message}${detail ? ' ' + JSON.stringify(detail) : ''}`)
        }
        await installTestWallet(page, {
          address: TEST_ADDRESS,
          chainId: walletChain,
          log,
          overrides,
          txLog,
          requests: boundaryRequests,
        })
      }
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
