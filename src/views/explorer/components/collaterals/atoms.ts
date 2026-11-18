import { collateralYieldAtom } from 'state/atoms'
import { wagmiConfig } from 'state/chain'
import { CollateralPlugin } from 'types'
import { atomWithLoadable } from 'utils/atoms/utils'
import { AvailableChain } from 'utils/chains'
import { supportedChainList } from 'utils/constants'
import collateralPlugins from 'utils/plugins'
import { erc20Abi, formatUnits } from 'viem'
import { readContracts } from 'wagmi/actions'

export interface Plugin extends CollateralPlugin {
  apy: number
  chainId: number
  supply: number
}

export const allPluginsAtom = atomWithLoadable(async (get) => {
  const collateralYield = get(collateralYieldAtom)
  const pluginsMap: Plugin[] = supportedChainList.flatMap((chainId) =>
    collateralPlugins[chainId].map((plugin) => ({
      ...plugin,
      apy:
        collateralYield[chainId]?.[
          plugin.symbol.toLowerCase().replace('-vault', '')
        ] ?? 0,
      supply: 0,
      chainId,
    }))
  )

  const supplies = await readContracts(wagmiConfig, {
    allowFailure: false,
    contracts: pluginsMap.map((plugin) => ({
      abi: erc20Abi,
      chainId: plugin.chainId as AvailableChain,
      address: plugin.underlyingAddress || plugin.erc20,
      functionName: 'totalSupply',
    })),
  })

  return pluginsMap.map((plugin, index) => ({
    ...plugin,
    supply: +formatUnits(supplies[index] as bigint, plugin.decimals),
  }))
})
