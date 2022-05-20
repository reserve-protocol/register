import TokenLogo from 'components/icons/TokenLogo'
import { BoxProps, Box, Flex, Text } from 'theme-ui'
import { Token } from 'types'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  symbol: string
  title?: string
  balance: number
}

const TokenBalance = ({ sx = {}, symbol, title, balance, ...props }: Props) => (
  <Flex sx={{ alignItems: 'center', ...sx }} {...props}>
    <TokenLogo mr={2} symbol={symbol} />
    <Box>
      <Text variant="contentTitle">{title || symbol}</Text>
      <Text>{formatCurrency(balance)}</Text>
    </Box>
  </Flex>
)

export default TokenBalance
