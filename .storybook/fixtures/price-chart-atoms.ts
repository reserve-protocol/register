import { atom } from 'jotai'

import type { DataType } from '@/views/index-dtf/overview/components/charts/price-chart-constants'

export const dataTypeAtom = atom<DataType>('price')
export const avgApyAtom = atom(0)
