import TokenLogo from 'components/icons/TokenLogo'
import { BoxProps, Box, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

interface IconInfoProps extends BoxProps {
  icon: any
  text: string
  title: string
}

interface Props extends Partial<IconInfoProps> {
  symbol?: string
  balance: number
  usd?: boolean
}

export const IconInfo = ({
  icon,
  sx,
  title,
  text,
  ...props
}: IconInfoProps) => (
  <Flex sx={{ alignItems: 'center', ...sx }} {...props}>
    {icon}
    <Box ml={2}>
      <Text variant="contentTitle">{title}</Text>
      <Text>{text}</Text>
    </Box>
  </Flex>
)

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
    text={`${usd ? '$' : ''}${formatCurrency(balance)}`}
    icon={icon || <TokenLogo symbol={symbol} />}
    {...props}
  />
)

export default TokenBalance
