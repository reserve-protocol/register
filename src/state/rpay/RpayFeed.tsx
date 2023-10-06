import { atom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useSWR from 'swr'
import { StringMap } from 'types'
import { dateToUnix } from 'utils'
import {
  chainIdAtom,
  rpayOverviewAtom,
  rpayTransactionsAtom,
  RPayTx,
} from '../atoms'
import { ChainId } from 'utils/chains'

const OVERVIEW_URL = `https:${import.meta.env.VITE_RPAY_FEED}/aggregate`
const TXS_URL = `https:${import.meta.env.VITE_RPAY_FEED}/transactions`

const fetcher = async (url: string): Promise<StringMap> => {
  const data: Response = await fetch(url).then((res) => res.json())

  return data
}

// TODO: Limit to 25 txs
const updateTxAtom = atom(null, (get, set, txs: RPayTx[]) => {
  set(rpayTransactionsAtom, txs)
})

const RpayFeed = () => {
  const updateTx = useSetAtom(updateTxAtom)
  const updateOverview = useSetAtom(rpayOverviewAtom)
  const isMainnet = useAtomValue(chainIdAtom) === ChainId.Mainnet
  const { data: overviewData } = useSWR(
    isMainnet ? OVERVIEW_URL : undefined,
    fetcher
  )
  const { data: txData } = useSWR(isMainnet ? TXS_URL : undefined, fetcher)

  useEffect(() => {
    if (overviewData) {
      updateOverview({
        volume: overviewData['total_tx_volume'] || 0,
        txCount: overviewData['total_tx_count'] || 0,
        holders: overviewData['user_count'] || 0,
        dayVolume: overviewData['24_hour_tx_volume'] || 0,
        dayTxCount: overviewData['24_hour_tx_count'] || 0,
      })
    }
  }, [overviewData])

  useEffect(() => {
    if (txData) {
      updateTx(
        txData.map(([id, type, amountUSD, timestamp]: string[]) => ({
          id,
          type,
          amountUSD,
          symbol: 'eUSD',
          timestamp: dateToUnix(timestamp),
        }))
      )
    }
  }, [txData])

  useEffect(() => {
    if (!isMainnet) {
      updateOverview({
        volume: 0,
        txCount: 0,
        holders: 0,
        dayVolume: 0,
        dayTxCount: 0,
      })
    }
  }, [isMainnet])

  return null
}

export default RpayFeed
