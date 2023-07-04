import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { atom } from 'jotai'
import { useSetAtom } from 'jotai'
import useWebSocket from 'react-use-websocket'
import { dateToUnix } from 'utils'
import { rpayTransactionsAtom, RPayTx } from '../atoms'

const updateTxAtom = atom(null, (get, set, txs: RPayTx[]) => {
  const currentTxs = [...get(rpayTransactionsAtom)]
  currentTxs.unshift(...txs)

  set(rpayTransactionsAtom, currentTxs)
})

const RpayTxListener = () => {
  const updateTx = useSetAtom(updateTxAtom)
  const isWindowOpen = useIsWindowVisible()

  const processMessages = (event: any) => {
    try {
      if (isWindowOpen) {
        updateTx(
          JSON.parse(event.data).map(
            ([id, type, amountUSD, timestamp]: string[]) => ({
              id,
              type,
              amountUSD,
              symbol: 'eUSD',
              timestamp: dateToUnix(timestamp),
            })
          )
        )
      }
    } catch (e) {}
  }

  useWebSocket(`wss:${import.meta.env.VITE_RPAY_FEED}/ws`, {
    share: true,
    shouldReconnect: () => true,
    onMessage: (event: WebSocketEventMap['message']) => processMessages(event),
  })

  return null
}

export default RpayTxListener
