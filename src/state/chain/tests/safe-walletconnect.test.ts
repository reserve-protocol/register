import { EventEmitter } from 'node:events'
import { createRequire } from 'node:module'
import { base, bsc, mainnet } from '@reown/appkit/networks'
import { getAccount, switchChain } from '@wagmi/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SafeWagmiAdapter } from '../safe-wagmi-adapter'

// Resolve the adapter's own controller instance so this exercises the installed package.
const adapterRequire = createRequire(
  createRequire(import.meta.url).resolve('@reown/appkit-adapter-wagmi')
)
const { ChainController } = await import(adapterRequire.resolve('@reown/appkit-controllers'))

const address = '0x0000000000000000000000000000000000000001' as const
const networks = [mainnet, base, bsc].map((network) => ({
  ...network,
  chainNamespace: 'eip155' as const,
  caipNetworkId: `eip155:${network.id}` as const,
}))

beforeEach(() => {
  localStorage.clear()
  ChainController.state.chains.clear()
  ChainController.state.activeChain = 'eip155'
  ChainController.state.chains.set('eip155', {
    namespace: 'eip155',
    caipNetworks: networks,
    networkState: { caipNetwork: networks[2], requestedCaipNetworks: networks },
    accountState: {},
  })
})

async function setup(url: string, chains?: string[]) {
  const session = {
    peer: { metadata: { name: 'Safe Wallet', url } },
    namespaces: {
      eip155: {
        accounts: [`eip155:8453:${address}`],
        methods: ['wallet_switchEthereumChain'],
        events: ['chainChanged', 'accountsChanged'],
        ...(chains === undefined ? {} : { chains }),
      },
    },
  }
  const events = new EventEmitter()
  const request = vi.fn(async () => {
    if (!chains?.includes('eip155:8453')) throw new Error('User rejected request')
    return null
  })
  const provider = {
    session: undefined as typeof session | undefined,
    events,
    on: events.on.bind(events),
    removeListener: events.removeListener.bind(events),
    connect: async () => { provider.session = session },
    disconnect: async () => { provider.session = undefined },
    setDefaultChain: vi.fn(),
    request,
    client: { core: { crypto: { getClientId: async () => 'test-client' } } },
  }
  const adapter = new SafeWagmiAdapter({
    networks,
    projectId: 'test-project',
    storage: null,
  })
  await adapter.setUniversalProvider(
    provider as unknown as Parameters<SafeWagmiAdapter['setUniversalProvider']>[0]
  )
  return { adapter, request, provider }
}

describe('Safe WalletConnect post-connect switching', () => {
  it.each(['https://app.safe.global', 'https://safe.global'])('preserves the returned chain without switching for %s when chains is absent', async (url) => {
    const { adapter, request } = await setup(url)

    await expect(adapter.connectWalletConnect(56)).resolves.toEqual({ clientId: 'test-client' })

    expect(request).not.toHaveBeenCalled()
    expect(getAccount(adapter.wagmiConfig)).toMatchObject({
      status: 'connected', address, chainId: 1,
    })
    await expect(switchChain(adapter.wagmiConfig, { chainId: 1 })).rejects.toThrow()
    expect(request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }],
    })
  })

  it('preserves approved-chain switching for Safe', async () => {
    const { adapter, request } = await setup('https://app.safe.global', ['eip155:8453'])

    await adapter.connectWalletConnect(56)

    expect(request).toHaveBeenCalledExactlyOnceWith({
      method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2105' }],
    })
    expect(getAccount(adapter.wagmiConfig).chainId).toBe(8453)
  })

  it.each(['https://safepal.com', 'https://app.safe.global.example.com'])('preserves missing-chains behavior for other wallets (%s)', async (url) => {
    const { adapter, request } = await setup(url)

    await expect(adapter.connectWalletConnect(56)).rejects.toThrow()

    expect(request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }],
    })
  })

  it('does not treat an empty chains list as absent', async () => {
    const { adapter, request } = await setup('https://app.safe.global', [])

    await expect(adapter.connectWalletConnect(56)).rejects.toThrow()

    expect(request).toHaveBeenCalled()
  })
})
