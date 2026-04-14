import Help from 'components/help'
import TokenLogo from 'components/icons/TokenLogo'
import { formatCurrency } from 'utils'
import { cn } from '@/lib/utils'

interface Props {
  symbol?: string
  balance: number
  usd?: boolean
  logoSrc?: string
  title?: string
  icon?: React.ReactNode
  help?: string
  className?: string
}

const TokenBalance = ({
  symbol = '',
  title,
  balance,
  usd = false,
  logoSrc,
  icon,
  help,
  className,
}: Props) => (
  <div className={cn('flex items-center', className)}>
    {icon || <TokenLogo width={20} src={logoSrc} symbol={symbol} />}
    <div className="ml-2">
      <div className="flex items-center">
        <span className="text-sm text-legend">{title || symbol}</span>
        {!!help && <Help ml={2} content={help} />}
      </div>
      <span>{`${usd ? '$' : ''}${formatCurrency(balance || 0, 6)}`}</span>
    </div>
  </div>
)

export default TokenBalance
