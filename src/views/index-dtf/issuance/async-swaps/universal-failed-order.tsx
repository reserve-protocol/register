import TokenLogo from '@/components/token-logo'
import Help from '@/components/ui/help'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Quote } from 'universal-sdk'
import { formatUnits } from 'viem'
import { operationAtom } from './atom'
import { getUniversalTokenAddress } from './providers/universal'

const UniversalFailedOrder = ({ quote }: { quote: Quote }) => {
  const operation = useAtomValue(operationAtom)
  const indexDTFBasket = useAtomValue(indexDTFBasketAtom)

  const { token, firstAmount, secondAmount } = useMemo(() => {
    return operation === 'redeem'
      ? {
          token: quote?.pair_token,
          firstAmount: quote?.token_amount,
          secondAmount: quote?.pair_token_amount,
        }
      : {
          token: getUniversalTokenAddress(quote?.token),
          firstAmount: quote?.token_amount,
          secondAmount: quote?.pair_token_amount,
        }
  }, [quote, operation])

  return (
    <div
      className="flex items-center justify-between gap-2 border-b border-border py-4 last:border-b-0"
      key={quote.id}
    >
      <div className="flex items-center gap-2">
        <TokenLogo
          address={token}
          symbol={
            indexDTFBasket?.find((t) => t.address === token)?.symbol || ''
          }
          size="xl"
        />
        <div className="flex flex-col">
          {secondAmount ? (
            <div className="text-sm font-semibold">
              {operation === 'mint' ? '-' : '+'}{' '}
              {formatCurrency(Number(formatUnits(BigInt(secondAmount), 6)))}{' '}
              USDC
            </div>
          ) : (
            <Skeleton className="w-24 h-3 mb-1" />
          )}
          {firstAmount ? (
            <div className="text-sm text-primary">
              {operation === 'mint' ? '+' : '-'}{' '}
              {formatTokenAmount(
                Number(
                  formatUnits(
                    BigInt(firstAmount),
                    indexDTFBasket?.find((t) => t.address === token)
                      ?.decimals || 18
                  )
                )
              )}{' '}
              {indexDTFBasket?.find((t) => t.address === token)?.symbol || ''}
            </div>
          ) : (
            <Skeleton className="w-24 h-3" />
          )}
        </div>
      </div>
      <div className="text-sm font-light flex items-center gap-2 text-[#D05A67]">
        Not Filled
        <Help content="The order failed to fill. Please try again." size={16} />
      </div>
    </div>
  )
}

export default UniversalFailedOrder
