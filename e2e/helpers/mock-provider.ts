import type { Page } from '@playwright/test'

interface MockWalletConfig {
  address: string
  chainId: number
}

/**
 * Custom EIP-6963 wallet mock for Playwright.
 *
 * Two parts:
 * 1. exposeFunction — bridges browser RPC calls → Node.js
 * 2. addInitScript — injects EIP-6963 provider before app JS loads
 *
 * RainbowKit's injectedWallet listens for eip6963:announceProvider events,
 * so our mock wallet appears in the connect modal automatically.
 */
export async function installTestWallet(
  page: Page,
  config: MockWalletConfig = {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    chainId: 8453,
  }
) {
  let currentChainId = config.chainId

  // Bridge: browser calls this exposed function for all RPC requests
  await page.exposeFunction(
    'eip1193Request',
    async (request: { method: string; params?: unknown[] }) => {
      switch (request.method) {
        case 'eth_accounts':
        case 'eth_requestAccounts':
          return [config.address]

        case 'eth_chainId':
          return '0x' + currentChainId.toString(16)

        case 'net_version':
          return currentChainId.toString()

        case 'wallet_switchEthereumChain': {
          const params = request.params as [{ chainId: string }]
          if (params?.[0]?.chainId) {
            currentChainId = parseInt(params[0].chainId, 16)
          }
          return null
        }

        case 'wallet_requestPermissions':
          return [{ parentCapability: 'eth_accounts' }]

        case 'wallet_getPermissions':
          return [{ parentCapability: 'eth_accounts' }]

        case 'eth_sendTransaction':
          // Return mock tx hash — Phase 2 will forward to Anvil
          return '0x' + 'a'.repeat(64)

        case 'personal_sign':
          return '0x' + 'b'.repeat(130)

        case 'eth_signTypedData_v4':
          return '0x' + 'c'.repeat(130)

        case 'eth_blockNumber':
          return '0x1000000'

        case 'eth_getBalance':
          // 100 ETH
          return '0x56BC75E2D63100000'

        case 'eth_estimateGas':
          return '0x5208'

        case 'eth_gasPrice':
          return '0x3B9ACA00'

        case 'eth_getCode':
          return '0x'

        case 'eth_call':
          return '0x'

        default:
          console.log(`[test-wallet] unhandled method: ${request.method}`)
          return null
      }
    }
  )

  // Inject EIP-6963 compliant provider before any app JS runs
  await page.addInitScript(
    ({ address, chainId }) => {
      // Minimal EIP-1193 provider
      const listeners: Record<string, Array<(...args: unknown[]) => void>> = {}

      const provider = {
        isTestWallet: true,

        request: async (req: { method: string; params?: unknown[] }) => {
          return (window as any).eip1193Request({
            method: req.method,
            params: req.params,
          })
        },

        on: (event: string, fn: (...args: unknown[]) => void) => {
          if (!listeners[event]) listeners[event] = []
          listeners[event].push(fn)
          return provider
        },

        removeListener: (event: string, fn: (...args: unknown[]) => void) => {
          if (listeners[event]) {
            listeners[event] = listeners[event].filter((l) => l !== fn)
          }
          return provider
        },

        emit: (event: string, ...args: unknown[]) => {
          if (listeners[event]) {
            listeners[event].forEach((fn) => fn(...args))
          }
        },
      }

      // EIP-6963 provider info
      const detail = Object.freeze({
        info: {
          uuid: crypto.randomUUID(),
          name: 'Test Wallet',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="%234F46E5" rx="6"/><text x="16" y="22" font-size="18" text-anchor="middle" fill="white">T</text></svg>',
          rdns: 'com.test.wallet',
        },
        provider,
      })

      // Announce on eip6963:requestProvider (RainbowKit fires this on init)
      const announce = () => {
        window.dispatchEvent(
          new CustomEvent('eip6963:announceProvider', { detail })
        )
      }

      // Announce immediately and on every request
      announce()
      window.addEventListener('eip6963:requestProvider', announce)

      // Also set as window.ethereum fallback
      ;(window as any).ethereum = provider
    },
    { address: config.address, chainId: config.chainId }
  )
}
