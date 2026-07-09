import SharedLiquidityBadge from '@/components/liquidity-badge'
import { LiquidityLevel } from '@/utils/liquidity'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { liquiditySimulationAmountAtom } from '../atoms'
import { getLiquidityCheckTokenSymbol } from '../hooks/use-liquidity-check'

interface LiquidityBadgeProps {
  level: LiquidityLevel
  priceImpact?: number
  tokenSymbol?: string
  chainId: number
  isLoading?: boolean
  error?: string
}

const formatAmount = (amount: number): string => {
  return amount >= 1000 ? `$${amount / 1000}k` : `$${amount}`
}

const LiquidityBadge = ({
  level,
  priceImpact,
  tokenSymbol,
  chainId,
  isLoading,
  error,
}: LiquidityBadgeProps) => {
  const { t } = useLingui()
  const simulationAmount = useAtomValue(liquiditySimulationAmountAtom)
  const inputTokenSymbol = getLiquidityCheckTokenSymbol(chainId)
  const amountLabel = formatAmount(simulationAmount)

  const priceImpactLabel =
    priceImpact !== undefined ? priceImpact.toFixed(2) : undefined
  const tradeDescription =
    priceImpactLabel !== undefined && tokenSymbol
      ? t`${priceImpactLabel}% price impact swapping ${amountLabel} ${inputTokenSymbol} for ${tokenSymbol}`
      : undefined

  return (
    <SharedLiquidityBadge
      level={level}
      priceImpact={priceImpact}
      isLoading={isLoading}
      error={error}
      tradeDescription={tradeDescription}
    />
  )
}

export default LiquidityBadge
