import { useAtomValue } from 'jotai'
import ExchangeRate from '../exchange-rate'
import GasEstimate from '../gas-estimate'
import { unStakeAmountAtom, unstakeGasEstimateAtom } from './atoms'

const Gas = () => {
  const gasEstimate = useAtomValue(unstakeGasEstimateAtom)
  const amount = useAtomValue(unStakeAmountAtom)

  if (!amount) {
    return null
  }

  return <GasEstimate total={gasEstimate} className="ml-auto" />
}

export const ActionOverview = () => {
  return (
    <div className="flex items-center">
      <ExchangeRate />
      <Gas />
    </div>
  )
}

export default ActionOverview
