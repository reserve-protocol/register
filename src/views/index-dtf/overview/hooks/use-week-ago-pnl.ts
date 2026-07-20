import {
  useAccountBalancePnl,
  useIndexDtfIdentity,
} from '@reserve-protocol/react-sdk'
import { Address } from 'viem'

// "Past week" PnL, SDK-derived: snapshot balance × price at the week-ago mark
// vs the position's current value. null pnl = hide the row; isResolved = every
// dependent read settled, so consumers animate the card in exactly once.
const useWeekAgoPnl = ({
  account,
  token,
  currentValue,
}: {
  account?: Address
  token?: Address
  currentValue?: number
}) => {
  const { chainId } = useIndexDtfIdentity()

  return useAccountBalancePnl(
    account && token
      ? { account, dtf: token, chainId, period: '7d', currentValue }
      : undefined
  )
}

export default useWeekAgoPnl
