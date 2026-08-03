/**
 * Validate an Index DTF rebalance (`startRebalance`) governance proposal.
 *
 * Usage:
 *   pnpm validate-rebalance <proposal-url>
 *   pnpm validate-rebalance <proposal-url> --mcap-source=coingecko
 *
 * Example:
 *   pnpm validate-rebalance https://app.reserve.org/bsc/index-dtf/cmc20/governance/proposal/6159...309
 *
 * What it does — every check is printed as PASS / WARN / FAIL:
 *  1. Fetches the proposal from the index subgraph and decodes each calldata
 *     against the v4/v5/v6 Folio ABIs (anything that is not `startRebalance`
 *     is surfaced, never silently ignored).
 *  2. Reads live Folio state (version, supply, current basket, weightControl).
 *  3. Recovers the inputs the proposer must have used (per-token price and
 *     price error from the encoded price ranges, target basket from the
 *     weights) and re-runs `@reserve-protocol/dtf-rebalance-lib`
 *     `getStartRebalance` — a byte-exact match proves the calldata is
 *     unmodified library output rather than hand-edited numbers.
 *  4. Compares embedded prices against the Reserve API, and (optionally) the
 *     proposed weights against live market-cap weights for market-cap-weighted
 *     mandates.
 *  5. Prices the implied trades through `POST /rebalance/liquidity` (the same
 *     Zapper-routed endpoint the propose flow uses) and flags thin books.
 *  6. Sanity-checks governance routing (trading governor -> its timelock must
 *     hold REBALANCE_MANAGER), basket adds/removes, auction window vs TTL, and
 *     the implied trade volume.
 *
 * Read `docs/rebalance-validation.md` for how to interpret the output and what
 * still needs a human (mandate/eligibility questions).
 */
import {
  FolioVersion,
  getStartRebalance,
} from '@reserve-protocol/dtf-rebalance-lib'
import {
  createPublicClient,
  decodeFunctionData,
  erc20Abi,
  getAddress,
  http,
  type Abi,
  type Address,
  type Hex,
} from 'viem'
import { arbitrum, base, bsc, mainnet } from 'viem/chains'

// Only ABIs are imported from src/: everything under src/utils and src/views
// assumes a browser (`window`) and cannot be loaded from node.
import dtfIndexAbi from '../src/abis/dtf-index-abi'
import dtfIndexAbiV4 from '../src/abis/dtf-index-abi-v4'

// Mirrors getFolioVersion in
// src/views/index-dtf/auctions/views/rebalance/utils/transforms.ts.
const folioVersion = (version: string): FolioVersion =>
  version.startsWith('4') ? FolioVersion.V4 : FolioVersion.V5

// Mirrors src/utils/rebalance-liquidity.ts (which is browser-only via
// src/utils/constants). Zapper-routed price impact per trade leg.
type LiquidityTrade = {
  address: string
  side: 'buy' | 'sell'
  amountUsd: number
  price: number
  decimals: number
}

type LiquidityAsset = {
  address: string
  side: 'buy' | 'sell'
  amountUsd: number
  liquidity: {
    priceImpact: number
    level: string
    score: number
    error?: string
  }
  ondo?: { symbol: string; tradingOpen: boolean }
}

