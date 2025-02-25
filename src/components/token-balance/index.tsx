import TokenLogo from 'components/icons/TokenLogo'
import IconInfo, { IconInfoProps } from '@/components/old/info-icon'
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
    text={`${usd ? '$' : ''}${formatCurrency(balance || 0, 6)}`}
    icon={icon || <TokenLogo width={20} src={logoSrc} symbol={symbol} />}
    {...props}
  />
)

export default TokenBalance
