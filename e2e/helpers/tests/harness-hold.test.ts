import { describe, expect, it } from 'vitest'
import { HoldRegistry } from '../../harness/hold'

// Resolves true if `p` settles within a microtask turn, false if it's still
// pending — lets us assert a gate PARKS without a real timer.
async function settledSoon(p: Promise<unknown>): Promise<boolean> {
  return Promise.race([
    p.then(() => true),
    Promise.resolve().then(() => false),
  ])
}

describe('HoldRegistry', () => {
  it('passes through when no hold is registered', async () => {
    const reg = new HoldRegistry()
    expect(
      await settledSoon(reg.gate({ boundary: 'subgraph', operationName: 'GetIndexDTF' }))
    ).toBe(true)
  })

  it('parks a matching request until released, then passes through', async () => {
    const reg = new HoldRegistry()
    const handle = reg.add({ boundary: 'subgraph', operationName: 'GetIndexDTF' })

    const parked = reg.gate({ boundary: 'subgraph', operationName: 'GetIndexDTF' })
    expect(await settledSoon(parked)).toBe(false) // still frozen
    expect(handle.hits).toBe(1)
    expect(handle.released).toBe(false)

    handle.release()
    await expect(parked).resolves.toBeUndefined() // released
    expect(handle.released).toBe(true)

    // future matches pass straight through
    expect(
      await settledSoon(reg.gate({ boundary: 'subgraph', operationName: 'GetIndexDTF' }))
    ).toBe(true)
  })

  it('does not park a non-matching operation', async () => {
    const reg = new HoldRegistry()
    reg.add({ boundary: 'subgraph', operationName: 'GetIndexDTF' })
    expect(
      await settledSoon(reg.gate({ boundary: 'subgraph', operationName: 'GetIndexDtfProposals' }))
    ).toBe(true)
  })

  it('a boundary-only matcher (no operationName) parks every op on that boundary', async () => {
    const reg = new HoldRegistry()
    reg.add({ boundary: 'subgraph' })
    expect(
      await settledSoon(reg.gate({ boundary: 'subgraph', operationName: 'Anything' }))
    ).toBe(false)
    // ...but not a different boundary
    expect(await settledSoon(reg.gate({ boundary: 'rpc', method: 'eth_call' }))).toBe(true)
  })

  it('matches api pathname by substring', async () => {
    const reg = new HoldRegistry()
    reg.add({ boundary: 'api', pathname: '/current/dtf' })
    expect(
      await settledSoon(reg.gate({ boundary: 'api', pathname: '/current/dtf?address=0x1' }))
    ).toBe(false)
    expect(
      await settledSoon(reg.gate({ boundary: 'api', pathname: '/discover/dtfs' }))
    ).toBe(true)
  })

  it('matches rpc by method', async () => {
    const reg = new HoldRegistry()
    reg.add({ boundary: 'rpc', method: 'eth_call' })
    expect(await settledSoon(reg.gate({ boundary: 'rpc', method: 'eth_call' }))).toBe(false)
    expect(await settledSoon(reg.gate({ boundary: 'rpc', method: 'eth_blockNumber' }))).toBe(true)
  })

  it('matches one eth_call island by selector, not other calls on the same contract', async () => {
    const reg = new HoldRegistry()
    reg.add({ boundary: 'rpc', selector: '0xd17618bf' }) // toAssets
    // toAssets on the folio → parked
    expect(
      await settledSoon(
        reg.gate({ boundary: 'rpc', method: 'eth_call', to: '0xFOLIO', data: '0xd17618bf0000' })
      )
    ).toBe(false)
    // totalAssets on the SAME folio → passes through
    expect(
      await settledSoon(
        reg.gate({ boundary: 'rpc', method: 'eth_call', to: '0xFOLIO', data: '0x01e1d114' })
      )
    ).toBe(true)
  })

  it('matches a batched (multicall3) inner call by selector', async () => {
    const reg = new HoldRegistry()
    reg.add({ boundary: 'rpc', selector: '0xd17618bf' }) // toAssets, batched
    // aggregate3 carrying toAssets as an inner call → parked
    expect(
      await settledSoon(
        reg.gate({
          boundary: 'rpc',
          method: 'eth_call',
          to: '0xMULTICALL',
          data: '0x82ad56cb',
          inner: [{ to: '0xFOLIO', data: '0xd17618bf0000' }],
        })
      )
    ).toBe(false)
    // a batch without toAssets → passes through
    expect(
      await settledSoon(
        reg.gate({
          boundary: 'rpc',
          method: 'eth_call',
          to: '0xMULTICALL',
          data: '0x82ad56cb',
          inner: [{ to: '0xFOLIO', data: '0x01e1d114' }],
        })
      )
    ).toBe(true)
  })

  it('matches an eth_call island by target address (to)', async () => {
    const reg = new HoldRegistry()
    reg.add({ boundary: 'rpc', to: '0xFolio' })
    expect(
      await settledSoon(reg.gate({ boundary: 'rpc', method: 'eth_call', to: '0xFOLIO', data: '0xabc' }))
    ).toBe(false) // case-insensitive to-match
    expect(
      await settledSoon(reg.gate({ boundary: 'rpc', method: 'eth_call', to: '0xOTHER', data: '0xabc' }))
    ).toBe(true)
  })

  it('parks multiple concurrent requests and releases them all at once', async () => {
    const reg = new HoldRegistry()
    const handle = reg.add({ boundary: 'rpc', method: 'eth_call' })
    const a = reg.gate({ boundary: 'rpc', method: 'eth_call' })
    const b = reg.gate({ boundary: 'rpc', method: 'eth_call' })
    expect(handle.hits).toBe(2)
    expect(await settledSoon(a)).toBe(false)
    expect(await settledSoon(b)).toBe(false)
    handle.release()
    await expect(Promise.all([a, b])).resolves.toEqual([undefined, undefined])
  })

  it('releaseAll unblocks a forgotten hold (teardown safety)', async () => {
    const reg = new HoldRegistry()
    reg.add({ boundary: 'subgraph' })
    const parked = reg.gate({ boundary: 'subgraph', operationName: 'GetIndexDTF' })
    reg.releaseAll()
    await expect(parked).resolves.toBeUndefined()
  })
})