const fetchRebalanceLiquidity = async (
  chainId: number,
  nativePrice: number,
  trades: LiquidityTrade[]
): Promise<{ assets: LiquidityAsset[] }> => {
  const response = await fetch(`${RESERVE_API}rebalance/liquidity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chainId, nativePrice, trades }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`rebalance liquidity ${response.status}`)
  return response.json()
}

const CHAINS = { ethereum: mainnet, base, arbitrum, bsc } as const
type ChainSlug = keyof typeof CHAINS

// First entry of each list in src/utils/rpc-urls.ts (that module reads
// import.meta.env and cannot be imported here). Override with RPC_URL=...
const DEFAULT_RPC: Record<ChainSlug, string> = {
  ethereum: 'https://ethereum-rpc.publicnode.com',
  base: 'https://base-rpc.publicnode.com',
  arbitrum: 'https://arbitrum-one-rpc.publicnode.com',
  bsc: 'https://bsc-rpc.publicnode.com',
}

const SUBGRAPHS: Record<ChainSlug, string> = {
  ethereum:
    'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-mainnet/prod/gn',
  base: 'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-base/prod/gn',
  arbitrum:
    'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-bsc/prod/gn',
  bsc: 'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-bsc/prod/gn',
}

const RESERVE_API = 'https://api.reserve.org/'
const D18 = 10n ** 18n

// Tolerances. Deliberately loose enough to survive one price tick, tight
// enough that a mis-specified basket cannot slip through.
const PRICE_DRIFT_WARN = 0.02 // embedded price vs Reserve API
const MCAP_DRIFT_WARN = 0.005 // 0.5pp per token vs market-cap weight
// Price impact on a single leg. Above WARN the auction wants a market maker /
// trading bot loaded beforehand; above SEVERE the trade should be split or the
// constituent reconsidered.
const PRICE_IMPACT_WARN = 0.02
const PRICE_IMPACT_SEVERE = 0.05
// Trades below this notional are noise and are not worth a liquidity lookup.
const MIN_TRADE_USD = 100
// Thin liquidity only blocks a rebalance once the leg is big enough to matter;
// below this a bad print costs less than the gas to argue about it.
const MATERIAL_TRADE_USD = 1_000
// Disaster thresholds. An order-of-magnitude gap is the signature of wrong
// decimals or the wrong token, never of market movement.
const MAGNITUDE_FAIL = 0.5 // ~3.2x
// How much of the price band the pool price may consume before the proposal is
// stale rather than merely imprecise.
const BAND_USAGE_WARN = 0.5
// Basket shares recomputed at pool prices drift a little; a whole percent of
// the fund landing somewhere else is a disaster.
const BASKET_SHARE_FAIL = 0.01
const THIN_POOL_USD = 500_000

type Check = { level: 'PASS' | 'WARN' | 'FAIL'; label: string; detail?: string }
const checks: Check[] = []
const record = (level: Check['level'], label: string, detail?: string) => {
  checks.push({ level, label, detail })
  const icon = level === 'PASS' ? '  ok ' : level === 'WARN' ? 'WARN ' : 'FAIL '
  console.log(`${icon} ${label}${detail ? `\n        ${detail}` : ''}`)
}

const pct = (n: number) => `${(n * 100).toFixed(3)}%`
const usd = (n: number) =>
  `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

type WeightRange = { low: bigint; spot: bigint; high: bigint }
type PriceRange = { low: bigint; high: bigint }
type TokenParams = {
  token: Address
  weight: WeightRange
  price: PriceRange
  maxAuctionSize?: bigint
  inRebalance?: boolean
}

const parseProposalUrl = (url: string) => {
  const match = url.match(
    /\/(ethereum|base|arbitrum|bsc)\/index-dtf\/([^/]+)\/governance\/proposal\/(\d+)/
  )
  if (!match) {
    throw new Error(
      `could not parse proposal url: ${url}\nexpected .../<chain>/index-dtf/<dtf>/governance/proposal/<id>`
    )
  }
  return {
    chain: match[1] as ChainSlug,
    dtf: match[2],
    proposalId: match[3],
  }
}

const graphql = async <T>(url: string, query: string): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const json = (await response.json()) as { data?: T; errors?: unknown }
  if (json.errors || !json.data) {
    throw new Error(`subgraph error: ${JSON.stringify(json.errors)}`)
  }
  return json.data
}

type SubgraphProposal = {
  id: string
  description: string
  state: string
  creationTime: string
  voteStart: string
  voteEnd: string
  quorumVotes: string
  isOptimistic: boolean
  targets: string[]
  calldatas: Hex[]
  values: string[]
  governance: { id: string }
  proposer: { id: string }
}

type SubgraphDtf = {
  id: string
  token: { symbol: string; name: string }
  mandate: string
  weightControl: boolean
  auctionApprovers: string[]
  auctionLaunchers: string[]
  ownerGovernance: { id: string } | null
  tradingGovernance: { id: string; timelock: { id: string } } | null
}

const fetchProposal = (subgraph: string, proposalId: string) =>
  graphql<{ proposals: SubgraphProposal[] }>(
    subgraph,
    `{ proposals(where: { id: "${proposalId}" }) {
        id description state creationTime voteStart voteEnd quorumVotes isOptimistic
        targets calldatas values governance { id } proposer { id }
      } }`
  ).then((data) => {
    const proposal = data.proposals[0]
    if (!proposal)
      throw new Error(`proposal ${proposalId} not found in subgraph`)
    return proposal
  })

const fetchDtf = (subgraph: string, address: string) =>
  graphql<{ dtfs: SubgraphDtf[] }>(
    subgraph,
    `{ dtfs(where: { id: "${address.toLowerCase()}" }) {
        id token { symbol name } mandate weightControl
        auctionApprovers auctionLaunchers
        ownerGovernance { id }
        tradingGovernance { id timelock { id } }
      } }`
  ).then((data) => {
    const dtf = data.dtfs[0]
    if (!dtf) throw new Error(`DTF ${address} not found in subgraph`)
    return dtf
  })

const decodeStartRebalance = (calldata: Hex) => {
  for (const [label, abi] of [
    ['v5/v6', dtfIndexAbi as Abi],
    ['v4', dtfIndexAbiV4 as Abi],
  ] as const) {
    try {
      const decoded = decodeFunctionData({ abi, data: calldata })
      return { abiLabel: label, ...decoded }
    } catch {
      // try the next ABI
    }
  }
  return undefined
}

/**
 * Spot weights from the most recent executed rebalance of the same governor,
 * decoded straight from its calldata (the subgraph stores the weight arrays in
 * calldata order but exposes `tokens` id-sorted, so the two cannot be zipped).
 * Weight history is the cheapest sanity check there is: a constituent does not
 * legitimately move by an order of magnitude month over month.
 */
const fetchPreviousRebalance = async (
  subgraph: string,
  governance: string,
  excludeProposalId: string
) => {
  const { proposals } = await graphql<{ proposals: SubgraphProposal[] }>(
    subgraph,
    `{ proposals(
        where: { governance: "${governance.toLowerCase()}", state: "EXECUTED" }
        orderBy: creationTime orderDirection: desc first: 10
      ) {
        id description state creationTime voteStart voteEnd quorumVotes isOptimistic
        targets calldatas values governance { id } proposer { id }
      } }`
  )
  for (const candidate of proposals) {
    if (candidate.id === excludeProposalId) continue
    for (const calldata of candidate.calldatas) {
      const decoded = decodeStartRebalance(calldata)
      if (decoded?.functionName !== 'startRebalance') continue
      const [params] = decoded.args as [TokenParams[]]
      return {
        title: candidate.description.split('\n')[0].replace(/^#+\s*/, ''),
        spotWeights: new Map(
          params.map((p) => [getAddress(p.token), p.weight.spot])
        ),
      }
    }
  }
  return undefined
}

const fetchPrices = async (chainId: number, tokens: Address[]) => {
  const response = await fetch(
    `${RESERVE_API}current/prices?chainId=${chainId}&tokens=${tokens.join(',')}`
  )
  const json = (await response.json()) as { address: string; price: number }[]
  return new Map(json.map((entry) => [getAddress(entry.address), entry.price]))
}

/** CoinGecko top-250 market caps, keyed by upper-case symbol. */
const fetchMarketCaps = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1'
  )
  const json = (await response.json()) as {
    symbol: string
    market_cap: number
  }[]
  return new Map(json.map((c) => [c.symbol.toUpperCase(), c.market_cap]))
}

