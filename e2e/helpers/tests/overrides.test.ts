import { describe, expect, it } from 'vitest'
import { MockOverrides } from '../overrides'

describe('MockOverrides identity matching', () => {
  it('matches API method, exact pathname, and required search params', () => {
    const overrides = new MockOverrides()
    overrides.api(
      { method: 'POST', pathname: '/rebalance/liquidity', search: { chainId: '8453' } },
      { ok: true }
    )

    expect(
      overrides.lookupApi('POST', new URL('https://api.reserve.org/rebalance/liquidity?chainId=8453'))
    ).toEqual({ ok: true })
    expect(
      overrides.lookupApi('GET', new URL('https://api.reserve.org/rebalance/liquidity?chainId=8453'))
    ).toBeUndefined()
    expect(
      overrides.lookupApi('POST', new URL('https://api.reserve.org/rebalance/liquidity?chainId=1'))
    ).toBeUndefined()
  })

  it('matches GraphQL operation and identity-bearing variables', () => {
    const overrides = new MockOverrides()
    overrides.subgraph(
      { operationName: 'GetIndexDtfProposal', variables: { proposalId: '42' } },
      { proposal: { id: '42' } }
    )

    expect(
      overrides.lookupSubgraph('GetIndexDtfProposal', { proposalId: '42', dtfId: '0xabc' })
    ).toEqual({ proposal: { id: '42' } })
    expect(
      overrides.lookupSubgraph('GetIndexDtfProposal', { proposalId: '43', dtfId: '0xabc' })
    ).toBeUndefined()

    overrides.subgraph(
      { operationName: 'GetIndexDtfProposal', variables: { proposalId: '42' } },
      { proposal: { id: '42', state: 'EXECUTED' } }
    )
    expect(
      overrides.lookupSubgraph('GetIndexDtfProposal', { proposalId: '42', dtfId: '0xabc' })
    ).toEqual({ proposal: { id: '42', state: 'EXECUTED' } })
  })

  it('scopes a chain-bearing override to that chain only', () => {
    const overrides = new MockOverrides()
    overrides.subgraph({ operationName: 'Transactions', chain: 8453 }, {})

    expect(overrides.lookupSubgraph('Transactions', {}, 8453)).toEqual({})
    expect(overrides.lookupSubgraph('Transactions', {}, 1)).toBeUndefined()
    // A dispatcher that supplies no chain must never receive a chain-scoped payload.
    expect(overrides.lookupSubgraph('Transactions', {})).toBeUndefined()
  })

  it('keeps chainless overrides chain-agnostic (backward compatible)', () => {
    const overrides = new MockOverrides()
    overrides.subgraph({ operationName: 'Transactions' }, { entries: [] })

    expect(overrides.lookupSubgraph('Transactions', {}, 1)).toEqual({ entries: [] })
    expect(overrides.lookupSubgraph('Transactions', {}, 8453)).toEqual({ entries: [] })
    expect(overrides.lookupSubgraph('Transactions', {})).toEqual({ entries: [] })
  })

  it('serves two same-operation overrides on different chains independently', () => {
    const overrides = new MockOverrides()
    overrides.subgraph({ operationName: 'Transactions', chain: 1 }, { entries: [{ id: 'mainnet' }] })
    overrides.subgraph({ operationName: 'Transactions', chain: 8453 }, {})

    expect(overrides.lookupSubgraph('Transactions', {}, 1)).toEqual({
      entries: [{ id: 'mainnet' }],
    })
    expect(overrides.lookupSubgraph('Transactions', {}, 8453)).toEqual({})
  })

  it('lets a later chain-scoped override win over a chainless base on its chain', () => {
    const overrides = new MockOverrides()
    overrides.subgraph({ operationName: 'Transactions' }, { entries: [] })
    overrides.subgraph({ operationName: 'Transactions', chain: 8453 }, {})

    expect(overrides.lookupSubgraph('Transactions', {}, 8453)).toEqual({})
    expect(overrides.lookupSubgraph('Transactions', {}, 1)).toEqual({ entries: [] })
  })

  it('records price gaps per chain+token, case-insensitive, omit by default', () => {
    const overrides = new MockOverrides()
    overrides.priceGap(8453, '0xAbC0000000000000000000000000000000000001')
    overrides.priceGap(8453, '0xdef0000000000000000000000000000000000002', 'zero')

    expect(overrides.lookupPriceGap(8453, '0xabc0000000000000000000000000000000000001')).toBe(
      'omit'
    )
    expect(overrides.lookupPriceGap(8453, '0xDEF0000000000000000000000000000000000002')).toBe(
      'zero'
    )
    expect(
      overrides.lookupPriceGap(8453, '0x0000000000000000000000000000000000000003')
    ).toBeUndefined()
  })

  it('does not leak a price gap across chains for the same address', () => {
    const overrides = new MockOverrides()
    const native = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    overrides.priceGap(8453, native, 'zero')

    expect(overrides.lookupPriceGap(8453, native)).toBe('zero')
    expect(overrides.lookupPriceGap(1, native)).toBeUndefined()
    expect(overrides.lookupPriceGap(56, native)).toBeUndefined()
  })

  it('matches eth_call by full calldata, not selector alone', () => {
    const overrides = new MockOverrides()
    const expectedCall = `0x70a08231${'0'.repeat(63)}1`
    const wrongOwner = `0x70a08231${'0'.repeat(63)}2`
    overrides.ethCall('0xabc', expectedCall, '0x01')

    expect(overrides.lookupEthCall('0xAbC', expectedCall)).toBe('0x01')
    expect(overrides.lookupEthCall('0xabc', wrongOwner)).toBeUndefined()
  })

  it('consumes transaction outcomes in order and defaults to pending success', () => {
    const overrides = new MockOverrides()
    overrides.transaction({ kind: 'reject', code: 4001, message: 'No' })
    overrides.transaction({ kind: 'revert', pendingPolls: 2 })

    expect(overrides.consumeTransactionOutcome()).toEqual({
      kind: 'reject',
      code: 4001,
      message: 'No',
    })
    expect(overrides.consumeTransactionOutcome()).toEqual({
      kind: 'revert',
      pendingPolls: 2,
    })
    expect(overrides.consumeTransactionOutcome()).toEqual({
      kind: 'success',
      pendingPolls: 1,
    })
  })
})
