import { Modal } from 'components'
import { ModalProps } from 'components/modal'

interface Props extends Omit<ModalProps, 'children'> {}

const ConfirmDeployModal = (props: Props) => {
  return <Modal {...props}>Deploy</Modal>
}

export default ConfirmDeployModal
