import * as zapper from '@reserve-protocol/token-zapper'
import * as mainnetConfig from '@reserve-protocol/token-zapper/configuration/ethereum'

import { atom } from 'jotai'
import { loadable } from 'jotai/utils'
import { providerAtom } from 'state/atoms'
import { onlyNonNullAtom, simplifyLoadable } from 'utils/atoms/utils'
import { createProxiedOneInchAggregator } from './createProxiedOneInchAggregator'

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
    const provider = get(providerAtom)

    // To inject register data into the zapper initialize code, it's probably best to load it all here.
    // Makre sure that thedata does not change after this point as we don't want to trigger updates

    if (provider == null) {
      return null
    }

    try {
      const mainnetSetup = await import('@reserve-protocol/token-zapper/configs/mainnet/zapper')
      const universe = await zapper.Universe.createWithConfig(
        provider,
        mainnetConfig.ethereumConfig,
        mainnetSetup.setupEthereumZapper
      )
      try {
        if (ONE_INCH_PROXIES.length !== 0) {
          universe.dexAggregators.push(
            createProxiedOneInchAggregator(universe, ONE_INCH_PROXIES)
          )
        }
      } catch (e) {
        console.log(e)
      }

      return universe
    } catch (e) {
      console.log(e)
      throw e
    }
  })
)

export const resolvedZapState = simplifyLoadable(zapperState)

export const zappableTokens = atom((get) => {
  const uni = get(resolvedZapState)
  if (uni == null) {
    return []
  }
  return [
    uni.nativeToken,
    uni.commonTokens.USDC,
    uni.commonTokens.USDT,
    uni.commonTokens.DAI,
    uni.commonTokens.WBTC,
    uni.commonTokens.WETH,
    uni.commonTokens.MIM,
    uni.commonTokens.FRAX,
  ].filter((tok) => tok != null)
})
