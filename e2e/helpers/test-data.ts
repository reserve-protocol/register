// Anvil default account #0
export const TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

export const CHAINS = {
  base: { id: 8453, hex: '0x2105' },
  mainnet: { id: 1, hex: '0x1' },
} as const

// DTF addresses from mock data (Base chain)
export const TEST_DTFS = {
  lcap: {
    address: '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8',
    symbol: 'LCAP',
    name: 'CF Large Cap Index',
    chainId: 8453,
  },
  clx: {
    address: '0x44551ca46fa5592bb572e20043f7c3d54c85cad7',
    symbol: 'CLX',
    name: 'Clanker Index',
    chainId: 8453,
  },
  ai: {
    address: '0xfe45eda533e97198d9f3deeda9ae6c147141f6f9',
    symbol: 'AI',
    name: 'AIndex',
    chainId: 8453,
  },
} as const

export const dtfOverviewUrl = (address: string, chain = 'base') =>
  `/${chain}/index-dtf/${address}/overview`
