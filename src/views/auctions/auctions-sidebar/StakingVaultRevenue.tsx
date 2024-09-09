import { Box, Card, Text } from 'theme-ui'
import { formatCurrency, formatPercentage } from 'utils'
import RevenueOverviewHeader from './RevenueOverviewHeader'
import { erc20ABI, useContractReads } from 'wagmi'
import useRToken from 'hooks/useRToken'
import { RTOKEN_VAULT_STAKE } from 'utils/constants'
import StakingVault from 'abis/StakingVault'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { useAtomValue } from 'jotai'
import { estimatedApyAtom } from 'state/atoms'

const StakingVaultRevenue = () => {
  const rToken = useRToken()
  const rTokenAPY = useAtomValue(estimatedApyAtom)

  const rTokenVault = rToken?.address
    ? RTOKEN_VAULT_STAKE[rToken.address]
    : null

  const { data } = useContractReads({
    contracts: [
      {
        abi: StakingVault,
        address: rTokenVault?.address,
        functionName: 'rewardTracker',
        chainId: rToken?.chainId,
      },
      {
        abi: StakingVault,
        address: rTokenVault?.address,
        functionName: 'totalAssets',
        chainId: rToken?.chainId,
      },
      {
        abi: erc20ABI,
        address: rToken?.address,
        functionName: 'balanceOf',
        args: rTokenVault?.address ? [rTokenVault?.address] : [],
        chainId: rToken?.chainId,
      },
      {
        abi: erc20ABI,
        chainId: rToken?.chainId,
        address: rToken?.address,
        functionName: 'totalSupply',
      },
      {
        abi: erc20ABI,
        chainId: rToken?.chainId,
        address: rTokenVault?.address,
        functionName: 'totalSupply',
      },
    ],
    allowFailure: false,
    enabled: !!rTokenVault && !!rToken,
  })

  const avgAPY = useMemo(() => {
    if (!rTokenAPY || !data) return 0

    const [tokenSupply, stakeTokenSupply] = data.slice(-2) as bigint[]

    if (stakeTokenSupply === 0n) return 0

    return (
      (rTokenAPY.basket * 0.95 * +formatUnits(tokenSupply, 18)) /
      +formatUnits(stakeTokenSupply, 21)
    )
  }, [rTokenAPY, data])

  const [currentAPY, nextEpochAPY, currentPeriodEnds, neededToHitAvg] =
    useMemo(() => {
      if (!rToken || !rToken?.decimals || !data || !data?.[0])
        return [0, 0, '', 0]

      const [
        [rewardPeriodStart, rewardPeriodEnd, rewardsAmount],
        totalAssets,
        stakingTokenBalance,
      ] = data as [bigint[], bigint, bigint]

      const currentTime = Math.floor(new Date().getTime() / 1000)
      const rewards = +formatUnits(rewardsAmount, rToken.decimals)
      const rewardsStart = Number(rewardPeriodStart)
      const rewardsEnd = Number(rewardPeriodEnd)
      const assets = +formatUnits(totalAssets, rToken.decimals)
      const stBalance = +formatUnits(stakingTokenBalance, 18)

      const _currentAPY =
        rewardsEnd > currentTime
          ? (((rewards / assets) * 52 * 604_800) /
              (Number(rewardsEnd) - Number(rewardsStart))) *
            100
          : ((stBalance - assets) / (assets * 52)) * 100

      const currentAccountedRewards =
        currentTime >= rewardsEnd
          ? rewards
          : (rewards * (currentTime - rewardsStart)) /
            (rewardsEnd - rewardsStart)
      const futureAmt = stBalance + rewards - assets - currentAccountedRewards
      const _nextEpochAPY = (futureAmt / assets) * 52 * 100

      const _rewardsEnds = new Date(rewardsEnd * 1000).toLocaleDateString()

      const delta = avgAPY - _currentAPY
      const _neededToHitAvg = delta > 0 ? (delta * stBalance) / 52 : 0

      return [_currentAPY, _nextEpochAPY, _rewardsEnds, _neededToHitAvg]
    }, [data, rToken, avgAPY])

  if (!rToken || !rTokenVault) return null

  return (
    <>
      <RevenueOverviewHeader text="Staking vault revenue stats" />
      <Card
        p={0}
        sx={{
          border: '1px solid',
          borderColor: 'darkBorder',
          backgroundColor: 'backgroundNested',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 1,
          }}
          p={3}
        >
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 1, justifyContent: 'space-between' }}
          >
            <Text variant="legend">Current {rTokenVault.name} APY</Text>
            <Text>{formatPercentage(currentAPY)}</Text>
          </Box>
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 1, justifyContent: 'space-between' }}
          >
            <Text variant="legend">30d avg {rTokenVault.name} APY</Text>
            <Text>{formatPercentage(avgAPY)}</Text>
          </Box>

          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 1, justifyContent: 'space-between' }}
          >
            <Text variant="legend">
              Current staking yield for future period
            </Text>
            <Text>{formatPercentage(nextEpochAPY)}</Text>
          </Box>

          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 1, justifyContent: 'space-between' }}
          >
            <Text variant="legend">Current reward period ends</Text>
            <Text>{currentPeriodEnds}</Text>
          </Box>

          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 1, justifyContent: 'space-between' }}
          >
            <Text variant="legend">
              How much {rToken.symbol} is needed to hit the 30d avg
            </Text>
            <Text>{formatCurrency(neededToHitAvg)}</Text>
          </Box>
        </Box>
      </Card>
    </>
  )
}

export default StakingVaultRevenue
