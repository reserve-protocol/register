import { atom } from 'jotai'

export const homeMetricsAtom = atom({
  volume: 0,
  marketCap: 0,
  stakeRevenue: 0,
  tvl: 0,
  rsrStakedUSD: 0,
  rTokenAnnualizedRevenue: 0,
  rsrStakerAnnualizedRevenue: 0,
})
