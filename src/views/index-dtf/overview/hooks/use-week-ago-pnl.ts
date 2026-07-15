import useIndexDTFSubgraph from '@/hooks/useIndexDTFSugbraph'
import { chainIdAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { useAtomValue } from 'jotai'
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
  const chainId = useAtomValue(chainIdAtom)

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

  const {
    data: priceThen,
    isSuccess: priceSettled,
    isError: priceFailed,
  } = useQuery({
    queryKey: ['dtf-price-at', chainId, token, weekAgo],
    queryFn: async (): Promise<number | null> => {
      const sp = new URLSearchParams()
      sp.set('chainId', chainId.toString())
      sp.set('address', token?.toLowerCase() ?? '')
      sp.set('from', (weekAgo - 3_600).toString())
      sp.set('to', weekAgo.toString())
      sp.set('interval', '1h')

      const response = await fetch(
        `${RESERVE_API}historical/dtf?${sp.toString()}`
      )
      if (!response.ok) throw new Error('Failed to fetch dtf price at week ago')

      const data = (await response.json()) as {
        timeseries?: { timestamp: number; price: number }[]
      }
      const point = [...(data.timeseries ?? [])]
        .reverse()
        .find((p) => p.price > 0)
      return point?.price ?? null
    },
    enabled: !!token && snapshotAmount !== null && snapshotAmount > 0,
    staleTime: Infinity,
  })

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
