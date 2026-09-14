import { describe, expect, it } from 'vitest'
import { SOURCE_RECORDS } from '../../auctions-current/fixtures'
import { initialWorkspace } from '../../auctions-current/model'
import { resultRow } from '../../auctions-current/result'

describe('current rebalance history projection', () => {
  const record = SOURCE_RECORDS.cmc20
  const state = initialWorkspace(record, 'complete')

  it.each([
    [0n, '$0'],
    [8421000n, '$84,210'],
    [8421049n, '$84,210'],
    [8421050n, '$84,211'],
  ])(
    'formats %s cents with the history whole-dollar precision',
    (traded, expected) => {
      expect(resultRow(record, { ...state, traded }, 'ready').traded).toBe(
        expected
      )
    }
  )

  it.each(['pending', 'error'] as const)(
    'keeps %s traded metrics unavailable',
    (data) => {
      expect(resultRow(record, state, data).traded).toBeNull()
    }
  )
})
