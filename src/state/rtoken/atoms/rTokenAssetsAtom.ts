import AssetAbi from 'abis/AssetAbi'
import AssetRegistry from 'abis/AssetRegistry'
import { formatEther, formatUnits } from 'ethers/lib/utils'
import { Token } from 'types'
import { getTokenReadCalls } from 'utils'
import { atomWithLoadable } from 'utils/atoms/utils'
import { Address } from 'viem'
import { getContract, readContracts } from 'wagmi/actions'
import rTokenContractsAtom from './rTokenContractsAtom'

const rTokenAssetsAtom = atomWithLoadable(async (get) => {
  const contracts = get(rTokenContractsAtom)

  if (!contracts) {
    return null
  }

  const registryContract = getContract({
    address: contracts.assetRegistry.address as Address,
    abi: AssetRegistry,
  })

  const { erc20s, assets } = await registryContract.read.getRegistry()

  const calls = assets.reduce((calls, asset, index) => {
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
    return calls
  }, [] as any)

  const result = await (<Promise<string[]>>(
    readContracts({ contracts: calls, allowFailure: false })
  ))

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
        decimals: Number(decimals),
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
