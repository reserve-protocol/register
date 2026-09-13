import { describe, expect, it } from 'vitest'
import governance from '../../../../../../e2e/snapshots/bsc/cmc20/governance.json'
import rebalances from '../../../../../../e2e/snapshots/bsc/cmc20/rebalances.json'
import { REBALANCE_IDENTITIES } from '../fixtures'
import { browseRecords, priceImpactDisplay } from '../model'

describe('snapshot identity / illustrative overlay boundary', () => {
  it('retains actual joined CMC20 identities, provenance and windows', () => {
    const proposals = governance.data.governances.flatMap(
      (group) => group.proposals
    )
    for (const identity of REBALANCE_IDENTITIES) {
      const proposal = proposals.find((item) => item.id === identity.id)!
      const rebalance = rebalances.data.rebalances.find(
        (item) => item.blockNumber === proposal.executionBlock
      )!
      expect(identity).toEqual({
        id: proposal.id,
        title: proposal.description.split('\n')[0].replace(/^# /, '').trim(),
        creationTime: Number(proposal.creationTime),
        proposer: proposal.proposer.address,
        nonce: Number(rebalance.nonce),
        restrictedUntil: Number(rebalance.restrictedUntil),
        availableUntil: Number(rebalance.availableUntil),
      })
    }
  })

  it('keeps metric availability independent of phase and identity', () => {
    const pending = browseRecords('metrics-loading', 'ongoing')
    const missing = browseRecords('unavailable', 'ongoing')
    expect(pending.map((record) => record.identity.id)).toEqual(
      missing.map((record) => record.identity.id)
    )
    expect(pending[0]).toEqual(missing[0])
    expect(missing[0].status).toBe('Ongoing')
    expect(missing[0].auctionNumber).toBe(1)
    expect(missing[0].role).toBe('active')
    expect(missing[0].metrics[0].value).toBe('5 min')
    expect(pending.slice(1).every((record) => record.metricsLoading)).toBe(true)
    expect(
      missing
        .slice(1)
        .every(
          (record) =>
            !record.metricsLoading &&
            record.metrics.every((metric) => metric.value === null)
        )
    ).toBe(true)
  })

  it('keeps readiness visible while distinguishing restricted access from the launcher wallet', () => {
    const visitor = browseRecords('default', 'restricted', false)
    const launcher = browseRecords('default', 'restricted', true)
    expect(visitor[0].role).toBe('actionable')
    expect(visitor[0].access).toBe('restricted')
    expect(launcher[0].access).toBe('launcher')
    expect(launcher[0].role).toBe('actionable')
    expect(launcher[0].status).toBe('Ready to start')
    expect(launcher[0].auctionNumber).toBe(1)
    expect(launcher[0].metrics).toEqual([
      { kind: 'permissionless', label: 'Permissionless in', value: '18h' },
      { kind: 'expiry', label: 'Expires in', value: '1d 18h' },
    ])
    expect(launcher.slice(1)).toEqual(visitor.slice(1))
    expect(browseRecords('unavailable', 'restricted', true)[0]).toEqual(
      launcher[0]
    )
    for (const phase of ['permissionless', 'ongoing'] as const)
      expect(browseRecords('default', phase, true)).toEqual(
        browseRecords('default', phase, false)
      )
  })

  it('replaces readiness with a known price prerequisite failure, not a failed rebalance', () => {
    for (const phase of ['restricted', 'permissionless'] as const) {
      const blocked = browseRecords('price-unavailable', phase, true, 2)
      const ready = browseRecords('default', phase, true, 2)
      expect(blocked[0].status).toBe('Price unavailable — cannot launch')
      expect(blocked[0].notice).toBe(true)
      expect(blocked[0].role).toBe('waiting')
      expect(blocked[0].active).toBe(true)
      expect(blocked[0].metrics).toEqual(ready[0].metrics)
      expect(blocked.slice(1)).toEqual(ready.slice(1))
    }
    expect(browseRecords('price-unavailable', 'ongoing', true, 2)).toEqual(
      browseRecords('default', 'ongoing', true, 2)
    )
  })

  it('does not claim zero auctions is successful or unknown is zero', () => {
    const zero = browseRecords('zero', 'restricted')[1]
    expect(zero.status).toBe('Expired')
    expect(zero.role).toBe('closed')
    expect(zero.metrics).toEqual([
      { label: 'Rebalance accuracy', value: null },
      { label: 'Total price impact', value: '0%', tone: undefined },
      { label: '0 Auctions run', value: '$0 Traded' },
    ])
    expect(browseRecords('empty', 'restricted')).toEqual([])
  })

  it('keeps history reviewable when there is no active rebalance', () => {
    expect(browseRecords('historical', 'restricted')).toEqual(
      browseRecords('default', 'restricted').slice(1)
    )
  })

  it.each([
    ['restricted', 'Ready to start'],
    ['permissionless', 'Ready to start'],
    ['ongoing', 'Ongoing'],
  ] as const)(
    'retains two completed auctions during %s without inventing a total',
    (phase, status) => {
      const records = browseRecords('default', phase, true, 2)
      expect(records[0].active).toBe(true)
      expect(records[0].status).toBe(status)
      expect(records[0].auctionNumber).toBe(3)
      expect(records[0].metrics).toContainEqual({
        kind: 'auctions-run',
        label: 'Auctions run',
        value: '2',
      })
      expect(records[0].role).toBe(
        phase === 'ongoing' ? 'active' : 'actionable'
      )
      expect(records.slice(1)).toEqual(
        browseRecords('default', phase, true).slice(1)
      )
      expect(browseRecords('unavailable', phase, true, 2)[0]).toEqual(
        records[0]
      )
      expect(browseRecords('default', phase, true, 1)[0].auctionNumber).toBe(2)
      expect(browseRecords('default', phase, true, 1)[0].status).toBe(status)
    }
  )

  it.each([
    [1.51, '−1.51%', 'negative'],
    [-0.12, '+0.12%', 'positive'],
    [0, '0%', undefined],
    [null, null, undefined],
    [NaN, null, undefined],
  ] as const)(
    'displays API cost %s without reversing its meaning',
    (cost, value, tone) => {
      expect(priceImpactDisplay(cost).value).toBe(value)
      expect(priceImpactDisplay(cost).tone).toBe(tone)
    }
  )
})
