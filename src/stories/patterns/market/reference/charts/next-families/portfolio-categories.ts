import type { PortfolioCategory } from './types'

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  { key: 'rsr', label: 'RSR', color: 'hsl(var(--primary))' },
  { key: 'voteLocked', label: 'Vote-locked', color: 'hsl(var(--chart-4))' },
  { key: 'stakedRSR', label: 'Staked RSR', color: 'hsl(var(--chart-1))' },
  { key: 'yieldDTFs', label: 'Yield DTFs', color: 'hsl(var(--chart-2))' },
  {
    key: 'indexDTFs',
    label: 'Index DTFs',
    color: 'hsl(var(--primary) / 0.58)',
  },
]
