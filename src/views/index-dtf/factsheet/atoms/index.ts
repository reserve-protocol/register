import { atom } from 'jotai'
import { type ChartType } from '../types/factsheet-data'

export const factsheetChartTypeAtom = atom<ChartType>('navGrowth')
