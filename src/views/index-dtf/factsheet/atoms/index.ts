import { atom } from 'jotai'
import { type ChartType } from '../mocks/factsheet-data'

export const factsheetChartTypeAtom = atom<ChartType>('navGrowth')
