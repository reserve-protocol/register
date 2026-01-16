import { useStaticGasEstimate } from 'hooks/useGasEstimate'
import { useAtomValue } from 'jotai'
import ExchangeRate from '../exchange-rate'
import GasEstimate from '../gas-estimate'
import { stakeAmountAtom } from './atoms'

const APPROVE_AND_STAKE_GAS_ESTIMATE = 400000

const Gas = () => {
  const [gasEstimate] = useStaticGasEstimate([APPROVE_AND_STAKE_GAS_ESTIMATE])
  const amount = useAtomValue(stakeAmountAtom)

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
