import { atom } from 'jotai'

export interface RTokenMetrics {
  cumulativeUniqueUsers: number
  rewardTokenSupply: number
  rsrPriceUSD: number
  rsrPriceLastBlock: number
  rsrExchangeRate: number
  insurance: number
  rsrStaked: number
  rsrUnstaked: number
  basketUnits: number
}

export interface TokenMetrics {
  holderCount: number
  userCount: number
  transferCount: number
  mintCount: number
  burnCount: number
  totalSupply: number
  totalBurned: number
  totalMinted: number
  lastPriceUSD: number
}

export interface ProtocolMetrics {
  insurance: number
  insuranceUSD: number
  totalValueLockedUSD: number
  cumulativeVolumeUSD: number
  cumulativeRTokenRevenueUSD: number
  cumulativeInsuranceRevenueUSD: number
  cumulativeTotalRevenueUSD: number
  cumulativeUniqueUsers: number
  rsrStaked: number
  rsrStakedUSD: number
  rsrUnstaked: number
  rsrUnstakedUSD: number
  totalRTokenUSD: number
  rTokenCount: number
}

export const defaultRTokenMetrics: RTokenMetrics = {
  cumulativeUniqueUsers: 0,
  rewardTokenSupply: 0,
  rsrPriceUSD: 0,
  rsrPriceLastBlock: 0,
  rsrExchangeRate: 0,
  insurance: 0,
  rsrStaked: 0,
  rsrUnstaked: 0,
  basketUnits: 0,
}

export const defaultTokenMetrics: TokenMetrics = {
  holderCount: 0,
  userCount: 0,
  transferCount: 0,
  mintCount: 0,
  burnCount: 0,
  totalSupply: 0,
  totalBurned: 0,
  totalMinted: 0,
  lastPriceUSD: 0,
}

export const defaultProtocolMetrics: ProtocolMetrics = {
  insurance: 0,
  insuranceUSD: 0,
  totalValueLockedUSD: 0,
  cumulativeVolumeUSD: 0,
  cumulativeRTokenRevenueUSD: 0,
  cumulativeInsuranceRevenueUSD: 0,
  cumulativeTotalRevenueUSD: 0,
  cumulativeUniqueUsers: 0,
  rsrStaked: 0,
  rsrStakedUSD: 0,
  rsrUnstaked: 0,
  rsrUnstakedUSD: 0,
  totalRTokenUSD: 0,
  rTokenCount: 0,
}

export const rTokenMetricsAtom = atom<RTokenMetrics>(defaultRTokenMetrics)
export const tokenMetricsAtom = atom<TokenMetrics>(defaultTokenMetrics)
export const protocolMetricsAtom = atom<ProtocolMetrics>(defaultProtocolMetrics)
