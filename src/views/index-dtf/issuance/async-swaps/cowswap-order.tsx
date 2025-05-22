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
import { currentAsyncSwapTabAtom } from './atom'
import { useOrderStatus } from './hooks/useOrderStatus'

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
      {STATUS_MAP[status]}
      {STATUS_MAP[status] === 'Not Filled' && (
        <Help content="The order failed to fill. Please try again." size={16} />
      )}
      {STATUS_MAP[status] === 'Order Filled' && (
        <Link
          to={`https://explorer.cow.fi/base/orders/${orderId}`}
          target="_blank"
          className="p-1 bg-muted dark:bg-white/5 rounded-full text-gray-700 ml-1"
        >
          <ArrowUpRight size={16} />
        </Link>
      )}
      {STATUS_MAP[status] === 'Processing' && (
        <Loader size={16} className="animate-spin-slow" />
      )}
    </div>
  )
}

const CowSwapOrder = ({ orderId }: { orderId: string }) => {
  const { data } = useOrderStatus({ orderId })
  const tab = useAtomValue(currentAsyncSwapTabAtom)
  const indexDTFBasket = useAtomValue(indexDTFBasketAtom)

  if (!data) return null // TODO: Add a loading state

  return (
    <div
      className="flex items-center justify-between gap-2 border-b border-border py-4 last:border-b-0"
      key={data.buyToken}
    >
      <div className="flex items-center gap-2">
        <TokenLogo
          address={data.buyToken}
          symbol={
            indexDTFBasket?.find((token) => token.address === data.buyToken)
              ?.symbol || ''
          }
          size="xl"
        />
        <div className="flex flex-col">
          <div className="text-sm font-semibold">
            {tab === 'mint' ? '-' : '+'}{' '}
            {formatCurrency(Number(formatUnits(BigInt(data.sellAmount), 6)))}{' '}
            USDC
          </div>
          <div className="text-sm text-primary">
            {tab === 'mint' ? '+' : '-'}{' '}
            {formatTokenAmount(
              Number(
                formatUnits(
                  BigInt(data.buyAmount),
                  indexDTFBasket?.find(
                    (token) => token.address === data.buyToken
                  )?.decimals || 18
                )
              )
            )}{' '}
            {indexDTFBasket?.find((token) => token.address === data.buyToken)
              ?.symbol || ''}
          </div>
        </div>
      </div>
      <OrderStatus status={data.status} orderId={orderId} />
    </div>
  )
}

export default CowSwapOrder
