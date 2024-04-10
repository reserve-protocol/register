import { Button, NumericalInput } from 'components'
import { useState } from 'react'
import { Box, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import { formatNumber } from '../utils'

const ZapSettingsCustomSlippage = ({
  showCustomSlippage,
  setShowCustomSlippage,
}: {
  showCustomSlippage: boolean
  setShowCustomSlippage: (show: boolean) => void
}) => {
  const { slippage, setSlippage } = useZap()
  const [input, setInput] = useState(formatNumber((1 / Number(slippage)) * 100))

  return !showCustomSlippage ? (
    <Button
      variant="transparent"
      onClick={() => setShowCustomSlippage(true)}
      sx={{
        width: '120px',
        borderRadius: 8,
        px: '12px',
        py: 2,
      }}
    >
      Custom
    </Button>
  ) : (
    <Box
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'darkBorder',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 0, width: '100%' }}>
        <NumericalInput
          style={{
            maxWidth: '120px',
            fontSize: 16,
            padding: '8px 32px 8px 12px',
          }}
          variant="transparent"
          value={input}
          autoFocus={true}
          onChange={(value) => {
            setInput(value)
            const parsed = parseFloat(value)
            if (isNaN(parsed)) return
            const slippage =
              parsed === 0 ? 0n : BigInt(Math.floor((1 / parsed) * 100))
            setSlippage(slippage)
          }}
        />
        <Box
          sx={{
            fontWeight: 'bold',
            position: 'absolute',
            top: 2,
            left: 92,
            zIndex: -1,
          }}
        >
          <Text sx={{ userSelect: 'none' }}>%</Text>
        </Box>
      </Box>
    </Box>
  )
}

export default ZapSettingsCustomSlippage
