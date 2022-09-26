import dayjs from 'dayjs'
import { atom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import useWebSocket from 'react-use-websocket'
import { rpayTransactionsAtom, RPayTx } from './atoms'

// TODO: Limit to 25 txs
const updateTxAtom = atom(null, (get, set, txs: RPayTx[]) => {
  const currentTxs = [...get(rpayTransactionsAtom)]
  currentTxs.unshift(...txs)

  set(rpayTransactionsAtom, currentTxs)
})

const RSVTxListener = () => {
  const updateTx = useUpdateAtom(updateTxAtom)

  const processMessages = (event: any) => {
    try {
      updateTx(
        JSON.parse(event.data).map(
          ([id, type, amountUSD, timestamp]: string[]) => ({
            id,
            type,
            amountUSD,
            timestamp: dayjs(timestamp).unix() - 10880,
          })
        )
      )
    } catch (e) {}
  }

  useWebSocket(
    `wss:${process.env.REACT_APP_RPAY_FEED}/ws?pw=${process.env.REACT_APP_RPAY_FEED_SECRET}`,
    {
      share: true,
      shouldReconnect: () => true,
      onMessage: (event: WebSocketEventMap['message']) =>
        processMessages(event),
    }
  )

  return null
}

export default RSVTxListener
