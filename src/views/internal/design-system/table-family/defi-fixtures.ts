import { getEarnPools } from '@/lib/meta'
import { LP_PROJECTS, NETWORKS } from '@/utils/constants'
import type { TokenLogoStackItem } from '@/components/entity-identity/token-logo-stack'
import type { EarnState } from './earn-fixtures'
import snapshot from './defi-snapshot.json'

export const defiMetrics = [
  ['apy', 'APY'],
  ['apyBase', 'Base APY'],
  ['apyReward', 'Reward APY'],
  ['tvlUsd', 'TVL'],
] as const
export type DefiMetric = (typeof defiMetrics)[number][0]
export type DefiRow = Record<DefiMetric, number | null> & {
  id: string
  symbol: string
  project: string
  projectName: string
  chain: string
  url: string
  tokens: TokenLogoStackItem[]
}
export const defiHelp: Partial<Record<DefiMetric, string>> = {
  apy: 'APY = Base APY + Reward APY. For non-autocompounding pools reinvesting is not accounted, in which case APY = APR.',
  apyBase:
    'Annualised percentage yield from trading fees/supplying. For dexes 24h fees are used and scaled those to a year.',
  apyReward: 'Annualised percentage yield from incentives',
}
export const defiSortOptions = [
  ['symbol', 'Pool'],
  ['projectName', 'Project'],
  ['chain', 'Chain'],
  ['apy', 'Total APY'],
  ['apyBase', 'Base APY'],
  ['apyReward', 'Reward APY'],
  ['tvlUsd', 'TVL'],
] as const

const fixtureTokenSymbols: Record<string, string> = {
  '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f': 'eUSD',
  '0xcfa3ef56d303ae4faaba0592388f19d7c3399fb4': 'eUSD',
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
  '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8': 'ETH+',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
  '0x320623b8e4ff03373931769a31fc52a4e78b5d70': 'RSR',
}

export const DEFI_ROWS: DefiRow[] = snapshot.map((pool) => {
  const metadata = getEarnPools().find((item) => item.llamaId === pool.pool)
  if (!metadata?.url)
    throw new Error(`Missing DeFi fixture destination: ${pool.pool}`)
  return {
    ...pool,
    id: pool.pool,
    projectName: LP_PROJECTS[pool.project].name,
    url: metadata.url,
    tokens: pool.underlyingTokens.map((address) => {
      const symbol = fixtureTokenSymbols[address.toLowerCase()]
      if (!symbol) throw new Error(`Missing DeFi fixture token: ${address}`)
      return {
        address,
        symbol,
        logo: `/svgs/${symbol.toLowerCase()}.svg`,
        chain: NETWORKS[pool.chain.toLowerCase()],
      }
    }),
  }
})

export function previewDefi(state: EarnState): DefiRow[] {
  if (state === 'empty') return []
  return DEFI_ROWS.map((row, index) => {
    if (state === 'long')
      return { ...row, symbol: `${row.symbol} (Lending Pool)` }
    if (state === 'missing' && index === 0)
      return { ...row, apy: 0, apyBase: 0, apyReward: 0, tvlUsd: 0 }
    if (state === 'missing' && index === 1)
      return { ...row, apy: null, apyBase: null, apyReward: null, tvlUsd: null }
    return row
  })
}
