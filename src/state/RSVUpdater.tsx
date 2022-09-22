import { atom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import useSWR from 'swr'
import { StringMap } from 'types'
import { rpayTransactionsAtom, RPayTx } from './atoms'

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
  const { data, error } = useSWR(OVERVIEW_URL, fetcher)

  console.log('rpay overview', { data, error })

  return null
}

export default RSVUpdater
