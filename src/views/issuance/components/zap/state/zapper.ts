import { configuration, Universe } from '@reserve-protocol/token-zapper'

import { atom } from 'jotai'
import { loadable } from 'jotai/utils'
import { currentProvierAtom } from 'state/atoms'
import { onlyNonNullAtom, simplifyLoadable } from 'utils/atoms/utils'
import { createProxiedOneInchAggregator } from './createProxiedOneInchAggregator'

export const connectionName = onlyNonNullAtom((get) => {
  return get(currentProvierAtom).connection.url
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
    const provider = get(currentProvierAtom)
    if (provider == null) {
      return null
    }
    const universe = await Universe.createWithConfig(
      provider,
      configuration.eth.default,
      await provider.getNetwork()
    )

    if (ONE_INCH_PROXIES.length !== 0) {
      universe.dexAggregators.push(
        createProxiedOneInchAggregator(universe, ONE_INCH_PROXIES)
      )
    }

    void Promise.all([provider.getGasPrice(), provider.getBlockNumber()]).then(
      ([gasPrice, blockNumber]) => {
        universe.updateBlockState(blockNumber, gasPrice.toBigInt())
      }
    )

    return universe
  })
)
export const resolvedZapState = simplifyLoadable(zapperState)

export const zappableTokens = atom((get) => {
  const uni = get(resolvedZapState)
  return [
    uni?.nativeToken!, // Native ETH
    uni?.commonTokens.USDC!,
    uni?.commonTokens.USDT!,
    uni?.commonTokens.DAI!,
    uni?.commonTokens.WBTC!,
    uni?.commonTokens.ERC20GAS!, // Wrapped ETH
  ].filter((tok) => tok != null)
})
