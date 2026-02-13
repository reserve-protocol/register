import ZapSubmitButton from './ZapSubmitButton'
import ZapSubmitModal from './ZapSubmitModal'
import { useZap } from '../context/ZapContext'
import ZapError from '../ZapError'

const ZapSubmit = () => {
  const { openSubmitModal, error } = useZap()

  return (
    <div className="flex flex-col items-center gap-4">
      {openSubmitModal && <ZapSubmitModal />}
      <ZapError error={error} />
      <ZapSubmitButton />
    </div>
  )
}

export default ZapSubmit
