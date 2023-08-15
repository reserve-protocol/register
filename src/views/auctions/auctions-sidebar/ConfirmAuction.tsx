import TransactionButton from 'components/button/TransactionButton'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Box, Select, Text } from 'theme-ui'
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
    label += 'Start next recollaterization auction'
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

  const handleChangeKind = (e: any) => {
    setTradeKind(+e.target.value)
  }

  return (
    <Box p={4} sx={{ borderTop: '1px solid', borderColor: 'darkBorder' }}>
      {!isLegacy && (
        <Box mb={3}>
          <Text as="label" ml={3}>
            Auction type:
          </Text>
          <Select value={tradeKind} onChange={handleChangeKind} mt={2}>
            <option value={TradeKind.BatchTrade}>Batch auction</option>
            <option value={TradeKind.DutchTrade}>Dutch auction</option>
          </Select>
        </Box>
      )}
      <TransactionButton
        fullWidth
        text={btnLabel}
        variant={isLoading ? 'accentAction' : 'primary'}
        disabled={!isReady}
        loading={isLoading || status === 'loading'}
        onClick={write}
        gas={gas}
      />
    </Box>
  )
}

export default ConfirmAuction
