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
  performance: PerformanceData
  netPerformance: NetPerformanceYear[]
  inception: number // timestamp
  currentNav: number
}

// Helper to generate mock chart data
const generateChartData = (days: number, baseValue: number = 100): ChartDataPoint[] => {
  const now = Date.now()
  const data: ChartDataPoint[] = []

  for (let i = days; i >= 0; i--) {
    const timestamp = Math.floor((now - i * 24 * 60 * 60 * 1000) / 1000)
    const randomWalk = (Math.random() - 0.5) * 5
    const trend = (days - i) * 0.05
    const navGrowth = baseValue + trend + randomWalk
    const monthlyPL = (Math.random() - 0.45) * 10 // Slightly positive bias

    data.push({
      timestamp,
      value: navGrowth,
      navGrowth,
      monthlyPL
    })
  }

  return data
}

// Mock data for different time ranges
export const mockFactsheetData: Record<TimeRange, FactsheetData> = {
  '24h': {
    chartData: generateChartData(1, 100),
    performance: {
      '3m': 5.23,
      '6m': 12.45,
      ytd: 18.92,
      '1y': 24.56,
      all: 45.78
    },
    netPerformance: generateNetPerformanceData(),
    inception: 1526515200, // May 17, 2018
    currentNav: 145.78
  },
  '7d': {
    chartData: generateChartData(7, 100),
    performance: {
      '3m': 5.23,
      '6m': 12.45,
      ytd: 18.92,
      '1y': 24.56,
      all: 45.78
    },
    netPerformance: generateNetPerformanceData(),
    inception: 1526515200,
    currentNav: 145.78
  },
  '1m': {
    chartData: generateChartData(30, 100),
    performance: {
      '3m': 5.23,
      '6m': 12.45,
      ytd: 18.92,
      '1y': 24.56,
      all: 45.78
    },
    netPerformance: generateNetPerformanceData(),
    inception: 1526515200,
    currentNav: 145.78
  },
  '3m': {
    chartData: generateChartData(90, 100),
    performance: {
      '3m': 5.23,
      '6m': 12.45,
      ytd: 18.92,
      '1y': 24.56,
      all: 45.78
    },
    netPerformance: generateNetPerformanceData(),
    inception: 1526515200,
    currentNav: 145.78
  },
  '1y': {
    chartData: generateChartData(365, 100),
    performance: {
      '3m': 5.23,
      '6m': 12.45,
      ytd: 18.92,
      '1y': 24.56,
      all: 45.78
    },
    netPerformance: generateNetPerformanceData(),
    inception: 1526515200,
    currentNav: 145.78
  },
  'all': {
    chartData: generateChartData(730, 100), // 2 years of data
    performance: {
      '3m': 5.23,
      '6m': 12.45,
      ytd: 18.92,
      '1y': 24.56,
      all: 45.78
    },
    netPerformance: generateNetPerformanceData(),
    inception: 1526515200,
    currentNav: 145.78
  }
}

function generateNetPerformanceData(): NetPerformanceYear[] {
  const currentYear = new Date().getFullYear()
  const years: NetPerformanceYear[] = []

  // Generate data for past 3 years
  for (let year = currentYear - 2; year <= currentYear; year++) {
    const months = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ] as const

    const yearData: any = { year }
    let yearTotal = 0
    let bestMonth = { name: '', value: -Infinity }
    let worstMonth = { name: '', value: Infinity }

    months.forEach(month => {
      // For current year, only show data up to current month
      const currentMonth = new Date().getMonth()
      const monthIndex = months.indexOf(month)
      const isCurrentYear = year === currentYear
      const isFutureMonth = isCurrentYear && monthIndex > currentMonth

      if (isFutureMonth) {
        yearData[month] = { value: null }
      } else {
        const value = (Math.random() - 0.45) * 8 // Slightly positive bias
        yearData[month] = { value }
        yearTotal += value

        if (value > bestMonth.value) {
          bestMonth = { name: month, value }
        }
        if (value < worstMonth.value) {
          worstMonth = { name: month, value }
        }
      }
    })

    // Mark best and worst months
    if (bestMonth.name) {
      yearData[bestMonth.name].isBest = true
    }
    if (worstMonth.name && worstMonth.name !== bestMonth.name) {
      yearData[worstMonth.name].isWorst = true
    }

    yearData.yearToDate = yearTotal
    years.push(yearData)
  }

  return years
}