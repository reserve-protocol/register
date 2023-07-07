import { LoadingButton } from 'components/button'
import EstimatedGasInfo from 'components/transaction-modal/EstimatedGasInfo'
import { useEffect } from 'react'
import { Box } from 'theme-ui'
import { TRANSACTION_STATUS } from 'utils/constants'
import useAuctions from './useAuctions'
import {
  auctionsOverviewAtom,
  auctionsToSettleAtom,
  selectedAuctionsAtom,
} from '../atoms'
import { atom, useAtomValue } from 'jotai'

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

const ConfirmAuction = ({ onClose }: { onClose(): void }) => {
  const { tx, onExecute, fee, status } = useAuctions()
  const btnLabel = useAtomValue(confirmButtonLabelAtom)
  const isLoading =
    status === TRANSACTION_STATUS.PENDING ||
    status === TRANSACTION_STATUS.SIGNING

  useEffect(() => {
    if (
      status === TRANSACTION_STATUS.MINING ||
      status === TRANSACTION_STATUS.CONFIRMED
    ) {
      onClose()
    }
  }, [status])

  return (
    <Box p={4} sx={{ borderTop: '1px solid', borderColor: 'darkBorder' }}>
      <LoadingButton
        sx={{ width: '100%' }}
        text={btnLabel}
        variant={isLoading ? 'accentAction' : 'primary'}
        disabled={!fee}
        loading={isLoading}
        onClick={onExecute}
      />
      {!!tx && <EstimatedGasInfo mt={3} fee={fee} />}
    </Box>
  )
}

export default ConfirmAuction
