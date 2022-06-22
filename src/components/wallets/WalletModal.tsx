import Modal from 'components/modal'

interface Props {
  onClose(): void
}

const WalletModal = ({ onClose }: Props) => {
  return <Modal onClose={onClose}>test</Modal>
}

export default WalletModal
