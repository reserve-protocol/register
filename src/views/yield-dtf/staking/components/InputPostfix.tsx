import { Box, Text } from 'theme-ui'

const InputPostfix = ({
  amount,
  symbol,
}: {
  amount: string
  symbol: string
}) => (
  <Box
    sx={{
      fontSize: 4,
      fontWeight: 'bold',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: -1,
    }}
  >
    <Text sx={{ visibility: 'hidden' }}>{amount}</Text>
    <Text sx={{ userSelect: 'none' }} ml="2" variant="legend">
      {symbol}
    </Text>
  </Box>
)

export default InputPostfix
