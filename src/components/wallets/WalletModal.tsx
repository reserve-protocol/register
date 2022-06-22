import { t } from '@lingui/macro'
import Modal from 'components/modal'
import WalletConnection from './WalletConnection'

interface Props {
  onClose(): void
}

const WalletModal = ({ onClose }: Props) => {
  return (
    <Modal
      title={t`Connect your wallet`}
      style={{ width: 356 }}
      onClose={onClose}
    >
      <WalletConnection />
    </Modal>
  )
}

export default WalletModal
