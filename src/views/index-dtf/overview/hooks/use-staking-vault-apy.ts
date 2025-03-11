import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { useDTFPrices } from '@/hooks/usePrices'
import { wagmiConfig } from '@/state/chain'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { AvailableChain, ChainId } from '@/utils/chains'
import { getAllRewardTokensAbi } from '@/views/portfolio/rewards-updater'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { erc20Abi } from 'viem'
import { useBlockNumber, useReadContract, useReadContracts } from 'wagmi'
import { readContracts } from 'wagmi/actions'

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
  const [allSupplies, setAllSupplies] = useState<bigint[]>([])
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
        chainId,
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
        chainId,
      }))
    )
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
      const supply = await readContracts(wagmiConfig, {
        contracts: rewards.map((reward) => ({
          address: reward,
          abi: erc20Abi,
          functionName: 'totalSupply',
          blockNumber,
          chainId: chainId as AvailableChain,
        })),
        allowFailure: false,
      })

      return supply as bigint[]
    }

    Promise.all(
      Array.from({ length: Number(PERIOD) }, (_, i) =>
        fetchSupply(currentBlockNumber! - BLOCKS_PER_DAY[chainId!] * BigInt(i))
      )
    ).then((supplies) => {
      setAllSupplies(supplies.flat())
    })
  }, [rewards, stToken, chainId, currentBlockNumber])

  const { data: rewardsPrices } = useDTFPrices(
    rewards?.map((reward) => reward) || [],
    chainId
  )

  const rewardsData: Record<string, RewardData> = useMemo(() => {
    if (
      !currentRewardTrackerData ||
      !pastRewardTrackerData ||
      !rewards ||
      !allSupplies
    )
      return {}

    return Object.fromEntries(
      rewards
        .map((reward, i) => {
          const currentRewardTracker = currentRewardTrackerData[
            i
          ] as RewardTrackerData
          const pastRewardTracker = pastRewardTrackerData[
            i
          ] as RewardTrackerData
          const supplies = allSupplies.filter(
            (_, j) => j % rewards.length === i
          )

          if (!currentRewardTracker || !pastRewardTracker || !supplies)
            return null

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
        .filter((e) => e !== null)
    )
  }, [currentRewardTrackerData, pastRewardTrackerData, rewards, allSupplies])

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

          if (!supplies.length) return 0
          const totalSupplyAvg = totalSupplySum / BigInt(supplies.length)
          if (totalSupplyAvg === 0n) return 0

          const apy =
            (Number(dtfRevenue) * price * Number(YEAR) * 100) /
            (Number(totalSupplyAvg) * Number(PERIOD))
          return apy
        }
      )
      .reduce((acc, apy) => acc + apy, 0)
  }, [rewardsData, rewardsPrices])

  return apy
}
