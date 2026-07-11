// THE single source of truth for the DTFs the e2e suite exercises.
// Shared by mocks (rpc/subgraph/api), the capture script, and the tests.
// Never duplicate this list — one DTF per chain plus one deprecated.

export type ChainKey = 'mainnet' | 'base' | 'bsc'

export interface ChainInfo {
  key: ChainKey
  chainId: number
  hex: string
  // Slug used in the app's routes: /<urlSlug>/index-dtf/<address>/...
  urlSlug: string
  // Goldsky index-DTF subgraph (prod) — mirrors INDEX_DTF_SUBGRAPH_URL in src.
  indexSubgraphUrl: string
  // Goldsky YIELD-DTF (RToken) subgraph — mirrors gqlClientAtom in src
  // (chainAtoms.ts). Undefined where the suite has no yield fixture for a chain.
  yieldSubgraphUrl?: string
  // A public no-auth RPC the capture script drives to record the eth_call map.
  // Not used at test time (everything is mocked); capture-only.
  captureRpcUrl?: string
}

const GOLDSKY = 'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs'

export const CHAINS: Record<ChainKey, ChainInfo> = {
  mainnet: {
    key: 'mainnet',
    chainId: 1,
    hex: '0x1',
    urlSlug: 'ethereum',
    indexSubgraphUrl: `${GOLDSKY}/dtf-index-mainnet/prod/gn`,
    yieldSubgraphUrl: `${GOLDSKY}/dtf-yield-mainnet/4.2.0-v2/gn`,
    captureRpcUrl: 'https://ethereum-rpc.publicnode.com',
  },
  base: {
    key: 'base',
    chainId: 8453,
    hex: '0x2105',
    urlSlug: 'base',
    indexSubgraphUrl: `${GOLDSKY}/dtf-index-base/prod/gn`,
    yieldSubgraphUrl: `${GOLDSKY}/dtf-yield-base/4.2.0-v2/gn`,
    captureRpcUrl: 'https://base-rpc.publicnode.com',
  },
  bsc: {
    key: 'bsc',
    chainId: 56,
    hex: '0x38',
    urlSlug: 'bsc',
    indexSubgraphUrl: `${GOLDSKY}/dtf-index-bsc/prod/gn`,
  },
}

export function chainById(chainId: number): ChainInfo | undefined {
  return Object.values(CHAINS).find((c) => c.chainId === chainId)
}

export interface RegistryDTF {
  address: string
  chain: ChainKey
  chainId: number
  slug: string
  // Snapshot directory relative to e2e/snapshots: `<chain>/<slug>`.
  snapshotDir: string
  deprecated?: boolean
}

// Anvil default account #0 — the connected test wallet.
export const TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

function dtf(
  partial: Omit<RegistryDTF, 'chainId' | 'snapshotDir'>
): RegistryDTF {
  return {
    ...partial,
    chainId: CHAINS[partial.chain].chainId,
    snapshotDir: `${partial.chain}/${partial.slug}`,
  }
}

export const REGISTRY: RegistryDTF[] = [
  dtf({
    address: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
    chain: 'base',
    slug: 'lcap',
  }),
  dtf({
    address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867',
    chain: 'bsc',
    slug: 'cmc20',
  }),
  dtf({
    address: '0x323c03c48660fe31186fa82c289b0766d331ce21',
    chain: 'mainnet',
    slug: 'open',
  }),
  dtf({
    address: '0x47686106181b3cefe4eaf94c4c10b48ac750370b',
    chain: 'base',
    slug: 'deprecated',
    deprecated: true,
  }),
]

export function findDtfByAddress(address: string): RegistryDTF | undefined {
  const lower = address.toLowerCase()
  return REGISTRY.find((d) => d.address.toLowerCase() === lower)
}

// Build the app route for a DTF page (overview, issuance, governance, ...).
export function dtfPath(dtf: RegistryDTF, page: string): string {
  return `/${CHAINS[dtf.chain].urlSlug}/index-dtf/${dtf.address}/${page}`
}

// ---------------------------------------------------------------------------
// Yield DTFs (RTokens) — a PARALLEL catalog. Deliberately separate from
// REGISTRY: yield views read state from RPC (not the index SDK), route under
// /<slug>/token/<address>, and seed from a record/replay eth_call map rather
// than the folio-shaped chain-state. See docs/wiki/domains/e2e.md § Yield.
// ---------------------------------------------------------------------------

export interface YieldDTF {
  address: string
  chain: ChainKey
  chainId: number
  slug: string
  symbol: string
  snapshotDir: string
}

function rtoken(partial: Omit<YieldDTF, 'chainId' | 'snapshotDir'>): YieldDTF {
  return {
    ...partial,
    chainId: CHAINS[partial.chain].chainId,
    snapshotDir: `${partial.chain}/${partial.slug}`,
  }
}

export const YIELD_REGISTRY: YieldDTF[] = [
  rtoken({
    address: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    chain: 'mainnet',
    slug: 'eusd',
    symbol: 'eUSD',
  }),
  rtoken({
    address: '0xCc7FF230365bD730eE4B352cC2492CEdAC49383e',
    chain: 'base',
    slug: 'hyusd',
    symbol: 'hyUSD',
  }),
]

export function findYieldByAddress(address: string): YieldDTF | undefined {
  const lower = address.toLowerCase()
  return YIELD_REGISTRY.find((d) => d.address.toLowerCase() === lower)
}

// Build the app route for a yield RToken page: /<urlSlug>/token/<address>/<page>
// (page ∈ overview | issuance | staking | auctions | governance | settings).
export function rtokenPath(dtf: YieldDTF, page: string): string {
  return `/${CHAINS[dtf.chain].urlSlug}/token/${dtf.address}/${page}`
}
