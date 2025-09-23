import { atom } from 'jotai'
import { type TimeRange, type ChartType } from '../mocks/factsheet-data'

export const factsheetTimeRangeAtom = atom<TimeRange>('7d')
export const factsheetChartTypeAtom = atom<ChartType>('navGrowth')