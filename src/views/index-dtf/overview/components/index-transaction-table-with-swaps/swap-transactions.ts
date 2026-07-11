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

// Split routes emit several PoolManager transfers within one tx — group by
// (hash, direction) so the table shows one row per trade. Directions are kept
// separate on purpose: a tx buying and selling in the same pool (arb/multi-hop)
// renders as two honest rows instead of a confusing netted one.
export const mapPoolSwapEvents = (
  data: PoolSwapsResponse,
  poolManager: string,
  chain: number
): PoolSwap[] => {
  const pm = poolManager.toLowerCase()
  const seen = new Set<string>()
  const groups = new Map<string, { swap: PoolSwap; total: bigint }>()

  for (const event of [...data.buys, ...data.sells]) {
    if (seen.has(event.id)) continue
    seen.add(event.id)

    const from = event.from.id.toLowerCase()
    const to = event.to.id.toLowerCase()

    // PM→PM would land in both aliases and double-book phantom volume
    if (from === pm && to === pm) continue

    const type: SwapDirection = from === pm ? 'Buy' : 'Sell'
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
