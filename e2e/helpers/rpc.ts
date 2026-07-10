import type { Page } from '@playwright/test'
import {
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionResult,
  multicall3Abi,
  type Hex,
} from 'viem'
import type { UnmockedLogger } from './logger'
import type { MockOverrides } from './overrides'
import { REGISTRY } from './registry'
import { loadSnapshot, snapshotExists } from './snapshots'

// Glob patterns for every RPC host wagmi/viem may hit (mirrors registerRpcUrls
// in src/utils/rpc-urls.ts). Patterns match domain-only URLs too, so we use
// `**host**` rather than `**/host/**`.
export const RPC_HOST_PATTERNS = [
  '**publicnode.com**',
  '**tenderly.co**',
  '**infura.io**',
  '**alchemyapi.io**',
  '**alchemy.com**',
  '**ankr.com**',
  '**binance.org**',
  '**ninicoin.io**',
  '**defibit.io**',
  '**llamarpc.com**',
]

// Which chain a given RPC URL belongs to. Order matters: base/bsc host strings
// also contain "mainnet" (e.g. base-mainnet.infura.io), so match them first.
export function chainIdForUrl(url: string): number {
  const u = url.toLowerCase()
  if (u.includes('base')) return 8453
  if (/bsc|binance|ninicoin|defibit/.test(u)) return 56
  return 1 // ethereum-rpc / mainnet.* / eth-mainnet / default
}

const MULTICALL3 = '0xca11bde05977b3631167028862be2a173976ca11'

// 100,000 * 10^18 voting power — comfortably above every governance propose
// threshold so wallet-driven governance flows are actionable.
const VOTING_POWER: Hex = encodeAbiParameters(
  [{ type: 'uint256' }],
  [100_000n * 10n ** 18n]
)

// 3 zero words — decodes as 0 for uint/bool/address return types.
const ZERO_RETURN: Hex = ('0x' + '0'.repeat(192)) as Hex

// folio.version() — the SDK version-gates write ABIs; an empty string would
// misroute those paths. All registry DTFs are v5 (verified on-chain).
const FOLIO_VERSION: Hex = encodeAbiParameters([{ type: 'string' }], ['5.0.0'])

// folio.totalAssets() returns (address[], uint256[]); empty arrays keep basket
// reads well-formed (the vote flow doesn't need real balances). Registry DTFs
// override this per-address with real basket data (see seedChainState).
const EMPTY_ASSETS: Hex = encodeAbiParameters(
  [{ type: 'address[]' }, { type: 'uint256[]' }],
  [[], []]
)

// Properly ABI-encoded EMPTY address[] — a real dynamic-array head (offset 0x20,
// length 0), NOT ZERO_RETURN (whose leading word is an invalid array offset).
const EMPTY_ADDRESS_ARRAY: Hex = encodeAbiParameters([{ type: 'address[]' }], [[]])

// folio.getRebalance() v5 output tuple, idle (no active rebalance): nonce 0, no
// tokens, zero limits/timestamps, bids off. Keeps the auctions "idle" state from
// logging an unmocked read. Tuple shape copied verbatim from the viem-validated
// GET_REBALANCE_ABI in e2e/tests/flows/auctions.spec.ts.
const GET_REBALANCE_ABI = [
  {
    type: 'function',
    name: 'getRebalance',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'nonce', type: 'uint256' },
      { name: 'priceControl', type: 'uint8' },
      {
        name: 'tokens',
        type: 'tuple[]',
        components: [
          { name: 'token', type: 'address' },
          {
            name: 'weight',
            type: 'tuple',
            components: [
              { name: 'low', type: 'uint256' },
              { name: 'spot', type: 'uint256' },
              { name: 'high', type: 'uint256' },
            ],
          },
          {
            name: 'price',
            type: 'tuple',
            components: [
              { name: 'low', type: 'uint256' },
              { name: 'high', type: 'uint256' },
            ],
          },
          { name: 'maxAuctionSize', type: 'uint256' },
          { name: 'inRebalance', type: 'bool' },
        ],
      },
      {
        name: 'limits',
        type: 'tuple',
        components: [
          { name: 'low', type: 'uint256' },
          { name: 'spot', type: 'uint256' },
          { name: 'high', type: 'uint256' },
        ],
      },
      {
        name: 'timestamps',
        type: 'tuple',
        components: [
          { name: 'startedAt', type: 'uint256' },
          { name: 'restrictedUntil', type: 'uint256' },
          { name: 'availableUntil', type: 'uint256' },
        ],
      },
      { name: 'bidsEnabled_', type: 'bool' },
    ],
  },
] as const

