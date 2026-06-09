import TransactionButton from '@/components/ui/transaction-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trans, useLingui } from '@lingui/react/macro'
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

const confirmButtonStateAtom = atom((get) => {
  const settleable = get(auctionsToSettleAtom) || []
  const selectedAuctions = get(selectedAuctionsAtom)
  const { recollaterization } = get(auctionsOverviewAtom) || {}

  return {
    settleableCount: settleable?.length ?? 0,
    selectedCount: selectedAuctions.length,
    recollaterization: !!recollaterization,
  }
})

const ConfirmAuction = () => {
  const { t } = useLingui()
  const { isReady, write, hash, gas, isLoading } = useAuctions()
  const { status } = useWatchTransaction({ hash, label: 'Run auctions' })
  const closeSidebar = useSetAtom(auctionSidebarAtom)
  const { auctions: isLegacy } = useAtomValue(isModuleLegacyAtom)
  const [tradeKind, setTradeKind] = useAtom(auctionPlatformAtom)

  const { settleableCount, selectedCount, recollaterization } =
    useAtomValue(confirmButtonStateAtom)

  let btnLabel = ''

  if (settleableCount) {
    btnLabel += t`Settle ${settleableCount} previous & `
  }

  if (recollaterization) {
    if (btnLabel) {
      btnLabel = t`Settle ${settleableCount} previous to start recollaterization`
    } else {
      btnLabel += t`Start next recollaterization auction`
    }
  } else {
    btnLabel += t`Start ${selectedCount} new auctions`
  }

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
          <label className="ml-4 mr-6">
            <Trans>Run auctions as:</Trans>
          </label>
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
                  <Trans>Batch auction</Trans>
                </SelectItem>
                <SelectItem value={String(TradeKind.DutchTrade)}>
                  <Trans>Dutch auction</Trans>
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
