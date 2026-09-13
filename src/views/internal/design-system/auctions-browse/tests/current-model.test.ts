import { describe, expect, it } from 'vitest'
import { SOURCE_RECORDS } from '../../auctions-current/fixtures'
import {
  initialWorkspace,
  mayLaunch,
  workspaceReducer as reduce,
} from '../../auctions-current/model'
import {
  allocations,
  parseBasketCsv,
  basketCsv,
} from '../../auctions-current/weights-model'

const record = SOURCE_RECORDS.cmc20
const launch = {
  type: 'launch',
  record,
  viewer: 'launcher',
  network: true,
  data: 'ready',
  outcome: 'success',
} as const

describe('local auction operation boundary', () => {
  it('counts an ended auction once when advancing directly through rebalance expiry', () => {
    const state = initialWorkspace(record, 'live')
    const expire = {
      type: 'advance',
      seconds: record.identity.availableUntil - state.now + 1,
      expires: record.identity.availableUntil,
    } as const
    const direct = reduce(state, expire)
    const ended = reduce(state, { ...expire, seconds: 601 })
    const stepped = reduce(ended, { ...expire, seconds: expire.seconds - 601 })
    expect(direct).toEqual(stepped)
    expect(direct).toMatchObject({
      stage: 'finished',
      runs: 1,
      filler: 'stopped',
    })
    expect(reduce(direct, { ...expire, seconds: 1 }).runs).toBe(1)
  })
  it('retains cumulative traded value into a second auction and counts each received bid set once', () => {
    let state = initialWorkspace(record, 'live')
    state = reduce(state, {
      type: 'advance',
      seconds: 601,
      expires: record.identity.availableUntil,
    })
    state = reduce(state, launch)
    state = reduce(state, { type: 'wallet-result', rejected: false })
    state = reduce(state, { type: 'receipt', reverted: false })
    state = reduce(state, { type: 'indexed', duration: record.duration })
    expect(state).toMatchObject({ traded: 123793332n, hasBids: false })
    state = reduce(state, { type: 'bids' })
    state = reduce(state, { type: 'bids' })
    expect(state).toMatchObject({ traded: 247586664n, hasBids: true })
  })
  it('never re-arms from a receipt or elapsed indexing wait', () => {
    let state = reduce(initialWorkspace(record, 'ready'), launch)
    state = reduce(state, { type: 'wallet-result', rejected: false })
    state = reduce(state, { type: 'receipt', reverted: false })
    state = reduce(state, {
      type: 'advance',
      seconds: 30,
      expires: record.identity.availableUntil,
    })
    expect(state.operation).toBe('indexing')
    expect(reduce(state, launch)).toBe(state)
    expect(mayLaunch(state, record, 'launcher', true, 'ready')).toBe(false)
    expect(reduce(state, { type: 'indexed', duration: 1800 }).stage).toBe(
      'live'
    )
  })
  it.each([
    'pending',
    'price-error',
    'auction-error',
    'metadata-error',
    'bounds',
    'error',
  ] as const)('blocks a fresh launch when %s', (data) => {
    expect(
      mayLaunch(
        initialWorkspace(record, 'ready'),
        record,
        'launcher',
        true,
        data
      )
    ).toBe(false)
  })
  it('crosses permissionless without claiming every connected wallet is a launcher', () => {
    const state = initialWorkspace(record, 'ready')
    expect(mayLaunch(state, record, 'member', true, 'ready')).toBe(false)
    const crossed = reduce(state, {
      type: 'advance',
      seconds: 3601,
      expires: record.identity.availableUntil,
    })
    expect(mayLaunch(crossed, record, 'member', true, 'ready')).toBe(true)
    expect(mayLaunch(crossed, record, 'visitor', true, 'ready')).toBe(false)
    expect(mayLaunch(crossed, record, 'launcher', false, 'ready')).toBe(false)
  })
  it('ends a no-bid auction without inventing progress; allows another round', () => {
    const initial = initialWorkspace(record, 'no-bids')
    const next = reduce(initial, {
      type: 'advance',
      seconds: 601,
      expires: record.identity.availableUntil,
    })
    expect(next).toMatchObject({ stage: 'preparing', runs: 1, progress: 0 })
    expect(mayLaunch(next, record, 'member', true, 'ready')).toBe(true)
  })
  it('does not turn a late receipt into a live expired rebalance', () => {
    let state = reduce(initialWorkspace(record, 'ready'), launch)
    state = reduce(state, { type: 'wallet-result', rejected: false })
    state = reduce(state, {
      type: 'advance',
      seconds: record.identity.availableUntil - state.now + 1,
      expires: record.identity.availableUntil,
    })
    state = reduce(state, { type: 'receipt', reverted: false })
    state = reduce(state, { type: 'indexed', duration: 1800 })
    expect(state).toMatchObject({ stage: 'finished', operation: 'idle' })
  })
  it('retains saved non-preset weights after rejection and discard', () => {
    let state = reduce(initialWorkspace(SOURCE_RECORDS.lcap, 'hybrid'), {
      type: 'edit',
    })
    state = reduce(state, { type: 'units', index: 1, value: '0.0375' })
    state = reduce(state, { type: 'save' })
    state = reduce(state, { ...launch, record: SOURCE_RECORDS.lcap })
    state = reduce(state, { type: 'wallet-result', rejected: true })
    state = reduce(state, { type: 'edit' })
    state = reduce(state, { type: 'units', index: 1, value: '0.05' })
    state = reduce(state, { type: 'discard' })
    expect(state.weights?.[1]).toBe('0.0375')
    expect(state.operation).toBe('rejected')
  })
})

describe('lab basket import boundary', () => {
  const tokens = SOURCE_RECORDS.lcap.tokens
  it('round trips all eight identities without changing a decimal string', () => {
    const values = tokens.map(() => '0.0375')
    expect(parseBasketCsv(basketCsv(tokens, values), tokens)).toEqual(values)
  })
  it.each(['duplicate', 'unknown', 'negative', 'missing', 'oversized'])(
    'rejects %s imports atomically',
    (failure) => {
      let csv = basketCsv(
        tokens,
        tokens.map(() => '0.0375')
      )
      if (failure === 'duplicate') csv += '\n' + csv.split('\n')[1]
      if (failure === 'unknown')
        csv = csv.replace(
          tokens[0].address,
          '0x0000000000000000000000000000000000000000'
        )
      if (failure === 'negative') csv = csv.replace('0.0375', '-1')
      if (failure === 'missing') csv = csv.split('\n').slice(0, -1).join('\n')
      if (failure === 'oversized') csv = 'x'.repeat(1_048_577)
      expect(() => parseBasketCsv(csv, tokens)).toThrow()
    }
  )
  it('calculates illustrative allocation with decimal-safe arithmetic', () => {
    expect(allocations(['1', '2'], ['2', '1'])).toEqual(['50.00%', '50.00%'])
    expect(allocations(['', '2'], ['2', '1'])).toEqual(['—', '—'])
    expect(allocations(['0', '0'], ['2', '1'])).toEqual(['—', '—'])
  })
})
