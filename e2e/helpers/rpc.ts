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
import type { HoldIdentity } from '../harness/hold'
import { REGISTRY, TEST_ADDRESS, YIELD_REGISTRY } from './registry'
import { selectorName } from './selectors'
import { loadSnapshot, snapshotExists } from './snapshots'

// Rich detail for an unmocked eth_call: names the function when known and
// points at the helper to model it in, so a red test reads as a fix recipe.
function unmockedCallDetail(chainId: number, to: string, selector: string) {
  return {
    chainId,
    to,
    selector,
    fn: selectorName(selector) ?? '(unknown selector)',
    hint: 'model in e2e/helpers/rpc.ts (or a per-test overrides.ethCall)',
  }
}

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

// Canonical cross-chain majors the app-wide portfolio/wallet updater reads
// balanceOf on for every connected session (not necessarily in any single
// fixture's capture). Registering them keeps the connected-wallet silent-zero
// honest for real tokens while an UNKNOWN address still fails loud (HARN-006).
for (const address of [
  // Mainnet
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  '0x853d955aCEf822Db058eb8505911ED77F175b99e', // FRAX
  '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3', // MIM
  '0x320623b8E4fF03373931769A31Fc52A4E78B5d70', // RSR
  // Base
  '0x4200000000000000000000000000000000000006', // WETH
  '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', // cbBTC
  '0xaB36452DbAC151bE02b16Ca17d8919826072f64a', // RSR
]) {
  knownTokenAddresses.add(address.toLowerCase())
}

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

