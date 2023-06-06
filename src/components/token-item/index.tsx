import TokenLogo from 'components/icons/TokenLogo'
import { Text, BoxProps, Box } from 'theme-ui'

interface Props extends BoxProps {
  symbol: string
  logo?: string
  width?: number
}

const TokenItem = ({ symbol, logo, width = 20, ...props }: Props) => (
  <Box variant="layout.verticalAlign">
    <TokenLogo width={24} mr={2} symbol={symbol} src={logo} />
    <Text {...props}>{symbol}</Text>
  </Box>
)

export default TokenItem
