import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { useDTFPrices } from '@/hooks/usePrices'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { getAllRewardTokensAbi } from '@/views/portfolio/rewards-updater'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { erc20Abi } from 'viem'
import { useBlockNumber, useReadContract, useReadContracts } from 'wagmi'

const PERIOD = 7n // 7 days
const YEAR = 365n
const BLOCKS_PER_DAY: Record<number, bigint> = {
  [ChainId.Mainnet]: 7200n, // 1 block every 12 seconds
  [ChainId.Base]: 43200n, // 1 block every 2 seconds
}

type RewardTrackerData = [
  bigint, // payoutLastPaid
  bigint, // rewardIndex
  bigint, // balanceAccounted
  bigint, // balanceLastKnown
  bigint, // totalClaimed
]

type RewardData = {
  currentRewardTracker: {
    payoutLastPaid: bigint
    rewardIndex: bigint
    balanceAccounted: bigint
    balanceLastKnown: bigint
    totalClaimed: bigint
  }
  pastRewardTracker: {
    payoutLastPaid: bigint
    rewardIndex: bigint
    balanceAccounted: bigint
    balanceLastKnown: bigint
    totalClaimed: bigint
  }
  supplies: bigint[]
}

export const useStakingVaultAPY = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const stToken = indexDTF?.stToken?.id
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
        blockNumber: currentBlockNumber - BLOCKS_PER_DAY[chainId] * PERIOD,
      },
      {
        address: stToken,
        abi: dtfIndexStakingVault,
        functionName: 'rewardTrackers',
        args: [reward],
        blockNumber: currentBlockNumber,
      },
    ])
  }, [stToken, chainId, currentBlockNumber, rewards])

  const supplyCalls = useMemo(() => {
    if (!rewards || !currentBlockNumber || !chainId) return []

    return rewards.flatMap((reward) =>
      Array.from({ length: Number(PERIOD) }, (_, i) => ({
        address: stToken,
        abi: erc20Abi,
        functionName: 'totalSupply',
        blockNumber: currentBlockNumber - BLOCKS_PER_DAY[chainId] * BigInt(i),
      }))
    )
  }, [stToken, chainId, currentBlockNumber, rewards])

  const { data: results } = useReadContracts({
    contracts: [...rewardTrackerCalls, ...supplyCalls],
    allowFailure: false,
    query: { enabled: !!rewardTrackerCalls.length || !!supplyCalls.length },
  })

  const { data: rewardsPrices } = useDTFPrices(
    rewards?.map((reward) => reward) || [],
    chainId
  )

  const rewardsData: Record<string, RewardData> = useMemo(() => {
    if (!results || !rewards) return {}
    const rewardTrackers = results.slice(
      0,
      rewardTrackerCalls.length
    ) as RewardTrackerData[]
    const allSupplies = results.slice(rewardTrackerCalls.length) as bigint[]

    return Object.fromEntries(
      rewards.map((reward, i) => {
        const currentRewardTracker = rewardTrackers[i]
        const pastRewardTracker = rewardTrackers[i + 1]
        const supplies = allSupplies.slice(
          i * Number(PERIOD),
          (i + 1) * Number(PERIOD)
        )

        if (!currentRewardTracker || !pastRewardTracker || !supplies) return []

        return [
          reward,
          {
            currentRewardTracker: {
              payoutLastPaid: currentRewardTracker[0],
              rewardIndex: currentRewardTracker[1],
              balanceAccounted: currentRewardTracker[2],
              balanceLastKnown: currentRewardTracker[3],
              totalClaimed: currentRewardTracker[4],
            },
            pastRewardTracker: {
              payoutLastPaid: pastRewardTracker[0],
              rewardIndex: pastRewardTracker[1],
              balanceAccounted: pastRewardTracker[2],
              balanceLastKnown: pastRewardTracker[3],
              totalClaimed: pastRewardTracker[4],
            },
            supplies,
          },
        ]
      })
    )
  }, [results, rewards, currentBlockNumber, chainId])

  const apy = useMemo(() => {
    if (!rewardsData) return 0

    return Object.entries(rewardsData)
      .map(
        ([reward, { currentRewardTracker, pastRewardTracker, supplies }]) => {
          const price =
            rewardsPrices?.find(
              (token) => token.address.toLowerCase() === reward.toLowerCase()
            )?.price || 0

          const dtfRevenue =
            currentRewardTracker.balanceAccounted -
            pastRewardTracker.balanceAccounted
          const totalSupplySum = supplies.reduce(
            (acc, supply) => acc + supply,
            0n
          )
          const totalSupplyAvg = totalSupplySum / BigInt(supplies.length)
          const apy = ((YEAR * (dtfRevenue / totalSupplyAvg)) / PERIOD) * 100n
          return Number(apy) * price
        }
      )
      .reduce((acc, apy) => acc + apy, 0)
  }, [rewardsData, rewardsPrices])

  return apy
}
