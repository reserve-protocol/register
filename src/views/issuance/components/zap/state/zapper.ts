import { Web3Provider } from '@ethersproject/providers'
import {
  Address,
  Config,
  Token,
  Universe,
  baseConfig,
  createDefillama,
  createKyberswap,
  ethereumConfig,
  setupBaseZapper,
  setupEthereumZapper,
} from '@reserve-protocol/token-zapper'
import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import mixpanel from 'mixpanel-browser'
import { chainIdAtom, rTokenAtom } from 'state/atoms'
import { publicClient } from 'state/chain'
import { onlyNonNullAtom, simplifyLoadable } from 'utils/atoms/utils'
import { ChainId } from 'utils/chains'
import { PublicClient } from 'viem'

export async function publicClientToProvider(publicClient: PublicClient) {
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

const providerAtom = atom(async (get) => {
  const chainId = get(chainIdAtom)
  const cli = publicClient({ chainId })

  return await publicClientToProvider(cli) as Web3Provider
})

export const supportsPermit2Signatures = onlyNonNullAtom((get) => {
  return false
})

export const zapperState = loadable(
  atom(async (get) => {
    const chainId = get(chainIdAtom)
    const rtoken = get(rTokenAtom)
    if (rtoken == null) {
      return null
    }
    const provider = get(providerAtom)

    // To inject register data into the zapper initialize code, it's probably best to load it all here.
    // Makre sure that thedata does not change after this point as we don't want to trigger updates

    if (provider == null) {
      return null
    }
    provider.on('error', () => {})

    try {
      const chainIdToConfig: Record<
        number,
        { config: Config; setup: (uni: Universe<any>) => Promise<any> }
      > = {
        [ChainId.Mainnet]: {
          config: ethereumConfig,
          setup: setupEthereumZapper,
        },
        [ChainId.Base]: {
          config: baseConfig,
          setup: setupBaseZapper,
        },
      }

      const conf = chainIdToConfig[provider.network.chainId].config
      conf.addresses.rTokens[rtoken.symbol] = Address.from(rtoken.address)

      conf.addresses.rTokenDeployments[rtoken.symbol] = Address.from(
        rtoken.main!
      )

      const universe = await Universe.createWithConfig(
        provider,
        conf,
        chainIdToConfig[provider.network.chainId].setup
      )

      universe.dexAggregators.push(createKyberswap('KyberSwap', universe, 50))

      if (chainId === ChainId.Mainnet) {
        universe.dexAggregators.push(
          createDefillama('DefiLlama:0x', universe, 10, 'Matcha/0x')
        )
        universe.dexAggregators.push(
          createDefillama('DefiLlama:HashFlow', universe, 10, 'Hashflow')
        )
      } else if (chainId === ChainId.Base) {
        universe.dexAggregators.push(
          createDefillama('DefiLlama:0x', universe, 10, 'Matcha/0x')
        )
      }
      return universe
    } catch (e) {
      console.log('Zap init error', e)
      mixpanel.track('Failed zapper set up', {
        ChainId: provider.network.chainId,
      })
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
  const commonTokens = uni.commonTokens as Record<string, Token>
  return [
    uni.nativeToken,
    commonTokens.USDbC,
    commonTokens.USDC,
    commonTokens.USDT,
    commonTokens.DAI,
    commonTokens.WBTC,
    commonTokens.WETH,
    commonTokens.MIM,
    commonTokens.FRAX,
  ].filter((tok) => tok != null)
})
