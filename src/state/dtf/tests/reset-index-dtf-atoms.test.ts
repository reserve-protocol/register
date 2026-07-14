import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import {
  indexDTFFeeAtom,
  indexDTFMarketCapAtom,
  indexDTFStatusAtom,
  indexDTFTransactionsAtom,
  indexDTFVersionAtom,
  type Transaction,
} from '@/state/dtf/atoms'
import { resetIndexDTFAtomsAtom } from '@/state/dtf/reset-index-dtf-atoms'

const tx: Transaction = {
  id: '0x1',
  hash: '0x1',
  amount: 1,
  amountUSD: 1,
  timestamp: 1,
  chain: 8453,
  type: 'Mint',
}

// Z21: DTF→DTF SPA navigation must not leak the previous DTF's data into the
// next one's load window. tx-count/mcap/version were the leaked mirrors.
describe('resetIndexDTFAtomsAtom', () => {
  it('clears the previously leaked mirrors (transactions, market cap, version)', () => {
    const store = createStore()
    store.set(indexDTFTransactionsAtom, [tx])
    store.set(indexDTFMarketCapAtom, 123_456)
    store.set(indexDTFVersionAtom, '5.0.0')
    store.set(indexDTFStatusAtom, 'deprecated')
    store.set(indexDTFFeeAtom, 'unavailable')

    store.set(resetIndexDTFAtomsAtom)

    expect(store.get(indexDTFTransactionsAtom)).toEqual([])
    expect(store.get(indexDTFMarketCapAtom)).toBeUndefined()
    expect(store.get(indexDTFVersionAtom)).toBe('4.0.0')
    expect(store.get(indexDTFStatusAtom)).toBe('active')
    expect(store.get(indexDTFFeeAtom)).toBeUndefined()
  })
})
