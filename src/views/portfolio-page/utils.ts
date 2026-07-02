import { PortfolioResponse } from './types'

export const hasPositiveNumber = (
  value: number | string | null | undefined
) => Number(value ?? 0) > 0

// Gates the empty-portfolio state: any holding, reward, pending withdrawal,
// voting power, or active proposal counts as Reserve activity.
export const hasReserveActivity = (data: PortfolioResponse) => {
  if (hasPositiveNumber(data.totalHoldingsUSD)) return true
  if (
    data.indexDTFs.some(
      (dtf) =>
        hasPositiveNumber(dtf.amount) ||
        hasPositiveNumber(dtf.value) ||
        dtf.rewards?.some((reward) => hasPositiveNumber(reward.value))
    )
  ) {
    return true
  }
  if (
    data.yieldDTFs.some(
      (dtf) => hasPositiveNumber(dtf.amount) || hasPositiveNumber(dtf.value)
    )
  ) {
    return true
  }
  if (
    data.stakedRSR.some(
      (position) =>
        hasPositiveNumber(position.amount) ||
        hasPositiveNumber(position.value) ||
        hasPositiveNumber(position.votingPower) ||
        position.pendingWithdrawals?.some((withdrawal) =>
          hasPositiveNumber(withdrawal.value)
        ) ||
        position.activeProposals?.length
    )
  ) {
    return true
  }
  if (
    data.voteLocks.some(
      (position) =>
        hasPositiveNumber(position.amount) ||
        hasPositiveNumber(position.value) ||
        hasPositiveNumber(position.votingPower) ||
        position.rewards?.some((reward) => hasPositiveNumber(reward.value)) ||
        position.locks?.some((lock) => hasPositiveNumber(lock.value)) ||
        position.activeProposals?.length
    )
  ) {
    return true
  }

  return data.rsrBalances.some(
    (balance) =>
      hasPositiveNumber(balance.amount) || hasPositiveNumber(balance.value)
  )
}
