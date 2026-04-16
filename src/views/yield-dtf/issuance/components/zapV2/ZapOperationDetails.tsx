import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useZap } from './context/ZapContext'
import ZapDetails from './overview/ZapDetails'
import ZapQuoteSource from './overview/ZapQuoteSource'
import ZapRate from './overview/ZapRate'

const ZapOperationDetails = () => {
  const [collapsed, setCollapsed] = useState(true)
  const { amountIn, tokenIn, isExpensiveZap } = useZap()

  useEffect(() => {
    if (isExpensiveZap) {
      setCollapsed(false)
    }
  }, [tokenIn?.price, amountIn, setCollapsed, isExpensiveZap])

  return (
    <div>
      <div
        className="flex items-center cursor-pointer gap-1 py-4 pl-4 pr-3"
        onClick={(e) => {
          e.stopPropagation()
          setCollapsed((c) => !c)
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center flex-grow justify-between gap-2">
          <ZapRate />
          <ZapQuoteSource />
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
