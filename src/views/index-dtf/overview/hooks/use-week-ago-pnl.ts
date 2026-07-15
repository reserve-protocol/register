import useIndexDTFSubgraph from '@/hooks/useIndexDTFSugbraph'
import {
  dtfQueryKeys,
  useDtfSdk,
  useIndexDtfIdentity,
} from '@reserve-protocol/react-sdk'
import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { useMemo } from 'react'
import { Address, formatEther } from 'viem'

const WEEK_SECONDS = 7 * 24 * 60 * 60

// Latest daily balance snapshot at or before the week-ago mark. Snapshots only
// exist for days with balance activity, so this is the carry-forward balance
// the wallet held one week ago. No row at all = the wallet's history is
// younger than a week (or it never held).
const weekAgoSnapshotQuery = gql`
  query AccountBalanceWeekAgo(
    $account: String!
    $token: String!
    $before: BigInt!
  ) {
    accountBalanceDailySnapshots(
      where: { account: $account, token: $token, timestamp_lte: $before }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      amount
      timestamp
    }
  }
`

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

const useWeekAgoPnl = ({
  account,
  token,
  currentValue,
}: {
  account?: Address
  token?: Address
  currentValue?: number
}) => {
  const sdk = useDtfSdk()
  const { chainId } = useIndexDtfIdentity()

  // Hour-floored so query keys stay stable within the hour.
  const weekAgo = useMemo(
    () => Math.floor(Date.now() / 1_000 / 3_600) * 3_600 - WEEK_SECONDS,
    []
  )

  const {
    data: snapshotData,
    isSuccess: snapshotSettled,
    isError: snapshotFailed,
  } = useIndexDTFSubgraph(
    account && token ? weekAgoSnapshotQuery : null,
    {
      account: account?.toLowerCase(),
      token: token?.toLowerCase(),
      before: weekAgo.toString(),
    },
    {},
    chainId
  )

  // The wallet held a week ago only if a snapshot at/before that mark exists
  // with a positive amount; skip the price fetch otherwise.
  const snapshotAmount = useMemo(() => {
    const snapshot = snapshotData?.accountBalanceDailySnapshots?.[0]
    if (!snapshot) return null
    return Number(formatEther(BigInt(snapshot.amount)))
  }, [snapshotData])

  const priceParams = token
    ? {
        address: token,
        chainId,
        from: weekAgo - 3_600,
        to: weekAgo,
        interval: '1h' as const,
      }
    : undefined

  // Shares the canonical raw-history key, so the queryFn MUST return the raw
  // point array (the key's contract) — the last-positive selection happens
  // locally below, never inside the shared cache entry.
  const {
    data: pricePoints,
    isSuccess: priceSettled,
    isError: priceFailed,
  } = useQuery({
    queryKey: dtfQueryKeys.index.priceHistory(priceParams),
    queryFn: () => sdk.index.getPriceHistory(priceParams!),
    enabled: !!priceParams && snapshotAmount !== null && snapshotAmount > 0,
    staleTime: Infinity,
  })

  // Last point at/before the mark with a real price — snapshots can carry
  // leading zero-price rows.
  const priceThen = useMemo(() => {
    if (!pricePoints) return null
    return [...pricePoints].reverse().find((p) => p.price > 0)?.price ?? null
  }, [pricePoints])

  // Resolved = every fetch this PnL depends on has settled (success or error),
  // so a null pnl now means "hide the row", not "still loading". Consumers use
  // it to animate the balance card in exactly once, with its final content.
  const needsPrice = snapshotAmount !== null && snapshotAmount > 0
  const isResolved =
    (snapshotSettled || snapshotFailed) &&
    (!needsPrice || priceSettled || priceFailed)

  return {
    pnl: calculateWeekAgoPnl({ snapshotAmount, priceThen, currentValue }),
    isResolved,
  }
}

export default useWeekAgoPnl
