import TokenLogo from 'components/icons/TokenLogo'
import Arbitrum from 'components/icons/logos/Arbitrum'
import Base from 'components/icons/logos/Base'
import Ethereum from 'components/icons/logos/Ethereum'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { ChainId } from 'utils/chains'
import BSC from '../icons/logos/BSC'

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
      {chainId === ChainId.Mainnet && <Ethereum />}
      {chainId === ChainId.Base && <Base />}
      {chainId === ChainId.Arbitrum && <Arbitrum />}
      {chainId === ChainId.BSC && <BSC />}
    </Box>
  </Box>
)

export default TokenItem
