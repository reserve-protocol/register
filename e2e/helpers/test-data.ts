// Anvil default account #0
export const TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

export const ChainId = {
  Mainnet: 1,
  Base: 8453,
  Arbitrum: 42161,
  BSC: 56,
} as const

export const CHAINS = {
  mainnet: { id: ChainId.Mainnet, hex: '0x1', slug: 'ethereum' },
  base: { id: ChainId.Base, hex: '0x2105', slug: 'base' },
  bsc: { id: ChainId.BSC, hex: '0x38', slug: 'bsc' },
  arbitrum: { id: ChainId.Arbitrum, hex: '0xa4b1', slug: 'arbitrum' },
} as const

// The 3 test DTFs — one per chain, used across all e2e tests
export const DTF = {
  lcap: {
    address: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
    symbol: 'LCAP',
    name: 'CF Large Cap Index',
    chain: CHAINS.base,
    snapshotDir: 'base/lcap',
  },
  cmc20: {
    address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867',
    symbol: 'CMC20',
    name: 'CMC Top 20',
    chain: CHAINS.bsc,
    snapshotDir: 'bsc/cmc20',
  },
  open: {
    address: '0x323c03c48660fe31186fa82c289b0766d331ce21',
    symbol: 'OPEN',
    name: 'OPEN',
    chain: CHAINS.mainnet,
    snapshotDir: 'mainnet/open',
  },
  deprecated_base: {
    address: '0x47686106181b3cefe4eaf94c4c10b48ac750370b',
    symbol: 'VTF',
    name: 'Virtuals Index',
    chain: CHAINS.base,
    snapshotDir: 'base/deprecated',
  },
} as const

export type TestDTF = (typeof DTF)[keyof typeof DTF]

// URL helpers
export const dtfUrl = (dtf: TestDTF, page: string) =>
  `/${dtf.chain.slug}/index-dtf/${dtf.address}/${page}`

// Backwards compat — tests still import these
export const TEST_DTFS = DTF
export const dtfOverviewUrl = (address: string, chain = 'base') =>
  `/${chain}/index-dtf/${address}/overview`
