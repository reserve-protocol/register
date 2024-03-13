import { t } from '@lingui/macro'
import { Button, Modal } from 'components'
import AmountPreview from '../AmountPreview'

const StakeModal = ({ onClose }: { onClose(): void }) => {
  return (
    <Modal title={t`Review stake`} onClose={onClose}>
      <AmountPreview
        title={t`You use:`}
        amount={123}
        usdAmount={123}
        symbol="RSR"
      />
      <AmountPreview
        title={t`You use:`}
        amount={123}
        usdAmount={123}
        symbol="RSR"
        mt="4"
      />
      <Button mt="4" fullWidth>
        Stake
      </Button>
    </Modal>
  )
}

export default StakeModal
