import TokenLogo from 'components/icons/TokenLogo'
import { Box } from 'theme-ui'

const SwapIcon = ({ buy, sell }: { buy: string; sell: string }) => (
  <Box sx={{ position: 'relative' }}>
    <TokenLogo
      symbol={buy}
      sx={{ position: 'absolute', zIndex: 1, backgroundColor: 'white' }}
    />
    <TokenLogo symbol={sell} sx={{ position: 'absolute', top: '-6px' }} />
  </Box>
)

export default SwapIcon
