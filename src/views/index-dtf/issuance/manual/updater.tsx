import dtfIndexAbi from '@/abis/dtf-index-abi'
import { useWatchReadContracts } from '@/hooks/useWatchReadContract'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'
import {
  allowanceMapAtom,
  assetDistributionAtom,
  balanceMapAtom,
} from './atoms'

const balanceCallsAtom = atom((get) => {
  const wallet = get(walletAtom)
  const indexDTF = get(indexDTFAtom)
  const basket = get(indexDTFBasketAtom)
  const chainId = get(chainIdAtom)

  if (!indexDTF || !basket || !wallet) return []

  const addresses = [indexDTF.id, ...basket.map((token) => token.address)]
  const calls = addresses.map((address) => ({
    abi: erc20Abi,
    address,
    functionName: 'balanceOf',
    args: [wallet],
    chainId,
  }))

  return calls
})

const allowanceCallsAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)
  const basket = get(indexDTFBasketAtom)
  const chainId = get(chainIdAtom)
  const wallet = get(walletAtom)

  if (!basket || !indexDTF || !wallet) return []

  return basket.map((token) => ({
    abi: erc20Abi,
    address: token.address,
    functionName: 'allowance',
    args: [wallet, indexDTF.id],
    chainId,
  }))
})

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const setBalance = useSetAtom(balanceMapAtom)
  const calls = useAtomValue(balanceCallsAtom)
  const allowanceCalls = useAtomValue(allowanceCallsAtom)
  const setAssetDistribution = useSetAtom(assetDistributionAtom)
  const setAllowances = useSetAtom(allowanceMapAtom)
  const chainId = useAtomValue(chainIdAtom)

  const { data } = useWatchReadContracts({
    contracts: calls,
    allowFailure: false,
    query: {
      select: (data) => {
        return data.reduce(
          (acc, curr, index) => {
            acc[calls[index].address] = curr as bigint
            return acc
          },
          {} as Record<string, bigint>
        )
      },
    },
  })
  const { data: allowances } = useWatchReadContracts({
    contracts: allowanceCalls,
    allowFailure: false,
    query: {
      select: (data) => {
        return data.reduce(
          (acc, curr, index) => {
            acc[allowanceCalls[index].address.toLowerCase()] = curr as bigint
            return acc
          },
          {} as Record<string, bigint>
        )
      },
    },
  })

  const { data: assetDistribution } = useReadContract({
    abi: dtfIndexAbi,
    address: indexDTF?.id,
    functionName: 'folio',
    chainId,
    query: {
      select: (data) => {
        const [assets, amounts] = data

        return assets.reduce(
          (acc, asset, index) => {
            acc[asset.toLowerCase()] = amounts[index]
            return acc
          },
          {} as Record<string, bigint>
        )
      },
    },
  })

  useEffect(() => {
    if (data) {
      setBalance(data)
    }
  }, [data])

  useEffect(() => {
    if (assetDistribution) {
      setAssetDistribution(assetDistribution)
    }
  }, [assetDistribution])

  useEffect(() => {
    if (allowances) {
      setAllowances(allowances)
    }
  }, [allowances])

  return null
}

export default Updater
