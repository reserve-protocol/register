import { Settings } from 'lucide-react'
import { useZap } from '../context/ZapContext'
import ZapSettingsModal from './ZapSettingsModal'

const ZapSettings = () => {
  const { openSettings, setOpenSettings } = useZap()

  return (
    <>
      {openSettings && <ZapSettingsModal />}
      <button
        className="flex items-center justify-center w-[34px] h-[34px] border border-muted-foreground/20 rounded-md cursor-pointer hover:bg-muted transition-colors"
        onClick={() => setOpenSettings(true)}
      >
        <Settings size={16} strokeWidth={2.2} />
      </button>
    </>
  )
}

export default ZapSettings
