import SharedLiquidityBadge from '@/components/liquidity-badge'
import { LiquidityLevel } from '@/utils/liquidity'
import { NATIVE_SYMBOL } from '@/utils/zapper'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { liquiditySimulationAmountAtom } from '../atoms'

interface LiquidityBadgeProps {
  level: LiquidityLevel
  priceImpact?: number
  tokenSymbol?: string
  counterpart?: string
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
  counterpart,
  chainId,
  isLoading,
  error,
}: LiquidityBadgeProps) => {
  const { t } = useLingui()
  const simulationAmount = useAtomValue(liquiditySimulationAmountAtom)
  const inputTokenSymbol = counterpart ?? NATIVE_SYMBOL[chainId]
  const amountLabel = formatAmount(simulationAmount)

  // Other levels carry a placeholder priceImpact of 0
  const measuredImpact =
    level === 'high' || level === 'medium' || level === 'low'
      ? priceImpact
      : undefined
  const priceImpactLabel =
    measuredImpact !== undefined ? measuredImpact.toFixed(2) : undefined
  const tradeDescription =
    priceImpactLabel !== undefined && tokenSymbol
      ? t`${priceImpactLabel}% price impact swapping ${amountLabel} ${inputTokenSymbol} for ${tokenSymbol}`
      : undefined

  return (
    <SharedLiquidityBadge
      level={level}
      priceImpact={measuredImpact}
      isLoading={isLoading}
      error={error}
      tradeDescription={tradeDescription}
    />
  )
}

export default LiquidityBadge