const IDLE_REBALANCE: Hex = encodeFunctionResult({
  abi: GET_REBALANCE_ABI,
  functionName: 'getRebalance',
  result: [
    0n,
    0,
    [],
    { low: 0n, spot: 0n, high: 0n },
    { startedAt: 0n, restrictedUntil: 0n, availableUntil: 0n },
    false,
  ],
})

// Multicall3.getEthBalance(address) — mirror the 100 ETH eth_getBalance answers.
const ETH_BALANCE: Hex = encodeAbiParameters([{ type: 'uint256' }], [100n * 10n ** 18n])

// Per-(address, selector) override table for eth_call return data.
// Key is `${address}:${selector}` (address lowercased) or `*:${selector}` for
// address-agnostic answers. Seeded with the getVotes/getPastVotes family so
// governance UIs see voting power. Extend this as flows need specific reads.
const callOverrides: Record<string, Hex> = {
  '*:0x9ab24eb0': VOTING_POWER, // getVotes(address)
  '*:0xeb9019d4': VOTING_POWER, // getVotes(address,uint256)
  '*:0x3a46b1a8': VOTING_POWER, // getPastVotes(address,uint256)
  '*:0x8e539e8c': VOTING_POWER, // getPastTotalSupply(uint256) — vote-token snapshot supply
  // castVote(uint256,uint8) returns the weight cast — non-zero so
  // useSimulateContract succeeds and the vote button becomes ready.
  '*:0x56781388': VOTING_POWER,
  // version() fallback for NON-registry addresses only — protocol version is
  // per-DTF and version-gates write ABIs, so registry folios get their real
  // on-chain version via an address-specific chain-state override.
  '*:0x54fd4d50': FOLIO_VERSION,
  '*:0x01e1d114': EMPTY_ASSETS, // totalAssets() — registry DTFs get real baskets (chain-state)
  '*:0x70a08231': ZERO_RETURN, // balanceOf(address) — folio/wallet token balances
  '*:0x4d2301cc': ETH_BALANCE, // Multicall3.getEthBalance(address)
  '*:0xaa3b5568': IDLE_REBALANCE, // getRebalance() — no active rebalance by default
  // Fee-display reads on the DTF container (peripheral to governance). A DTF
  // with no DAO fee registry reads as fee-free — a valid, deterministic state.
  '*:0x9980cb23': ZERO_RETURN, // daoFeeRegistry() → zero address
  '*:0x23409f42': ZERO_RETURN, // getFeeDetails() on the (zero) fee registry
  '*:0xb7d6ca64': ZERO_RETURN, // native-token fee/price probe on the eEeE… sentinel
  // Settings-page reads on the staking vault / DTF (surfaced by settings.spec).
  '*:0x490c98f5': ZERO_RETURN, // tokenJar() → zero address
  '*:0x12edb24c': EMPTY_ADDRESS_ARRAY, // getAllRewardTokens() → empty
  '*:0x834e630f': ZERO_RETURN, // getPendingFeeShares() → 0
}

