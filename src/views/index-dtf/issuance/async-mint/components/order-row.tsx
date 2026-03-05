import TokenLogo from '@/components/token-logo'
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
import { inputTokenAtom } from '../atoms'

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

const OrderStatusBadge = ({
  status,
  orderId,
  chainId,
}: {
  status: CowSwapOrderStatus
  orderId: string
  chainId: number
}) => {
  const label = STATUS_MAP[status]
  return (
    <div
      className={cn(
        'text-sm font-light flex items-center gap-2',
        label === 'Not Filled' && 'text-[#D05A67]',
        label === 'Processing' && 'text-muted-foreground',
        label === 'Order Filled' && 'text-primary'
      )}
    >
      {label === 'Order Filled' && <Check size={16} className="text-primary" />}
      {label === 'Processing' && (
        <Loader size={16} className="animate-spin-slow" />
      )}
      <span>{label}</span>
      <Link
        to={getCowExplorerUrl(chainId, orderId)}
        target="_blank"
        className="p-1 bg-muted dark:bg-white/5 rounded-full text-gray-700 ml-1"
      >
        <ArrowUpRight size={16} />
      </Link>
    </div>
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
  const { data } = useOrderStatus({ orderId, disabled: disableFetch })
  const basket = useAtomValue(indexDTFBasketAtom)
  const inputToken = useAtomValue(inputTokenAtom)

  const token = data?.buyToken
  const buyAmount = data?.buyAmount
  const sellAmount = data?.sellAmount
  const tokenInfo = basket?.find((t) => t.address === token)

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border py-3 last:border-b-0">
      <div className="flex items-center gap-2">
        <TokenLogo
          address={token}
          symbol={tokenInfo?.symbol || ''}
          chain={chainId}
          size="lg"
        />
        <div className="flex flex-col">
          {sellAmount ? (
            <div className="text-sm font-semibold">
              - {formatCurrency(Number(formatUnits(BigInt(sellAmount), inputToken.decimals)))} {inputToken.symbol}
            </div>
          ) : (
            <Skeleton className="w-24 h-3 mb-1" />
          )}
          {buyAmount ? (
            <div className="text-sm text-primary">
              +{' '}
              {formatTokenAmount(
                Number(formatUnits(BigInt(buyAmount), tokenInfo?.decimals || 18))
              )}{' '}
              {tokenInfo?.symbol || ''}
            </div>
          ) : (
            <Skeleton className="w-24 h-3" />
          )}
        </div>
      </div>
      {data?.status ? (
        <OrderStatusBadge status={data.status} orderId={orderId} chainId={chainId} />
      ) : (
        <Skeleton className="w-28 h-4" />
      )}
    </div>
  )
}

export default OrderRow
