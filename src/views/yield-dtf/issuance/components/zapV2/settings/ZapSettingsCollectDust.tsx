import { Checkbox } from '@/components/ui/checkbox'
import { useZap } from '../context/ZapContext'

const ZapSettingsCollectDust = () => {
  const { collectDust, setCollectDust } = useZap()

  return (
    <div className="rounded-lg border border-secondary bg-card">
      <label className="flex justify-between p-3 cursor-pointer">
        <div className="flex items-center gap-1.5">
          <span>Send dust back to wallet</span>
        </div>
        <Checkbox
          title="Collect dust"
          onCheckedChange={() => setCollectDust(!collectDust)}
          checked={collectDust}
          disabled // We will always send dust back to wallet
        />
      </label>
    </div>
  )
}

export default ZapSettingsCollectDust
