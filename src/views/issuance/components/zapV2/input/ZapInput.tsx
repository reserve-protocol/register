import { NumericalInput } from 'components'
import { useMemo } from 'react'
import { Box, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'

const ZapInput = () => {
  const { amountIn, setAmountIn, selectedToken, setSelectedToken } = useZap()
  const symbol = useMemo(() => selectedToken?.symbol ?? '', [selectedToken])

  return (
    <Box sx={{ position: 'relative', zIndex: 0, width: '100%' }}>
      <NumericalInput
        variant="transparent"
        placeholder={`0 ${symbol}`}
        value={amountIn}
        onChange={setAmountIn}
      />
      {!!amountIn && (
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
          <Text sx={{ visibility: 'hidden' }}>{amountIn}</Text>
          <Text sx={{ userSelect: 'none' }} ml="2" variant="legend">
            {symbol}
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default ZapInput
