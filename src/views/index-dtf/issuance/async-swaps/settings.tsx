import { Checkbox } from '@/components/ui/checkbox'
import Help from '@/components/ui/help'
import { SlippageSelector } from '@/components/ui/swap'
import { useAtom } from 'jotai'
import { Wallet } from 'lucide-react'
import { slippageAtom, applyWalletBalanceAtom } from './atom'

const SettingsRowTitle = ({ title, help }: { title: string; help: string }) => (
  <div className="flex items-center gap-2 justify-between px-3">
    <div className="text-sm text-muted-foreground">{title}</div>
    <Help content={help} />
  </div>
)

const Settings = () => {
  const [slippage, setSlippage] = useAtom(slippageAtom)
  const [applyWalletBalance, setApplyWalletBalance] = useAtom(
    applyWalletBalanceAtom
  )

  return (
    <div className="bg-background min-h-[306px] border-t border-border px-2 py-4 flex flex-col gap-4 rounded-b-2xl">
      <div className="flex flex-col gap-2">
        <SettingsRowTitle
          title="Use wallet balance?"
          help="If enabled, the available token balance in your wallet will be used for minting."
        />
        <div className="rounded-xl border border-border px-3 py-3 flex items-center gap-1 justify-between">
          <div className="flex items-center gap-1">
            <Wallet size={16} className="text-muted-foreground" />
            <div>Use wallet balance</div>
          </div>
          <Checkbox
            checked={applyWalletBalance}
            onCheckedChange={(checked) =>
              setApplyWalletBalance(
                checked === 'indeterminate' ? true : checked
              )
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <SettingsRowTitle
          title="Max. mint slippage"
          help="The maximum amount of slippage you are willing to accept when minting. Higher slippage settings will make the transaction more likely to succeed, but may result in fewer tokens minted."
        />
        <SlippageSelector
          value={slippage}
          onChange={setSlippage}
          options={['20', '50', '100', '200']}
          hideTitle
        />
      </div>
    </div>
  )
}

export default Settings
