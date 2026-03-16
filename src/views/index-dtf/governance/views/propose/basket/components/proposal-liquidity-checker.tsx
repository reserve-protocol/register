import LiquidityBadge from '@/components/liquidity-badge'
import TokenLogo from '@/components/token-logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Help from '@/components/ui/help'
import { chainIdAtom } from '@/state/atoms'
import { devModeAtom } from '@/state/chain/atoms/chainAtoms'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import {
  ExplorerDataType,
  getExplorerLink,
} from '@/utils/getExplorerLink'
import { LiquidityLevel } from '@/utils/liquidity'
import { NATIVE_SYMBOL, WRAPPED_NATIVE, SwapLeg } from '@/utils/zapper'
import { useAtomValue } from 'jotai'
import { AlertTriangle, ArrowUpRight, RefreshCw } from 'lucide-react'
import useProposalLiquidityCheck, {
  TokenInfo,
} from '../hooks/use-proposal-liquidity-check'
import { proposedIndexBasketAtom } from '../atoms'

type EnrichedToken = TokenInfo & {
  level: LiquidityLevel
  priceImpact?: number
  error?: string
  counterpart?: string
  logoURI?: string
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
  const weightedScore =
    tokens.reduce((sum, t) => sum + LEVEL_SCORE[t.level] * t.usdSize, 0) /
    totalUsd
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
  symbolMap,
  onRetry,
}: {
  token: EnrichedToken
  isLoading: boolean
  symbolMap: Record<string, string>
  onRetry: () => void
}) => {
  const chainId = useAtomValue(chainIdAtom)

  const tradeDescription = !token.counterpart
    ? 'Wrap/unwrap only — no swap needed'
    : token.priceImpact !== undefined
      ? token.type === 'surplus'
        ? `${token.priceImpact.toFixed(2)}% price impact selling $${formatCurrency(token.usdSize)} of ${token.tokenSymbol} for ${token.counterpart}`
        : `${token.priceImpact.toFixed(2)}% price impact buying $${formatCurrency(token.usdSize)} of ${token.tokenSymbol} with ${token.counterpart}`
      : undefined

  return (
    <div className="flex items-center gap-2 py-1">
      <TokenLogo
        symbol={token.tokenSymbol}
        src={token.logoURI}
        address={token.tokenAddress}
        chain={chainId}
        size="xl"
      />
      <span className="font-medium text-sm">{token.tokenSymbol}</span>
      <span className="text-sm text-muted-foreground">
        ${formatCurrency(token.usdSize)}
      </span>
      <div className="ml-auto flex items-center gap-2">
        {token.priceImpact !== undefined && token.priceImpact > 0 && (
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
      </div>
    </div>
  )
}

const TokenSection = ({
  label,
  tokens,
  isLoading,
  retryingTokens,
  symbolMap,
  onRetry,
}: {
  label: string
  tokens: EnrichedToken[]
  isLoading: boolean
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
          symbolMap={symbolMap}
          onRetry={() => onRetry(token.tokenAddress)}
        />
      ))}
    </div>
  )
}

