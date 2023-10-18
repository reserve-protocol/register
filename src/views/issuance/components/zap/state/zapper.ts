import { Web3Provider } from '@ethersproject/providers'
import {
  Universe,
  baseConfig,
  createKyberswap,
  ethereumConfig,
  setupBaseZapper,
  setupEthereumZapper,
} from '@reserve-protocol/token-zapper'
import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import mixpanel from 'mixpanel-browser'
import { chainIdAtom, clientAtom } from 'state/atoms'
import { onlyNonNullAtom, simplifyLoadable } from 'utils/atoms/utils'
import { PublicClient } from 'viem'

export function publicClientToProvider(publicClient: PublicClient) {
  const { chain } = publicClient
  const network = {
    chainId: chain!.id,
    name: chain!.name,
    ensAddress: chain!.contracts?.ensRegistry?.address,
  }
  return new Web3Provider(async (method, params) => {
    return publicClient.request({
      method,
      params,
    } as any)
  }, network)
}

const providerAtom = atom((get) => {
  const cli = get(clientAtom)
  if (cli == null) {
    return null
  }
  return publicClientToProvider(cli as any) as Web3Provider
})

// TODO: Convert provider viem -> ethers
export const connectionName = onlyNonNullAtom((get) => {
  return get(providerAtom).connection.url
})

const PERMIT2_SUPPORTED_CONNECTIONS = new Set(['metamask'])

export const supportsPermit2Signatures = onlyNonNullAtom((get) => {
  return PERMIT2_SUPPORTED_CONNECTIONS.has(get(connectionName))
})

const ONE_INCH_PROXIES = [
  'https://cold-mouse-7d43.mig2151.workers.dev/',
  'https://blue-cake-3548.mig2151.workers.dev/',
  'https://bitter-tree-ed5a.mig2151.workers.dev/',
  'https://square-morning-0921.mig2151.workers.dev/',
]

export const zapperState = loadable(
  atom(async (get) => {
    get(chainIdAtom)
    const provider = get(providerAtom)

    // To inject register data into the zapper initialize code, it's probably best to load it all here.
    // Makre sure that thedata does not change after this point as we don't want to trigger updates

    if (provider == null) {
      return null
    }
    provider.on('error', () => {})

    try {
      const chainIdToConfig: Record<number, { config: any, setup: (uni: Universe<any>) => Promise<any> }> = {
        1: {
          config: ethereumConfig,
          setup: setupEthereumZapper,
        },
        8453: {
          config: baseConfig,
          setup: setupBaseZapper,
        },
      }

      const universe = await Universe.createWithConfig(
        provider,
        chainIdToConfig[provider.network.chainId].config,
        chainIdToConfig[provider.network.chainId].setup
      )
      universe.dexAggregators.push(createKyberswap('KyberSwap', universe, 20))
      return universe
    } catch (e) {
      mixpanel.track('Failed zapper set up', {
        ChainId: provider.network.chainId,
      })
      console.log(e)
      return null
    }
  })
)

export const resolvedZapState = simplifyLoadable(zapperState)
export const zapperLoaded = atom(async (get) => {
  const zapper = get(resolvedZapState)
  if (zapper == null) {
    return false
  }
  await zapper.initialized
  return true
})

export const zappableTokens = atom(async (get) => {
  const uni = get(resolvedZapState)
  if (uni == null) {
    return []
  }
  return [
    uni.nativeToken,
    uni.commonTokens.USDbC,
    uni.commonTokens.USDC,
    uni.commonTokens.USDT,
    uni.commonTokens.DAI,
    uni.commonTokens.WBTC,
    uni.commonTokens.WETH,
    uni.commonTokens.MIM,
    uni.commonTokens.FRAX,
  ].filter((tok) => tok != null)
})
