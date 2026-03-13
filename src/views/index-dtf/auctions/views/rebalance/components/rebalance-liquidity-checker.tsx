import LiquidityBadge from '@/components/liquidity-badge'
import TokenLogo from '@/components/token-logo'
import Help from '@/components/ui/help'
import { chainIdAtom } from '@/state/atoms'
import { devModeAtom } from '@/state/chain/atoms/chainAtoms'
import { formatCurrency } from '@/utils'
import { LiquidityLevel } from '@/utils/liquidity'
import { SwapLeg, WRAPPED_NATIVE } from '@/utils/zapper'
import { useAtomValue } from 'jotai'
import useRebalanceLiquidityCheck, {
  TokenInfo,
  NATIVE_SYMBOL,
} from '../hooks/use-rebalance-liquidity-check'
import { rebalanceTokenMapAtom } from '../atoms'

type EnrichedToken = TokenInfo & {
  level: LiquidityLevel
  priceImpact?: number
  error?: string
  counterpart?: string
  swapPath?: SwapLeg[]
}

const LEVEL_SCORE: Record<LiquidityLevel, number> = {
  high: 1,
  medium: 0.5,
  unknown: 0.5,
  failed: 0.25,
  error: 0.25,
  insufficient: 0,
  low: 0,
}

const scoreToLevel = (score: number): LiquidityLevel => {
  if (score >= 0.75) return 'high'
  if (score >= 0.4) return 'medium'
  return 'low'
}

const getWeightedLevel = (
  tokens: EnrichedToken[]
): LiquidityLevel | undefined => {
  if (!tokens.length) return undefined
  const totalUsd = tokens.reduce((sum, t) => sum + t.usdSize, 0)
  if (totalUsd === 0) return undefined
  const weightedScore = tokens.reduce(
    (sum, t) => sum + LEVEL_SCORE[t.level] * t.usdSize,
    0
  ) / totalUsd
  return scoreToLevel(weightedScore)
}

const TokenRow = ({
  token,
  isLoading,
  symbolMap,
}: {
  token: EnrichedToken
  isLoading: boolean
  symbolMap: Record<string, string>
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const tokenData = tokenMap[token.tokenAddress]

  const counterpart = token.counterpart ?? NATIVE_SYMBOL[chainId] ?? 'WETH'
  const tradeDescription =
    token.priceImpact !== undefined
      ? token.type === 'surplus'
        ? `${token.priceImpact.toFixed(2)}% price impact selling $${formatCurrency(token.usdSize)} of ${token.tokenSymbol} for ${counterpart}`
        : `${token.priceImpact.toFixed(2)}% price impact buying $${formatCurrency(token.usdSize)} of ${token.tokenSymbol} with ${counterpart}`
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
        <LiquidityBadge
          level={token.level}
          priceImpact={token.priceImpact}
          isLoading={isLoading}
          error={token.error}
          tradeDescription={tradeDescription}
          swapPath={token.swapPath}
          chainId={chainId}
          symbolMap={symbolMap}
        />
      </div>
    </div>
  )
}

const TokenSection = ({
  label,
  tokens,
  isLoading,
  symbolMap,
}: {
  label: string
  tokens: EnrichedToken[]
  isLoading: boolean
  symbolMap: Record<string, string>
}) => {
  if (!tokens.length) return null

  return (
    <div>
      <p className="text-legend text-sm mb-1">{label}</p>
      {tokens.map((token) => (
        <TokenRow
          key={token.tokenAddress}
          token={token}
          isLoading={isLoading}
          symbolMap={symbolMap}
        />
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
  const chainId = useAtomValue(chainIdAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const { tokens, liquidityMap, isLoading, isFetching } =
    useRebalanceLiquidityCheck()

  const symbolMap: Record<string, string> = {}
  for (const [addr, token] of Object.entries(tokenMap)) {
    symbolMap[addr.toLowerCase()] = token.symbol
  }
  for (const [cid, addr] of Object.entries(WRAPPED_NATIVE)) {
    symbolMap[addr.toLowerCase()] = NATIVE_SYMBOL[Number(cid)] ?? 'WETH'
  }

  if (!tokens.length) return null

  const enriched: EnrichedToken[] = tokens.map((t) => {
    const liq = liquidityMap[t.tokenAddress]
    return {
      ...t,
      level: (liq?.liquidityLevel ?? 'unknown') as LiquidityLevel,
      priceImpact: liq?.priceImpact,
      error: liq?.error,
      counterpart: liq?.counterpart,
      swapPath: liq?.swapPath,
    }
  })

  const selling = enriched.filter((t) => t.type === 'surplus')
  const buying = enriched.filter((t) => t.type === 'deficit')
  const worstLevel = getWeightedLevel(enriched)

  return (
    <div className="bg-background rounded-3xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-legend text-sm font-medium">Liquidity</span>
        {worstLevel && !isLoading && <LiquidityBadge level={worstLevel} />}
        {isFetching && !isLoading && (
          <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
        )}
        <Help
          size={16}
          className="ml-auto text-legend flex items-center"
          content="Simulates swaps between surplus and deficit tokens via the zapper API to estimate price impact. Trades under $100 are simulated at $100 for reliable results. Summary badge is weighted by trade size."
        />
      </div>
      <TokenSection label="Selling" tokens={selling} isLoading={isLoading} symbolMap={symbolMap} />
      <TokenSection label="Buying" tokens={buying} isLoading={isLoading} symbolMap={symbolMap} />
    </div>
  )
}

export default RebalanceLiquidityChecker
