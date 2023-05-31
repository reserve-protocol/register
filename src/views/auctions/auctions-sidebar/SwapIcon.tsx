import TokenLogo from 'components/icons/TokenLogo'
import { Box } from 'theme-ui'

const SwapIcon = ({ buy, sell }: { buy: string; sell: string }) => (
  <Box sx={{ position: 'relative' }}>
    <TokenLogo
      symbol={buy}
      width={20}
      sx={{ position: 'absolute', zIndex: 1, backgroundColor: 'white' }}
    />
    <TokenLogo
      width={20}
      symbol={sell}
      sx={{ position: 'absolute', top: '-6px' }}
    />
  </Box>
)

export default SwapIcon
