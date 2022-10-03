import dayjs from 'dayjs'
import { atom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import useSWR from 'swr'
import { StringMap } from 'types'
import { dateToUnix } from 'utils'
import { rpayOverviewAtom, rpayTransactionsAtom, RPayTx } from './atoms'

const OVERVIEW_URL = `https:${process.env.REACT_APP_RPAY_FEED}/aggregate`
const TXS_URL = `https:${process.env.REACT_APP_RPAY_FEED}/transactions`

const fetcher = async (url: string): Promise<StringMap> => {
  const data: Response = await fetch(url, {
    headers: {
      Authorization:
        'Basic ' + btoa(`:${process.env.REACT_APP_RPAY_FEED_SECRET}`),
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())

  return data
}

dayjs.extend

// TODO: Limit to 25 txs
const updateTxAtom = atom(null, (get, set, txs: RPayTx[]) => {
  set(rpayTransactionsAtom, txs)
})

const RSVUpdater = () => {
  const updateTx = useUpdateAtom(updateTxAtom)
  const updateOverview = useUpdateAtom(rpayOverviewAtom)
  const { data: overviewData } = useSWR(OVERVIEW_URL, fetcher)
  const { data: txData } = useSWR(TXS_URL, fetcher)

  useEffect(() => {
    if (overviewData) {
      updateOverview({
        volume: overviewData['tx_volume'],
        txCount: overviewData['tx_count'],
        holders: overviewData['user_count'],
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
          timestamp: dateToUnix(timestamp),
        }))
      )
    }
  }, [txData])

  return null
}

export default RSVUpdater
