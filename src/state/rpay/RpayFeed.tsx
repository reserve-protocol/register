import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useSWR from 'swr'
import { StringMap } from 'types'
import { dateToUnix } from 'utils'
import { RPayTx, rpayOverviewAtom, rpayTransactionsAtom } from '../atoms'

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
  const { data: overviewData } = useSWR(OVERVIEW_URL, fetcher)
  const { data: txData } = useSWR(TXS_URL, fetcher)

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

  return null
}

export default RpayFeed