const UnsupportedTokensWarning = ({
  unsupportedTokens,
  basket,
  chainId,
}: {
  unsupportedTokens: Set<string>
  basket: Record<string, { token: { symbol: string } }> | undefined
  chainId: number
}) => {
  if (!unsupportedTokens.size) return null

  const tokens = Array.from(unsupportedTokens).map((addr) => {
    const entry = basket?.[addr] ?? basket?.[addr.toLowerCase()]
    return { symbol: entry?.token.symbol ?? addr.slice(0, 10), address: addr }
  })

  return (
    <Alert
      variant="warning"
      className="rounded-xl bg-warning/10 border-warning/20"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Tokens not available</AlertTitle>
      <AlertDescription>
        <ul className="mt-1 list-disc pl-4 space-y-0.5">
          {tokens.map((t) => (
            <li key={t.address}>
              <span className="font-medium">{t.symbol}</span>{' '}
              <a
                href={getExplorerLink(
                  t.address,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-mono text-xs hover:text-foreground"
              >
                {t.address.slice(0, 6)}...{t.address.slice(-4)}
                <ArrowUpRight size={12} strokeWidth={1.5} />
              </a>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

const ProposalLiquidityChecker = () => {
  const isDevMode = useAtomValue(devModeAtom)

  if (!isDevMode) return null

  return <LiquidityCheckerContent />
}

const LiquidityCheckerContent = () => {
  const chainId = useAtomValue(chainIdAtom)
  const { tokens, liquidityMap, unsupportedTokens, isLoading, isFetching, retryingTokens, refetch, retryToken } =
    useProposalLiquidityCheck()
  const basket = useAtomValue(proposedIndexBasketAtom)

  const symbolMap: Record<string, string> = {}
  if (basket) {
    for (const [addr, asset] of Object.entries(basket)) {
      symbolMap[addr.toLowerCase()] = asset.token.symbol
    }
  }
  for (const [cid, addr] of Object.entries(WRAPPED_NATIVE)) {
    symbolMap[addr.toLowerCase()] = NATIVE_SYMBOL[Number(cid)] ?? 'WETH'
  }

  if (!tokens.length) return null

  const enriched: EnrichedToken[] = tokens.map((t) => {
    const liq = liquidityMap[t.tokenAddress]
    const entry = basket?.[t.tokenAddress] ?? basket?.[t.tokenAddress.toLowerCase()]
    return {
      ...t,
      level: (liq?.liquidityLevel ?? 'unknown') as LiquidityLevel,
      priceImpact: liq?.priceImpact,
      error: liq?.error,
      counterpart: liq?.counterpart,
      logoURI: entry?.token.logoURI,
      swapPath: liq?.swapPath,
    }
  })

  const selling = enriched.filter((t) => t.type === 'surplus')
  const buying = enriched.filter((t) => t.type === 'deficit')
  const worstLevel = getWeightedLevel(enriched)

  const totalTradeValue = enriched.reduce((sum, t) => sum + t.usdSize, 0)
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
    <div className="bg-background rounded-3xl p-4 flex flex-col gap-3 border-4 border-secondary">
      <div className="flex items-center gap-2">
        <span className="text-legend text-sm font-medium">Liquidity</span>
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
            content="Simulates swaps against the native token via the Zapper API to estimate price impact. Trades under $1 are simulated at $1 for reliable results. Summary badge is weighted by trade size."
          />
        </div>
      </div>
      {highImpactTokens.length > 0 && !isLoading && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High price impact</AlertTitle>
          <AlertDescription>
            {highImpactTokens.map((t) => t.tokenSymbol).join(', ')}{' '}
            {highImpactTokens.length === 1 ? 'has' : 'have'} &gt;5% simulated
            price impact.
            <br />
            Estimated loss: ~${formatCurrency(totalSlippageDollars)}
          </AlertDescription>
        </Alert>
      )}
      <UnsupportedTokensWarning
        unsupportedTokens={unsupportedTokens}
        basket={basket}
        chainId={chainId}
      />
      <TokenSection label="Selling" tokens={selling} isLoading={isLoading} retryingTokens={retryingTokens} symbolMap={symbolMap} onRetry={retryToken} />
      <TokenSection label="Buying" tokens={buying} isLoading={isLoading} retryingTokens={retryingTokens} symbolMap={symbolMap} onRetry={retryToken} />
      {!isLoading && totalTradeValue > 0 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">Estimated total impact</span>
          <span className={cn('text-sm font-bold', impactColor(aggregateImpact))}>
            {aggregateImpact.toFixed(2)}%{totalSlippageDollars > 0 && ` (~$${formatCurrency(totalSlippageDollars)})`}
          </span>
        </div>
      )}
    </div>
  )
}

export default ProposalLiquidityChecker
