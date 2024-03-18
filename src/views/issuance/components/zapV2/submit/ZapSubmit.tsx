import { Box } from 'theme-ui'
import ZapSubmitButton from './ZapSubmitButton'
import ZapSubmitModal from './ZapSubmitModal'
import { useZap } from '../context/ZapContext'

const ZapSubmit = () => {
  const { openSubmitModal } = useZap()

  return (
    <Box variant="layout.centered">
      {openSubmitModal && <ZapSubmitModal />}
      <ZapSubmitButton />
    </Box>
  )
}

export default ZapSubmit
