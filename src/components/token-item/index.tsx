import TokenLogo from 'components/icons/TokenLogo'
import { Text, BoxProps, Box } from 'theme-ui'

interface Props extends BoxProps {
  symbol: string
  logo?: string
  size?: number
}

const TokenItem = ({ symbol, logo, size = 20, ...props }: Props) => (
  <Box variant="layout.verticalAlign">
    <TokenLogo size={size} mr={2} symbol={symbol} src={logo} />
    <Text {...props}>{symbol}</Text>
  </Box>
)

export default TokenItem
