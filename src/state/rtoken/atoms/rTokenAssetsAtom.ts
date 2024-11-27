import AssetAbi from 'abis/AssetAbi'
import AssetRegistry from 'abis/AssetRegistry'
import { chainIdAtom } from 'state/atoms'
import { wagmiConfig } from 'state/chain'
import { Token } from 'types'
import { getTokenReadCalls } from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import { Address, formatEther, formatUnits } from 'viem'
import { readContract, readContracts } from 'wagmi/actions'
import rTokenContractsAtom from './rTokenContractsAtom'

export interface RTokenAsset {
  address: Address
  token: Token
  maxTradeVolume: string
  priceUsd: number
  version: string
}

// TODO: Remove from here and move it to an updater or react-query
const rTokenAssetsAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const chainId = get(chainIdAtom)

  if (!contracts) {
    return null
  }

  try {
    const { erc20s, assets } = await readContract(wagmiConfig, {
      address: contracts.assetRegistry.address as Address,
      abi: AssetRegistry,
      functionName: 'getRegistry',
      chainId,
    })

    const calls = assets
      .reduce((calls, asset, index) => {
        calls.push(...getTokenReadCalls(erc20s[index]))
        calls.push({
          address: asset as Address,
          abi: AssetAbi,
          functionName: 'price',
        })
        calls.push({
          address: asset as Address,
          abi: AssetAbi,
          functionName: 'maxTradeVolume',
        })
        calls.push({
          address: asset as Address,
          abi: AssetAbi,
          functionName: 'version',
        })
        return calls
      }, [] as any)
      .map((call: any) => ({ ...call, chainId }))

    const _result = await readContracts(wagmiConfig, {
      contracts: calls,
    })
    // Make it mutable instead of readonly
    const result = [..._result]

    const registeredAssets: {
      [x: string]: RTokenAsset
    } = {}

    // For each asset 5 items of the result array
    for (let i = 0; i < assets.length; i++) {
      const [name, symbol, decimals, priceRange, maxTradeVolume, version] =
        result.splice(0, 6)

      registeredAssets[erc20s[i]] = {
        address: assets[i],
        token: {
          address: erc20s[i],
          name: name.result as string,
          symbol: symbol.result as string,
          decimals: Number(decimals.result),
        },
        maxTradeVolume: formatUnits(
          maxTradeVolume.result as bigint,
          Number(decimals.result)
        ),
        priceUsd: priceRange.result
          ? (Number(formatEther((priceRange.result as bigint[])[0])) +
              Number(formatEther((priceRange.result as bigint[])[1]))) /
            2
          : 0,
        version: version.result ? (version.result as string) : '2.0.0',
      }
    }

    return registeredAssets
  } catch (e) {
    console.error('Error loading related contracts', e)
  }
})

export default rTokenAssetsAtom
