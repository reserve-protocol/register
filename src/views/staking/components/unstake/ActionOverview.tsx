import { useAtomValue } from 'jotai'
import { Box } from 'theme-ui'
import ExchangeRate from '../ExchangeRate'
import GasEstimate from '../GasEstimate'
import { unStakeAmountAtom, unstakeGasEstimateAtom } from './atoms'

const Gas = () => {
  const gasEstimate = useAtomValue(unstakeGasEstimateAtom)
  const amount = useAtomValue(unStakeAmountAtom)

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
