import { atom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import useSWR from 'swr'
import { StringMap } from 'types'
import { rpayOverviewAtom, rpayTransactionsAtom, RPayTx } from './atoms'
import useWebSocket from 'react-use-websocket'

const OVERVIEW_URL = `${process.env.REACT_APP_RPAY_FEED}/aggregate`
const TXS_URL = `${process.env.REACT_APP_RPAY_FEED}/transactions`

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

const updateTxAtom = atom(null, (get, set, txs: RPayTx[]) => {
  const currentTxs = { ...get(rpayTransactionsAtom) }

  for (const tx of txs) {
    currentTxs[tx.id] = tx
  }

  set(rpayTransactionsAtom, currentTxs)
})

const RSVUpdater = () => {
  const updateTx = useUpdateAtom(updateTxAtom)
  const updateOverview = useUpdateAtom(rpayOverviewAtom)
  const { data: overviewData } = useSWR(OVERVIEW_URL, fetcher)
  const { data: txData } = useSWR(TXS_URL, fetcher)

  const processMessages = (event: { data: string }) => {
    // const response = JSON.parse(event.data)

    console.log('response', event.data)
  }

  useWebSocket('wss://rpay-explorer-feed.herokuapp.com/ws', {
    shouldReconnect: () => true,
    onMessage: (event: WebSocketEventMap['message']) => processMessages(event),
  })

  useEffect(() => {
    if (overviewData) {
      updateOverview(overviewData as any)
    }
  }, [overviewData])

  useEffect(() => {
    if (txData) {
      updateTx(txData as RPayTx[])
    }
  }, [txData])

  return null
}

export default RSVUpdater
