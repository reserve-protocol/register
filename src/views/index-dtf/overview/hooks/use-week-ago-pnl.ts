import {
  selectPriceAtMark,
  useIndexDtfAccountBalanceSnapshot,
  useIndexDtfIdentity,
  useIndexDtfPriceHistory,
} from '@reserve-protocol/react-sdk'
import { useMemo } from 'react'
import { Address } from 'viem'

const WEEK_SECONDS = 7 * 24 * 60 * 60

// "Past week" PnL = current position value minus the position's USD value one
// week ago (snapshot balance × price at that time). Deliberately a plain value
// diff — deposits/withdrawals during the week show up in it (product call).
// null = hide the PnL row: the wallet wasn't holding a week ago, or data is
// still loading/unavailable.
export const calculateWeekAgoPnl = ({
  snapshotAmount,
  priceThen,
  currentValue,
}: {
  snapshotAmount: number | null
  priceThen: number | null | undefined
  currentValue: number | undefined
}): number | null => {
  if (snapshotAmount === null || snapshotAmount <= 0) return null
  if (!priceThen || priceThen <= 0 || currentValue === undefined) return null
  return currentValue - snapshotAmount * priceThen
}

// The SDK hooks own fetching/caching; the period framing and value-diff semantics live here.
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

  // Hour-floored so query keys stay stable within the hour.
  const weekAgo = useMemo(
    () => Math.floor(Date.now() / 1_000 / 3_600) * 3_600 - WEEK_SECONDS,
    []
  )

  const snapshot = useIndexDtfAccountBalanceSnapshot(
    account && token
      ? { account, dtf: token, chainId, before: weekAgo }
      : undefined
  )

  const snapshotAmount = snapshot.data
    ? Number(snapshot.data.balance.formatted)
    : null
  // The wallet held a week ago only if a snapshot at/before the mark exists
  // with a positive amount; skip the price fetch otherwise.
  const holding = snapshotAmount !== null && snapshotAmount > 0

  const price = useIndexDtfPriceHistory(
    token && holding
      ? {
          address: token,
          chainId,
          from: weekAgo - 3_600,
          to: weekAgo,
          interval: '1h' as const,
        }
      : undefined,
    { staleTime: Infinity }
  )

  const priceThen = price.data ? selectPriceAtMark(price.data) : null

  // Resolved = every fetch this PnL depends on has settled (success or error),
  // so a null pnl now means "hide the row", not "still loading". Consumers use
  // it to animate the balance card in exactly once, with its final content.
  const snapshotSettled = snapshot.isSuccess || snapshot.isError
  const priceSettled = price.isSuccess || price.isError

  return {
    pnl: calculateWeekAgoPnl({ snapshotAmount, priceThen, currentValue }),
    isResolved: snapshotSettled && (!holding || priceSettled),
  }
}

export default useWeekAgoPnl
