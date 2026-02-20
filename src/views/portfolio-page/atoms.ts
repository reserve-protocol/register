import { atom } from 'jotai'
import { PortfolioPeriod } from './types'

export const portfolioPageTimeRangeAtom = atom<PortfolioPeriod>('7d')
