import { decodeAbiParameters } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { chainIdForUrl, handleRpcMethod, setYieldReplay, type RpcContext } from '../rpc'
import { MockOverrides } from '../overrides'
import type { TxRecord } from '../provider'
import { findDtfByAddress } from '../registry'

const HASH = `0x${'1'.repeat(64)}`

function transaction(receiptStatus: 'success' | 'revert' = 'success'): TxRecord {
  return {
    hash: HASH,
    chainId: 8453,
    from: '0x0000000000000000000000000000000000000001',
    to: '0x0000000000000000000000000000000000000002',
    data: '0x1234',
    value: '0x0',
    receiptStatus,
    pendingPolls: 1,
  }
}

function context(txLog: TxRecord[] = []): RpcContext {
  return {
    chainId: 8453,
    log: vi.fn(),
    txLog,
    receiptPolls: new Map(),
  }
}

describe('RPC transaction receipts', () => {
  it('rejects receipt requests for hashes the wallet never submitted', () => {
    const ctx = context()
    expect(handleRpcMethod('eth_getTransactionReceipt', [HASH], ctx)).toBeNull()
    expect(ctx.log).toHaveBeenCalledWith('unmocked transaction receipt', { hash: HASH })
  })

  it('returns pending before a correlated successful receipt', () => {
    const ctx = context([transaction()])
    expect(handleRpcMethod('eth_getTransactionReceipt', [HASH], ctx)).toBeNull()
    expect(handleRpcMethod('eth_getTransactionReceipt', [HASH], ctx)).toMatchObject({
      transactionHash: HASH,
      status: '0x1',
      to: '0x0000000000000000000000000000000000000002',
    })
  })

  it('serves a correlated reverted receipt when requested by a test', () => {
    const tx = transaction('revert')
    tx.pendingPolls = 0
    expect(
      handleRpcMethod('eth_getTransactionReceipt', [HASH], context([tx]))
    ).toMatchObject({ status: '0x0' })
  })
})

describe('native balance overrides', () => {
  const WALLET = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const DEFAULT_100_ETH = '0x56bc75e2d63100000'

  it('serves the shared 100 ETH default without an override', () => {
    expect(handleRpcMethod('eth_getBalance', [WALLET, 'latest'], context())).toBe(
      DEFAULT_100_ETH
    )
  })

  it('serves a per-test balance only for the overridden address', () => {
    const overrides = new MockOverrides()
    overrides.ethBalance(WALLET, 2000n * 10n ** 18n)
    const ctx = { ...context(), overrides }
    expect(handleRpcMethod('eth_getBalance', [WALLET.toLowerCase(), 'latest'], ctx)).toBe(
      '0x' + (2000n * 10n ** 18n).toString(16)
    )
    expect(
      handleRpcMethod(
        'eth_getBalance',
        ['0x0000000000000000000000000000000000000009', 'latest'],
        ctx
      )
    ).toBe(DEFAULT_100_ETH)
  })
})

describe('RPC URL chain routing', () => {
  it('distinguishes Ethereum, Base, and BSC hosts', () => {
    expect(chainIdForUrl('https://ethereum-rpc.publicnode.com')).toBe(1)
    expect(chainIdForUrl('https://base-mainnet.infura.io/v3/key')).toBe(8453)
    expect(chainIdForUrl('https://bsc-rpc.publicnode.com')).toBe(56)
  })
})

describe('yield record/replay', () => {
  const EUSD = '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f'
  const NAME = '0x06fdde03'
  const call = (to: string, data: string, ctx: RpcContext) =>
    handleRpcMethod('eth_call', [{ to, data }], ctx)

  it('replays a captured yield call and fails loud on an uncaptured one', () => {
    setYieldReplay(1) // eUSD is mainnet
    try {
      // Captured: the rToken name read returns real data (a non-empty string).
      const ctx = { ...context(), chainId: 1 }
      const name = decodeAbiParameters(
        [{ type: 'string' }],
        call(EUSD, NAME, ctx) as `0x${string}`
      )[0]
      expect(name).toBe('Electronic Dollar')

      // Uncaptured call on the fixture's OWN chain must fail loud (logged),
      // NOT be silently absorbed — absorption is only for wrong-chain transients.
      const missCtx = { ...context(), chainId: 1 }
      call(EUSD, '0xdeadbeef', missCtx)
      expect(missCtx.log).toHaveBeenCalledWith(
        'unmocked eth_call',
        expect.objectContaining({ to: EUSD })
      )
    } finally {
      setYieldReplay(false)
    }
  })

  it('absorbs a wrong-chain facade transient without logging', () => {
    setYieldReplay(8453) // viewing a base fixture
    try {
      // The mainnet FacadeRead is the wrong chain here → transient, absorbed.
      const ctx = { ...context(), chainId: 8453 }
      call('0x2c7ca56342177343a2954c250702fd464f4d0613', '0xa2f38585', ctx)
      expect(ctx.log).not.toHaveBeenCalled()
    } finally {
      setYieldReplay(false)
    }
  })
})

describe('address-specific protocol versions', () => {
  it('preserves captured v4 and v5 version gates', () => {
    const v5 = findDtfByAddress('0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8')!
    const v4 = findDtfByAddress('0x323c03c48660fe31186fa82c289b0766d331ce21')!
    const readVersion = (address: string, chainId: number) => {
      const result = handleRpcMethod(
        'eth_call',
        [{ to: address, data: '0x54fd4d50' }],
        { ...context(), chainId }
      ) as `0x${string}`
      return decodeAbiParameters([{ type: 'string' }], result)[0]
    }

    expect(readVersion(v5.address, v5.chainId)).toBe('5.0.0')
    expect(readVersion(v4.address, v4.chainId)).toBe('4.0.0')
  })
})
