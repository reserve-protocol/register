import type { Page } from '@playwright/test'
import type { UnmockedLogger } from './logger'
import type { MockOverrides } from './overrides'
import { handleRpcMethod } from './rpc'

export interface TestWalletConfig {
  address: string
  chainId: number
  log: UnmockedLogger
  overrides?: MockOverrides
}

// Inject an EIP-6963 + EIP-1193 mock wallet before app JS runs.
//
// Two parts:
// 1. exposeFunction — bridges browser RPC calls into Node (this process).
// 2. addInitScript — injects the provider and announces it via EIP-6963, which
//    RainbowKit's injectedWallet listens for, so "Test Wallet" appears in the
//    connect modal and window.ethereum is set as a fallback.
//
// READ PATH: the HTTP host interception (mockRpcRoutes) is the PRIMARY read
// path — wagmi and the Reserve SDK route reads through their http() transports,
// not through the connector, even when a wallet is connected. This provider
// still forwards reads to the same handleRpcMethod as a redundant belt for any
// dapp code that calls the connector directly, so answers stay identical.
// The connector's real job here is wallet ops: accounts, chain switch,
// signatures, sendTransaction.
export async function installTestWallet(page: Page, config: TestWalletConfig) {
  const { address, log, overrides } = config
  let currentChainId = config.chainId

  await page.exposeFunction(
    'e2eWalletRequest',
    async (request: { method: string; params?: unknown[] }): Promise<unknown> => {
      switch (request.method) {
        case 'eth_accounts':
        case 'eth_requestAccounts':
          return [address]

        case 'eth_chainId':
          return '0x' + currentChainId.toString(16)

        case 'net_version':
          return String(currentChainId)

        case 'wallet_switchEthereumChain': {
          const params = request.params as [{ chainId: string }] | undefined
          const next = params?.[0]?.chainId
          if (next) {
            currentChainId = parseInt(next, 16)
            // Tell the browser-side provider to emit chainChanged.
            await page
              .evaluate((hex) => {
                const eth = (window as unknown as { ethereum?: { emit?: (e: string, ...a: unknown[]) => void } }).ethereum
                eth?.emit?.('chainChanged', hex)
              }, next)
              .catch(() => {})
          }
          return null
        }

        case 'wallet_requestPermissions':
        case 'wallet_getPermissions':
          return [{ parentCapability: 'eth_accounts' }]

        case 'eth_sendTransaction':
          return '0x' + 'a'.repeat(64)

        case 'personal_sign':
          return '0x' + 'b'.repeat(130)

        case 'eth_signTypedData_v4':
          return '0x' + 'c'.repeat(130)

        case 'eth_getBalance':
          return '0x56bc75e2d63100000' // 100 ETH

        default:
          // Everything else (reads) goes through the shared RPC dispatch —
          // same per-test overrides as the HTTP mock so answers stay identical.
          return handleRpcMethod(request.method, request.params, {
            chainId: currentChainId,
            log,
            overrides,
          })
      }
    }
  )

  await page.addInitScript(() => {
    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {}

    const provider = {
      isTestWallet: true,
      request: (req: { method: string; params?: unknown[] }) =>
        (window as unknown as {
          e2eWalletRequest: (r: { method: string; params?: unknown[] }) => Promise<unknown>
        }).e2eWalletRequest({ method: req.method, params: req.params }),
      on(event: string, fn: (...args: unknown[]) => void) {
        ;(listeners[event] ??= []).push(fn)
        return provider
      },
      removeListener(event: string, fn: (...args: unknown[]) => void) {
        listeners[event] = (listeners[event] ?? []).filter((l) => l !== fn)
        return provider
      },
      emit(event: string, ...args: unknown[]) {
        for (const fn of listeners[event] ?? []) fn(...args)
      },
    }

    const detail = Object.freeze({
      info: {
        uuid: crypto.randomUUID(),
        name: 'Test Wallet',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="%234F46E5" rx="6"/></svg>',
        rdns: 'org.reserve.e2e',
      },
      provider,
    })

    const announce = () =>
      window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }))

    announce()
    window.addEventListener('eip6963:requestProvider', announce)
    ;(window as unknown as { ethereum: unknown }).ethereum = provider
  })
}
