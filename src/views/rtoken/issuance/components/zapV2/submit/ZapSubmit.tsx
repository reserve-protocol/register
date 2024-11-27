import { Box } from 'theme-ui'
import ZapSubmitButton from './ZapSubmitButton'
import ZapSubmitModal from './ZapSubmitModal'
import { useZap } from '../context/ZapContext'
import ZapError from '../ZapError'

const ZapSubmit = () => {
  const { openSubmitModal, error } = useZap()

  return (
    <Box variant="layout.centered" sx={{ gap: 3 }}>
      {openSubmitModal && <ZapSubmitModal />}
      <ZapError error={error} />
      <ZapSubmitButton />
    </Box>
  )
}

export default ZapSubmit
