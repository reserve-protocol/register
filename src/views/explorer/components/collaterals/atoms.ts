import { collateralYieldAtom } from 'state/atoms'
import { wagmiConfig } from 'state/chain'
import { CollateralPlugin } from 'types'
import { atomWithLoadable } from 'utils/atoms/utils'
import { AvailableChain } from 'utils/chains'
import { supportedChainList } from 'utils/constants'
import collateralPlugins from 'utils/plugins'
import { erc20Abi } from 'viem'
import { readContracts } from 'wagmi/actions'
import { getSupply, type SupplyRead } from './utils'

export interface Plugin extends CollateralPlugin {
  apy: number
  chainId: number
  // null when the on-chain read failed.
  supply: number | null
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

  // Per-call failures: one reverting token must not hide every other row.
  const reads = await readContracts(wagmiConfig, {
    allowFailure: true,
    contracts: pluginsMap.flatMap((plugin) => {
      const token = {
        abi: erc20Abi,
        chainId: plugin.chainId as AvailableChain,
        address: plugin.underlyingAddress || plugin.erc20,
      }
      return [
        { ...token, functionName: 'totalSupply' as const },
        { ...token, functionName: 'decimals' as const },
      ]
    }),
  })

  return pluginsMap.map((plugin, index) => ({
    ...plugin,
    supply: getSupply(
      reads[index * 2] as SupplyRead<bigint>,
      reads[index * 2 + 1] as SupplyRead<number>
    ),
  }))
})
