import TokenLogo from '@/components/token-logo'
import Help from '@/components/ui/help'
import { cn } from '@/lib/utils'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Check, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatUnits } from 'viem'
import { currentAsyncSwapTabAtom } from './atom'
import { AsyncSwapOrder } from './types'

const STATUS_MAP = {
  open: 'Processing',
  scheduled: 'Processing',
  active: 'Processing',
  solved: 'Order Filled',
  executing: 'Processing',
  traded: 'Order Filled',
  cancelled: 'Not Filled',
}

const OrderStatus = ({
  status,
  orderId,
}: {
  orderId: AsyncSwapOrder['orderId']
  status: AsyncSwapOrder['status']
}) => {
  return (
    <div
      className={cn(
        'text-sm font-light flex items-center gap-2',
        STATUS_MAP[status.type] === 'Not Filled' && 'text-[#D05A67]',
        STATUS_MAP[status.type] === 'Processing' && 'text-muted-foreground',
        STATUS_MAP[status.type] === 'Order Filled' && 'text-primary'
      )}
    >
      {STATUS_MAP[status.type] === 'Order Filled' && (
        <Check size={16} className="text-primary" />
      )}
      {STATUS_MAP[status.type]}
      {STATUS_MAP[status.type] === 'Not Filled' && (
        <Help content="The order failed to fill. Please try again." size={16} />
      )}
      {STATUS_MAP[status.type] === 'Order Filled' && (
        <Link
          to={`https://explorer.cow.fi/base/orders/${orderId}`}
          target="_blank"
          className="p-1 bg-muted dark:bg-white/5 rounded-full text-gray-700 ml-1"
        >
          <ArrowUpRight size={16} />
        </Link>
      )}
      {STATUS_MAP[status.type] === 'Processing' && (
        <Loader size={16} className="animate-spin-slow" />
      )}
    </div>
  )
}

const CowSwapOrder = ({
  order: { orderId, quote, status },
}: {
  order: AsyncSwapOrder
}) => {
  const tab = useAtomValue(currentAsyncSwapTabAtom)
  const indexDTFBasket = useAtomValue(indexDTFBasketAtom)

  return (
    <div
      className="flex items-center justify-between gap-2 border-b border-border py-4 last:border-b-0"
      key={quote.buyToken}
    >
      <div className="flex items-center gap-2">
        <TokenLogo
          address={quote.buyToken}
          symbol={
            indexDTFBasket?.find((token) => token.address === quote.buyToken)
              ?.symbol || ''
          }
          size="xl"
        />
        <div className="flex flex-col">
          <div className="text-sm font-semibold">
            {tab === 'mint' ? '-' : '+'}{' '}
            {formatCurrency(Number(formatUnits(BigInt(quote.sellAmount), 6)))}{' '}
            USDC
          </div>
          <div className="text-sm text-primary">
            {tab === 'mint' ? '+' : '-'}{' '}
            {formatTokenAmount(
              Number(
                formatUnits(
                  BigInt(quote.buyAmount),
                  indexDTFBasket?.find(
                    (token) => token.address === quote.buyToken
                  )?.decimals || 18
                )
              )
            )}{' '}
            {indexDTFBasket?.find((token) => token.address === quote.buyToken)
              ?.symbol || ''}
          </div>
        </div>
      </div>
      <OrderStatus status={status} orderId={orderId} />
    </div>
  )
}

export default CowSwapOrder
