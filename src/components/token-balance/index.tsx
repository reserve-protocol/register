import TokenLogo from 'components/icons/TokenLogo'
import { BoxProps, Box, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  symbol?: string
  title?: string
  balance: number
  usd?: boolean
  icon?: any
}

const TokenBalance = ({
  sx = {},
  symbol = '',
  title,
  balance,
  usd = false,
  icon,
  ...props
}: Props) => (
  <Flex sx={{ alignItems: 'center', ...sx }} {...props}>
    {icon ? icon : <TokenLogo mr={2} symbol={symbol} />}
    <Box>
      <Text variant="contentTitle">{title || symbol}</Text>
      <Text>
        {!!usd && '$'}
        {formatCurrency(balance)}
      </Text>
    </Box>
  </Flex>
)

export default TokenBalance
