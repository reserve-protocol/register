import { formatCurrency } from '@/utils'
import { Skeleton } from '@/components/ui/skeleton'
import useRebalanceLiquidityCheck, {
  TokenInfo,
} from '../hooks/use-rebalance-liquidity-check'

const TokenImpactRow = ({
  token,
  priceImpact,
  isLoading,
}: {
  token: TokenInfo
  priceImpact: number | undefined
  isLoading: boolean
}) => (
  <div className="flex items-center gap-2">
    <span>{token.tokenSymbol}</span>
    <span>-</span>
    <span>${formatCurrency(token.usdSize)}</span>
    {isLoading ? (
      <Skeleton className="h-4 w-16" />
    ) : priceImpact !== undefined ? (
      <span className={priceImpact > 0 ? 'text-destructive' : 'text-primary'}>
        ({priceImpact > 0 ? '-' : '+'}
        {Math.abs(priceImpact).toFixed(2)}%)
      </span>
    ) : null}
  </div>
)

const RebalancePriceImpact = () => {
  const { tokens, liquidityMap, isLoading, isFetching } =
    useRebalanceLiquidityCheck()

  if (!tokens.length) return null

  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="flex items-center gap-2">
        <h4 className="text-primary text-xl">Price Impact</h4>
        {isFetching && !isLoading && (
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        )}
      </div>

      <div className="text-sm space-y-1 pl-2">
        {tokens.map((token) => (
          <TokenImpactRow
            key={token.tokenAddress}
            token={token}
            priceImpact={liquidityMap[token.tokenAddress]?.priceImpact}
            isLoading={
              isLoading ||
              (isFetching && !liquidityMap[token.tokenAddress])
            }
          />
        ))}
      </div>
    </div>
  )
}

export default RebalancePriceImpact