// --- Chain-state seeding ---
// Address-specific answers for every registry DTF, captured live by
// `pnpm e2e:capture --only=chain` into snapshots/<chain>/<slug>/chain-state.json:
// the folio's real basket (totalAssets), supply, decimals and protocol version,
// plus name/symbol/decimals for each basket token (the SDK's getBasket runs a
// metadata multicall over the basket after totalAssets). Loaded lazily once —
// per-test overrides still beat these, these beat the `*:` wildcards.

interface ChainState {
  totalAssets: { tokens: string[]; amounts: string[] }
  totalSupply: string
  decimals: number
  version: string
  basketTokens: Array<{ address: string; name: string; symbol: string; decimals: number }>
}

const SELECTOR = {
  totalAssets: '0x01e1d114',
  totalSupply: '0x18160ddd',
  decimals: '0x313ce567',
  version: '0x54fd4d50',
  name: '0x06fdde03',
  symbol: '0x95d89b41',
} as const

let chainStateSeeded = false
function seedChainState() {
  if (chainStateSeeded) return
  chainStateSeeded = true
  for (const dtf of REGISTRY) {
    const path = `${dtf.snapshotDir}/chain-state.json`
    if (!snapshotExists(path)) continue
    const state = loadSnapshot<ChainState>(path)
    const addr = dtf.address.toLowerCase()
    callOverrides[`${addr}:${SELECTOR.totalAssets}`] = encodeAbiParameters(
      [{ type: 'address[]' }, { type: 'uint256[]' }],
      [state.totalAssets.tokens as Hex[], state.totalAssets.amounts.map(BigInt)]
    )
    callOverrides[`${addr}:${SELECTOR.totalSupply}`] = encodeAbiParameters(
      [{ type: 'uint256' }],
      [BigInt(state.totalSupply)]
    )
    // uint8 occupies the same 32-byte word as uint256 — encode as uint256 so
    // viem's types accept a bigint.
    callOverrides[`${addr}:${SELECTOR.decimals}`] = encodeAbiParameters(
      [{ type: 'uint256' }],
      [BigInt(state.decimals)]
    )
    callOverrides[`${addr}:${SELECTOR.version}`] = encodeAbiParameters(
      [{ type: 'string' }],
      [state.version]
    )
    for (const token of state.basketTokens) {
      const tokenAddr = token.address.toLowerCase()
      callOverrides[`${tokenAddr}:${SELECTOR.name}`] = encodeAbiParameters([{ type: 'string' }], [token.name])
      callOverrides[`${tokenAddr}:${SELECTOR.symbol}`] = encodeAbiParameters([{ type: 'string' }], [token.symbol])
      callOverrides[`${tokenAddr}:${SELECTOR.decimals}`] = encodeAbiParameters(
        [{ type: 'uint256' }],
        [BigInt(token.decimals)]
      )
    }
  }
}

// Chainlink AggregatorV3.latestRoundData() selector. Feeds are read all over the
// app for USD conversions; answer must be non-zero and updatedAt must be fresh
// or staleness guards reject it. Answers are 8-decimal USD prices; unknown feeds
// default to $1. Extend PRICE_FEEDS as flows need specific magnitudes.
const LATEST_ROUND_DATA = '0xfeaf968c'
const PRICE_FEEDS: Record<string, bigint> = {
  '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419': 3000n * 10n ** 8n, // ETH/USD (mainnet)
  '0xf4030086522a5beea4988f8ca5b36dbc97bee88c': 60_000n * 10n ** 8n, // BTC/USD (mainnet)
}

// Node-side view of "now". When a flow freezes the browser clock
// (helpers/clock.ts calls setMockNow), block/feed timestamps must follow the
// frozen time or in-app staleness math sees a skewed world.
const timeState: { nowMs: number | undefined } = { nowMs: undefined }

export function setMockNow(nowMs: number | undefined) {
  timeState.nowMs = nowMs
}

function mockNowSeconds(): number {
  return Math.floor((timeState.nowMs ?? Date.now()) / 1000)
}

