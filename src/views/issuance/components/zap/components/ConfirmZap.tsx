import { Modal } from 'components'
import useRToken from 'hooks/useRToken'
import { Divider } from 'theme-ui'
import ZapButton from './ZapButton'
import ZapInput from './ZapInput'

const ConfirmZap = ({ onClose }: { onClose: () => void }) => {
  const rToken = useRToken()

  return (
    <Modal
      title={`Easy mint ${rToken?.symbol || ''}`}
      onClose={onClose}
      style={{ maxWidth: '420px' }}
    >
      <ZapInput />
      <Divider mb={2} mt={3} />
      <ZapButton />
    </Modal>
  )
}

export default ConfirmZap
