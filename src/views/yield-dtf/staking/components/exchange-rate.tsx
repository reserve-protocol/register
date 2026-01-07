import { useAtomValue } from 'jotai'
import { formatCurrency } from 'utils'
import { rateAtom, stRsrTickerAtom } from '@/views/yield-dtf/staking/atoms'

const ExchangeRate = () => {
  const ticker = useAtomValue(stRsrTickerAtom)
  const rate = useAtomValue(rateAtom)

  return (
    <div className="mt-4 mb-3">
      <span>
        1 {ticker} = {formatCurrency(rate, 5)} RSR
      </span>
    </div>
  )
}

export default ExchangeRate
