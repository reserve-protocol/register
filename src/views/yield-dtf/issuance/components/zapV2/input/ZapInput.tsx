import { NumericalInput } from 'components'
import { useMemo } from 'react'
import { useZap } from '../context/ZapContext'

const ZapInput = () => {
  const { amountIn, setAmountIn, tokenIn } = useZap()
  const symbol = useMemo(() => tokenIn?.symbol ?? '', [tokenIn])

  return (
    <div className="relative z-0 w-full">
      <NumericalInput
        variant="transparent"
        placeholder={`0 ${symbol}`}
        value={amountIn}
        onChange={setAmountIn}
      />
      {!!amountIn && (
        <div className="absolute top-0 left-0 h-10 flex items-center text-3xl pointer-events-none">
          <span className="invisible">{amountIn}</span>
          <span className="ml-2 text-legend select-none">{symbol}</span>
        </div>
      )}
    </div>
  )
}

export default ZapInput
