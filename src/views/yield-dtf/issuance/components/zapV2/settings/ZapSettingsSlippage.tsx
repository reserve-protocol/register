import ButtonGroup from '@/components/ui/button-group'
import { useMemo, useState } from 'react'
import { formatNumber } from '../utils'
import { useZap } from '../context/ZapContext'
import ZapSettingsCustomSlippage from './ZapSettingsCustomSlippage'
import { SLIPPAGE_OPTIONS } from '../constants'

const ZapSettingsSlippage = () => {
  const { slippage, setSlippage } = useZap()
  const [showCustomSlippage, setShowCustomSlippage] = useState(
    !SLIPPAGE_OPTIONS.includes(slippage)
  )

  const buttons = useMemo(
    () =>
      SLIPPAGE_OPTIONS.map((bps) => ({
        label: `${formatNumber((1 / Number(bps)) * 100)}%`,
        onClick: () => {
          setShowCustomSlippage(false)
          setSlippage(bps)
        },
      })),
    [setSlippage]
  )

  const active = useMemo(
    () => SLIPPAGE_OPTIONS.findIndex((bps) => bps === slippage),
    [slippage]
  )

  return (
    <div className="flex items-center gap-2">
      <ButtonGroup buttons={buttons} startActive={active} />
      <ZapSettingsCustomSlippage
        showCustomSlippage={showCustomSlippage}
        setShowCustomSlippage={setShowCustomSlippage}
      />
    </div>
  )
}

export default ZapSettingsSlippage
