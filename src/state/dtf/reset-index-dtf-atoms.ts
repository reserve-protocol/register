import { atom } from 'jotai'
import {
  indexDTF7dChangeAtom,
  indexDTFAtom,
  indexDTFBasketAmountsAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
  indexDTFBrandAtom,
  indexDTFExposureDataAtom,
  indexDTFFeeAtom,
  indexDTFMarketCapAtom,
  indexDTFPerformanceLoadingAtom,
  indexDTFRebalanceControlAtom,
  indexDTFStatusAtom,
  indexDTFTransactionsAtom,
  indexDTFVersionAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import {
  indexDTFApyAtom,
  indexDTFPoolsDataAtom,
  indexDTFUnderlyingNamesAtom,
} from '@/state/dtf/yield-index-atoms'

// Everything a DTF route writes must reset on DTF→DTF SPA navigation — a
// missing entry leaks the previous DTF's data into the next one's load
// window (Z21). If you add a container/updater atom write, add it here.
export const resetIndexDTFAtomsAtom = atom(null, (_, set) => {
  set(indexDTFBasketAtom, undefined)
  set(indexDTFBasketPricesAtom, {})
  set(indexDTFBasketAmountsAtom, {})
  set(indexDTFBasketSharesAtom, {})
  set(indexDTFAtom, undefined)
  set(indexDTFBrandAtom, undefined)
  set(indexDTFRebalanceControlAtom, undefined)
  set(indexDTFFeeAtom, undefined)
  set(indexDTF7dChangeAtom, undefined)
  set(indexDTFPerformanceLoadingAtom, false)
  set(indexDTFExposureDataAtom, null)
  set(indexDTFApyAtom, undefined)
  set(indexDTFPoolsDataAtom, undefined)
  set(indexDTFUnderlyingNamesAtom, {})
  set(performanceTimeRangeAtom, 'ytd')
  set(indexDTFStatusAtom, 'active')
  set(indexDTFTransactionsAtom, [])
  set(indexDTFMarketCapAtom, undefined)
  set(indexDTFVersionAtom, '4.0.0')
})
