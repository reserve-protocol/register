import { Transaction } from '@/state/dtf/atoms'
import { Address, formatEther } from 'viem'

export type SwapDirection = 'Buy' | 'Sell'

export type TransactionRow = Omit<Transaction, 'type'> & {
  type: Transaction['type'] | SwapDirection
}

export type PoolTransferEvent = {
  id: string
  hash: string
  amount: string
  timestamp: string
  from: { id: string }
  to: { id: string }
}

export type PoolSwapsResponse = {
  buys: PoolTransferEvent[]
  sells: PoolTransferEvent[]
}

export type PoolSwap = {
  id: string
  hash: string
  amount: number
  timestamp: number
  chain: number
  from?: Address
  to?: Address
  type: SwapDirection
}

// The subgraph only indexes DTF ERC20 transfers, so a swap is inferred from the
// PoolManager being the counterparty. Liquidity management (a v4
// `ModifyLiquidity` — e.g. a Steer vault re-ranging) moves tokens out of and
// back into the PoolManager against the SAME address in one tx, which would
// otherwise render as a phantom Buy/Sell pair and double-count 24h volume.
// Those counterparties are dropped for that tx.
const roundTripCounterparties = (
  events: PoolTransferEvent[],
  pm: string
): Set<string> => {
  const received = new Set<string>()
  const sent = new Set<string>()

  for (const event of events) {
    const from = event.from.id.toLowerCase()
    const to = event.to.id.toLowerCase()

    if (from === pm && to !== pm) received.add(`${event.hash}-${to}`)
    if (to === pm && from !== pm) sent.add(`${event.hash}-${from}`)
  }

  return new Set([...received].filter((key) => sent.has(key)))
}

// Split routes emit several PoolManager transfers within one tx — group by
// (hash, direction) so the table shows one row per trade. Directions are kept
// separate on purpose: a tx buying and selling in the same pool through
// different counterparties renders as two honest rows instead of a netted one.
export const mapPoolSwapEvents = (
  data: PoolSwapsResponse,
  poolManager: string,
  chain: number
): PoolSwap[] => {
  const pm = poolManager.toLowerCase()
  const seen = new Set<string>()
  const groups = new Map<string, { swap: PoolSwap; total: bigint }>()
  const events = [...data.buys, ...data.sells]
  const roundTrips = roundTripCounterparties(events, pm)

  for (const event of events) {
    if (seen.has(event.id)) continue
    seen.add(event.id)

    const from = event.from.id.toLowerCase()
    const to = event.to.id.toLowerCase()

    // PM→PM would land in both aliases and double-book phantom volume
    if (from === pm && to === pm) continue

    const type: SwapDirection = from === pm ? 'Buy' : 'Sell'

    if (roundTrips.has(`${event.hash}-${type === 'Buy' ? to : from}`)) continue

    const key = `${event.hash}-${type}`
    const timestamp = Number(event.timestamp)
    const existing = groups.get(key)

    if (existing) {
      existing.total += BigInt(event.amount)
      existing.swap.timestamp = Math.max(existing.swap.timestamp, timestamp)
    } else {
      groups.set(key, {
        total: BigInt(event.amount),
        swap: {
          id: key,
          hash: event.hash,
          amount: 0,
          timestamp,
          chain,
          from: event.from.id as Address,
          to: event.to.id as Address,
          type,
        },
      })
    }
  }

  return [...groups.values()]
    .map(({ swap, total }) => ({
      ...swap,
      amount: Number(formatEther(total)),
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
}

// Same 24h window (`>` cutoff) and current-price USD approximation as
// indexDTF24hVolumeAtom, so both halves of the stat share semantics.
export const compute24hSwapVolumeUsd = (
  swaps: PoolSwap[],
  price: number,
  nowSeconds: number
): number => {
  const cutoff = nowSeconds - 24 * 60 * 60
  return swaps
    .filter((swap) => swap.timestamp > cutoff)
    .reduce((acc, swap) => acc + swap.amount * (price || 0), 0)
}

export const mergeTransactionRows = (
  transactions: Transaction[],
  swaps: PoolSwap[],
  price: number
): TransactionRow[] => {
  const swapRows: TransactionRow[] = swaps.map((swap) => ({
    ...swap,
    amountUSD: swap.amount * (price || 0),
  }))

  return [...transactions, ...swapRows].sort(
    (a, b) => b.timestamp - a.timestamp
  )
}
