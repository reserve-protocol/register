import { Button } from '@/components/ui/button'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import {
  dtfTradeMapAtom,
  isAuctionLauncherAtom,
  selectedTradesAtom,
  TRADE_STATE,
} from '../atoms'

// Updates the trade state!
export const updateTradeStateAtom = atom(null, (get, set, trades: string[]) => {
  const dtf = get(indexDTFAtom)
  const tradeMap = get(dtfTradeMapAtom)

  // Edge case if we are here, these exists
  if (!tradeMap || !dtf) return

  const currentTime = getCurrentTime()

  const newTradeMap = trades.reduce((acc, tradeId) => {
    const trade = tradeMap[tradeId]
    if (!trade) return acc

    return {
      ...acc,
      [tradeId]: {
        ...trade,
        state: TRADE_STATE.RUNNING,
        start: currentTime,
        end: currentTime + dtf.auctionLength,
      },
    }
  }, tradeMap)

  set(dtfTradeMapAtom, newTradeMap)
})

const numberOfTradesAtom = atom((get) => {
  const trades = get(selectedTradesAtom)

  return Object.values(trades).filter(Boolean).length
})

const isAvailableAtom = atom((get) => {
  const wallet = get(walletAtom)
  const numberOfTrades = get(numberOfTradesAtom)
  const trades = get(selectedTradesAtom)
  const tradeMap = get(dtfTradeMapAtom)
  const dtf = get(indexDTFAtom)

  if (!dtf || !tradeMap || !wallet) return false

  const isAuctionLauncher = get(isAuctionLauncherAtom)
  const currentTime = getCurrentTime()

  const areTradesValid = Object.keys(trades).every((tradeId) => {
    const trade = tradeMap[tradeId]

    if (!trade) return false

    // Not available for permissionless trading
    if (!isAuctionLauncher && trade.availableAt < currentTime) return false

    return (
      trade.state === TRADE_STATE.PENDING && trade.launchTimeout < currentTime
    )
  })

  return !!wallet && numberOfTrades > 0 && areTradesValid
})

const SubmitAuctionsButton = () => {
  const numberOfTrades = useAtomValue(numberOfTradesAtom)
  const isAvailable = useAtomValue(isAvailableAtom)

  const handleLaunchAuctions = () => {}

  return (
    <Button disabled={!isAvailable} className="w-full">
      {!numberOfTrades
        ? 'No auctions selected'
        : `Launch ${numberOfTrades} auctions`}
    </Button>
  )
}

export default SubmitAuctionsButton
