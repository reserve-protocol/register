import { Checkbox } from '@/components/ui/checkbox'
import { Trans, useLingui } from '@lingui/react/macro'
import { useZap } from '../context/ZapContext'

const ZapSettingsCollectDust = () => {
  const { t } = useLingui()
  const { collectDust, setCollectDust } = useZap()

  return (
    <div className="rounded-lg border border-secondary bg-card">
      <label className="flex justify-between p-3 cursor-pointer">
        <div className="flex items-center gap-1.5">
          <span>
            <Trans>Send dust back to wallet</Trans>
          </span>
        </div>
        <Checkbox
          title={t`Collect dust`}
          onCheckedChange={() => setCollectDust(!collectDust)}
          checked={collectDust}
          disabled // We will always send dust back to wallet
        />
      </label>
    </div>
  )
}

export default ZapSettingsCollectDust
