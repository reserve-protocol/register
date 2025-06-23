import TokenLogo from '@/components/token-logo'
import Help from '@/components/ui/help'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Check, Loader } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { formatUnits } from 'viem'
import { operationAtom } from './atom'
import {
  UniversalOrderStatus,
  useUniversalOrder,
} from './hooks/useUniversalOrder'

const STATUS_MAP: Record<UniversalOrderStatus, string> = {
  [UniversalOrderStatus.PENDING]: 'Processing',
  [UniversalOrderStatus.SUCCESS]: 'Order Filled',
  [UniversalOrderStatus.FAILED]: 'Not Filled',
}

const OrderStatus = ({
  status,
  hash,
}: {
  status: UniversalOrderStatus
  hash: string
}) => {
  const chainId = useAtomValue(chainIdAtom)

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
      {STATUS_MAP[status]}
      {STATUS_MAP[status] === 'Not Filled' && (
        <Help content="The order failed to fill. Please try again." size={16} />
      )}
      <Link
        to={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
        target="_blank"
        className="p-1 bg-muted dark:bg-white/5 rounded-full text-gray-700 ml-1"
      >
        <ArrowUpRight size={16} />
      </Link>
    </div>
  )
}

const UniversalOrder = ({ orderId }: { orderId: string }) => {
  const { data } = useUniversalOrder({ orderId })
  const operation = useAtomValue(operationAtom)
  const indexDTFBasket = useAtomValue(indexDTFBasketAtom)

  const { token, firstAmount, secondAmount } = useMemo(() => {
    return operation === 'redeem'
      ? {
          token: data?.token,
          firstAmount: data?.token_amount,
          secondAmount: data?.pair_token_amount,
        }
      : {
          token: data?.pair_token,
          firstAmount: data?.pair_token_amount,
          secondAmount: data?.token_amount,
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
        <OrderStatus
          status={data.status as UniversalOrderStatus}
          hash={data.transaction_hash}
        />
      ) : (
        <Skeleton className="w-28 h-4" />
      )}
    </div>
  )
}

export default UniversalOrder
