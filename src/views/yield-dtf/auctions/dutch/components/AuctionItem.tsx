import CalculatorIcon from 'components/icons/CalculatorIcon'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChevronDown } from 'lucide-react'
import { formatCurrency } from 'utils'

const AuctionItem = ({
  title,
  icon,
  symbol,
  forSymbol,
  amount,
  price,
}: {
  title: string
  icon: any
  amount: number
  symbol: string
  forSymbol?: string
  price?: number
}) => (
  <div className="flex items-center">
    {icon}
    <div className="ml-2">
      <span className="text-xs block mb-1 text-legend">{title}</span>
      <span>
        {formatCurrency(amount, 5)} {symbol}
      </span>
    </div>
    {!!price && !!forSymbol && (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="ml-3 flex items-center cursor-pointer">
            <CalculatorIcon />
            <ChevronDown size={14} style={{ marginTop: -3 }} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {`1 ${forSymbol} = ${formatCurrency(price, 3)} ${symbol}`}
        </TooltipContent>
      </Tooltip>
    )}
  </div>
)

export default AuctionItem
