import TokenLogo from 'components/icons/TokenLogo'
import Base from 'components/icons/logos/Base'
import Ethereum from 'components/icons/logos/Ethereum'
import { Text, BoxProps, Box, Flex } from 'theme-ui'

interface Props extends BoxProps {
  symbol: string
  logo?: string
  width?: number
  chainId?: number | null
}

const TokenItem = ({ symbol, logo, width = 24, chainId, ...props }: Props) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    }}
  >
    <Flex variant="layout.verticalAlign">
      <TokenLogo width={width} mr="6px" symbol={symbol} src={logo} />
      <Text {...props}>{symbol}</Text>
    </Flex>
    <Box>
      {chainId === 1 && <Ethereum />}
      {chainId === 8453 && <Base />}
    </Box>
  </Box>
)

export default TokenItem
