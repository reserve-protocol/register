import TokenLogo from 'components/icons/TokenLogo'
import IconInfo, { IconInfoProps } from 'components/info-icon'
import { formatCurrency } from 'utils'

interface Props extends Partial<IconInfoProps> {
  symbol?: string
  balance: number
  usd?: boolean
  logoSrc?: string
}

const TokenBalance = ({
  symbol = '',
  title,
  balance,
  usd = false,
  logoSrc,
  icon,
  ...props
}: Props) => (
  <IconInfo
    title={title || symbol}
    text={`${usd ? '$' : ''}${formatCurrency(balance || 0)}`}
    icon={icon || <TokenLogo src={logoSrc} symbol={symbol} />}
    {...props}
  />
)

export default TokenBalance
