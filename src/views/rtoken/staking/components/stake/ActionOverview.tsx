import { useStaticGasEstimate } from 'hooks/useGasEstimate'
import { Box } from 'theme-ui'
import ExchangeRate from '../ExchangeRate'
import GasEstimate from '../GasEstimate'
import { useAtomValue } from 'jotai'
import { stakeAmountAtom } from './atoms'

const APPROVE_AND_STAKE_GAS_ESTIMATE = 400000

const Gas = () => {
  const [gasEstimate] = useStaticGasEstimate([APPROVE_AND_STAKE_GAS_ESTIMATE])
  const amount = useAtomValue(stakeAmountAtom)

  if (!amount) {
    return null
  }

  return <GasEstimate total={gasEstimate} ml="auto" />
}

export const ActionOverview = () => {
  return (
    <Box variant="layout.verticalAlign">
      <ExchangeRate />
      <Gas />
    </Box>
  )
}

export default ActionOverview
