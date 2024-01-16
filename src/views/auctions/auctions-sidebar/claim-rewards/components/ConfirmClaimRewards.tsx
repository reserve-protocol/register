import { useAtomValue } from 'jotai'
import { Box } from 'theme-ui'
import { Trader } from 'types'
import { claimsByTraderAtom } from '../atoms'
import ClaimAllRewardsButton from './ClaimAllRewardsButton'
import ClaimFromTraderButton from './ClaimFromTraderButton'

const ConfirmClaimRewards = () => {
  const traderCalls = useAtomValue(claimsByTraderAtom)

  if (!Object.keys(traderCalls).length) {
    return <ClaimAllRewardsButton />
  }

  return (
    <Box>
      {Object.keys(traderCalls).map((trader) => (
        <ClaimFromTraderButton mb={3} trader={trader as Trader} key={trader} />
      ))}
    </Box>
  )
}

export default ConfirmClaimRewards
