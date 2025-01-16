import TokenLogo from 'components/icons/TokenLogo'
import { Box } from 'theme-ui'

const SwapIcon = ({ buy, sell }: { buy: string; sell: string }) => (
  <Box sx={{ position: 'relative', width: 20 }}>
    <TokenLogo
      symbol={buy}
      width={20}
      sx={{
        position: 'absolute',
        bottom: '-3px',
        zIndex: 1,
        backgroundColor: 'white',
      }}
    />
    <TokenLogo
      width={20}
      symbol={sell}
      sx={{ position: 'absolute', top: '-3px' }}
    />
  </Box>
)

export default SwapIcon
