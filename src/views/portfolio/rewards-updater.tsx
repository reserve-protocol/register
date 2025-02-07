import dtfIndexStakingVaultAbi from '@/abis/dtf-index-staking-vault'
import { walletAtom } from '@/state/atoms'
import { ChainId } from '@/utils/chains'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address, erc20Abi, formatUnits, parseUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { accountRewardsAtom, accountStakingTokensAtom } from './atoms'
import { useAssetPrices } from '@/hooks/useAssetPrices'

const rewardsDataMock = [
  [
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  ],
  [
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    '0xCb327b99fF831bF8223cCEd12B1338FF3aA322Ff',
  ],
]

const accruedRewardsMock = [
  'USDC',
  'USD Coin',
  6,
  [1n, 100000000n],
  'DAI',
  'Dai Stablecoin',
  18,
  [1n, 200000000000000000000],
  'USDC',
  'USD Coin',
  6,
  [1n, 300000000n],
  'bsdETH',
  'Based ETH',
  18,
  [1n, 7000000000000000000n],
]

const RewardsUpdater = () => {
  const account = useAtomValue(walletAtom)
  const stTokens = useAtomValue(accountStakingTokensAtom)
  const setRewards = useSetAtom(accountRewardsAtom)

  // const rewardsData = rewardsDataMock

  const { data: rewardsData } = useReadContracts({
    contracts: stTokens.map((stToken) => ({
      address: stToken.address,
      abi: dtfIndexStakingVaultAbi,
      functionName: 'getAllRewardTokens',
      chainId: ChainId.Base,
    })),
    allowFailure: false,
    query: { enabled: stTokens.length > 0 && !!account },
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

  const { data: rewardsPrices } = useAssetPrices(
    Object.values(rewardsMap).flat() || []
  )

  // const accruedRewards = accruedRewardsMock

  const { data: accruedRewards } = useReadContracts({
    contracts: Object.entries(rewardsMap).flatMap(([stToken, rewards]) =>
      rewards.flatMap((reward) => [
        {
          address: reward,
          abi: erc20Abi,
          functionName: 'symbol',
          chainId: ChainId.Base,
        },
        {
          address: reward,
          abi: erc20Abi,
          functionName: 'name',
          chainId: ChainId.Base,
        },
        {
          address: reward,
          abi: erc20Abi,
          functionName: 'decimals',
          chainId: ChainId.Base,
        },
        {
          address: stToken as Address,
          abi: dtfIndexStakingVaultAbi,
          functionName: 'userRewardTrackers',
          args: [reward, account!],
          chainId: ChainId.Base,
        },
      ])
    ),
    allowFailure: false,
    query: { enabled: Object.keys(rewardsMap).length > 0 && !!account },
  })

  useEffect(() => {
    if (accruedRewards !== undefined) {
      let currentIndex = 0
      const rewardsFinal = Object.entries(rewardsMap).map(
        ([stToken, rewardAddresses]) => {
          const rewards = rewardAddresses.map((rewardAddress) => {
            const decimals = accruedRewards?.[currentIndex++] as number
            const accrued = (
              accruedRewards?.[currentIndex++] as [bigint, bigint]
            )[1] as bigint
            const price = rewardsPrices?.find(
              (token) =>
                token.address.toLowerCase() === rewardAddress.toLowerCase()
            )?.price
            const accruedUSD =
              accrued && price
                ? Number(formatUnits(accrued, decimals)) * price
                : undefined

            return {
              address: rewardAddress,
              symbol: accruedRewards?.[currentIndex++] as string,
              name: accruedRewards?.[currentIndex++] as string,
              decimals,
              accrued,
              price,
              accruedUSD,
            }
          })
          return [stToken, rewards]
        }
      )

      setRewards(Object.fromEntries(rewardsFinal))
    }
  }, [accruedRewards, rewardsMap, setRewards, rewardsPrices])

  return null
}

export default RewardsUpdater
