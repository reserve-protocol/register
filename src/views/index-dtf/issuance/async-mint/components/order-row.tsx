import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { ChainId } from '@/utils/chains'
import { OrderStatus as CowSwapOrderStatus } from '@cowprotocol/cow-sdk'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Check, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatUnits } from 'viem'
import { useOrderStatus } from '../hooks/use-order-status'
import { inputTokenAtom, ordersAtom } from '../atoms'

// CoW explorer uses no prefix for mainnet, chain name for others
const COW_EXPLORER_NETWORK: Record<number, string> = {
  [ChainId.Mainnet]: '',
  [ChainId.Base]: 'base',
}

function getCowExplorerUrl(chainId: number, orderId: string) {
  const network = COW_EXPLORER_NETWORK[chainId] ?? 'base'
  const prefix = network ? `/${network}` : ''
  return `https://explorer.cow.fi${prefix}/orders/${orderId}`
}

const STATUS_MAP: Record<CowSwapOrderStatus, string> = {
  [CowSwapOrderStatus.PRESIGNATURE_PENDING]: 'Processing',
  [CowSwapOrderStatus.OPEN]: 'Processing',
  [CowSwapOrderStatus.FULFILLED]: 'Order Filled',
  [CowSwapOrderStatus.CANCELLED]: 'Not Filled',
  [CowSwapOrderStatus.EXPIRED]: 'Not Filled',
}

const OrderStatusIcon = ({ status }: { status: CowSwapOrderStatus }) => {
  const label = STATUS_MAP[status]

  if (label === 'Order Filled') {
    return <Check size={14} className="text-primary" />
  }

  if (label === 'Processing') {
    return <Loader size={14} className="animate-spin-slow" />
  }

  return null
}

const OrderStatusLine = ({ status }: { status: CowSwapOrderStatus }) => {
  const label = STATUS_MAP[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        label === 'Not Filled' && 'text-[#D05A67]',
        label === 'Processing' && 'text-muted-foreground',
        label === 'Order Filled' && 'text-primary'
      )}
    >
      <OrderStatusIcon status={status} />
      <span>{label}</span>
    </span>
  )
}

const OrderExplorerLink = ({
  status,
  orderId,
  chainId,
}: {
  status: CowSwapOrderStatus
  orderId: string
  chainId: number
}) => {
  return (
    <Link
      to={getCowExplorerUrl(chainId, orderId)}
      target="_blank"
      className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Open ${STATUS_MAP[status].toLowerCase()} order on CoW Explorer`}
    >
      <ArrowUpRight size={13} />
    </Link>
  )
}

const OrderRow = ({
  orderId,
  disableFetch,
}: {
  orderId: string
  disableFetch?: boolean
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const { data: fetchedOrder } = useOrderStatus({
    orderId,
    disabled: disableFetch,
  })
  const orders = useAtomValue(ordersAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const data = fetchedOrder ?? orders.find((order) => order.orderId === orderId)

  const token = data?.buyToken
  const buyAmount = data?.buyAmount
  const sellAmount = data?.sellAmount
  const tokenInfo = basket?.find(
    (t) => t.address.toLowerCase() === token?.toLowerCase()
  )
  const status = data?.status
  const isFilled = status === CowSwapOrderStatus.FULFILLED
  const isFailed =
    status === CowSwapOrderStatus.CANCELLED ||
    status === CowSwapOrderStatus.EXPIRED

  return (
    <div
      className={cn(
        '-mx-2 rounded-[18px] border px-4 py-3 transition-colors',
        isFilled && 'border-primary/35 bg-primary/5',
        isFailed && 'border-destructive/25 bg-destructive/5',
        !isFilled && !isFailed && 'border-border/70 bg-background'
      )}
    >
      <div className="flex items-center gap-4">
        <TokenLogoWithChain
          address={token}
          symbol={tokenInfo?.symbol || ''}
          chain={chainId}
          size="xl"
        />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-base truncate">
            {tokenInfo?.name || tokenInfo?.symbol || 'Collateral'}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-light truncate">
            {status ? (
              <OrderStatusLine status={status} />
            ) : (
              <Skeleton className="h-4 w-20" />
            )}
            <span className="truncate">
              · Buying {tokenInfo?.symbol || 'collateral'} with{' '}
              {inputToken.symbol}
            </span>
          </div>
        </div>
        <div className="min-w-[156px] text-right">
          <div className="text-base font-medium">
            {sellAmount ? (
              <>
                $
                {formatCurrency(
                  Number(formatUnits(BigInt(sellAmount), inputToken.decimals))
                )}
              </>
            ) : (
              <Skeleton className="ml-auto h-5 w-20" />
            )}
          </div>
          <div className="text-sm text-muted-foreground font-light">
            {buyAmount ? (
              <>
                {formatTokenAmount(
                  Number(
                    formatUnits(BigInt(buyAmount), tokenInfo?.decimals || 18)
                  )
                )}{' '}
                {tokenInfo?.symbol || ''}
              </>
            ) : (
              <Skeleton className="ml-auto mt-1 h-4 w-24" />
            )}
          </div>
        </div>
        <div className="flex w-6 shrink-0 justify-end">
          {status ? (
            <OrderExplorerLink
              status={status}
              orderId={orderId}
              chainId={chainId}
            />
          ) : (
            <Skeleton className="h-6 w-6 rounded-full" />
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderRow
