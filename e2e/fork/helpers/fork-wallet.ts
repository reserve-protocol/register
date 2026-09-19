import type { Page } from '@playwright/test'

export interface ForkWalletConfig {
  address: string
  chainId: number
  rpcUrl: string
}

// EIP-6963/EIP-1193 wallet that forwards every request to the Anvil fork.
// Sends go through eth_sendTransaction unsigned: the runner impersonated the
// account (anvil_impersonateAccount) before the browser opened. Reads still go
// through Register's http transports (VITE_RPC_URL_<chain>) — this provider only
// owns accounts, chain and sends.
export async function installForkWallet(page: Page, config: ForkWalletConfig) {
  await page.addInitScript(
    ({ address, chainId, rpcUrl }) => {
      let id = 1
      const forward = async (method: string, params?: unknown[]) => {
        const res = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: id++, method, params: params ?? [] }),
        })
        const json = (await res.json()) as { result?: unknown; error?: { message: string } }
        if (json.error) throw new Error(json.error.message)
        return json.result
      }
      const listeners = new Map<string, Set<(payload: unknown) => void>>()
      const provider = {
        isForkWallet: true,
        request: async ({ method, params }: { method: string; params?: unknown[] }) => {
          switch (method) {
            case 'eth_accounts':
            case 'eth_requestAccounts':
              return [address]
            case 'eth_chainId':
              return '0x' + chainId.toString(16)
            case 'net_version':
              return String(chainId)
            case 'wallet_switchEthereumChain':
              return null
            case 'wallet_addEthereumChain':
              return null
            case 'eth_sendTransaction': {
              const [tx] = (params ?? []) as [Record<string, unknown>]
              return forward('eth_sendTransaction', [{ ...tx, from: address }])
            }
            default:
              return forward(method, params)
          }
        },
        on: (event: string, cb: (payload: unknown) => void) => {
          if (!listeners.has(event)) listeners.set(event, new Set())
          listeners.get(event)!.add(cb)
        },
        removeListener: (event: string, cb: (payload: unknown) => void) => {
          listeners.get(event)?.delete(cb)
        },
      }
      const detail = Object.freeze({
        info: {
          uuid: 'fork-wallet-0000-0000-0000-000000000000',
          name: 'Fork Wallet',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
          rdns: 'org.reserve.forkwallet',
        },
        provider,
      })
      const announce = () =>
        window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }))
      window.addEventListener('eip6963:requestProvider', announce)
      announce()
      ;(window as unknown as { ethereum: unknown }).ethereum = provider
    },
    config
  )
}
