import { decodeAbiParameters, encodeAbiParameters, encodeFunctionData, parseAbi } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import { chainIdForUrl, handleRpcMethod, setYieldReplay, type RpcContext } from '../rpc'
import { MockOverrides } from '../overrides'
import type { TxRecord } from '../provider'
import { findDtfByAddress, TEST_ADDRESS } from '../registry'

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
    expect(ctx.log).toHaveBeenCalledWith(
      'unmocked transaction receipt',
      expect.objectContaining({ hash: HASH })
    )
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

  it('does not resolve a receipt when queried from the wrong chain (audit P1)', () => {
    const tx = transaction() // chainId 8453
    tx.pendingPolls = 0
    // Same hash, but the querying chain is mainnet — must fail loud, not return
    // a plausible receipt stamped with the wrong chain.
    const ctx = { ...context([tx]), chainId: 1 }
    expect(handleRpcMethod('eth_getTransactionReceipt', [HASH], ctx)).toBeNull()
    expect(ctx.log).toHaveBeenCalledWith(
      'unmocked transaction receipt',
      expect.objectContaining({ chainId: 1 })
    )
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

  it('replays a captured storage slot and fails loud on an uncaptured one', () => {
    // The staking withdraw updater reads the stToken draft-era slot via
    // eth_getStorageAt — an exact captured (chain, address, slot), no blanket word.
    const EUSD_ST = '0x18ba6e33ceb80f077deb9260c9111e62f21ae7b8'
    const SLOT = '0x0000000000000000000000000000000000000000000000000000000000000109'
    const ZERO_WORD = '0x' + '0'.repeat(64)
    setYieldReplay(1)
    try {
      const ctx = { ...context(), chainId: 1 }
      const word = handleRpcMethod('eth_getStorageAt', [EUSD_ST, SLOT, 'latest'], ctx)
      expect(word).not.toBe(ZERO_WORD)
      expect(ctx.log).not.toHaveBeenCalled()

      // An uncaptured slot on the fixture's chain fails loud (no blanket word).
      const missCtx = { ...context(), chainId: 1 }
      const miss = handleRpcMethod(
        'eth_getStorageAt',
        [EUSD_ST, '0x' + '0'.repeat(63) + '1', 'latest'],
        missCtx
      )
      expect(miss).toBe(ZERO_WORD)
      expect(missCtx.log).toHaveBeenCalledWith(
        'unmocked storage read',
        expect.objectContaining({ address: EUSD_ST })
      )
    } finally {
      setYieldReplay(false)
    }
  })

  it('replays a captured allow-failure revert without logging it as unmocked', () => {
    // The config updater probes a legacy Broker.auctionLength() that reverts on a
    // modern broker (captured as a revert). A standalone replay serves an inert
    // zero-return and does NOT fail loud — the key IS captured, just as a revert.
    const EUSD_BROKER = '0x90eb22a31b69c29c34162e0e9278cc0617aa2b50'
    const AUCTION_LENGTH = '0x325c25a2'
    const ZERO_RETURN = '0x' + '0'.repeat(192)
    setYieldReplay(1)
    try {
      const ctx = { ...context(), chainId: 1 }
      const result = call(EUSD_BROKER, AUCTION_LENGTH, ctx)
      expect(result).toBe(ZERO_RETURN)
      expect(ctx.log).not.toHaveBeenCalled()
    } finally {
      setYieldReplay(false)
    }
  })

  it('does NOT fall through to index wildcards / $1 feed when a yield read is uncaptured', () => {
    // version() (0x54fd4d50) and getVotes (0x9ab24eb0) have index `*:selector`
    // wildcards; latestRoundData (0xfeaf968c) has the $1 Chainlink default. On an
    // UNKNOWN yield address none are captured, so all three must fail loud —
    // otherwise the yield zero-unmocked guarantee is a lie (audit P1).
    setYieldReplay(1)
    try {
      const UNKNOWN = '0x00000000000000000000000000000000deadbe01'
      for (const selector of ['0x54fd4d50', '0x9ab24eb0', '0xfeaf968c']) {
        const ctx = { ...context(), chainId: 1 }
        call(UNKNOWN, selector, ctx)
        expect(ctx.log).toHaveBeenCalledWith(
          'unmocked eth_call',
          expect.objectContaining({ to: UNKNOWN })
        )
      }
    } finally {
      setYieldReplay(false)
    }
  })

  it('keys replay by chain: the same address on another chain does not leak', () => {
    // A shared address (Chainlink RSR/USD feed) is captured on BOTH chains with
    // different values. Requesting it as the base fixture must NOT return the
    // mainnet value (chainless keys had base overwrite mainnet — audit P0).
    const SHARED = '0x759bbc1be8f90ee6457c44abc7d443842a976d02' // feed, both chains
    const FEED = '0xfeaf968c' // latestRoundData
    setYieldReplay(1)
    const mainnetVal = call(SHARED, FEED, { ...context(), chainId: 1 })
    setYieldReplay(8453)
    const baseVal = call(SHARED, FEED, { ...context(), chainId: 8453 })
    setYieldReplay(false)
    // Both resolve to their OWN chain's captured value — and they differ.
    expect(mainnetVal).not.toBe(baseVal)
  })

  it('absorbs a pre-chain-switch transient (read off the fixture chain) unlogged', () => {
    setYieldReplay(8453) // viewing a base fixture
    try {
      // A read arriving at mainnet (chainId 1) while the base fixture is under
      // test is a pre-switch transient — absorbed, not logged, regardless of
      // which contract it targets.
      const ctx = { ...context(), chainId: 1 }
      call('0x2c7ca56342177343a2954c250702fd464f4d0613', '0xa2f38585', ctx)
      expect(ctx.log).not.toHaveBeenCalled()
    } finally {
      setYieldReplay(false)
    }
  })
})

