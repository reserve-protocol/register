import TokenLogo from 'components/icons/TokenLogo'
import { Text, BoxProps, Box } from 'theme-ui'

interface Props extends BoxProps {
  symbol: string
  logo?: string
}

const TokenItem = ({ symbol, logo, ...props }: Props) => (
  <Box variant="layout.verticalAlign">
    <TokenLogo size={18} mr={2} symbol={symbol} src={logo} />
    <Text {...props}>{symbol}</Text>
  </Box>
)

export default TokenItem
