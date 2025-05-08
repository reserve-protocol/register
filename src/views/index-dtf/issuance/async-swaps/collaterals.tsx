import TokenLogo from '@/components/token-logo'
import Help from '@/components/ui/help'
import { cn } from '@/lib/utils'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Check, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatUnits } from 'viem'
import { asyncSwapResponseAtom, collateralPanelOpenAtom } from './atom'

const STATUS_MAP = {
  open: 'Processing',
  scheduled: 'Processing',
  active: 'Processing',
  solved: 'Order Filled',
  executing: 'Processing',
  traded: 'Order Filled',
  cancelled: 'Not Filled',
}

const Collaterals = () => {
  const indexDTFBasket = useAtomValue(indexDTFBasketAtom)
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const open = useAtomValue(collateralPanelOpenAtom)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (asyncSwapResponse && open) {
      setShouldRender(true)
      setTimeout(() => setIsVisible(true), 0)
    } else {
      setIsVisible(false)
      setTimeout(() => setShouldRender(false), 300)
    }
  }, [asyncSwapResponse, open])

  if (!shouldRender) return null

  const { cowswapOrders = [] } = asyncSwapResponse || {}

  return (
    <div
      className={cn(
        'flex flex-col px-6 py-2 rounded-2xl overflow-y-auto max-h-[348px] min-h-[348px] border-l-4 border-secondary transition-all duration-300 ease-in-out',
        isVisible ? 'w-[400px]' : 'w-0'
      )}
    >
      {cowswapOrders.map(({ orderId, quote, status }) => (
        <div
          className="flex items-center justify-between gap-2 border-b border-border py-4 last:border-b-0"
          key={quote.buyToken}
        >
          <div className="flex items-center gap-2">
            <TokenLogo
              address={quote.buyToken}
              symbol={
                indexDTFBasket?.find(
                  (token) => token.address === quote.buyToken
                )?.symbol || ''
              }
              size="xl"
            />
            <div className="flex flex-col">
              <div className="text-sm font-semibold">
                -
                {formatCurrency(
                  Number(formatUnits(BigInt(quote.sellAmount), 6))
                )}{' '}
                USDC
              </div>
              <div className="text-sm text-primary">
                +
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
                {indexDTFBasket?.find(
                  (token) => token.address === quote.buyToken
                )?.symbol || ''}
              </div>
            </div>
          </div>
          <div
            className={cn(
              'text-sm font-light flex items-center gap-2',
              STATUS_MAP[status.type] === 'Not Filled' && 'text-[#D05A67]',
              STATUS_MAP[status.type] === 'Processing' &&
                'text-muted-foreground',
              STATUS_MAP[status.type] === 'Order Filled' && 'text-primary'
            )}
          >
            {STATUS_MAP[status.type] === 'Order Filled' && (
              <Check size={16} className="text-primary" />
            )}
            {STATUS_MAP[status.type]}
            {STATUS_MAP[status.type] === 'Not Filled' && (
              <Help
                content="The order failed to fill. Please try again."
                size={16}
              />
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
        </div>
      ))}
    </div>
  )
}

export default Collaterals
