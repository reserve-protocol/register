import type { Page } from '@playwright/test'
import {
  decodeFunctionData,
  decodeAbiParameters,
  encodeAbiParameters,
  encodeFunctionResult,
  multicall3Abi,
  type Hex,
} from 'viem'
import type { UnmockedLogger } from './logger'
import type { MockOverrides } from './overrides'
import type { TxRecord } from './provider'
import type { BoundaryRequest } from './requests'
import { REGISTRY, TEST_ADDRESS } from './registry'
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
// misroute those paths. Non-registry fallback only: registry DTFs get their
// real captured version (v4 or v5) per-address via seedChainState.
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
const knownTokenAddresses = new Set<string>()
const knownContractAddresses = new Set<string>([TEST_ADDRESS.toLowerCase()])

const COMMON_TOKEN_METADATA = [
  {
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    name: 'USD Base Coin',
    symbol: 'USDbC',
    decimals: 6,
  },
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
  },
] as const

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

interface DtfMetadataSnapshot {
  dtf: {
    token: { address: string; name: string; symbol: string; decimals: number; totalSupply: string }
    stToken?: {
      id: string
      token?: { address: string; name: string; symbol: string; decimals: number; totalSupply: string }
      underlying?: { address: string; name: string; symbol: string; decimals: number }
      governance?: { id: string; timelock?: { id: string } }
    }
    ownerGovernance?: { id: string; timelock?: { id: string } }
    tradingGovernance?: { id: string; timelock?: { id: string } }
  }
}

const SELECTOR = {
  totalAssets: '0x01e1d114',
  totalSupply: '0x18160ddd',
  decimals: '0x313ce567',
  version: '0x54fd4d50',
  name: '0x06fdde03',
  symbol: '0x95d89b41',
} as const

const KNOWN_ZERO_SELECTORS = [
  '0x07089246',
  '0x160cbed7',
  '0x2656227d',
  '0x2cec11d4',
  '0x587cde1e',
  '0x91d14854',
  '0xb298a5a7',
  '0xb58131b0',
  '0xce3eb05c',
  '0xce96cb77',
] as const

let chainStateSeeded = false

function seedTokenMetadata(token: {
  address: string
  name: string
  symbol: string
  decimals: number
}) {
  const address = token.address.toLowerCase()
  knownTokenAddresses.add(address)
  callOverrides[`${address}:${SELECTOR.name}`] = encodeAbiParameters(
    [{ type: 'string' }],
    [token.name]
  )
  callOverrides[`${address}:${SELECTOR.symbol}`] = encodeAbiParameters(
    [{ type: 'string' }],
    [token.symbol]
  )
  callOverrides[`${address}:${SELECTOR.decimals}`] = encodeAbiParameters(
    [{ type: 'uint256' }],
    [BigInt(token.decimals)]
  )
}

function seedNestedTokenMetadata(value: unknown) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    for (const item of value) seedNestedTokenMetadata(item)
    return
  }
  const candidate = value as Record<string, unknown>
  if (
    typeof candidate.address === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.symbol === 'string' &&
    typeof candidate.decimals === 'number'
  ) {
    seedTokenMetadata(candidate as {
      address: string
      name: string
      symbol: string
      decimals: number
    })
  }
  for (const nested of Object.values(candidate)) seedNestedTokenMetadata(nested)
}

