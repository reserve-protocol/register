import TokenLogo from 'components/icons/TokenLogo'
import { Flex, Text } from 'theme-ui'

const TokenItem = ({ symbol, logo }: { symbol: string; logo?: string }) => (
  <Flex sx={{ alignItems: 'center' }}>
    <TokenLogo size="1.2em" mr={2} symbol={symbol} src={logo} />
    <Text>{symbol}</Text>
  </Flex>
)

export default TokenItem
