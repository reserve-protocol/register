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
