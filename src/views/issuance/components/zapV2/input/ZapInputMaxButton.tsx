import { Button } from 'components'
import { Box, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useZap } from '../context/ZapContext'

const ZapInputMaxButton = () => {
  const { setAmountIn, maxAmountIn } = useZap()

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: '12px' }}>
      <Box>
        <Text>Balance </Text>
        <Text sx={{ fontWeight: 'bold' }}>
          {formatCurrency(+maxAmountIn, 5)}
        </Text>
      </Box>
      <Button
        small
        backgroundColor="#CCCCCC"
        color="#000000"
        style={{ borderRadius: 4 }}
        onClick={() => setAmountIn(maxAmountIn)}
      >
        Max
      </Button>
    </Box>
  )
}

export default ZapInputMaxButton