function seedChainState() {
  if (chainStateSeeded) return
  chainStateSeeded = true
  for (const dtf of REGISTRY) {
    const path = `${dtf.snapshotDir}/chain-state.json`
    if (!snapshotExists(path)) continue
    const state = loadSnapshot<ChainState>(path)
    const addr = dtf.address.toLowerCase()
    knownTokenAddresses.add(addr)
    knownContractAddresses.add(addr)
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
    for (const token of state.basketTokens) seedTokenMetadata(token)

    // Rebalance snapshots preserve metadata for assets that are being added or
    // removed and therefore may not yet appear in totalAssets(). Seed only the
    // exact captured token objects so active-auction views remain strict.
    const rebalancesPath = `${dtf.snapshotDir}/rebalances.json`
    if (snapshotExists(rebalancesPath)) {
      seedNestedTokenMetadata(loadSnapshot(rebalancesPath))
    }

    const metadata = loadSnapshot<DtfMetadataSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf
    const metadataTokens = [
      metadata.token,
      metadata.stToken?.token,
      metadata.stToken?.underlying,
    ].filter(Boolean) as Array<{
      address: string
      name: string
      symbol: string
      decimals: number
      totalSupply?: string
    }>
    for (const token of metadataTokens) {
      const tokenAddress = token.address.toLowerCase()
      seedTokenMetadata(token)
      if (token.totalSupply) {
        callOverrides[`${tokenAddress}:${SELECTOR.totalSupply}`] = encodeAbiParameters(
          [{ type: 'uint256' }],
          [BigInt(token.totalSupply)]
        )
      }
    }
    const knownContracts = [
      metadata.stToken?.id,
      metadata.stToken?.governance?.id,
      metadata.stToken?.governance?.timelock?.id,
      metadata.ownerGovernance?.id,
      metadata.ownerGovernance?.timelock?.id,
      metadata.tradingGovernance?.id,
      metadata.tradingGovernance?.timelock?.id,
    ].filter(Boolean) as string[]
    for (const contract of knownContracts) {
      knownContractAddresses.add(contract.toLowerCase())
      for (const selector of KNOWN_ZERO_SELECTORS) {
        callOverrides[`${contract.toLowerCase()}:${selector}`] = ZERO_RETURN
      }
    }
  }

  // These balances are polled by the wallet updater on every Base page and are
  // project constants, not arbitrary RPC identities.
  for (const token of COMMON_TOKEN_METADATA) seedTokenMetadata(token)
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
  const override = overrides?.lookupEthCall(to, data)
  if (override) return override
  if (selector === '0x70a08231' && knownTokenAddresses.has(to.toLowerCase())) {
    const [owner] = decodeAbiParameters(
      [{ type: 'address' }],
      (`0x${data.slice(10)}`) as Hex
    )
    if (
      owner.toLowerCase() === TEST_ADDRESS.toLowerCase() ||
      knownContractAddresses.has(owner.toLowerCase())
    ) {
      return ZERO_RETURN
    }
  }
  if (selector === '0xdd62ed3e' && knownTokenAddresses.has(to.toLowerCase())) {
    const [owner, spender] = decodeAbiParameters(
      [{ type: 'address' }, { type: 'address' }],
      (`0x${data.slice(10)}`) as Hex
    )
    if (
      owner.toLowerCase() === TEST_ADDRESS.toLowerCase() &&
      knownContractAddresses.has(spender.toLowerCase())
    ) {
      return ZERO_RETURN
    }
  }
  if (selector === LATEST_ROUND_DATA) return latestRoundData(to)
  if (selector === CLOCK) return clockValue()
  // Multicall3.getEthBalance(address) — honor a per-test balance override for
  // the decoded address (mirrors the eth_getBalance path); default 100 ETH.
  if (selector === '0x4d2301cc') {
    const [account] = decodeAbiParameters(
      [{ type: 'address' }],
      (`0x${data.slice(10)}`) as Hex
    )
    const balance = overrides?.lookupEthBalance(account)
    if (balance !== undefined) {
      return encodeAbiParameters([{ type: 'uint256' }], [balance])
    }
  }
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

// Per-worker monotonic block counter. eth_blockNumber ticks it on every call so
// block-keyed refetches observe a fresh block each poll (the manual issuance
// updater keys useWatchReadContracts off the block number — a constant block
// froze its post-tx allowance/balance refetch, which the issuance spec used to
// patch with a local ticking route; this promotes that fix into the shared mock).
// Receipts sit a confirmation margin BELOW the current tip, so confirmations are
// always satisfied relative to wherever the counter has ticked to.
let blockCounter = 0x1000000

function nextBlockNumber(): number {
  blockCounter += 1
  return blockCounter
}

function currentBlockNumber(): number {
  return blockCounter
}

const hexBlock = (n: number): string => '0x' + n.toString(16)

// Confirmation margin per chain — receipt.blockNumber must sit far enough below
// the CURRENT block to satisfy that chain's confirmation wait (Base historically
// needed 3). Generous margins keep useWaitForTransactionReceipt resolving.
const CONFIRMATION_MARGIN: Record<number, number> = {
  1: 6,
  8453: 6,
  56: 15,
}

function receiptFor(chainId: number, tx: TxRecord) {
  const margin = CONFIRMATION_MARGIN[chainId] ?? 6
  const receiptBlock = currentBlockNumber() - margin
  return {
    blockHash: '0x' + '1'.repeat(64),
    blockNumber: hexBlock(receiptBlock),
    contractAddress: null,
    cumulativeGasUsed: '0x5208',
    effectiveGasPrice: '0x3b9aca00',
    from: tx.from,
    gasUsed: '0x5208',
    logs: [],
    logsBloom: '0x' + '0'.repeat(512),
    status: tx.receiptStatus === 'success' ? '0x1' : '0x0',
    to: tx.to,
    // Echo the requested hash so a receipt corresponds to the tx that was sent
    // (the provider now issues a UNIQUE hash per eth_sendTransaction).
    transactionHash: tx.hash as Hex,
    transactionIndex: '0x0',
    type: '0x2',
  }
}

export interface RpcContext {
  chainId: number
  log: UnmockedLogger
  overrides?: MockOverrides
  txLog?: readonly TxRecord[]
  receiptPolls?: Map<string, number>
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
      return hexBlock(nextBlockNumber())

    case 'eth_gasPrice':
      return '0x3b9aca00'

    case 'eth_estimateGas':
      return '0x5208'

    case 'eth_getBalance': {
      // 100 ETH for everyone — the HTTP transport is the primary read path, so
      // a zero here (while the wallet provider says 100) renders
      // insufficient-balance states in connected flows. Per-test opt-out via
      // overrides.ethBalance(address, wei).
      const balanceOverride = ctx.overrides?.lookupEthBalance(
        String((params?.[0] as string) ?? '')
      )
      if (balanceOverride !== undefined) return '0x' + balanceOverride.toString(16)
      return '0x56bc75e2d63100000'
    }

    case 'eth_maxPriorityFeePerGas':
      return '0x3b9aca00'

    case 'eth_feeHistory':
      return {
        oldestBlock: hexBlock(currentBlockNumber()),
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

    case 'eth_getTransactionReceipt': {
      const hash = (params?.[0] as string | undefined)?.toLowerCase()
      const tx = hash && ctx.txLog?.find((entry) => entry.hash.toLowerCase() === hash)
      if (!hash || !tx) {
        ctx.log('unmocked transaction receipt', { hash: hash ?? '(missing)' })
        return null
      }
      const polls = ctx.receiptPolls?.get(hash) ?? 0
      ctx.receiptPolls?.set(hash, polls + 1)
      if (polls < tx.pendingPolls) return null
      return receiptFor(ctx.chainId, tx)
    }

    case 'eth_getTransactionByHash': {
      const hash = (params?.[0] as string | undefined)?.toLowerCase()
      const tx = hash && ctx.txLog?.find((entry) => entry.hash.toLowerCase() === hash)
      if (!hash || !tx) {
        ctx.log('unmocked transaction lookup', { hash: hash ?? '(missing)' })
        return null
      }
      return {
        blockHash: null,
        blockNumber: null,
        chainId: hexBlock(tx.chainId),
        from: tx.from,
        gas: '0x5208',
        gasPrice: '0x3b9aca00',
        hash: tx.hash,
        input: tx.data,
        nonce: '0x0',
        to: tx.to,
        transactionIndex: null,
        type: '0x2',
        value: tx.value,
      }
    }

    case 'eth_getBlockByNumber': {
      // Echo a requested block number verbatim (coherent history reads). For a
      // moving tag ('latest'/'pending'/...) TICK the counter: the app's blockAtom
      // is fed by useBlock({ watch: true }), which polls THIS method (not
      // eth_blockNumber) — a constant number here froze block-keyed refetches.
      const tag = params?.[0] as string | undefined
      const blockNumber =
        typeof tag === 'string' && tag.startsWith('0x')
          ? tag
          : hexBlock(nextBlockNumber())
      return {
        number: blockNumber,
        hash: '0x' + '0'.repeat(64),
        timestamp: '0x' + mockNowSeconds().toString(16),
        baseFeePerGas: '0x3b9aca00',
        gasLimit: '0x1c9c380',
        gasUsed: '0x0',
        transactions: [],
      }
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
  overrides?: MockOverrides,
  txLog?: readonly TxRecord[],
  requests?: BoundaryRequest[]
) {
  const receiptPolls = new Map<string, number>()
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
      const ctx: RpcContext = { chainId, log, overrides, txLog, receiptPolls }

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
        for (const req of body as Array<{ method: string; params?: unknown[] }>) {
          requests?.push({
            boundary: 'rpc',
            chainId,
            method: req.method,
            params: req.params ?? [],
          })
        }
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
      requests?.push({
        boundary: 'rpc',
        chainId,
        method: single.method,
        params: single.params ?? [],
      })
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(rpcResult(single.id, handleRpcMethod(single.method, single.params, ctx))),
      })
    })
  }
}
