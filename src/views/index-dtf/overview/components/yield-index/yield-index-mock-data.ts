// TODO: All mock data in this file should be replaced with API responses
// when the composition endpoints become available

export const MOCK_STRATEGIES = [
  {
    name: 'WBTC / cbBTC LP Strategy',
    tokens: ['WBTC', 'cbBTC'],
    weight: 33.37,
    protocols: 'Uniswap → Steer',
    estApy: 3.1,
  },
  {
    name: 'tBTC / WBTC LP Strategy',
    tokens: ['tBTC', 'WBTC'],
    weight: 33.36,
    protocols: 'Uniswap → Steer',
    estApy: 3.1,
  },
  {
    name: 'tBTC / cbBTC Curve Strategy',
    tokens: ['tBTC', 'cbBTC'],
    weight: 33.27,
    protocols: 'Curve',
    estApy: 3.1,
  },
]

// TODO: Type and provider fields need to come from extended exposure API
export const MOCK_ASSET_EXTRAS: Record<
  string,
  { type: string; provider: string }
> = {
  WBTC: { type: 'Wrapped', provider: 'BitGo' },
  cbBTC: { type: 'Wrapped', provider: 'Coinbase' },
  tBTC: { type: 'Wrapped', provider: 'Threshold' },
}

// TODO: Protocol data needs dedicated API endpoint
export const MOCK_PROTOCOLS = [
  {
    name: 'Uniswap',
    exposureShare: 67,
    role: 'LP Venue',
    usedIn: '2 Strategies',
  },
  {
    name: 'Steer',
    exposureShare: 67,
    role: 'Vault Manager',
    usedIn: '2 Strategies',
  },
  {
    name: 'Curve Finance',
    exposureShare: 33,
    role: 'Pool Venue',
    usedIn: '1 Strategy',
  },
]

// TODO: Summary counts should come from composition API
export const MOCK_SUMMARY = { strategies: 3, assets: 3, protocols: 4 }

// TODO: Asset exposure description should come from API or brand data
export const MOCK_ASSET_DESCRIPTION = '100% BTC · Market-neutral BTC yield'
