import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import dtfIndexStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { accountRewardsAtom, accountStakingTokensAtom } from './atoms'
import { Address, erc20Abi } from 'viem'

const RewardsUpdater = () => {
  const stTokens = useAtomValue(accountStakingTokensAtom)
  const setRewards = useSetAtom(accountRewardsAtom)

  const { data: rewardsData, isLoading } = useReadContracts({
    contracts: stTokens.map((stToken) => ({
      address: stToken.address,
      abi: dtfIndexStakingVaultAbi,
      functionName: 'getAllRewardTokens',
    })),
    allowFailure: false,
    query: { enabled: stTokens.length > 0 },
  })

  const rewardsMap = useMemo(() => {
    if (!rewardsData) return {}
    return Object.fromEntries(
      stTokens.map((stToken, index) => {
        const tokenRewards = (rewardsData[index] || []) as Address[]
        return [stToken.address, tokenRewards]
      })
    )
  }, [rewardsData, stTokens])

  const { data: rewardMetadata, isLoading: isRewardBalancesLoading } =
    useReadContracts({
      contracts: Object.entries(rewardsMap).flatMap(([stToken, rewards]) =>
        rewards.flatMap((reward) => [
          {
            address: reward,
            abi: erc20Abi,
            functionName: 'symbol',
          },
          {
            address: reward,
            abi: erc20Abi,
            functionName: 'name',
          },
          {
            address: reward,
            abi: erc20Abi,
            functionName: 'decimals',
          },
        ])
      ),
      allowFailure: false,
      query: { enabled: Object.keys(rewardsMap).length > 0 },
    })

  useEffect(() => {
    if (rewardMetadata !== undefined) {
      // const rewardsFinal = Object.entries(rewardsMap).map(
      //   ([stToken, rewards], stTokenIndex) => {
      //     const rewardsWithMetadata = rewards.map((reward, rewardIndex) => {
      //       const currentIndex =
      //       return {
      //         address: reward,
      //         symbol: rewardMetadata?.[
      //           stTokenIndex * rewards.length + rewardIndex
      //         ] as string,
      //         name: rewardMetadata?.[
      //           stTokenIndex * rewards.length + rewardIndex + 1
      //         ] as string,
      //         decimals: rewardMetadata?.[
      //           stTokenIndex * rewards.length + rewardIndex + 2
      //         ] as number,
      //       }
      //     })
      //     return [stToken, rewardsWithMetadata]
      //   }
      // )
    }
  }, [])

  return null
}

export default RewardsUpdater
