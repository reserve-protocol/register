import { atom } from 'jotai'
import {
  PortfolioPeriod,
  PortfolioResponse,
} from './types'

export const portfolioPageTimeRangeAtom = atom<PortfolioPeriod>('7d')

export const portfolioDataAtom = atom<PortfolioResponse | null>(null)

export const portfolioIndexDTFsAtom = atom(
  (get) => get(portfolioDataAtom)?.indexDTFs ?? []
)
export const portfolioYieldDTFsAtom = atom(
  (get) => get(portfolioDataAtom)?.yieldDTFs ?? []
)
export const portfolioStakedRSRAtom = atom(
  (get) => get(portfolioDataAtom)?.stakedRSR ?? []
)
export const portfolioVoteLocksAtom = atom(
  (get) => get(portfolioDataAtom)?.voteLocks ?? []
)
export const portfolioRSRBalancesAtom = atom(
  (get) => get(portfolioDataAtom)?.rsrBalances ?? []
)

export const portfolioBreakdownAtom = atom((get) => {
  const data = get(portfolioDataAtom)
  if (!data) return null
  return {
    indexValue: data.indexDTFs.reduce((sum, d) => sum + (d.value || 0), 0),
    yieldValue: data.yieldDTFs.reduce((sum, d) => sum + (d.value || 0), 0),
    rsrValue: data.rsrBalances.reduce((sum, d) => sum + (d.value || 0), 0),
    stakedValue: data.stakedRSR.reduce((sum, d) => sum + (d.value || 0), 0),
    voteLockValue: data.voteLocks.reduce((sum, d) => sum + (d.value || 0), 0),
  }
})
