import TokenLogo from '@/components/token-logo'
import Help from '@/components/ui/help'
import { cn } from '@/lib/utils'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { OrderStatus as CowSwapOrderStatus } from '@cowprotocol/cow-sdk'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Check, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatUnits } from 'viem'
import { operationAtom } from './atom'
import { useOrderStatus } from './hooks/useOrderStatus'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemo } from 'react'

const STATUS_MAP: Record<CowSwapOrderStatus, string> = {
  [CowSwapOrderStatus.PRESIGNATURE_PENDING]: 'Processing',
  [CowSwapOrderStatus.OPEN]: 'Processing',
  [CowSwapOrderStatus.FULFILLED]: 'Order Filled',
  [CowSwapOrderStatus.CANCELLED]: 'Not Filled',
  [CowSwapOrderStatus.EXPIRED]: 'Not Filled',
}

const OrderStatus = ({
  status,
  orderId,
}: {
  orderId: string
  status: CowSwapOrderStatus
}) => {
  return (
    <div
      className={cn(
        'text-sm font-light flex items-center gap-2',
        STATUS_MAP[status] === 'Not Filled' && 'text-[#D05A67]',
        STATUS_MAP[status] === 'Processing' && 'text-muted-foreground',
        STATUS_MAP[status] === 'Order Filled' && 'text-primary'
      )}
    >
      {STATUS_MAP[status] === 'Order Filled' && (
        <Check size={16} className="text-primary" />
      )}
      {STATUS_MAP[status] === 'Processing' && (
        <Loader size={16} className="animate-spin-slow" />
      )}
      <div className="flex flex-col items-end">{STATUS_MAP[status]}</div>
      {STATUS_MAP[status] === 'Not Filled' && (
        <Help content="The order failed to fill. Please try again." size={16} />
      )}
      <Link
        to={`https://explorer.cow.fi/base/orders/${orderId}`}
        target="_blank"
        className="p-1 bg-muted dark:bg-white/5 rounded-full text-gray-700 ml-1"
      >
        <ArrowUpRight size={16} />
      </Link>
    </div>
  )
}

const CowSwapOrder = ({
  orderId,
  disableFetch,
}: {
  orderId: string
  disableFetch?: boolean
}) => {
  const { data } = useOrderStatus({ orderId, disabled: disableFetch })
  const operation = useAtomValue(operationAtom)
  const indexDTFBasket = useAtomValue(indexDTFBasketAtom)

  const { token, firstAmount, secondAmount } = useMemo(() => {
    return operation === 'redeem'
      ? {
          token: data?.sellToken,
          firstAmount: data?.sellAmount,
          secondAmount: data?.buyAmount,
        }
      : {
          token: data?.buyToken,
          firstAmount: data?.buyAmount,
          secondAmount: data?.sellAmount,
        }
  }, [data, operation])

  return (
    <div
      className="flex items-center justify-between gap-2 border-b border-border py-4 last:border-b-0"
      key={orderId}
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
      {data?.status ? (
        <OrderStatus status={data.status} orderId={orderId} />
      ) : (
        <Skeleton className="w-28 h-4" />
      )}
    </div>
  )
}

export default CowSwapOrder
