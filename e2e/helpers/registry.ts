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
}

const GOLDSKY = 'https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs'

export const CHAINS: Record<ChainKey, ChainInfo> = {
  mainnet: {
    key: 'mainnet',
    chainId: 1,
    hex: '0x1',
    urlSlug: 'ethereum',
    indexSubgraphUrl: `${GOLDSKY}/dtf-index-mainnet/prod/gn`,
  },
  base: {
    key: 'base',
    chainId: 8453,
    hex: '0x2105',
    urlSlug: 'base',
    indexSubgraphUrl: `${GOLDSKY}/dtf-index-base/prod/gn`,
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
