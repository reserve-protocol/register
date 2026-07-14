import { decodeAbiParameters, type Hex } from 'viem'
import type { YieldDTF } from './registry'
import { loadSnapshot, loadSnapshotRaw } from './snapshots'

// Shared derivations for the Yield-DTF (RToken) render smokes. Values come from
// the captured record/replay map so assertions track the fixture, never
// hardcoded copy or numbers (see scripts/capture-yield.ts).

const NAME_SELECTOR = '0x06fdde03'
const SYMBOL_SELECTOR = '0x95d89b41'

// Decode the rToken's on-chain name/symbol straight from the captured map.
export function yieldTokenMeta(dtf: YieldDTF): { name: string; symbol: string } {
  const map = loadSnapshot<Record<string, Hex>>(`${dtf.snapshotDir}/rtoken-chain-state.json`)
  const addr = dtf.address.toLowerCase()
  const decode = (selector: string) =>
    decodeAbiParameters([{ type: 'string' }], map[`${addr}:${selector}`])[0]
  return { name: decode(NAME_SELECTOR), symbol: decode(SYMBOL_SELECTOR) }
}

// The pinned-block timestamp anchors the frozen clock so replayed Chainlink
// rounds read fresh and any block.timestamp-derived calldata regenerates.
export function yieldPinnedTimestamp(dtf: YieldDTF): number {
  const meta = loadSnapshotRaw<unknown>(`${dtf.snapshotDir}/rtoken-chain-state.json`)._meta as {
    blockTimestamp?: number
  }
  if (!meta.blockTimestamp) throw new Error(`No blockTimestamp for ${dtf.symbol}`)
  return meta.blockTimestamp
}