// Register the common base ZAP stablecoins (USDbC / base USDC / base DAI) as
// KNOWN at module load. The wallet updater reads balanceOf on ZAP_TOKENS[base]
// for every connected base session, but their metadata is otherwise only seeded
// lazily in the NON-yield path (seedChainState → seedTokenMetadata). Without this,
// a connected base YIELD wallet read fails loud — and worse, order-dependently
// (an index spec running first in the worker would seed them; a yield spec first
// would not). The known-set must not depend on seedChainState() (HARN-006).
for (const token of COMMON_TOKEN_METADATA) {
  knownTokenAddresses.add(token.address.toLowerCase())
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

// stRSR staking WRITE functions (all void). wagmi's `useSimulateContract` fires
// an eth_call to simulate each before the write — including transiently, e.g. the
// stake flow briefly simulates `stakeAndDelegate` before the on-chain `delegates`
// read resolves and it settles to `stake`. That simulate targets a captured stRSR
// but its exact (amount-bearing) calldata is never captured, so it must be
// answered as an empty success or it fails loud (a race the full suite usually
// slips past but isolation catches). The REAL submitted tx is still asserted from
// txLog; a successful simulate does not change which call is submitted (that is
// decided at click time, after `delegates` has resolved to `stake`).
const STRSR_WRITE_SELECTORS = new Set([
  '0xa694fc3a', // stake(uint256)
  '0x735e6c7a', // stakeAndDelegate(uint256,address)
  '0x2e17de78', // unstake(uint256)
  '0xf3fef3a3', // withdraw(address,uint256)
  '0x2b187b2b', // cancelUnstake(uint256)
  '0x5c19a95c', // delegate(address)
])

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

// --- Yield-DTF (RToken) record/replay ---
// Yield views read almost everything from RPC via vendored ABIs, so the yield
// smokes replay a captured `address:calldata → return` map (captured live at a
// pinned block by scripts/capture-yield.ts). Gated behind an explicit toggle so
// the INDEX path is byte-for-byte unchanged: yieldReplay is off for every index
// test, and its captured feeds/versions never leak into the index tables.
// 0 = replay off (index tests). Non-zero = the chainId of the yield fixture
// under test — used to absorb pre-chain-switch transient reads (see below).
let yieldReplayChain = 0
let yieldSeeded = false
const yieldCallMap = new Map<string, Hex>()
// Every address that appears in the yield replay map — a token, facade, stToken,
// RToken, feed, or protocol contract we actually captured. Used to gate the
// connected-wallet silent-zero: a read on an address NOT in here (a wrong
// stToken, spender, or arbitrary contract) fails loud instead of looking like an
// honest empty wallet (CODEX HARN-006).
const knownYieldAddresses = new Set<string>()

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
// A single 32-byte zero word — the shape of an eth_getStorageAt answer (vs
// ZERO_RETURN's three words for uint/bool/address eth_call returns).
const ZERO_WORD: Hex = ('0x' + '0'.repeat(64)) as Hex

// Sentinel recorded by scripts/capture-yield.ts for an allow-failure probe that
// REVERTED on-chain at the pinned block (e.g. the config updater tries a legacy
// Broker.auctionLength() that reverts on a modern broker; the app reads it with
// allowFailure and ignores the failure). Contains non-hex chars so it can never
// collide with real return data. Replaying it as a genuine multicall
// success:false keeps the app on the exact branch it took on-chain — and keeps
// fail-loud honest: an UNcaptured read still logs, only captured reverts pass.
export const YIELD_REVERT_SENTINEL = '0xrevert'

// FacadeRead + FacadeAct per chain (mirrors src/utils/addresses.ts). On a yield
// page's FIRST render, `chainIdAtom` still holds its mainnet default and the
// route's chain hasn't propagated yet, so the read atoms briefly hit the
// mainnet facade (and a zero token address) before re-firing on the correct
// chain. Those transients carry no data and resolve on the next render; we
// absorb ONLY facade reads for a chain OTHER than the fixture under test (and
// zero-address reads), so a real miss on the fixture's OWN facade still fails
// loud.
// address:selector fallback for CLOCK-parameterized reads whose arg is a live
// timepoint (governor quorum(timepoint)/quorumNumerator(timepoint) — the app
// passes Date.now()/1000-100, so the exact calldata can't be pinned). Exactly
// one value is captured per address+selector; return it regardless of the arg.
const yieldSelectorMap = new Map<string, Hex>()
const CLOCK_PARAM_SELECTORS = new Set(['0xf8ce560a', '0x60c4247f'])

// The yield smoke calls this with the fixture's chainId before navigation; the
// base fixture resets it (0) at teardown so replay state never leaks into a
// following index test.
export function setYieldReplay(chainId: number | false) {
  yieldReplayChain = chainId || 0
}

// True only while a yield smoke/flow is driving the page. The subgraph mock
// consults this so index tests keep baseline behavior verbatim: a yield-context
// query (e.g. an index page incidentally polling a dtf-yield subgraph) is only
// served from the yield replay when a yield test is active — otherwise it gets
// the same empty shape the pre-yield suite returned.
export function isYieldReplayActive(): boolean {
  return yieldReplayChain !== 0
}


function seedYieldChainState() {
  if (yieldSeeded) return
  yieldSeeded = true
  for (const dtf of YIELD_REGISTRY) {
    const path = `${dtf.snapshotDir}/rtoken-chain-state.json`
    if (!snapshotExists(path)) continue
    const map = loadSnapshot<Record<string, Hex>>(path)
    // Keys are chain-scoped (`chainId:address:calldata`). The SAME address —
    // e.g. the RSR/USD Chainlink feed or Multicall3 — appears on both mainnet
    // and base with DIFFERENT captured values, so a chainless key would let one
    // chain replay the other's data (base loading last would win). The chainId
    // comes from the fixture that owns the file.
    for (const [key, value] of Object.entries(map)) {
      const scoped = `${dtf.chainId}:${key.toLowerCase()}`
      yieldCallMap.set(scoped, value)
      const [addr, calldata] = key.toLowerCase().split(':')
      knownYieldAddresses.add(addr)
      const selector = calldata.slice(0, 10)
      if (CLOCK_PARAM_SELECTORS.has(selector)) {
        yieldSelectorMap.set(`${dtf.chainId}:${addr}:${selector}`, value)
      }
    }
  }
}

function lookupYieldExact(chainId: number, to: string, data: string): Hex | undefined {
  seedYieldChainState()
  return yieldCallMap.get(`${chainId}:${to.toLowerCase()}:${data.toLowerCase()}`)
}

// Exact captured word for a storage slot, chain-scoped (a slot key is a bare
// 32-byte word — 0x + 64 hex — so it shares the yield map with calldata keys
// without colliding). No blanket fallback: an uncaptured slot fails loud.
function lookupYieldStorage(chainId: number, to: string, slot: string): Hex | undefined {
  seedYieldChainState()
  return yieldCallMap.get(`${chainId}:${to.toLowerCase()}:${slot.toLowerCase()}`)
}

function lookupYieldFallback(chainId: number, to: string, selector: string): Hex | undefined {
  if (CLOCK_PARAM_SELECTORS.has(selector)) {
    const hit = yieldSelectorMap.get(`${chainId}:${to.toLowerCase()}:${selector}`)
    if (hit) return hit
  }
  // NOTE: blanket hasRole/storage fallbacks were removed (audit P1) — read-only
  // overview needs neither, and a permissive `true` would let a future
  // role-gated write pass without modeling its real authorization. Model exact
  // (chain, address, role/slot) answers when the first write flow needs them.
  return undefined
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
  chainId: number,
  to: string,
  data: string,
  log: UnmockedLogger,
  overrides?: MockOverrides
): Hex {
  const selector = selectorOf(data)
  const override = overrides?.lookupEthCall(to, data)
  if (override) return override
  // Under yield replay the captured chain-scoped map is the ONLY source of
  // contract data — a self-contained branch that does NOT fall through to the
  // index `*:selector` wildcards or the $1 Chainlink default (audit P1: those
  // would silently answer an uncaptured yield read with plausible index data,
  // defeating the yield smokes' zero-unmocked guarantee). Only time/balance
  // infrastructure and the transient absorber back the captured map.
  if (yieldReplayChain) {
    // Pre-chain-switch transient: the yield page first renders at chainIdAtom's
    // default (and with a briefly-undefined token address) before the route's
    // chain propagates. A read off the fixture's chain, or on the zero address,
    // carries no data and re-fires correctly next render — absorb it. Reads AT
    // the fixture's chain on a real address still fail loud if uncaptured (so a
    // stuck-chain bug surfaces as an assertion failure, never a false green).
    if (chainId !== yieldReplayChain || to === ZERO_ADDRESS) return ZERO_RETURN
    // Per-test seed wins over captured data (e.g. seeding the connected wallet's
    // stRSR balance for an unstake — the replay map is wallet-agnostic). Use the
    // per-test EXACT override table, NOT lookupOverride — the latter carries index
    // `*:selector` wildcards + the $1 feed that must never leak into yield (P1).
    const seeded = overrides?.lookupEthCall(to, data)
    if (seeded) return seeded
    const exact = lookupYieldExact(chainId, to, data)
    if (exact) return exact
    const fallback = lookupYieldFallback(chainId, to, selector)
    if (fallback) return fallback
    if (selector === CLOCK) return clockValue()
    if (selector === '0x4d2301cc') {
      const [account] = decodeAbiParameters([{ type: 'address' }], (`0x${data.slice(10)}`) as Hex)
      const balance = overrides?.lookupEthBalance(account)
      return balance !== undefined
        ? encodeAbiParameters([{ type: 'uint256' }], [balance])
        : ETH_BALANCE
    }
    // Connecting a wallet fires the app-wide account updater: balanceOf/allowance
    // across the listed tokens. The test wallet holds nothing (except what a spec
    // seeds above), so 0 is the honest default — BUT only for a KNOWN token/
    // contract (captured in the yield replay, a registry basket token, or a common
    // token). A read on an unknown/wrong address falls through to fail-loud, so a
    // mis-seeded stToken or spender surfaces instead of looking empty (HARN-006).
    const isKnownAddr = (a: string) =>
      knownYieldAddresses.has(a.toLowerCase()) ||
      knownTokenAddresses.has(a.toLowerCase()) ||
      knownContractAddresses.has(a.toLowerCase())
    if (selector === '0x70a08231' && isKnownAddr(to)) {
      const [owner] = decodeAbiParameters([{ type: 'address' }], (`0x${data.slice(10)}`) as Hex)
      if (owner.toLowerCase() === TEST_ADDRESS.toLowerCase()) return ZERO_RETURN
    }
    if (selector === '0xdd62ed3e' && isKnownAddr(to)) {
      const [owner, spender] = decodeAbiParameters(
        [{ type: 'address' }, { type: 'address' }],
        (`0x${data.slice(10)}`) as Hex
      )
      if (owner.toLowerCase() === TEST_ADDRESS.toLowerCase() && isKnownAddr(spender)) {
        return ZERO_RETURN
      }
    }
    // FacadeRead.pendingUnstakings(rToken, draftEra, account) — the staking
    // withdraw updater's per-account read. Scope to a known facade, a KNOWN
    // rToken (1st arg), AND TEST_ADDRESS (3rd arg). A wrong facade, an unknown/
    // mis-seeded rToken, or a non-test account all fall through to fail-loud, so
    // a wrong-identity read surfaces instead of looking like an empty wallet
    // (HARN-007). The fresh wallet has none → empty Pending[] (offset + 0 length).
    // NOTE: draftEra (2nd arg) is intentionally NOT gated — it's a dynamic per-
    // rToken counter with no offline source of truth; the rToken+account identity
    // is what a regression would get wrong.
    if (selector === '0xe5cea2f6' && isKnownAddr(to)) {
      const [rToken, , account] = decodeAbiParameters(
        [{ type: 'address' }, { type: 'uint256' }, { type: 'address' }],
        (`0x${data.slice(10)}`) as Hex
      )
      if (
        account.toLowerCase() === TEST_ADDRESS.toLowerCase() &&
        isKnownAddr(rToken)
      ) {
        return `0x${'20'.padStart(64, '0')}${'0'.padStart(64, '0')}` as Hex
      }
    }
    // react-zapper's native-token sentinel: the connected-wallet portfolio
    // updater reads it (inside a multicall) but the wallet-less yield capture
    // omits it. The fresh wallet holds none → 0 is the honest default.
    if (to.toLowerCase() === '0xeeeeeeee14d718c2b47d9923deab1335e144eeee') {
      return ZERO_RETURN
    }
    // stRSR write-function SIMULATE on a known stRSR → empty success (void). See
    // STRSR_WRITE_SELECTORS. An unknown-address write simulate still fails loud.
    if (STRSR_WRITE_SELECTORS.has(selector) && isKnownAddr(to)) {
      return '0x' as Hex
    }
    log('unmocked eth_call', unmockedCallDetail(chainId, to, selector))
    return ZERO_RETURN
  }
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
  log('unmocked eth_call', unmockedCallDetail(chainId, to, selector))
  return ZERO_RETURN
}

function handleMulticall3(
  chainId: number,
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
  const results = calls.map((call) => {
    const returnData = handleSingleCall(chainId, call.target, call.callData, log, overrides)
    // A captured revert replays as a real allowFailure failure (success:false),
    // not a zero-word success — the app must see the on-chain outcome.
    return returnData === YIELD_REVERT_SENTINEL
      ? { success: false, returnData: '0x' as Hex }
      : { success: true, returnData }
  })

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

    case 'eth_getStorageAt': {
      // Yield replay serves exact captured slots (chain-scoped). The staking
      // withdraw updater reads the stToken draft-era slot on every render, so a
      // read-only staking smoke needs this — but only for the EXACT captured
      // (chain, address, slot). Off-chain / zero-address reads are pre-switch
      // transients (absorbed); an uncaptured slot on the fixture's chain fails
      // loud, never a blanket zero word (audit P1).
      if (yieldReplayChain) {
        const address = String((params?.[0] as string) ?? '').toLowerCase()
        const slot = String((params?.[1] as string) ?? '').toLowerCase()
        if (ctx.chainId !== yieldReplayChain || address === ZERO_ADDRESS) return ZERO_WORD
        const hit = lookupYieldStorage(ctx.chainId, address, slot)
        if (hit) return hit
        ctx.log('unmocked storage read', { chainId: ctx.chainId, address, slot })
        return ZERO_WORD
      }
      // Index path unchanged: fail loud (audit P1). The blanket zero-word answer
      // for any slot masked real storage-derived state.
      ctx.log('unmocked rpc method', { method })
      return '0x'
    }

    case 'eth_getLogs':
      return []

    case 'eth_getTransactionReceipt': {
      const hash = (params?.[0] as string | undefined)?.toLowerCase()
      // Require chain identity (audit P1): a tx submitted on one chain must not
      // resolve a receipt when queried from another chain's RPC host.
      const tx =
        hash &&
        ctx.txLog?.find(
          (entry) => entry.hash.toLowerCase() === hash && entry.chainId === ctx.chainId
        )
      if (!hash || !tx) {
        ctx.log('unmocked transaction receipt', { hash: hash ?? '(missing)', chainId: ctx.chainId })
        return null
      }
      const polls = ctx.receiptPolls?.get(hash) ?? 0
      ctx.receiptPolls?.set(hash, polls + 1)
      if (polls < tx.pendingPolls) return null
      return receiptFor(ctx.chainId, tx)
    }

    case 'eth_getTransactionByHash': {
      const hash = (params?.[0] as string | undefined)?.toLowerCase()
      const tx =
        hash &&
        ctx.txLog?.find(
          (entry) => entry.hash.toLowerCase() === hash && entry.chainId === ctx.chainId
        )
      if (!hash || !tx) {
        ctx.log('unmocked transaction lookup', { hash: hash ?? '(missing)', chainId: ctx.chainId })
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
      if (to === MULTICALL3) return handleMulticall3(ctx.chainId, data, ctx.log, ctx.overrides)
      const single = handleSingleCall(ctx.chainId, to, data, ctx.log, ctx.overrides)
      // A captured revert reached as a STANDALONE call (not inside a multicall):
      // the app read it with allowFailure, so a zero-word answer is inert. The
      // key is captured, so this is deterministic — not a fail-loud miss.
      return single === YIELD_REVERT_SENTINEL ? ZERO_RETURN : single
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
// Build the hold-gate identity for an RPC request. For eth_call, params[0] is
// `{ to, data }` — surface both so a hold can target one contract call by
// selector (calldata prefix), not just the coarse method.
function rpcHoldIdentity(method: string, params?: unknown[]): HoldIdentity {
  const call = Array.isArray(params) ? (params[0] as { to?: string; data?: string } | undefined) : undefined
  const to = call && typeof call === 'object' ? call.to : undefined
  const data = call && typeof call === 'object' ? call.data : undefined
  const base: HoldIdentity = { boundary: 'rpc', method, ...(to ? { to } : {}), ...(data ? { data } : {}) }

  // Surface inner calls of a multicall3 aggregate3 so a selector/`to` hold can
  // target a batched read (aggregate3 selector 0x82ad56cb).
  if (to?.toLowerCase() === MULTICALL3 && data?.toLowerCase().startsWith('0x82ad56cb')) {
    try {
      const decoded = decodeFunctionData({ abi: multicall3Abi, data: data as Hex })
      if (decoded.functionName === 'aggregate3') {
        const calls = decoded.args[0] as ReadonlyArray<{ target: string; callData: string }>
        return { ...base, inner: calls.map((c) => ({ to: c.target, data: c.callData })) }
      }
    } catch {
      // fall through to the un-decoded identity
    }
  }
  return base
}

export async function mockRpcRoutes(
  page: Page,
  log: UnmockedLogger,
  overrides?: MockOverrides,
  txLog?: readonly TxRecord[],
  requests?: BoundaryRequest[]
) {
  const receiptPolls = new Map<string, number>()
  for (const pattern of RPC_HOST_PATTERNS) {
    await page.route(pattern, async (route) => {
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
        for (const req of body as Array<{ method: string; params?: unknown[] }>) {
          await overrides?.holds.gate(rpcHoldIdentity(req.method, req.params))
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
      await overrides?.holds.gate(rpcHoldIdentity(single.method, single.params))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(rpcResult(single.id, handleRpcMethod(single.method, single.params, ctx))),
      })
    })
  }
}
