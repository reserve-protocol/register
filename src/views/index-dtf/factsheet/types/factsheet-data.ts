export type TimeRange = '24h' | '7d' | '1m' | '3m' | '1y' | 'all'
export type ChartType = 'navGrowth' | 'monthlyPL'

export interface ChartDataPoint {
  timestamp: number
  value: number
  navGrowth?: number
  monthlyPL?: number
}

export interface PerformanceData {
  '3m': number | null
  '6m': number | null
  ytd: number | null
  '1y': number | null
  all: number | null
}

export interface NetPerformanceMonth {
  value: number | null
  isBest?: boolean
  isWorst?: boolean
}

export interface NetPerformanceYear {
  year: number
  jan: NetPerformanceMonth
  feb: NetPerformanceMonth
  mar: NetPerformanceMonth
  apr: NetPerformanceMonth
  may: NetPerformanceMonth
  jun: NetPerformanceMonth
  jul: NetPerformanceMonth
  aug: NetPerformanceMonth
  sep: NetPerformanceMonth
  oct: NetPerformanceMonth
  nov: NetPerformanceMonth
  dec: NetPerformanceMonth
  yearToDate: number | null
}

export interface FactsheetData {
  chartData: ChartDataPoint[]
  monthlyChartData?: ChartDataPoint[] // Monthly aggregated data for P&L chart
  performance: PerformanceData
  netPerformance: NetPerformanceYear[]
  inception: number // timestamp
  currentNav: number
}
