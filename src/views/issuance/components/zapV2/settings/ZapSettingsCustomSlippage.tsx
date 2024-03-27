import { Button, NumericalInput } from 'components'
import { useState } from 'react'
import { Box } from 'theme-ui'
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
  const [input, setInput] = useState(
    formatNumber((1 / Number(slippage)) * 10000)
  )

  return !showCustomSlippage ? (
    <Button
      variant="transparent"
      onClick={() => setShowCustomSlippage(true)}
      sx={{
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
      <NumericalInput
        style={{
          maxWidth: '79px',
          fontSize: 16,
          padding: '8px 12px',
        }}
        variant="transparent"
        value={input}
        autoFocus={true}
        onChange={(value) => {
          setInput(value)
          const parsed = parseFloat(value)
          if (isNaN(parsed)) return
          const slippage =
            parsed === 0 ? 0n : BigInt(Math.floor((1 / parsed) * 10000))
          setSlippage(slippage)
        }}
      />
    </Box>
  )
}

export default ZapSettingsCustomSlippage
