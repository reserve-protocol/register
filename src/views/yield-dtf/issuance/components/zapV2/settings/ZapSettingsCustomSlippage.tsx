import { NumericalInput } from 'components'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
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
      variant="ghost"
      onClick={() => setShowCustomSlippage(true)}
      className="w-[120px] rounded-lg px-3 py-2"
    >
      Custom
    </Button>
  ) : (
    <div className="rounded-lg border border-muted-foreground/30">
      <div className="relative z-0 w-full">
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
        <div className="font-bold absolute top-2 left-[92px] -z-[1]">
          <span className="select-none">%</span>
        </div>
      </div>
    </div>
  )
}

export default ZapSettingsCustomSlippage
