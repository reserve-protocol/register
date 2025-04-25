import { usePrices } from '@/hooks/usePrices'
import { walletAtom } from '@/state/atoms'
import { ChainId } from '@/utils/chains'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address, erc20Abi, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import {
  accountRewardsAtom,
  accountStakingTokensAtom,
  RewardToken,
} from './atoms'

// For some reason, the getAllRewardTokens throws a type
// error when using the abi directly from the contract
export const getAllRewardTokensAbi = [
  {
    type: 'function',
    name: 'getAllRewardTokens',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
] as const

const userRewardTrackersAbi = [
  {
    type: 'function',
    name: 'userRewardTrackers',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'lastRewardIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'accruedRewards',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
] as const

const RewardsUpdater = () => {
  const account = useAtomValue(walletAtom)
  const stTokens = useAtomValue(accountStakingTokensAtom)
  const setRewards = useSetAtom(accountRewardsAtom)

  const { data: rewardsData } = useReadContracts({
    contracts: stTokens.map((stToken) => ({
      address: stToken.address,
      abi: getAllRewardTokensAbi,
      functionName: 'getAllRewardTokens',
      chainId: stToken.chainId,
    })),
    allowFailure: false,
    query: { enabled: stTokens.length > 0 && !!account },
  })

  const rewardsMap: Record<Address, { chainId: number; rewards: Address[] }> =
    useMemo(() => {
      if (!rewardsData) return {}
      return Object.fromEntries(
        stTokens.map((stToken, index) => {
          const rewards = rewardsData[index] as Address[]
          return [stToken.address, { chainId: stToken.chainId, rewards }]
        })
      )
    }, [rewardsData, stTokens])

  const baseRewards = useMemo(
    () =>
      Object.values(rewardsMap)
        .filter(({ chainId }) => chainId === ChainId.Base)
        .map(({ rewards }) => rewards)
        .flat() || [],
    [rewardsMap]
  )

  const mainnetRewards = useMemo(
    () =>
      Object.values(rewardsMap)
        .filter(({ chainId }) => chainId === ChainId.Mainnet)
        .map(({ rewards }) => rewards)
        .flat() || [],
    [rewardsMap]
  )

  const baseRewardsPrices = usePrices(baseRewards, ChainId.Base)
  const mainnetRewardsPrices = usePrices(mainnetRewards, ChainId.Mainnet)

  const { data: accruedRewards } = useReadContracts({
    contracts: Object.entries(rewardsMap).flatMap(
      ([stToken, { chainId, rewards }]) =>
        rewards.flatMap((reward) => [
          {
            address: reward,
            abi: erc20Abi,
            functionName: 'symbol',
            chainId,
          },
          {
            address: reward,
            abi: erc20Abi,
            functionName: 'name',
            chainId,
          },
          {
            address: reward,
            abi: erc20Abi,
            functionName: 'decimals',
            chainId,
          },
          {
            address: stToken as Address,
            abi: userRewardTrackersAbi,
            functionName: 'userRewardTrackers',
            args: [reward, account!],
            chainId,
          },
        ])
    ),
    allowFailure: false,
    query: { enabled: Object.keys(rewardsMap).length > 0 && !!account },
  })

  useEffect(() => {
    if (accruedRewards !== undefined) {
      let currentIndex = 0
      const entries = Object.entries(rewardsMap) as [
        Address,
        { chainId: number; rewards: Address[] },
      ][]
      const rewardsFinal = entries.map(
        ([stToken, { chainId, rewards: rewardAddresses }]) => {
          const rewards = rewardAddresses
            .map((rewardAddress) => {
              const symbol = accruedRewards?.[currentIndex++] as string
              const name = accruedRewards?.[currentIndex++] as string
              const decimals = accruedRewards?.[currentIndex++] as number
              const accrued = (
                accruedRewards?.[currentIndex++] as [bigint, bigint]
              )[1] as bigint
              const price = (
                chainId === ChainId.Mainnet
                  ? mainnetRewardsPrices
                  : baseRewardsPrices
              )[rewardAddress]

              const accruedUSD =
                accrued !== undefined && price !== undefined
                  ? Number(formatUnits(accrued, decimals)) * price
                  : undefined

              return {
                address: rewardAddress,
                chainId,
                symbol,
                name,
                decimals,
                accrued,
                price,
                accruedUSD,
              }
            })
            .filter(({ accrued }) => accrued !== 0n)
          return [stToken, rewards]
        }
      )

      const result = Object.fromEntries(rewardsFinal) as Record<
        Address,
        RewardToken[]
      >
      setRewards(result)
    }
  }, [accruedRewards, rewardsMap, mainnetRewardsPrices, baseRewardsPrices])

  return null
}

export default RewardsUpdater