function latestRoundData(to: string): Hex {
  const answer = PRICE_FEEDS[to.toLowerCase()] ?? 10n ** 8n
  const now = BigInt(mockNowSeconds())
  return encodeAbiParameters(
    [{ type: 'uint80' }, { type: 'int256' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'uint80' }],
    [1n, answer, now, now, 1n]
  )
}

// ERC-6372 clock() — governance reads it to clamp the getVotes() snapshot
// timepoint. Must track the frozen clock so the timepoint math stays sane; the
// exact value is irrelevant since getVotes answers VOTING_POWER at any timepoint.
const CLOCK = '0x91ddadf4'
function clockValue(): Hex {
  // uint48 on-chain, but a value fitting in 48 bits encodes to the same 32-byte
  // word as uint256; encode as uint256 so viem's types accept a bigint.
  return encodeAbiParameters([{ type: 'uint256' }], [BigInt(mockNowSeconds())])
}

function selectorOf(data: string): string {
  return data.slice(0, 10).toLowerCase()
}

function lookupOverride(to: string, data: string): Hex | undefined {
  seedChainState()
  const selector = selectorOf(data)
  const addr = to.toLowerCase()
  return callOverrides[`${addr}:${selector}`] ?? callOverrides[`*:${selector}`]
}

// Answer one inner eth_call (used directly and for each Multicall3 sub-call).
// Per-test overrides win over the static table so a spec can change a read
// mid-test (e.g. a live vote tally after the vote tx).
function handleSingleCall(
  to: string,
  data: string,
  log: UnmockedLogger,
  overrides?: MockOverrides
): Hex {
  const selector = selectorOf(data)
  const override = overrides?.lookupEthCall(to, selector)
  if (override) return override
  if (selector === LATEST_ROUND_DATA) return latestRoundData(to)
  if (selector === CLOCK) return clockValue()
  const hit = lookupOverride(to, data)
  if (hit) return hit
  log('unmocked eth_call', { to, selector })
  return ZERO_RETURN
}

function handleMulticall3(
  data: string,
  log: UnmockedLogger,
  overrides?: MockOverrides
): Hex {
  const decoded = decodeFunctionData({ abi: multicall3Abi, data: data as Hex })
  if (decoded.functionName !== 'aggregate3') {
    log('unmocked multicall', { fn: decoded.functionName })
    return ZERO_RETURN
  }

  const calls = decoded.args[0] as ReadonlyArray<{ target: string; callData: string }>
  const results = calls.map((call) => ({
    success: true,
    returnData: handleSingleCall(call.target, call.callData, log, overrides),
  }))

  return encodeFunctionResult({
    abi: multicall3Abi,
    functionName: 'aggregate3',
    result: results,
  })
}

const BLOCK_NUMBER_INT = 0x1000000
const BLOCK_NUMBER = '0x' + BLOCK_NUMBER_INT.toString(16)
const MOCK_TX_HASH = ('0x' + 'a'.repeat(64)) as Hex

// Confirmation margin per chain — receipt.blockNumber must sit far enough below
// eth_blockNumber to satisfy that chain's confirmation wait (Base historically
// needed 3). Generous margins keep useWaitForTransactionReceipt resolving.
const CONFIRMATION_MARGIN: Record<number, number> = {
  1: 6,
  8453: 6,
  56: 15,
}

function receiptFor(chainId: number) {
  const margin = CONFIRMATION_MARGIN[chainId] ?? 6
  const receiptBlock = BLOCK_NUMBER_INT - margin
  return {
    blockHash: '0x' + '1'.repeat(64),
    blockNumber: '0x' + receiptBlock.toString(16),
    contractAddress: null,
    cumulativeGasUsed: '0x5208',
    effectiveGasPrice: '0x3b9aca00',
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    gasUsed: '0x5208',
    logs: [],
    logsBloom: '0x' + '0'.repeat(512),
    status: '0x1',
    to: '0x0000000000000000000000000000000000000000',
    transactionHash: MOCK_TX_HASH,
    transactionIndex: '0x0',
    type: '0x2',
  }
}

