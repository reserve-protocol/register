import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { useAssetPrice } from '@/hooks/useAssetPrices'
import { usePrices } from '@/hooks/usePrices'
import { wagmiConfig } from '@/state/chain'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { AvailableChain, ChainId } from '@/utils/chains'
import { getAllRewardTokensAbi } from '@/views/portfolio/rewards-updater'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { Address, erc20Abi } from 'viem'
import { useBlockNumber, useReadContract, useReadContracts } from 'wagmi'
import { readContract } from 'wagmi/actions'

const PERIOD = 7n // 7 days
const YEAR = 365n
const BLOCKS_PER_DAY: Record<number, bigint> = {
  [ChainId.Mainnet]: 7200n, // 1 block every 12 seconds
  [ChainId.Base]: 43_200n, // 1 block every 2 seconds
  [ChainId.BSC]: 115_200n, // 1 block every 0.75 seconds
}

type RewardTrackerData = [
  bigint, // payoutLastPaid
  bigint, // rewardIndex
  bigint, // balanceAccounted
  bigint, // balanceLastKnown
  bigint, // totalClaimed
]

type RewardTracker = {
  payoutLastPaid: bigint
  rewardIndex: bigint
  balanceAccounted: bigint
  balanceLastKnown: bigint
  totalClaimed: bigint
}

type RewardData = {
  currentRewardTracker: RewardTracker
  pastRewardTracker: RewardTracker
}

export const useStakingVaultAPY = () => {
  const [supplies, setSupplies] = useState<bigint[]>([])
  const indexDTF = useAtomValue(indexDTFAtom)
  const stToken = indexDTF?.stToken?.id
  const underlying = indexDTF?.stToken?.underlying.address
  const chainId = indexDTF?.chainId

  const { data: currentBlockNumber } = useBlockNumber({ chainId })

  const { data: rewards } = useReadContract({
    address: stToken,
    abi: getAllRewardTokensAbi,
    functionName: 'getAllRewardTokens',
    chainId,
    query: { enabled: !!stToken && !!chainId },
  })

  const rewardTrackerCalls = useMemo(() => {
    if (!rewards || !currentBlockNumber || !chainId) return []

    return rewards.flatMap((reward) => [
      {
        address: stToken,
        abi: dtfIndexStakingVault,
        functionName: 'rewardTrackers',
        args: [reward],
        chainId,
      },
    ])
  }, [stToken, chainId, currentBlockNumber, rewards])

  const { data: currentRewardTrackerData } = useReadContracts({
    contracts: rewardTrackerCalls,
    allowFailure: false,
    blockNumber: currentBlockNumber!,
    query: {
      enabled: !!rewardTrackerCalls.length && !!currentBlockNumber,
    },
  })

  const { data: pastRewardTrackerData } = useReadContracts({
    contracts: rewardTrackerCalls,
    allowFailure: false,
    blockNumber:
      currentBlockNumber && chainId
        ? currentBlockNumber! - BLOCKS_PER_DAY[chainId!] * PERIOD
        : undefined,
    query: {
      enabled: !!rewardTrackerCalls.length && !!currentBlockNumber && !!chainId,
    },
  })

  useEffect(() => {
    if (!rewards || !stToken || !chainId || !currentBlockNumber || !chainId) {
      return
    }

    const fetchSupply = async (blockNumber: bigint) => {
      return await readContract(wagmiConfig, {
        address: stToken,
        abi: erc20Abi,
        functionName: 'totalSupply',
        blockNumber: blockNumber,
        chainId: chainId as AvailableChain,
      })
    }

    Promise.all(
      Array.from({ length: Number(PERIOD) }, (_, i) =>
        fetchSupply(currentBlockNumber! - BLOCKS_PER_DAY[chainId!] * BigInt(i))
      )
    )
      .then((supplies) => {
        setSupplies(supplies.flat())
      })
      .catch((e) => {
        console.error('Error reading rewards')
      })
  }, [rewards, stToken, chainId, currentBlockNumber])

  const rewardsPrices = usePrices((rewards as Address[]) ?? [], chainId)
  const { data: stTokenPrice } = useAssetPrice(underlying, chainId)

  const rewardsData: Record<string, RewardData> = useMemo(() => {
    if (!currentRewardTrackerData || !pastRewardTrackerData || !rewards)
      return {}

    return Object.fromEntries(
      rewards
        .map((reward, i) => {
          const currRT = currentRewardTrackerData[i] as RewardTrackerData
          const pastRT = pastRewardTrackerData[i] as RewardTrackerData

          if (!currRT || !pastRT) return null

          return [
            reward,
            {
              currentRewardTracker: {
                payoutLastPaid: currRT[0],
                rewardIndex: currRT[1],
                balanceAccounted: currRT[2],
                balanceLastKnown: currRT[3],
                totalClaimed: currRT[4],
              },
              pastRewardTracker: {
                payoutLastPaid: pastRT[0],
                rewardIndex: pastRT[1],
                balanceAccounted: pastRT[2],
                balanceLastKnown: pastRT[3],
                totalClaimed: pastRT[4],
              },
            },
          ]
        })
        .filter((e) => e !== null)
    )
  }, [currentRewardTrackerData, pastRewardTrackerData, rewards])

  return useMemo(() => {
    if (!rewardsData || !supplies.length || !stTokenPrice) return 0

    const stTokenPriceValue = stTokenPrice[0]?.price
    if (!stTokenPriceValue) return 0

    const totalSupplySum = supplies.reduce(
      (acc, supply) => acc + Number(supply),
      0
    )
    const totalSupplyAvg =
      (stTokenPriceValue * totalSupplySum) / supplies.length
    if (totalSupplyAvg === 0) return 0

    const revenueOfPeriod = Object.entries(rewardsData)
      .map(([reward, { currentRewardTracker, pastRewardTracker }]) => {
        const rewardPrice = rewardsPrices[reward as Address] || 0

        const dtfRevenue =
          currentRewardTracker.balanceAccounted -
          pastRewardTracker.balanceAccounted

        const revenue = Number(dtfRevenue) * rewardPrice
        return revenue
      })
      .reduce((acc, revenue) => acc + revenue, 0)

    const apy =
      (revenueOfPeriod * Number(YEAR) * 100) /
      (Number(totalSupplyAvg) * Number(PERIOD))

    return apy
  }, [rewardsData, rewardsPrices, supplies, stTokenPrice])
}
