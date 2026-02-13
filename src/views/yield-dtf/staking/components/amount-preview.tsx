import TokenLogo from 'components/icons/TokenLogo'
import { formatCurrency } from 'utils'
import { cn } from '@/lib/utils'

interface AmountPreviewProps {
  title: string
  amount: number
  usdAmount: number
  symbol: string
  src?: string
  className?: string
}

const AmountPreview = ({
  title,
  amount,
  usdAmount,
  symbol,
  src,
  className,
}: AmountPreviewProps) => (
  <div className={cn('flex items-center', className)}>
    <TokenLogo symbol={symbol} width={24} src={src} />
    <div className="ml-3">
      <span className="text-legend">{title}</span>
      <div className="text-xl font-semibold">
        {formatCurrency(amount, 5)} {symbol}
      </div>
      <span className="text-legend">${formatCurrency(usdAmount, 2)}</span>
    </div>
  </div>
)

export default AmountPreview
