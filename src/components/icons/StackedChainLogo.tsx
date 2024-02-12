import { Box, BoxProps } from 'theme-ui'
import ChainLogo from './ChainLogo'

interface Props extends BoxProps {
  chains: number[]
}

// Shows ethereum/base stacked logos to indicate multichain
const StackedChainLogo = ({ chains, ...props }: Props) => (
  <Box
    sx={{ position: 'relative', height: 20, width: 24 }}
    pt={'2px'}
    ml={`${(chains.length - 1) * 10}px`}
    {...props}
  >
    {[...chains].reverse().map((chain, index) => (
      <ChainLogo
        key={chain}
        chain={chain}
        style={{ position: 'absolute', left: -(index * 10) }}
      />
    ))}
  </Box>
)

export default StackedChainLogo
