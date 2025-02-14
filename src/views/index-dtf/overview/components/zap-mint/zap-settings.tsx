import { SlippageSelector } from '@/components/ui/swap'
import { useAtom } from 'jotai'
import { slippageAtom } from './atom'
import Help from '@/components/ui/help'
import { Checkbox } from '@/components/ui/checkbox'
import { broom } from '@lucide/lab'
import { Icon } from 'lucide-react'

const ZapSettingsRowTitle = ({
  title,
  help,
}: {
  title: string
  help: string
}) => (
  <div className="flex items-center gap-2 justify-between px-3">
    <div className="text-sm text-muted-foreground">{title}</div>
    <Help content={help} />
  </div>
)

const ZapSettings = () => {
  const [slippage, setSlippage] = useAtom(slippageAtom)
  return (
    <div className="min-h-[306px] border-t border-border -mx-2 px-2 py-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <ZapSettingsRowTitle
          title="Collect dust?"
          help="Dust is the leftover amount of tokens that cannot be exchanged. If you choose to collect dust, it will be sent back to your wallet. Sending dust back to the wallet will increase transaction fee."
        />
        <div className="rounded-xl border border-border pl-2 pr-3 py-3 flex items-center gap-1 justify-between">
          <div className="flex items-center gap-1">
            <Icon
              iconNode={broom}
              size={16}
              className="text-muted-foreground"
            />
            <div>Send dust back to wallet</div>
          </div>
          <Checkbox checked disabled />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <ZapSettingsRowTitle
          title="Max. mint slippage"
          help="The maximum amount of slippage you are willing to accept when minting. Higher slippage settings will make the transaction more likely to succeed, but may result in fewer tokens minted."
        />
        <SlippageSelector
          value={slippage}
          onChange={setSlippage}
          options={['200', '500', '1000', '10000']}
          hideTitle
        />
      </div>
    </div>
  )
}

export default ZapSettings
