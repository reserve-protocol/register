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
        <div className="text-2xl font-bold absolute top-0 left-0 -z-[1]">
          <span className="invisible">{amountIn}</span>
          <span className="select-none ml-2 text-legend">{symbol}</span>
        </div>
      )}
    </div>
  )
}

export default ZapInput
