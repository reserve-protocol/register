export type HistoricalPoint = {
  timestamp: number
  value: number
}

export type HistoricalMetric = {
  id: 'price' | 'apy' | 'supply' | 'staked-rsr'
  heading: string
  headline: string
  unit: string
  sourceLabel: string
  isSynthetic: boolean
  asOfTimestamp: number
  points: HistoricalPoint[]
  csv?: {
    headers: { key: string; label: string }[]
    rows: Record<string, string | number>[]
    filename: string
  }
  csvUnavailableReason?: string
}

export type PortfolioCategoryKey =
  | 'indexDTFs'
  | 'yieldDTFs'
  | 'stakedRSR'
  | 'voteLocked'
  | 'rsr'

export type PortfolioPoint = HistoricalPoint &
  Record<PortfolioCategoryKey, number>

export type PortfolioSourceState = 'total' | 'composition'

export type PortfolioCategory = {
  key: PortfolioCategoryKey
  label: string
  color: string
}
