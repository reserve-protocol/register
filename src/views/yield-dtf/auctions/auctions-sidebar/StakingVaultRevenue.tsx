import StakingVault from 'abis/StakingVault'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Help from 'components/help'
import { Loader2 } from 'lucide-react'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { estimatedApyAtom } from 'state/atoms'
import { formatCurrency, formatPercentage } from 'utils'
import { RTOKEN_VAULT_STAKE } from 'utils/constants'
import { erc20Abi, formatUnits } from 'viem'
import RevenueOverviewHeader from './RevenueOverviewHeader'
import { useReadContracts } from 'wagmi'

const StakingVaultRevenue = () => {
  const rToken = useRToken()
  const rTokenAPY = useAtomValue(estimatedApyAtom)

  const rTokenVault = rToken?.address
    ? RTOKEN_VAULT_STAKE[rToken.address]
    : null

  const { data } = useReadContracts({
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
        abi: erc20Abi,
        address: rToken?.address,
        functionName: 'balanceOf',
        args: rTokenVault?.address ? [rTokenVault.address] : undefined,
        chainId: rToken?.chainId,
      },
      {
        abi: erc20Abi,
        chainId: rToken?.chainId,
        address: rToken?.address,
        functionName: 'totalSupply',
      },
      {
        abi: erc20Abi,
        chainId: rToken?.chainId,
        address: rTokenVault?.address,
        functionName: 'totalSupply',
      },
    ],
    allowFailure: false,
    query: { enabled: !!rTokenVault && !!rToken },
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

  const [
    currentAPY,
    nextPeriodAPY,
    currentPeriodEnds,
    neededToHitAvg,
    showNudgeButton,
  ] = useMemo(() => {
    if (!rToken || !rToken?.decimals || !data || !data?.[0])
      return [0, 0, '', 0, false]

    const [
      [rewardPeriodStart, rewardPeriodEnd, rewardsAmount],
      totalAssets,
      stakingTokenBalance,
    ] = data as [
      readonly [bigint, bigint, bigint],
      bigint,
      bigint,
      bigint,
      bigint,
    ]

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
        : (rewards * (currentTime - rewardsStart)) / (rewardsEnd - rewardsStart)
    const futureAmt = stBalance + currentAccountedRewards - rewards - assets

    const _nextPeriodAPY = (futureAmt / (stBalance - futureAmt || 1)) * 52 * 100

    const _rewardsEnds = new Date(rewardsEnd * 1000).toLocaleString()

    const delta = (avgAPY - _nextPeriodAPY) / 100
    const _neededToHitAvg = delta > 0 ? (delta * stBalance) / 52 : 0

    const _showNudgeButton = rewardsEnd < currentTime

    return [
      _currentAPY,
      _nextPeriodAPY,
      _rewardsEnds,
      _neededToHitAvg,
      _showNudgeButton,
    ]
  }, [data, rToken, avgAPY])

  const { write, isLoading } = useContractWrite({
    abi: StakingVault,
    address: rTokenVault?.address,
    functionName: 'addRewards',
    args: [0n],
  })

  if (!rToken || !rTokenVault) return null

  return (
    <>
      <RevenueOverviewHeader text="Staking vault revenue stats" />
      <Card className="p-0 border border-border bg-muted">
        <div className="flex flex-col w-full gap-1 p-4">
          <div className="flex items-center gap-1 justify-between">
            <span className="text-legend">Current {rTokenVault.name} APY</span>
            <span className="font-bold">{formatPercentage(currentAPY)}</span>
          </div>
          <div className="flex items-center gap-1 justify-between">
            <span className="text-legend">30d avg {rTokenVault.name} APY</span>
            <span className="font-bold">{formatPercentage(avgAPY)}</span>
          </div>

          <div className="flex items-center gap-1 justify-between">
            <span className="text-legend">Current reward period ends</span>
            <span className="font-bold">{currentPeriodEnds}</span>
          </div>

          <Separator />

          <div className="flex items-center gap-1 justify-between">
            <span className="text-legend">Future sdgnETH APY (next period)</span>
            <span className="font-bold">{formatPercentage(nextPeriodAPY)}</span>
          </div>

          <div className="flex items-center gap-1 justify-between">
            <div className="flex items-center gap-1">
              <span className="text-legend">Delta from 30d avg</span>
              <Help
                content={`How much ${rToken.symbol} is needed to hit the 30d avg`}
              />
            </div>
            <span className="font-bold">{`${formatCurrency(
              neededToHitAvg
            )} ${rToken.symbol}`}</span>
          </div>

          <Button
            className="mt-4 py-2 w-full"
            disabled={!showNudgeButton || isLoading}
            onClick={() => write?.()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <div className="flex items-center justify-center gap-1">
              <span>Nudge</span>
              <Help
                content={`Starts the next ${rTokenVault.name} reward period once the current one ends. Disabled until then.`}
                placement="bottom"
              />
            </div>
          </Button>
        </div>
      </Card>
    </>
  )
}

export default StakingVaultRevenue
