import { getFolioRoute, getTokenRoute } from '@/utils'
import { isHiddenDtfSymbol } from '@/utils/constants'
import { value, type FixtureValue } from './fixtures'
import type { GovernedAsset } from './earn-fixtures'

export type OwnedFamily = 'lock' | 'stake'
export type OwnedState =
  | 'default'
  | 'loading'
  | 'pending'
  | 'missing'
  | 'long'
  | 'empty'
export interface OwnedPosition {
  id: string
  family: OwnedFamily
  symbol: string
  name: string
  address: string
  chain: number
  underlying: { symbol: string; address: string }
  governs: GovernedAsset[]
  activeShares: bigint
  balance: FixtureValue
  balanceUnit?: string
  exchangeRate?: string
  value: FixtureValue
  apy: FixtureValue
  pending?: boolean
  href?: string
}

const rsr = (address: string) => ({ symbol: 'RSR', address })
const governed = (
  symbol: string,
  name: string,
  address: string,
  chain: number
): GovernedAsset => ({ symbol, name, href: getFolioRoute(address, chain) })
const baseRsr = rsr('0xab36452dbac151be02b16ca17d8919826072f64a')

export const OWNED_LOCKS: OwnedPosition[] = [
  {
    id: 'lcap',
    family: 'lock',
    symbol: 'vlRSR-LCAP',
    name: 'Vote Lock vlRSR-LCAP',
    address: '0x45a96cd0e4d89a41eebf3cc4204b00b1cf1582fa',
    chain: 8453,
    underlying: baseRsr,
    activeShares: 18517500000n,
    balance: value('18,517.50', 18517500000n),
    value: value('$25.86', 2586n),
    apy: value('2.88%', 288n),
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
    id: 'shared',
    family: 'lock',
    symbol: 'vlRSR',
    name: 'Vote-Locked Reserve Rights',
    address: '0xe744c8157c346b2931807f42552c8cbc0bb6d34f',
    chain: 56,
    underlying: rsr('0x23f72a3db61d6cb8abe5d9af1ac4b6c99327bfee'),
    activeShares: 1000000000n,
    balance: value('1,018.80', 1018800000n),
    balanceUnit: 'RSR',
    exchangeRate: '1 vlRSR = 1.0188 RSR',
    value: value('$2.04', 204n),
    apy: value('25.88%', 2588n),
    governs: [
      governed(
        'POWER',
        'Reserve AI Power DTF (BSC)',
        '0x290bcc0fd5096cc3261ae2021841c7bc67cb0f51',
        56
      ),
      governed(
        'ROBOTS',
        'Reserve Robotics DTF (BSC)',
        '0x75617e7653f86f074cc30b9fd4ebf52ba9b62247',
        56
      ),
      governed(
        'PHOTON',
        'Reserve AI Photonics DTF (BSC)',
        '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb',
        56
      ),
      governed(
        'COMPUTE',
        'Reserve AI Compute DTF (BSC)',
        '0xc561439bd5b6a279f61ea2f8a3f0d25d70ff57ad',
        56
      ),
      governed(
        'BUILDOUT',
        'Reserve AI Infrastructure DTF (BSC)',
        '0xd7ce7a841310982acd976d1a6fe7bb6063c5689d',
        56
      ),
      governed(
        'ENERGY',
        'Reserve AI Energy Generation DTF (BSC)',
        '0xdbd6bc5e04b5fd627e0aa67740b06537800fe7db',
        56
      ),
      governed(
        'QUANTUM',
        'Reserve Quantum DTF (BSC)',
        '0xf51e0e1fdd6ea5967a4ea72fbdaa37c1e3ba1369',
        56
      ),
      governed(
        'NEOCLOUD',
        'Reserve AI Capacity & Neocloud DTF',
        '0xf571fe3f0d74521bc7310b111faea931c748f27b',
        56
      ),
    ].filter((asset) => !isHiddenDtfSymbol(asset.symbol)),
  },
  {
    id: 'squill',
    family: 'lock',
    symbol: 'vlSQUILL-OPEN',
    name: 'Vote Lock vlSQUILL-OPEN',
    address: '0x2aea77c4757d897aae2710b8a60280777f504e8c',
    chain: 1,
    underlying: {
      symbol: 'SQUILL',
      address: '0x7ebab7190d3d574ce82d29f2fa1422f18e29969c',
    },
    activeShares: 1000000000n,
    balance: value('1,000.00', 1000000000n),
    value: value('$42.66', 4266n),
    apy: value('9.22%', 922n),
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
    id: 'cmc',
    family: 'lock',
    symbol: 'vlRSR-CMCindex',
    name: 'Vote Lock vlRSR-CMCindex',
    address: '0xede6a014caa31e23e9d8c345c022101477a91292',
    chain: 56,
    underlying: rsr('0x23f72a3db61d6cb8abe5d9af1ac4b6c99327bfee'),
    activeShares: 4000000000n,
    balance: value('4,000.00', 4000000000n),
    value: value('$5.58', 558n),
    apy: value('1.49%', 149n),
    governs: [
      governed(
        'CMC20',
        'CoinMarketCap 20 Index DTF',
        '0x2f8a339b5889ffac4c5a956787cda593b3c36867',
        56
      ),
    ],
  },
]

