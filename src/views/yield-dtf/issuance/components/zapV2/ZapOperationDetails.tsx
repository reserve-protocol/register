import GasIcon from 'components/icons/GasIcon'
import { cn } from '@/lib/utils'
import { formatCurrency } from 'utils'
import { useZap } from './context/ZapContext'
import ZapRate from './overview/ZapRate'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ZapDetails from './overview/ZapDetails'

const ZapOperationDetails = () => {
  const [collapsed, setCollapsed] = useState(true)
  const { gasCost, amountIn, tokenIn, isExpensiveZap } = useZap()

  useEffect(() => {
    if (isExpensiveZap) {
      setCollapsed(false)
    }
  }, [tokenIn?.price, amountIn, setCollapsed, isExpensiveZap])

  return (
    <div>
      <div
        className="flex items-center cursor-pointer gap-1 pl-4 pr-3"
        onClick={(e) => {
          e.stopPropagation()
          setCollapsed((c) => !c)
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center flex-grow justify-between gap-2">
          <ZapRate />
          <div className="flex items-center gap-1">
            <GasIcon />
            <span>
              Estimated gas cost:{' '}
              <span className="font-bold">
                ${gasCost ? formatCurrency(+gasCost, 2) : 0}
              </span>
            </span>
          </div>
        </div>
        {collapsed ? (
          <ChevronDown fontSize={16} strokeWidth={1.2} />
        ) : (
          <ChevronUp fontSize={16} strokeWidth={1.2} />
        )}
      </div>
      <div
        className={cn(
          'overflow-hidden transition-[max-height]',
          collapsed
            ? 'max-h-0 duration-100 ease-in-out'
            : 'max-h-[1000px] duration-400 ease-in-out'
        )}
      >
        <ZapDetails className="mt-4 px-4" />
      </div>
    </div>
  )
}

export default ZapOperationDetails
