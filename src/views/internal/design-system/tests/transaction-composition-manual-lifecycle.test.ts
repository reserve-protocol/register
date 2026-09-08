import { describe, expect, it } from 'vitest'
import {
  createManualSession,
  manualReducer,
  manualSessionAssets,
} from '../transaction-composition-manual-lifecycle'

describe('Manual lab lifecycle', () => {
  it('advances independent approvals without losing the other wallet requests', () => {
    let session = manualReducer(createManualSession(), { type: 'approve-all' })
    session = manualReducer(session, { type: 'wallet-accept', symbol: 'WETH' })
    session = manualReducer(session, { type: 'confirm', symbol: 'WETH' })
    session = manualReducer(session, { type: 'wallet-accept', symbol: 'AAVE' })
    expect(session.approvals.WETH.status).toBe('success')
    expect(session.approvals.AAVE.status).toBe('confirming')
    expect(session.approvals.USDT.status).toBe('signing')
    expect(manualReducer(session, { type: 'amount', amount: '2' })).toBe(
      session
    )
    expect(manualReducer(session, { type: 'submit' })).toBe(session)
  })
  it('retains finite aggregate approval versus USDT individual maximum policy', () => {
    let session = {
      ...createManualSession('mint', '100'),
      unlimited: false,
      allowances: { USDT: 0n },
    }
    const required = manualSessionAssets(session).find(
      (a) => a.symbol === 'USDT'
    )!.requiredAmount
    const aggregate = manualReducer(session, { type: 'approve-all' })
    expect(aggregate.approvals.USDT.requestedAllowance).toBe(required * 2n)
    const individual = manualReducer(session, { type: 'token', symbol: 'USDT' })
    expect(individual.approvals.USDT.requestedAllowance).toBe((1n << 256n) - 1n)
  })
  it('preserves successful permissions and retries only failed tokens', () => {
    let session = createManualSession('mint', '73.25')
    session = manualReducer(session, { type: 'approve-all' })
    expect(Object.keys(session.approvals)).toEqual(['WETH', 'USDT', 'AAVE'])
    session = manualReducer(session, { type: 'wallet-accept' })
    session = manualReducer(session, { type: 'confirm' })
    expect(session.approvals.WETH.status).toBe('success')
    expect(session.approvals.USDT.status).toBe('error')
    session = manualReducer(session, { type: 'retry' })
    expect(session.approvals.WETH.status).toBe('success')
    expect(session.approvals.USDT.status).toBe('signing')
    expect(session.amount).toBe('73.25')
  })

  it('keeps Revoke distinct from Approve and rechecks edited requirements', () => {
    let session = createManualSession('mint', '100')
    session = manualReducer(session, { type: 'token', symbol: 'USDT' })
    expect(session.approvals.USDT.action).toBe('revoke')
    session = manualReducer(session, { type: 'wallet-accept' })
    session = manualReducer(session, { type: 'confirm' })
    expect(
      manualSessionAssets(session).find((a) => a.symbol === 'USDT')?.permission
    ).toBe('approve')
    expect(session.allowances.USDT).toBe(0n)
    session = manualReducer(session, { type: 'token', symbol: 'USDT' })
    expect(session.approvals.USDT.action).toBe('approve')
  })

  it('never gives Redeem an approval stage and preserves amount through failure', () => {
    let session = createManualSession('redeem', '12.5')
    session = manualReducer(session, { type: 'approve-all' })
    expect(session.approvals).toEqual({})
    session = manualReducer(session, { type: 'submit' })
    expect(session.transaction).toBe('signing')
    session = manualReducer(session, { type: 'wallet-accept' })
    session = manualReducer(session, { type: 'fail' })
    expect(session.transaction).toBe('error')
    expect(session.error).toBe('Execution reverted.')
    expect(session.amount).toBe('12.5')
    session = manualReducer(session, { type: 'submit' })
    session = manualReducer(session, { type: 'wallet-accept' })
    session = manualReducer(session, { type: 'confirm' })
    expect(session.transaction).toBe('success')
    expect(manualReducer(session, { type: 'reset' }).amount).toBe('')
  })

  it('preserves a compliance exit through Redeem but blocks restricted Mint', () => {
    const restricted = {
      ...createManualSession('mint', '10'),
      gate: 'restricted' as const,
    }
    expect(manualReducer(restricted, { type: 'submit' }).transaction).toBe(
      'idle'
    )
    expect(
      manualReducer(restricted, { type: 'approve-all' }).approvals
    ).toEqual({})
    const redeem = manualReducer(restricted, {
      type: 'mode',
      operation: 'redeem',
    })
    expect(redeem.gate).toBe('restricted')
    expect(manualReducer(redeem, { type: 'submit' }).transaction).toBe(
      'signing'
    )
  })
})