export const OWNED_STAKES: OwnedPosition[] = [
  {
    id: 'hyusd',
    family: 'stake',
    symbol: 'hyusdRSR',
    name: 'High Yield USD',
    address: '0x796d2367af69deb3319b8e10712b8b65957371c3',
    chain: 8453,
    underlying: baseRsr,
    activeShares: 12000000000n,
    balance: value('12,000.00', 12000000000n),
    value: value('$28.08', 2808n),
    apy: value('4.80%', 480n),
    governs: [
      {
        symbol: 'hyUSD',
        name: 'High Yield USD',
        href: getTokenRoute('0xcc7ff230365bd730ee4b352cc2492cedac49383e', 8453),
      },
    ],
    href: getTokenRoute(
      '0xcc7ff230365bd730ee4b352cc2492cedac49383e',
      8453,
      'staking'
    ),
  },
  {
    id: 'eusd',
    family: 'stake',
    symbol: 'eusdRSR',
    name: 'Electronic Dollar',
    address: '0x18ba6e33ceb80f077deb9260c9111e62f21ae7b8',
    chain: 1,
    underlying: rsr('0x320623b8e4ff03373931769a31fc52a4e78b5d70'),
    activeShares: 62500000000n,
    balance: value('62,500.00', 62500000000n),
    value: value('$164.68', 16468n),
    apy: value('6.12%', 612n),
    governs: [
      {
        symbol: 'eUSD',
        name: 'Electronic Dollar',
        href: getTokenRoute('0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f', 1),
      },
    ],
    href: getTokenRoute(
      '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f',
      1,
      'staking'
    ),
  },
]

export function previewOwned(
  family: OwnedFamily,
  state: OwnedState
): OwnedPosition[] {
  const rows = family === 'lock' ? OWNED_LOCKS : OWNED_STAKES
  if (state === 'empty') return []
  return rows.map((row, index) => {
    if (state === 'pending')
      return { ...row, pending: index === 0 || !!row.exchangeRate }
    if (state === 'missing')
      return {
        ...row,
        value: index < 2 ? value('$0.00', 0n) : null,
        balance:
          index === 0
            ? value('0.000042', 42n)
            : index === 1
              ? value('0.00', 0n)
              : null,
        apy: null,
        governs: index === 0 ? [] : row.governs,
      }
    if (state === 'long' && index === 0)
      return {
        ...row,
        name: `${row.name} with an unusually long display name`,
        balance: value('123,456,789.123456', 123456789123456n),
        value: value('$12,345,678.90', 1234567890n),
      }
    return row
  })
}
