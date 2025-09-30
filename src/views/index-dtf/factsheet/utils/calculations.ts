import type { NetPerformanceYear, ChartDataPoint } from '../types/factsheet-data'
import { MONTH_NAMES } from './constants'

// Helper function to calculate performance percentage
export const calculatePerformance = (
  currentPrice: number,
  pastPrice: number | undefined
): number | null => {
  if (!pastPrice || pastPrice === 0) return null
  return ((currentPrice - pastPrice) / pastPrice) * 100
}

// Helper to calculate monthly P&L for each data point
export const calculateMonthlyReturns = (
  timeseries: Array<{ timestamp: number; price: number }>
): Map<number, number> => {
  const monthlyReturns = new Map<number, number>()

  if (timeseries.length < 2) return monthlyReturns

  // Group data points by month and calculate returns
  const monthlyPrices = new Map<
    string,
    { first: number; last: number; firstTimestamp: number }
  >()

  timeseries.forEach((point) => {
    const date = new Date(point.timestamp * 1000)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`

    if (!monthlyPrices.has(monthKey)) {
      monthlyPrices.set(monthKey, {
        first: point.price,
        last: point.price,
        firstTimestamp: point.timestamp,
      })
    } else {
      const month = monthlyPrices.get(monthKey)!
      month.last = point.price
    }
  })

  // Calculate month-over-month returns
  const months = Array.from(monthlyPrices.entries()).sort((a, b) => {
    const [yearA, monthA] = a[0].split('-').map(Number)
    const [yearB, monthB] = b[0].split('-').map(Number)
    return yearA !== yearB ? yearA - yearB : monthA - monthB
  })

  for (let i = 1; i < months.length; i++) {
    const [, prevMonthData] = months[i - 1]
    const [currentMonthKey, currentMonthData] = months[i]

    const monthlyReturn =
      ((currentMonthData.last - prevMonthData.last) / prevMonthData.last) * 100

    // Apply this return to all timestamps in this month
    timeseries.forEach((point) => {
      const date = new Date(point.timestamp * 1000)
      const pointMonthKey = `${date.getFullYear()}-${date.getMonth()}`
      if (pointMonthKey === currentMonthKey) {
        monthlyReturns.set(point.timestamp, monthlyReturn)
      }
    })
  }

  // For the first month, set return to 0
  const firstMonth = months[0]
  if (firstMonth) {
    timeseries.forEach((point) => {
      const date = new Date(point.timestamp * 1000)
      const pointMonthKey = `${date.getFullYear()}-${date.getMonth()}`
      if (
        pointMonthKey === firstMonth[0] &&
        !monthlyReturns.has(point.timestamp)
      ) {
        monthlyReturns.set(point.timestamp, 0)
      }
    })
  }

  return monthlyReturns
}

// Generate net performance data from price history
export const generateNetPerformanceData = (
  timeseries: Array<{ timestamp: number; price: number }>
): NetPerformanceYear[] => {
  const years: NetPerformanceYear[] = []

  // Group data by year and month
  const yearMonthData = new Map<
    number,
    Map<number, { first: number; last: number }>
  >()

  // Get the range of years from the data
  let minYear = Infinity
  let maxYear = -Infinity

  timeseries.forEach((point) => {
    const date = new Date(point.timestamp * 1000)
    const year = date.getFullYear()
    const month = date.getMonth()

    minYear = Math.min(minYear, year)
    maxYear = Math.max(maxYear, year)

    if (!yearMonthData.has(year)) {
      yearMonthData.set(year, new Map())
    }

    const yearData = yearMonthData.get(year)!
    if (!yearData.has(month)) {
      yearData.set(month, { first: point.price, last: point.price })
    } else {
      const monthData = yearData.get(month)!
      monthData.last = point.price
    }
  })

  // Get previous month's last price for accurate month-over-month calculation
  const getLastPriceOfPreviousMonth = (
    year: number,
    month: number
  ): number | null => {
    // If it's January, look at December of previous year
    if (month === 0) {
      const prevYearData = yearMonthData.get(year - 1)
      if (prevYearData?.has(11)) {
        return prevYearData.get(11)!.last
      }
    } else {
      const yearData = yearMonthData.get(year)
      if (yearData?.has(month - 1)) {
        return yearData.get(month - 1)!.last
      }
    }
    return null
  }

  // Calculate monthly returns for each year from minYear to maxYear
  for (let year = minYear; year <= maxYear; year++) {
    const yearData: any = { year }
    let yearTotal = 0
    let monthCount = 0
    let bestMonth = { name: '', value: -Infinity }
    let worstMonth = { name: '', value: Infinity }

    const yearPrices = yearMonthData.get(year)

    MONTH_NAMES.forEach((monthName, monthIndex) => {
      const monthData = yearPrices?.get(monthIndex)

      if (!monthData) {
        yearData[monthName] = { value: null }
      } else {
        // Calculate monthly return using previous month's last price
        const prevMonthLastPrice = getLastPriceOfPreviousMonth(year, monthIndex)

        let monthlyReturn = 0
        if (prevMonthLastPrice !== null) {
          monthlyReturn =
            ((monthData.first - prevMonthLastPrice) / prevMonthLastPrice) * 100
        }

        yearData[monthName] = { value: monthlyReturn }
        yearTotal += monthlyReturn
        monthCount++

        if (monthlyReturn > bestMonth.value) {
          bestMonth = { name: monthName, value: monthlyReturn }
        }
        if (monthlyReturn < worstMonth.value) {
          worstMonth = { name: monthName, value: monthlyReturn }
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

    yearData.yearToDate = monthCount > 0 ? yearTotal : null
    years.push(yearData)
  }

  return years
}

// Calculate monthly chart data for P&L
export const calculateMonthlyChartData = (
  timeseries: Array<{ timestamp: number; price: number }>
): ChartDataPoint[] => {
  // Group data by month
  const monthlyData = new Map<
    string,
    { timestamp: number; prices: number[] }
  >()

  timeseries.forEach((point) => {
    const date = new Date(point.timestamp * 1000)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        timestamp: point.timestamp,
        prices: [point.price],
      })
    } else {
      const month = monthlyData.get(monthKey)!
      month.prices.push(point.price)
      // Update timestamp to last day of month in data
      month.timestamp = point.timestamp
    }
  })

  // Calculate monthly P&L
  const monthlyEntries = Array.from(monthlyData.entries()).sort((a, b) => {
    const [yearA, monthA] = a[0].split('-').map(Number)
    const [yearB, monthB] = b[0].split('-').map(Number)
    return yearA !== yearB ? yearA - yearB : monthA - monthB
  })

  return monthlyEntries.map((entry, index) => {
    const [, data] = entry
    const firstPrice = data.prices[0]
    const lastPrice = data.prices[data.prices.length - 1]

    let monthlyPL = 0
    if (index > 0) {
      const prevMonthLastPrice =
        monthlyEntries[index - 1][1].prices[
          monthlyEntries[index - 1][1].prices.length - 1
        ]
      monthlyPL =
        ((firstPrice - prevMonthLastPrice) / prevMonthLastPrice) * 100
    }

    return {
      timestamp: data.timestamp,
      value: lastPrice,
      navGrowth: lastPrice,
      monthlyPL,
    }
  })
}