import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useReadContracts } from 'wagmi'
import dtfIndexStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { accountRewardsAtom, accountStakingTokensAtom } from './atoms'

const RewardsUpdater = () => {
  const stTokens = useAtomValue(accountStakingTokensAtom)
  const setRewards = useSetAtom(accountRewardsAtom)

  const contracts = stTokens.map((stToken) => ({
    address: stToken.address,
    abi: dtfIndexStakingVaultAbi,
    functionName: 'getAllRewardTokens',
  }))

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: stTokens.length > 0 },
    allowFailure: false,
  })

  useEffect(() => {
    if (data && !isLoading) {
      const rewards = stTokens.map((stToken, index) => {
        const rewards = data[index]
        return [stToken.address, rewards]
      })
      setRewards(Object.fromEntries(rewards))
    }
  }, [data, isLoading, setRewards, stTokens])

  return null
}

export default RewardsUpdater
