import LiquidityBadge from '@/components/liquidity-badge'
import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { devModeAtom } from '@/state/chain/atoms/chainAtoms'
import { formatCurrency } from '@/utils'
import { LiquidityLevel } from '@/utils/liquidity'
import { useAtomValue } from 'jotai'
import { Droplet } from 'lucide-react'
import useRebalanceLiquidityCheck, {
  TokenInfo,
  NATIVE_SYMBOL,
} from '../hooks/use-rebalance-liquidity-check'
import { rebalanceTokenMapAtom } from '../atoms'

const LEVEL_PRIORITY: Record<LiquidityLevel, number> = {
  low: 0,
  insufficient: 1,
  error: 2,
  failed: 3,
  unknown: 4,
  medium: 5,
  high: 6,
}

const getWorstLevel = (
  levels: LiquidityLevel[]
): LiquidityLevel | undefined => {
  if (!levels.length) return undefined
  return levels.reduce((worst, level) =>
    LEVEL_PRIORITY[level] < LEVEL_PRIORITY[worst] ? level : worst
  )
}

const TokenRow = ({
  token,
  isLoading,
}: {
  token: TokenInfo & { level: LiquidityLevel; priceImpact?: number; error?: string }
  isLoading: boolean
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const tokenData = tokenMap[token.tokenAddress]

  const nativeSymbol = NATIVE_SYMBOL[chainId] ?? 'ETH'
  const tradeDescription =
    token.priceImpact !== undefined
      ? token.type === 'surplus'
        ? `${token.priceImpact.toFixed(2)}% price impact selling $${formatCurrency(token.usdSize)} of ${token.tokenSymbol} for ${nativeSymbol}`
        : `${token.priceImpact.toFixed(2)}% price impact buying $${formatCurrency(token.usdSize)} of ${token.tokenSymbol} with ${nativeSymbol}`
      : undefined

  return (
    <div className="flex items-center gap-2 py-1">
      <TokenLogo
        symbol={token.tokenSymbol}
        src={tokenData?.logoURI}
        address={token.tokenAddress}
        chain={chainId}
        size="xl"
      />
      <span className="font-medium text-sm">{token.tokenSymbol}</span>
      <span className="text-sm text-muted-foreground">
        ${formatCurrency(token.usdSize)}
      </span>
      <div className="ml-auto">
        {isLoading ? (
          <Skeleton className="h-5 w-12" />
        ) : (
          <LiquidityBadge
            level={token.level}
            priceImpact={token.priceImpact}
            error={token.error}
            tradeDescription={tradeDescription}
          />
        )}
      </div>
    </div>
  )
}

const TokenSection = ({
  label,
  tokens,
  isLoading,
}: {
  label: string
  tokens: (TokenInfo & { level: LiquidityLevel; priceImpact?: number; error?: string })[]
  isLoading: boolean
}) => {
  if (!tokens.length) return null

  return (
    <div>
      <p className="text-legend text-sm mb-1">{label}</p>
      {tokens.map((token) => (
        <TokenRow key={token.tokenAddress} token={token} isLoading={isLoading} />
      ))}
    </div>
  )
}

const RebalanceLiquidityChecker = () => {
  const isDevMode = useAtomValue(devModeAtom)

  if (!isDevMode) return null

  return <LiquidityCheckerContent />
}

const LiquidityCheckerContent = () => {
  const { tokens, liquidityMap, isLoading, isFetching } =
    useRebalanceLiquidityCheck()

  if (!tokens.length) return null

  const enriched = tokens.map((t) => {
    const liq = liquidityMap[t.tokenAddress]
    return {
      ...t,
      level: (liq?.liquidityLevel ?? 'unknown') as LiquidityLevel,
      priceImpact: liq?.priceImpact,
      error: liq?.error,
    }
  })

  const selling = enriched.filter((t) => t.type === 'surplus')
  const buying = enriched.filter((t) => t.type === 'deficit')

  const allLevels = enriched.map((t) => t.level)
  const worstLevel = getWorstLevel(allLevels)

  return (
    <div className="bg-background rounded-3xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Droplet size={16} className="text-muted-foreground" />
        <h4 className="font-semibold text-sm">Liquidity Check</h4>
        {worstLevel && !isLoading && (
          <LiquidityBadge level={worstLevel} />
        )}
        {isFetching && !isLoading && (
          <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
        )}
      </div>
      <TokenSection label="Selling" tokens={selling} isLoading={isLoading} />
      <TokenSection label="Buying" tokens={buying} isLoading={isLoading} />
    </div>
  )
}

export default RebalanceLiquidityChecker
