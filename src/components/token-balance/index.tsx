import TokenLogo from 'components/icons/TokenLogo'
import IconInfo, { IconInfoProps } from 'components/info-icon'
import { formatCurrency } from 'utils'

interface Props extends Partial<IconInfoProps> {
  symbol?: string
  balance: number
  usd?: boolean
}

const TokenBalance = ({
  symbol = '',
  title,
  balance,
  usd = false,
  icon,
  ...props
}: Props) => (
  <IconInfo
    title={title || symbol}
    text={`${usd ? '$' : ''}${formatCurrency(balance || 0)}`}
    icon={icon || <TokenLogo symbol={symbol} />}
    {...props}
  />
)

export default TokenBalance
