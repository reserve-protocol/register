import { Button } from '@/components/ui/button'
import { Modal } from 'components'
import Help from 'components/help'
import { X } from 'lucide-react'
import { useZap } from '../context/ZapContext'
import ZapSettingsCollectDust from './ZapSettingsCollectDust'
import ZapSettingsSlippage from './ZapSettingsSlippage'
import ZapSettingsOnlyMint from './ZapSettingsOnlyMint'

const ZapSettingsModal = () => {
  const { setOpenSettings } = useZap()

  return (
    <Modal
      p={0}
      width={360}
      className="border-[3px] border-secondary"
      onClose={() => setOpenSettings(false)}
      closeOnClickAway
      hideCloseButton
    >
      <div className="flex flex-col overflow-hidden h-full bg-card">
        <div className="flex items-center p-6 mb-4 sm:mb-0 pt-4 pb-0">
          <span className="text-lg font-bold">Zap Settings</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto rounded-full"
            onClick={() => setOpenSettings(false)}
          >
            <X />
          </Button>
        </div>
        <div className="flex flex-col gap-2 p-3 pt-0">
          <div>
            <div className="flex items-center justify-between pl-3 pr-6 py-2">
              <span className="text-legend">Collect dust?</span>
              <Help
                content={`Dust is the leftover amount of tokens that cannot be exchanged. If you choose to collect dust, it will be sent back to your wallet. Sending dust back to the wallet will increase transaction fee.`}
              />
            </div>
            <ZapSettingsCollectDust />
          </div>
          <div>
            <div className="flex items-center justify-between pl-3 pr-6 py-2">
              <span className="text-legend">Mint RTokens?</span>
              <Help
                content={`By enabling this option, the zapper will only attempt to mint RTokens instead of trading for them. This can help you avoid trading fees and slippage.`}
              />
            </div>
            <ZapSettingsOnlyMint />
          </div>
          <div>
            <div className="flex items-center justify-between pl-3 pr-6 py-2">
              <span className="text-legend">Max. mint slippage</span>
              <Help
                content={`The maximum amount of slippage you are willing to accept when minting. Higher slippage settings will make the transaction more likely to succeed, but may result in fewer tokens minted.`}
              />
            </div>
            <ZapSettingsSlippage />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ZapSettingsModal
