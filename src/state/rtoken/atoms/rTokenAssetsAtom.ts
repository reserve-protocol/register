import { AssetInterface, AssetRegistryInterface } from 'abis'
import { AssetRegistry } from 'abis/types'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { getValidWeb3Atom, multicallAtom } from 'state/atoms'
import { ContractCall, Token } from 'types'
import { getContract, getTokenMetaCalls } from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import rTokenContractsAtom from './rTokenContractsAtom'

const rTokenAssetsAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)
  const { provider } = get(getValidWeb3Atom)
  const multicall = get(multicallAtom)

  if (!multicall || !provider || !contracts) {
    return null
  }

  const registryContract = getContract(
    contracts.assetRegistry.address,
    AssetRegistryInterface,
    provider
  ) as AssetRegistry

  const [erc20s, assets] = await registryContract.getRegistry()
  const calls = assets.reduce((calls, asset, index) => {
    calls.push(...getTokenMetaCalls(erc20s[index]))
    calls.push({
      address: asset,
      abi: AssetInterface,
      args: [],
      method: 'price',
    })
    calls.push({
      address: asset,
      abi: AssetInterface,
      args: [],
      method: 'maxTradeVolume',
    })
    return calls
  }, [] as ContractCall[])

  const result = await multicall(calls)

  const registeredAssets: {
    [x: string]: {
      address: string
      token: Token
      maxTradeVolume: string
      priceUsd: number
    }
  } = {}

  // For each asset 5 items of the result array
  for (let i = 0; i < assets.length; i++) {
    const [name, symbol, decimals, priceRange, maxTradeVolume] = result.splice(
      0,
      5
    )

    registeredAssets[erc20s[i]] = {
      address: assets[i],
      token: {
        address: erc20s[i],
        name,
        symbol,
        decimals,
      },
      maxTradeVolume: formatUnits(maxTradeVolume, decimals),
      priceUsd:
        (Number(formatEther(priceRange[0])) +
          Number(formatEther(priceRange[1]))) /
        2,
    }
  }

  return registeredAssets
})

export default rTokenAssetsAtom