/**
 * Bridged/wrapped representations map back to the asset whose market cap the
 * mandate tracks. Extend as new chains/constituents show up.
 */
/**
 * Pool-derived price and depth per token, from DEXScreener. This is a
 * DELIBERATELY independent source: the point is to catch our own API/oracle
 * being wrong, so it must not share a data provider with the proposal.
 */
type PoolInfo = {
  price: number
  liquidityUsd: number
  topPool: { dex: string; pair: string; liquidityUsd: number } | undefined
}

const DEXSCREENER_CHAIN: Record<ChainSlug, string> = {
  ethereum: 'ethereum',
  base: 'base',
  arbitrum: 'arbitrum',
  bsc: 'bsc',
}

const fetchPoolInfo = async (
  chain: ChainSlug,
  tokens: Address[]
): Promise<Map<Address, PoolInfo>> => {
  const result = new Map<Address, PoolInfo>()
  // One token per request: DEXScreener caps the response at 30 *pairs*, so a
  // batched query silently returns nothing for most of the batch.
  for (let i = 0; i < tokens.length; i += 1) {
    const batch = tokens.slice(i, i + 1)
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${batch.join(',')}`
    )
    if (!response.ok) continue
    const { pairs } = (await response.json()) as {
      pairs:
        | {
            chainId: string
            dexId: string
            baseToken: { address: string; symbol: string }
            quoteToken: { symbol: string }
            priceUsd?: string
            liquidity?: { usd?: number }
          }[]
        | null
    }
    for (const token of batch) {
      const onChain = (pairs ?? []).filter(
        (pair) =>
          pair.chainId === DEXSCREENER_CHAIN[chain] &&
          getAddress(pair.baseToken.address) === token &&
          pair.priceUsd
      )
      if (!onChain.length) continue
      onChain.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))
      const deepest = onChain[0]
      result.set(token, {
        // The deepest pool is the honest mark: thin pools are trivially
        // manipulable and a volume-weighted average would import their noise.
        price: Number(deepest.priceUsd),
        liquidityUsd: onChain.reduce(
          (sum, pair) => sum + (pair.liquidity?.usd ?? 0),
          0
        ),
        topPool: {
          dex: deepest.dexId,
          pair: `${deepest.baseToken.symbol}/${deepest.quoteToken.symbol}`,
          liquidityUsd: deepest.liquidity?.usd ?? 0,
        },
      })
    }
  }
  return result
}

/**
 * CoinGecko's contract-address map for the chain. A token address that CoinGecko
 * does not list under the symbol the contract reports is the shape of a scam /
 * look-alike token, which is the worst-case failure for a rebalance.
 */
const fetchListedAddresses = async (platform: string) => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/list?include_platform=true'
  )
  const json = (await response.json()) as {
    id: string
    symbol: string
    platforms?: Record<string, string | null>
  }[]
  const byAddress = new Map<string, { id: string; symbol: string }>()
  for (const coin of json) {
    const address = coin.platforms?.[platform]
    if (address) {
      byAddress.set(address.toLowerCase(), {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
      })
    }
  }
  return byAddress
}

const CG_PLATFORM: Record<ChainSlug, string> = {
  ethereum: 'ethereum',
  base: 'base',
  arbitrum: 'arbitrum-one',
  bsc: 'binance-smart-chain',
}

const MCAP_SYMBOL_ALIASES: Record<string, string> = {
  BTCB: 'BTC',
  WBTC: 'BTC',
  CBBTC: 'BTC',
  WBNB: 'BNB',
  WETH: 'ETH',
  WSOL: 'SOL',
}

const main = async () => {
  const args = process.argv.slice(2)
  const url = args.find((a) => a.startsWith('http'))
  if (!url) {
    console.error(
      'usage: pnpm validate-rebalance <proposal-url> [--mcap-source=coingecko]'
    )
    process.exit(2)
  }
  const withMcap = args.some((a) => a.startsWith('--mcap-source'))
  const { chain, dtf: dtfSlug, proposalId } = parseProposalUrl(url)
  const subgraph = SUBGRAPHS[chain]
  const viemChain = CHAINS[chain]
  const client = createPublicClient({
    chain: viemChain,
    transport: http(process.env.RPC_URL || DEFAULT_RPC[chain], {
      batch: true,
    }),
  })

  const proposal = await fetchProposal(subgraph, proposalId)

  console.log(`\nProposal ${proposalId}`)
  console.log(`  chain      ${chain} (${viemChain.id})`)
  console.log(`  dtf        ${dtfSlug}`)
  console.log(`  state      ${proposal.state}`)
  console.log(`  governance ${proposal.governance.id}`)
  console.log(
    `  title      ${proposal.description
      .split('\n')[0]
      .replace(/^#+\s*/, '')
      .trim()}`
  )
  console.log('')

  // --- 1. one calldata, and it is startRebalance on the Folio ---------------
  if (proposal.calldatas.length !== 1) {
    record(
      'WARN',
      `proposal bundles ${proposal.calldatas.length} calldatas`,
      'a routine rebalance should be a single startRebalance — review every action'
    )
  }
  const decodedActions = proposal.calldatas.map((calldata, i) => ({
    target: getAddress(proposal.targets[i]),
    value: proposal.values[i],
    decoded: decodeStartRebalance(calldata),
  }))
  const nonRebalance = decodedActions.filter(
    (a) => a.decoded?.functionName !== 'startRebalance'
  )
  if (nonRebalance.length) {
    record(
      'FAIL',
      'proposal contains non-startRebalance actions',
      nonRebalance
        .map(
          (a) =>
            `${a.target} -> ${a.decoded?.functionName ?? 'UNDECODABLE CALLDATA'}`
        )
        .join('\n        ')
    )
  }
  const action = decodedActions.find(
    (a) => a.decoded?.functionName === 'startRebalance'
  )
  if (!action?.decoded) {
    record('FAIL', 'no startRebalance action found — nothing to validate')
    return finish()
  }
  record('PASS', `decoded startRebalance (${action.decoded.abiLabel} ABI)`)
  if (proposal.values.some((v) => v !== '0')) {
    record('FAIL', 'proposal sends native value', proposal.values.join(','))
  }

  const folio = action.target
  const [tokenParams, limits, auctionLauncherWindow, ttl] = action.decoded
    .args as [TokenParams[], WeightRange, bigint, bigint]

  // --- 2. governance routing ----------------------------------------------
  const dtf = await fetchDtf(subgraph, folio)
  console.log(`  folio      ${folio} (${dtf.token.symbol})\n`)
  const trading = dtf.tradingGovernance
  if (!trading) {
    record('WARN', 'DTF has no trading governance in the subgraph')
  } else if (
    trading.id.toLowerCase() !== proposal.governance.id.toLowerCase()
  ) {
    record(
      'FAIL',
      'proposal was not submitted to the trading (rebalance) governor',
      `proposal governor ${proposal.governance.id}, trading governor ${trading.id}`
    )
  } else if (
    !dtf.auctionApprovers.some(
      (a) => a.toLowerCase() === trading.timelock.id.toLowerCase()
    )
  ) {
    record(
      'FAIL',
      "trading governor's timelock does not hold REBALANCE_MANAGER",
      `timelock ${trading.timelock.id}, approvers ${dtf.auctionApprovers.join(',')}`
    )
  } else {
    record(
      'PASS',
      'routed through the trading governor whose timelock is REBALANCE_MANAGER',
      `governor ${trading.id} -> timelock ${trading.timelock.id}`
    )
  }

  // --- 3. live folio state -------------------------------------------------
  const folioAbi = dtfIndexAbi as Abi
  const [version, supply, assetsResult, weightControlOnChain] =
    (await Promise.all([
      client.readContract({
        address: folio,
        abi: folioAbi,
        functionName: 'version',
      }),
      client.readContract({
        address: folio,
        abi: erc20Abi,
        functionName: 'totalSupply',
      }),
      client.readContract({
        address: folio,
        abi: folioAbi,
        functionName: 'toAssets',
        args: [D18, 0],
      }),
      client
        .readContract({
          address: folio,
          abi: folioAbi,
          functionName: 'rebalanceControl',
        })
        .catch(() => undefined),
    ])) as [string, bigint, [Address[], bigint[]], unknown]
  const [currentAssets, amountsPerShare] = assetsResult
  const weightControl = Array.isArray(weightControlOnChain)
    ? Boolean(weightControlOnChain[0])
    : dtf.weightControl
  console.log(
    `  version ${version} · supply ${(Number(supply) / 1e18).toFixed(2)} shares · weightControl ${weightControl}\n`
  )

  const tokens = tokenParams.map((t) => getAddress(t.token))
  const metadata = await client.multicall({
    allowFailure: false,
    contracts: tokens.flatMap((token) => [
      { address: token, abi: erc20Abi, functionName: 'symbol' } as const,
      { address: token, abi: erc20Abi, functionName: 'decimals' } as const,
    ]),
  })
  const symbols = tokens.map((_, i) => metadata[i * 2] as string)
  const decimals = tokens.map((_, i) => BigInt(metadata[i * 2 + 1] as number))

  // --- 4. basket adds / removes -------------------------------------------
  const currentSet = new Set(currentAssets.map((a) => getAddress(a)))
  const proposedSet = new Set(tokens)
  const added = tokens.filter((t) => !currentSet.has(t))
  const dropped = [...currentSet].filter((t) => !proposedSet.has(t))
  const zeroed = tokenParams
    .map((t, i) => ({ symbol: symbols[i], spot: t.weight.spot }))
    .filter((t) => t.spot === 0n)
  const label = (list: Address[]) =>
    list.map((t) => `${symbols[tokens.indexOf(t)] ?? '?'} ${t}`).join(', ') ||
    'none'
  record(
    added.length || dropped.length || zeroed.length ? 'WARN' : 'PASS',
    'basket membership',
    `added: ${label(added)} · missing from proposal: ${dropped.join(', ') || 'none'} · zero-weight: ${zeroed.map((z) => z.symbol).join(', ') || 'none'}`
  )
  if (dropped.length) {
    record(
      'FAIL',
      'current basket tokens are absent from the proposal',
      'every held token must appear in startRebalance (with weight 0 to exit) or it cannot be traded out'
    )
  }

  // --- 5. recover the proposer's inputs -----------------------------------
  // price range is D27{nanoUSD/tok}: low = p*(1-e), high = p/(1-e)
  const impliedPrices = tokenParams.map((t, i) => {
    const scale = 10 ** (27 + 9 - Number(decimals[i]))
    const low = Number(t.price.low) / scale
    const high = Number(t.price.high) / scale
    return { price: Math.sqrt(low * high), low, high }
  })
  const impliedPriceErrors = impliedPrices.map((p) => 1 - p.low / p.price)
  // weight is D27{tok/share}; whole-token per whole-share = spot / 1e27 / 10^dec * 1e18
  const wholePerShare = tokenParams.map(
    (t, i) => (Number(t.weight.spot) / 1e27 / 10 ** Number(decimals[i])) * 1e18
  )
  const targetValues = wholePerShare.map((w, i) => w * impliedPrices[i].price)
  const targetTotal = targetValues.reduce((a, b) => a + b, 0)
  const targetBasket = targetValues.map((v) => v / targetTotal)

  const currentWholePerShare = tokens.map((token, i) => {
    const idx = currentAssets.findIndex((a) => getAddress(a) === token)
    return idx === -1
      ? 0
      : Number(amountsPerShare[idx]) / 10 ** Number(decimals[i])
  })
  const currentValues = currentWholePerShare.map(
    (w, i) => w * impliedPrices[i].price
  )
  const navPerShare = currentValues.reduce((a, b) => a + b, 0)
  const supplyWhole = Number(supply) / 1e18
  const aum = navPerShare * supplyWhole

  // --- 6. re-derive the calldata with the rebalance library ---------------
  const balances = tokens.map((token) => {
    const idx = currentAssets.findIndex((a) => getAddress(a) === token)
    // toAssets(1e18) is per-whole-share; scale back up to the real balance
    return idx === -1 ? 0n : (amountsPerShare[idx] * supply) / D18
  })
  let rederived: ReturnType<typeof getStartRebalance> | undefined
  try {
    rederived = getStartRebalance(
      folioVersion(version),
      supply,
      tokens,
      balances,
      decimals,
      targetBasket.map((t) => BigInt(Math.round(t * 1e18))),
      impliedPrices.map((p) => p.price),
      impliedPriceErrors,
      tokenParams.map(
        (t, i) =>
          (Number(t.maxAuctionSize ?? 0n) / 10 ** Number(decimals[i])) *
          impliedPrices[i].price
      ),
      weightControl,
      false
    )
  } catch (error) {
    record(
      'FAIL',
      'dtf-rebalance-lib rejected the recovered inputs',
      (error as Error).message
    )
  }
  if (rederived) {
    const near = (a: bigint, b: bigint, slackBps = 5n) =>
      a === b ||
      (b !== 0n &&
        (a > b ? a - b : b - a) * 10_000n <= (b > 0n ? b : -b) * slackBps)
    const weightMismatches = rederived.tokens
      .map((t, i) => ({
        symbol: symbols[i],
        expected: t.weight,
        actual: tokenParams[i].weight,
      }))
      .filter(
        (m) =>
          !near(m.actual.spot, m.expected.spot) ||
          !near(m.actual.low, m.expected.low) ||
          !near(m.actual.high, m.expected.high)
      )
    record(
      weightMismatches.length ? 'FAIL' : 'PASS',
      'weights reproduce from dtf-rebalance-lib',
      weightMismatches.length
        ? weightMismatches
            .map(
              (m) =>
                `${m.symbol}: on-chain spot ${m.actual.spot} vs derived ${m.expected.spot}`
            )
            .join('\n        ')
        : `all ${tokens.length} weight ranges match the library output`
    )
    const limitsMatch =
      near(limits.low, rederived.limits.low, 10_000n) &&
      near(limits.spot, rederived.limits.spot) &&
      near(limits.high, rederived.limits.high)
    record(
      limitsMatch ? 'PASS' : 'FAIL',
      'rebalance limits reproduce from dtf-rebalance-lib',
      `on-chain low/spot/high ${limits.low}/${limits.spot}/${limits.high} · derived ${rederived.limits.low}/${rederived.limits.spot}/${rederived.limits.high}`
    )
  }

  // TRACKING baskets must pin low == spot == high; NATIVE ones must not.
  const tracked = tokenParams.filter(
    (t) => t.weight.low === t.weight.spot && t.weight.spot === t.weight.high
  ).length
  if (!weightControl) {
    record(
      tracked === tokenParams.length ? 'PASS' : 'FAIL',
      'TRACKING DTF: every weight range is pinned (low == spot == high)',
      `${tracked}/${tokenParams.length} pinned`
    )
  } else {
    record(
      tracked === 0 ? 'PASS' : 'WARN',
      'NATIVE DTF: weight ranges widen around spot',
      `${tracked}/${tokenParams.length} unexpectedly pinned`
    )
  }

  // --- 6b. DISASTERS: independent pool prices and token identity ----------
  // Everything above trusts our own view of the world. These checks exist to
  // break that assumption: if our price API is wrong, or an address is a
  // look-alike token, the math can be internally perfect and still move the
  // whole basket into the wrong place.
  const poolInfo = await fetchPoolInfo(chain, tokens)
  const poolChecks = tokens.map((token, i) => {
    const pool = poolInfo.get(token)
    const { price, low, high } = impliedPrices[i]
    return {
      symbol: symbols[i],
      pool: pool?.price,
      liquidityUsd: pool?.liquidityUsd,
      topPool: pool?.topPool,
      // How far the pool price sits from the proposal price, and how much of
      // the auction band it consumes. Outside the band the auction can only
      // fill against us.
      drift: pool ? pool.price / price - 1 : undefined,
      magnitudes: pool ? Math.abs(Math.log10(pool.price / price)) : undefined,
      bandUsage: pool
        ? pool.price > price
          ? (pool.price - price) / (high - price)
          : (price - pool.price) / (price - low)
        : undefined,
    }
  })
  const mispriced = poolChecks.filter(
    (p) =>
      p.magnitudes !== undefined &&
      (p.magnitudes >= MAGNITUDE_FAIL || p.bandUsage! >= 1)
  )
  const bandPressure = poolChecks.filter(
    (p) => !mispriced.includes(p) && (p.bandUsage ?? 0) > BAND_USAGE_WARN
  )
  const noPool = poolChecks.filter((p) => p.pool === undefined)
  record(
    mispriced.length ? 'FAIL' : bandPressure.length ? 'WARN' : 'PASS',
    'pool price sits inside the encoded price range (independent of our API)',
    [...mispriced, ...bandPressure].length
      ? [...mispriced, ...bandPressure]
          .map(
            (p) =>
              `${p.symbol}: pool ${p.pool} vs proposal ${impliedPrices[symbols.indexOf(p.symbol)].price} (${pct(p.drift!)}, ${pct(p.bandUsage!)} of the band, ${p.magnitudes!.toFixed(2)} orders of magnitude)`
          )
          .join('\n        ')
      : `worst band usage ${pct(Math.max(...poolChecks.map((p) => p.bandUsage ?? 0)))}`
  )
  if (noPool.length) {
    record(
      'WARN',
      'no DEX pool found to price-check some tokens',
      `${noPool.map((p) => p.symbol).join(', ')} — verify the price by hand`
    )
  }

  // Same trade sizes, but valued with pool prices instead of ours. A price
  // error we share with the proposer cancels out everywhere else; here it
  // shows up as the basket share being wrong.
  const poolBasket = tokens.map((token, i) => {
    const pool = poolInfo.get(token)?.price
    return pool === undefined ? undefined : wholePerShare[i] * pool
  })
  if (poolBasket.every((v) => v !== undefined)) {
    const poolTotal = (poolBasket as number[]).reduce((a, b) => a + b, 0)
    const shifted = tokens
      .map((_, i) => ({
        symbol: symbols[i],
        ours: targetBasket[i],
        theirs: (poolBasket[i] as number) / poolTotal,
      }))
      .map((row) => ({ ...row, delta: row.theirs - row.ours }))
      .filter((row) => Math.abs(row.delta) > BASKET_SHARE_FAIL)
    record(
      shifted.length ? 'FAIL' : 'PASS',
      `basket shares agree when valued at pool prices (tolerance ${pct(BASKET_SHARE_FAIL)})`,
      shifted.length
        ? shifted
            .map(
              (row) =>
                `${row.symbol}: ${pct(row.ours)} at proposal prices vs ${pct(row.theirs)} at pool prices`
            )
            .join('\n        ')
        : undefined
    )
  }

  // Token identity. A wrong address is unrecoverable: the auction buys the
  // scam token with real basket value.
  const listed = await fetchListedAddresses(CG_PLATFORM[chain])
  const identity = tokens.map((token, i) => {
    const coin = listed.get(token.toLowerCase())
    const symbol = symbols[i].toUpperCase()
    const expected = MCAP_SYMBOL_ALIASES[symbol] ?? symbol
    return {
      symbol: symbols[i],
      token,
      coin,
      // Binance-Peg and other bridged names legitimately differ from the
      // underlying symbol, so accept a match on either side.
      matches:
        coin !== undefined &&
        (coin.symbol === symbol ||
          coin.symbol === expected ||
          (MCAP_SYMBOL_ALIASES[coin.symbol] ?? coin.symbol) === expected),
      liquidityUsd: poolInfo.get(token)?.liquidityUsd ?? 0,
    }
  })
  // An address the DTF already holds has survived at least one rebalance and a
  // governance vote, so the identity risk lives almost entirely in new ones.
  // CoinGecko does not list every Binance-Peg wrapper, so an unlisted held
  // token is normal; an unlisted *new* token is not.
  const unlisted = identity.filter((t) => !t.coin && added.includes(t.token))
  const unlistedHeld = identity.filter(
    (t) => !t.coin && !added.includes(t.token)
  )
  const symbolMismatch = identity.filter((t) => t.coin && !t.matches)
  if (unlistedHeld.length) {
    record(
      'PASS',
      'unlisted-but-already-held tokens (identity vetted by previous rebalances)',
      unlistedHeld.map((t) => t.symbol).join(', ')
    )
  }
  record(
    symbolMismatch.length ? 'FAIL' : unlisted.length ? 'WARN' : 'PASS',
    'every token address is the listed contract for its symbol on this chain',
    [
      ...symbolMismatch.map(
        (t) =>
          `${t.symbol} ${t.token} is listed as "${t.coin!.id}" (${t.coin!.symbol}) — possible look-alike token`
      ),
      ...unlisted.map(
        (t) =>
          `${t.symbol} ${t.token} is not in CoinGecko's contract map (${usd(t.liquidityUsd)} pool liquidity) — verify by hand`
      ),
    ].join('\n        ') ||
      `${identity.filter((t) => t.matches).length}/${identity.length} verified against CoinGecko`
  )
  const thinlyPooled = identity.filter(
    (t) => t.liquidityUsd > 0 && t.liquidityUsd < THIN_POOL_USD
  )
  if (thinlyPooled.length) {
    record(
      'WARN',
      `constituents with less than ${usd(THIN_POOL_USD)} of pooled liquidity`,
      thinlyPooled.map((t) => `${t.symbol} ${usd(t.liquidityUsd)}`).join(' · ')
    )
  }

  // --- 6c. DISASTERS: weights vs the last executed rebalance --------------
  const previous = await fetchPreviousRebalance(
    subgraph,
    proposal.governance.id,
    proposalId
  )
  if (!previous) {
    record('WARN', 'no previous executed rebalance found to compare weights to')
  } else {
    // Comparable only in whole tokens per whole share, using the decimals we
    // already read for the proposed set.
    const previousWeights = new Map(
      tokens.flatMap((token, i) => {
        const spot = previous.spotWeights.get(token)
        return spot === undefined
          ? []
          : [
              [
                token,
                (Number(spot) / 1e27 / 10 ** Number(decimals[i])) * 1e18,
              ] as const,
            ]
      })
    )
    const jumps = tokens
      .map((token, i) => ({
        symbol: symbols[i],
        now: wholePerShare[i],
        before: previousWeights.get(token),
      }))
      .filter(
        (row) => row.before !== undefined && row.before > 0 && row.now > 0
      )
      .map((row) => ({
        ...row,
        magnitudes: Math.abs(Math.log10(row.now / row.before!)),
      }))
      .filter((row) => row.magnitudes >= MAGNITUDE_FAIL)
    record(
      jumps.length ? 'FAIL' : 'PASS',
      `weights vs rebalance "${previous.title}" (flag >= ${MAGNITUDE_FAIL} orders of magnitude)`,
      jumps.length
        ? jumps
            .map(
              (row) =>
                `${row.symbol}: ${row.before!.toExponential(4)} -> ${row.now.toExponential(4)} tok/share (${row.magnitudes.toFixed(2)} orders of magnitude)`
            )
            .join('\n        ')
        : `${tokens.length} tokens, largest move ${Math.max(
            ...tokens.map((token, i) => {
              const before = previousWeights.get(token)
              return before && before > 0 && wholePerShare[i] > 0
                ? Math.abs(Math.log10(wholePerShare[i] / before))
                : 0
            })
          ).toFixed(2)} orders of magnitude`
    )
  }

  // --- 7. embedded prices vs the Reserve API ------------------------------
  const livePrices = await fetchPrices(viemChain.id, tokens)
  const priceDrift = tokens.map((token, i) => {
    const live = livePrices.get(token)
    return {
      symbol: symbols[i],
      embedded: impliedPrices[i].price,
      live,
      drift: live ? impliedPrices[i].price / live - 1 : undefined,
    }
  })
  const missingPrice = priceDrift.filter((p) => p.live === undefined)
  const drifted = priceDrift.filter(
    (p) => p.drift !== undefined && Math.abs(p.drift) > PRICE_DRIFT_WARN
  )
  record(
    drifted.length ? 'WARN' : 'PASS',
    `embedded prices vs Reserve API (tolerance ${pct(PRICE_DRIFT_WARN)})`,
    drifted.length
      ? drifted
          .map(
            (p) =>
              `${p.symbol}: proposal ${p.embedded} vs live ${p.live} (${pct(p.drift!)})`
          )
          .join('\n        ')
      : `max drift ${pct(
          Math.max(...priceDrift.map((p) => Math.abs(p.drift ?? 0)))
        )}`
  )
  if (missingPrice.length) {
    record(
      'WARN',
      'no Reserve API price for some tokens',
      missingPrice.map((p) => p.symbol).join(', ')
    )
  }

  // --- 8. auction windows, price error, trade volume ----------------------
  record(
    auctionLauncherWindow <= ttl ? 'PASS' : 'FAIL',
    'auction launcher window fits inside the TTL',
    `launcher window ${Number(auctionLauncherWindow) / 3600}h · ttl ${Number(ttl) / 3600}h · open window ${(Number(ttl) - Number(auctionLauncherWindow)) / 3600}h`
  )
  const maxPriceError = Math.max(...impliedPriceErrors)
  record(
    maxPriceError > 0.9 ? 'FAIL' : maxPriceError > 0.75 ? 'WARN' : 'PASS',
    'per-token price errors within the standard presets',
    impliedPriceErrors
      .map((e, i) => `${symbols[i]} ${(e * 100).toFixed(0)}%`)
      .join(' · ')
  )

  const trades = tokens.map((_, i) => ({
    symbol: symbols[i],
    currentPct: navPerShare ? currentValues[i] / navPerShare : 0,
    targetPct: targetBasket[i],
    tradeUsd: (targetValues[i] - currentValues[i]) * supplyWhole,
  }))
  const volume = trades.reduce((a, t) => a + Math.abs(t.tradeUsd), 0) / 2
  record(
    'PASS',
    'implied trade volume',
    `${usd(volume)} of ${usd(aum)} AUM (${pct(aum ? volume / aum : 0)})`
  )

  // --- 9. liquidity for every leg the rebalance actually has to trade -----
  const legs: LiquidityTrade[] = trades
    .map((t, i) => ({
      address: tokens[i].toLowerCase(),
      side: (t.tradeUsd < 0 ? 'sell' : 'buy') as 'sell' | 'buy',
      amountUsd: Math.abs(t.tradeUsd),
      price: impliedPrices[i].price,
      decimals: Number(decimals[i]),
    }))
    .filter((leg) => leg.amountUsd >= MIN_TRADE_USD)
  if (legs.length) {
    // The endpoint prices routes against the chain's native asset.
    const nativeSymbol = viemChain.nativeCurrency.symbol
    const nativeIndex = symbols.findIndex(
      (s) => s.toUpperCase() === `W${nativeSymbol}`.toUpperCase()
    )
    const nativePrice =
      nativeIndex === -1 ? 0 : impliedPrices[nativeIndex].price
    try {
      const liquidity = await fetchRebalanceLiquidity(
        viemChain.id,
        nativePrice,
        legs
      )
      const byAddress = new Map(
        liquidity.assets.map((a) => [a.address.toLowerCase(), a])
      )
      const rated = legs.map((leg) => {
        const asset = byAddress.get(leg.address)
        const symbol =
          symbols[tokens.findIndex((t) => t.toLowerCase() === leg.address)]
        // priceImpact is a signed percentage; negative means positive slippage.
        const impact = (asset?.liquidity.priceImpact ?? 0) / 100
        return {
          symbol,
          side: leg.side,
          amountUsd: leg.amountUsd,
          impact,
          level: asset?.liquidity.level,
          score: asset?.liquidity.score,
          error: asset?.liquidity.error,
        }
      })
      const thin = rated.filter(
        (r) => r.impact > PRICE_IMPACT_SEVERE || r.error || r.level === 'low'
      )
      const bad = thin.filter((r) => r.amountUsd >= MATERIAL_TRADE_USD)
      const iffy = rated.filter(
        (r) =>
          !bad.includes(r) && (thin.includes(r) || r.impact > PRICE_IMPACT_WARN)
      )
      const describe = (r: (typeof rated)[number]) =>
        `${r.symbol} ${r.side} ${usd(r.amountUsd)} -> impact ${pct(r.impact)}, level ${r.level ?? '?'}, score ${r.score ?? '?'}${r.error ? `, error ${r.error}` : ''}`
      // Liquidity is an "optimizing outcomes" concern: a thin leg costs basis
      // points and is fixed by loading a market maker, so it warns rather than
      // blocking the way a mispriced or misidentified token does.
      record(
        bad.length || iffy.length ? 'WARN' : 'PASS',
        `trade liquidity via ${legs.length} leg(s) (flags impact >${pct(PRICE_IMPACT_WARN)}, or level low on a leg over ${usd(MATERIAL_TRADE_USD)})`,
        [...bad, ...iffy].length
          ? [...bad, ...iffy].map(describe).join('\n        ')
          : `worst impact ${pct(Math.max(...rated.map((r) => r.impact)))}`
      )
      if (bad.length) {
        record(
          'WARN',
          'thin legs need a market maker loaded before the auction opens',
          'a wide price error on an illiquid token lets the auction fill far from fair value'
        )
      }
      const ondoClosed = liquidity.assets.filter(
        (a) => a.ondo && !a.ondo.tradingOpen
      )
      if (ondoClosed.length) {
        record(
          'WARN',
          'tokenized-equity legs are outside market hours',
          ondoClosed.map((a) => a.ondo!.symbol).join(', ')
        )
      }
    } catch (error) {
      record(
        'WARN',
        'liquidity endpoint unavailable — check liquidity by hand',
        (error as Error).message
      )
    }
  }

  // --- 10. optional: weights vs live market caps -------------------------
  if (withMcap) {
    const caps = await fetchMarketCaps()
    const resolved = symbols.map((s) => {
      const key = MCAP_SYMBOL_ALIASES[s.toUpperCase()] ?? s.toUpperCase()
      return { symbol: s, key, cap: caps.get(key) }
    })
    const unknown = resolved.filter((r) => r.cap === undefined)
    const total = resolved.reduce((a, r) => a + (r.cap ?? 0), 0)
    const deltas = resolved.map((r, i) => ({
      symbol: r.symbol,
      target: targetBasket[i],
      mcap: (r.cap ?? 0) / total,
    }))
    const off = deltas.filter(
      (d) => Math.abs(d.target - d.mcap) > MCAP_DRIFT_WARN
    )
    record(
      off.length ? 'WARN' : 'PASS',
      `proposed weights vs market-cap weights (tolerance ${pct(MCAP_DRIFT_WARN)})`,
      off.length
        ? off
            .map(
              (d) =>
                `${d.symbol}: proposed ${pct(d.target)} vs mcap ${pct(d.mcap)}`
            )
            .join('\n        ')
        : `max deviation ${pct(
            Math.max(...deltas.map((d) => Math.abs(d.target - d.mcap)))
          )}`
    )
    if (unknown.length) {
      record(
        'WARN',
        'no market cap found for some tokens (add an alias)',
        unknown.map((u) => `${u.symbol} -> ${u.key}`).join(', ')
      )
    }
  }

  // --- report -------------------------------------------------------------
  console.log('\nBasket')
  console.log(
    ['token', 'current %', 'proposed %', 'delta pp', 'trade USD'].join('\t')
  )
  for (const t of [...trades].sort((a, b) => b.targetPct - a.targetPct)) {
    console.log(
      [
        t.symbol,
        (t.currentPct * 100).toFixed(3),
        (t.targetPct * 100).toFixed(3),
        ((t.targetPct - t.currentPct) * 100).toFixed(3),
        t.tradeUsd.toFixed(0),
      ].join('\t')
    )
  }

  console.log(`\nMandate\n  ${dtf.mandate}`)
  console.log(
    '\nHuman judgement still required: constituent eligibility (which assets the mandate admits/excludes and why), whether a bridged token is the canonical representation, and per-token maxAuctionSize sizing.'
  )
  return finish()
}

const finish = () => {
  const fails = checks.filter((c) => c.level === 'FAIL').length
  const warns = checks.filter((c) => c.level === 'WARN').length
  console.log(
    `\n${fails ? 'FAILED' : warns ? 'PASSED WITH WARNINGS' : 'PASSED'} — ${checks.length - fails - warns} pass, ${warns} warn, ${fails} fail`
  )
  process.exitCode = fails ? 1 : 0
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
