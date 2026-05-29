import LiquidityBadge from '@/components/liquidity-badge'
import OndoBadge, { ondoHasProblem } from '@/components/ondo-badge'
import TokenLogo from '@/components/token-logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Help from '@/components/ui/help'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { LiquidityLevel } from '@/utils/liquidity'
import { OndoInfo, OndoMarket } from '@/utils/rebalance-liquidity'
import { SwapLeg, WRAPPED_NATIVE } from '@/utils/zapper'
import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { AlertTriangle, RefreshCw } from 'lucide-react'
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
  ondo?: OndoInfo
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

const impactColor = (impact: number): string => {
  if (impact <= 0) return 'text-emerald-500'
  if (impact <= 3) return 'text-yellow-600'
  return 'text-destructive'
}

const TokenRow = ({
  token,
  isLoading,
  market,
  symbolMap,
  onRetry,
}: {
  token: EnrichedToken
  isLoading: boolean
  market: OndoMarket | null
  symbolMap: Record<string, string>
  onRetry: () => void
}) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const tokenData = tokenMap[token.tokenAddress]

  const impact = token.priceImpact?.toFixed(2)
  const usdSize = formatCurrency(token.usdSize)
  const tradeDescription = !token.counterpart
    ? t`Wrap/unwrap only — no swap needed`
    : token.priceImpact !== undefined
      ? token.type === 'surplus'
        ? t`${impact}% price impact selling $${usdSize} of ${token.tokenSymbol} for ${token.counterpart}`
        : t`${impact}% price impact buying $${usdSize} of ${token.tokenSymbol} with ${token.counterpart}`
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
      <div className="ml-auto flex items-center gap-2">
        {token.ondo ? (
          <OndoBadge ondo={token.ondo} market={market} amountUsd={token.usdSize} />
        ) : (
          <>
            {token.priceImpact !== undefined && (
              <span className={cn('text-sm font-medium', impactColor(token.priceImpact))}>
                {token.priceImpact.toFixed(2)}%
              </span>
            )}
            <LiquidityBadge
              level={token.level}
              priceImpact={token.priceImpact}
              isLoading={isLoading}
              error={token.error}
              tradeDescription={tradeDescription}
              swapPath={token.swapPath}
              chainId={chainId}
              symbolMap={symbolMap}
              onRetry={onRetry}
            />
          </>
        )}
      </div>
    </div>
  )
}

const TokenSection = ({
  label,
  tokens,
  isLoading,
  market,
  retryingTokens,
  symbolMap,
  onRetry,
}: {
  label: string
  tokens: EnrichedToken[]
  isLoading: boolean
  market: OndoMarket | null
  retryingTokens: Set<string>
  symbolMap: Record<string, string>
  onRetry: (address: string) => void
}) => {
  if (!tokens.length) return null

  return (
    <div>
      <p className="text-legend text-sm mb-1">{label}</p>
      {tokens.map((token) => (
        <TokenRow
          key={token.tokenAddress}
          token={token}
          isLoading={isLoading || retryingTokens.has(token.tokenAddress)}
          market={market}
          symbolMap={symbolMap}
          onRetry={() => onRetry(token.tokenAddress)}
        />
      ))}
    </div>
  )
}

const RebalanceLiquidityChecker = () => {
  const { t } = useLingui()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const { tokens, liquidityMap, ondoMap, market, isLoading, isFetching, retryingTokens, refetch, retryToken } =
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
      ondo: ondoMap[t.tokenAddress],
    }
  })

  const selling = enriched.filter((t) => t.type === 'surplus')
  const buying = enriched.filter((t) => t.type === 'deficit')
  // Ondo assets don't trade on a DEX — exclude them from the Zapper-weighted badge.
  const worstLevel = getWeightedLevel(enriched.filter((t) => !t.ondo))
  const ondoProblems = enriched.filter((t) => t.ondo && ondoHasProblem(t.ondo))

  const totalTradeValue = selling.reduce((sum, t) => sum + t.usdSize, 0)
  const totalSlippageDollars = enriched.reduce(
    (sum, t) => sum + ((t.priceImpact ?? 0) / 100) * t.usdSize,
    0
  )
  const aggregateImpact = totalTradeValue > 0
    ? (totalSlippageDollars / totalTradeValue) * 100
    : 0

  const highImpactTokens = enriched.filter(
    (t) => (t.priceImpact ?? 0) > 5
  )

  return (
    <div className="bg-background rounded-3xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-legend text-sm font-medium">
          <Trans>Liquidity</Trans>
        </span>
        {worstLevel && !isLoading && <LiquidityBadge level={worstLevel} />}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-legend hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
          </button>
          <Help
            size={16}
            className="text-legend flex items-center"
            content={t`Simulates swaps against the native token via the Zapper API to estimate price impact. Trades under $1 are simulated at $1 for reliable results. Summary badge is weighted by trade size.`}
          />
        </div>
      </div>
      {highImpactTokens.length > 0 && !isLoading && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            <Trans>High price impact</Trans>
          </AlertTitle>
          <AlertDescription>
            <Trans>
              {highImpactTokens.map((token) => token.tokenSymbol).join(', ')}{' '}
              <Plural
                value={highImpactTokens.length}
                one="has"
                other="have"
              />{' '}
              &gt;5% simulated price impact.
            </Trans>
            <br />
            <Trans>
              Estimated loss: ~${formatCurrency(totalSlippageDollars)}
            </Trans>
          </AlertDescription>
        </Alert>
      )}
      {ondoProblems.length > 0 && !isLoading && (
        <Alert variant="warning" className="rounded-xl bg-warning/10 border-warning/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ondo limits</AlertTitle>
          <AlertDescription>
            {ondoProblems.map((t) => t.tokenSymbol).join(', ')} — outside trading
            hours or larger than the max single Ondo trade. Oversized legs fill
            as multiple sequential trades.
          </AlertDescription>
        </Alert>
      )}
      <TokenSection label={t`Selling`} tokens={selling} isLoading={isLoading} market={market} retryingTokens={retryingTokens} symbolMap={symbolMap} onRetry={retryToken} />
      <TokenSection label={t`Buying`} tokens={buying} isLoading={isLoading} market={market} retryingTokens={retryingTokens} symbolMap={symbolMap} onRetry={retryToken} />
      {!isLoading && totalTradeValue > 0 && (
        <div className="flex flex-col gap-1 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Total trade value</Trans>
            </span>
            <span className="text-sm font-medium">${formatCurrency(totalTradeValue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              <Trans>Estimated total impact</Trans>
            </span>
            <span className={cn('text-sm font-bold', impactColor(aggregateImpact))}>
              {aggregateImpact.toFixed(2)}%{totalSlippageDollars > 0 && ` (~$${formatCurrency(totalSlippageDollars)})`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RebalanceLiquidityChecker
