import { getFolioRoute, getTokenRoute } from '@/utils'

export type FixtureValue = { text: string; order: bigint } | null
export const value = (text: string, order: bigint): FixtureValue => ({
  text,
  order,
})

export interface PositionFixture {
  id: string
  name: string
  symbol: string
  chain: number
  address: string
  src?: string
  href: string
  balance: FixtureValue
  value: FixtureValue
  performance: number | null
  pnl: FixtureValue
  cost: FixtureValue
  cap: FixtureValue
}

const lcap = {
  name: 'CF Large Cap Index',
  symbol: 'LCAP',
  chain: 8453,
  src: 'https://folio-assets.reserve.org/0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8/mupND8QUUvXxBVjyB3T4H9uivWURqQkxfgFXD7tedNTwsYoS.png',
  address: '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8',
  href: getFolioRoute('0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8', 8453),
}
const cmc = {
  name: 'CoinMarketCap 20 Index DTF',
  symbol: 'CMC20',
  chain: 56,
  src: '/imgs/cmc20.png',
  address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867',
  href: getFolioRoute('0x2f8A339B5889FfaC4c5A956787cdA593b3c36867', 56),
}
const open = {
  name: 'Open Stablecoin Index',
  symbol: 'OPEN',
  chain: 1,
  address: '0x323c03c48660fe31186fa82c289b0766d331ce21',
  href: getFolioRoute('0x323c03c48660fe31186fa82c289b0766d331ce21', 1),
}
const eusd = {
  name: 'Electronic Dollar',
  symbol: 'eUSD',
  chain: 1,
  address: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
  href: getTokenRoute('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F', 1),
}

const photon = {
  name: 'Reserve AI Photonics DTF',
  symbol: 'PHOTON',
  chain: 56,
  address: '0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb',
  href: getFolioRoute('0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb', 56),
}
const zindex = {
  name: 'Zora Index',
  symbol: 'ZINDEX',
  chain: 8453,
  src: '/imgs/socials/zindex.png',
  address: '0x160c18476F6f5099f374033fbc695c9234Cda495',
  href: getFolioRoute('0x160c18476F6f5099f374033fbc695c9234Cda495', 8453),
}
const bgci = {
  name: 'Bloomberg Galaxy Crypto Index',
  symbol: 'BGCI',
  chain: 8453,
  address: '0x23418De10d422AD71C9D5713a2B8991a9c586443',
  href: getFolioRoute('0x23418De10d422AD71C9D5713a2B8991a9c586443', 8453),
}

export const POSITIONS: PositionFixture[] = [
  {
    ...lcap,
    id: 'lcap',
    balance: value('1,523.13', 1523130000n),
    value: value('$10,432.19', 1043219n),
    performance: 4.21,
    pnl: value('+$1,112.40', 111240n),
    cost: value('$6.12', 612n),
    cap: value('$4,200,000.00', 420000000n),
  },
  {
    ...cmc,
    id: 'cmc',
    balance: value('24.63', 24630000n),
    value: value('$2,473.17', 247317n),
    performance: -1.28,
    pnl: value('−$32.10', -3210n),
    cost: value('$101.72', 10172n),
    cap: value('$1,200,000.00', 120000000n),
  },
  {
    ...open,
    id: 'open',
    balance: value('2,500.00', 2500000000n),
    value: value('$2,501.20', 250120n),
    performance: 0,
    pnl: value('$0.00', 0n),
    cost: value('$1.00', 100n),
    cap: value('$25,000,000.00', 2500000000n),
  },
  {
    ...photon,
    id: 'photon',
    balance: value('100.00', 100000000n),
    value: value('$818.00', 81800n),
    performance: 0,
    pnl: value('$0.00', 0n),
    cost: value('$8.18', 818n),
    cap: value('$2,500,000.00', 250000000n),
  },
  {
    ...zindex,
    id: 'unavailable',
    balance: value('0.000042', 42n),
    value: null,
    performance: null,
    pnl: null,
    cost: null,
    cap: null,
  },
  {
    ...bgci,
    id: 'bgci',
    balance: value('280.00', 280000000n),
    value: value('$28,014.00', 2801400n),
    performance: 0.02,
    pnl: value('+$14.00', 1400n),
    cost: value('$100.00', 10000n),
    cap: value('$25,000,000.00', 2500000000n),
  },
]

export const YIELD_POSITIONS: PositionFixture[] = [
  { ...POSITIONS[2], ...eusd, id: 'eusd' },
]

export interface WithdrawalFixture {
  id: string
  source: 'stakedRSR' | 'voteLock'
  symbol: string
  sourceLabel: string
  chain: number
  balance: FixtureValue
  value: FixtureValue
  remaining: number
  delay: number
}

export const WITHDRAWALS: WithdrawalFixture[] = [
  {
    id: 'staked-pending',
    source: 'stakedRSR',
    symbol: 'RSR',
    sourceLabel: 'eusdRSR',
    chain: 1,
    balance: value('250,000.00', 250000000000n),
    value: value('$1,462.50', 146250n),
    remaining: 13 * 86400,
    delay: 14 * 86400,
  },
  {
    id: 'staked-ready',
    source: 'stakedRSR',
    symbol: 'RSR',
    sourceLabel: 'eusdRSR',
    chain: 1,
    balance: value('100,000.00', 100000000000n),
    value: value('$585.00', 58500n),
    remaining: 0,
    delay: 14 * 86400,
  },
  {
    id: 'lock-pending',
    source: 'voteLock',
    symbol: 'RSR',
    sourceLabel: 'vlRSR',
    chain: 56,
    balance: value('40,000.00', 40000000000n),
    value: value('$234.00', 23400n),
    remaining: 2 * 86400,
    delay: 7 * 86400,
  },
  {
    id: 'lock-ready',
    source: 'voteLock',
    symbol: 'RSR',
    sourceLabel: 'vlRSR',
    chain: 56,
    balance: value('20,000.00', 20000000000n),
    value: value('$117.00', 11700n),
    remaining: 0,
    delay: 7 * 86400,
  },
  {
    id: 'staked-later',
    source: 'stakedRSR',
    symbol: 'RSR',
    sourceLabel: 'eusdRSR',
    chain: 1,
    balance: value('10,000.00', 10000000000n),
    value: value('$58.50', 5850n),
    remaining: 3660,
    delay: 14 * 86400,
  },
  {
    id: 'lock-later',
    source: 'voteLock',
    symbol: 'RSR',
    sourceLabel: 'vlRSR',
    chain: 56,
    balance: value('5,000.00', 5000000000n),
    value: value('$29.25', 2925n),
    remaining: 6 * 86400,
    delay: 7 * 86400,
  },
]

export const withLongContent = (rows: PositionFixture[]) =>
  rows.map((row, index) =>
    index === Math.min(1, rows.length - 1)
      ? {
          ...row,
          name: `${row.name} with an unusually long display name`,
          balance: value('1,234,567.890123', 1234567890123n),
          value: value('$123,456,789.12', 12345678912n),
        }
      : row
  )

export const pressurePositions = withLongContent(POSITIONS)
