import TransactionButton from '@/components/ui/transaction-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  TradeKind,
  auctionPlatformAtom,
  auctionSidebarAtom,
  auctionsOverviewAtom,
  auctionsToSettleAtom,
  selectedAuctionsAtom,
} from '../atoms'
import useAuctions from './useAuctions'
import { isModuleLegacyAtom } from 'state/atoms'

const confirmButtonLabelAtom = atom((get) => {
  const settleable = get(auctionsToSettleAtom) || []
  const selectedAuctions = get(selectedAuctionsAtom)
  const { recollaterization } = get(auctionsOverviewAtom) || {}

  let label = ''

  if (settleable?.length) {
    label += `Settle ${settleable.length} previous & `
  }

  if (recollaterization) {
    if (label) {
      label = `Settle ${settleable.length} previous to start recollaterization`
    } else {
      label += 'Start next recollaterization auction'
    }
  } else {
    label += `Start ${selectedAuctions.length} new auctions`
  }

  return label
})

const ConfirmAuction = () => {
  const { isReady, write, hash, gas, isLoading } = useAuctions()
  const { status } = useWatchTransaction({ hash, label: 'Run auctions' })
  const closeSidebar = useSetAtom(auctionSidebarAtom)
  const { auctions: isLegacy } = useAtomValue(isModuleLegacyAtom)
  const [tradeKind, setTradeKind] = useAtom(auctionPlatformAtom)

  const btnLabel = useAtomValue(confirmButtonLabelAtom)

  useEffect(() => {
    if (status === 'success') {
      closeSidebar()
    }
  }, [status])

  const handleChangeKind = (value: string) => {
    setTradeKind(+value)
  }

  return (
    <div>
      {!isLegacy && (
        <div className="mb-4 flex items-center">
          <label className="ml-4 mr-6">Run auctions as:</label>
          <div className="flex-grow">
            <Select
              value={String(tradeKind)}
              onValueChange={handleChangeKind}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(TradeKind.BatchTrade)}>
                  Batch auction
                </SelectItem>
                <SelectItem value={String(TradeKind.DutchTrade)}>
                  Dutch auction
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <TransactionButton
        className="w-full"
        text={btnLabel}
        variant={isLoading ? 'accent' : 'default'}
        disabled={!isReady}
        gas={gas}
        loading={isLoading}
        onClick={write}
      />
    </div>
  )
}

export default ConfirmAuction