describe('connected-wallet yield defaults (honest silent zero, not fail-loud)', () => {
  const call = (
    to: string,
    data: string,
    ctx: RpcContext,
    overrides?: MockOverrides
  ) => handleRpcMethod('eth_call', [{ to, data }], { ...ctx, overrides })
  const balanceOf = (owner: string) =>
    encodeFunctionData({
      abi: parseAbi(['function balanceOf(address)']),
      functionName: 'balanceOf',
      args: [owner as `0x${string}`],
    })
  const TOKEN = '0x00000000000000000000000000000000deadbe10'

  it('answers the TEST wallet balanceOf with 0, silently (no fail-loud storm)', () => {
    setYieldReplay(1)
    try {
      const ctx = { ...context(), chainId: 1 }
      const r = call(TOKEN, balanceOf(TEST_ADDRESS), ctx) as `0x${string}`
      expect(BigInt(r)).toBe(0n)
      expect(ctx.log).not.toHaveBeenCalled()
    } finally {
      setYieldReplay(false)
    }
  })

  it('STILL fails loud for a balanceOf of some OTHER address (not the test wallet)', () => {
    setYieldReplay(1)
    try {
      const ctx = { ...context(), chainId: 1 }
      call(TOKEN, balanceOf('0x000000000000000000000000000000000000beef'), ctx)
      expect(ctx.log).toHaveBeenCalledWith('unmocked eth_call', expect.anything())
    } finally {
      setYieldReplay(false)
    }
  })

  it('a per-test ethCall seed WINS over the zero default (and no index wildcard leak)', () => {
    setYieldReplay(1)
    const overrides = new MockOverrides()
    const cd = balanceOf(TEST_ADDRESS)
    overrides.ethCall(TOKEN, cd, encodeAbiParameters([{ type: 'uint256' }], [123n]))
    try {
      const ctx = { ...context(), chainId: 1 }
      const r = call(TOKEN, cd, ctx, overrides) as `0x${string}`
      expect(BigInt(r)).toBe(123n)
    } finally {
      setYieldReplay(false)
    }
  })

  it('FacadeRead.pendingUnstakings (0xe5cea2f6) returns an empty array, silently', () => {
    setYieldReplay(1)
    try {
      const ctx = { ...context(), chainId: 1 }
      const r = call('0x2c7ca56342177343a2954c250702fd464f4d0613', '0xe5cea2f6', ctx) as `0x${string}`
      const [pending] = decodeAbiParameters(
        [{ type: 'tuple[]', components: [{ type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }] }],
        r
      )
      expect(pending).toEqual([])
      expect(ctx.log).not.toHaveBeenCalled()
    } finally {
      setYieldReplay(false)
    }
  })

  it('reads the zapper native sentinel as 0, silently', () => {
    setYieldReplay(1)
    try {
      const ctx = { ...context(), chainId: 1 }
      const r = call('0xeeeeeeee14d718c2b47d9923deab1335e144eeee', '0xb7d6ca64', ctx) as `0x${string}`
      expect(BigInt(r)).toBe(0n)
      expect(ctx.log).not.toHaveBeenCalled()
    } finally {
      setYieldReplay(false)
    }
  })
})

describe('failure-oriented unmocked messages', () => {
  it('names the function and points at the helper for an uncaptured yield read', () => {
    setYieldReplay(1)
    try {
      const ctx = { ...context(), chainId: 1 }
      // version() on an unknown address — must fail loud WITH a decoded name.
      handleRpcMethod(
        'eth_call',
        [{ to: '0x00000000000000000000000000000000deadbe02', data: '0x54fd4d50' }],
        ctx
      )
      expect(ctx.log).toHaveBeenCalledWith(
        'unmocked eth_call',
        expect.objectContaining({ fn: 'version()', hint: expect.stringContaining('rpc.ts') })
      )
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
