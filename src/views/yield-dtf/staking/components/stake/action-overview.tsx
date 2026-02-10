import { useStaticGasEstimate } from 'hooks/useGasEstimate'
import { useAtomValue } from 'jotai'
import ExchangeRate from '../exchange-rate'
import GasEstimate from '../gas-estimate'
import { stakeAmountAtom } from './atoms'


export const ActionOverview = () => {
  return (
    <div className="flex items-center justify-end mr-3 -my-2 text-legend">
      <ExchangeRate />

    </div>
  )
}

export default ActionOverview
