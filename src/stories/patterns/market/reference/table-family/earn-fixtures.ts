import { getFolioRoute, getTokenRoute } from '@/utils'
import { value, type FixtureValue } from './fixtures'

export type EarnFamily = 'index' | 'yield'
export type EarnState =
  | 'default'
  | 'loading'
  | 'wallet-loading'
  | 'sparse'
  | 'missing'
  | 'long'
  | 'empty'
export interface GovernedAsset {
  symbol: string
  name: string
  href: string
  logo?: string
}
export interface EarnRow {
  id: string
  family: EarnFamily
  symbol: string
  name: string
  vault: string
  chain: number
  address?: string
  tvl: FixtureValue
  amount: string | null
  holding: FixtureValue
  holdingAmount: string | null
  hasHolding: boolean | null
  rate: FixtureValue
  rateKind: 'APR' | 'APY'
  governs: GovernedAsset[]
}

const governed = (
  symbol: string,
  name: string,
  address: string,
  chain: number
): GovernedAsset => ({ symbol, name, href: getFolioRoute(address, chain) })
const rsr = { symbol: 'RSR', name: 'Reserve Rights' }

export const EARN_ROWS: EarnRow[] = [
  {
    ...rsr,
    id: 'shared-rsr',
    family: 'index',
    vault: 'vlRSR',
    chain: 56,
    address: '0x23f72a3db61d6cb8abe5d9af1ac4b6c99327bfee',
    tvl: value('$696,026', 69602600n),
    amount: '498.8M RSR',
    holding: value('$174.42', 17442n),
    holdingAmount: '125,000.00 RSR',
    hasHolding: true,
    rate: value('25.88%', 230203n),
    rateKind: 'APY',
    governs: [
      governed(
        'NEOCLOUD',
        'Reserve AI Capacity & Neocloud DTF',
        '0xf571fe3f0d74521bc7310b111faea931c748f27b',
        56
      ),
      governed(
        'PHOTON',
        'Reserve AI Photonics DTF (BSC)',
        '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb',
        56
      ),
      governed(
        'POWER',
        'Reserve AI Power DTF (BSC)',
        '0x290bcc0fd5096cc3261ae2021841c7bc67cb0f51',
        56
      ),
      governed(
        'BUILDOUT',
        'Reserve AI Infrastructure DTF (BSC)',
        '0xd7ce7a841310982acd976d1a6fe7bb6063c5689d',
        56
      ),
      governed(
        'ROBOTS',
        'Reserve Robotics DTF (BSC)',
        '0x75617e7653f86f074cc30b9fd4ebf52ba9b62247',
        56
      ),
    ],
  },
  {
    id: 'squill',
    family: 'index',
    symbol: 'SQUILL',
    name: 'Squid Pro Quo',
    vault: 'vlSQUILL-OPEN',
    chain: 1,
    address: '0x7ebab7190d3d574ce82d29f2fa1422f18e29969c',
    tvl: value('$55,906', 5590600n),
    amount: '1.3M SQUILL',
    holding: value('$42.66', 4266n),
    holdingAmount: '1,000.00 SQUILL',
    hasHolding: true,
    rate: value('9.22%', 92200n),
    rateKind: 'APR',
    governs: [
      governed(
        'OPEN',
        'Open Stablecoin Index',
        '0x323c03c48660fe31186fa82c289b0766d331ce21',
        1
      ),
    ],
  },
  {
    ...rsr,
    id: 'lcap',
    family: 'index',
    vault: 'vlRSR-LCAP',
    chain: 8453,
    address: '0xab36452dbac151be02b16ca17d8919826072f64a',
    tvl: value('$156,879', 15687900n),
    amount: '112.3M RSR',
    holding: value('$25.86', 2586n),
    holdingAmount: '18,517.50 RSR',
    hasHolding: true,
    rate: value('2.88%', 28750n),
    rateKind: 'APR',
    governs: [
      governed(
        'LCAP',
        'CF Large Cap Index',
        '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8',
        8453
      ),
    ],
  },
  {
    ...rsr,
    id: 'cmc',
    family: 'index',
    vault: 'vlRSR-CMCindex',
    chain: 56,
    address: '0x23f72a3db61d6cb8abe5d9af1ac4b6c99327bfee',
    tvl: value('$107,925', 10792500n),
    amount: '77.3M RSR',
    holding: value('$0.00', 0n),
    holdingAmount: '0.00 RSR',
    hasHolding: false,
    rate: value('2.29%', 22923n),
    rateKind: 'APR',
    governs: [
      governed(
        'CMC20',
        'CoinMarketCap 20 Index DTF',
        '0x2f8a339b5889ffac4c5a956787cda593b3c36867',
        56
      ),
    ],
  },
  {
    ...rsr,
    id: 'eusd',
    family: 'yield',
    vault: 'eusdRSR',
    chain: 1,
    tvl: value('$7.4M', 740000000n),
    amount: '3.2B RSR',
    holding: value('$146.25', 14625n),
    holdingAmount: '62,500.00 RSR',
    hasHolding: true,
    rate: value('6.12%', 61200n),
    rateKind: 'APY',
    governs: [
      {
        symbol: 'eUSD',
        name: 'Electronic Dollar',
        logo: '/svgs/eusd.svg',
        href: getTokenRoute('0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f', 1),
      },
    ],
  },
  {
    ...rsr,
    id: 'bsdeth',
    family: 'yield',
    vault: 'bsdethRSR',
    chain: 8453,
    tvl: value('$412,500', 41250000n),
    amount: '176.3M RSR',
    holding: value('$0.00', 0n),
    holdingAmount: '0.00 RSR',
    hasHolding: false,
    rate: value('4.38%', 43800n),
    rateKind: 'APY',
    governs: [
      {
        symbol: 'bsdETH',
        name: 'Based ETH',
        logo: '/svgs/bsdeth.svg',
        href: getTokenRoute('0xcb327b99ff831bf8223cced12b1338ff3aa322ff', 8453),
      },
    ],
  },
]

export function previewEarn(family: EarnFamily, state: EarnState): EarnRow[] {
  if (state === 'empty') return []
  return EARN_ROWS.filter((row) => row.family === family).map((row, index) => {
    if (state === 'sparse' && index > 0)
      return {
        ...row,
        hasHolding: false,
        holding: value('$0.00', 0n),
        holdingAmount: `0.00 ${row.symbol}`,
      }
    if (state === 'long')
      return {
        ...row,
        symbol: row.name,
        amount: `123,456,789.12 ${row.symbol}`,
        holdingAmount: row.hasHolding
          ? `123,456,789.12 ${row.symbol}`
          : row.holdingAmount,
      }
    if (state !== 'missing') return row
    return index === 0
      ? {
          ...row,
          tvl: value('$0.00', 0n),
          amount: `0.00 ${row.symbol}`,
          rate: value('0.00%', 0n),
          holding: value('$0.00', 0n),
          holdingAmount: `0.00 ${row.symbol}`,
          hasHolding: false,
        }
      : {
          ...row,
          tvl: null,
          rate: null,
          holding: null,
          holdingAmount: index === 1 ? null : row.holdingAmount,
          hasHolding: index === 1 ? null : row.hasHolding,
        }
  })
}
