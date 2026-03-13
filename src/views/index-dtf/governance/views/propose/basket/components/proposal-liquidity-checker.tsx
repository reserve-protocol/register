import LiquidityBadge from '@/components/liquidity-badge'
import TokenLogo from '@/components/token-logo'
import Help from '@/components/ui/help'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { devModeAtom } from '@/state/chain/atoms/chainAtoms'
import { formatCurrency } from '@/utils'
import { LiquidityLevel } from '@/utils/liquidity'
import { NATIVE_SYMBOL } from '@/utils/zapper'
import { useAtomValue } from 'jotai'
import { AlertTriangle } from 'lucide-react'
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

const TokenRow = ({
  token,
  isLoading,
}: {
  token: EnrichedToken
  isLoading: boolean
}) => {
  const chainId = useAtomValue(chainIdAtom)

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
        src={token.logoURI}
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
  tokens: EnrichedToken[]
  isLoading: boolean
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
        />
      ))}
    </div>
  )
}

const UnsupportedTokensWarning = ({
  unsupportedTokens,
  basket,
}: {
  unsupportedTokens: Set<string>
  basket: Record<string, { token: { symbol: string } }> | undefined
}) => {
  if (!unsupportedTokens.size) return null

  const symbols = Array.from(unsupportedTokens).map((addr) => {
    const entry = basket?.[addr] ?? basket?.[addr.toLowerCase()]
    return entry?.token.symbol ?? addr.slice(0, 10)
  })

  return (
    <div className="flex items-start gap-2 p-2 rounded-xl bg-yellow-500/10 text-yellow-700 text-sm">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>
        Not supported by zapper: <strong>{symbols.join(', ')}</strong>
      </span>
    </div>
  )
}

const ProposalLiquidityChecker = () => {
  const isDevMode = useAtomValue(devModeAtom)

  if (!isDevMode) return null

  return <LiquidityCheckerContent />
}

const LiquidityCheckerContent = () => {
  const { tokens, liquidityMap, unsupportedTokens, isLoading, isFetching } =
    useProposalLiquidityCheck()
  const basket = useAtomValue(proposedIndexBasketAtom)

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
    }
  })

  const selling = enriched.filter((t) => t.type === 'surplus')
  const buying = enriched.filter((t) => t.type === 'deficit')
  const worstLevel = getWeightedLevel(enriched)

  return (
    <div className="bg-background rounded-3xl p-4 flex flex-col gap-3 border-4 border-secondary">
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
      <UnsupportedTokensWarning
        unsupportedTokens={unsupportedTokens}
        basket={basket}
      />
      <TokenSection label="Selling" tokens={selling} isLoading={isLoading} />
      <TokenSection label="Buying" tokens={buying} isLoading={isLoading} />
    </div>
  )
}

export default ProposalLiquidityChecker
