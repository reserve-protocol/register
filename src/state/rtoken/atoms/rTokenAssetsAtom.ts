import AssetAbi from 'abis/AssetAbi'
import AssetRegistry from 'abis/AssetRegistry'
import { Token } from 'types'
import { getTokenReadCalls } from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import { Address, formatEther, formatUnits } from 'viem'
import { getContract, readContracts } from 'wagmi/actions'
import rTokenContractsAtom from './rTokenContractsAtom'
import { chainIdAtom } from 'state/atoms'

export interface RTokenAsset {
  address: Address
  token: Token
  maxTradeVolume: string
  priceUsd: number
  version: string
}

const rTokenAssetsAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const chainId = get(chainIdAtom)

  if (!contracts) {
    return null
  }

  try {
    const registryContract = getContract({
      address: contracts.assetRegistry.address as Address,
      abi: AssetRegistry,
      chainId,
    })

    const { erc20s, assets } = await registryContract.read.getRegistry()

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

    const result = await readContracts({
      contracts: calls,
    })

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
