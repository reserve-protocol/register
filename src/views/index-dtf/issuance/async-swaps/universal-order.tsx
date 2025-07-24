import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Check } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { formatUnits } from 'viem'
import { operationAtom } from './atom'
import { UniversalOrder as UniversalOrderType } from './types'
import { getUniversalTokenAddress } from './providers/universal'

const UniversalOrder = ({ order }: { order: UniversalOrderType }) => {
  const operation = useAtomValue(operationAtom)
  const indexDTFBasket = useAtomValue(indexDTFBasketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { token, firstAmount, secondAmount } = useMemo(() => {
    const token = getUniversalTokenAddress(order?.token)
    return operation === 'redeem'
      ? {
          token,
          firstAmount: order?.token_amount,
          secondAmount: order?.pair_token_amount,
        }
      : {
          token,
          firstAmount: order?.token_amount,
          secondAmount: order?.pair_token_amount,
        }
  }, [order, operation])

  return (
    <div
      className="flex items-center justify-between gap-2 border-b border-border py-4 last:border-b-0"
      key={order.orderId}
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
      <div className="text-sm font-light flex items-center gap-2 text-primary">
        <Check size={16} className="text-primary" />
        Order Filled
        <Link
          to={getExplorerLink(
            order.transactionHash,
            chainId,
            ExplorerDataType.TRANSACTION
          )}
          target="_blank"
          className="p-1 bg-muted dark:bg-white/5 rounded-full text-gray-700 ml-1"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default UniversalOrder