export interface RpcContext {
  chainId: number
  log: UnmockedLogger
  overrides?: MockOverrides
}

// Single dispatch point for JSON-RPC methods. Shared by the HTTP route mock and
// the injected wallet provider so wagmi gets identical answers either way.
export function handleRpcMethod(
  method: string,
  params: unknown[] | undefined,
  ctx: RpcContext
): unknown {
  switch (method) {
    case 'eth_chainId':
      return '0x' + ctx.chainId.toString(16)

    case 'net_version':
      return String(ctx.chainId)

    case 'eth_blockNumber':
      return BLOCK_NUMBER

    case 'eth_gasPrice':
      return '0x3b9aca00'

    case 'eth_estimateGas':
      return '0x5208'

    case 'eth_getBalance':
      // 100 ETH for everyone — the HTTP transport is the primary read path, so
      // a zero here (while the wallet provider says 100) renders
      // insufficient-balance states in connected flows.
      return '0x56bc75e2d63100000'

    case 'eth_maxPriorityFeePerGas':
      return '0x3b9aca00'

    case 'eth_feeHistory':
      return {
        oldestBlock: BLOCK_NUMBER,
        baseFeePerGas: ['0x3b9aca00', '0x3b9aca00'],
        gasUsedRatio: [0.5],
        reward: [['0x3b9aca00']],
      }

    case 'eth_getTransactionCount':
      return '0x0'

    case 'eth_getCode':
      // Non-empty bytecode so viem treats registry addresses as contracts.
      return '0x6080604052'

    case 'eth_getLogs':
      return []

    case 'eth_getTransactionReceipt':
      return receiptFor(ctx.chainId)

    case 'eth_getBlockByNumber':
      return {
        number: BLOCK_NUMBER,
        hash: '0x' + '0'.repeat(64),
        timestamp: '0x' + mockNowSeconds().toString(16),
        baseFeePerGas: '0x3b9aca00',
        gasLimit: '0x1c9c380',
        gasUsed: '0x0',
        transactions: [],
      }

    case 'eth_call': {
      const call = params?.[0] as { to?: string; data?: string } | undefined
      const to = (call?.to ?? '').toLowerCase()
      const data = call?.data ?? '0x'
      if (to === MULTICALL3) return handleMulticall3(data, ctx.log, ctx.overrides)
      return handleSingleCall(to, data, ctx.log, ctx.overrides)
    }

    default:
      // Same fail-loud net as unmocked eth_calls — a silent '0x' here hides
      // whole methods from the smoke gate.
      ctx.log('unmocked rpc method', { method })
      return '0x'
  }
}

function rpcResult(id: number, result: unknown) {
  return { jsonrpc: '2.0', id, result }
}

// Intercept all RPC hosts. Handles single requests and batched arrays (viem
// multicall batching). eth_chainId respects the URL's actual chain.
export async function mockRpcRoutes(
  page: Page,
  log: UnmockedLogger,
  overrides?: MockOverrides
) {
  for (const pattern of RPC_HOST_PATTERNS) {
    await page.route(pattern, (route) => {
      const request = route.request()
      if (request.method() !== 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x' }),
        })
      }

      const chainId = chainIdForUrl(request.url())
      const ctx: RpcContext = { chainId, log, overrides }

      let body: unknown
      try {
        body = request.postDataJSON()
      } catch {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, result: '0x' }),
        })
      }

      if (Array.isArray(body)) {
        const responses = body.map((req: { id: number; method: string; params?: unknown[] }) =>
          rpcResult(req.id, handleRpcMethod(req.method, req.params, ctx))
        )
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(responses),
        })
      }

      const single = body as { id: number; method: string; params?: unknown[] }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(rpcResult(single.id, handleRpcMethod(single.method, single.params, ctx))),
      })
    })
  }
}
