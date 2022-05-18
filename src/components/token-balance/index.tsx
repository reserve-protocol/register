import TokenLogo from 'components/icons/TokenLogo'
import { BoxProps, Box, Flex, Text } from 'theme-ui'
import { Token } from 'types'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  token: Token
  balance: number
}

const TokenBalance = ({ sx = {}, token, balance, ...props }: Props) => (
  <Flex sx={{ alignItems: 'center', ...sx }} {...props}>
    <TokenLogo mr={2} symbol={token.symbol} />
    <Box>
      <Text variant="contentTitle">{token.symbol}</Text>
      <Text>{formatCurrency(balance)}</Text>
    </Box>
  </Flex>
)

export default TokenBalance
