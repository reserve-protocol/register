import TransactionButton from 'components/button/TransactionButton'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Box } from 'theme-ui'
import {
  auctionSidebarAtom,
  auctionsOverviewAtom,
  auctionsToSettleAtom,
  selectedAuctionsAtom,
} from '../atoms'
import useAuctions from './useAuctions'

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

  const btnLabel = useAtomValue(confirmButtonLabelAtom)

  useEffect(() => {
    if (status === 'success') {
      closeSidebar()
    }
  }, [status])

  return (
    <Box p={4} sx={{ borderTop: '1px solid', borderColor: 'darkBorder' }}>
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
